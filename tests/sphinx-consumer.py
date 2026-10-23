"""Build a small real Sphinx consumer for adapter rendering regressions."""

from pathlib import Path
import subprocess
import sys

root = Path(sys.argv[1])
source = root / "source"
source.mkdir(parents=True, exist_ok=True)
(source / "conf.py").write_text(
    "project = 'Tools & <Interfaces>'\n"
    "html_theme = 'sphinx_unbloated_theme'\n"
    "html_baseurl = 'https://example.org/docs/'\n"
    "html_additional_pages = {'404': '404.html'}\n"
)
(source / "index.rst").write_text("Home\n====\n\n.. toctree::\n\n   content\n")
(source / "content.rst").write_text(
    "Content\n=======\n\nNested content\n--------------\n\n"
    ".. list-table:: Results\n   :header-rows: 1\n\n"
    "   * - Identifier\n     - Result\n"
    f"   * - {'Identifier' * 100}\n     - 42\n\n"
    ".. raw:: html\n\n"
    "   <div class=\"nboutput\"><img alt=\"Plot\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='50'/%3E\"><p>Numerical result: 42</p><table><caption>Output caption</caption><tr><td>Visible output</td></tr></table><p>Second output</p></div>\n\n"
    '   <p><a href="#target">Focus target</a></p><p id="target">Target</p>\n'
)
for builder in ("html", "dirhtml"):
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
            str(root / builder),
        ],
        check=True,
    )
