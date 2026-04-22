const enableDebugOutput = true; // Global flag to control logging.

/**
 * Outputs a message to the browser console if debugging is enabled and the console object exists.
 * @param {string} logMessage - The string message to be displayed in the console.
 */
function logDebugMessage(logMessage) {
    if (window.console && enableDebugOutput) {
        console.log(logMessage);
    }
}

/**
 * Retrieves the value of a specified query parameter from the URL.
 * It searches the main window's location string for the parameter.
 * @param {string} parameterName - The name of the query parameter to find (e.g., "mode").
 * @returns {string} The decoded value of the parameter, or an empty string if not found.
 */
function fetchUrlParameter(parameterName) {
    // Construct a regular expression to locate the parameter and capture its value.
    const searchPattern = new RegExp(`[\\?&]${parameterName}=([^&#]*)`, "i");
    // Execute the pattern against the current browser's URL query string.
    const matchOutcome = searchPattern.exec(window.location.search);
    // If a match is found, decode the captured group; otherwise, return an empty string.
    return matchOutcome ? decodeURIComponent(matchOutcome[1]) : "";
}

// Ensure the DOM is fully loaded before executing the main script logic.
jQuery(document).ready(function () {

    // Enumeration-like object to define the various report generation modes.
    const ReportModes = Object.freeze({
        FULL: "full",         // Comprehensive report showing all pass/fail details.
        SUMMARY: "summary",   // A concise view, listing generated classes for each UA string.
        EXPORT: "export"      // Generates an array suitable for data export or re-use.
    });

    // Determine the current reporting mode, defaulting to 'full' if not specified or invalid.
    let activeReportMode = fetchUrlParameter("reportMode") || ReportModes.FULL;
    if (!Object.values(ReportModes).includes(activeReportMode)) {
        activeReportMode = ReportModes.FULL; // Fallback to default if an unknown mode is provided.
    }

    let successfulTestCount = 0;
    let failedTestCount = 0;
    let generatedReportHTML = ''; // Buffer to accumulate the HTML content of the report.

    const htmlRootElement = document.documentElement; // Direct reference to the <html> tag.

    // Assemble the initial header displaying the user's browser details.
    const userAgentDisplayHeader = `
        <header class="browser-details-header">
            <h1 class="ua-string-value">Your User-Agent: <span>${navigator.userAgent}</span></h1>
            <h2 class="current-html-classes">HTML Classes: <span>${htmlRootElement.className}</span></h2>
        </header>`;

    // Augment the HTML root element with a class specific to the full report mode.
    if (activeReportMode === ReportModes.FULL) {
        htmlRootElement.classList.add("full-test-view");
    }

    // Validate the presence and type of the user agent test data set.
    if (!window.userAgentTestDataSet || !Array.isArray(window.userAgentTestDataSet)) {
        logDebugMessage("Error: The 'userAgentTestDataSet' global array is missing or malformed.");
        return; // Halt execution if critical data is unavailable.
    }

    const totalDataSetEntries = window.userAgentTestDataSet.length;

    // Begin a preformatted block if the mode is set for data export.
    if (activeReportMode === ReportModes.EXPORT) {
        generatedReportHTML += '<pre class="data-export-output">';
    }

    // Iterate over each entry in the user agent test data set.
    jQuery.each(window.userAgentTestDataSet, function (entryIndex, currentTestEntry) {
        const targetUserAgent = currentTestEntry[0];
        const expectedClassString = currentTestEntry[1];
        let actualGeneratedClasses = determineBrowserClasses(targetUserAgent); // External function call.

        // Clean up generated classes by removing dynamic, environment-specific tokens.
        // These tokens are not directly derived from the UA string but from runtime conditions.
        actualGeneratedClasses = actualGeneratedClasses
            .replace(/ ?orientation-\w+/g, "") // Remove orientation classes (e.g., orientation-landscape)
            .replace(/ (min|max|cl)[wh]-\d+/g, "") // Remove min/max/client width/height classes (e.g., minw-768)
            .replace(/\s(no-)?hidpi/, ""); // Remove hidpi classes (e.g., hidpi, no-hidpi)

        logDebugMessage(`UA: "${targetUserAgent}" | Result: "${actualGeneratedClasses}"`);

        // Determine the appropriate CSS class for styling the current test result block.
        const outputBlockClass = (expectedClassString === "header") ? "section-header-block" : "test-item-display";

        if (activeReportMode === ReportModes.EXPORT) {
            // Format output for direct JavaScript array generation.
            generatedReportHTML += (expectedClassString === "header" ? '\n\n' : '\n') +
                `\t["${targetUserAgent}","${(expectedClassString === "header" ? expectedClassString : actualGeneratedClasses)}"]` +
                (entryIndex < totalDataSetEntries - 1 ? ',' : '') +
                (expectedClassString === "header" ? '\n' : '');
        } else if (activeReportMode === ReportModes.SUMMARY || expectedClassString === "header") {
            // Format output for a summary view or for special header entries.
            generatedReportHTML += `
                <div class="${outputBlockClass}">
                    <h3>${targetUserAgent}</h3>
                    ${expectedClassString !== "header" ? `<div class="generated-code-details">Generated: ${actualGeneratedClasses}</div>` : ''}
                </div>`;
        } else if (expectedClassString === actualGeneratedClasses) {
            // Case for a successful test match.
            generatedReportHTML += `
                <div class="test-result-entry status-pass">
                    <h3>${targetUserAgent}</h3>
                    <div class="actual-code-output">Got: ${actualGeneratedClasses}</div>
                </div>`;
            successfulTestCount++;
        } else {
            // Case for a failed test match.
            generatedReportHTML += `
                <div class="test-result-entry status-fail">
                    <h3>${targetUserAgent}</h3>
                    <div class="expected-code-output">Expected: ${expectedClassString}</div>
                    <div class="actual-code-output">Got: ${actualGeneratedClasses}</div>
                </div>`;
            failedTestCount++;
        }
    });

    // Conclude the preformatted block if in data export mode.
    if (activeReportMode === ReportModes.EXPORT) {
        generatedReportHTML += '</pre>';
    }

    // Prepare the summary headers for successful and failed tests.
    const successSummaryMarkup = `<h2 class="summary-heading outcome-success">Successful Tests: ${successfulTestCount}</h2>`;
    const failureSummaryMarkup = `<h2 class="summary-heading outcome-failure">Failed Tests: ${failedTestCount}</h2>`;

    // Construct the overall header section for the report.
    const combinedReportHeader = `
        ${userAgentDisplayHeader}
        ${activeReportMode === ReportModes.FULL ? successSummaryMarkup + failureSummaryMarkup : ''}
    `;

    // Dynamically create and append the main report container to the document body.
    const reportContainerElement = jQuery('<section/>', { id: 'main-application-report' }).appendTo('body');
    // Add the header content to the report container.
    jQuery(combinedReportHeader).appendTo(reportContainerElement);

    // Create a dedicated area for the detailed test results.
    const resultsDisplayArea = jQuery('<div/>', { id: 'test-results-container' }).appendTo(reportContainerElement);
    // Insert the accumulated report HTML into the results area.
    jQuery(generatedReportHTML).appendTo(resultsDisplayArea);

    // Apply an 'alternating-style' class to odd-indexed test result entries for visual distinction.
    jQuery("#test-results-container .test-result-entry:odd").addClass("alternating-style");

});