const fileSystemOperations = require('fs');
const pathUtilities = require('path');

// Define constants for file naming conventions to enhance readability and maintainability.
const DEBUG_FILE_SUFFIX = '-debug.js';
const MINIFIED_FILE_SUFFIX = '.js';
const NEWLINE_DELIMITER = '\n'; // Standard newline character for content separation.

// Establish the primary directories for source components and build output.
// These paths are resolved relative to the current working directory.
const componentSourceDirectory = pathUtilities.resolve(process.cwd(), 'bower_components');
const finalOutputDirectory = pathUtilities.resolve(process.cwd(), 'build');

// Load the external utility responsible for processing and aggregating third-party components.
const componentAggregator = require('aggregate-bower');

// Define essential configuration snippets for the module system.
// These will be appended to the generated JavaScript bundles.
const moduleConfigurationFragments = {
    startupInitialization: 'modulex.init({name:"seed"});',
    packageBaseSettings: 'modulex.config({ packages : { kg : { base : "//g.alicdn.com/kg/" }}});'
};

/**
 * Generates the additional script content that needs to be appended to the seed files.
 * This content typically includes module initialization and package configurations.
 * @returns {string} The combined supplemental script content.
 */
const prepareSupplementalScriptPayload = () => {
    // An empty string is included at the beginning to ensure a leading newline
    // if the preceding content doesn't end with one, providing clean separation.
    return [
        '',
        moduleConfigurationFragments.startupInitialization,
        moduleConfigurationFragments.packageBaseSettings
    ].join(NEWLINE_DELIMITER);
};

/**
 * Orchestrates the collection of core module files and their combination
 * into final 'seed' JavaScript bundles (debug and minified versions).
 * It reads individual module files from the build directory and concatenates them.
 */
function assembleCoreSeedBundles() {
    // Arrays to accumulate content for the debug and minified bundles.
    // Using arrays and then joining is often more efficient for many concatenations.
    const collectedDebugCodeSegments = [];
    const collectedMinifiedCodeSegments = [];

    // A predefined list of core module names that constitute the seed bundles.
    const essentialModuleIdentifiers = ['modulex', 'feature', 'ua', 'meta'];

    // Iterate through each essential module to locate and process its files.
    for (let moduleIndex = 0; moduleIndex < essentialModuleIdentifiers.length; moduleIndex++) {
        const currentModuleIdentifier = essentialModuleIdentifiers[moduleIndex];

        // Construct the full file paths for both the debug and minified versions of the module.
        const moduleDebugFilePath = pathUtilities.join(finalOutputDirectory, currentModuleIdentifier + DEBUG_FILE_SUFFIX);
        const moduleMinifiedFilePath = pathUtilities.join(finalOutputDirectory, currentModuleIdentifier + MINIFIED_FILE_SUFFIX);

        // A crucial check: ensure the debug file exists before attempting to read any content.
        // If the debug file is missing, it's assumed the corresponding minified file might also be,
        // or that the module is not properly built, so we skip it with a warning.
        if (fileSystemOperations.existsSync(moduleDebugFilePath)) {
            // Read the debug version of the module and append its content.
            // 'utf8' encoding is specified for text files.
            collectedDebugCodeSegments.push(fileSystemOperations.readFileSync(moduleDebugFilePath, 'utf8'));
            // Read the minified version of the module and append its content.
            collectedMinifiedCodeSegments.push(fileSystemOperations.readFileSync(moduleMinifiedFilePath, 'utf8'));
        } else {
            console.warn(`[WARNING] Debug file for module '${currentModuleIdentifier}' not found at '${moduleDebugFilePath}'. This module will be omitted from the seed bundles.`);
        }
    }

    // Generate the common supplemental script content once, to be appended to both bundles.
    const finalSupplementalContent = prepareSupplementalScriptPayload();

    // Before writing files, ensure that the target output directory exists.
    // If not, create it recursively.
    if (!fileSystemOperations.existsSync(finalOutputDirectory)) {
        console.log(`[INFO] Creating output directory: ${finalOutputDirectory}`);
        fileSystemOperations.mkdirSync(finalOutputDirectory, { recursive: true });
    }

    // Construct the full paths for the final seed bundles.
    const finalDebugBundlePath = pathUtilities.join(finalOutputDirectory, 'seed-debug.js');
    const finalMinifiedBundlePath = pathUtilities.join(finalOutputDirectory, 'seed.js');

    // Write the combined debug seed file to the file system.
    fileSystemOperations.writeFileSync(
        finalDebugBundlePath,
        collectedDebugCodeSegments.join(NEWLINE_DELIMITER) + finalSupplementalContent
    );
    console.log(`[SUCCESS] Debug seed bundle written to: ${finalDebugBundlePath}`);

    // Write the combined minified seed file to the file system.
    fileSystemOperations.writeFileSync(
        finalMinifiedBundlePath,
        collectedMinifiedCodeSegments.join(NEWLINE_DELIMITER) + finalSupplementalContent
    );
    console.log(`[SUCCESS] Minified seed bundle written to: ${finalMinifiedBundlePath}`);
}

// --- Main Build Process Execution Flow ---

console.log('--- Starting comprehensive build process ---');

// Step 1: Execute the component aggregation task.
// This ensures all external dependencies are in place before proceeding.
console.log('[STAGE 1/2] Initiating external component aggregation using aggregate-bower...');
try {
    componentAggregator(componentSourceDirectory, finalOutputDirectory);
    console.log('[STAGE 1/2] External component aggregation successfully completed.');
} catch (error) {
    console.error(`[ERROR] Failed during external component aggregation: ${error.message}`);
    process.exit(1); // Exit with an error code if this critical step fails.
}


// Step 2: Proceed with assembling the core seed JavaScript files.
console.log('[STAGE 2/2] Commencing core seed JavaScript bundle assembly...');
try {
    assembleCoreSeedBundles();
    console.log('[STAGE 2/2] Core seed JavaScript bundles assembled successfully.');
} catch (error) {
    console.error(`[ERROR] Failed during seed bundle assembly: ${error.message}`);
    process.exit(1); // Exit with an error code if this critical step fails.
}


// Final confirmation message upon successful completion of all tasks.
console.log('--- All build tasks have been completed successfully! ---');