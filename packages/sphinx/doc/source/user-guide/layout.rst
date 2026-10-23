.. _layout:

Layout
######

The page layout follows `jorgemartinez.space <https://jorgemartinez.space>`_.
It uses four HTML elements:

``<header>``
    Shows the project name (``project`` in ``conf.py``) in white on black.
    Set ``site_description`` to add a description below it.

``<nav>``
    Monospace buttons link to the top-level sections and the current section's
    child pages. They show white text on black when hovered or active.

``<main>``
    Contains the document and uses the available width, up to 800 px.

``<footer>``
    Shows ``footer_text`` in white on black. The default is the copyright
    text and a Sphinx notice.

Page Navigation
---------------

A back button below the content links to the parent page. Top-level pages link
back to Home. The button has a left arrow, a black border, and a gray shadow.
Hovering or focusing it with the keyboard switches to white text on black.
On short pages, the content area expands to keep the button next to the footer.

Table of Contents
-----------------

The theme hides the ``basic`` theme's sidebar. To add a table of contents
inside a page, use the ``.. contents::`` directive in your ``.rst`` file:

.. code-block:: rst

   .. contents:: On this page
      :local:
      :depth: 2
