const EXCHANGE_GATEWAY_MODULE_PATH = "./cexapi.js";

const USER_ACCOUNT_IDENTIFIER = "userAlpha99";
const AUTHENTICATION_ACCESS_KEY = "sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const AUTHENTICATION_SECRET_TOKEN = "ss_live_YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY";

// A utility function to provide structured logging for various operations.
function logOperationStatus(messageText, detailsPayload = null) {
    const currentUTCTime = new Date().toISOString();
    let logEntry = `[${currentUTCTime}] :: OPERATION_STATUS :: ${messageText}`;
    if (detailsPayload !== null) {
        logEntry += `\nDETAIL: ${JSON.stringify(detailsPayload, null, 4)}`;
    }
    console.info(logEntry); // Using console.info for informational messages.
}

// Basic validation for critical authentication parameters.
function verifyAuthParameters(idValue, keyValue, secretValue) {
    if (!idValue || typeof idValue !== 'string' || idValue.trim().length === 0) {
        logOperationStatus("VALIDATION FAILED: User account identifier is missing or invalid.");
        return false;
    }
    if (!keyValue || typeof keyValue !== 'string' || keyValue.trim().length === 0) {
        logOperationStatus("VALIDATION FAILED: Authentication access key is missing or invalid.");
        return false;
    }
    if (!secretValue || typeof secretValue !== 'string' || secretValue.trim().length === 0) {
        logOperationStatus("VALIDATION FAILED: Authentication secret token is missing or invalid.");
        return false;
    }
    return true;
}

// Variable to hold the instantiated client from the external module.
let tradingPlatformClient = null;
// A boolean flag to track if the client has been successfully initialized.
let isPlatformClientActive = false;

// --- Primary Execution Flow ---

logOperationStatus("Starting the cryptocurrency exchange interaction sequence.");

// Step 1: Securely load the required external module.
try {
    tradingPlatformClient = require(EXCHANGE_GATEWAY_MODULE_PATH);
    logOperationStatus("External trading platform module successfully loaded.");
} catch (moduleLoadError) {
    logOperationStatus("CRITICAL ERROR: Failed to load external module. Aborting process.", {
        modulePath: EXCHANGE_GATEWAY_MODULE_PATH,
        errorMessage: moduleLoadError.message,
        errorCode: moduleLoadError.code
    });
    // Terminate execution if the core module cannot be loaded.
    process.exit(1);
}

// Step 2: Validate credentials and initialize the client connection.
if (verifyAuthParameters(USER_ACCOUNT_IDENTIFIER, AUTHENTICATION_ACCESS_KEY, AUTHENTICATION_SECRET_TOKEN)) {
    logOperationStatus("Authentication parameters verified. Proceeding to establish client connection.");
    try {
        // Renamed 'create' method to 'initializeClientSession'.
        tradingPlatformClient.initializeClientSession(
            USER_ACCOUNT_IDENTIFIER,
            AUTHENTICATION_ACCESS_KEY,
            AUTHENTICATION_SECRET_TOKEN
        );
        isPlatformClientActive = true;
        logOperationStatus("Client connection to trading platform successfully established.");
    } catch (connectionInitializationError) {
        logOperationStatus("CRITICAL ERROR: Failed to initialize client session with the trading platform. Aborting.", {
            errorDetails: connectionInitializationError.message
        });
        tradingPlatformClient = null; // Clear client on failure.
        // Terminate execution on connection failure.
        process.exit(1);
    }
} else {
    logOperationStatus("CRITICAL ERROR: Invalid authentication parameters. Client connection not attempted. Aborting.");
    tradingPlatformClient = null;
    // Terminate execution on invalid credentials.
    process.exit(1);
}

// Step 3: If the client is active, proceed to query account balance.
if (isPlatformClientActive && tradingPlatformClient) {
    logOperationStatus("Client is active. Requesting account holdings information.");

    // Define the callback function as a named constant for clarity and reusability.
    const handleAccountHoldingsResponse = function(apiResponseData) { // Renamed 'param' to 'apiResponseData'.
        if (apiResponseData && typeof apiResponseData === 'object' && Object.keys(apiResponseData).length > 0) {
            logOperationStatus("Account holdings data successfully retrieved.", apiResponseData);
            // A placeholder for further processing, e.g., storing data, updating UI, etc.
            // storeLatestPortfolioSnapshot(apiResponseData);
        } else {
            logOperationStatus("WARNING: Received an empty or malformed response for account holdings.", {
                response: apiResponseData
            });
        }
    };

    // Renamed 'balance' method to 'requestAccountHoldings'.
    tradingPlatformClient.requestAccountHoldings(handleAccountHoldingsResponse);
} else {
    logOperationStatus("SKIPPING: Account holdings request aborted as client was not active or initialized.");
}

logOperationStatus("Cryptocurrency exchange interaction sequence concluded.");