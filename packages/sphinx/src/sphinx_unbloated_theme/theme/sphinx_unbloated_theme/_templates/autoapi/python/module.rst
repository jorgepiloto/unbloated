{# Adapted from Ansys Sphinx Theme. Copyright 2021 - 2026 Synopsys, Inc. and ANSYS, Inc.
   Licensed under Apache-2.0; see ../LICENSE. Modified for Sphinx Unbloated Theme. #}
{% import "_macros.rst" as macros %}
{% if obj.display %}
{% set children = obj.children | selectattr("display") | list %}
{% set subpackages = obj.subpackages | selectattr("display") | list %}
{% set submodules = obj.submodules | selectattr("display") | list %}
{% set classes = [] %}
{% set interfaces = [] %}
{% set enums = [] %}
{% for item in children | selectattr("type", "equalto", "class") %}
{% set enum_base = namespace(found=false) %}
{% for base in item.bases %}
{% if base.startswith("enum.") %}{% set enum_base.found = true %}{% endif %}
{% endfor %}
{% if enum_base.found %}
{% set _ = enums.append(item) %}
{% elif item.short_name | length > 1 and item.short_name.startswith("I") and item.short_name[1].isupper() %}
{% set _ = interfaces.append(item) %}
{% else %}
{% set _ = classes.append(item) %}
{% endif %}
{% endfor %}
{% set exceptions = children | selectattr("type", "equalto", "exception") | list %}
{% set functions = children | selectattr("type", "equalto", "function") | list %}
{% set constants = [] %}
{% set attributes = [] %}
{% for item in children | selectattr("type", "equalto", "data") %}
{% if item.short_name.isupper() %}
{% set _ = constants.append(item) %}
{% else %}
{% set _ = attributes.append(item) %}
{% endif %}
{% endfor %}
{% set members = classes + interfaces + enums + exceptions + functions + constants + attributes %}
{% if is_own_page %}
.. rst-class:: autoapi-page

{{ obj.short_name }} {{ obj.type | title }}
{{ "=" * (obj.short_name | length + obj.type | length + 1) }}

{% endif %}
.. py:module:: {{ obj.name }}

{% if is_own_page %}
{{ macros.toctree(subpackages + submodules + (members | selectattr("type", "in", own_page_types) | list)) }}
{% if "show-module-summary" in autoapi_options and (members or subpackages or submodules) %}
Summary
-------

{{ macros.summary([
    ("Subpackages", subpackages), ("Submodules", submodules),
    ("Interfaces", interfaces), ("Classes", classes), ("Enums", enums),
    ("Exceptions", exceptions), ("Functions", functions),
    ("Attributes", attributes), ("Constants", constants)
]) }}
{% endif %}
{% if obj.docstring %}
Description
-----------

.. autoapi-nested-parse::

   {{ obj.docstring | indent(3) }}

{% endif %}
{% set details = members | rejectattr("type", "in", own_page_types) | list %}
{% if details %}
{{ obj.type | title }} Details
{{ "-" * (obj.type | length + 8) }}

{% for item in details %}
{{ item.render() }}
{% endfor %}
{% endif %}
{% else %}
{% if obj.docstring %}
.. autoapi-nested-parse::

   {{ obj.docstring | indent(3) }}
{% endif %}
{% for item in members %}
{{ item.render() }}
{% endfor %}
{% endif %}
{% endif %}
