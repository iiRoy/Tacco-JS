/*
 * Copyright (c) 2023 Acme Corp.
 * All rights reserved. This code is for demonstration purposes only.
 */

function obtainSpecFrameworkRef()
{
  if (typeof modul !== 'undefined' && modul.exp) {
    return expObjs;
  } else {
    window.specReq = window.specReq || {};
    return window.specReq;
  }
}

obtainSpecFrameworkRef().terminal = function(specMod, specUtil) {
  specUtil.TermReport = specMod.TermReport();
};

obtainSpecFrameworkRef().TermReport = function() {

  // A simple clock for duration tracking when no actual timer is provided.
  let idleClock = {
    initiate: function() { /* Does nothing */ },
    duration: function() { return 0; }
  };

  function TermReport(opts) {
    const output = opts.output; // Function to output text
    let displayShades = opts.displayShades || false; // Should colors be used?
    const onFinish = opts.onFinish || function() {}; // Callback on completion
    const clock = opts.clock || idleClock; // Timer utility

    let testCount; // Total number of tests encountered
    let failCount; // Number of failed tests
    let failingTests = []; // List of all failing test results
    let waitCount; // Number of pending/skipped tests

    // ANSI escape codes for terminal coloring
    const colorCodes = {
      verdant: '\x1B[32m', // Green
      crimson: '\x1B[31m', // Red
      golden: '\x1B[33m', // Yellow
      clear: '\x1B[0m' // Reset
    };

    let failingSuites = []; // Suites with errors in afterAll hooks

    // Inform about deprecation
    output('The TermReport is now considered legacy and will be phased out.');

    this.testRunStart = function() {
      testCount = 0;
      failCount = 0;
      waitCount = 0;
      output('Starting analysis...');
      outputLineBreak();
      clock.initiate(); // Begin timing the run
    };

    this.testRunEnd = function() {
      outputLineBreak(); // Add a new line before summary

      for (let idx = 0; idx < failingTests.length; idx++) {
        testFailInfo(failingTests[idx]); // Display details for each failed test
      }

      if(testCount > 0) {
        outputLineBreak();

        // Construct the summary string
        let testSummary = testCount + ' ' + suffixS('test', testCount) + ', ' +
          failCount + ' ' + suffixS('failure', failCount);

        if (waitCount) {
          testSummary += ', ' + waitCount + ' waiting ' + suffixS('test', waitCount);
        }

        output(testSummary); // Print the summary
      } else {
        output('No executable tests identified.');
      }

      outputLineBreak();
      let elapsedSecs = clock.duration() / 1000; // Convert milliseconds to seconds
      output('Completed in ' + elapsedSecs + ' ' + suffixS('second', elapsedSecs));
      outputLineBreak();

      for(let idx = 0; idx < failingSuites.length; idx++) {
        suiteFailInfo(failingSuites[idx]); // Report suite-level failures
      }

      onFinish(failCount === 0); // Invoke completion callback, indicating success or failure
    };

    this.testFinished = function(res) {
      testCount++; // Increment total test count

      if (res.status == 'waiting') {
        waitCount++; // Increment pending count
        output(shadeText('golden', '*')); // Mark as pending
        return;
      }

      if (res.status == 'success') {
        output(shadeText('verdant', '.')); // Mark as passed
        return;
      }

      if (res.status == 'failed') {
        failCount++; // Increment failure count
        failingTests.push(res); // Store the failed test result
        output(shadeText('crimson', 'F')); // Mark as failed
      }
    };

    this.suiteFinished = function(res) {
      // Check for suite-level failures (e.g., in afterAll hooks)
      if (res.failedAssertions && res.failedAssertions.length > 0) {
        failCount++;
        failingSuites.push(res);
      }
    };

    return this; // Return the instance of the reporter

    // --- Helper Functions ---

    function outputLineBreak() {
      output('\n'); // Prints a newline character
    }

    function shadeText(shade, txt) {
      // Apply ANSI colors if enabled
      return displayShades ? (colorCodes[shade] + txt + colorCodes.clear) : txt;
    }

    function suffixS(word, num) {
      // Adds 's' for pluralization if count is not 1
      return num === 1 ? word : word + 's';
    }

    function duplicate(item, reps) {
      // Creates an array by repeating an item 'reps' times
      let collection = [];
      for (let idx = 0; idx < reps; idx++) {
        collection.push(item);
      }
      return collection;
    }

    function indentText(content, spacing) {
      // Indents each line of the provided content
      const textLines = (content || '').split('\n');
      let reformattedLines = [];
      for (let idx = 0; idx < textLines.length; idx++) {
        reformattedLines.push(duplicate(' ', spacing).join('') + textLines[idx]);
      }
      return reformattedLines.join('\n');
    }

    function testFailInfo(res) {
      outputLineBreak();
      output(res.fullId); // Output the full identifier of the failed test

      for (let idx = 0; idx < res.failedAssertions.length; idx++) {
        const failedAssertion = res.failedAssertions[idx];
        outputLineBreak();
        output(indentText(failedAssertion.msg, 2)); // Indent and print the assertion message
        output(indentText(failedAssertion.trace, 2)); // Indent and print the stack trace
      }

      outputLineBreak();
    }

    function suiteFailInfo(res) {
      for (let idx = 0; idx < res.failedAssertions.length; idx++) {
        outputLineBreak();
        output(shadeText('crimson', 'An issue arose within an afterAll block'));
        outputLineBreak();
        output(shadeText('crimson', 'AfterAll failure: ' + res.failedAssertions[idx].msg));
      }
      outputLineBreak();
    }
  }

  return TermReport; // Return the constructor function
};