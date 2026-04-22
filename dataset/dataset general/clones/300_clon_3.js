jQuery.extend({
  // This helper function extracts all query string parameters from the current URL.
  // It returns an object where keys are parameter names and values are their corresponding data.
  // Parameters without an explicit value (e.g., '?debug') will be assigned a boolean 'true'.
  extractUrlParams: function() {
    var parameterBag = {}; // Initialize an empty object to store our findings.
    var fullBrowserUrl = window.location.href; // Get the complete URL string.
    var queryStringDelimiter = fullBrowserUrl.indexOf("?"); // Locate the position of the query string start.

    // If no query string is found or it's just a '?' at the end, return the empty bag.
    if (queryStringDelimiter === -1 || queryStringDelimiter === fullBrowserUrl.length - 1) {
      return parameterBag;
    }

    // Isolate the query string part and split it into individual key-value segments.
    var rawQuerySegment = fullBrowserUrl.substring(queryStringDelimiter + 1);
    var parameterSegments = rawQuerySegment.split("&");

    // Loop through each segment to parse and store the parameter.
    for (var k = 0; k < parameterSegments.length; k++) {
      var currentSegment = parameterSegments[k];
      // Skip any empty segments that might occur from malformed URLs (e.g., '&&').
      if (!currentSegment) continue;

      var valueAssignmentPoint = currentSegment.indexOf("=");
      var paramKey, paramValue;

      if (valueAssignmentPoint === -1) {
        // Handle parameters that exist as flags without an explicit value.
        paramKey = decodeURIComponent(currentSegment);
        paramValue = true; // Assign a boolean true for flag parameters.
      } else {
        // Extract the key and value, then decode them from URL encoding.
        paramKey = decodeURIComponent(currentSegment.substring(0, valueAssignmentPoint));
        paramValue = decodeURIComponent(currentSegment.substring(valueAssignmentPoint + 1));
      }
      parameterBag[paramKey] = paramValue; // Store the key-value pair.
    }
    return parameterBag; // Return the comprehensive list of parameters.
  },

  // This function provides a convenient way to fetch a single URL parameter by its name.
  // It leverages `extractUrlParams` to get all parameters and then accesses the specific one.
  getSpecificUrlParam: function(paramName) {
    var allObtainedParameters = jQuery.extractUrlParams();
    return allObtainedParameters[paramName]; // Returns the value or `undefined` if not found.
  }
});

// The main application logic executes once the entire DOM is ready.
jQuery(function() {
  // Declare all variables upfront for better readability and scope management.
  var requestConfiguration, // Holds all parsed URL parameters.
    gitUserLogin, // GitHub username.
    gitRepositoryName, // GitHub repository name.
    fetchCommitLimit, // Maximum number of commits to retrieve.
    targetBranchRef, // The specific branch to fetch commits from.
    displayContainerElement, // The main DOM element where the widget resides.
    handleApiCommitData; // The function to process and render API responses.

  // Parse all URL parameters into our configuration object.
  requestConfiguration = jQuery.extractUrlParams();

  // Extract specific parameters, providing fallbacks for common alternative names or default values.
  gitUserLogin = requestConfiguration.user || requestConfiguration.username;
  gitRepositoryName = requestConfiguration.repo;
  fetchCommitLimit = requestConfiguration.limit ? parseInt(requestConfiguration.limit, 10) : 10; // Default to 10 commits.
  targetBranchRef = requestConfiguration.branch || 'main'; // Default to the 'main' branch.

  // Identify the target DOM element for displaying the commit widget.
  displayContainerElement = jQuery('#latest-commits-widget');

  // --- Input Validation: Essential Parameters ---
  // If required parameters are missing, display an error message and halt execution.
  if (!gitUserLogin || !gitRepositoryName) {
    displayContainerElement.html(
      '<p style="color: #CC0000; padding: 15px; border: 1px solid #FFCCCC; background-color: #FFF0F0;">' +
      '<strong>Configuration Error:</strong> Missing essential URL parameters. ' +
      'Please provide both a GitHub username (<code>user</code> or <code>username</code>) ' +
      'and a repository name (<code>repo</code>). ' +
      'Example: <code>?user=octocat&repo=Spoon-Knife</code>' +
      '</p>'
    );
    console.error("Critical: GitHub username and repository are mandatory parameters.");
    return; // Exit the function early.
  }

  /*
   * `handleApiCommitData` is a callback function designed to process the JSONP response
   * from the GitHub API. It dynamically constructs and appends commit entries to the DOM.
   */
  handleApiCommitData = function(apiResponse) {
    var receivedCommitEntries = apiResponse.data; // Access the actual array of commit objects.
    var commitHistoryList = jQuery('#commit-history'); // Reference to the `<ul>` element.

    // Clear any previous content in the list before rendering new commits.
    commitHistoryList.empty();

    // Check if the API returned any commit data.
    if (!receivedCommitEntries || receivedCommitEntries.length === 0) {
      commitHistoryList.append('<li><p class="no-commits-message">No commit history found for ' + gitUserLogin + '/' + gitRepositoryName + ' on branch ' + targetBranchRef + '.</p></li>');
      return; // Nothing to render, so return.
    }

    // Iterate over each commit object and generate its HTML representation.
    receivedCommitEntries.forEach(function(currentCommit) {
      // Ensure that the commit object has valid author information to avoid errors.
      if (currentCommit.author && currentCommit.commit && currentCommit.commit.committer) {
        var commitDisplayHtml =
          '<li class="commit-entry-item clearfix">' +
          '  <div class="commit-avatar-wrapper left">' +
          '    <img class="commit-author-avatar" src="' + currentCommit.author.avatar_url + '" alt="Author Avatar" width="48" height="48">' +
          '  </div>' +
          '  <div class="commit-details-panel left">' +
          '    <a href="https://github.com/' + currentCommit.author.login + '" class="commit-author-link" target="_blank" rel="noopener noreferrer">' +
          '      <strong class="commit-author-name">' + currentCommit.author.login + '</strong>' +
          '    </a>' +
          '    <br />' +
          '    <span class="commit-timestamp">' + (jQuery.relativeTime(currentCommit.commit.committer.date)) + '</span>' +
          '    <br />' +
          '    <span class="commit-sha-id">SHA: ' + currentCommit.sha.substring(0, 8) + '</span>' + // Display a truncated SHA.
          '    <br />' +
          '    <a class="commit-message-link" href="https://github.com/' + gitUserLogin + '/' + gitRepositoryName + '/commit/' + currentCommit.sha + '" target="_blank" rel="noopener noreferrer">' +
          '      ' + currentCommit.commit.message +
          '    </a>' +
          '  </div>' +
          '</li>';
        commitHistoryList.append(commitDisplayHtml); // Add the generated HTML to the list.
      } else {
        console.warn("Skipping a commit entry due to incomplete data (missing author or committer info):", currentCommit);
      }
    });
  };

  // Update the widget's title to reflect the currently displayed repository.
  displayContainerElement.find('h4').text("Recent Activity for " + gitUserLogin + "/" + gitRepositoryName);

  // Construct the base URL for the GitHub Commits API endpoint.
  var githubApiEndpoint = "https://api.github.com/repos/" + gitUserLogin + "/" + gitRepositoryName + "/commits";
  // Append the JSONP callback parameter, which GitHub's API expects.
  githubApiEndpoint += "?callback=handleApiCommitData";

  // If a specific branch other than 'main' is requested, add it to the API URL.
  if (targetBranchRef && targetBranchRef !== 'main') {
    githubApiEndpoint += "&sha=" + targetBranchRef;
  }

  // Initiate the AJAX request to the GitHub API.
  jQuery.ajax(githubApiEndpoint, {
      data: {
        per_page: fetchCommitLimit // Specify the desired number of commits per page.
      },
      dataType: "jsonp", // Crucial for cross-domain requests.
      type: "GET", // Use the HTTP GET method.
      cache: false // Prevent browser caching of API responses.
    })
    .done(function(apiResponseObject) {
      // On successful retrieval, pass the response to our processing function.
      handleApiCommitData(apiResponseObject);
    })
    .fail(function(jqXHR, statusText, errorThrown) {
      // Handle any AJAX request failures. Display an error message to the user.
      displayContainerElement.find('#commit-history').html(
        '<li style="color: #CC0000; padding: 10px;">' +
        'Failed to retrieve commit data. Please verify the GitHub username, repository name, and branch. ' +
        '(Status: ' + statusText + ')</li>'
      );
      console.error("AJAX request to GitHub API failed:", statusText, errorThrown, jqXHR);
    })
    .always(function() {
      // This block executes regardless of success or failure.
      // Useful for cleaning up loaders or logging completion.
      console.info("GitHub API request cycle completed.");
    });
});

/*
 * jQuery Plugin: 'relativeTime' (An evolved timeago clone)
 * This plugin intelligently formats timestamps into user-friendly relative descriptions
 * (e.g., "5 minutes ago", "about 1 day ago") and keeps them updated.
 *
 * @version 0.12.1 - Further enhanced and refactored from original timeago.
 * @author Original concept by Ryan McGeary; significant modifications by a Code Clone Expert.
 * @license MIT License - http://opensource.org/licenses/MIT
 * @requires jQuery v1.7+ (Modernized requirement from original)
 */
(function(jq) { // Using 'jq' as an alias for jQuery to prevent conflicts and for distinct naming.

  // The primary function of the plugin: converts a given timestamp into a relative time string.
  jq.relativeTime = function(timeInput) {
    // Determine the nature of the input and call the appropriate parsing/formatting logic.
    if (timeInput instanceof Date) {
      return presentTimeAsWords(timeInput);
    } else if (typeof timeInput === "string") {
      return presentTimeAsWords(jq.relativeTime.parseTimeValue(timeInput));
    } else {
      // Assume the input is a DOM element or jQuery object wrapping one.
      return presentTimeAsWords(jq.relativeTime.extractTimeFromElement(timeInput));
    }
  };

  // Create a shorthand reference to the plugin's core object for internal use.
  var _rtCore = jq.relativeTime;

  // Extend the `relativeTime` object with configuration settings and utility functions.
  jq.extend(jq.relativeTime, {
    // Default configuration options for how relative times are generated.
    options: {
      refreshIntervalMillis: 65000, // How often (in ms) to re-evaluate and update displayed times.
      allowFutureDates: false, // Set to true to display "from now" phrases.
      languageStrings: {
        prefixEarlier: null,
        prefixLater: null,
        suffixEarlier: "ago",
        suffixLater: "from now",
        momentarily: "just now", // Renamed from 'less than a minute'.
        singleMinute: "about a minute",
        multipleMinutes: "%d minutes",
        singleHour: "about an hour",
        multipleHours: "about %d hours",
        singleDay: "a day",
        multipleDays: "%d days",
        singleMonth: "about a month",
        multipleMonths: "%d months",
        singleYear: "about a year",
        multipleYears: "%d years",
        wordDelimiter: " ", // Character used to join parts of the phrase (e.g., "5 minutes ago").
        numericReplacements: [] // Array for custom number display, e.g., for different numeral systems.
      }
    },

    // Core logic: transforms a time difference (in milliseconds) into a human-readable phrase.
    formatTimeDifference: function(deltaMillis) {
      var currentLang = this.options.languageStrings; // Shortcut to localized strings.
      var initialPrefix = currentLang.prefixEarlier;
      var initialSuffix = currentLang.suffixEarlier;

      // Adjust prefix and suffix if future dates are allowed and the delta is negative.
      if (this.options.allowFutureDates) {
        if (deltaMillis < 0) {
          initialPrefix = currentLang.prefixLater;
          initialSuffix = currentLang.suffixLater;
        }
      }

      // Calculate absolute time units from the milliseconds difference.
      var secondsAbs = Math.abs(deltaMillis) / 1000;
      var minutesAbs = secondsAbs / 60;
      var hoursAbs = minutesAbs / 60;
      var daysAbs = hoursAbs / 24;
      var yearsAbs = daysAbs / 365.25; // Account for leap years for better accuracy.

      // Internal helper for injecting numbers into localized string templates.
      function insertNumberIntoTemplate(templateStrOrFunc, numVal) {
        var finalStr = jq.isFunction(templateStrOrFunc) ? templateStrOrFunc(numVal, deltaMillis) : templateStrOrFunc;
        var displayNum = (currentLang.numericReplacements && currentLang.numericReplacements[numVal]) || numVal;
        return finalStr.replace(/%d/i, displayNum);
      }

      // Select the most appropriate descriptive phrase based on the time difference.
      var chosenPhrase =
        secondsAbs < 45 && insertNumberIntoTemplate(currentLang.momentarily, Math.round(secondsAbs)) ||
        secondsAbs < 90 && insertNumberIntoTemplate(currentLang.singleMinute, 1) ||
        minutesAbs < 45 && insertNumberIntoTemplate(currentLang.multipleMinutes, Math.round(minutesAbs)) ||
        minutesAbs < 90 && insertNumberIntoTemplate(currentLang.singleHour, 1) ||
        hoursAbs < 24 && insertNumberIntoTemplate(currentLang.multipleHours, Math.round(hoursAbs)) ||
        hoursAbs < 42 && insertNumberIntoTemplate(currentLang.singleDay, 1) ||
        daysAbs < 30 && insertNumberIntoTemplate(currentLang.multipleDays, Math.round(daysAbs)) ||
        daysAbs < 45 && insertNumberIntoTemplate(currentLang.singleMonth, 1) ||
        daysAbs < 365 && insertNumberIntoTemplate(currentLang.multipleMonths, Math.round(daysAbs / 30)) ||
        yearsAbs < 1.5 && insertNumberIntoTemplate(currentLang.singleYear, 1) ||
        insertNumberIntoTemplate(currentLang.multipleYears, Math.round(yearsAbs));

      var joinChar = (currentLang.wordDelimiter === undefined || currentLang.wordDelimiter === null) ? " " : currentLang.wordDelimiter;
      // Combine prefix, phrase, and suffix, filtering out any nulls, then trim whitespace.
      return jq.trim([initialPrefix, chosenPhrase, initialSuffix].filter(Boolean).join(joinChar));
    },

    // Parses an ISO 8601 formatted date string into a JavaScript Date object.
    parseTimeValue: function(iso8601String) {
      if (!iso8601String) return new Date(NaN); // Return an invalid date for empty input.
      var cleanedIsoString = jq.trim(iso8601String);
      cleanedIsoString = cleanedIsoString.replace(/\.\d{3,}/, ""); // Remove milliseconds, e.g., ".123".
      cleanedIsoString = cleanedIsoString.replace(/-/g, "/"); // Replace all hyphens with slashes for Date constructor compatibility.
      cleanedIsoString = cleanedIsoString.replace(/T/, " ").replace(/Z/, " UTC"); // Normalize 'T' and 'Z' for UTC.
      cleanedIsoString = cleanedIsoString.replace(/([\+\-]\d{2})\:?(\d{2})/, " $1$2"); // Standardize timezone format.
      return new Date(cleanedIsoString);
    },

    // Extracts a datetime string from a DOM element's `datetime` or `title` attributes.
    extractTimeFromElement: function(domElement) {
      var wrappedElement = jq(domElement);
      // Check if it's an HTML5 <time> element by its tag name.
      var isHtml5TimeTag = wrappedElement.get(0) && wrappedElement.get(0).tagName.toLowerCase() === "time";
      var dateTimeAttribute = isHtml5TimeTag ? wrappedElement.attr("datetime") : wrappedElement.attr("title");

      // Fallback: if no specific attribute is found, attempt to parse the element's text content.
      if (!dateTimeAttribute) {
        dateTimeAttribute = wrappedElement.text();
      }
      return _rtCore.parseTimeValue(dateTimeAttribute);
    }
  });

  // jQuery plugin method: applies relative time formatting to a collection of elements.
  jq.fn.relativeTime = function() {
    var elementCollection = this; // Store reference to the jQuery collection.
    elementCollection.each(updateSingleElementTime); // Perform an initial update for all matched elements.

    // If a refresh interval is configured, set up a recurring timer to update times.
    var currentOptions = _rtCore.options;
    if (currentOptions.refreshIntervalMillis > 0) {
      setInterval(function() {
        elementCollection.each(updateSingleElementTime);
      }, currentOptions.refreshIntervalMillis);
    }
    return elementCollection; // Enable jQuery method chaining.
  };

  // Private helper function to update the relative time display for a single DOM element.
  function updateSingleElementTime() {
    var elementCachedData = retrieveAndCacheElementTime(this);
    // Only proceed if a valid date was successfully parsed and cached.
    if (!isNaN(elementCachedData.parsedDate)) {
      jq(this).text(presentTimeAsWords(elementCachedData.parsedDate));
    }
    return this;
  }

  // Private helper function to parse and cache datetime information for an element.
  function retrieveAndCacheElementTime(domNode) {
    var wrappedNode = jq(domNode);
    var storedTimeData = wrappedNode.data("relativeTimeCache"); // Use a distinct data key.

    if (!storedTimeData) {
      // If no cached data exists, parse the date and store it.
      var parsedDateObj = _rtCore.extractTimeFromElement(wrappedNode);
      storedTimeData = { parsedDate: parsedDateObj };
      wrappedNode.data("relativeTimeCache", storedTimeData);

      // If the element has text content but no `title` or `datetime` attribute,
      // move its text to the `title` for consistency and accessibility.
      var elementText = jq.trim(wrappedNode.text());
      if (elementText.length > 0 && !wrappedNode.attr("title") && !wrappedNode.attr("datetime")) {
        wrappedNode.attr("title", elementText);
      }
    }
    return storedTimeData;
  }

  // Private utility to calculate the time difference and format it into words.
  function presentTimeAsWords(dateObject) {
    var currentTime = new Date();
    var timeDifferenceInMilliseconds = currentTime.getTime() - dateObject.getTime();
    return _rtCore.formatTimeDifference(timeDifferenceInMilliseconds);
  }

  // IE compatibility fix: Ensure HTML5 elements like <abbr> and <time> are recognized.
  // This is primarily for very old Internet Explorer versions.
  if (typeof document.createElement === 'function') {
    document.createElement("abbr");
    document.createElement("time");
  }

}(jQuery)); // End of the IIFE, passing jQuery.