"""Regression checks for generated navigation, assets, and deployment paths."""

from html.parser import HTMLParser
from io import StringIO
from pathlib import Path
import tempfile
import unittest

from sphinx.application import Sphinx


class NavigationParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.active = []
        self.breadcrumbs = []
        self.in_active = False
        self.in_breadcrumb = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "button":
            self.in_active = attrs.get("class") == "active"
        if tag == "p":
            self.in_breadcrumb = attrs.get("class") == "nav-breadcrumb-title"

    def handle_endtag(self, tag):
        if tag == "button":
            self.in_active = False
        if tag == "p":
            self.in_breadcrumb = False

    def handle_data(self, data):
        if self.in_active:
            self.active.append(data)
        if self.in_breadcrumb:
            self.breadcrumbs.append(data)


class ThemeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = tempfile.TemporaryDirectory()
        cls.addClassCleanup(cls.directory.cleanup)
        root = Path(cls.directory.name)
        source = root / "source"
        source.mkdir()
        documents = {
            "index.rst": "Home\n====\n\n.. toctree::\n\n   docs/intro\n   docs/reference\n   guide\n",
            "docs/intro.rst": "Intro\n=====\n",
            "docs/reference.rst": "Reference\n=========\n",
            "guide.rst": "Guide\n=====\n\n.. toctree::\n\n   flat-child\n   nested/parent\n",
            "flat-child.rst": "Flat Child\n==========\n",
            "nested/parent.rst": "Parent\n======\n\n.. toctree::\n\n   /outside-leaf\n",
            "outside-leaf.rst": "Leaf\n====\n",
            "docs/orphan.rst": ":orphan:\n\nOrphan\n======\n",
            "conf.py": (
                "project = 'Regression'\n"
                "html_theme = 'sphinx_unbloated_theme'\n"
                "html_baseurl = 'https://example.com/projects/theme/version/stable/'\n"
                "html_additional_pages = {'404': '404.html'}\n"
                "html_theme_options = {'github_url': 'https://github.com/example/project', "
                "'versions_url': \"https://example.com/versions.json?name='quoted'\"}\n"
            ),
        }
        for name, content in documents.items():
            path = source / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
        cls.output = root / "html"
        warnings = StringIO()
        app = Sphinx(
            str(source),
            str(source),
            str(cls.output),
            str(root / "doctrees"),
            "html",
            status=StringIO(),
            warning=warnings,
            warningiserror=True,
            freshenv=True,
        )
        app.build(force_all=True)
        if app.statuscode:
            raise AssertionError(warnings.getvalue())

    def navigation(self, name):
        parser = NavigationParser()
        parser.feed((self.output / name).read_text(encoding="utf-8"))
        return parser

    def test_sections_in_one_folder_have_distinct_active_links(self):
        self.assertEqual(self.navigation("docs/reference.html").active, ["Reference"])

    def test_flat_child_uses_toctree_ancestry(self):
        navigation = self.navigation("flat-child.html")
        self.assertEqual(navigation.active, ["Guide", "Flat Child"])
        self.assertEqual(navigation.breadcrumbs, ["Guide"])

    def test_subnav_marks_ancestor_outside_its_folder(self):
        self.assertEqual(
            self.navigation("outside-leaf.html").active, ["Guide", "Parent"]
        )

    def test_orphan_does_not_inherit_its_folder_navigation(self):
        navigation = self.navigation("docs/orphan.html")
        self.assertEqual(navigation.active, [])
        self.assertEqual(navigation.breadcrumbs, [])

    def test_404_sets_deployment_base_before_loading_assets(self):
        page = (self.output / "404.html").read_text(encoding="utf-8")
        base = '<base href="/projects/theme/version/stable/">'
        self.assertIn(base, page)
        self.assertLess(page.index(base), page.index('rel="stylesheet"'))

    def test_licenses_and_attribution_reach_generated_pages(self):
        font_license = (self.output / "_static/fonts/LICENSE.txt").read_text()
        self.assertIn("© 2023 Adobe", font_license)
        self.assertIn("SIL OPEN FONT LICENSE Version 1.1", font_license)
        self.assertTrue(
            (self.output / "_static/licenses/font-awesome-LICENSE.txt").is_file()
        )
        page = (self.output / "index.html").read_text(encoding="utf-8")
        self.assertIn("Icons adapted from Font Awesome Free by Fonticons, Inc.", page)
        self.assertIn("https://creativecommons.org/licenses/by/4.0/", page)

    def test_feed_url_is_data_rather_than_inline_javascript(self):
        page = (self.output / "index.html").read_text(encoding="utf-8")
        self.assertIn("data-versions-url=", page)
        self.assertNotIn("fetch('https://example.com/versions.json", page)


if __name__ == "__main__":
    unittest.main()
