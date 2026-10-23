var summaryInclude = 60;
var fuseOptions = {
  shouldSort: true,
  includeMatches: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  minMatchCharLength: 1,
  keys: [
    { name: "title", weight: 0.8 },
    { name: "contents", weight: 0.5 },
    { name: "tags", weight: 0.3 },
    { name: "categories", weight: 0.3 },
  ],
};

var searchQuery = param("s");
if (searchQuery) {
  document.getElementById("search-query").value = searchQuery;
  executeSearch(searchQuery);
} else {
  document.getElementById("search-results").innerHTML =
    "<p>Please enter a word or phrase above</p>";
}

function executeSearch(query) {
  fetch("/index.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var fuse = new Fuse(data, fuseOptions);
      var result = fuse.search(query);
      if (result.length > 0) {
        populateResults(result);
      } else {
        document.getElementById("search-results").innerHTML =
          "<p>No matches found</p>";
      }
    })
    .catch(function () {
      document.getElementById("search-results").innerHTML =
        "<p>Could not load search index.</p>";
    });
}

function populateResults(result) {
  var container = document.getElementById("search-results");
  result.forEach(function (value, key) {
    var contents = value.item.contents;
    var snippet = "";
    var snippetHighlights = [];

    value.matches.forEach(function (mvalue) {
      if (mvalue.key === "tags" || mvalue.key === "categories") {
        if (mvalue.value) snippetHighlights.push(mvalue.value);
      } else if (mvalue.key === "contents") {
        var start =
          mvalue.indices[0][0] - summaryInclude > 0
            ? mvalue.indices[0][0] - summaryInclude
            : 0;
        var end =
          mvalue.indices[0][1] + summaryInclude < contents.length
            ? mvalue.indices[0][1] + summaryInclude
            : contents.length;
        snippet += contents.substring(start, end);
        if (mvalue.value) {
          snippetHighlights.push(
            mvalue.value.substring(
              mvalue.indices[0][0],
              mvalue.indices[0][1] + 1,
            ),
          );
        }
      }
    });

    if (snippet.length < 1) {
      snippet += contents.substring(0, summaryInclude * 2);
    }

    var templateDefinition = document.getElementById(
      "search-result-template",
    ).innerHTML;
    var output = render(templateDefinition, {
      key: key,
      title: value.item.title,
      link: value.item.permalink,
      tags: value.item.tags,
      categories: value.item.categories,
      snippet: snippet,
    });
    container.insertAdjacentHTML("beforeend", output);

    var summaryEl = document.getElementById("summary-" + key);
    if (summaryEl) {
      var markInstance = new Mark(summaryEl);
      snippetHighlights.forEach(function (snipValue) {
        markInstance.mark(snipValue);
      });
    }
  });
}

function param(name) {
  return decodeURIComponent(
    (location.search.split(name + "=")[1] || "").split("&")[0],
  ).replace(/\+/g, " ");
}

function render(templateString, data) {
  var conditionalPattern = /\$\{\s*isset ([a-zA-Z]*)\s*\}(.*)\$\{\s*end\s*}/g;
  var copy = templateString;
  var conditionalMatches;
  while (
    (conditionalMatches = conditionalPattern.exec(templateString)) !== null
  ) {
    if (data[conditionalMatches[1]]) {
      copy = copy.replace(conditionalMatches[0], conditionalMatches[2]);
    } else {
      copy = copy.replace(conditionalMatches[0], "");
    }
  }
  templateString = copy;
  for (var key in data) {
    var find = "\\$\\{\\s*" + key + "\\s*\\}";
    var re = new RegExp(find, "g");
    templateString = templateString.replace(re, data[key]);
  }
  return templateString;
}
