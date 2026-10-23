---
title: Components
---

Every preview uses the generated `unbloat.css` from this checkout. The dashed
border marks the preview area; it is a documentation layout rule.

| Component                                      | Class or Element                             | Style                                             |
| ---------------------------------------------- | -------------------------------------------- | ------------------------------------------------- |
| [Typography](typography.md)                    | Headings, paragraphs, links, lists, and code | Monospace type and underlined links               |
| [Form Controls](controls.md)                   | Inputs, select, textarea, and buttons        | Square borders and visible keyboard focus         |
| [Buttons](buttons.md)                          | `unbloat-button`                             | Bordered surface, hard shadow, and inverted hover |
| [Tags](buttons.md#tags)                        | `unbloat-tag`                                | Compact label or link with a hard shadow          |
| [Panels](panels.md)                            | `unbloat-panel`                              | Bordered surface with a hard shadow               |
| [Callouts](panels.md#callouts)                 | `unbloat-callout`                            | Bordered note with a thicker leading edge         |
| [Inverse Surfaces](panels.md#inverse-surfaces) | `unbloat-inverse`                            | White text on a black surface                     |
| [Tabs](tabs.md)                                | `unbloat-tabs`                               | Wrapping controls with an inverted selected state |
| [Tables and Details](content.md)               | `table`, `details`, and `summary`            | Bordered cells and native disclosure behavior     |

Use native controls and descriptive labels. See [Tabs](tabs.md) for the behavior
you need to add beyond the CSS.

The [Design Tokens](../reference/tokens.md) page lists the values used by these
components and shows how to override them.
