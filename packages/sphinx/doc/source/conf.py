"""Configure the documentation build."""

from datetime import datetime
from pathlib import Path
import logging
import os
import pathlib
import shutil
import subprocess
import sys

import sphinx
import sphinx.application
from sphinx.util.display import status_iterator

# Load the local theme and version from src.
sys.path.insert(0, str(Path(__file__).parents[2] / "src"))

from sphinx_unbloated_theme import __version__, get_autoapi_templates_dir

# Project information
project = "Sphinx Unbloated Theme"
copyright = f"{datetime.now().year}, Jorge Martinez"
author = "Jorge Martinez"
release = version = __version__
cname = os.getenv("DOCUMENTATION_CNAME", "localhost")

# Sphinx extensions
extensions = [
    "autoapi.extension",
    "sphinx.ext.intersphinx",
    "sphinx.ext.mathjax",
    "sphinx.ext.viewcode",
    "numpydoc",
    "sphinx_copybutton",
    "nbsphinx",
    "myst_parser",
]

# Intersphinx mapping
intersphinx_mapping = {
    "python": ("https://docs.python.org/3", None),
    "sphinx": ("https://www.sphinx-doc.org/en/master", None),
}

# Generate the API pages under the existing reference section.
autoapi_dirs = ["../../src/sphinx_unbloated_theme"]
autoapi_root = "api-reference"
autoapi_template_dir = get_autoapi_templates_dir()
autoapi_add_toctree_entry = False
autoapi_options = [
    "members",
    "show-inheritance",
    "show-module-summary",
    "imported-members",
]
numpydoc_show_class_members = False

# HTML configuration
html_theme = "sphinx_unbloated_theme"
html_title = "Sphinx Unbloated Theme"
html_short_title = "Sphinx Unbloated Theme"
html_baseurl = os.getenv("DOCUMENTATION_BASE_URL", "")

html_theme_options = {
    "site_description": "A Sphinx theme with monospace text and black and white headers.",
    "footer_text": f"&copy; {datetime.now().year} Jorge Martinez. Built with the Sphinx Unbloated Theme.",
    "github_url": "https://github.com/jorgepiloto/sphinx-unbloated-theme",
    "versions_url": f"https://{cname}/versions.json",
}

# Source settings
master_doc = "index"
exclude_patterns = ["_build", "conf.py"]

# Build the 404 page from the theme template.
html_additional_pages = {"404": "404.html"}

# Examples to exclude from the gallery
exclude_examples = []

# Source file extensions
source_suffix = {
    ".rst": "restructuredtext",
    ".mystnb": "jupyter_notebook",
    ".md": "markdown",
    ".py": "jupyter_notebook",
}

# Notebook examples
nbsphinx_execute = "always"
nbsphinx_custom_formats = {
    ".mystnb": ["jupytext.reads", {"fmt": "mystnb"}],
    ".py": ["jupytext.reads", {"fmt": ""}],
}
nbsphinx_prompt_width = ""

# Add download buttons after each notebook example's title.
nbsphinx_prolog = """
.. raw:: html

   <!-- Icons adapted from Font Awesome Free by Fonticons, Inc.
        License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
        Source: https://fontawesome.com/. -->
   <div class="download-buttons" id="download-buttons">
     <a href="{{ env.docname.rsplit("/", 1)[-1] }}.py">
       <button><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M439.8 200.5c-7.7-30.9-22.3-54.2-53.4-54.2h-40.1v47.4c0 36.8-31.2 67.8-66.8 67.8H172.7c-29.2 0-53.4 25-53.4 54.3v101.8c0 29 25.2 46 53.4 54.3 33.8 9.9 66.3 11.7 106.8 0 26.9-7.8 53.4-23.5 53.4-54.3v-40.7H226.2v-13.6h160.2c31.1 0 42.6-21.7 53.4-54.2 11.2-33.5 10.7-65.7 0-108.6zM286.2 404c11.1 0 20.1 9.1 20.1 20.3 0 11.3-9 20.4-20.1 20.4-11 0-20.1-9.2-20.1-20.4.1-11.3 9.1-20.3 20.1-20.3zM167.8 248.1h106.8c29.7 0 53.4-24.5 53.4-54.3V91.9c0-29-24.4-50.7-53.4-55.6-35.8-5.9-74.7-5.6-106.8.1-45.2 8-53.4 24.7-53.4 55.6v40.7h106.9v13.6h-147c-31.1 0-58.3 18.7-66.8 54.2-9.8 40.7-10.2 66.1 0 108.6 7.6 31.6 25.7 54.2 56.8 54.2H101v-48.8c0-35.3 30.5-66.4 66.8-66.4zm-6.7-142.6c-11.1 0-20.1-9.1-20.1-20.3.1-11.3 9-20.4 20.1-20.4 11 0 20.1 9.2 20.1 20.4s-9 20.3-20.1 20.3z"/></svg> Download as Python script</button>
     </a>
     <a href="{{ env.docname.rsplit("/", 1)[-1] }}.ipynb">
       <button><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg> Download as Jupyter notebook</button>
     </a>
     <a href="{{ env.docname.rsplit("/", 1)[-1] }}.pdf">
       <button><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V304H176c-35.3 0-64 28.7-64 64V512H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM176 352h32c30.9 0 56 25.1 56 56s-25.1 56-56 56H192v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V368c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24H192v48h16zm96-80h32c26.5 0 48 21.5 48 48v64c0 26.5-21.5 48-48 48H304c-8.8 0-16-7.2-16-16V368c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H320v96h16zm80-112c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v32h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H448v48c0 8.8-7.2 16-16 16s-16-7.2-16-16V368z"/></svg> Download as PDF document</button>
     </a>
   </div>
   <script>
     document.addEventListener('DOMContentLoaded', function () {
       var buttons = document.getElementById('download-buttons');
       var h1 = document.querySelector('main h1');
       if (h1 && buttons) h1.insertAdjacentElement('afterend', buttons);
     });
   </script>

"""


def copy_examples_to_output_dir(app: sphinx.application.Sphinx, exception: Exception):
    """
    Copy example scripts to the documentation output directory.

    Parameters
    ----------
    app : sphinx.application.Sphinx
        Sphinx application for this build.
    exception : Exception or None
        Build exception, or None if the build succeeded. Unused by this hook.

    """
    OUTPUT_EXAMPLES = pathlib.Path(app.outdir) / "examples"
    OUTPUT_EXAMPLES.mkdir(parents=True, exist_ok=True)

    EXAMPLES_DIRECTORY = pathlib.Path(app.srcdir).parent.parent / "examples"

    all_examples = list(EXAMPLES_DIRECTORY.glob("*.py"))
    examples = [file for file in all_examples if file.name not in exclude_examples]
    for file in status_iterator(
        examples,
        "Copying example to doc/_build/examples/",
        "green",
        len(examples),
        verbosity=1,
        stringify_func=(lambda x: x.name),
    ):
        destination_file = OUTPUT_EXAMPLES / file.name
        destination_file.write_text(file.read_text(encoding="utf-8"), encoding="utf-8")


def copy_examples_files_to_source_dir(app: sphinx.application.Sphinx, config):
    """
    Copy example scripts into the documentation source directory.

    Use ``config-inited`` so Sphinx can find the copied files. Sphinx calls
    ``find_files`` in ``_post_init_env`` after ``config-inited`` and before
    ``builder-inited``.

    Parameters
    ----------
    app : sphinx.application.Sphinx
        Sphinx application for this build.
    config : sphinx.config.Config
        Build configuration. Unused, but required by the event signature.

    """
    SOURCE_EXAMPLES = pathlib.Path(app.srcdir) / "examples"
    SOURCE_EXAMPLES.mkdir(parents=True, exist_ok=True)

    EXAMPLES_DIRECTORY = pathlib.Path(app.srcdir).parent.parent / "examples"

    all_examples = list(EXAMPLES_DIRECTORY.glob("*.py"))
    examples = [file for file in all_examples if file.name not in exclude_examples]
    for file in examples:
        destination_file = SOURCE_EXAMPLES / file.name
        destination_file.write_text(file.read_text(encoding="utf-8"), encoding="utf-8")


def remove_examples_from_source_dir(
    app: sphinx.application.Sphinx, exception: Exception
):
    """
    Remove copied examples from the documentation source directory.

    Parameters
    ----------
    app : sphinx.application.Sphinx
        Sphinx application for this build.
    exception : Exception or None
        Build exception, or None if the build succeeded. Unused by this hook.

    """
    EXAMPLES_DIRECTORY = pathlib.Path(app.srcdir) / "examples"
    logger = logging.getLogger(__name__)
    logger.info(f"\nRemoving {EXAMPLES_DIRECTORY} directory...")
    shutil.rmtree(EXAMPLES_DIRECTORY)


def render_examples_as_pdf(app: sphinx.application.Sphinx, exception: Exception):
    """
    Render notebook examples as PDF files using Quarto.

    Install Quarto to render the PDFs. See
    https://quarto.org/docs/get-started/.

    Parameters
    ----------
    app : sphinx.application.Sphinx
        Sphinx application for this build.
    exception : Exception or None
        Build exception, or None if the build succeeded. Unused by this hook.

    """
    try:
        RENDERED_EXAMPLES_DIRECTORY = pathlib.Path(app.outdir) / "examples"
        notebooks = list(RENDERED_EXAMPLES_DIRECTORY.glob("*.ipynb"))

        for notebook in status_iterator(
            notebooks,
            "Rendering notebook as PDF",
            "green",
            len(notebooks),
            verbosity=1,
            stringify_func=(lambda x: x.name),
        ):
            subprocess.run(
                [
                    "quarto",
                    "render",
                    str(notebook),
                    "--to",
                    "pdf",
                    "-M",
                    f"author:{author}",
                    "-M",
                    "highlight-style:pygments",
                ],
                check=True,
            )
    except FileNotFoundError:
        logger = logging.getLogger(__name__)
        logger.warning(
            "Quarto is not installed in the system. PDF files will not be rendered. "
            "See https://quarto.org/docs/get-started/"
        )


def setup(app: sphinx.application.Sphinx):
    """
    Register the example copy, cleanup, and PDF rendering hooks.

    Parameters
    ----------
    app : sphinx.application.Sphinx
        Sphinx application for this build.

    """
    # Sphinx reads files from its source directory. Copy scripts from examples/
    # to doc/source/examples/ before reading, then remove the copies after building.
    app.connect("config-inited", copy_examples_files_to_source_dir)
    app.connect("build-finished", remove_examples_from_source_dir)
    app.connect("build-finished", copy_examples_to_output_dir)
    app.connect("build-finished", render_examples_as_pdf)
