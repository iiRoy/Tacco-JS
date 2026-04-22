const domEnv = require("jsdom");
const fileSys = require("fs");

// Establish a sandboxed virtual DOM environment using JSDOM.
// This simulates a browser page where the compiled application code will execute.
const virtualDocument = new domEnv.JSDOM("<!DOCTYPE html><html><head><title>Virtual Application Host</title></head><body><div id='application-root'></div></body></html>").window.document;
const browserExecutionContext = virtualDocument.defaultView; // Direct reference to the 'window' object within the virtual environment

// Command-line arguments are parsed to identify paths to source code.
// The first two arguments ('node' executable and script name) are excluded.
const sourceCodeInputPaths = process.argv.slice(2);

// A lookup table to prevent redundant processing of files during recursive scans.
// This ensures each source file is included only once in the final bundle.
const processedFileTracker = {};

/**
 * Validates if a given file path points to a recognized JavaScript source file type.
 * Supported extensions are '.js' and '.annotated'.
 * @param {string} filePath - The absolute or relative path to the file.
 * @returns {boolean} - True if the file is a JS or annotated script, false otherwise.
 */
const isRecognizedJavaScriptSource = (filePath) => {
    // Basic input validation for the file path string.
    if (typeof filePath !== 'string' || filePath.length < 3) {
        console.error(`Invalid file path provided: "${filePath}"`);
        return false;
    }
    return filePath.endsWith(".js") || filePath.endsWith(".annotated");
};

/**
 * Recursively traverses a list of paths (files or directories), compiling
 * JavaScript-like source files into a single string. It intelligently skips
 * certain directories (like 'vendor') and avoids reprocessing files.
 * @param {string[]} currentLocations - An array of paths to examine in the current recursion level.
 * @returns {string} - The aggregated content of all included JavaScript files.
 */
function compileSourceCodeBundle(currentLocations) {
    let accumulatedSource = ""; // Accumulates the content of all processed script files.
    const childDirectoriesForFurtherScan = []; // Stores directories found for subsequent recursive calls.

    // A preliminary check for empty input to prevent unnecessary processing.
    if (!Array.isArray(currentLocations) || currentLocations.length === 0) {
        console.warn("No source locations were provided for this compilation step.");
        return accumulatedSource;
    }

    // Iterate through each path to determine if it's a file or a directory.
    for (const itemPath of currentLocations) {
        try {
            const pathMetadata = fileSys.statSync(itemPath); // Retrieve file system statistics for the current path.

            if (pathMetadata.isFile()) {
                // If it's a file, check its type and if it has been processed before.
                if (isRecognizedJavaScriptSource(itemPath) && !processedFileTracker[itemPath]) {
                    console.info(`Including application source: ${itemPath}`);
                    processedFileTracker[itemPath] = true; // Mark this file as processed.
                    // Read file content and append with a newline for separation.
                    accumulatedSource += fileSys.readFileSync(itemPath, { encoding: 'utf8' }) + '\n';
                } else if (processedFileTracker[itemPath]) {
                    console.debug(`Skipping already processed file: ${itemPath}`);
                }
            } else if (pathMetadata.isDirectory()) {
                // If it's a directory, check if it should be skipped (e.g., 'vendor').
                if (!itemPath.endsWith("vendor")) {
                    childDirectoriesForFurtherScan.push(itemPath);
                } else {
                    console.debug(`Excluding vendor directory from scan: ${itemPath}`);
                }
            }
        } catch (error) {
            console.error(`Failed to process path "${itemPath}": ${error.message}`);
            // Depending on strictness, could `throw error` or `process.exit(1)` here.
        }
    }

    // After processing all items in the current level, recursively scan found subdirectories.
    for (const subDirPath of childDirectoriesForFurtherScan) {
        try {
            const subDirItems = fileSys.readdirSync(subDirPath);
            // Construct full paths for items within the subdirectory before recursing.
            const fullItemPaths = subDirItems.map(itemName => `${subDirPath}/${itemName}`);
            accumulatedSource += compileSourceCodeBundle(fullItemPaths); // Recursive call.
        } catch (error) {
            console.error(`Failed to read directory "${subDirPath}": ${error.message}`);
        }
    }

    return accumulatedSource;
}

// --- Main Application Source Compilation and Execution Workflow ---

console.log("Initiating application source compilation process...");

const baseFrameworkFilePath = "lib/annotated.js";
let finalApplicationBundleContent = ""; // Stores the complete, combined source code.

try {
    // Ensure the foundational framework file exists before proceeding.
    if (!fileSys.existsSync(baseFrameworkFilePath)) {
        throw new Error(`Critical base framework file missing: ${baseFrameworkFilePath}`);
    }
    // Load the base framework and append a necessary configuration line.
    finalApplicationBundleContent += fileSys.readFileSync(baseFrameworkFilePath, { encoding: 'utf8' }) + "\n";
    finalApplicationBundleContent += "annotated.setPreprocess(true);\n";
} catch (error) {
    console.error(`Fatal error loading base framework: ${error.message}`);
    process.exit(1); // Terminate process if a critical dependency is missing.
}

// Append the dynamically compiled sources from the provided paths.
finalApplicationBundleContent += compileSourceCodeBundle(sourceCodeInputPaths);

const temporaryBundleFileName = "app_assembly_output.js"; // Name for the temporary bundled file.

// Write the compiled content to a temporary file, but only if there's actual content.
if (finalApplicationBundleContent.trim().length === 0) {
    console.warn("No application code was compiled. Skipping creation of temporary bundle.");
} else {
    try {
        fileSys.writeFileSync(temporaryBundleFileName, finalApplicationBundleContent);
        console.info(`Successfully created temporary application bundle: ${temporaryBundleFileName}`);
    } catch (error) {
        console.error(`Failed to write temporary application bundle: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Configures mock browser environment objects within the JSDOM context.
 * These mocks are often required by client-side libraries when run in Node.js.
 * @param {object} targetWindowContext - The 'window' object of the virtual DOM.
 */
const setupVirtualBrowserMocks = (targetWindowContext) => {
    // Initialize standard browser globals if they don't exist, preventing errors in app code.
    targetWindowContext.WebSocket = targetWindowContext.WebSocket || {};
    targetWindowContext.location = targetWindowContext.location || {};
    targetWindowContext.location.search = targetWindowContext.location.search || "";
    targetWindowContext.navigator = targetWindowContext.navigator || {};
    console.debug("Virtual browser context environment has been mocked.");
};

setupVirtualBrowserMocks(browserExecutionContext);

// Create a script element within the virtual document to load the compiled bundle.
const scriptInjectionElement = virtualDocument.createElement("script");
scriptInjectionElement.src = `./${temporaryBundleFileName}`; // Point to the generated bundle.
scriptInjectionElement.async = true; // Load script asynchronously, mimicking browser behavior.

/**
 * Defines the callback to be executed once the injected script has successfully loaded.
 * This function triggers the core application logic (IR calculation) and handles cleanup.
 */
scriptInjectionElement.onload = function() {
    console.log("Application script loaded into virtual environment. Initiating Intermediate Representation (IR) calculation...");
    const irOutputDestination = "ir_generated_result.js"; // Output file name for the IR.

    try {
        // Verify that the 'annotated' object and its required methods are present.
        if (!browserExecutionContext.annotated || typeof browserExecutionContext.annotated.initialize !== 'function') {
            throw new Error("'annotated' object or its 'initialize' method not found in the browser context. Application may not have loaded correctly.");
        }
        browserExecutionContext.annotated.initialize(); // Execute the application's initialization routine.

        console.log("IR calculation complete. Saving output to designated file...");
        const generatedIrContent = browserExecutionContext.annotated.getIR();

        fileSys.writeFileSync(irOutputDestination, generatedIrContent);
        console.info(`Intermediate Representation successfully saved to: ${irOutputDestination}`);

    } catch (error) {
        console.error(`Error encountered during IR processing: ${error.message}`);
        process.exit(1);
    } finally {
        // Ensure the temporary bundle file is always removed, regardless of success or failure.
        try {
            if (fileSys.existsSync(temporaryBundleFileName)) {
                fileSys.unlinkSync(temporaryBundleFileName);
                console.info(`Temporary bundle file cleaned up: ${temporaryBundleFileName}`);
            }
        } catch (cleanupError) {
            console.warn(`Failed to clean up temporary bundle "${temporaryBundleFileName}": ${cleanupError.message}`);
        }
    }
};

/**
 * Defines the callback for when the script injection encounters an error.
 * This helps in debugging issues with script loading within the virtual DOM.
 */
scriptInjectionElement.onerror = (errorEvent) => {
    console.error(`Failed to load application script "${scriptInjectionElement.src}" into virtual DOM:`, errorEvent);
    process.exit(1); // Exit with an error code on script loading failure.
};

console.log("Injecting compiled application script into the virtual document head...");
virtualDocument.head.appendChild(scriptInjectionElement); // This action triggers the script loading and its 'onload' event.

// Final confirmation message, indicating the process has been initiated.
console.log("Application processing sequence initiated. Awaiting IR generation...");