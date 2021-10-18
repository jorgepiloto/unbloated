---
title: Unbloated theme features
author: Jorge Martínez Garrido
date: "2021-11-01"
categories: [Tutorial]
tags: [""]
---

In this post you will learn the different features which unbloated provides you
to write content in a simple, powerful and beautiful way[^1]. Among [the usual
ones](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#videos)
such us **headers, emphasis text, lists, links and images**, unbloated ships
with some *scientific oriented features*.


## Scientific oriented features

By scientific oriented features, we refer to:

* **Syntax highlight.**
* **LaTeX equations support.**
* **Footnote references.**

In the following subsections, more information about these is provided.

### Syntax highlight

Unbloated is compliant with Markdown support about code snippets. The default
syntax highlight theme is the `friendly` one, although you can change it easily
via `config.toml` file.

```python
import matplotlib.pyplot as plt
import numpy as np

# Declare an array of times
t = np.linspace(0, 2 * np.pi, 100+1)

# Plot the sinusoidal function
fig, ax = plt.subplots()
ax.plot(t, np.sin(t), color="k", label="$\sin{(t)}$")
ax.legend(shadow=True)
plt.show()
``` 


### LaTeX equations rendering

One of the most interesting features this theme provides you is LaTeX equations
support. You can either write them inline using `$ ... $`. As an example, here
you have [Euler's identity](https://en.wikipedia.org/wiki/Euler%27s_identity)
$e^{i\pi} + 1 = 0$.

It is also possible to display equations in centered in their own paragraphs by
using `$$ ... $$`. The expression for the equations of motion for the [two-body
problem]() in the context of astrodynamics is displayed here:

$$
\ddot{\vec{r}} = \frac{-\mu}{r^3}\vec{r}
$$


### Footnote references

References are critical when writing scientific content so you can properly list
your information sources. Hence, **unbloated** provides you with footnotes which
can easily be declared usgin `from this book[^1]` and adding `[^1]: A very cool
book`. As an example:

The Copernican revolution is started with the publication of *De revolutionibus
orbium coelestium*[^2] and ended with the publication of *Philosophiæ Naturalis
Principia Mathematica*[^3].

## A note about images

Images in **unbloated** are prevented to exceed the VGA resolution, that is
640x480. In addition, they are always centered in the content, so no floating
elements are allowed. Images which wrap around may introduce unexpected
behaviors when rendering the site's content.


![February 2021 Moon](/img/moon_wallpaper.png)



## References

[^1]: Checkout this page source code for better looking at its raw content.
[^2]: This book was written by Nicolaus Copernicus in 1543.
[^3]: This book was written by Isaac Newton in 1687.
