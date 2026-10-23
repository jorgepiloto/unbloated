"""Source safety and real-builder regressions from the development roadmap."""

from html.parser import HTMLParser
from pathlib import Path
from types import SimpleNamespace
from urllib.parse import urljoin, urlsplit
import runpy
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

from jinja2 import Environment


PACKAGE = Path(__file__).resolve().parents[2]


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []
        self.buttons = 0
        self.text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "button":
            self.buttons += 1
        for key in ("href", "src"):
            if key in attrs:
                self.references.append(attrs[key])

    def handle_data(self, text):
        self.text.append(text)


class ExampleSafetyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.hooks = runpy.run_path(str(PACKAGE / "doc/source/conf.py"))

    def test_existing_source_survives_success_failure_and_interruption(self):
        for outcome in (None, RuntimeError("failed"), KeyboardInterrupt()):
            with (
                self.subTest(outcome=outcome),
                tempfile.TemporaryDirectory() as directory,
            ):
                root = Path(directory)
                source = root / "doc/source"
                (source / "examples").mkdir(parents=True)
                (root / "examples").mkdir()
                authored = source / "examples/authored.rst"
                authored.write_text("Keep authored text")
                (root / "examples/example.py").write_text("print(42)")
                app = SimpleNamespace(srcdir=source)
                self.hooks["copy_examples_files_to_source_dir"](app, None)
                if not isinstance(outcome, KeyboardInterrupt):
                    self.hooks["remove_examples_from_source_dir"](app, outcome)
                    self.assertFalse((source / "examples/example.py").exists())
                else:
                    # A retry cannot overwrite a copy left by a killed process.
                    with self.assertRaises(FileExistsError):
                        self.hooks["copy_examples_files_to_source_dir"](app, None)
                self.assertEqual(authored.read_text(), "Keep authored text")

    def test_collision_rolls_back_created_copies_without_touching_existing_files(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "doc/source"
            (source / "examples").mkdir(parents=True)
            (root / "examples").mkdir()
            (root / "examples/a.py").write_text("generated")
            (root / "examples/z.py").write_text("would overwrite")
            collision = source / "examples/z.py"
            collision.write_text("authored")
            app = SimpleNamespace(srcdir=source)
            with self.assertRaises(FileExistsError):
                self.hooks["copy_examples_files_to_source_dir"](app, None)
            self.assertEqual(collision.read_text(), "authored")
            self.assertFalse((source / "examples/a.py").exists())

    def test_cleanup_preserves_edits_made_during_a_build(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "doc/source"
            source.mkdir(parents=True)
            (root / "examples").mkdir()
            (root / "examples/example.py").write_text("original")
            app = SimpleNamespace(srcdir=source)
            self.hooks["copy_examples_files_to_source_dir"](app, None)
            edited = source / "examples/example.py"
            edited.write_text("edited")
            self.hooks["remove_examples_from_source_dir"](app, None)
            self.assertEqual(edited.read_text(), "edited")


class ExportHookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.hooks = runpy.run_path(str(PACKAGE / "doc/source/conf.py"))

    def test_exports_run_only_after_successful_supported_builds(self):
        for builder in ("html", "dirhtml", "latex", "linkcheck", "text"):
            for exception in (None, RuntimeError("original build failure")):
                with (
                    self.subTest(builder=builder, exception=exception),
                    tempfile.TemporaryDirectory() as directory,
                ):
                    root = Path(directory)
                    source = root / "doc/source"
                    source.mkdir(parents=True)
                    (root / "examples").mkdir()
                    (root / "examples/example.py").write_text("print(42)")
                    output = root / "output"
                    (output / "examples").mkdir(parents=True)
                    (output / "examples/example.ipynb").write_text("{}")
                    app = SimpleNamespace(
                        srcdir=source,
                        outdir=output,
                        builder=SimpleNamespace(name=builder),
                    )
                    with patch("subprocess.run") as render:
                        self.hooks["copy_examples_to_output_dir"](app, exception)
                        self.hooks["render_examples_as_pdf"](app, exception)
                    exported = exception is None and builder in {"html", "dirhtml"}
                    self.assertEqual(
                        (output / "examples/example.py").exists(), exported
                    )
                    self.assertEqual(render.call_count, int(exported))

    def test_cleanup_precedes_export_even_when_export_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "doc/source"
            source.mkdir(parents=True)
            (root / "examples").mkdir()
            (root / "examples/example.py").write_text("print(42)")
            output = root / "output"
            (output / "examples").mkdir(parents=True)
            (output / "examples/example.ipynb").write_text("{}")
            events = []
            app = SimpleNamespace(
                srcdir=source,
                outdir=output,
                builder=SimpleNamespace(name="html"),
                connect=lambda event, callback: events.append((event, callback)),
            )
            self.hooks["setup"](app)
            self.hooks["copy_examples_files_to_source_dir"](app, None)
            with (
                patch(
                    "subprocess.run",
                    side_effect=subprocess.CalledProcessError(1, "quarto"),
                ),
                self.assertRaises(subprocess.CalledProcessError),
            ):
                for event, callback in events:
                    if event == "build-finished":
                        callback(app, None)
            self.assertFalse((source / "examples/example.py").exists())
            self.assertTrue((root / "examples/example.py").exists())


class BuilderTests(unittest.TestCase):
    def test_plain_labels_and_404_references_in_both_html_builders(self):
        for builder in ("html", "dirhtml"):
            for repository in ("", "https://github.com/example/project/"):
                with (
                    self.subTest(builder=builder, repository=repository),
                    tempfile.TemporaryDirectory() as directory,
                ):
                    root = Path(directory)
                    source = root / "source"
                    source.mkdir()
                    project = 'Tools & <Interfaces> "Unicode ユニコード"'
                    label = "Vector <T> & Buffer"
                    (source / "conf.py").write_text(
                        f"project = {project!r}\n"
                        "html_theme = 'sphinx_unbloated_theme'\n"
                        "html_baseurl = 'https://example.org/docs/'\n"
                        "html_additional_pages = {'404': '404.html'}\n"
                        f"html_theme_options = {{'site_description': {label!r}, 'github_url': {repository!r}, 'footer_text': '<strong>Trusted footer</strong>'}}\n"
                    )
                    (source / "index.rst").write_text(
                        "Home\n====\n\n.. toctree::\n\n   literal\n"
                    )
                    (source / "literal.rst").write_text(
                        label + "\n" + "=" * len(label) + "\n"
                    )
                    # Render the actual Towncrier template with a nonempty entry.
                    template = Environment().from_string(
                        (PACKAGE / "doc/source/changelog/template").read_text()
                    )
                    changelog = template.render(
                        sections={"": {"fixed": {"Preserve outputs.": ["#42"]}}},
                        definitions={"fixed": {"name": "Fixed"}},
                    )
                    with (source / "literal.rst").open("a") as output:
                        output.write("\n" + changelog)
                    subprocess.run(
                        [
                            sys.executable,
                            "-m",
                            "sphinx",
                            "-q",
                            "-W",
                            "-b",
                            builder,
                            str(source),
                            str(root / "html"),
                        ],
                        check=True,
                        capture_output=True,
                        text=True,
                    )
                    page = (
                        root
                        / "html"
                        / ("404.html" if builder == "html" else "404/index.html")
                    ).read_text()
                    parser = Links()
                    parser.feed(page)
                    text = "".join(parser.text)
                    self.assertIn(project, text)
                    self.assertIn(label, text)
                    self.assertEqual(parser.buttons, 0)
                    self.assertIn("<strong>Trusted footer</strong>", page)
                    self.assertEqual(
                        'href="https://github.com/example/project/issues"' in page,
                        bool(repository),
                    )
                    for missing in (
                        "https://example.org/docs/missing/deep/page",
                        "https://example.org/docs/missing/",
                    ):
                        base = urljoin(missing, "/docs/")
                        for reference in parser.references:
                            if urlsplit(reference).scheme or reference.startswith("#"):
                                continue
                            resolved = urlsplit(urljoin(base, reference)).path
                            self.assertTrue(resolved.startswith("/docs/"), reference)
                            relative = resolved.removeprefix("/docs/")
                            target = root / "html" / relative
                            if resolved.endswith("/"):
                                target /= "index.html"
                            self.assertTrue(
                                target.is_file(), (builder, reference, target)
                            )
                    literal = (
                        root
                        / "html"
                        / (
                            "literal.html"
                            if builder == "html"
                            else "literal/index.html"
                        )
                    )
                    self.assertIn("Preserve outputs.", literal.read_text())


if __name__ == "__main__":
    unittest.main()
