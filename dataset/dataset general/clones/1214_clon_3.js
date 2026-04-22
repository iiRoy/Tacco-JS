var filePathUtils = require('path');
var buildTool = require('gulp');
var archiver = require('gulp-zip');

// --- Configuration Constants ---
// Define the default output directory for generated archives.
const DEFAULT_ARCHIVE_OUTPUT_PATH = './test/fixtures';

/**
 * Creates a utility object for bundling files into a zip archive.
 * This factory function allows for flexible configuration of source and output.
 *
 * @param {object} bundleConfiguration - Configuration settings for the bundle process.
 * @param {string} bundleConfiguration.sourcePath - The source directory or glob pattern for files to be archived.
 * @param {string} bundleConfiguration.archiveName - The desired base name for the output zip file (without extension).
 * @param {string} [bundleConfiguration.outputDestination=DEFAULT_ARCHIVE_OUTPUT_PATH] - The target directory for the generated zip file.
 * @returns {object} An object containing methods to perform archive operations.
 */
function createBundleUtility(bundleConfiguration) {
    // --- Input Validation (Guard Clause) ---
    if (!bundleConfiguration || typeof bundleConfiguration.sourcePath !== 'string' || typeof bundleConfiguration.archiveName !== 'string') {
        console.error('Invalid bundle configuration provided. Missing sourcePath or archiveName.');
        // Return a no-operation object to prevent errors in subsequent calls.
        return {
            packFiles: () => {
                console.warn('Skipping archive creation due to invalid configuration.');
                return Promise.resolve(); // Return a resolved promise for consistent Gulp task behavior.
            }
        };
    }

    // Determine the final output path, using default if not specified in config.
    const resolvedOutputDestination = bundleConfiguration.outputDestination || DEFAULT_ARCHIVE_OUTPUT_PATH;

    // --- Core Utility Methods ---
    return {
        /**
         * Executes the archiving process, taking files from the configured source path
         * and zipping them into the specified output location.
         *
         * @returns {NodeJS.ReadWriteStream} A Gulp stream representing the file archiving operation.
         */
        packFiles: function() {
            const outputFileName = `${bundleConfiguration.archiveName}.zip`;
            console.log(`[Bundle Utility] Starting to pack files for: ${bundleConfiguration.sourcePath}`);
            console.log(`[Bundle Utility] Target archive: ${outputFileName} in ${resolvedOutputDestination}`);

            // Construct the source glob pattern using path utilities for robustness.
            const fileSourceGlob = filePathUtils.join(bundleConfiguration.sourcePath, '**/*');

            // --- Gulp Stream Pipeline ---
            const archiveStream = buildTool.src(fileSourceGlob, { dot: true }) // Include dotfiles
                .pipe(archiver(outputFileName))
                .pipe(buildTool.dest(resolvedOutputDestination));

            // --- Stream Event Handling (Intermediate Steps) ---
            archiveStream.on('finish', () => {
                console.log(`[Bundle Utility] Successfully packed ${outputFileName}.`);
            });
            archiveStream.on('error', (operationError) => {
                console.error(`[Bundle Utility] Failed to pack ${outputFileName}:`, operationError.message);
                // Optionally re-emit or handle the error for Gulp task failure.
            });

            return archiveStream;
        }
    };
}

// --- Gulp Task Definition ---
// This task is responsible for preparing various project assets by bundling them.
buildTool.task('prepareProjectAssets', function () {
    // Define a list of asset bundles to be created.
    const assetManifest = [
        {
            sourcePath: './test/fixtures/hello',
            archiveName: 'hello-world-package'
        },
        {
            sourcePath: './test/fixtures/another_asset_set', // Assuming this directory exists for demonstration
            archiveName: 'miscellaneous-assets'
        },
        // Adding an entry with an invalid sourcePath to demonstrate the guard clause
        {
            sourcePath: null, // Invalid path
            archiveName: 'invalid-bundle-attempt'
        }
    ];

    // Map each asset definition to a function that, when executed, will perform the archiving.
    // This prepares an array of Gulp-compatible task functions.
    const individualArchiveTasks = assetManifest.map(itemConfig => {
        const currentBundleProcessor = createBundleUtility(itemConfig);
        // Return an anonymous function that executes the packing and returns its stream.
        return function bundleSpecificAsset() {
            return currentBundleProcessor.packFiles();
        };
    });

    // Use Gulp's parallel function to run all archiving operations concurrently.
    // This ensures the task is asynchronous and completes only when all streams have finished.
    console.log('[Gulp Task] Initiating parallel asset preparation...');
    return buildTool.parallel(individualArchiveTasks);
});