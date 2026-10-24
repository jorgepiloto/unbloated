---
title: Numerical Integration
date: 2026-10-24
description: The midpoint rule, its implementation, and a small convergence table.
---

## The Midpoint Rule

Approximate an integral by evaluating the function at the midpoint of each
subinterval. The implementation below divides the interval into `n` equal parts.

{{< tabs label="Midpoint rule" >}}
{{< tab tabName="Python" >}}

```python
def midpoint(f, a, b, n):
    if n < 1:
        raise ValueError("n must be positive")
    h = (b - a) / n
    return h * sum(f(a + (k + 0.5) * h) for k in range(n))
```

{{< /tab >}}
{{< tab tabName="Steps" >}}

1. Divide the interval into equal parts.
2. Evaluate the function at the midpoint of each part.
3. Multiply the sum of those values by the step size.

{{< /tab >}}
{{< /tabs >}}

## Checking the Result

The midpoint estimates for the integral of `x²` on `[0, 1]` are:

| Subintervals | Estimate | Absolute error |
| -----------: | -------: | -------------: |
|            1 | 0.250000 |       0.083333 |
|            2 | 0.312500 |       0.020833 |
|            4 | 0.328125 |       0.005208 |

{{< note content="These values check one integrand. They do not establish an error bound for arbitrary continuous functions." >}}

See [OpenStax Calculus Volume 2](https://openstax.org/details/books/calculus-volume-2)
for background on numerical integration.
