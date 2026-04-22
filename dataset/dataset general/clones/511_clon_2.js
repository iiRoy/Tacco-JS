/*
 * Core module imports for the application.
 * This section handles external dependencies required for execution.
 */
var coreModule = require('system');
var pageEngine = require('webpage');

// Configuration object for user authentication.
// Contains various settings required for successful login operations.
var authDetails = {
    targetUrl: "https://www.amazon.com/ap/signin", // The specific URL for the sign-in page.
    emailFieldId: "ap_email",                      // HTML ID for the email input field.
    passFieldId: "ap_password",                    // HTML ID for the password input field.
    submitFormId: "ap_signin_form",                // HTML ID for the login submission form.
    userIdent: coreModule.args[1],                 // Username argument from the command line.
    userSecret: coreModule.args[2]                 // Password argument from the command line.
};

// Definitions for various service endpoints used by the application.
// These URLs point to different parts of the Amazon reading service.
var serviceEndpoints = {
    mainPortal: "http://read.amazon.com",                                      // Main entry point for the reading service.
    assetListing: "https://read.amazon.com/service/web/reader/getOwnedContent", // Endpoint to retrieve user's owned content.
    initReadStream: "https://read.amazon.com/service/web/reader/startReading?clientVersion=11223344&asin=" // Endpoint to start reading a specific asset, with a different client version.
};

// User-Agent string to mimic a specific browser for web requests.
var browserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";


/**
 * Initiates the user authentication process.
 * This function navigates to the login page, fills credentials, and submits the form.
 *
 * @param {Object} credentials         Login configuration data, including URLs and field IDs.
 * @param {Function} completionHandler Callback function executed upon successful login, receiving headers.
 */
function authenticateUser(credentials, completionHandler) {
    var browserPage = pageEngine.create(); // Create a new web page instance for navigation.
    browserPage.settings.userAgent = browserAgent; // Set the user-agent for the page to mimic a specific browser.

    // Event handler for when the page finishes loading.
    browserPage.onLoadFinished = function() {
        // Check if the current page URL matches the target login URL to ensure we are on the correct page.
        if (browserPage.url.indexOf(credentials.targetUrl) === 0) {
            // Execute a script within the context of the loaded page to interact with its DOM.
            browserPage.evaluate(function(credData) {
                // Fill in the email and password fields using their IDs, then submit the login form.
                document.getElementById(credData.emailFieldId).value = credData.userIdent;
                document.getElementById(credData.passFieldId).value = credData.userSecret;
                document.getElementById(credData.submitFormId).submit();
            }, credentials); // Pass the credentials object to the script for access.
        }
    };

    // Event handler for when a resource request is initiated by the page.
    browserPage.onResourceRequested = function(requestInfo) {
        coreModule.errorOutput.printLine("Fetching resource: " + requestInfo.url); // Log the requested URL to stderr.

        // If the requested URL is for owned content, it signifies successful login and data access.
        if (requestInfo.url.indexOf(serviceEndpoints.assetListing) === 0) {
            browserPage.close(); // Close the current page as login is effectively complete.

            var requestSpecificHeaders = {}; // Object to store custom headers from the request.
            requestInfo.headers.forEach(function(headerItem) {
                requestSpecificHeaders[headerItem.name] = headerItem.value;
            });
            completionHandler(requestSpecificHeaders); // Invoke the callback with the captured headers.
        }
    };

    // Open the main portal page to initiate the authentication flow.
    browserPage.open(serviceEndpoints.mainPortal);
}

// Begin the authentication flow using the defined details and a callback for post-login actions.
authenticateUser(authDetails, function(capturedHeaders) {
    var contentPage = pageEngine.create(); // Create a new page instance for content interaction.
    contentPage.customHeaders = capturedHeaders; // Apply the captured headers to this new page for authenticated requests.

    /**
     * Recursively loads synchronization data for a list of digital assets.
     * Processes assets one by one until the list is empty.
     *
     * @param {Array<string>} assetIdentifiers    List of asset IDs (ASINs) to process.
     * @param {Object} userAssets                 Collection of user's owned assets, indexed by ASIN.
     * @param {Function} dataCompleteCallback     Callback to execute when all assets are processed.
     */
    function retrieveAssetData(assetIdentifiers, userAssets, dataCompleteCallback) {
        if (assetIdentifiers.length > 0) { // Check if there are more assets to process.
            var currentAssetID = assetIdentifiers.shift(); // Get the next asset ID from the front of the array.
            coreModule.errorOutput.printLine("Loading asset data for: " + userAssets[currentAssetID].title); // Log asset title being processed.

            // Open the page to start reading the current asset, triggering data load.
            contentPage.open(serviceEndpoints.initReadStream + currentAssetID, function() {
                // Parse the raw page text (JSON) and assign it as sync status to the current asset.
                userAssets[currentAssetID].sync = JSON.parse(contentPage.framePlainText);
                retrieveAssetData(assetIdentifiers, userAssets, dataCompleteCallback); // Recurse for the next asset.
            });
        } else {
            dataCompleteCallback(); // All assets processed, execute the final callback.
        }
    }

    // Open the asset listing endpoint to get the user's owned content.
    contentPage.open(serviceEndpoints.assetListing, function() {
        // Parse the raw page text (JSON) to extract the list of assets to add.
        var userAssets = JSON.parse(contentPage.framePlainText).asinsToAdd;
        var assetIdentifiers = Object.keys(userAssets); // Get all property names (ASINs) from the owned assets object.

        // Start loading synchronization data for all identified assets.
        retrieveAssetData(assetIdentifiers, userAssets, function() {
            console.info(JSON.stringify(userAssets)); // Log the final structured asset data to the console.
            phantom.terminate(); // Exit the PhantomJS process gracefully.
        });
    });
});