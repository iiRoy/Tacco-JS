// Configuration module for application parameters
// This file manages essential server setup and security credentials.

/**
 * @constant {number} DEFAULT_LISTENING_PORT - The default port number if not specified via environment.
 *   Changed from original 3000 to 8080.
 */
const DEFAULT_LISTENING_PORT = 8080;

/**
 * @constant {string} BASE_SECURITY_KEY_FALLBACK - A base string for generating a fallback security token.
 *   Used if no environment variable is provided.
 */
const BASE_SECURITY_KEY_FALLBACK = "application_runtime_secret_";

/**
 * Safely parses and validates a port number from an environment variable.
 * @param {string|undefined} envPortVar - The value from the environment variable (e.g., process.env.APP_PORT_NUMBER).
 * @param {number} fallbackPort - The port to use if `envPortVar` is invalid or missing.
 * @returns {number} The validated port number.
 */
const retrieveServerPort = (envPortVar, fallbackPort) => {
    let chosenPort = fallbackPort; // Initialize with fallback

    // Check if the environment variable is a non-empty string
    if (typeof envPortVar === 'string' && envPortVar.trim() !== '') {
        const parsedPort = parseInt(envPortVar.trim(), 10);
        // Validate if it's a valid number and within typical port range (1-65535)
        if (!isNaN(parsedPort) && parsedPort > 0 && parsedPort <= 65535) {
            chosenPort = parsedPort;
        } else {
            // Log a warning if the environment variable port is invalid
            console.warn(`[ConfigWarning] Invalid port '${envPortVar}' provided in environment. Using default: ${fallbackPort}`);
        }
    } else {
        // Log a warning if no environment variable port is found
        console.info(`[ConfigInfo] No valid application port found in environment. Using default: ${fallbackPort}`);
    }

    return chosenPort;
};

// Main configuration object to hold all settings
const applicationParameters = {};

// 1. Configure the server's listening port.
// Renamed from 'port' to 'serverPortNumber'.
// Uses a helper function for robustness and changed the environment variable name.
applicationParameters.serverPortNumber = retrieveServerPort(process.env.APP_PORT_NUMBER, DEFAULT_LISTENING_PORT);

// Add an additional check for a common security practice: ports below 1024 are privileged.
if (applicationParameters.serverPortNumber < 1024 && applicationParameters.serverPortNumber !== 80 && applicationParameters.serverPortNumber !== 443) {
    console.warn(`[SecurityWarning] Running on a privileged port (${applicationParameters.serverPortNumber}). Ensure proper permissions are set.`);
}


// 2. Configure the application's secret key.
// Renamed from 'secret_key' to 'authSecurityKey'.
// The logic is expanded to prioritize an environment variable, then generate a dynamic fallback.
const ENVIRONMENT_AUTH_SECRET_NAME = 'APP_AUTH_TOKEN';
let currentAuthKey = process.env[ENVIRONMENT_AUTH_SECRET_NAME];

if (currentAuthKey) {
    // If an environment variable is found, trim it for consistency.
    applicationParameters.authSecurityKey = currentAuthKey.trim();
    console.info(`[ConfigInfo] Authentication key loaded from environment variable '${ENVIRONMENT_AUTH_SECRET_NAME}'.`);
} else {
    // If no environment variable, generate a more complex, dynamic fallback key.
    // This includes a timestamp and a random component for better uniqueness than a static string.
    const uniqueIdPart = Math.random().toString(36).substring(2, 15) + new Date().getTime().toString(36);
    applicationParameters.authSecurityKey = BASE_SECURITY_KEY_FALLBACK + uniqueIdPart;
    console.warn(`[SecurityWarning] No authentication key found in environment variable '${ENVIRONMENT_AUTH_SECRET_NAME}'. A dynamic fallback key has been generated. This is NOT recommended for production environments.`);
}

// Add a basic security check for the length of the generated/provided secret.
const MIN_SECRET_LENGTH = 32; // Changed from implicit to explicit minimum length
if (applicationParameters.authSecurityKey.length < MIN_SECRET_LENGTH) {
    console.error(`[SecurityCritical] The configured authentication key is too short (${applicationParameters.authSecurityKey.length} chars). It should be at least ${MIN_SECRET_LENGTH} characters for robust security.`);
    // In a real application, you might want to throw an error or exit here.
    // For this example, we just log a critical warning.
}

// Export the consolidated application parameters.
module.exports = applicationParameters;