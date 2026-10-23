{# Adapted from Ansys Sphinx Theme. Copyright 2021 - 2026 Synopsys, Inc. and ANSYS, Inc.
   Licensed under Apache-2.0; see LICENSE. Modified for Sphinx Unbloated Theme. #}
{% macro summary(groups) %}
.. container:: autoapi-summary

{% for title, objects in groups if objects %}
   .. container:: autoapi-summary-panel

      .. rubric:: {{ title }}

      .. list-table::
         :class: autoapi-summary-table
         :widths: 35 65

{% for item in objects %}
         * - :py:obj:`~{{ item.id }}`
           - {{ item.summary | indent(13) }}
{% endfor %}

{% endfor %}
{% endmacro %}

{% macro toctree(objects) %}
{% if objects %}
.. toctree::
   :hidden:
   :titlesonly:
   :maxdepth: 1

{% for item in objects %}
   {{ item.short_name }} <{{ item.include_path }}>
{% endfor %}

{% endif %}
{% endmacro %}
