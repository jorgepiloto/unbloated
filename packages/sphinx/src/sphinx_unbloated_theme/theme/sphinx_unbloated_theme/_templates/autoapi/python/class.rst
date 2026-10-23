{# Adapted from Ansys Sphinx Theme. Copyright 2021 - 2026 Synopsys, Inc. and ANSYS, Inc.
   Licensed under Apache-2.0; see ../LICENSE. Modified for Sphinx Unbloated Theme. #}
{% import "_macros.rst" as macros %}
{% if obj.display %}
{% set children = obj.children | selectattr("display") | list %}
{% set own_children = children | selectattr("type", "in", own_page_types) | list %}
{% set local_children = children | rejectattr("type", "in", own_page_types) | list %}
{% set properties = children | selectattr("type", "equalto", "property") | list %}
{% set attributes = children | selectattr("type", "equalto", "attribute") | list %}
{% set methods = children | selectattr("type", "equalto", "method") | list %}
{% set classes = children | selectattr("type", "equalto", "class") | list %}
{% set exceptions = children | selectattr("type", "equalto", "exception") | list %}
{% set abstract_methods = [] %}
{% set constructors = [] %}
{% set instance_methods = [] %}
{% set static_methods = [] %}
{% set special_methods = [] %}
{% for item in methods %}
{% if "abstractmethod" in item.properties %}
{% set _ = abstract_methods.append(item) %}
{% elif "staticmethod" in item.properties %}
{% set _ = static_methods.append(item) %}
{% elif "classmethod" in item.properties or item.short_name in ["__init__", "__new__"] %}
{% set _ = constructors.append(item) %}
{% elif item.short_name.startswith("__") and item.short_name.endswith("__") %}
{% set _ = special_methods.append(item) %}
{% else %}
{% set _ = instance_methods.append(item) %}
{% endif %}
{% endfor %}
{% if is_own_page %}
.. rst-class:: autoapi-page

{{ obj.short_name }}
{{ "=" * obj.short_name | length }}

{{ macros.toctree(own_children) }}
{% endif %}
.. py:{{ obj.type }}:: {% if is_own_page %}{{ obj.id }}{% else %}{{ obj.short_name }}{% endif %}{% if obj.type_params %}[{{ obj.type_params }}]{% endif %}{% if obj.args %}({{ obj.args }}){% endif %}
{% for args, return_annotation in obj.overloads %}
   {{ " " * (obj.type | length) }}   {{ obj.short_name }}{% if args %}({{ args }}){% endif %}
{% endfor %}
{% if obj.bases and "show-inheritance" in autoapi_options %}

   Bases: {% for base in obj.bases %}{{ base | link_objs }}{% if not loop.last %}, {% endif %}{% endfor %}
{% endif %}
{% if "show-inheritance-diagram" in autoapi_options and obj.bases and obj.bases != ["object"] %}

   .. autoapi-inheritance-diagram:: {{ obj.id }}
      :parts: 1
{% if "private-members" in autoapi_options %}
      :private-bases:
{% endif %}
{% endif %}
{% if obj.docstring %}

   {{ obj.docstring | indent(3) }}
{% endif %}
{% if children %}

   .. rubric:: Overview

   {{ macros.summary([
       ("Abstract Methods", abstract_methods), ("Constructors", constructors),
       ("Methods", instance_methods), ("Properties", properties),
       ("Attributes", attributes), ("Static Methods", static_methods),
       ("Special Methods", special_methods), ("Classes", classes),
       ("Exceptions", exceptions)
   ]) | indent(3) }}
{% endif %}

   .. rubric:: Import Details

   .. code-block:: python

{% set module_name = obj.id[:-(obj.qual_name | length + 1)] %}
      from {{ module_name }} import {{ obj.qual_name.split(".")[0] }}
{% if "." in obj.qual_name %}
      {{ obj.short_name }} = {{ obj.qual_name }}
{% endif %}

{% for title, members in [("Property Details", properties), ("Attribute Details", attributes), ("Method Details", methods)] %}
{% set members = members | rejectattr("type", "in", own_page_types) | list %}
{% if members %}
   .. rubric:: {{ title }}

{% for member in members %}
   {{ member.render() | indent(3) }}
{% endfor %}
{% endif %}
{% endfor %}
{% for member in local_children if member.type not in ["property", "attribute", "method"] %}
   {{ member.render() | indent(3) }}
{% endfor %}
{% endif %}
