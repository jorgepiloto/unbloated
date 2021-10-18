# unbloated: a theme for Hugo

This repository holds all the source files for styling your Hugo static site
with the unbloated theme. This theme tries to be as simple as possible so
information can be easy to find by readers.

It divides your website into three different sections:

<img align="left" height="480" style="margin: 20px;" src="https://github.com/jorgepiloto/unbloated/blob/main/images/skeleton.png">

The **banner section** displays the title, description and menu of your website. All these
elements can be customized via the `config.toml` 

For the **content section**, this is the place were all your information is expected
to be displayed. The style being used to display the content was inspired by
[Fabien Sanglard website](https://fabiensanglard.net/) and the [Xmin
theme](https://xmin.yihui.org/).

It supports LaTeX equations thanks to [KaTeX](https://katex.org/). You can write
those using `$...$` for inline equations or `$$...$$` single block ones.

Images are imposed to be centered and not exceed a VGA resolution, so they can
properly scale and fit into the content of your website.

Finally, footnote references are created at the bottom of the page.

Regarding the **footer section**, it can be riced as you need using the Hugo
configuration file too.


## Content organization

The unbloated theme allows you to organize your content in a very powerful way.
It assumes the following structure:

```
content
├── about
│   └── index.md # 
├── categories
│   └── index.md
├── contact
│   └── index.md
├── _index.md
└── posts
    ├── _index.md
    ├── category_A
    │   ├── YYYY_MM_DD_title_of_the_post_I
    │   │   ├── index.md
    │   │   ├── img
    │   │   │   └── ...
    │   │   └── src
    │   │       └── ...
    │   ├── YYYY_MM_DD_title_of_the_post_II
    │   │   ├── index.md
    │   │   ├── img
    │   │   │   └── ...
    │   │   └── src
    │   │       └── ...
    │   └── _index.md
    ├── category_B
    │   ├── ...
    │   └── _index.md
    └── ...
```

All first-level directories except the `posts/` one are [leaf
pages](https://gohugo.io/content-management/page-bundles/). Each  `index.md`
file inside of it holds their description and content to be displayed once the
HTML are rendered.

For the case of the `posts/` directory, each sub-folder is considered to be a
`category`. Now, the `_index.md` files are the home-pages for those categories.
Every folder within a `posts/category_X/` holds all the files for a post. This
allows you to have all the resources properly located and organized. Therefore,
you can

* Name your post directory with `YYYY_MM_DD_title_of_the_post`, so those are
  properly organized when listing them.

* The `index.md` file inside the post directory must contain all the content of
  your article.

* Create as many sub-directories as you need, like `img/`, `src/` or `res/`.
  Hence, you can link resources on these folders from your post by simply doing
  `img/image_A.png`.

## Why this theme?

Lots of modern websites make use of fancy and no-sense animations, making it
hard to find or even read their content. In addition to this, complex layouts
and style-sheets are not easy to maintain, which usually translates into hard
maintenance tasks.

unbloated is designed to be simple, powerful and elegant. Not only that, it
provides an easy content layout which allows you to locate a particular post
with all its assets directly, as the post content, its images and resources are
stored in the same folder, under a given category directory.
