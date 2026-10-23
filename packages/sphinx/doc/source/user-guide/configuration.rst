.. _configuration:

Configuration
#############

Set ``html_theme_options`` in your project's ``conf.py``.

Available Options
-----------------

``site_description``
    A short description below the project title in the header. The default
    is an empty string, which hides the description.

    .. code-block:: python

       html_theme_options = {
           "site_description": "Comprehensive documentation for MyProject.",
       }

``footer_text``
    HTML to show inside the ``<footer>`` element. By default, the footer
    shows the Sphinx copyright string and a "Built with Sphinx" notice.

    .. code-block:: python

       html_theme_options = {
           "footer_text": "&copy; 2026 My Name.",
       }

``github_url``
    Your project's GitHub repository URL. Adds a GitHub icon link beside
    the other social icons in the header. The default is an empty string,
    which hides the icon.

    .. code-block:: python

       html_theme_options = {
           "github_url": "https://github.com/my-org/my-project",
       }

``linkedin_url``
    A LinkedIn profile or company page URL. Adds a LinkedIn icon link to
    the header. The default is an empty string, which hides the icon.

    .. code-block:: python

       html_theme_options = {
           "linkedin_url": "https://www.linkedin.com/in/my-profile/",
       }

``youtube_url``
    A YouTube channel or playlist URL. Adds a YouTube icon link to the
    header. The default is an empty string, which hides the icon.

    .. code-block:: python

       html_theme_options = {
           "youtube_url": "https://www.youtube.com/@my-channel",
       }

``rss_url``
    An RSS feed URL. Adds an RSS icon link to the header. The default is
    an empty string, which hides the icon.

    .. code-block:: python

       html_theme_options = {
           "rss_url": "https://my-site.com/feed.xml",
       }

``sponsor_url``
    A URL for GitHub Sponsors, Open Collective, or another sponsorship page.
    Adds a heart-shield icon link to the header. The default is an empty
    string, which hides the icon.

    .. code-block:: python

       html_theme_options = {
           "sponsor_url": "https://github.com/sponsors/my-org",
       }

``versions_url``
    A JSON file URL listing the available documentation versions. Adds a
    version dropdown to the header. The JSON must be an array of objects
    with ``name`` and ``url`` keys. The default is an empty string, which
    hides the dropdown.

    Version destinations must use HTTP or HTTPS and share the documentation
    site's origin. Relative destinations resolve against the current page.
    Invalid entries are skipped. If no valid entries remain or the feed fails
    to load, the dropdown is hidden.

    .. code-block:: python

       html_theme_options = {
           "versions_url": "https://my-site.com/versions.json",
       }

    Expected JSON format:

    .. code-block:: json

       [
         {"name": "v2.0 (stable)", "url": "https://my-site.com/version/stable/"},
         {"name": "v1.0",          "url": "https://my-site.com/version/v1.0/"}
       ]

404 Pages
---------

To generate a 404 page, add these settings to ``conf.py``:

.. code-block:: python

   html_additional_pages = {"404": "404.html"}
   html_baseurl = "https://my-site.com/my-project/"

Set ``html_baseurl`` to the documentation root, including its deployment
prefix. The 404 page uses that path for assets and navigation when the host
serves it for a missing URL. An empty ``html_baseurl`` uses the domain root.

Full Example
------------

.. code-block:: python

   html_theme = "sphinx_unbloated_theme"

   html_theme_options = {
       "site_description": "My project documentation.",
       "footer_text": "&copy; 2026 My Name. Built with the Sphinx Unbloated Theme.",
       "github_url": "https://github.com/my-org/my-project",
       "linkedin_url": "https://www.linkedin.com/in/my-profile/",
       "youtube_url": "https://www.youtube.com/@my-channel",
       "rss_url": "https://my-site.com/feed.xml",
       "sponsor_url": "https://github.com/sponsors/my-org",
       "versions_url": "https://my-site.com/versions.json",
   }

AutoAPI Templates
-----------------

The theme includes templates for `Sphinx AutoAPI
<https://sphinx-autoapi.readthedocs.io/en/latest/>`_. They group API summaries
into tabs and include descriptions and member details. Class summaries group
methods, properties, and attributes and include an import example.

Install ``sphinx-autoapi`` and ``numpydoc``, then select the templates in
``conf.py``:

.. code-block:: python

   from sphinx_unbloated_theme import get_autoapi_templates_dir

   extensions = ["autoapi.extension", "numpydoc"]
   html_theme = "sphinx_unbloated_theme"
   autoapi_dirs = ["../../src/my_project"]
   autoapi_template_dir = get_autoapi_templates_dir()
   numpydoc_show_class_members = False

Set ``autoapi_dirs`` to your package directory, relative to the documentation
source directory. To give each class its own page, set
``autoapi_own_page_level = "class"``.

Use the arrow keys, Home, and End to switch summary tabs. All summary groups
remain visible when JavaScript is turned off.

To use your own templates, set ``autoapi_template_dir`` to your template
directory instead.
