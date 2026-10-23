"""Require a complete, unchanged core bundle before building distributions."""

import hashlib
import json
from pathlib import Path

from hatchling.builders.hooks.plugin.interface import BuildHookInterface


def validate_core_bundle(root: Path) -> None:
    """Validate generated assets within a Sphinx package root without writing.

    Parameters
    ----------
    root : pathlib.Path
        Package directory containing ``pyproject.toml`` and ``src/``.

    Raises
    ------
    RuntimeError
        Required assets are missing or core name, version, or digest is invalid.
    OSError
        A bundle file cannot be read.
    ValueError
        The provenance cannot be decoded as JSON.

    Notes
    -----
    The hook checks the recorded digest, not the monorepo's current core build.
    Run ``npm run check:adapters`` to compare against that build before packaging.
    """
    css_dir = root / "src/sphinx_unbloated_theme/theme/sphinx_unbloated_theme/static/css"
    required = [
        css_dir / "unbloat.css",
        css_dir / "unbloated-core.json",
        *(css_dir / "licenses/unbloated" / name for name in ("LICENSE", "COPYING", "NOTICE")),
    ]
    for path in required:
        if not path.is_file():
            raise RuntimeError(
                f"Missing {path.name}. Run npm run build:adapters at the repository root."
            )
    metadata = json.loads((css_dir / "unbloated-core.json").read_text(encoding="utf-8"))
    digest = hashlib.sha256((css_dir / "unbloat.css").read_bytes()).hexdigest()
    if (
        metadata.get("name") != "unbloated"
        or not isinstance(metadata.get("version"), str)
        or not metadata["version"]
        or metadata.get("sha256") != digest
    ):
        raise RuntimeError("Invalid Unbloated core bundle. Run npm run build:adapters.")


class CustomBuildHook(BuildHookInterface):
    """Require bundled CSS and provenance before either Hatch distribution build."""

    def initialize(self, version: str, build_data: dict[str, object]) -> None:
        """Validate bundles before Hatch builds a wheel or source distribution.

        Parameters
        ----------
        version : str
            Requested package version; required by Hatch's hook signature.
        build_data : dict
            Hatch build state. This validation hook does not modify it.

        Raises
        ------
        RuntimeError
            Required core assets or recorded provenance are invalid.
        """
        validate_core_bundle(Path(self.root))
