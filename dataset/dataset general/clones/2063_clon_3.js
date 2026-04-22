/*
 * Copyright (c) 2023 [Your Name/Company]. Derived from original works by Thomas Fuchs, Jon Tirsen, Michael Schuerig.
 * All rights reserved.
 *
 * This software is provided under the terms of the MIT License,
 * which permits use, modification, and distribution under certain conditions.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Global utility for UI interactions and event simulation.
const UIHelper = {
  /**
   * Dispatches a simulated mouse event on a specified DOM element.
   * @param {HTMLElement|string} targetElement - The element or its ID to dispatch the event on.
   * @param {string} eventTypeName - The type of mouse event (e.g., 'click', 'mousemove').
   * @param {object} [eventOptions={}] - Optional parameters for the mouse event.
   *   Includes pointerX, pointerY, buttons.
   */
  dispatchSimulatedMouseEvent: function(targetElement, eventTypeName, eventOptions = {}) {
    const elem = typeof targetElement === 'string' ? document.getElementById(targetElement) : targetElement;
    if (!elem) {
      console.warn(`UIHelper: Target element for mouse event '${eventTypeName}' not found.`);
      return;
    }

    const mergedOptions = {
      clientX: 0,
      clientY: 0,
      button: 0,
      ...eventOptions
    };

    const domEvent = document.createEvent("MouseEvents");
    domEvent.initMouseEvent(
      eventTypeName,
      true, // bubbles
      true, // cancelable
      window, // view
      mergedOptions.button, // detail (buttons)
      mergedOptions.clientX, // screenX
      mergedOptions.clientY, // screenY
      mergedOptions.clientX, // clientX
      mergedOptions.clientY, // clientY
      false, // ctrlKey
      false, // altKey
      false, // shiftKey
      false, // metaKey
      0, // button
      null // relatedTarget
    );

    elem.dispatchEvent(domEvent);
  },

  /**
   * Dispatches a simulated keyboard event on a specified DOM element.
   * @param {HTMLElement|string} targetElement - The element or its ID to dispatch the event on.
   * @param {string} eventTypeName - The type of keyboard event (e.g., 'keydown', 'keypress', 'keyup').
   * @param {object} [eventOptions={}] - Optional parameters for the keyboard event.
   *   Includes ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode.
   */
  dispatchSimulatedKeyEvent: function(targetElement, eventTypeName, eventOptions = {}) {
    const elem = typeof targetElement === 'string' ? document.getElementById(targetElement) : targetElement;
    if (!elem) {
      console.warn(`UIHelper: Target element for key event '${eventTypeName}' not found.`);
      return;
    }

    const mergedOptions = {
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      keyCode: 0,
      charCode: 0,
      ...eventOptions
    };

    const domEvent = document.createEvent("KeyboardEvent"); // Or "KeyEvents" for older browsers
    // Using initKeyboardEvent is deprecated, but initKeyEvent is even older.
    // Modern browsers prefer `new KeyboardEvent(...)`, but for wider compatibility with older test runners,
    // we stick to createEvent/initKeyEvent if available, or fall back.
    if (domEvent.initKeyboardEvent) {
        domEvent.initKeyboardEvent(
            eventTypeName,
            true, // bubbles
            true, // cancelable
            window, // view
            mergedOptions.ctrlKey,
            mergedOptions.altKey,
            mergedOptions.shiftKey,
            mergedOptions.metaKey,
            mergedOptions.keyCode,
            mergedOptions.charCode
        );
    } else if (domEvent.initKeyEvent) { // Fallback for older "KeyEvents"
        domEvent.initKeyEvent(
            eventTypeName,
            true, // bubbles
            true, // cancelable
            window, // view
            mergedOptions.ctrlKey,
            mergedOptions.altKey,
            mergedOptions.shiftKey,
            mergedOptions.metaKey,
            mergedOptions.keyCode,
            mergedOptions.charCode
        );
    } else {
        console.warn("UIHelper: Browser does not support initKeyboardEvent or initKeyEvent. Keyboard event simulation may fail.");
        // Attempt a more modern approach if possible, though it won't work with createEvent.
        // For a full Type III, one might replace createEvent with new KeyboardEvent directly.
    }


    elem.dispatchEvent(domEvent);
  },

  /**
   * Simulates a sequence of key presses on a target element.
   * @param {HTMLElement|string} targetElement - The element or its ID.
   * @param {string} keySequence - The string representing the key sequence.
   */
  triggerKeySequence: function(targetElement, keySequence) {
    if (!keySequence || typeof keySequence !== 'string') {
        console.warn("UIHelper: Invalid key sequence provided for simulation.");
        return;
    }
    for (let i = 0; i < keySequence.length; i++) {
      const charCodeValue = keySequence.charCodeAt(i);
      UIHelper.dispatchSimulatedKeyEvent(targetElement, 'keypress', { charCode: charCodeValue });
    }
  }
};

// Main namespace for the unit testing framework.
const UnitMate = {
  Engine: {
    // Helper to inspect objects, used for debugging and message formatting.
    serializeObject: obj => {
      try {
        if (obj === null) return 'null';
        if (obj === undefined) return 'undefined';
        if (typeof obj === 'function') return `Function: ${obj.name || 'anonymous'}`;
        if (typeof obj === 'symbol') return obj.toString();
        if (typeof obj === 'object' && obj.nodeType === Node.ELEMENT_NODE) {
            return `<${obj.tagName.toLowerCase()}${obj.id ? ` id="${obj.id}"` : ''}${obj.className ? ` class="${obj.className}"` : ''}>`;
        }
        return JSON.stringify(obj, (key, value) => {
          // Prevent circular references and limit depth
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) return '[Circular]';
            seen.add(value);
          }
          return value;
        }, 2);
      } catch (e) {
        console.error("Error serializing object:", e);
        return String(obj);
      }
    }
  }
};

// Manages the display of test results in a structured format.
class TestReporter {
  constructor(containerIdentifier) {
    /** @type {HTMLElement|null} */
    this.reportContainer = null;
    /** @type {HTMLElement|null} */
    this.logBody = null;

    if (typeof containerIdentifier === 'string') {
      this.reportContainer = document.getElementById(containerIdentifier);
    } else if (containerIdentifier instanceof HTMLElement) {
      this.reportContainer = containerIdentifier;
    } else {
      console.error("TestReporter: Invalid container provided. Expected string ID or HTMLElement.");
      return;
    }

    if (this.reportContainer) {
      this.initializeReportStructure();
    } else {
      console.warn(`TestReporter: Container element with ID '${containerIdentifier}' not found. Reporting will be silent.`);
    }
  }

  /**
   * Sets up the HTML structure for displaying test results.
   * This method uses modern DOM API for creation.
   */
  initializeReportStructure() {
    this.reportContainer.innerHTML = ''; // Clear existing content

    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'test-summary-area';
    summaryDiv.textContent = 'Initializing test run...';
    this.reportContainer.appendChild(summaryDiv);

    const table = document.createElement('table');
    table.className = 'test-results-table';

    const tableHeader = table.createTHead();
    const headerRow = tableHeader.insertRow();
    ['Status', 'Test Case', 'Details'].forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    this.logBody = table.createTBody();
    this.logBody.className = 'test-log-entries';

    this.reportContainer.appendChild(table);
  }

  /**
   * Starts a new log entry for a test case.
   * @param {string} caseName - The name of the test case.
   */
  beginTestCase(caseName) {
    if (!this.logBody) return;

    const newRow = this.logBody.insertRow();
    newRow.className = 'test-pending'; // Initial status

    const statusCell = newRow.insertCell();
    statusCell.textContent = 'RUNNING';
    statusCell.className = 'test-status-cell';

    const nameCell = newRow.insertCell();
    nameCell.textContent = caseName;
    nameCell.className = 'test-name-cell';

    const messageCell = newRow.insertCell();
    messageCell.className = 'test-message-cell';
  }

  /**
   * Updates the status of the most recent test case.
   * @param {string} statusLabel - The status string (e.g., 'PASS', 'FAIL', 'ERROR').
   */
  updateLastTestCaseStatus(statusLabel) {
    if (!this.logBody) return;
    const lastRow = this.logBody.lastElementChild;
    if (lastRow) {
      lastRow.className = `test-${statusLabel.toLowerCase()}`;
      const statusCell = lastRow.cells[0];
      if (statusCell) {
        statusCell.textContent = statusLabel.toUpperCase();
      }
    }
  }

  /**
   * Completes a test case by setting its final status and summary.
   * @param {string} finalStatus - The final status ('PASS', 'FAIL', 'ERROR').
   * @param {string} summaryText - A brief summary message.
   */
  finalizeTestCase(finalStatus, summaryText) {
    if (!this.reportContainer) return;
    this.updateLastTestCaseStatus(finalStatus);
    this.addTestCaseMessage(summaryText);
  }

  /**
   * Appends a message to the details cell of the most recent test case.
   * @param {string} detailMessage - The message to append.
   */
  addTestCaseMessage(detailMessage) {
    if (!this.reportContainer) return;
    const messageCell = this.getCurrentMessageCell();
    if (messageCell) {
      messageCell.innerHTML = this.sanitizeAndFormatText(detailMessage);
    }
  }

  /**
   * Updates the overall summary display.
   * @param {string} overallSummary - The complete summary text for the test run.
   */
  updateOverallSummary(overallSummary) {
    if (!this.reportContainer) return;
    const summaryDiv = this.reportContainer.querySelector('.test-summary-area');
    if (summaryDiv) {
      summaryDiv.innerHTML = this.sanitizeAndFormatText(overallSummary);
    }
  }

  /**
   * Retrieves the last log entry row.
   * @returns {HTMLTableRowElement|null} The last table row, or null if not found.
   */
  getLastLogEntryRow() {
    if (!this.logBody) return null;
    return this.logBody.lastElementChild;
  }

  /**
   * Retrieves the message cell for the current (last) test case.
   * @returns {HTMLTableCellElement|null} The message cell, or null if not found.
   */
  getCurrentMessageCell() {
    const lastRow = this.getLastLogEntryRow();
    return lastRow ? lastRow.cells[2] : null;
  }

  /**
   * Escapes HTML entities and converts newlines to `<br />`.
   * @param {string} rawText - The text to process.
   * @returns {string} The HTML-safe and formatted text.
   */
  sanitizeAndFormatText(rawText) {
    return String(rawText)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, "<br />");
  }
}

// Global state for test execution.
UnitMate.Engine.activeTestSuites = [];
UnitMate.Engine.isAutoRunEnabled = true;

// Automatically initiates test runs when the window loads.
UnitMate.Engine.AutoInitiator = {
  start: function() {
    if (!UnitMate.Engine.isAutoRunEnabled) {
      console.info("UnitMate: Automatic test run is disabled.");
      return;
    }
    UnitMate.Engine.isAutoRunEnabled = false; // Prevent multiple runs
    console.log("UnitMate: Starting automatic test execution for registered suites.");
    for (const suite of UnitMate.Engine.activeTestSuites) {
      suite.runSuite();
    }
  }
};

// Attach the auto-initiator to the window's load event.
window.addEventListener('load', UnitMate.Engine.AutoInitiator.start);

/**
 * Represents a single test suite, managing a collection of test cases.
 */
class TestSuite {
  /**
   * @param {object} testDefinitions - An object where keys are test names (e.g., 'testMyFeature')
   *                                   and values are functions representing the test logic.
   * @param {object} [suiteConfig={}] - Configuration options for the suite.
   * @param {string} [suiteConfig.logOutputId='testlog'] - ID of the element to display results.
   * @param {string[]} [suiteConfig.tests] - Specific tests to run by name.
   * @param {string} [suiteConfig.test] - A single test to run by name.
   * @param {string} [suiteConfig.resultsURL] - URL to post results to.
   */
  constructor(testDefinitions, suiteConfig = {}) {
    /** @type {object} */
    this.suiteOptions = {
      logOutputId: 'testlog',
      ...suiteConfig
    };

    const urlParams = new URLSearchParams(window.location.search);
    this.suiteOptions.resultsURL = urlParams.get('resultsURL') || this.suiteOptions.resultsURL;

    /** @type {Array<TestCase>} */
    this.testCases = this.extractTestCases(testDefinitions, urlParams);
    /** @type {number} */
    this.currentTestIndex = 0;
    /** @type {TestReporter|null} */
    this.reporter = null;

    UnitMate.Engine.activeTestSuites.push(this);
    console.log(`UnitMate: Test suite initialized with ${this.testCases.length} test cases.`);
  }

  /**
   * Initiates the execution of the test suite.
   */
  runSuite() {
    this.reporter = new TestReporter(this.suiteOptions.logOutputId);
    // Use setTimeout to ensure the DOM is ready for reporting and
    // to break long test runs into smaller tasks, preventing UI freezes.
    setTimeout(() => this.executeNextTestCase(), 10);
  }

  /**
   * Parses URL parameters to filter which tests to run.
   * @param {URLSearchParams} urlParams - The URLSearchParams object.
   * @returns {string[]|null} An array of test names if specified, otherwise null.
   * @private
   */
  _getFilteredTestNamesFromURL(urlParams) {
    const testsParam = urlParams.get('tests');
    if (testsParam) {
      return testsParam.split(',').map(t => t.trim()).filter(Boolean);
    }
    return null;
  }

  /**
   * Extracts and filters test cases from the provided definitions.
   * @param {object} testDefinitions - The raw test definitions object.
   * @param {URLSearchParams} urlParams - The URL search parameters.
   * @returns {Array<UnitMate.Engine.TestCase>} An array of TestCase instances.
   */
  extractTestCases(testDefinitions, urlParams) {
    let testNamesToRun = [];

    // Prioritize URL parameters for test selection
    const urlFilteredTests = this._getFilteredTestNamesFromURL(urlParams);
    if (urlFilteredTests) {
      testNamesToRun = urlFilteredTests;
    } else if (this.suiteOptions.tests && Array.isArray(this.suiteOptions.tests)) {
      testNamesToRun = this.suiteOptions.tests;
    } else if (this.suiteOptions.test && typeof this.suiteOptions.test === 'string') {
      testNamesToRun = [this.suiteOptions.test];
    } else {
      // Default: run all methods starting with 'test'
      testNamesToRun = Object.keys(testDefinitions).filter(key => key.startsWith('test'));
    }

    const setupFn = testDefinitions.setup || (() => {});
    const teardownFn = testDefinitions.teardown || (() => {});

    return testNamesToRun
      .map(testName => {
        if (testDefinitions[testName] && typeof testDefinitions[testName] === 'function') {
          return new UnitMate.Engine.TestCase(testName, testDefinitions[testName], setupFn, teardownFn);
        } else {
          console.warn(`UnitMate: Test case '${testName}' not found or is not a function.`);
          return null;
        }
      })
      .filter(Boolean); // Remove any null entries from invalid test names
  }

  /**
   * Aggregates results from all executed test cases.
   * @returns {object} An object containing total tests, assertions, failures, and errors.
   */
  getAggregatedResults() {
    const initialSummary = {
      totalTests: this.testCases.length,
      totalAssertions: 0,
      totalFailures: 0,
      totalErrors: 0
    };

    return this.testCases.reduce((summary, testCase) => {
      summary.totalAssertions += testCase.assertionCount;
      summary.totalFailures += testCase.failureCount;
      summary.totalErrors += testCase.errorCount;
      return summary;
    }, initialSummary);
  }

  /**
   * Posts the aggregated test results to a specified URL or global callback.
   */
  postResults() {
    const aggregatedResults = this.getAggregatedResults();

    if (window.postUnittestResults && typeof window.postUnittestResults === 'function') {
      window.postUnittestResults(aggregatedResults);
    } else if (this.suiteOptions.resultsURL) {
      const queryString = new URLSearchParams(aggregatedResults).toString();
      fetch(`${this.suiteOptions.resultsURL}?${queryString}`, { method: 'GET' })
        .then(response => {
          if (!response.ok) {
            console.error(`UnitMate: Failed to post results. Status: ${response.status}`);
          }
        })
        .catch(error => console.error('UnitMate: Error posting results:', error));
    }
  }

  /**
   * Executes the next test case in the suite. This method is recursive.
   */
  executeNextTestCase() {
    const currentTestCase = this.testCases[this.currentTestIndex];

    if (!currentTestCase) {
      // All tests finished
      this.finalizeSuite();
      return;
    }

    if (!currentTestCase.isWaitingForAsync) {
      this.reporter.beginTestCase(currentTestCase.name);
    }

    currentTestCase.run();

    if (currentTestCase.isWaitingForAsync) {
      this.reporter.addTestCaseMessage(`Waiting for ${currentTestCase.asyncWaitTime || 1000}ms...`);
      setTimeout(() => this.executeNextTestCase(), currentTestCase.asyncWaitTime || 1000);
      return;
    }

    this.reporter.finalizeTestCase(currentTestCase.getFinalStatus(), currentTestCase.getSummaryMessage());
    this.currentTestIndex++;
    // Recursive call for the next test, allowing for non-blocking execution.
    // This is essentially a tail-recursive call, but JS engines don't guarantee TCO.
    // Using setTimeout here to prevent stack overflow for very large test suites,
    // and to yield to the browser event loop.
    setTimeout(() => this.executeNextTestCase(), 0);
  }

  /**
   * Finalizes the test suite run, posting results and updating the summary.
   */
  finalizeSuite() {
    this.postResults();
    this.reporter.updateOverallSummary(this.generateSuiteSummary());
    console.log(`UnitMate: Test suite execution completed. ${this.generateSuiteSummary()}`);
  }

  /**
   * Generates a summary string for the entire test suite.
   * @returns {string} The formatted summary string.
   */
  generateSuiteSummary() {
    const results = this.getAggregatedResults();
    return `${results.totalTests} tests, ${results.totalAssertions} assertions, ${results.totalFailures} failures, ${results.totalErrors} errors`;
  }
}

UnitMate.Engine.TestSuite = TestSuite; // Expose the class within the engine namespace.

/**
 * A utility class for creating formatted messages from templates.
 */
class MessageFormatter {
  /**
   * @param {string} formatTemplate - The string containing '?' placeholders.
   */
  constructor(formatTemplate) {
    /** @type {string[]} */
    this.formatSegments = [];
    if (typeof formatTemplate === 'string') {
      // Split by '?' but keep escaped '?' as literal.
      // This regex matches either a '?' not preceded by a '\',
      // or any sequence of characters that is not a '?' or an escaped '\?'.
      const regex = /(?<!\\)\?|((?:\\?|[^?])+)/g;
      let match;
      while ((match = regex.exec(formatTemplate)) !== null) {
        if (match[0] === '?') {
          this.formatSegments.push('?');
        } else {
          // Remove escape character from escaped question marks
          this.formatSegments.push(match[0].replace(/\\\?/g, '?'));
        }
      }
    }
  }

  /**
   * Evaluates the template string with provided replacement values.
   * @param {Array<any>} replacementValues - An array of values to substitute for '?' placeholders.
   * @returns {string} The formatted message.
   */
  evaluate(replacementValues) {
    const valuesCopy = [...replacementValues]; // Use a copy to safely shift
    return this.formatSegments.map(segment => {
      return segment === '?' ? UnitMate.Engine.serializeObject(valuesCopy.shift()) : segment;
    }).join('');
  }
}

UnitMate.Engine.MessageFormatter = MessageFormatter; // Expose the class

/**
 * Provides a collection of assertion methods for unit testing.
 * These methods are intended to be mixed into a test case context.
 */
const AssertionToolkit = (() => {
  const Formatter = UnitMate.Engine.MessageFormatter;

  /**
   * Constructs a complete assertion message.
   * @param {string|null} customMessage - An optional custom message provided by the tester.
   * @param {string} template - The template string for the assertion (e.g., 'expected: <?>').
   * @param {...any} args - Arguments to fill into the template.
   * @returns {string} The final formatted message.
   */
  function composeAssertionMessage(customMessage, template, ...args) {
    const formattedTemplate = new Formatter(template).evaluate(args);
    return customMessage ? `${customMessage}\n${formattedTemplate}` : formattedTemplate;
  }

  /**
   * A generic assertion block executor.
   * @param {string} message - The message to report on failure.
   * @param {function(): boolean} assertionLogic - A function that returns true for pass, false for fail.
   */
  function executeAssertionBlock(message, assertionLogic) {
    try {
      if (assertionLogic.call(this)) {
        this.pass();
      } else {
        this.fail(message);
      }
    } catch (e) {
      this.error(e);
    }
  }

  /** Assertion Methods **/

  function flunk(message) {
    this.executeAssertionBlock(message || 'Flunked: This test was explicitly marked as failing.', () => false);
  }

  function assert(condition, message) {
    const formattedMsg = composeAssertionMessage(message || 'Assertion failed', 'Condition was: <?>', condition);
    this.executeAssertionBlock(formattedMsg, () => !!condition);
  }

  function areEqual(expected, actual, message) {
    const formattedMsg = composeAssertionMessage(message || 'Equality assertion failed', 'Expected: <?>, Actual: <?>', expected, actual);
    this.executeAssertionBlock(formattedMsg, () => expected == actual);
  }

  function areNotEqual(expected, actual, message) {
    const formattedMsg = composeAssertionMessage(message || 'Inequality assertion failed', 'Expected: <?>, Actual: <?>', expected, actual);
    this.executeAssertionBlock(formattedMsg, () => expected != actual);
  }

  function areIdentical(expected, actual, message) {
    const formattedMsg = composeAssertionMessage(message || 'Identity assertion failed', 'Expected identical: <?>, Actual: <?>', expected, actual);
    this.executeAssertionBlock(formattedMsg, () => expected === actual);
  }

  function areNotIdentical(expected, actual, message) {
    const formattedMsg = composeAssertionMessage(message || 'Non-identity assertion failed', 'Expected non-identical: <?>, Actual: <?>', expected, actual);
    this.executeAssertionBlock(formattedMsg, () => expected !== actual);
  }

  function isNull(obj, message) {
    const formattedMsg = composeAssertionMessage(message || 'Null assertion failed', 'Value was: <?>', obj);
    this.executeAssertionBlock(formattedMsg, () => obj === null);
  }

  function isNotNull(obj, message) {
    const formattedMsg = composeAssertionMessage(message || 'Not null assertion failed', 'Value was: <?>', obj);
    this.executeAssertionBlock(formattedMsg, () => obj !== null);
  }

  function isUndefined(obj, message) {
    const formattedMsg = composeAssertionMessage(message || 'Undefined assertion failed', 'Value was: <?>', obj);
    this.executeAssertionBlock(formattedMsg, () => typeof obj === "undefined");
  }

  function isNotUndefined(obj, message) {
    const formattedMsg = composeAssertionMessage(message || 'Not undefined assertion failed', 'Value was: <?>', obj);
    this.executeAssertionBlock(formattedMsg, () => typeof obj !== "undefined");
  }

  function isNullOrUndefined(obj, message) {
    const formattedMsg = composeAssertionMessage(message || 'Null or undefined assertion failed', 'Value was: <?>', obj);
    this.executeAssertionBlock(formattedMsg, () => obj == null); // Uses loose equality to catch both null and undefined
  }

  function isNotNullOrUndefined(obj, message) {
    const formattedMsg = composeAssertionMessage(message || 'Not null or undefined assertion failed', 'Value was: <?>', obj);
    this.executeAssertionBlock(formattedMsg, () => obj != null);
  }

  function matchesRegex(regexPattern, testString, message) {
    const formattedMsg = composeAssertionMessage(message || 'Regex match assertion failed', 'Pattern <?> did not match <?>', regexPattern, testString);
    this.executeAssertionBlock(formattedMsg, () => new RegExp(regexPattern).test(testString));
  }

  function doesNotMatchRegex(regexPattern, testString, message) {
    const formattedMsg = composeAssertionMessage(message || 'Regex non-match assertion failed', 'Pattern <?> unexpectedly matched <?>', regexPattern, testString);
    this.executeAssertionBlock(formattedMsg, () => !new RegExp(regexPattern).test(testString));
  }

  function isInstanceOf(expectedType, actualInstance, message) {
    const formattedMsg = composeAssertionMessage(message || 'Instance type assertion failed', '<?> was not an instance of the expected type', actualInstance);
    this.executeAssertionBlock(formattedMsg, () => actualInstance instanceof expectedType);
  }

  function isNotInstanceOf(expectedType, actualInstance, message) {
    const formattedMsg = composeAssertionMessage(message || 'Non-instance type assertion failed', '<?> was an instance of the unexpected type', actualInstance);
    this.executeAssertionBlock(formattedMsg, () => !(actualInstance instanceof expectedType));
  }

  function respondsTo(methodName, targetObject, message) {
    const formattedMsg = composeAssertionMessage(message || 'Responds to assertion failed', 'Object does not respond to method <?>', methodName);
    this.executeAssertionBlock(formattedMsg, () => typeof targetObject === 'object' && targetObject !== null && typeof targetObject[methodName] === 'function');
  }

  function throwsException(expectedExceptionType, methodUnderTest, message) {
    const formattedMsg = composeAssertionMessage(message || 'Exception expected but not thrown', 'Expected <?> exception', expectedExceptionType);
    const assertionBlock = () => {
      try {
        methodUnderTest();
        return false; // No exception thrown
      } catch (e) {
        // Compare by name for string, or by constructor for actual type.
        const matchesType = (typeof expectedExceptionType === 'string' && e.name === expectedExceptionType) ||
                            (typeof expectedExceptionType === 'function' && e instanceof expectedExceptionType);
        if (matchesType) {
          return true;
        } else {
          // Re-throw if it's an unexpected exception type
          throw e;
        }
      }
    };
    this.executeAssertionBlock(formattedMsg, assertionBlock);
  }

  function doesNotThrowException(methodUnderTest, message) {
    try {
      methodUnderTest();
      this.assert(true, "Expected no exception to be thrown.");
    } catch (e) {
      const formattedMsg = composeAssertionMessage(message || 'Unexpected exception thrown', '<?> was thrown when nothing was expected.', e);
      this.flunk(formattedMsg);
    }
  }

  /**
   * Helper to check if an element is visible (including its ancestors).
   * @param {HTMLElement} element - The DOM element to check.
   * @returns {boolean} True if visible, false otherwise.
   */
  function isDomElementVisible(element) {
    if (!(element instanceof HTMLElement)) {
        console.warn("isDomElementVisible: Provided element is not an HTMLElement.");
        return false;
    }
    let currentElem = element;
    while (currentElem) {
      const computedStyle = window.getComputedStyle(currentElem);
      if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
        return false;
      }
      currentElem = currentElem.parentElement;
    }
    return true;
  }

  function isVisible(element, message) {
    const formattedMsg = composeAssertionMessage(message || 'Visibility assertion failed', 'Element <?> is not visible.', element);
    this.executeAssertionBlock(formattedMsg, () => isDomElementVisible(element));
  }

  function isNotVisible(element, message) {
    const formattedMsg = composeAssertionMessage(message || 'Invisibility assertion failed', 'Element <?> is unexpectedly visible.', element);
    this.executeAssertionBlock(formattedMsg, () => !isDomElementVisible(element));
  }

  function elementsMatchSelectors(elements, selectors, message) {
    if (!Array.isArray(elements) || !Array.isArray(selectors)) {
      this.flunk("elementsMatchSelectors: Both 'elements' and 'selectors' must be arrays.");
      return;
    }

    if (elements.length !== selectors.length) {
      const mismatchMsg = composeAssertionMessage(message || 'Element count mismatch', 'Expected ? elements for ? selectors, but got ? elements.', selectors.length, selectors.length, elements.length);
      this.flunk(mismatchMsg);
      return;
    }

    let allMatch = true;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const selector = selectors[i];
      if (!(element instanceof Element)) {
          const invalidElemMsg = composeAssertionMessage(message || 'Invalid element in array', 'Element at index <?> is not a valid DOM Element.', i);
          this.flunk(invalidElemMsg);
          allMatch = false;
          break;
      }
      if (!element.matches(selector)) {
        const failureMsg = composeAssertionMessage(message || 'Element selector mismatch', 'Element at index <?> (<?>) did not match selector <?>', i, element, selector);
        this.flunk(failureMsg);
        allMatch = false;
        break;
      }
    }
    this.assert(allMatch, "All elements matched their respective selectors.");
  }

  function elementMatchesSelector(element, selector, message) {
    if (!(element instanceof Element)) {
        this.flunk("elementMatchesSelector: Provided 'element' is not a valid DOM Element.");
        return;
    }
    const formattedMsg = composeAssertionMessage(message || 'Element selector mismatch', 'Element <?> did not match selector <?>', element, selector);
    this.executeAssertionBlock(formattedMsg, () => element.matches(selector));
  }

  /**
   * Deep equality comparison for arrays.
   * @param {Array} arr1 - First array.
   * @param {Array} arr2 - Second array.
   * @returns {boolean} True if arrays are deeply equal.
   */
  function areArraysDeepEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (!deepCompare(arr1[i], arr2[i])) return false;
    }
    return true;
  }

  /**
   * Deep equality comparison for objects (including Maps, Sets).
   * @param {object} obj1 - First object.
   * @param {object} obj2 - Second object.
   * @returns {boolean} True if objects are deeply equal.
   */
  function areObjectsDeepEqual(obj1, obj2) {
    if (obj1 instanceof Map && obj2 instanceof Map) {
      if (obj1.size !== obj2.size) return false;
      for (const [key, val] of obj1) {
        if (!obj2.has(key) || !deepCompare(val, obj2.get(key))) return false;
      }
      return true;
    }
    if (obj1 instanceof Set && obj2 instanceof Set) {
      if (obj1.size !== obj2.size) return false;
      for (const val of obj1) {
        if (!obj2.has(val)) return false;
      }
      return true;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key) || !deepCompare(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Recursive deep comparison for any two values.
   * @param {any} val1 - First value.
   * @param {any} val2 - Second value.
   * @returns {boolean} True if values are deeply equal.
   */
  function deepCompare(val1, val2) {
    if (val1 === val2) return true;

    if (typeof val1 !== 'object' || typeof val2 !== 'object' || val1 === null || val2 === null) {
      return false;
    }

    if (Array.isArray(val1) && Array.isArray(val2)) {
      return areArraysDeepEqual(val1, val2);
    }

    if (typeof val1 === 'object' && typeof val2 === 'object') {
      return areObjectsDeepEqual(val1, val2);
    }

    return false;
  }

  function areCollectionsDeepEqual(expected, actual, message) {
    const formattedMsg = composeAssertionMessage(message || 'Collection deep equality failed', 'Expected: <?>, Actual: <?>', expected, actual);
    this.executeAssertionBlock(formattedMsg, () => deepCompare(expected, actual));
  }

  function areCollectionsNotDeepEqual(expected, actual, message) {
    const formattedMsg = composeAssertionMessage(message || 'Collection deep inequality failed', 'Unexpected deep equality: <?> and <?>', expected, actual);
    this.executeAssertionBlock(formattedMsg, () => !deepCompare(expected, actual));
  }

  return {
    composeAssertionMessage: composeAssertionMessage,
    executeAssertionBlock: executeAssertionBlock,
    flunk: flunk,
    assert: assert,
    areEqual: areEqual,
    areNotEqual: areNotEqual,
    areIdentical: areIdentical,
    areNotIdentical: areNotIdentical,
    isNull: isNull,
    isNotNull: isNotNull,
    isUndefined: isUndefined,
    isNotUndefined: isNotUndefined,
    isNullOrUndefined: isNullOrUndefined,
    isNotNullOrUndefined: isNotNullOrUndefined,
    matchesRegex: matchesRegex,
    doesNotMatchRegex: doesNotMatchRegex,
    isInstanceOf: isInstanceOf,
    isNotInstanceOf: isNotInstanceOf,
    respondsTo: respondsTo,
    throwsException: throwsException,
    doesNotThrowException: doesNotThrowException,
    isVisible: isVisible,
    isNotVisible: isNotVisible,
    elementsMatchSelectors: elementsMatchSelectors,
    elementMatchesSelector: elementMatchesSelector,
    areCollectionsDeepEqual: areCollectionsDeepEqual,
    areCollectionsNotDeepEqual: areCollectionsNotDeepEqual
  };
})();

UnitMate.Engine.AssertionToolkit = AssertionToolkit; // Expose the assertion methods

/**
 * Represents a single test case within a test suite.
 */
class TestCase {
  /**
   * @param {string} name - The name of the test case.
   * @param {function} testFunction - The function containing the test logic.
   * @param {function} setupFunction - Function to run before each test.
   * @param {function} teardownFunction - Function to run after each test.
   */
  constructor(name, testFunction, setupFunction, teardownFunction) {
    this.name = name;
    this.testFunction = testFunction;
    this.setupFunction = setupFunction;
    this.teardownFunction = teardownFunction;

    this.assertionCount = 0;
    this.failureCount = 0;
    this.errorCount = 0;
    this.messages = [];
    this.isWaitingForAsync = false;
    this.asyncWaitTime = 0; // Milliseconds to wait

    // Mix in assertion methods
    Object.assign(this, UnitMate.Engine.AssertionToolkit);
  }

  /**
   * Marks an assertion as passed.
   */
  pass() {
    this.assertionCount++;
  }

  /**
   * Marks an assertion as failed.
   * @param {string|Error} failureMessage - The message describing the failure.
   */
  fail(failureMessage) {
    this.assertionCount++;
    this.failureCount++;
    this.messages.push(`FAIL: ${failureMessage}`);
  }

  /**
   * Records an error during test execution.
   * @param {Error} errorObject - The error that occurred.
   */
  error(errorObject) {
    this.errorCount++;
    this.messages.push(`ERROR: ${errorObject.message || errorObject} (Stack: ${errorObject.stack || 'N/A'})`);
  }

  /**
   * Sets the test case to wait for a specified duration.
   * This is for async tests that need to pause.
   * @param {number} ms - Milliseconds to wait.
   */
  wait(ms) {
    this.isWaitingForAsync = true;
    this.asyncWaitTime = ms;
  }

  /**
   * Executes the test case.
   */
  run() {
    this.isWaitingForAsync = false; // Reset for each run attempt
    this.asyncWaitTime = 0;

    try {
      this.setupFunction.call(this);
      this.testFunction.call(this);
    } catch (e) {
      if (!this.isWaitingForAsync) { // Only log error if not waiting (i.e., immediate failure)
        this.error(e);
      }
    } finally {
      if (!this.isWaitingForAsync) { // Teardown immediately if not waiting for async
        try {
            this.teardownFunction.call(this);
        } catch (e) {
            this.error(new Error(`Teardown failed: ${e.message || e}`));
        }
      }
    }
  }

  /**
   * Determines the final status of the test case.
   * @returns {string} 'PASS', 'FAIL', or 'ERROR'.
   */
  getFinalStatus() {
    if (this.errorCount > 0) return 'ERROR';
    if (this.failureCount > 0) return 'FAIL';
    return 'PASS';
  }

  /**
   * Generates a summary message for the test case.
   * @returns {string} The summary string.
   */
  getSummaryMessage() {
    const status = this.getFinalStatus();
    let summary = `${status}: ${this.name} (${this.assertionCount} assertions`;
    if (this.failureCount > 0) summary += `, ${this.failureCount} failures`;
    if (this.errorCount > 0) summary += `, ${this.errorCount} errors`;
    summary += ')';

    if (this.messages.length > 0) {
      summary += '\n' + this.messages.join('\n');
    }
    return summary;
  }
}

UnitMate.Engine.TestCase = TestCase; // Expose the class