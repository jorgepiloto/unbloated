|python| |pypi| |GH-CI| |GPL|

.. |python| image:: https://img.shields.io/pypi/pyversions/sphinx-unbloated-theme?logo=python&logoColor=white&label=Python
   :target: https://pypi.org/project/sphinx-unbloated-theme/
   :alt: Python

.. |pypi| image:: https://img.shields.io/pypi/v/sphinx-unbloated-theme.svg?logo=pypi&logoColor=white&label=PyPI
   :target: https://pypi.org/project/sphinx-unbloated-theme/
   :alt: PyPI

.. |GH-CI| image:: https://github.com/jorgemartinez/sphinx-unbloated-theme/actions/workflows/ci_cd_pr.yml/badge.svg
   :target: https://github.com/jorgemartinez/sphinx-unbloated-theme/actions/workflows/ci_cd_pr.yml
   :alt: GH-CI

.. |GPL| image:: https://img.shields.io/badge/License-GPL--3.0-white.svg?labelColor=black
   :target: https://www.gnu.org/licenses/gpl-3.0.html
   :alt: GPL-3.0

About
=====

The Sphinx Unbloated Theme is a minimal, clean HTML theme for
`Sphinx <https://www.sphinx-doc.org/>`_. It is built on Sphinx's ``basic``
theme, the only dependency, and uses vanilla CSS with no third-party
frameworks or bundlers.

The theme is intentionally small: a single well-organised CSS file, a Jinja2
layout template, and a handful of configuration options. It is designed to be
easy to read, easy to override, and fast to load.

Screenshots
===========

Home page, user guide, and API reference, from left to right.

.. image:: doc/source/_static/screenshots/theme-preview.png
   :alt: Three theme screenshots showing the home page, user guide, and API reference.
   :width: 100%
   :align: center

Installation
============

Ensure your environment meets the `prerequisites`_. Then follow the
`installation guidelines`_ for step-by-step instructions.

Quick install with pip:

.. code-block:: bash

   pip install sphinx-unbloated-theme

Then set the theme in your ``conf.py``:

.. code-block:: python

   html_theme = "sphinx_unbloated_theme"

Documentation
=============

The `official documentation`_ contains the following sections:

- `Getting started`_. A brief overview of the theme, prerequisites, and
  installation instructions to get your documentation site up and running
  in minutes.

- `User guide`_. Detailed documentation of all configuration options,
  layout conventions, and CSS customisation hooks. This is the right place
  to learn how to tailor the theme to your project.

- `API reference`_. Auto-generated reference for the public Python API
  exposed by the theme package (Sphinx extension hooks, version helpers,
  etc.).

- `Examples`_. A gallery of self-contained scientific Python notebooks that
  demonstrate the theme rendering prose, code blocks, maths, figures, and
  interactive output.

- `Changelog`_. A version-by-version summary of notable changes, bug fixes,
  and new features.

Contributing
============

Read the `contribution guide`_ for setup, documentation builds, tests, and
changelog fragments. Contributions follow the `code of conduct`_. To report
a vulnerability, use the contact in the `security policy`_.

Development
===========

GitHub Actions uses three workflows:

- ``ci_cd_pr.yml`` checks pull requests, builds wheels on Linux and Windows
  with Python 3.12 and 3.13, builds the documentation, and runs the browser
  tests. It uploads the HTML documentation and package distributions.
- ``ci_cd_night.yml`` runs on pushes to ``main``, daily at 00:00 UTC, and
  on manual runs. The manual inputs select documentation deployment and
  tests. Documentation builds also run when tests need them.
- ``ci_cd_release.yml`` runs on ``v*.*.*`` tags. After the checks pass, it
  publishes the package to PyPI and GitHub and deploys stable and versioned
  documentation. The tag must match the package version.

Development and release documentation use ``WEBSITE_DEPLOY_KEY`` to publish
to the ``gh-pages`` branch of ``jorgepiloto/website``.

For PyPI releases, configure a `trusted publisher
<https://docs.pypi.org/trusted-publishers/adding-a-publisher/>`_ for
``ci_cd_release.yml`` and the ``release`` environment.

Troubleshooting
===============

For troubleshooting or reporting issues, please open an issue in the project
repository:

- Go to the `project repository`_.
- Click the **Issues** tab.
- Click **New Issue**.
- Provide a clear description of the problem, including any error messages,
  code snippets, or screenshots that help reproduce it.

License
=======

Copyright (c) 2026 Jorge Martinez. This project uses the GNU General Public
License, version 3 only (``GPL-3.0-only``). See `LICENSE`_ for its terms.
The bundled AutoAPI templates include their Apache-2.0 license and attribution.
Source Code Pro fonts retain Adobe's copyright notice and SIL Open Font
License in ``_static/fonts/LICENSE.txt``. Inline icons adapted from Font
Awesome retain attribution comments and the license in
``_static/licenses/font-awesome-LICENSE.txt``. These files are included in
the package and copied into generated documentation.

Changelog
=========

The changelog tracks notable changes for each release of the Sphinx Unbloated
Theme. To view the full history, see the `changelog file`_ in the repository.


.. _prerequisites: https://jorgemartinez.space/projects/sphinx-unbloated-theme/version/stable/getting-started/prerequisites.html
.. _installation guidelines: https://jorgemartinez.space/projects/sphinx-unbloated-theme/version/stable/getting-started/installation.html

.. _official documentation: https://jorgemartinez.space/projects/sphinx-unbloated-theme/version/stable/
.. _getting started: https://jorgemartinez.space/projects/sphinx-unbloated-theme/version/stable/getting-started.html
.. _user guide: https://jorgemartinez.space/projects/sphinx-unbloated-theme/version/stable/user-guide.html
.. _api reference: https://jorgemartinez.space/projects/sphinx-unbloated-theme/version/stable/api-reference.html
.. _examples: https://jorgemartinez.space/projects/sphinx-unbloated-theme/version/stable/examples.html
.. _changelog: https://jorgemartinez.space/projects/sphinx-unbloated-theme/version/stable/changelog.html

.. _project repository: https://github.com/jorgemartinez/sphinx-unbloated-theme
.. _contribution guide: https://github.com/jorgemartinez/sphinx-unbloated-theme/blob/main/CONTRIBUTING.md
.. _code of conduct: https://github.com/jorgemartinez/sphinx-unbloated-theme/blob/main/CODE_OF_CONDUCT.md
.. _security policy: https://github.com/jorgemartinez/sphinx-unbloated-theme/blob/main/SECURITY.md
.. _LICENSE: https://github.com/jorgemartinez/sphinx-unbloated-theme/blob/main/LICENSE
.. _changelog file: https://github.com/jorgemartinez/sphinx-unbloated-theme/blob/main/doc/source/changelog.rst
