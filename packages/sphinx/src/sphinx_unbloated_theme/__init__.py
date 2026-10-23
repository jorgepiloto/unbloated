"""Sphinx Unbloated Theme, an HTML theme for Sphinx."""

from pathlib import Path
import posixpath
import re
from urllib.parse import urlsplit, urlunsplit


__version__ = "1.1.dev0"
"""Current version of the Sphinx Unbloated Theme."""

THEME_PATH = Path(__file__).parent / "theme" / "sphinx_unbloated_theme"
"""Installed theme directory containing templates, static assets, and options."""


def get_autoapi_templates_dir():
    """Return the directory containing the theme's AutoAPI templates.

    Returns
    -------
    str
        Absolute directory path for Sphinx's ``autoapi_template_dir`` setting.

    Notes
    -----
    This helper performs no filesystem writes and does not enable AutoAPI.
    Install and configure ``sphinx-autoapi`` separately in the consuming project.
    """
    return str(THEME_PATH / "_templates" / "autoapi")


def _build_subnav(app, pagename, docnames, active_docs):
    """Build navigation links relative to the current page.

    Parameters
    ----------
    app : sphinx.application.Sphinx
        Sphinx application for the documentation build.
    pagename : str
        Document name of the current page.
    docnames : sequence of str
        Document names to include in the navigation.
    active_docs : set of str
        Current document and its ancestors in the toctree.

    Returns
    -------
    list of tuple
        Links as ``(label, url, is_active)`` tuples. Documents without a
        title are skipped.
    """
    links = []
    for doc in docnames:
        title_node = app.env.titles.get(doc)
        if title_node is None:
            continue
        links.append(
            (
                title_node.astext(),
                app.builder.get_relative_uri(pagename, doc) or "#",
                doc in active_docs,
            )
        )
    return links


def _add_nav_context(app, pagename, templatename, context, doctree):
    """Add navigation links to the page template context.

    Parameters
    ----------
    app : sphinx.application.Sphinx
        Sphinx application for the documentation build.
    pagename : str
        Document name of the current page.
    templatename : str
        Page template name. Unused, but required by the event signature.
    context : dict
        Template context to update with navigation links.
    doctree : docutils.nodes.document or None
        Page document tree. Unused, but required by the event signature.

    Notes
    -----
    ``nav_links`` contains Home and the top-level sections.
    ``breadcrumb_levels`` contains the top-level section's title, URL, and
    child links, rendered before the page body as ``{title, url, subnav}``.
    ``subnav_links`` contains the current page's children. JavaScript moves
    these links after the page's first ``<h1>``.
    """
    master = app.config.master_doc
    github = context.get("theme_github_url", "")
    context["issue_url"] = (
        github.rstrip("/") + "/issues"
        if re.fullmatch(r"https://github\.com/[A-Za-z0-9_-]+/[A-Za-z0-9_.-]+/?", github)
        and github.rstrip("/").rsplit("/", 1)[-1] not in {".", ".."}
        else None
    )
    if pagename == "404":
        # Resolve builder-relative links into the <base> frame, including
        # dirhtml's 404/index.html and a host's arbitrary missing-page URL.
        original_pathto = context["pathto"]
        directory = posixpath.dirname(app.builder.get_target_uri(pagename))

        def rebase_target(target):
            parts = urlsplit(target)
            if parts.scheme or target.startswith("/"):
                return target
            path = posixpath.normpath(posixpath.join(directory, parts.path))
            if parts.path.endswith("/") or path == ".":
                path += "/"
            return urlunsplit(("", "", path, parts.query, parts.fragment))

        def root_pathto(*args, **kwargs):
            return rebase_target(original_pathto(*args, **kwargs))

        context["pathto"] = root_pathto
        context["content_root"] = "./"

        def root_resource_tag(renderer):
            # Sphinx's tag helpers close over their original pathto function.
            # Keep attributes/checksums and rebase only the emitted resource URL.
            def render(resource):
                def rebase(match):
                    target = match.group(2)
                    if urlsplit(target).scheme or target.startswith("/"):
                        return match.group(0)
                    return f'{match.group(1)}="{rebase_target(target)}"'

                return re.sub(
                    r'\b(href|src)="([^"]*)"', rebase, renderer(resource), count=1
                )

            return render

        for tag in ("css_tag", "js_tag"):
            context[tag] = root_resource_tag(context[tag])
    reference_page = master if pagename == "404" else pagename
    context["current_page_url"] = (
        app.builder.get_relative_uri(pagename, pagename) or "#"
    )
    context["documentation_root"] = (
        urlsplit(app.config.html_baseurl).path.rstrip("/") + "/"
    )
    toctree_includes = getattr(app.env, "toctree_includes", {})
    top_level_docs = toctree_includes.get(master, [])
    active_docs = set()
    current = pagename
    while current and current not in active_docs:
        active_docs.add(current)
        relation = app.builder.relations.get(current)
        current = relation[0] if relation else None

    # Keep the same navigation links on every page.
    nav_links = [
        (
            "Home",
            app.builder.get_relative_uri(reference_page, master) or "#",
            pagename == master,
        )
    ]
    for doc in top_level_docs:
        title_node = app.env.titles.get(doc)
        if title_node is None:
            continue
        is_active = doc in active_docs and pagename != master
        nav_links.append(
            (
                title_node.astext(),
                app.builder.get_relative_uri(reference_page, doc) or "#",
                is_active,
            )
        )
    context["nav_links"] = nav_links

    breadcrumb_levels = []  # Rendered before the page body.
    subnav_links = []  # Moved after the first h1 by JavaScript.

    if pagename == master:
        context["breadcrumb_levels"] = breadcrumb_levels
        context["subnav_links"] = subnav_links
        return

    # Use the same toctree ancestry as Sphinx's parent links.
    section_doc = next(
        (doc for doc in top_level_docs if doc in active_docs),
        None,
    )
    if section_doc is None:
        context["breadcrumb_levels"] = breadcrumb_levels
        context["subnav_links"] = subnav_links
        return

    section_children = toctree_includes.get(section_doc, [])

    if pagename == section_doc:
        # On a section page, show its children after the title.
        subnav_links = _build_subnav(app, pagename, section_children, active_docs)
    else:
        # On a descendant page, show the section and its children above the body.
        section_title_node = app.env.titles.get(section_doc)
        breadcrumb_levels.append(
            {
                "title": section_title_node.astext()
                if section_title_node
                else section_doc,
                "url": app.builder.get_relative_uri(pagename, section_doc),
                "subnav": _build_subnav(app, pagename, section_children, active_docs),
            }
        )

        # Show the current page's children after its title, if any.
        current_children = toctree_includes.get(pagename, [])
        subnav_links = _build_subnav(app, pagename, current_children, active_docs)

    context["breadcrumb_levels"] = breadcrumb_levels
    context["subnav_links"] = subnav_links


def setup(app):
    """Register the theme and navigation hook with Sphinx.

    Parameters
    ----------
    app : sphinx.application.Sphinx
        Sphinx application for the documentation build.

    Returns
    -------
    dict
        Extension metadata with the version and parallel build safety flags.

    Notes
    -----
    Registers the core CSS before adapter styles, deferred AutoAPI and version
    scripts, and the page-context hook. Sphinx calls this entry point; consumers
    normally select ``html_theme`` rather than calling it themselves.
    """
    app.add_html_theme("sphinx_unbloated_theme", THEME_PATH)
    app.add_css_file("css/unbloat.css", priority=100)
    app.add_js_file("js/autoapi.js", defer="defer")
    app.add_js_file("js/version-switcher.js", defer="defer")
    app.connect("html-page-context", _add_nav_context)
    return {
        "version": __version__,
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
