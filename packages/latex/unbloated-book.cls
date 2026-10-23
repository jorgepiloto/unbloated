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
% Core font sizes can be fractional; keep Computer Modern mathematics scalable.
\RequirePackage{fix-cm}
\LoadClass{book}

\IfFileExists{unbloated-tokens.sty}{
  \RequirePackage{unbloated-tokens}
}{
  \ClassError{unbloated-book}{Missing generated core tokens}
    {Run npm run build:adapters, or install the complete LaTeX adapter archive.}
  \expandafter\endinput
}

\newcommand{\unbloated@font}[2]{%
  \setlength{\@tempdima}{\UnbloatedToken{#1}}%
  \fontsize{\@tempdima}{\UnbloatedToken{#2}\@tempdima}\selectfont
}
\let\unbloated@normalsize\normalsize
\renewcommand{\normalsize}{%
  \unbloated@normalsize
  \unbloated@font{font-size}{line-height-body}%
}
\normalsize

\RequirePackage{fontspec}
% Map the core's generic monospace family to a TeX-distributed OpenType font.
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
\setlength{\parindent}{0pt}
\setlength{\RaggedRightParindent}{0pt}
\setlength{\parskip}{\UnbloatedToken{space-3}}
\AtBeginDocument{\RaggedRight}
\AtBeginDocument{%
  \pagecolor{unbloat-color-surface}%
  \color{unbloat-color-text}%
  \typeout{Unbloated core CSS SHA-256: \UnbloatedCoreHash}%
}
\RequirePackage{amsmath}
\RequirePackage{amssymb}
\RequirePackage{amsthm}
\RequirePackage{graphicx}
\RequirePackage{booktabs}
\RequirePackage{listings}
\RequirePackage{titlesec}

\titleformat{\chapter}[display]
  {\normalfont\bfseries\unbloated@font{heading-size-1}{line-height-heading}}
  {\chaptertitlename\ \thechapter}{\UnbloatedToken{space-3}}{}
\titlespacing*{\chapter}{0pt}{\UnbloatedToken{space-5}}{\UnbloatedToken{space-4}}
\titleformat{\section}
  {\normalfont\bfseries\unbloated@font{heading-size-2}{line-height-heading}}
  {\thesection}{\UnbloatedToken{space-2}}{}
\titleformat{\subsection}
  {\normalfont\bfseries\unbloated@font{heading-size-3}{line-height-heading}}
  {\thesubsection}{\UnbloatedToken{space-2}}{}
\titleformat{\subsubsection}
  {\normalfont\bfseries\unbloated@font{heading-size-4}{line-height-heading}}
  {\thesubsubsection}{\UnbloatedToken{space-2}}{}
\titleformat{\paragraph}[runin]
  {\normalfont\bfseries\unbloated@font{heading-size-5}{line-height-heading}}
  {\theparagraph}{\UnbloatedToken{space-2}}{}
\titleformat{\subparagraph}[runin]
  {\normalfont\bfseries\unbloated@font{heading-size-6}{line-height-heading}}
  {\thesubparagraph}{\UnbloatedToken{space-2}}{}
\titlespacing*{\section}{0pt}{\UnbloatedToken{space-4}}{\UnbloatedToken{space-2}}
\titlespacing*{\subsection}{0pt}{\UnbloatedToken{space-4}}{\UnbloatedToken{space-2}}
\titlespacing*{\subsubsection}{0pt}{\UnbloatedToken{space-4}}{\UnbloatedToken{space-2}}
\titlespacing*{\paragraph}{0pt}{\UnbloatedToken{space-4}}{\UnbloatedToken{space-2}}
\titlespacing*{\subparagraph}{0pt}{\UnbloatedToken{space-4}}{\UnbloatedToken{space-2}}
\setlength{\tabcolsep}{\UnbloatedToken{space-2}}
\setlength{\heavyrulewidth}{\UnbloatedToken{border-width}}
\setlength{\lightrulewidth}{\UnbloatedToken{border-width}}

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
  basicstyle=\normalsize\ttfamily,
  keywordstyle=\bfseries,
  commentstyle=\itshape\color{unbloat-color-muted},
  backgroundcolor=\color{unbloat-color-surface-muted},
  rulecolor=\color{unbloat-color-border},
  numbers=left,
  numberstyle=\scriptsize\ttfamily\color{unbloat-color-muted},
  numbersep=\UnbloatedToken{space-2},
  framesep=\UnbloatedToken{space-2},
  framerule=\UnbloatedToken{border-width},
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
