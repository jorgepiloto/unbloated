{# Adapted from Ansys Sphinx Theme. Copyright 2021 - 2026 Synopsys, Inc. and ANSYS, Inc.
   Licensed under Apache-2.0; see LICENSE. Modified for Sphinx Unbloated Theme. #}
API Reference
=============

Documentation generated from the package source and its docstrings.

.. toctree::
   :titlesonly:
   :maxdepth: 3

{% for page in pages if page.is_top_level_object and page.display %}
   {{ page.name }} <{{ page.include_path }}>
{% endfor %}
