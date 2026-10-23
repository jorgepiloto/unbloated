"""Build HTML and dirhtml fixtures in the positional output directory.

Pass --full-header to configure five social links, a version feed, and a long
project label. The fixtures use the installed theme and its real core bundle.
"""

from pathlib import Path
import subprocess
import sys

root = Path(sys.argv[1])
source = root / "source"
source.mkdir(parents=True, exist_ok=True)
full_header = "--full-header" in sys.argv[2:]
project = "Tools & <Interfaces>" + (
    " with long project and version labels" * 3 if full_header else ""
)
options = (
    {
        "github_url": "https://github.com/example/project",
        "linkedin_url": "https://example.org/network",
        "youtube_url": "https://example.org/videos",
        "rss_url": "https://example.org/feed.xml",
        "sponsor_url": "https://example.org/support",
        "versions_url": "https://example.org/docs/versions.json",
    }
    if full_header
    else {}
)
(source / "conf.py").write_text(
    f"project = {project!r}\n"
    "html_theme = 'sphinx_unbloated_theme'\n"
    "html_baseurl = 'https://example.org/docs/'\n"
    "html_additional_pages = {'404': '404.html'}\n"
    f"html_theme_options = {options!r}\n"
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
    "\nRead the :doc:`guide <index>`.\n\n"
    f"Long URL: https://example.org/{'identifier' * 100}\n\n"
    ".. raw:: html\n\n"
    '   <div class="autoapi-summary"><div class="autoapi-summary-panel"><p class="rubric">Functions</p><p>Function summary content.</p></div><div class="autoapi-summary-panel"><p class="rubric">Classes</p><p>Class summary content.</p></div></div>\n'
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
