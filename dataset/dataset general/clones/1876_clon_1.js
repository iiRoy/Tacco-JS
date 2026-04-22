/*
 * Copyright (c) 2008-2014 Pivotal Labs
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


// Main function to get the jasmineRequire object, handling CommonJS and browser environments.
function getJasmineRequireObj() {

  // Check if running in a Node.js-like environment with module.exports
  if (typeof module !== 'undefined' && module.exports) {
    return exports;
  }
  // Otherwise, assume browser environment and use window object
  else {

    // Initialize window.jasmineRequire if it doesn't exist
    window.jasmineRequire = window.jasmineRequire || {};
    return window.jasmineRequire;
  }
}

// Assign the console reporter factory to the jasmineRequire object.
getJasmineRequireObj().console = function(jRequire, j$) {

  // Instantiate and expose the ConsoleReporter
  j$.ConsoleReporter = jRequire.ConsoleReporter();
};


// Define the ConsoleReporter module.
getJasmineRequireObj().ConsoleReporter = function() {

  // A simple timer object for cases where a real timer isn't provided.
  var noopTimer = {
    start: function() {}, // Does nothing
    elapsed: function() {
      return 0;
    } // Always returns 0
  };

  // The actual ConsoleReporter constructor.
  function ConsoleReporter(options) {
    // Extract options or provide default values
    var print = options.print,
      showColors = options.showColors || false,
      onComplete = options.onComplete || function() {},
      timer = options.timer || noopTimer,
      specCount, // Total number of specs executed
      failureCount, // Total number of failed specs
      failedSpecs = [], // Array to store details of failed specs
      pendingCount, // Total number of pending specs
      ansi = { // ANSI escape codes for colored output
        green: '\x1B[32m',
        red: '\x1B[31m',
        yellow: '\x1B[33m',
        none: '\x1B[0m'
      },
      failedSuites = []; // Array to store details of failed suites (e.g., afterAll errors)

    // Log a deprecation warning for the ConsoleReporter
    print('ConsoleReporter is deprecated and will be removed in a future version.');


    // Called when Jasmine test run starts.
    this.jasmineStarted = function() {
      specCount = 0; // Reset spec count
      failureCount = 0; // Reset failure count
      pendingCount = 0; // Reset pending count
      print('Started'); // Indicate start of tests
      printNewline(); // Print a new line for formatting
      timer.start(); // Start the timer
    };

    // Called when Jasmine test run completes.
    this.jasmineDone = function() {
      printNewline(); // Print a newline before showing failure details

      // Iterate and print details for each failed spec
      for (var i = 0; i < failedSpecs.length; i++) {
        specFailureDetails(failedSpecs[i]);
      }

      // If any specs were run, print the summary counts
      if (specCount > 0) {
        printNewline();

        var specCounts = specCount + ' ' + plural('spec', specCount) + ', ' +
          failureCount + ' ' + plural('failure', failureCount);

        // Add pending spec count if any
        if (pendingCount) {
          specCounts += ', ' + pendingCount + ' pending ' + plural('spec', pendingCount);
        }

        print(specCounts); // Print the summary
      } else {
        print('No specs found'); // Inform if no specs were found
      }

      printNewline(); // Newline before finish time
      var seconds = timer.elapsed() / 1000; // Calculate elapsed time in seconds
      print('Finished in ' + seconds + ' ' + plural('second', seconds)); // Print finish time
      printNewline();

      // Iterate and print details for each failed suite
      for (i = 0; i < failedSuites.length; i++) {
        suiteFailureDetails(failedSuites[i]);
      }

      // Call the onComplete callback with success status
      onComplete(failureCount === 0);
    };

    // Called after each spec completes.
    this.specDone = function(result) {
      specCount++; // Increment total spec count

      // Handle pending specs
      if (result.status == 'pending') {
        pendingCount++;
        print(colored('yellow', '*')); // Print yellow asterisk for pending
        return;
      }

      // Handle passed specs
      if (result.status == 'passed') {
        print(colored('green', '.')); // Print green dot for passed
        return;
      }

      // Handle failed specs
      if (result.status == 'failed') {
        failureCount++; // Increment failure count
        failedSpecs.push(result); // Store failed spec result
        print(colored('red', 'F')); // Print red 'F' for failed
      }
    };

    // Called after each suite completes.
    this.suiteDone = function(result) {
      // Check for failed expectations within the suite (e.g., afterAll errors)
      if (result.failedExpectations && result.failedExpectations.length > 0) {
        failureCount++; // Increment failure count
        failedSuites.push(result); // Store failed suite result
      }
    };

    // Return the current instance of the reporter.
    return this;


    // Helper function to print a newline character.
    function printNewline() {
      print('\n');
    }

    // Helper function to apply ANSI colors if showColors is true.
    function colored(color, str) {
      return showColors ? (ansi[color] + str + ansi.none) : str;
    }

    // Helper function for pluralizing words.
    function plural(str, count) {
      return count == 1 ? str : str + 's';
    }

    // Helper function to repeat a string 'times' number of times.
    function repeat(thing, times) {
      var arr = [];
      for (var i = 0; i < times; i++) {
        arr.push(thing);
      }
      return arr;
    }

    // Helper function to indent a multi-line string.
    function indent(str, spaces) {
      var lines = (str || '').split('\n');
      var newArr = [];
      for (var i = 0; i < lines.length; i++) {
        newArr.push(repeat(' ', spaces).join('') + lines[i]);
      }
      return newArr.join('\n');
    }

    // Prints detailed information for a failed spec.
    function specFailureDetails(result) {
      printNewline(); // Newline before spec details
      print(result.fullName); // Print full name of the spec

      // Iterate and print each failed expectation
      for (var i = 0; i < result.failedExpectations.length; i++) {
        var failedExpectation = result.failedExpectations[i];
        printNewline();
        print(indent(failedExpectation.message, 2)); // Indent and print error message
        print(indent(failedExpectation.stack, 2)); // Indent and print stack trace
      }

      printNewline(); // Newline after spec details
    }

    // Prints detailed information for a failed suite (e.g., afterAll error).
    function suiteFailureDetails(result) {
      // Iterate and print each failed expectation in the suite
      for (var i = 0; i < result.failedExpectations.length; i++) {
        printNewline();
        print(colored('red', 'An error was thrown in an afterAll')); // Generic error message
        printNewline();
        print(colored('red', 'AfterAll ' + result.failedExpectations[i].message)); // Specific error message
      }
      printNewline();
    }
  }

  // Return the ConsoleReporter constructor.
  return ConsoleReporter;
};