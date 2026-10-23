.. _kitchen-sink:

Kitchen Sink
############

Use these reStructuredText samples to check the theme's typography, spacing,
and colors.

Typography
----------

Paragraphs use the theme's monospace typeface. This paragraph includes
**bold text**, *italic text*, ``inline code``, and a
`hyperlink <https://www.sphinx-doc.org/>`_.

Headings
--------

Heading Level 3 (h3)
~~~~~~~~~~~~~~~~~~~~~

Heading Level 4 (h4)
^^^^^^^^^^^^^^^^^^^^^

Heading Level 5 (h5)
"""""""""""""""""""""

Lists
-----

Unordered
~~~~~~~~~

- First item in an unordered list.
- Second item, with enough text to check how the list wraps on a narrow
  screen.
- Third item.

Ordered
~~~~~~~

1. First step.
2. Second step.
3. Third step.

Definition List
~~~~~~~~~~~~~~~

term
    Definition of the term.

another term
    This definition spans multiple lines so you can check the indentation
    of wrapped text.

Code
----

Inline code: ``print("Hello, world!")``.

Code block:

.. code-block:: python

   def greet(name: str) -> str:
       """Return a friendly greeting."""
       return f"Hello, {name}!"


   print(greet("world"))

Admonitions
-----------

.. note::

   Use a note for information that supports the main text.

.. warning::

   Use a warning for actions that could cause harm or can't be undone.

.. tip::

   Use a tip for advice on completing a task.

Tables
------

.. list-table:: Sample Data Table
   :header-rows: 1
   :widths: 20 40 40

   * - Column A
     - Column B
     - Column C
   * - Row 1
     - Some value
     - Another value
   * - Row 2
     - Some value
     - Another value

Blockquote
----------

   Indent a passage to render it as a blockquote. The indentation separates
   it from the surrounding paragraphs.

Mathematics
-----------

Inline math: the area of a circle is :math:`A = \pi r^2`.

Display math: the quadratic formula.

.. math::

   x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}

A multiline equation with Euler's identity and the Gaussian integral:

.. math::

   e^{i\pi} + 1 &= 0 \\
   \int_{-\infty}^{\infty} e^{-x^2}\, dx &= \sqrt{\pi}
