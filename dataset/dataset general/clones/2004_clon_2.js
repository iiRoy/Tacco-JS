debugEnabled = !false; /* Flag indicating whether debugging messages should be printed to the console */

/**
 * Outputs a message to the developer console if debugging is enabled.
 * @param {string} messageContent - The text message to log.
 */
function outputDebugMsg(messageContent) {
  const currentBrowserWindow = window; // Reference to the global window object
  const devToolsConsole = currentBrowserWindow.console; // Reference to the console object
  if (devToolsConsole && debugEnabled) {
    devToolsConsole.log(messageContent);
  }
}

/* --- URL query string parsing utility --- */
/**
 * Extracts a specific parameter's value from the current URL's query string.
 * @param {string} parameterKey - The name of the query parameter to search for.
 * @returns {string} The decoded value of the parameter, or an empty string if not found.
 */
function extractUrlParameter(parameterKey) {
  const regexPatternObject = new RegExp("[\\?&]" + parameterKey + "=([^&#]*)", "i");
  const parentWindow = parent; // Access the parent window object
  const foundParameterValue = regexPatternObject.exec(parentWindow.location.search);
  return (foundParameterValue) ? decodeURIComponent(foundParameterValue[1]) : String();
}

jQuery(document).ready(function() {
  const currentDocument = document; // Local reference to the document object

  let operationalMode = 'complete';
  /*
   * Operational Modes:
   * 'complete': Displays detailed outcomes for all successful and failed test scenarios.
   * 'segment': Presents a concise listing of generated CSS classes for each evaluated user agent.
   * 'produce': Generates a new JavaScript array containing user agent strings and their corresponding classes upon test completion.
   */

  let successfulTestCount = 0; // Running tally of tests that passed
  let failedTestTally = (0); // Running count of tests that did not pass
  let accumulatedOutputHtml = String(); // String builder for the HTML output
  const htmlDocRoot = currentDocument.documentElement; // Direct reference to the <html> element

  const browserInfoDisplayBlock = `<h1><div class='agent_info'>Current User Agent: ${window.navigator.userAgent}<\/div><div class='produced_styles'>HTML Classes: ${htmlDocRoot.className}<\/div><\/h1>`;

  if (operationalMode === 'complete') {
    htmlDocRoot.className = htmlDocRoot.className + " full_test";
  }
  const totalTestCases = testAgentCollection.length; // Total number of user agent strings to process

  if (operationalMode === 'produce') {
    accumulatedOutputHtml += '<pre>';
  }

  jQuery.each(testAgentCollection, function(caseIndex, currentAgentData) {
    const userAgentIdentifier = currentAgentData[0];
    const expectedStyleClasses = currentAgentData[1];
    let actualGeneratedClasses = browserClassifier(userAgentIdentifier);

    /*
     * Eliminating environment-specific classes (e.g., orientation, min-width, max-width)
     * as they are dependent on the runtime environment rather than the user agent string itself.
     */
    actualGeneratedClasses = actualGeneratedClasses.replace(/ ?orientation_\w+/g, "").replace(/ [min|max|cl]+[w|h]_\d+/g, "");
    actualGeneratedClasses = actualGeneratedClasses.replace(/\s(no-)?hidpi/, "");

    outputDebugMsg(`|${actualGeneratedClasses}|`); // Log the final set of generated classes for debugging
    const resultDisplayCategory = (expectedStyleClasses === "header") ? expectedStyleClasses : "outcome segment";

    if (operationalMode === 'produce') {
      accumulatedOutputHtml += (expectedStyleClasses === "header" ? '<br /><br />' : '<br />') + '\t["' + userAgentIdentifier + '","' + ((expectedStyleClasses === "header") ? expectedStyleClasses : actualGeneratedClasses) + '"]' + (caseIndex < totalTestCases - 1 ? ',' : '') + (expectedStyleClasses === "header" ? '<br />' : '');
    } else if (operationalMode === 'segment' || expectedStyleClasses === "header") {
      accumulatedOutputHtml += '<div class="' + resultDisplayCategory + '"><h3>' + userAgentIdentifier + '<\/h3>' + (expectedStyleClasses !== "header" ? '\n<div class="obtained_data">Generated: ' + actualGeneratedClasses + '<\/div>\n' : '') + '<\/div>';
    } else if (expectedStyleClasses === actualGeneratedClasses) {
      accumulatedOutputHtml += '<div class="outcome success"><h3>' + userAgentIdentifier + '<\/h3>\n<div class="obtained_data">Received: ' + actualGeneratedClasses + '<\/div>\n<\/div>';
      successfulTestCount++;
    } else {
      accumulatedOutputHtml += '<div class="outcome failure">\n<h3>' + userAgentIdentifier + '<\/h3>\n<div class="anticipated_data">Anticipated: ' + expectedStyleClasses + '<\/div>\n<div class="received_data">Received: ' + actualGeneratedClasses + '<\/div>\n<\/div>';
      failedTestTally++;
    }
  }); // End of iteration for each user agent test case

  if (operationalMode === 'produce') {
    accumulatedOutputHtml += '</pre>';
  }

  const successSummaryHeading = `<h2 class='pass passed'>${successfulTestCount} evaluations passed<\/h2>`,
    failureSummaryHeading = `<h2 class='fail failed'>${failedTestTally} evaluations failed<\/h2>`,
    completeHeaderBlock = browserInfoDisplayBlock + "\n" +
    (operationalMode === 'complete' ? successSummaryHeading + "\n" + failureSummaryHeading : "");

  jQuery("<section/>").attr("id", "mainWrapper").appendTo("body");
  jQuery(completeHeaderBlock).appendTo("#mainWrapper");
  jQuery("<div/>").attr("id", "testOutcome").appendTo("#mainWrapper");

  jQuery(accumulatedOutputHtml).appendTo("#testOutcome");

  /* Assigns a distinct CSS class to every odd-numbered result element for improved visual readability (zebra striping). */
  jQuery("#testOutcome .outcome:nth-child(2n+1)").addClass("odd-row-style");

});