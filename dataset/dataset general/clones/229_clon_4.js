(function() {
    // Acquire references to external components using new aliases
    const ConsoleExecutionHandler = Evidence.AutoRunner.RUNNERS.console;
    const ConsoleOutcomeHandler = Evidence.UI.Console.TestResult;
    const SystemExecutionInitiator = Evidence.AutoRunner;
    const formatOutput = Evidence.UI.printf;

    // Define a new class for handling execution coordination,
    // extending the base console handler.
    class ExecutionCoordinator extends ConsoleExecutionHandler {
        constructor() {
            super(); // Invoke the constructor of ConsoleExecutionHandler
            // Register this class constructor itself as the custom runner,
            // mirroring the original's assignment of the 'klass' (constructor function).
        }

        // Method to generate a new instance of the execution outcome handler.
        createOutcomeInstance() {
            return new ExecutionOutcome(this.logger);
        }
    }
    // Explicitly associate the new coordinator class with the system's runners.
    SystemExecutionInitiator.RUNNERS.guggenheim = ExecutionCoordinator;

    // Define a new class for managing execution outcomes,
    // extending the base console outcome handler.
    class ExecutionOutcome extends ConsoleOutcomeHandler {
        constructor(...params) {
            super(...params); // Invoke the constructor of ConsoleOutcomeHandler
        }

        // Overrides the base 'start' method to log initiation.
        beginTracking(initialTimestamp) {
            super.start(initialTimestamp); // Call the parent's 'start' method
            this.logger.debug('Initiated execution tracking.');
        }

        // Overrides the base 'stop' method to log completion,
        // display results, and check for global leaks.
        endTracking(finalTimestamp) {
            super.stop(finalTimestamp); // Call the parent's 'stop' method
            const duration = (finalTimestamp - this.t0) / 1000;
            renderReportSummary(this, duration);
            auditGlobalScope();
        }

        // Overrides the base 'pauseTest' method to log suspension.
        suspendTest(testCaseIdentifier) {
            this.logger.debug(`Suspended test scenario: ${testCaseIdentifier}.`);
        }

        // Overrides the base 'restartTest' method to log resumption.
        resumeTest(testCaseIdentifier) {
            this.logger.debug(`Resumed test scenario: ${testCaseIdentifier}.`);
        }

        // Overrides the base 'startSuite' method to log suite commencement.
        beginSuite(suiteIdentifier) {
            this.logger.debug(`Commenced suite: ${suiteIdentifier}.`);
        }
    }

    // Module to ensure our custom runner is the default if no other is specified.
    (function() {
        const originalOptionRetriever = SystemExecutionInitiator.prototype.retrieveOptions;
        SystemExecutionInitiator.prototype.retrieveOptions = function() {
            const currentOptions = originalOptionRetriever.call(this);
            if (!currentOptions.runner) {
                currentOptions.runner = 'guggenheim';
            }
            return currentOptions;
        };
    })();

    // Helper function to retrieve a DOM element by its ID.
    function fetchElementById(elementId) {
        return document.getElementById(elementId);
    }

    // Function to update the UI with the summary of test results.
    function renderReportSummary(outcomeData, durationSeconds) {
        const reportContainer = fetchElementById('results');
        if (reportContainer) {
            if (outcomeData.failureCount || outcomeData.errorCount) {
                reportContainer.className = 'failed';
                reportContainer.innerHTML = formatOutput("Concluded in %d s. &ndash; <em>%d failures, %d errors</em> (%d assertions)",
                    [durationSeconds, outcomeData.failureCount, outcomeData.errorCount, outcomeData.assertionCount]);
            } else {
                reportContainer.className = 'passed';
                reportContainer.innerHTML = formatOutput("Concluded in %d s. &ndash; <em>%d tests passed</em> (%d assertions)",
                    [durationSeconds, outcomeData.testCount, outcomeData.assertionCount]);
            }
            reportContainer.className += ' finished';
        }
    }

    // Capture the initial set of global keys for later comparison.
    const initialGlobalKeys = new Set(Object.keys(window));
    // Define a list of global keys that are expected to exist or are allowed.
    const permittedGlobalKeys = ['guggenheim', 'Evidence', 'gallery'];

    // Function to check for new, unexpected global variables introduced during execution.
    function auditGlobalScope() {
        const isOperaBrowser = /^Opera\b/.test(navigator.userAgent);
        for (const propName in window) {
            // Check if a global property is newly added, not in the permitted list,
            // not an Opera-specific known global, and if console.warn is available.
            if (
                !initialGlobalKeys.has(propName) &&
                !permittedGlobalKeys.includes(propName) &&
                (!isOperaBrowser || typeof window[propName] !== 'object' || window[propName].id !== propName) &&
                window.console && console.warn
            ) {
                console.warn(`Unanticipated global identifier: ${propName}`);
            }
        }
    }
})();