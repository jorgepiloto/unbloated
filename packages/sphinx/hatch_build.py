"""Require a complete, unchanged core bundle before building distributions."""

import hashlib
import json
from pathlib import Path

from hatchling.builders.hooks.plugin.interface import BuildHookInterface


def validate_core_bundle(root: Path) -> None:
    """Reject missing generated assets or CSS that differs from its provenance."""
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
    def initialize(self, version: str, build_data: dict[str, object]) -> None:
        """Validate bundled assets for wheels and source distributions."""
        validate_core_bundle(Path(self.root))
