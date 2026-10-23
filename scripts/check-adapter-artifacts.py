"""Compare the shipped adapter assets with the current core distribution."""

import hashlib
import json
from pathlib import Path
import tarfile
import zipfile


def check_files(files: dict[str, bytes], core: bytes, metadata: dict[str, str]) -> None:
    """Compare one archive's bundle with the core without extracting files.

    Parameters
    ----------
    files : dict of str to bytes
        Archive member paths and file contents, excluding directories.
    core : bytes
        Current complete core stylesheet.
    metadata : dict of str to str
        Expected core name, version, and SHA-256 digest.

    Raises
    ------
    RuntimeError
        The core bundle count or CSS, provenance, or license bytes differ.
    KeyError
        A required provenance or license member is missing.
    json.JSONDecodeError
        The bundled provenance is not valid JSON.

    Notes
    -----
    License bytes are read from this script's checkout, not from the caller's
    working directory. No files are written.
    """
    css_files = [name for name in files if name.endswith("/unbloat.css")]
    if len(css_files) != 1:
        raise RuntimeError(f"Expected one core stylesheet, found {css_files}")
    prefix = css_files[0].removesuffix("unbloat.css")
    if files[css_files[0]] != core:
        raise RuntimeError("Packaged CSS differs from the core build.")
    if json.loads(files[prefix + "unbloated-core.json"]) != metadata:
        raise RuntimeError("Packaged core provenance differs from the core build.")
    root = Path(__file__).resolve().parent.parent
    for name in ("LICENSE", "COPYING", "NOTICE"):
        if files[prefix + "licenses/unbloated/" + name] != (root / name).read_bytes():
            raise RuntimeError(f"Packaged core {name} differs from the library.")


def main() -> None:
    """Inspect four distributions under this checkout's ``.artifacts/``.

    Require exactly one wheel, source distribution, Quarto archive, and Hugo
    npm tarball. Compare each with ``dist/unbloat.css`` and print one verified
    filename per success. Missing or invalid archives, provenance, or source
    files raise an exception and produce a nonzero CLI exit status.
    """
    root = Path(__file__).resolve().parent.parent
    core = (root / "dist/unbloat.css").read_bytes()
    manifest = json.loads((root / "package.json").read_text(encoding="utf-8"))
    metadata = {
        "name": manifest["name"],
        "version": manifest["version"],
        "sha256": hashlib.sha256(core).hexdigest(),
    }
    patterns = (
        "sphinx_unbloated_theme-*.whl",
        "sphinx_unbloated_theme-*.tar.gz",
        "unbloated-quarto-*.tar.gz",
        "unbloated-hugo-theme-*.tgz",
    )
    for pattern in patterns:
        artifacts = list((root / ".artifacts").glob(pattern))
        if len(artifacts) != 1:
            raise RuntimeError(f"Expected one {pattern}, found {artifacts}")
        artifact = artifacts[0]
        if artifact.suffix == ".whl":
            with zipfile.ZipFile(artifact) as archive:
                files = {name: archive.read(name) for name in archive.namelist() if not name.endswith("/")}
        else:
            with tarfile.open(artifact) as archive:
                files = {}
                for member in archive.getmembers():
                    if member.isfile():
                        stream = archive.extractfile(member)
                        if stream is None:
                            raise RuntimeError(f"Cannot read {member.name}")
                        files[member.name] = stream.read()
        check_files(files, core, metadata)
        print(f"Verified {artifact.name}")


if __name__ == "__main__":
    main()
