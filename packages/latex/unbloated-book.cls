% SPDX-License-Identifier: LGPL-3.0-only
\NeedsTeXFormat{LaTeX2e}[2022-06-01]
\ProvidesClass{unbloated-book}[2026/10/23 v0.1.0 Technical books]

\RequirePackage{iftex}
\ifluatex\else
  \ClassError{unbloated-book}{LuaLaTeX is required}
    {Compile this book with lualatex, not pdflatex or xelatex.}
  \expandafter\endinput
\fi

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{book}}
\ProcessOptions\relax
\LoadClass{book}

\RequirePackage{fontspec}
\setmainfont{Latin Modern Mono}[
  Ligatures=TeX,
  BoldFont=lmmonolt10-bold.otf,
  BoldItalicFont=lmmonolt10-boldoblique.otf
]
\setsansfont{Latin Modern Mono}[
  Ligatures=TeX,
  BoldFont=lmmonolt10-bold.otf,
  BoldItalicFont=lmmonolt10-boldoblique.otf
]
\setmonofont{Latin Modern Mono}[
  BoldFont=lmmonolt10-bold.otf,
  BoldItalicFont=lmmonolt10-boldoblique.otf
]

\RequirePackage[
  inner=30mm,
  outer=25mm,
  top=25mm,
  bottom=30mm,
  headheight=15pt
]{geometry}
\RequirePackage{microtype}
\RequirePackage{ragged2e}
\setlength{\RaggedRightParindent}{\parindent}
\AtBeginDocument{\RaggedRight}
\RequirePackage{amsmath}
\RequirePackage{amssymb}
\RequirePackage{amsthm}
\RequirePackage{graphicx}
\RequirePackage{booktabs}
\RequirePackage{listings}

\numberwithin{equation}{chapter}
\newtheorem{theorem}{Theorem}[chapter]
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{proposition}[theorem]{Proposition}
\newtheorem{corollary}[theorem]{Corollary}
\theoremstyle{definition}
\newtheorem{definition}[theorem]{Definition}
\newtheorem{example}[theorem]{Example}
\newtheorem{exercise}{Exercise}[chapter]
\theoremstyle{remark}
\newtheorem*{remark}{Remark}

\lstset{
  basicstyle=\small\ttfamily,
  keywordstyle=\bfseries,
  commentstyle=\itshape,
  numbers=left,
  numberstyle=\scriptsize\ttfamily,
  numbersep=8pt,
  frame=single,
  breaklines=true,
  columns=fullflexible,
  keepspaces=true,
  showstringspaces=false,
  captionpos=b
}

\RequirePackage{hyperref}
\hypersetup{hidelinks,bookmarksnumbered}

\endinput
