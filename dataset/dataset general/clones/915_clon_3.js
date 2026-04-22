const TestReporting = {};

TestReporting.getDomElement = function(elementIdentifier) {
  if (typeof elementIdentifier === 'string') {
    const identifiedElement = document.getElementById(elementIdentifier);
    if (!identifiedElement) {
      console.error(`TestReporting.getDomElement: DOM node with ID "${elementIdentifier}" not located.`);
      return null;
    }
    return identifiedElement;
  }
  // Assume it's already an HTMLElement object
  if (elementIdentifier instanceof HTMLElement) {
    return elementIdentifier;
  }
  console.error("TestReporting.getDomElement: Invalid element identifier provided.");
  return null;
};

TestReporting.sanitizeTextForHtml = function(rawStringContent) {
  if (typeof rawStringContent !== 'string') {
    return String(rawStringContent || ''); // Ensure it's a string, handle null/undefined
  }
  const temporaryDiv = document.createElement('div');
  temporaryDiv.appendChild(document.createTextNode(rawStringContent));
  return temporaryDiv.innerHTML;
};

/**
 * Manages and displays a structured log of test outcomes within a designated HTML element.
 * @class
 * @param {HTMLElement|string} displayTargetNode - The DOM element or its ID where the log panel should be rendered.
 */
TestReporting.LogOutcomePanel = function(displayTargetNode) {
  this._primaryHostNode = TestReporting.getDomElement(displayTargetNode);
  this._cachedSummaryDiv = null; // Stores reference to the summary display area
  this._cachedLogBody = null;    // Stores reference to the tbody where test results are appended
  this._lastAppendedRow = null;  // Keeps track of the most recent test entry row for quick updates

  if (this._primaryHostNode) {
    this._constructVisualLayout();
  } else {
    console.error("LogOutcomePanel: Failed to initialize. Provided display target node is invalid or absent.");
  }
};

/**
 * Prototype methods for the LogOutcomePanel.
 */
TestReporting.LogOutcomePanel.prototype = {
  constructor: TestReporting.LogOutcomePanel,

  /**
   * Builds the initial HTML structure inside the panel's host element.
   * This method is invoked during object instantiation.
   * @private
   */
  _constructVisualLayout: function() {
    const panelMarkup = `
      <div class="outcome-panel-summary">Awaiting test execution...</div>
      <table class="outcome-results-table">
        <thead class="outcome-table-header">
          <tr>
            <th class="col-case-name">Test Description</th>
            <th class="col-final-status">Result Status</th>
            <th class="col-detailed-msg">Detailed Report</th>
          </tr>
        </thead>
        <tbody class="outcome-entries-body">
          <!-- Individual test outcomes will be inserted here -->
        </tbody>
      </table>
    `;
    this._primaryHostNode.innerHTML = panelMarkup;

    // Optimize by caching references to frequently accessed child elements
    this._cachedSummaryDiv = this._primaryHostNode.querySelector('.outcome-panel-summary');
    this._cachedLogBody = this._primaryHostNode.querySelector('.outcome-entries-body');

    if (!this._cachedSummaryDiv || !this._cachedLogBody) {
      console.warn("LogOutcomePanel: Critical internal DOM elements were not found after layout construction. Display might be incomplete.");
    }
  },

  /**
   * Creates a new row in the log table for a specific test case.
   * This row will represent the ongoing status of the test.
   * @param {string} testCaseName - The descriptive name of the test being run.
   * @returns {boolean} True if the row was successfully added, false otherwise.
   */
  registerNewTestEntry: function(testCaseName) {
    if (!this._cachedLogBody) {
      console.warn("LogOutcomePanel: Log body container is not available. Cannot register new test entry.");
      return false;
    }

    const testEntryRow = document.createElement('tr');
    testEntryRow.classList.add('test-entry-state-pending'); // Indicate initial state

    const nameCell = document.createElement('td');
    nameCell.classList.add('test-entry-name');
    nameCell.textContent = testCaseName;

    const statusCell = document.createElement('td');
    statusCell.classList.add('test-entry-status');
    statusCell.textContent = 'Running...'; // Initial status text

    const messageCell = document.createElement('td');
    messageCell.classList.add('test-entry-message');
    // This cell will be populated later with outcome details

    testEntryRow.appendChild(nameCell);
    testEntryRow.appendChild(statusCell);
    testEntryRow.appendChild(messageCell);

    this._cachedLogBody.appendChild(testEntryRow);
    this._lastAppendedRow = testEntryRow; // Update the reference to the newest row
    return true;
  },

  /**
   * Updates the status indicator for the most recently created test entry.
   * @param {string} outcomeStatus - The new status (e.g., "PASSED", "FAILED", "SKIPPED").
   * @returns {boolean} True if the status was updated, false if no active entry.
   */
  updateEntryOutcomeStatus: function(outcomeStatus) {
    const activeTestRow = this._lastAppendedRow || this._retrieveLastEntryRow();
    if (!activeTestRow) {
      console.warn("LogOutcomePanel: No active test entry found to update status for.");
      return false;
    }

    const statusDisplayNode = activeTestRow.querySelector('.test-entry-status');
    if (statusDisplayNode) {
      statusDisplayNode.textContent = outcomeStatus;
      // Remove all previous state classes and add the new one based on outcome
      activeTestRow.classList.remove('test-entry-state-pending', 'test-entry-state-passed', 'test-entry-state-failed', 'test-entry-state-skipped');
      activeTestRow.classList.add(`test-entry-state-${outcomeStatus.toLowerCase()}`);
      return true;
    }
    return false;
  },

  /**
   * Finalizes a test entry by setting its ultimate status and providing a summary message.
   * @param {string} finalState - The conclusive state of the test (e.g., "PASSED", "FAILED").
   * @param {string} outcomeDescription - A brief summary or error message for the test.
   */
  concludeTestEntry: function(finalState, outcomeDescription) {
    if (!this._primaryHostNode) {
      console.warn("LogOutcomePanel: Host element is unavailable. Cannot conclude test entry.");
      return;
    }
    const statusUpdated = this.updateEntryOutcomeStatus(finalState);
    if (statusUpdated) {
      this.addEntryDetailMessage(outcomeDescription);
    } else {
      console.error("LogOutcomePanel: Failed to conclude test entry; status update was unsuccessful.");
    }
  },

  /**
   * Appends or replaces a detailed message within the message cell of the current test entry.
   * @param {string} detailedMessageContent - The message content, which may include newlines.
   */
  addEntryDetailMessage: function(detailedMessageContent) {
    const activeTestRow = this._lastAppendedRow || this._retrieveLastEntryRow();
    if (!activeTestRow || !detailedMessageContent) {
      if (!activeTestRow) console.warn("LogOutcomePanel: No active test entry to attach a message to.");
      return;
    }

    const messageTargetCell = activeTestRow.querySelector('.test-entry-message');
    if (messageTargetCell) {
      const renderedContent = this._transformTextForDisplay(detailedMessageContent);
      messageTargetCell.innerHTML = renderedContent;
    }
  },

  /**
   * Updates the overall summary text displayed at the top of the log panel.
   * @param {string} overallReportSummary - The summary text to be shown.
   */
  updateOverallReportSummary: function(overallReportSummary) {
    if (this._cachedSummaryDiv && typeof overallReportSummary === 'string') {
      this._cachedSummaryDiv.innerHTML = this._transformTextForDisplay(overallReportSummary);
    } else if (!this._cachedSummaryDiv) {
      console.warn("LogOutcomePanel: Summary display area node is missing. Cannot update overall report summary.");
    }
  },

  /**
   * Retrieves the last 'tr' element (test entry row) from the log body.
   * This is used as a fallback if `_lastAppendedRow` is not properly set.
   * @private
   * @returns {HTMLElement|null} The last 'tr' element, or null if the log body is empty.
   */
  _retrieveLastEntryRow: function() {
    if (!this._cachedLogBody) {
      return null;
    }
    const allRows = this._cachedLogBody.querySelectorAll('tr');
    const rowCount = allRows.length;
    return rowCount > 0 ? allRows[rowCount - 1] : null;
  },

  /**
   * Converts a raw string into HTML-safe format, replacing newlines with <br/> tags.
   * @private
   * @param {string} sourceString - The input string.
   * @returns {string} The HTML-formatted string.
   */
  _transformTextForDisplay: function(sourceString) {
    if (sourceString === null || sourceString === undefined) {
      return '';
    }
    const safeHtmlString = TestReporting.sanitizeTextForHtml(sourceString);
    return safeHtmlString.replace(/\n/g, "<br/>");
  },

  /**
   * Erases all test entries from the log table, effectively clearing the display.
   */
  purgeLogEntries: function() {
    if (this._cachedLogBody) {
      this._cachedLogBody.innerHTML = '';
      this._lastAppendedRow = null; // Clear reference to the last row
    }
    if (this._cachedSummaryDiv) {
        this._cachedSummaryDiv.textContent = 'Log cleared. Ready for new operations.';
    }
  },

  /**
   * Resets the entire log panel to its initial state, clearing content and rebuilding structure.
   */
  resetPanelLayout: function() {
    if (this._primaryHostNode) {
        this._primaryHostNode.innerHTML = ''; // Clear everything
        this._cachedSummaryDiv = null;
        this._cachedLogBody = null;
        this._lastAppendedRow = null;
        this._constructVisualLayout(); // Rebuild the structure
    }
  }
};