.. _layout:

Layout
######

The page layout follows `jorgemartinez.space <https://jorgemartinez.space>`_.
It uses four HTML elements:

``<header>``
    Shows the project name (``project`` in ``conf.py``) in white on black.
    Set ``site_description`` to add a description below it.
    Social links, search, and optional version selection wrap into rows as space
    narrows. On narrow screens the search and version labels sit above their
    fields; native controls retain visible keyboard focus.

``<nav>``
    Styled native links lead to the top-level sections and the current section's
    child pages. They show white text on black when hovered or active.

``<main>``
    Contains the document and uses the available width, up to 800 px.
    Prose links remain underlined before and after visiting them.

``<footer>``
    Shows ``footer_text`` in white on black. The default is the copyright
    text and a Sphinx notice.

Page Navigation
---------------

A back link below the content leads to the parent page. Top-level pages link
back to Home. The link has a left arrow, a black border, and a gray shadow.
Hovering or focusing it with the keyboard switches to white text on black.
On short pages, the content area expands to keep the link next to the footer.

Navigation follows toctree ancestry rather than directory names. Section pages
show their child links after the title; descendant pages show the section and
its children above the content. Each destination has one focusable link, with
the current page marked by ``aria-current``. These links work without scripts.

Table of Contents
-----------------

The theme hides the ``basic`` theme's sidebar. To add a table of contents
inside a page, use the ``.. contents::`` directive in your ``.rst`` file:

.. code-block:: rst

   .. contents:: On this page
      :local:
      :depth: 2
