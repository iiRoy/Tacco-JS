/*
Copyright (c) 2008-2014 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
function acquireReportingHost() {
  const globalContext = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {}));
  if (typeof module !== 'undefined' && module.exports) {
    return exports;
  } else {
    globalContext.testReportingBridge = globalContext.testReportingBridge || {};
    return globalContext.testReportingBridge;
  }
}

acquireReportingHost().terminalInterface = function(coreReportingModule, reportingUtilityService) {
  reportingUtilityService.TerminalReporter = coreReportingModule.ConsoleReporter();
};

acquireReportingHost().TerminalReporter = function() {

  const defaultExecutionClock = Object.freeze({
    begin: () => {},
    measure: () => 0
  });

  const ansiColorCodes = Object.freeze({
    pass: '\x1B[32m',    // Green for success
    fail: '\x1B[31m',    // Red for failure
    skip: '\x1B[33m',    // Yellow for pending/skipped
    reset: '\x1B[0m'     // Reset to default
  });

  // Helper function to apply ANSI colors
  function applyColoration(colorKey, text, enableColor) {
    return enableColor ? (ansiColorCodes[colorKey] + text + ansiColorCodes.reset) : text;
  }

  // Helper for pluralization
  function getPluralizedWord(singularWord, count) {
    return count === 1 ? singularWord : `${singularWord}s`;
  }

  // Helper for indentation
  function applyTextIndentation(textContent, indentSpaces) {
    if (!textContent) return '';
    const lines = textContent.split('\n');
    const indentPrefix = ' '.repeat(indentSpaces);
    return lines.map(line => indentPrefix + line).join('\n');
  }

  // --- Main Reporter Class ---
  class StandardTerminalReporter {
    constructor(configuration) {
      // Validate essential configuration properties
      if (typeof configuration.outputFunction !== 'function') {
        throw new TypeError('`outputFunction` must be a function in the reporter configuration.');
      }

      this.outputFunction = configuration.outputFunction;
      this.shouldUseColors = configuration.enableColorOutput || false;
      this.finalizationCallback = configuration.onReportCompletion || (() => {});
      this.activeClock = configuration.timingMechanism || defaultExecutionClock;

      // Internal state variables, initialized for a fresh reporting session
      this.totalTestsProcessed = 0;
      this.failedTestCount = 0;
      this.skippedTestCount = 0;
      this.failedTestDetails = [];
      this.failedSuiteDetails = [];
      this.isReportSessionActive = false; // New state flag to prevent re-initialization

      // Original "deprecated" message removed as a Type III change.
      // A more generic internal warning could be added here if needed.
    }

    // Event handler for reporting start
    onReportingStarted() {
      if (this.isReportSessionActive) {
        console.warn('Reporting session already active. Ignoring duplicate start event.');
        return;
      }
      this.isReportSessionActive = true;
      this.totalTestsProcessed = 0;
      this.failedTestCount = 0;
      this.skippedTestCount = 0;
      this.failedTestDetails = [];
      this.failedSuiteDetails = []; // Ensure state is reset for a new session

      this.outputFunction('Test execution initiated.');
      this.outputFunction('\n');
      this.activeClock.begin();
    }

    // Event handler for reporting completion
    onReportingFinished() {
      if (!this.isReportSessionActive) {
        console.warn('Reporting session not active. Ignoring finish event.');
        return;
      }
      this.isReportSessionActive = false;
      this.outputFunction('\n');

      // Display details for individual test case failures
      this.failedTestDetails.forEach(details => this._renderTestCaseFailure(details));

      let finalSummaryMessage = '';
      if (this.totalTestsProcessed > 0) {
        this.outputFunction('\n');
        const testSummary = `${this.totalTestsProcessed} ${getPluralizedWord('test', this.totalTestsProcessed)}, ${this.failedTestCount} ${getPluralizedWord('failure', this.failedTestCount)}`;

        if (this.skippedTestCount > 0) {
          finalSummaryMessage = testSummary + `, ${this.skippedTestCount} ${getPluralizedWord('skipped test', this.skippedTestCount)}`;
        } else {
          finalSummaryMessage = testSummary;
        }
        this.outputFunction(finalSummaryMessage);
      } else {
        this.outputFunction('No executable test cases were identified.');
      }

      this.outputFunction('\n');
      const durationSeconds = this.activeClock.measure() / 1000;
      this.outputFunction(`Execution time: ${durationSeconds} ${getPluralizedWord('second', durationSeconds)}.`);
      this.outputFunction('\n');

      // Display details for test suite failures (e.g., afterAll errors)
      this.failedSuiteDetails.forEach(suiteFailure => this._renderTestSuiteFailure(suiteFailure));

      try {
        this.finalizationCallback(this.failedTestCount === 0);
      } catch (error) {
        console.error('Error encountered during report finalization callback:', error);
      }
    }

    // Event handler for individual test case completion
    onTestCaseCompleted(testOutcome) {
      this.totalTestsProcessed++;

      const statusKey = testOutcome.status; // Retain original status property for switch

      switch (statusKey) {
        case 'pending':
          this.skippedTestCount++;
          this.outputFunction(applyColoration('skip', '*', this.shouldUseColors));
          break;
        case 'passed':
          this.outputFunction(applyColoration('pass', '.', this.shouldUseColors));
          break;
        case 'failed':
          this.failedTestCount++;
          this.failedTestDetails.push(testOutcome);
          this.outputFunction(applyColoration('fail', 'F', this.shouldUseColors));
          break;
        default:
          this.outputFunction('?'); // Indicate unknown status for visual feedback
          console.warn(`Encountered unknown test status: "${statusKey}" for test "${testOutcome.fullName}"`);
      }
    }

    // Event handler for test suite completion
    onTestSuiteCompleted(suiteOutcome) {
      if (Array.isArray(suiteOutcome.failedExpectations) && suiteOutcome.failedExpectations.length > 0) {
        this.failedTestCount++; // A failed suite (e.g., afterAll error) contributes to overall failure count
        this.failedSuiteDetails.push(suiteOutcome);
      }
    }

    // --- Private Helper Methods for Rendering Failure Information ---

    _renderTestCaseFailure(failureRecord) {
      if (!failureRecord || !Array.isArray(failureRecord.failedExpectations) || failureRecord.failedExpectations.length === 0) {
        // Guard clause for invalid or empty failure records
        this.outputFunction('\n[Error] Invalid or empty test case failure record provided.');
        return;
      }
      this.outputFunction('\n');
      this.outputFunction(failureRecord.fullName);

      failureRecord.failedExpectations.forEach(expectation => {
        this.outputFunction('\n');
        this.outputFunction(applyTextIndentation(expectation.message || 'No failure message provided.', 2));
        if (expectation.stack) { // Only print stack if it exists
          this.outputFunction(applyTextIndentation(expectation.stack, 2));
        } else {
          this.outputFunction(applyTextIndentation('[No stack trace available for this expectation]', 2));
        }
      });
      this.outputFunction('\n');
    }

    _renderTestSuiteFailure(suiteFailureRecord) {
      if (!suiteFailureRecord || !Array.isArray(suiteFailureRecord.failedExpectations) || suiteFailureRecord.failedExpectations.length === 0) {
        // Guard clause for invalid or empty suite failure records
        this.outputFunction('\n[Error] Invalid or empty test suite failure record provided.');
        return;
      }
      suiteFailureRecord.failedExpectations.forEach(expectation => {
        this.outputFunction('\n');
        this.outputFunction(applyColoration('fail', 'An error occurred within an "afterAll" block:', this.shouldUseColors));
        this.outputFunction('\n');
        this.outputFunction(applyColoration('fail', `AfterAll Failure: ${expectation.message || 'Unknown error in suite'}`, this.shouldUseColors));
        if (expectation.stack) {
          this.outputFunction(applyColoration('fail', applyTextIndentation(expectation.stack, 2), this.shouldUseColors));
        } else {
          this.outputFunction(applyColoration('fail', applyTextIndentation('[No stack trace available for this suite error]', 2), this.shouldUseColors));
        }
      });
      this.outputFunction('\n');
    }
  }

  // The factory now returns the class, allowing for 'new StandardTerminalReporter(config)'
  // to be called directly by the consumer, offering more flexibility.
  return StandardTerminalReporter;
};