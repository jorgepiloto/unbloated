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
\RequirePackage{fancyhdr}
\RequirePackage[titles]{tocloft}
\RequirePackage{mdframed}
\RequirePackage{array}
\RequirePackage{caption}
\RequirePackage{threeparttable}

% Length registers keep numeric token values safe when multiplying dimensions.
\newlength{\unbloated@bodyunit}
\setlength{\unbloated@bodyunit}{\UnbloatedToken{font-size}}
\newlength{\unbloated@ruleunit}
\setlength{\unbloated@ruleunit}{\UnbloatedToken{border-width}}

\newcommand{\unbloated@headingbox}[2]{%
  \begingroup
  \setlength{\fboxsep}{\UnbloatedToken{space-3}}%
  \colorbox{unbloat-color-inverse-surface}{%
    \parbox{\dimexpr\linewidth-2\fboxsep\relax}{%
      \color{unbloat-color-inverse-text}\RaggedRight
      #1#2\par
    }%
  }%
  \endgroup
}
\newcommand{\unbloated@chapterheading}[1]{%
  \unbloated@headingbox{%
    \if@mainmatter\ifnum\c@secnumdepth>\m@ne
      {\normalfont\unbloated@font{font-size}{line-height-heading}%
        \chaptertitlename\ \thechapter\par}%
      \vspace{\UnbloatedToken{space-2}}%
    \fi\fi
  }{#1}%
}
\newcommand{\unbloated@sectionheading}[1]{%
  \unbloated@headingbox{}{%
    \ifnum\c@secnumdepth>\z@\thesection\hspace{\UnbloatedToken{space-2}}\fi
    #1}%
}

\titleformat{\chapter}[block]
  {\normalfont\bfseries\unbloated@font{heading-size-1}{line-height-heading}}
  {}{0pt}{\unbloated@chapterheading}
\titleformat{name=\chapter,numberless}[block]
  {\normalfont\bfseries\unbloated@font{heading-size-1}{line-height-heading}}
  {}{0pt}{\unbloated@headingbox{}}
\titlespacing*{\chapter}{0pt}{0pt}{\UnbloatedToken{space-5}}
\titleformat{\section}[block]
  {\normalfont\bfseries\unbloated@font{heading-size-2}{line-height-heading}}
  {}{0pt}{\unbloated@sectionheading}
\titleformat{name=\section,numberless}[block]
  {\normalfont\bfseries\unbloated@font{heading-size-2}{line-height-heading}}
  {}{0pt}{\unbloated@headingbox{}}
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

\newcommand{\unbloated@title}{%
  \vspace*{\UnbloatedToken{space-5}}%
  {\normalfont\bfseries\unbloated@font{heading-size-1}{line-height-heading}%
    \unbloated@headingbox{}{\@title}\par}%
  \vspace{\UnbloatedToken{space-5}}%
  {\normalfont\normalsize
    \begin{tabular}[t]{@{}l@{}}\@author\end{tabular}\par}%
  \ifx\@date\@empty\else
    \vspace{\UnbloatedToken{space-3}}\@date\par
  \fi
}
\renewcommand{\maketitle}{%
  \if@titlepage\begin{titlepage}\else\par\begingroup\thispagestyle{plain}\fi
    \renewcommand{\thefootnote}{\@fnsymbol\c@footnote}%
    \let\footnoterule\relax
    \let\footnote\thanks
    \unbloated@title
    \@thanks
  \if@titlepage\vfill\end{titlepage}\else\endgroup\fi
  \setcounter{footnote}{0}%
  \global\let\@thanks\@empty
}

\setlength{\headheight}{2\unbloated@bodyunit}
\fancypagestyle{unbloated}{%
  \fancyhf{}%
  \fancyhead[L]{\normalfont\unbloated@font{font-size}{line-height-heading}%
    \nouppercase{\leftmark}}%
  \if@twoside
    \fancyfoot[LE,RO]{\normalfont\normalsize\thepage}%
  \else
    \fancyfoot[R]{\normalfont\normalsize\thepage}%
  \fi
  \renewcommand{\headrulewidth}{\UnbloatedToken{border-width}}%
  \renewcommand{\footrulewidth}{0pt}%
}
\fancypagestyle{plain}{%
  \fancyhf{}%
  \if@twoside
    \fancyfoot[LE,RO]{\normalfont\normalsize\thepage}%
  \else
    \fancyfoot[R]{\normalfont\normalsize\thepage}%
  \fi
  \renewcommand{\headrulewidth}{0pt}%
  \renewcommand{\footrulewidth}{0pt}%
}
\pagestyle{unbloated}
\renewcommand{\chaptermark}[1]{%
  \markboth{\if@mainmatter\ifnum\c@secnumdepth>\m@ne
    \thechapter\quad\fi\fi #1}{}%
}
% Flush real content before changing the style of inserted blank versos.
\let\unbloated@cleardoublepage\cleardoublepage
\renewcommand{\cleardoublepage}{%
  \clearpage{\pagestyle{empty}\unbloated@cleardoublepage}%
}

\setlength{\cftparskip}{0pt}
\renewcommand{\cfttocprehook}{\begingroup\microtypesetup{expansion=false}}
\renewcommand{\cfttocposthook}{\endgroup}
\setlength{\cftbeforechapskip}{\UnbloatedToken{space-3}}
\setlength{\cftbeforesecskip}{\UnbloatedToken{space-1}}
\setlength{\cftbeforesubsecskip}{\UnbloatedToken{space-1}}
\setlength{\cftchapnumwidth}{3\unbloated@bodyunit}
\setlength{\cftsecindent}{\UnbloatedToken{space-3}}
\setlength{\cftsecnumwidth}{4\unbloated@bodyunit}
\setlength{\cftsubsecindent}{\UnbloatedToken{space-5}}
\setlength{\cftsubsecnumwidth}{5\unbloated@bodyunit}
\renewcommand{\cftdotsep}{\cftnodots}
\renewcommand{\cftchapfont}{\normalfont\bfseries}
\renewcommand{\cftchappagefont}{\normalfont\bfseries}
\renewcommand{\cftsecfont}{\normalfont}
\cftsetpnumwidth{3\unbloated@bodyunit}
\cftsetrmarg{4\unbloated@bodyunit plus 1fil}

\setlength{\tabcolsep}{\UnbloatedToken{space-2}}
\setlength{\extrarowheight}{\UnbloatedToken{space-1}}
\setlength{\heavyrulewidth}{\UnbloatedToken{border-width}}
\setlength{\lightrulewidth}{\UnbloatedToken{border-width}}
\DeclareCaptionFont{unbloated}{\normalfont\normalsize}
\captionsetup{
  font=unbloated,
  labelfont=bf,
  justification=raggedright,
  singlelinecheck=false,
  skip=\UnbloatedToken{space-2}
}

\numberwithin{equation}{chapter}
\newtheoremstyle{unbloated}
  {\UnbloatedToken{space-2}}{\UnbloatedToken{space-2}}
  {\normalfont}{0pt}{\bfseries}{.}{\UnbloatedToken{space-2}}{}
\theoremstyle{unbloated}
\newtheorem{theorem}{Theorem}[chapter]
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{proposition}[theorem]{Proposition}
\newtheorem{corollary}[theorem]{Corollary}
\newtheorem{example}[theorem]{Example}
\newtheorem*{remark}{Remark}
\newtheoremstyle{unbloated-callout}
  {\UnbloatedToken{space-2}}{\UnbloatedToken{space-2}}
  {\normalfont}{0pt}{\bfseries}{}{\UnbloatedToken{space-2}}
  {\parbox[t]{\linewidth}{\RaggedRight\strut
    \thmname{#1}\thmnumber{ #2}\thmnote{ {\normalfont(#3)}}.\strut}}
\theoremstyle{unbloated-callout}
\newtheorem{definition}[theorem]{Definition}
\newtheorem{exercise}{Exercise}[chapter]
\theoremstyle{unbloated}

\newmdenv[
  hidealllines=true,
  leftline=true,
  linewidth=3\unbloated@ruleunit,
  linecolor=unbloat-color-border,
  backgroundcolor=unbloat-color-surface,
  fontcolor=unbloat-color-text,
  startinnercode=\raggedright,
  skipabove=\UnbloatedToken{space-3},
  skipbelow=\UnbloatedToken{space-3},
  innerleftmargin=\UnbloatedToken{space-3},
  innerrightmargin=0pt,
  innertopmargin=\UnbloatedToken{space-2},
  innerbottommargin=\UnbloatedToken{space-2},
  splittopskip=\UnbloatedToken{space-2},
  splitbottomskip=\UnbloatedToken{space-2}
]{unbloated@callout}
\AddToHook{env/definition/before}{\begin{unbloated@callout}}
\AddToHook{env/definition/after}{\end{unbloated@callout}}
\AddToHook{env/exercise/before}{\begin{unbloated@callout}}
\AddToHook{env/exercise/after}{\end{unbloated@callout}}

\lstset{
  basicstyle=\normalsize\ttfamily,
  keywordstyle=\bfseries,
  commentstyle=\itshape\color{unbloat-color-muted},
  backgroundcolor=\color{unbloat-color-surface-muted},
  rulecolor=\color{unbloat-color-border},
  numbers=left,
  numberstyle=\normalsize\ttfamily\color{unbloat-color-muted},
  numbersep=\UnbloatedToken{space-2},
  xleftmargin=\dimexpr3\unbloated@bodyunit+\UnbloatedToken{space-2}+\UnbloatedToken{border-width}\relax,
  xrightmargin=\dimexpr\UnbloatedToken{space-2}+\UnbloatedToken{border-width}\relax,
  framexleftmargin=3\unbloated@bodyunit,
  framesep=\UnbloatedToken{space-2},
  framerule=\UnbloatedToken{border-width},
  frame=single,
  breaklines=true,
  columns=fullflexible,
  keepspaces=true,
  showstringspaces=false,
  captionpos=b,
  aboveskip=\UnbloatedToken{space-3},
  belowskip=\UnbloatedToken{space-3}
}
\captionsetup[lstlisting]{margin=0pt}

\RequirePackage{hyperref}
\hypersetup{hidelinks,bookmarksnumbered}

\endinput
