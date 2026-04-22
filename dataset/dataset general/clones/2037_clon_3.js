var PageValidationUtilityBundle = PageValidationUtilityBundle || (function () {
    // Ensure AngularJS is available before proceeding with module initialization.
    // If not found, log a warning and return to prevent errors.
    if (typeof angular === 'undefined' || !angular.module) {
        console.warn("AngularJS is not detected in the global scope. Page validation functionality will not be initialized.");
        return null;
    }

    // Define constants for module and controller identifiers.
    // This practice enhances readability and simplifies future refactoring.
    const VALIDATION_MODULE_IDENTIFIER = "pageIssueReporterModule";
    const ISSUE_DISPLAY_CONTROLLER_NAME = "IssueDisplayController";

    // Initialize the main Angular module dedicated to reporting page issues.
    // This module currently has no external Angular dependencies.
    var validationModule = angular.module(VALIDATION_MODULE_IDENTIFIER, []);

    // Register the primary controller responsible for orchestrating the display
    // and management of validation findings.
    validationModule.controller(ISSUE_DISPLAY_CONTROLLER_NAME, function () {
        // Capture 'this' context in a 'vm' (ViewModel) variable.
        // This is a common pattern in Angular controllers for consistency.
        const vm = this;

        // Initialize controller properties.
        // These will hold the state related to the page validation process.
        vm.activeFindings = []; // Array to store all currently detected issues.
        vm.lastScanTimestamp = null; // Records when the last validation scan was performed.
        vm.totalIssueCount = 0; // Tracks the total number of issues found in the last scan.
        vm.isScanning = false; // Flag to indicate if a scan is currently in progress.

        /**
         * Executes a scan of the current web document for validation issues using the bootlint library.
         * It collects all reported issues and updates the controller's state.
         * @returns {Array<Object>} A collection of issue objects identified during the scan.
         */
        vm.executePageScan = function () {
            if (vm.isScanning) {
                console.info("A scan is already in progress. Please wait.");
                return vm.activeFindings;
            }

            vm.isScanning = true;
            let currentScanResults = []; // Temporary array for findings of the current scan.

            // Critical check: Ensure the bootlint library and its core function are available.
            if (typeof window.bootlint === 'undefined' || typeof bootlint.lintCurrentDocument !== 'function') {
                console.error("The 'bootlint' library or its 'lintCurrentDocument' method is missing. Cannot perform page validation.");
                vm.isScanning = false;
                // If bootlint is unavailable, return existing findings or an empty array.
                return vm.activeFindings.length > 0 ? vm.activeFindings : [];
            }

            // Define the callback function that bootlint will use to report each finding.
            const issueCollectorCallback = function (individualFinding) {
                // Perform a basic validation on the reported finding object.
                if (individualFinding && typeof individualFinding === 'object') {
                    // Optional: Add a unique ID or process the finding further before storing.
                    // individualFinding.id = Date.now() + Math.random();
                    currentScanResults.push(individualFinding);
                } else {
                    console.warn("Received an invalid or malformed finding object from bootlint:", individualFinding);
                }
            };

            // Define scan configuration options. This object can be populated with
            // specific rules or parameters if the bootlint API supports them.
            const scanOptions = {
                // Example: skip specific rules, e.g., 'W001': true
            };

            // Initiate the bootlint scan on the current document.
            // The 'issueCollectorCallback' will be invoked for every detected issue.
            try {
                bootlint.lintCurrentDocument(issueCollectorCallback, scanOptions);
            } catch (error) {
                console.error("An error occurred during bootlint execution:", error);
                vm.isScanning = false;
                return vm.activeFindings;
            }
            
            // Update the controller's state with the results of the recent scan.
            vm.totalIssueCount = currentScanResults.length;
            vm.isScanning = false;
            return currentScanResults;
        };

        /**
         * Triggers a comprehensive re-validation of the page.
         * This method updates the displayed findings, records the scan timestamp,
         * and provides console feedback on the validation process.
         */
        vm.initiatePageRevalidation = function () {
            console.info("Starting page re-validation process...");
            vm.activeFindings = vm.executePageScan(); // Execute scan and update findings.
            vm.lastScanTimestamp = new Date().toLocaleString(); // Update the timestamp of the last scan.
            console.log(`Re-validation completed. Found ${vm.totalIssueCount} issues.`);
        };

        // Initial Controller Setup:
        // Perform an immediate page re-validation when the controller is first loaded.
        // This ensures that validation findings are available as soon as the page renders.
        vm.initiatePageRevalidation();

    });

    // Return the configured Angular module instance, allowing it to be used
    // by other parts of the application or for bootstrapping.
    return validationModule;

})(); // End of the Immediately-Invoked Function Expression (IIFE).