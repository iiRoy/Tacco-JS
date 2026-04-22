// Helper for extracting URL parameters from the current page's address
jQuery.extend({
  extractQueryData: function() {
    let segment, segments, idx, parameters;
    parameters = [];
    segment = undefined;
    segments = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
    idx = 0;
    while (idx < segments.length) {
      segment = segments[idx].split("=");
      parameters.push(segment[0]);
      parameters[segment[0]] = segment[1];
      idx++;
    }
    return parameters;
  },
  obtainUrlParameter: function(paramIdentifier) {
    return jQuery.extractQueryData()[paramIdentifier];
  }
});

// Execute when the DOM is fully loaded and ready
jQuery(function() {
  let codeLine, dataProcessor, displayElement, recordCount, inputParameters, repositoryName, requestAddress, userLogin;

  inputParameters = jQuery.extractQueryData();
  userLogin = inputParameters.username;
  repositoryName = inputParameters.repo;
  recordCount = inputParameters.limit;
  codeLine = inputParameters.branch;
  displayElement = jQuery('#latest-commits-widget');

  dataProcessor = function(apiResponse) {
    let entryIndex, dataEntries, commitRecord, displayList, loopOutcomes;

    dataEntries = apiResponse.data;
    displayList = jQuery('#history-display');
    displayList.empty();
    loopOutcomes = [];

    for (entryIndex in dataEntries) {
      commitRecord = dataEntries[entryIndex];
      loopOutcomes.push((function(currentIndex, currentRecord) {
        if (currentRecord.author != null) {
          return displayList.append(
            "<li class=\"item-cleared\">\n" +
            "  <div class=\"left-side\">\n" +
            "    <img class=\"contributor-pic\" src=\"" + currentRecord.author.avatar_url + "\">\n" +
            "  </div>\n" +
            "  <div class=\"contributor-details left-side\">\n" +
            "      <a href=\"https://github.com/" + currentRecord.author.login + "\"><b class=\"contributor-alias\">" + currentRecord.author.login + "</b></a>\n" +
            "      <br />\n" +
            "      <b class=\"change-date\">" + (jQuery.relativeTime(currentRecord.commit.committer.date)) + "</b><br /><i class=\"change-hash\">SHA: " + currentRecord.sha + "</i>\n" +
            "      <br />\n" +
            "      <a class=\"change-message\" href=\"https://github.com/" + userLogin + "/" + repositoryName + "/commit/" + currentRecord.sha + "\" target=\"_blank\">" + currentRecord.commit.message + "</a>\n" +
            "  </div>\n" +
            "</li>"
          );
        }
      })(entryIndex, commitRecord));
    }
    return loopOutcomes;
  };

  displayElement.find('h4').text("Recent Changes for " + userLogin + "/" + repositoryName);
  requestAddress = "https://api.github.com/repos/" + userLogin + "/" + repositoryName + "/commits?callback=dataProcessor";
  if (inputParameters.branch != null) {
    requestAddress += "&sha=" + codeLine;
  }

  return jQuery.ajax(requestAddress, {
    data: {
      recordsPerPage: recordCount
    },
    dataType: "jsonp",
    type: "get"
  }).done(function(apiResponse) {
    return dataProcessor(apiResponse);
  });
});

/**
 * A jQuery plugin that provides automatically updating fuzzy timestamps,
 * e.g., "5 minutes ago" or "about 1 day from now".
 * This utility helps in displaying human-friendly time differences.
 */
(function(jq) {
  jq.relativeTime = function(momentValue) {
    if (momentValue instanceof Date) {
      return formatRelativeLocally(momentValue);
    } else if (typeof momentValue === "string") {
      return formatRelativeLocally(jq.relativeTime.decodeDate(momentValue));
    } else {
      return formatRelativeLocally(jq.relativeTime.fetchStamp(momentValue));
    }
  };
  let $rt = jq.relativeTime;

  jq.extend(jq.relativeTime, {
    preferences: {
      autoRefreshMs: 60000,
      canShowFuture: false,
      messages: {
        pastPrefix: null,
        futurePrefix: null,
        agoSuffix: "ago",
        nowSuffix: "from now",
        secText: "less than a minute",
        minText: "about a minute",
        minsText: "%d minutes",
        hrText: "about an hour",
        hrsText: "%d hours",
        dyText: "a day",
        dysText: "%d days",
        mthText: "about a month",
        mthsText: "%d months",
        yrText: "about a year",
        yrsText: "%d years",
        textSpacer: " ",
        digitMappings: []
      }
    },
    formatRelative: function(elapsedMilliseconds) {
      let $lbs = this.preferences.messages;
      let displayPrefix = $lbs.pastPrefix;
      let displaySuffix = $lbs.agoSuffix;
      if (this.preferences.canShowFuture) {
        if (elapsedMilliseconds < 0) {
          displayPrefix = $lbs.futurePrefix;
          displaySuffix = $lbs.nowSuffix;
        }
      }

      let diffSeconds = Math.abs(elapsedMilliseconds) / 1000;
      let diffMinutes = diffSeconds / 60;
      let diffHours = diffMinutes / 60;
      let diffDays = diffHours / 24;
      let diffYears = diffDays / 365;

      function replacePlaceholder(formatter, count) {
        let template = jq.isFunction(formatter) ? formatter(count, elapsedMilliseconds) : formatter;
        let replValue = ($lbs.digitMappings && $lbs.digitMappings[count]) || count;
        return template.replace(/%d/i, replValue);
      }

      let timePhrase = diffSeconds < 45 && replacePlaceholder($lbs.secText, Math.round(diffSeconds)) ||
        diffSeconds < 90 && replacePlaceholder($lbs.minText, 1) ||
        diffMinutes < 45 && replacePlaceholder($lbs.minsText, Math.round(diffMinutes)) ||
        diffMinutes < 90 && replacePlaceholder($lbs.hrText, 1) ||
        diffHours < 24 && replacePlaceholder($lbs.hrsText, Math.round(diffHours)) ||
        diffHours < 42 && replacePlaceholder($lbs.dyText, 1) ||
        diffDays < 30 && replacePlaceholder($lbs.dysText, Math.round(diffDays)) ||
        diffDays < 45 && replacePlaceholder($lbs.mthText, 1) ||
        diffDays < 365 && replacePlaceholder($lbs.mthsText, Math.round(diffDays / 30)) ||
        diffYears < 1.5 && replacePlaceholder($lbs.yrText, 1) ||
        replacePlaceholder($lbs.yrsText, Math.round(diffYears));

      let phraseSeparator = $lbs.textSpacer === undefined ?  " " : $lbs.textSpacer;
      return jq.trim([displayPrefix, timePhrase, displaySuffix].join(phraseSeparator));
    },
    decodeDate: function(standardDate) {
      let workingString = jq.trim(standardDate);
      workingString = workingString.replace(/\.\d\d\d+/,""); // discard milliseconds
      workingString = workingString.replace(/-/,"/").replace(/-/,"/");
      workingString = workingString.replace(/T/," ").replace(/Z/," UTC");
      workingString = workingString.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
      return new Date(workingString);
    },
    fetchStamp: function(targetElement) {
      // jQuery's .is() method may not behave as expected with HTML5 elements in older IE versions
      let isHtmlTime = jq(targetElement).get(0).tagName.toLowerCase() === "time";
      let standardDate = isHtmlTime ? jq(targetElement).attr("datetime") : jq(targetElement).attr("title");
      return $rt.decodeDate(standardDate);
    }
  });

  jq.fn.momentAgo = function() {
    let jqObject = this;
    jqObject.each(updateDisplay);

    let currentPrefs = $rt.preferences;
    if (currentPrefs.autoRefreshMs > 0) {
      setInterval(function() { jqObject.each(updateDisplay); }, currentPrefs.autoRefreshMs);
    }
    return jqObject;
  };

  function updateDisplay() {
    let storedData = setupElementData(this);
    if (!isNaN(storedData.datetime)) {
      jq(this).text(formatRelativeLocally(storedData.datetime));
    }
    return this;
  }

  function setupElementData(domElement) {
    domElement = jq(domElement);
    if (!domElement.data("relativeTime")) {
      domElement.data("relativeTime", { datetime: $rt.fetchStamp(domElement) });
      let nodeContent = jq.trim(domElement.text());
      if (nodeContent.length > 0) {
        domElement.attr("title", nodeContent);
      }
    }
    return domElement.data("relativeTime");
  }

  function formatRelativeLocally(inputDate) {
    return $rt.formatRelative(calculateDifference(inputDate));
  }

  function calculateDifference(targetDate) {
    return (new Date().getTime() - targetDate.getTime());
  }

  // Compatibility fix for older browsers to recognize HTML5 elements
  document.createElement("abbr");
  document.createElement("time");
}(jQuery));