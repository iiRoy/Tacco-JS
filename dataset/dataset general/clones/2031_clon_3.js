'use strict';

// Essential modules for orchestrating analysis operations.
const shellUtils = require('shelljs'); // Provides Unix-like shell commands in Node.js.
const pathModule = require('path'); // Core module for handling and transforming file paths.
const childProcessModule = require('child_process'); // Enables spawning child processes for external commands.
const networkClient = require('http'); // HTTP client for making network requests.
const fileSystem = require('fs'); // Node.js file system module for interacting with files.
const urlParser = require('url'); // Utility for URL resolution and parsing.

// Configuration constant for the default remote service endpoint.
const PRIMARY_REMOTE_SERVICE_ENDPOINT = 'http://inch-ci.org/api/v1/cli';

/**
 * Orchestrates the code analysis process. It first attempts to use a locally installed
 * analysis tool. If not found, it falls back to sending the analysis request to a
 * remote API service.
 *
 * @param {Array<string>} analysisParameters - An array of command-line style arguments
 *   to be passed to the analysis tool or remote service.
 * @param {string} inputDataFilePath - The absolute or relative path to the dump file
 *   containing the code information to be analyzed.
 * @param {Function} [completionCallback] - An optional callback function to be invoked
 *   upon completion of a local analysis execution. It receives the tool's output.
 */
function initiateCodeAnalysis(analysisParameters, inputDataFilePath, completionCallback) {
    // Normalize analysis parameters; ensure it's an array.
    const effectiveParameters = Array.isArray(analysisParameters) ? [...analysisParameters] : [];

    // Basic validation for the input file path.
    if (!inputDataFilePath || typeof inputDataFilePath !== 'string' || inputDataFilePath.trim() === '') {
        console.error('[ANALYSIS_ERROR]: Invalid or missing input data file path provided.');
        if (typeof completionCallback === 'function') {
            completionCallback('Error: Input data file path is required.');
        }
        return;
    }

    // Determine if a local analysis executable is available on the system.
    const isLocalToolDetected = checkLocalAnalysisToolPresence();

    if (isLocalToolDetected) {
        // Prepare additional, standard arguments for the local tool.
        const fixedLocalArgs = ["--language=javascript", `--read-from-dump=${inputDataFilePath}`];
        // Execute the local tool with both user-provided and fixed arguments.
        executeLocalAnalysisTool(effectiveParameters.concat(fixedLocalArgs), completionCallback);
    } else {
        // If no local tool, proceed with remote API invocation.
        dispatchRemoteAnalysisRequest(effectiveParameters, inputDataFilePath);
    }
}

/**
 * Handles the execution of a local analysis tool.
 * This function uses `child_process.exec` for more control over the command execution.
 *
 * @param {Array<string>} toolArguments - Arguments to be passed to the local executable.
 * @param {Function} [outputHandler] - Callback function to receive the standard output
 *   or error message from the executed tool.
 */
function executeLocalAnalysisTool(toolArguments, outputHandler) {
    // Retrieve the path to the local executable.
    const executablePath = resolveLocalToolExecutable();
    if (!executablePath) {
        const errorMessage = '[LOCAL_TOOL_ERROR]: Local analysis executable could not be found.';
        console.error(errorMessage);
        if (typeof outputHandler === 'function') {
            outputHandler(errorMessage);
        }
        return;
    }

    // Construct the full command string.
    const fullCommand = `${executablePath} ${toolArguments.join(' ')}`;
    console.log(`[LOCAL_EXEC]: Attempting to run: ${fullCommand}`);

    // Execute the command using Node.js's child_process module.
    childProcessModule.exec(fullCommand, (error, stdout, stderr) => {
        if (error) {
            const combinedErrorOutput = `[LOCAL_EXEC_FAIL]: Command failed with error: ${error.message}\nSTDERR: ${stderr}`;
            console.error(combinedErrorOutput);
            if (typeof outputHandler === 'function') {
                outputHandler(combinedErrorOutput);
            }
            return;
        }

        // Log any output to stderr as warnings.
        if (stderr.trim().length > 0) {
            console.warn(`[LOCAL_EXEC_WARN]: STDERR output received:\n${stderr}`);
        }

        // Pass the standard output to the provided handler or print directly.
        if (typeof outputHandler === 'function') {
            outputHandler(stdout);
        } else {
            process.stdout.write(stdout);
        }
    });
}

/**
 * Dispatches an analysis request to a remote API endpoint.
 * The content of the specified file is read, parsed, augmented, and sent as a JSON payload.
 *
 * @param {Array<string>} requestArgs - Arguments to be included in the remote request payload.
 * @param {string} sourceInputFile - Path to the file whose content will form the base of the request.
 */
function dispatchRemoteAnalysisRequest(requestArgs, sourceInputFile) {
    const currentRequestParams = Array.isArray(requestArgs) ? [...requestArgs] : [];
    let parsedFileContent;

    try {
        // Synchronously read the content of the source file.
        // For production, consider an asynchronous approach for large files.
        const rawBuffer = fileSystem.readFileSync(sourceInputFile);
        const fileStringContent = rawBuffer.toString('utf8');
        parsedFileContent = JSON.parse(fileStringContent);
    } catch (readParseError) {
        console.error(`[REMOTE_REQUEST_ERROR]: Failed to read or parse file '${sourceInputFile}': ${readParseError.message}`);
        return; // Abort if file processing fails.
    }

    // Embed the additional request arguments into the parsed file content object.
    parsedFileContent.request_arguments = currentRequestParams; // Renamed property for clarity.

    // Convert the complete payload object to a JSON string for transmission.
    const payloadToSend = JSON.stringify(parsedFileContent);

    // Resolve the target API endpoint URL.
    const apiEndpointUrl = retrieveRemoteServiceEndpoint();
    const endpointDetails = urlParser.parse(apiEndpointUrl);

    // Construct the options object for the HTTP request.
    const httpRequestConfig = {
        hostname: endpointDetails.hostname,
        port: endpointDetails.port || (endpointDetails.protocol === 'https:' ? 443 : 80), // Default port based on protocol.
        path: endpointDetails.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payloadToSend, 'utf8') // Calculate byte length for accurate header.
        }
    };

    // Create and send the HTTP request.
    const httpRequest = networkClient.request(httpRequestConfig, (serverResponse) => {
        serverResponse.setEncoding('utf8');
        let accumulatedResponseData = '';

        serverResponse.on('data', (dataFragment) => {
            accumulatedResponseData += dataFragment;
        });

        serverResponse.on('end', () => {
            // Output the received data directly to standard output.
            process.stdout.write(accumulatedResponseData);
            console.log('\n[REMOTE_REQUEST]: Remote analysis response received and displayed.');
        });
    });

    // Attach an error listener for network or request-related issues.
    httpRequest.on('error', (requestError) => {
        console.error(`[REMOTE_REQUEST_ERROR]: Problem during remote request: ${requestError.message}`);
    });

    // Write the JSON payload to the request body and finalize the request.
    httpRequest.write(payloadToSend);
    httpRequest.end();
}

/**
 * Determines the full path to the local analysis tool executable.
 * It first checks an environment variable for a custom path, then
 * falls back to searching standard system PATHs.
 *
 * @returns {string|null} The absolute path to the executable, or `null` if not found.
 */
function resolveLocalToolExecutable() {
    const customBinPath = process.env.LOCAL_TOOL_BINARY_DIR; // Custom environment variable name.
    let discoveredExecutablePath = null;
    const toolIdentifier = 'analysis_cli_utility'; // Generic name for the tool.

    if (customBinPath) {
        // If a custom directory is specified, construct the full path.
        discoveredExecutablePath = pathModule.join(customBinPath, "bin", toolIdentifier);
        console.log(`[TOOL_PATH_RESOLVE]: Using custom tool path from env var: ${discoveredExecutablePath}`);
    } else {
        // Otherwise, search common system paths using shelljs.
        discoveredExecutablePath = shellUtils.which(toolIdentifier);
        if (discoveredExecutablePath) {
            console.log(`[TOOL_PATH_RESOLVE]: Found tool in system PATH: ${discoveredExecutablePath}`);
        } else {
            console.warn(`[TOOL_PATH_RESOLVE_WARN]: '${toolIdentifier}' not found in system PATH or via custom env variable.`);
        }
    }
    // Return the path only if it's a non-empty string.
    return (typeof discoveredExecutablePath === 'string' && discoveredExecutablePath.length > 0) ? discoveredExecutablePath : null;
}

/**
 * Retrieves the URL of the remote analysis service endpoint.
 * An environment variable can override the default configured endpoint.
 *
 * @returns {string} The resolved URL for the remote service.
 */
function retrieveRemoteServiceEndpoint() {
    const customApiEndpoint = process.env.REMOTE_API_OVERRIDE_URL; // Custom environment variable name.
    let finalEndpoint = PRIMARY_REMOTE_SERVICE_ENDPOINT;

    if (customApiEndpoint) {
        // If an override is present, perform a basic protocol check.
        if (!customApiEndpoint.startsWith('http://') && !customApiEndpoint.startsWith('https://')) {
            console.warn(`[ENDPOINT_CONFIG_WARN]: Override URL "${customApiEndpoint}" lacks protocol; defaulting to HTTP.`);
            finalEndpoint = `http://${customApiEndpoint}`; // Prepend HTTP protocol if missing.
        } else {
            finalEndpoint = customApiEndpoint;
        }
        console.log(`[ENDPOINT_CONFIG]: Using overridden remote API endpoint: ${finalEndpoint}`);
    } else {
        console.log(`[ENDPOINT_CONFIG]: Using default remote API endpoint: ${finalEndpoint}`);
    }
    return finalEndpoint;
}

/**
 * Checks for the presence and executability of the local analysis tool.
 *
 * @returns {boolean} `true` if the local tool is found, `false` otherwise.
 */
function checkLocalAnalysisToolPresence() {
    const isPresent = !!resolveLocalToolExecutable();
    if (isPresent) {
        console.info('[TOOL_PRESENCE]: Local analysis tool successfully located.');
    } else {
        console.info('[TOOL_PRESENCE]: Local analysis tool not found; will attempt remote service.');
    }
    return isPresent;
}

// Export the primary analysis initiation function.
module.exports = {
    triggerAnalysis: initiateCodeAnalysis // Renamed the exported function from 'run' to 'triggerAnalysis'.
};