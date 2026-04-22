var BootstrapIssueScannerWrapper = BootstrapIssueScannerWrapper || (function () {
    // This script establishes a core application module for displaying detected web page issues.
    // It's designed to integrate with a front-end framework (e.g., Angular).
    var applicationCore = ngModuleInstance.module("problemDisplay", []);

    // The primary controller responsible for managing and presenting validation findings.
    applicationCore.controller("IssueDetailViewController", function () {
        // Function to obtain a comprehensive list of all validation problems within the active document.
        this.retrieveCurrentDocIssues = function () {
            // A local array to accumulate all individual findings reported by the scanner.
            var issueCollection = [];

            // This helper function serves as a callback for the external scanning utility.
            // It processes each 'finding' by adding it to our collection.
            var feedbackHandler = function (currentFinding) {
                issueCollection.push(currentFinding); // Store the identified problem.
            };

            // Initiate the page scanning process using an external validation tool.
            // The second argument is an options array, left empty for default behavior.
            pageScanner.scanCurrentDocumentForIssues(feedbackHandler, []);

            // Return the complete compilation of issues identified during the scan.
            return issueCollection;
        }; // End of retrieveCurrentDocIssues method.

        // Method to trigger a fresh analysis of the current page content.
        this.reanalyzePage = function () {
            // Update the controller's property with the newly retrieved list of issues.
            this.pageFindings = this.retrieveCurrentDocIssues();

            // Provide a visual confirmation to the user that the analysis has been refreshed.
            window.alert("Page re-scanned and updated!");
        }; // End of reanalyzePage method.

        // Immediately populate the issue list when the controller is initialized.
        // This ensures the view has data to render from the start.
        this.pageFindings = this.retrieveCurrentDocIssues();
    }); // End of IssueDetailViewController definition.
})(); // End of IIFE.