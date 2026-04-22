(function initializeVerificationModule() {
  // Establish aliases for core components from the global VerificationKit namespace.
  const TerminalTestProcessor = VerificationKit.AutomatedProcessor.RUNNERS.terminal,
        TerminalTestOutcome = VerificationKit.UserInterface.Terminal.TestOutcome,
        AutomatedProcessor = VerificationKit.AutomatedProcessor,
        formatOutput = VerificationKit.UserInterface.formatMessage;

  /**
   * Creates a new class that inherits from a specified base class,
   * optionally mixing in additional prototype methods.
   * @param {function} baseClass - The constructor function of the class to inherit from.
   * @param {function|null} additionalMembersFn - A function returning an object of methods to add to the prototype.
   * @returns {function} The newly created derived class constructor.
   */
  function createDerivedClass(baseClass, additionalMembersFn) {
    // Ensure baseClass is a function.
    if (typeof baseClass !== 'function') {
      console.error('Base class must be a constructor function for inheritance.');
      return function() {}; // Return a dummy constructor to prevent further errors.
    }

    // The constructor for our new derived class.
    const derivedClass = function() {
      // Execute the 'initialize' method if it exists on this instance.
      if (typeof this.initialize === 'function') {
        this.initialize.apply(this, arguments);
      }
    };

    // Set up the prototype chain using an intermediate constructor to avoid
    // calling the baseClass constructor directly during inheritance setup.
    const protoBridge = function() {};
    protoBridge.prototype = baseClass.prototype;
    const derivedPrototype = new protoBridge();

    // Assign the new prototype and fix the constructor reference.
    derivedClass.prototype = derivedPrototype;
    derivedClass.prototype.constructor = derivedClass;

    // Override the initialize method to call the base class's constructor.
    derivedClass.prototype.initialize = function() {
      baseClass.apply(this, arguments);
    };

    // If additional methods are provided, mix them into the derived class's prototype.
    if (typeof additionalMembersFn === 'function') {
      const extraMethods = additionalMembersFn.call(derivedClass, baseClass.prototype);
      if (extraMethods && typeof extraMethods === 'object') {
        Object.keys(extraMethods).forEach(methodName => {
          derivedClass.prototype[methodName] = extraMethods[methodName];
        });
      }
    }
    return derivedClass;
  }

  // Define our custom test processor, extending the base terminal processor.
  const TestProcessor = createDerivedClass(TerminalTestProcessor, function(baseProto) {
    // Register this processor under a new identifier in the automated runner's collection.
    // This makes our custom processor available for selection.
    AutomatedProcessor.RUNNERS.artisan = this;

    // Optional validation: Ensure logger is available when creating results.
    if (!this.logger) {
        console.warn("TestProcessor initialized without a logger instance; logging might be limited.");
    }

    return {
      // Method to instantiate a new test outcome object.
      _createOutcomeInstance: function() {
        return new TestOutcome(this.logger);
      }
    };
  });

  // Define our custom test outcome handler, extending the base terminal outcome.
  const TestOutcome = createDerivedClass(TerminalTestOutcome, function(baseOutcomeProto) {
    return {
      // Method invoked when testing begins.
      start: function(testStartTime) {
        // Delegate to the base class's start method.
        baseOutcomeProto.start.call(this, testStartTime);
        // Log the start event, ensuring logger exists.
        if (this.logger && typeof this.logger.info === 'function') {
          this.logger.info('Test execution initiated.');
        } else {
            console.log('Test execution initiated. (No logger available for info messages)');
        }
      },

      // Method invoked when testing concludes.
      stop: function(testEndTime) {
        // Delegate to the base class's stop method.
        baseOutcomeProto.stop.call(this, testEndTime);

        // Calculate the total duration of the test run.
        const durationSeconds = (testEndTime - this.t0) / 1000;

        // Present the final test results on the UI.
        renderSummaryReport(this, durationSeconds);

        // Perform a check for any unintended global variable leaks.
        verifyNoGlobalLeaks();
      },

      // Method for when a test case is temporarily halted.
      pauseTest: function(testCaseIdentifier) {
        if (this.logger && typeof this.logger.debug === 'function') {
          this.logger.debug(`Test case '${testCaseIdentifier}' temporarily suspended.`);
        }
      },

      // Method for when a test suite begins execution.
      startSuite: function(suiteName) {
        if (this.logger && typeof this.logger.debug === 'function') {
          this.logger.debug(`Beginning execution of suite: '${suiteName}'.`);
        }
      }
      // Note: 'restartTest' method was intentionally removed as non-essential for this clone.
    };
  });

  // --- Configuration Override for Automated Processor ---
  // This immediate function modifies the default behavior of the automated processor
  // to ensure our custom 'artisan' runner is used if no other runner is specified.
  (function overrideDefaultRunnerSetting() {
    const autoProcessorPrototype = AutomatedProcessor.prototype;
    // Attempt to retrieve the original option fetcher, handling potential renaming.
    const originalOptionFetcher = autoProcessorPrototype.fetchConfigurationOptions || autoProcessorPrototype.retrieveOptions;

    autoProcessorPrototype.fetchConfigurationOptions = function() {
      let currentSettings = {};
      if (typeof originalOptionFetcher === 'function') {
        currentSettings = originalOptionFetcher.call(this);
      } else {
        // Fallback or default settings if original fetcher isn't found.
        console.warn("Original option fetcher not found on AutomatedProcessor.prototype, using default settings.");
      }

      // Ensure settings is an object before attempting to modify.
      if (typeof currentSettings !== 'object' || currentSettings === null) {
          currentSettings = {};
      }

      // If no test runner is explicitly defined, set 'artisan' as the default.
      if (!currentSettings.runnerIdentifier) { // Renamed 'runner' to 'runnerIdentifier'
        currentSettings.runnerIdentifier = 'artisan';
      }
      return currentSettings;
    };
  })();

  /**
   * Retrieves a DOM element by its ID.
   * @param {string} elementId - The ID of the element to retrieve.
   * @returns {HTMLElement|null} The element if found, otherwise null.
   */
  function getDomElementById(elementId) {
    if (typeof document === 'undefined' || document === null) {
      console.error("DOM access is not available in this environment. Cannot retrieve element.");
      return null;
    }
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
        console.warn(`Element with ID '${elementId}' not found in the DOM.`);
    }
    return targetElement;
  }

  /**
   * Renders a summary of test results to a designated DOM element.
   * @param {object} reportData - Object containing test statistics (e.g., failureCount, errorCount).
   * @param {number} durationInSeconds - The total time taken for the tests in seconds.
   */
  function renderSummaryReport(reportData, durationInSeconds) {
    const reportDisplayArea = getDomElementById('test-summary-output'); // Changed ID from 'results'
    if (!reportDisplayArea) {
      // If the display area doesn't exist, log a message and exit.
      console.info('Test summary display area not found. Skipping UI update for results.');
      return;
    }

    const totalFailures = reportData.failureCount || 0;
    const totalErrors = reportData.errorCount || 0;
    const totalAssertions = reportData.assertionCount || 0;
    const totalTestsRun = reportData.testCount || 0;

    let summaryMessage = '';
    let statusClass = '';

    if (totalFailures > 0 || totalErrors > 0) {
      statusClass = 'test-failed-status'; // Changed class name
      summaryMessage = formatOutput(
        `Execution completed in ${durationInSeconds.toFixed(2)} s. &mdash; <strong style="color:red;">${totalFailures} failures, ${totalErrors} errors</strong> (${totalAssertions} assertions)`,
        [] // Using template literal, so no arguments needed for formatOutput here.
      );
    } else {
      statusClass = 'test-passed-status'; // Changed class name
      summaryMessage = formatOutput(
        `Execution completed in ${durationInSeconds.toFixed(2)} s. &mdash; <strong style="color:green;">${totalTestsRun} tests passed</strong> (${totalAssertions} assertions)`,
        [] // Using template literal, so no arguments needed for formatOutput here.
      );
    }

    // Apply status class and append a 'finalized' class.
    reportDisplayArea.classList.add(statusClass);
    reportDisplayArea.classList.add('summary-finalized'); // New class added.
    reportDisplayArea.innerHTML = summaryMessage;
  }

  // --- Global Variable Leak Detection ---
  // Snapshot of global variables at the start of the script.
  const initialGlobals = Object.keys(window);
  // List of global variables that are expected and should not be flagged as leaks.
  const allowedGlobals = ['artisan', 'VerificationKit', 'galleryWidget', 'newHelperVar', 'someUtilityMethod']; // Added 'newHelperVar', 'someUtilityMethod'

  /**
   * Checks for any new global variables that might have been introduced
   * during test execution, indicating potential leaks.
   */
  function verifyNoGlobalLeaks() {
    // Check for Opera browser specific behavior for global object properties.
    const isOperaBrowser = /^Opera\b/.test(navigator.userAgent);
    let leakedVarsDetected = false; // New helper variable to track if any leaks are found

    for (const globalKey in window) {
      // Skip properties that are part of the initial global set or explicitly allowed.
      if (initialGlobals.includes(globalKey) || allowedGlobals.includes(globalKey)) {
        continue;
      }

      const currentGlobalValue = window[globalKey];

      // Additional condition to filter out specific non-leaks in Opera or other browsers.
      // This complex condition helps to avoid false positives for browser-added globals
      // that might appear as new but are system-level.
      const isNotBrowserSpecificObject = !isOperaBrowser ||
                                         (typeof currentGlobalValue !== 'object' && typeof currentGlobalValue !== 'function') ||
                                         (currentGlobalValue && currentGlobalValue.id !== globalKey);

      // Check if console is available and if it's a genuine new global.
      if (isNotBrowserSpecificObject && window.console && typeof console.warn === 'function') {
        console.warn(`Detected an unexpected new global variable: '${globalKey}'`);
        leakedVarsDetected = true; // Set flag if leak found
      }
    }

    // New fragment: provide positive feedback if no leaks are found.
    if (!leakedVarsDetected) {
        console.log("No new global variables detected after test execution. System integrity maintained.");
    }
  }

  // Example of adding a new global fragment (for testing leak detection)
  // This variable is added to `allowedGlobals` to prevent it from being flagged.
  window.newHelperVar = "This is a new global for demonstration purposes.";
  window.someUtilityMethod = function() { console.log("A new utility method."); };

})(); // End of the self-executing function