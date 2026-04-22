AppTest.Runner.Reporter = function (targetElement) {
  // Acquire the target DOM element for displaying results using a custom utility.
  this.outputTarget = AppTest.getElement(targetElement);

  // If a valid display element is identified, prepare the initial report table.
  if (this.outputTarget) {
    this._setupResultDisplay();
  }
};

// Define methods for the Reporter prototype to manage test output.
AppTest.Runner.Reporter.prototype.beginTest = function (caseIdentifier) {
  // Cease execution if no output element is configured.
  if (!this.outputTarget) {
    return;
  }

  // Locate the table body section where individual test outcomes will be added.
  var bodySection = this.outputTarget.getElementsByTagName('tbody')[0];

  // Construct a new table row for the current test case.
  var newRow = document.createElement('tr');
  var dataCell;

  /*
   * Create the cell to display the unique identifier of the test case.
   */
  dataCell = document.createElement('td');
  dataCell.appendChild(document.createTextNode(caseIdentifier));
  newRow.appendChild(dataCell);

  newRow.appendChild(document.createElement('td')); // Space for the test's final status
  newRow.appendChild(document.createElement('td')); // Space for any supplementary messages

  // Attach the newly created row to the table's body.
  bodySection.appendChild(newRow);
};

AppTest.Runner.Reporter.prototype.updateOutcome = function (outcomeLabel) {
  var currentEntryRow = this.fetchLatestEntry();
  // Apply a CSS class to the row corresponding to the test's outcome (e.g., 'success', 'failure').
  currentEntryRow.className = outcomeLabel;
  // Retrieve the cell intended for the outcome status and populate it.
  var outcomeDisplayCell = currentEntryRow.getElementsByTagName('td')[1];
  outcomeDisplayCell.appendChild(document.createTextNode(outcomeLabel));
};

AppTest.Runner.Reporter.prototype.finalizeTest = function (finalOutcome, finalSummaryText) {
  // Do nothing if the output element is not present.
  if (!this.outputTarget) {
    return;
  }
  // Update the status of the recently concluded test entry.
  this.updateOutcome(finalOutcome);
  // Render any detailed summary information for the test.
  this.renderMessage(finalSummaryText);
};

AppTest.Runner.Reporter.prototype.renderMessage = function (contentString) {
  // Exit if the output element is unavailable.
  if (!this.outputTarget) {
    return;
  }
  // Obtain the specific cell where messages are to be shown.
  var displayCell = this.getMsgCell();

  // Convert the raw input text to HTML-safe format before inserting it into the cell.
  displayCell.innerHTML = this._processTextForDisplay(contentString);
};

AppTest.Runner.Reporter.prototype.displayOverallSummary = function (overallSummaryContent) {
  if (!this.outputTarget) {
    return;
  }
  // Find the initial div element within the output area to present the comprehensive summary.
  var summaryPanel = this.outputTarget.getElementsByTagName('div')[0];
  summaryPanel.innerHTML = this._processTextForDisplay(overallSummaryContent);
};

AppTest.Runner.Reporter.prototype.fetchLatestEntry = function () {
  var resultBody = this.outputTarget.getElementsByTagName('tbody')[0];
  // Gather all 'tr' elements (representing individual log entries) from the tbody.
  var allEntryRows = resultBody.getElementsByTagName('tr');
  // Return the very last row, which corresponds to the most recent test record.
  return allEntryRows[allEntryRows.length - 1];
};

AppTest.Runner.Reporter.prototype.getMsgCell = function () {
  var currentEntry = this.fetchLatestEntry();
  // The message details are typically located in the third table data cell (index 2) of the row.
  return currentEntry.getElementsByTagName('td')[2];
};

AppTest.Runner.Reporter.prototype._setupResultDisplay = function () {
  // Generate the foundational HTML markup for the test results presentation.
  var markupString = '<div class="report-overview">Initializing test run display...</div>' +
    '<table class="report-table">' +
    '<thead><tr><th>Result</th><th>Test Item</th><th>Details</th></tr></thead>' +
    '<tbody class="report-entries"></tbody>' +
    '</table>';
  // Insert this generated HTML structure into the designated output element.
  this.outputTarget.innerHTML = markupString;
};

AppTest.Runner.Reporter.prototype.attachControlButtons = function (interactionOptions) {
  /*
   * This method was originally commented out in the source code, suggesting it was
   * either a placeholder or an unused feature. It is kept commented for structural
   * consistency, with all internal identifiers and comments updated.
   */
  // var mappedActions = AppTest.mapHash(interactionOptions);
  // if (!mappedActions.hasAny()) return;
  // var controlDiv = new Element("div", {className: 'control_area'});
  // mappedActions.forEachItem(controlDiv, function(containerElement, actionPair) {
  //   var actionButton = new Element("input").setValue(actionPair.key).onEvent("click", actionPair.value);
  //   actionButton.type = "button";
  //   return containerElement.insertChild(actionButton);
  // });
  // this.getMsgCell().insertContent(controlDiv);
};

AppTest.Runner.Reporter.prototype._processTextForDisplay = function (rawInput) {
  // Sanitize the input text to prevent potential cross-site scripting (XSS) issues
  // and convert newline characters into HTML break tags for proper rendering.
  return AppTest.sanitizeText(rawInput).replace(/\n/g, "<br/>");
};