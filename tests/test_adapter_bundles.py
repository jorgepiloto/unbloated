"""Regression tests for standalone Sphinx distribution validation."""

import hashlib
import json
from pathlib import Path
import runpy
import tempfile
import unittest
from unittest.mock import Mock

ROOT = Path(__file__).resolve().parent.parent
validate_core_bundle = runpy.run_path(
    str(ROOT / "packages/sphinx/hatch_build.py")
)["validate_core_bundle"]
check_files = runpy.run_path(str(ROOT / "scripts/check-adapter-artifacts.py"))["check_files"]


class CoreBundleTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.css_dir = self.root / "src/sphinx_unbloated_theme/theme/sphinx_unbloated_theme/static/css"
        (self.css_dir / "licenses/unbloated").mkdir(parents=True)
        self.core = b"/* Test fixture, not library CSS. */"
        self.metadata = {
            "name": "unbloated",
            "version": "0.1.0",
            "sha256": hashlib.sha256(self.core).hexdigest(),
        }
        (self.css_dir / "unbloat.css").write_bytes(self.core)
        (self.css_dir / "unbloated-core.json").write_text(json.dumps(self.metadata), encoding="utf-8")
        for name in ("LICENSE", "COPYING", "NOTICE"):
            (self.css_dir / "licenses/unbloated" / name).write_bytes((ROOT / name).read_bytes())

    def test_valid_bundle_builds_without_node_or_the_monorepo(self):
        validate_core_bundle(self.root)

    def test_missing_bundle_fails_with_build_instructions(self):
        (self.css_dir / "unbloat.css").unlink()
        with self.assertRaisesRegex(RuntimeError, "npm run build:adapters"):
            validate_core_bundle(self.root)

    def test_modified_css_fails(self):
        (self.css_dir / "unbloat.css").write_bytes(b"changed")
        with self.assertRaisesRegex(RuntimeError, "Invalid Unbloated"):
            validate_core_bundle(self.root)

    def test_missing_license_fails(self):
        (self.css_dir / "licenses/unbloated/LICENSE").unlink()
        with self.assertRaisesRegex(RuntimeError, "Missing LICENSE"):
            validate_core_bundle(self.root)

    def test_sphinx_loads_core_before_platform_styles(self):
        theme = runpy.run_path(str(
            ROOT / "packages/sphinx/src/sphinx_unbloated_theme/__init__.py"
        ))
        app = Mock()
        theme["setup"](app)
        app.add_css_file.assert_called_once_with("css/unbloat.css", priority=100)

    def test_artifact_inspector_checks_bytes_provenance_and_licenses(self):
        files = {
            f"package/css/{path.relative_to(self.css_dir).as_posix()}": path.read_bytes()
            for path in self.css_dir.rglob("*") if path.is_file()
        }
        check_files(files, self.core, self.metadata)
        files["package/css/unbloat.css"] = b"changed"
        with self.assertRaisesRegex(RuntimeError, "differs from the core build"):
            check_files(files, self.core, self.metadata)

    def test_latex_artifact_retains_derived_tokens_and_both_digests(self):
        files = {
            f"latex/{path.relative_to(self.css_dir).as_posix()}": path.read_bytes()
            for path in self.css_dir.rglob("*") if path.is_file()
        }
        tex = b"\\newcommand{\\UnbloatedCoreHash}{" + self.metadata["sha256"].encode() + b"}\n"
        files["latex/unbloated-tokens.sty"] = tex
        metadata = {**self.metadata, "texSha256": hashlib.sha256(tex).hexdigest()}
        files["latex/unbloated-core.json"] = json.dumps(metadata).encode()
        check_files(files, self.core, self.metadata, tex)
        files["latex/unbloated-tokens.sty"] = b"modified"
        with self.assertRaisesRegex(RuntimeError, "TeX tokens differ"):
            check_files(files, self.core, self.metadata, tex)
        files["latex/unbloated-tokens.sty"] = tex
        files["latex/unbloated-core.json"] = json.dumps(self.metadata).encode()
        with self.assertRaisesRegex(RuntimeError, "provenance differs"):
            check_files(files, self.core, self.metadata, tex)
        updated = self.core + b"changed"
        files["latex/unbloat.css"] = updated
        metadata = {**self.metadata, "sha256": hashlib.sha256(updated).hexdigest()}
        with self.assertRaisesRegex(RuntimeError, "different core CSS"):
            check_files(files, updated, metadata, tex)


if __name__ == "__main__":
    unittest.main()
