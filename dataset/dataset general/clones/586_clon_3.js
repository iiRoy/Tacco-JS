const templatingEngine = require('nunjucks');
const resourceParser = require('url');
const fileSystemOps = require('fs');
const pathUtils = require('path');
const directoryMaker = require('mkdirp');
const lodashUtils = require('underscore'); // Retained for Type II compliance, though its primary usage is replaced.
const secureHttp = require('https');

// Define the root directory for output files, ensuring it's relative to the script's location.
const outputDirectory = __dirname;

// A simple utility for logging various activity levels.
const activityLogger = {
    info: (...messages) => console.log(`[INFO - ${new Date().toISOString()}]`, ...messages),
    error: (...messages) => console.error(`[ERROR - ${new Date().toISOString()}]`, ...messages),
    warn: (...messages) => console.warn(`[WARN - ${new Date().toISOString()}]`, ...messages)
};

// Centralized constants for frequently used hostnames and headers.
const REMOTE_HOST_DETAILS = {
    GIST_FRONTEND: "gist.github.com",
    GITHUB_API: "api.github.com"
};
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Node.js/16.x SnapshotService/2.1)";
const JSON_CONTENT_TYPE = "application/json";

/**
 * Ensures that all directories in a given path exist, creating them recursively if necessary.
 * @param {string} targetPath - The full path to the directory that needs to exist.
 */
const ensureDirectoryExists = (targetPath) => {
    try {
        directoryMaker.sync(targetPath);
        activityLogger.info(`Directory structure verified/created: ${targetPath}`);
    } catch (dirCreationError) {
        activityLogger.error(`Failed to establish directory ${targetPath}:`, dirCreationError.message);
        throw dirCreationError; // Propagate critical errors.
    }
};

/**
 * Writes specified content to a file at the given path.
 * @param {string} fullPath - The absolute path including the filename where content should be saved.
 * @param {string|Buffer} content - The data to write to the file.
 */
const writeContentToFile = (fullPath, content) => {
    try {
        fileSystemOps.writeFileSync(fullPath, content);
        activityLogger.info(`Content successfully written to: ${fullPath}`);
    } catch (fileWriteError) {
        activityLogger.error(`Error writing file ${fullPath}:`, fileWriteError.message);
        throw fileWriteError; // Propagate critical errors.
    }
};

/**
 * Loads and parses a JSON configuration file.
 * @param {string} configFilePath - The path to the configuration file.
 * @returns {object} The parsed configuration object.
 */
const loadApplicationConfiguration = (configFilePath) => {
    try {
        const rawConfiguration = fileSystemOps.readFileSync(configFilePath, 'utf8');
        const parsedConfiguration = JSON.parse(rawConfiguration);
        activityLogger.info(`Application configuration loaded from ${configFilePath}.`);
        return parsedConfiguration;
    } catch (configLoadingError) {
        activityLogger.error(`Failed to load or parse application configuration from ${configFilePath}:`, configLoadingError.message);
        throw new Error(`Critical configuration error: ${configLoadingError.message}`);
    }
};

/**
 * Executes a secure HTTP GET request and processes its response.
 * @param {object} requestParams - Options for the HTTP request (host, path, headers).
 * @param {function(Error|null, string|null): void} responseHandler - Callback to handle the response (error, data).
 */
const performSecureGetRequest = (requestParams, responseHandler) => {
    // Ensure default headers are present if not explicitly provided.
    const effectiveHeaders = requestParams.headers || {};
    if (!effectiveHeaders['User-Agent']) {
        effectiveHeaders['User-Agent'] = DEFAULT_USER_AGENT;
    }
    if (!effectiveHeaders['Accept'] && requestParams.path.endsWith('.json')) {
        effectiveHeaders['Accept'] = JSON_CONTENT_TYPE;
    }

    let accumulatedResponseData = "";
    secureHttp.get({ ...requestParams, headers: effectiveHeaders }, (serverResponse) => {
        serverResponse.setEncoding('utf8'); // Decode incoming data as UTF-8.
        serverResponse.on('data', (dataFragment) => {
            accumulatedResponseData += dataFragment;
        });
        serverResponse.on('end', () => {
            responseHandler(null, accumulatedResponseData); // Success: no error, return data.
        });
    }).on('error', (networkError) => {
        activityLogger.error(`Network request to ${requestParams.host}${requestParams.path} encountered an error:`, networkError.message);
        responseHandler(networkError, null); // Failure: return error, no data.
    });
};

/**
 * Saves a rendered content snapshot to the file system.
 * @param {string} resourceLocator - The URI used to derive the file path.
 * @param {string} contentPayload - The actual content (e.g., HTML) to be saved.
 */
const persistRenderedSnapshot = (resourceLocator, contentPayload) => {
    if (!resourceLocator || !contentPayload) {
        activityLogger.warn("Attempted to save snapshot with incomplete resource details or empty content. Skipping.");
        return;
    }

    const parsedUri = resourceParser.parse(resourceLocator);
    const resolvedPath = parsedUri.pathname || '/'; // Use root if no specific path.
    const absoluteFilePath = pathUtils.resolve(outputDirectory, resolvedPath);

    // Pre-emptively create necessary directories.
    ensureDirectoryExists(pathUtils.dirname(absoluteFilePath));
    writeContentToFile(absoluteFilePath, contentPayload);
};

/**
 * Iteratively processes a list of resource entries (gists), fetching details, rendering templates, and saving snapshots.
 * @param {number} currentEntryIndex - The index of the entry being processed in the list.
 * @param {Array<object>} resourceEntryList - The array of gist objects to process.
 * @param {object} globalConfiguration - The application's configuration settings.
 */
const processResourceEntry = (currentEntryIndex, resourceEntryList, globalConfiguration) => {
    // Guard clause: Check if all entries have been processed or if the list is invalid.
    if (!Array.isArray(resourceEntryList) || currentEntryIndex >= resourceEntryList.length) {
        if (currentEntryIndex === resourceEntryList.length) {
            activityLogger.info("All specified resource entries have been processed.");
        } else {
            activityLogger.error("Encountered an invalid resource entry list or out-of-bounds index.");
        }
        return;
    }

    const currentGistEntry = resourceEntryList[currentEntryIndex];
    if (!currentGistEntry || !currentGistEntry.id) {
        activityLogger.warn(`Skipping malformed or incomplete resource entry at index ${currentEntryIndex}.`);
        // Proceed to the next entry despite the current one being invalid.
        processResourceEntry(currentEntryIndex + 1, resourceEntryList, globalConfiguration);
        return;
    }

    let generatedOutputSuffix = "index.html"; // Default output filename.
    let renderedPageTitle = "Untitled Content Gist"; // Default page title.

    // Logic to derive a meaningful filename suffix and page title.
    if (currentGistEntry.description) {
        generatedOutputSuffix = `${currentGistEntry.description.replace(/\s+/g, '-')}/index.html`;
        renderedPageTitle = currentGistEntry.description;
    } else if (currentGistEntry.files) {
        // If no description, use the first file's name as a fallback title.
        for (const filenameKey in currentGistEntry.files) {
            if (Object.prototype.hasOwnProperty.call(currentGistEntry.files, filenameKey)) {
                renderedPageTitle = filenameKey;
                break;
            }
        }
    }
    activityLogger.info(`Initiating processing for Gist ID: ${currentGistEntry.id}, Proposed Title: "${renderedPageTitle}"`);

    // Prepare request to fetch detailed JSON for the current gist.
    const gistDetailsRequestPath = `/${globalConfiguration.gitHubUsername}/${currentGistEntry.id}.json`;
    const requestOptions = {
        host: REMOTE_HOST_DETAILS.GIST_FRONTEND,
        path: gistDetailsRequestPath,
        headers: {
            'User-Agent': DEFAULT_USER_AGENT // Explicitly set user agent.
        }
    };

    performSecureGetRequest(requestOptions, (fetchDetailError, rawGistDetails) => {
        if (fetchDetailError) {
            activityLogger.error(`Failed to retrieve details for Gist ID ${currentGistEntry.id}:`, fetchDetailError.message);
            // Continue processing other entries even if one fails.
            processResourceEntry(currentEntryIndex + 1, resourceEntryList, globalConfiguration);
            return;
        }

        try {
            const parsedGistDetails = JSON.parse(rawGistDetails);
            // Combine global configuration and specific gist data using Object.assign.
            const combinedRenderData = Object.assign({}, globalConfiguration, parsedGistDetails);

            // Construct the final public-facing URL for the generated snapshot.
            const finalSnapshotUrl = `${globalConfiguration.siteBaseUrl}/gist/${currentGistEntry.id}/${generatedOutputSuffix}`;

            // Render the HTML using the templating engine.
            const generatedHtmlMarkup = templatingEngine.render("src/templates/crawl.html", {
                data: combinedRenderData,
                pageTitle: renderedPageTitle
            });

            // Save the resulting HTML to the file system.
            persistRenderedSnapshot(finalSnapshotUrl, generatedHtmlMarkup);

            // Recursively call this function for the next entry in the list.
            processResourceEntry(currentEntryIndex + 1, resourceEntryList, globalConfiguration);

        } catch (processingError) {
            activityLogger.error(`An error occurred during parsing or rendering for Gist ID ${currentGistEntry.id}:`, processingError.message);
            // Continue processing other entries.
            processResourceEntry(currentEntryIndex + 1, resourceEntryList, globalConfiguration);
        }
    });
};

// --- Main Program Execution Flow ---
activityLogger.info("Starting the content snapshot generation service.");

// Step 1: Load essential application configuration.
let applicationSettings;
try {
    applicationSettings = loadApplicationConfiguration("./config/settings.json");
    // Basic validation for critical configuration parameters.
    if (!applicationSettings || !applicationSettings.gitHubUsername || !applicationSettings.siteBaseUrl) {
        throw new Error("Essential configuration parameters (gitHubUsername or siteBaseUrl) are missing from settings.json.");
    }
} catch (settingsLoadError) {
    activityLogger.error(settingsLoadError.message);
    process.exit(1); // Exit immediately if configuration is critical and missing.
}

// Step 2: Fetch the user's GitHub Atom feed.
activityLogger.info("Attempting to retrieve GitHub Atom feed...");
const atomFeedRequestParams = {
    host: REMOTE_HOST_DETAILS.GIST_FRONTEND,
    path: `/${applicationSettings.gitHubUsername}.atom`,
    headers: {
        'User-Agent': DEFAULT_USER_AGENT
    }
};

performSecureGetRequest(atomFeedRequestParams, (atomFetchError, atomFeedContent) => {
    if (atomFetchError) {
        activityLogger.error("Failed to fetch Atom feed. This is not critical, proceeding with other tasks.");
        return; // Non-critical failure, don't halt.
    }
    writeContentToFile('github_atom_feed.xml', atomFeedContent); // Renamed output file.
});

// Step 3: Fetch the list of gists for the specified GitHub user via API.
activityLogger.info("Requesting user Gist list from GitHub API...");
const gistListRequestParams = {
    host: REMOTE_HOST_DETAILS.GITHUB_API,
    path: `/users/${applicationSettings.gitHubUsername}/gists`,
    headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        'Accept': JSON_CONTENT_TYPE // Explicitly request JSON.
    }
};

performSecureGetRequest(gistListRequestParams, (gistListFetchError, rawGistListPayload) => {
    if (gistListFetchError) {
        activityLogger.error("Failed to retrieve the list of gists. Snapshotting process cannot continue.");
        process.exit(1); // Critical failure, exit.
    }

    try {
        const parsedGistEntries = JSON.parse(rawGistListPayload);
        if (!Array.isArray(parsedGistEntries) || parsedGistEntries.length === 0) {
            activityLogger.warn("No Gist entries found for the provided GitHub user. No snapshots will be generated.");
            return;
        }
        activityLogger.info(`Successfully retrieved ${parsedGistEntries.length} Gist entries. Commencing individual entry processing.`);
        // Initiate the recursive processing of each gist entry.
        processResourceEntry(0, parsedGistEntries, applicationSettings);
    } catch (parseListError) {
        activityLogger.error("Error parsing the Gist list JSON response:", parseListError.message);
        process.exit(1); // Critical failure, exit.
    }
});