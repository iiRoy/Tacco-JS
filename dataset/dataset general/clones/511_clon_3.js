var sysHandler = require('system');
var pageMgr = require('webpage');

// Constants and configuration for the web interaction process.
const CLIENT_VERSION_ID = "10505419"; // Identifier for the client application.
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15"; // Default browser identification string.

// Helper function for logging messages to standard error.
const logIssue = (msg) => sysHandler.stderr.writeLine(`[ERROR] ${new Date().toISOString()} - ${msg}`);
// Helper function for logging messages to standard output.
const logStatus = (msg) => sysHandler.stdout.writeLine(`[INFO] ${new Date().toISOString()} - ${msg}`);

// Configuration for the authentication process.
var sessionConfig = {
  targetUrl: "https://www.amazon.com/ap/signin",
  mailField: "ap_email",      // ID of the email input field.
  passField: "ap_password",   // ID of the password input field.
  submitFormId: "ap_signin_form", // ID of the login form.
  userIdentifier: sysHandler.args[1], // Username from command-line arguments.
  secretKey: sysHandler.args[2]     // Password from command-line arguments.
};

// Ensure command-line arguments are provided.
if (!sessionConfig.userIdentifier || !sessionConfig.secretKey) {
  logIssue("Missing command-line arguments for username and password.");
  logIssue("Usage: phantomjs <script_name>.js <username> <password>");
  sysHandler.exit(1); // Exit with an error code.
}

// Map of service endpoints.
var serviceRoutes = {
  mainPortal: "http://read.amazon.com", // Entry point for the service.
  assetListing: "https://read.amazon.com/service/web/reader/getOwnedContent", // Endpoint to retrieve owned content.
  contentAccessUrl: `https://read.amazon.com/service/web/reader/startReading?clientVersion=${CLIENT_VERSION_ID}&asin=` // Base URL for accessing content.
};

var agentString = DEFAULT_USER_AGENT; // The user agent string to be used.

/**
 * Initiates the authentication process.
 * @param {object} authDetails - Configuration containing login credentials and target URLs.
 * @param {function} onCompletion - Callback function to execute upon successful authentication, receiving headers.
 */
function initiateAuth(authDetails, onCompletion) {
  if (!authDetails || typeof onCompletion !== 'function') {
    logIssue("Invalid authentication details or completion handler provided.");
    return;
  }

  const clientPage = pageMgr.create(); // Create a new web page instance.
  clientPage.settings.userAgent = agentString; // Set the user agent for the page.
  clientPage.settings.javascriptEnabled = true; // Ensure JavaScript is enabled.

  // Handler for when a page finishes loading.
  clientPage.onLoadFinished = function(status) {
    if (status !== 'success') {
      logIssue(`Page load failed for URL: ${clientPage.url} with status: ${status}`);
      return;
    }

    // Check if the current URL is the login page.
    if (clientPage.url.startsWith(authDetails.targetUrl)) {
      logStatus(`On login page: ${clientPage.url}. Attempting to fill form.`);
      clientPage.evaluate(function(cfg) {
        const emailInput = document.getElementById(cfg.mailField);
        const passwordInput = document.getElementById(cfg.passField);
        const loginForm = document.getElementById(cfg.submitFormId);

        // Basic validation before attempting to fill and submit.
        if (!emailInput || !passwordInput || !loginForm) {
          console.error("One or more login form elements not found.");
          return;
        }

        emailInput.value = cfg.userIdentifier;
        passwordInput.value = cfg.secretKey;
        loginForm.submit(); // Submit the form.
      }, authDetails);
    } else {
      logStatus(`Page loaded: ${clientPage.url}`);
    }
  };

  // Handler for monitoring resource requests made by the page.
  clientPage.onResourceRequested = function(requestData, networkRequest) {
    // Optionally log all requests.
    // logStatus(`Requesting: ${requestData.url}`);

    // If the requested URL is the asset listing endpoint, we've likely authenticated.
    if (requestData.url.startsWith(serviceRoutes.assetListing)) {
      logStatus("Detected asset listing request, extracting headers...");
      clientPage.close(); // Close the page as we have what we need.

      const extractedHeaders = {};
      // Convert request headers array to an object for easier access.
      for (const header of requestData.headers) {
        extractedHeaders[header.name] = header.value;
      }
      onCompletion(extractedHeaders); // Pass the extracted headers to the callback.
    }
  };

  // Open the main portal page to start the process.
  logStatus(`Opening initial portal: ${serviceRoutes.mainPortal}`);
  clientPage.open(serviceRoutes.mainPortal);
}

// Main execution flow after authentication.
initiateAuth(sessionConfig, function(responseHeaders) {
  logStatus("Authentication successful, proceeding to content retrieval.");
  const dataPage = pageMgr.create(); // Create a new page for content operations.
  dataPage.customHeaders = responseHeaders; // Set the custom headers obtained during login.
  dataPage.settings.javascriptEnabled = false; // Disable JS for content pages if not strictly needed for parsing.

  /**
   * Recursively fetches synchronization data for a list of assets.
   * @param {Array<string>} assetIdentifiers - List of ASINs (asset identifiers) to process.
   * @param {object} assetCollection - Object to store asset data, keyed by ASIN.
   * @param {function} completionHandler - Callback to execute once all assets are processed.
   */
  function fetchAssetDetails(assetIdentifiers, assetCollection, completionHandler) {
    // Base case: If no more asset identifiers, complete the process.
    if (assetIdentifiers.length === 0) {
      logStatus("All asset details fetched.");
      completionHandler();
      return;
    }

    const currentAssetId = assetIdentifiers.shift(); // Get the next asset ID.
    const assetTitle = assetCollection[currentAssetId]?.title || currentAssetId; // Get title or use ID as fallback.

    logStatus(`Fetching sync data for asset: "${assetTitle}" (${currentAssetId})`);

    // Open the page to read the specific asset's sync data.
    dataPage.open(`${serviceRoutes.contentAccessUrl}${currentAssetId}`, function(status) {
      if (status !== 'success') {
        logIssue(`Failed to open asset URL for ${currentAssetId}: ${status}`);
        // Optionally, handle error more robustly, e.g., retry or skip.
        // For Type III, we'll just log and continue the recursion for other assets.
        assetCollection[currentAssetId].syncInfo = { error: `Failed to load: ${status}` };
        fetchAssetDetails(assetIdentifiers, assetCollection, completionHandler);
        return;
      }

      const rawPageContent = dataPage.framePlainText;
      if (rawPageContent && rawPageContent.trim().length > 0) {
        try {
          assetCollection[currentAssetId].syncInfo = JSON.parse(rawPageContent);
        } catch (e) {
          logIssue(`Error parsing JSON for ${currentAssetId}: ${e.message}. Raw content: ${rawPageContent.substring(0, 100)}...`);
          assetCollection[currentAssetId].syncInfo = { error: `JSON parse failed: ${e.message}` };
        }
      } else {
        logIssue(`No content received for asset ${currentAssetId}.`);
        assetCollection[currentAssetId].syncInfo = { error: "No content" };
      }

      // Continue with the next asset.
      fetchAssetDetails(assetIdentifiers, assetCollection, completionHandler);
    });
  }

  // First, open the owned content listing page.
  logStatus(`Retrieving owned content list from: ${serviceRoutes.assetListing}`);
  dataPage.open(serviceRoutes.assetListing, function(status) {
    if (status !== 'success') {
      logIssue(`Failed to retrieve owned content: ${status}`);
      sysHandler.exit(1);
    }

    const rawContentList = dataPage.framePlainText;
    if (!rawContentList || rawContentList.trim().length === 0) {
      logIssue("No owned content data received.");
      sysHandler.exit(1);
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(rawContentList);
    } catch (e) {
      logIssue(`Failed to parse owned content JSON: ${e.message}. Raw: ${rawContentList.substring(0, 100)}...`);
      sysHandler.exit(1);
    }

    // Extract the main collection of assets.
    const mainAssetCollection = parsedContent.asinsToAdd;
    if (!mainAssetCollection || Object.keys(mainAssetCollection).length === 0) {
      logStatus("No ASINs found in owned content.");
      sysHandler.exit(0);
    }

    const assetKeys = Object.keys(mainAssetCollection); // Get all ASINs.
    logStatus(`Found ${assetKeys.length} assets. Starting detail fetch.`);

    // Start the recursive process to fetch details for each asset.
    fetchAssetDetails(assetKeys, mainAssetCollection, function() {
      // Once all assets are processed, output the final aggregated data.
      sysHandler.stdout.writeLine(JSON.stringify(mainAssetCollection, null, 2)); // Pretty print JSON to stdout.
      sysHandler.exit(0); // Exit successfully.
    });
  });
});