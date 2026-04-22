const coreGulp = require('gulp');
const iconProcessor = require('./lib/iconify');
const fileCleaner = require('del');
const vectorToRaster = require('gulp-svg2png');
const cssProcessor = require('gulp-sass');
const utilityLogger = require('gulp-util');
const pathResolver = require('path');

// Custom simple logger to replace direct gulp-util.log calls
const customLog = (messageContent, messageType = 'info') => {
    let logPrefix = '';
    switch (messageType) {
        case 'error': logPrefix = 'ERROR: '; break;
        case 'warn': logPrefix = 'WARNING: '; break;
        case 'info':
        default: logPrefix = 'INFO: '; break;
    }
    utilityLogger.log(logPrefix + messageContent);
};

// Centralized default configuration for various icon processing parameters
const defaultOperationSettings = {
    pngOutputPath: './dist/images/raster-icons', // Output for generated PNGs
    cssStylesheetPath: './dist/styles',         // Output for compiled CSS
    scssSourcePath: null,                       // Output for generated SCSS (dynamic)
    templateFile: pathResolver.join(__dirname, 'lib/output.mustache'), // Path to styling template
    svgOptimizationOptions: { enabled: true },  // SVGO configuration
    baseIconWidth: '300px',                     // Default width for icons
    baseIconHeight: '200px',                    // Default height for icons
    scssGenerationDisabled: false               // Flag to disable SCSS output
};

/**
 * Validates essential input parameters to ensure the icon generation process can proceed.
 * Throws an error if critical options are missing or invalid.
 * @param {object} processOptions - The user-provided configuration object.
 * @throws {Error} If any required configuration is absent.
 */
function validateInputParameters(processOptions) {
    if (!processOptions || typeof processOptions !== 'object') {
        throw new Error("Configuration object is missing or invalid. Please provide an object with parameters for icon processing.");
    }

    const detectedProblems = [];

    // Check for the primary source glob for SVG icons
    if (!processOptions.sourceGlob || typeof processOptions.sourceGlob !== 'string' || processOptions.sourceGlob.trim() === '') {
        detectedProblems.push("The sourceGlob property is undefined or empty. Specify the path to your SVG assets (e.g., './assets/svgs/*.svg').");
    }

    // If any critical problems were found, log them and halt execution.
    if (detectedProblems.length > 0) {
        detectedProblems.forEach(issueText => customLog(issueText, 'error'));
        throw new Error("Aborting icon processing due to critical configuration errors.");
    }
}

/**
 * Applies default values to any unspecified configuration options and logs warnings for them.
 * This function modifies the provided operationalConfig object in place.
 * @param {object} operationalConfig - The configuration object to be enhanced with defaults.
 */
function configureMissingOptions(operationalConfig) {
    const collectedNotifications = [];

    // Create an effective configuration by merging defaults with user options
    const effectiveConfig = { ...defaultOperationSettings, ...operationalConfig };

    // Special handling for SCSS output path, as it dictates SCSS generation enablement
    if (!effectiveConfig.scssSourcePath || typeof effectiveConfig.scssSourcePath !== 'string' || effectiveConfig.scssSourcePath.trim() === '') {
        effectiveConfig.scssGenerationDisabled = true;
        effectiveConfig.scssSourcePath = effectiveConfig.cssStylesheetPath; // Fallback to CSS path for cleanup consistency
        collectedNotifications.push("SCSS output directory (scssSourcePath) was not provided. SCSS files will not be generated.");
    } else {
        effectiveConfig.scssGenerationDisabled = false;
    }

    // Iterate through the default settings to identify and apply other missing values
    for (const key in defaultOperationSettings) {
        // Skip keys already handled or specifically managed (like scssSourcePath and its flag)
        if (key === 'scssSourcePath' || key === 'scssGenerationDisabled') {
            continue;
        }

        // Check if the user explicitly provided a value for this option
        if (operationalConfig[key] === undefined || operationalConfig[key] === null || operationalConfig[key] === '') {
            // Apply the default value
            effectiveConfig[key] = defaultOperationSettings[key];
            collectedNotifications.push(`Option '${key}' was not set. Using its default value: '${JSON.stringify(effectiveConfig[key])}'.`);
        }
    }

    // Report all generated notifications to the console
    if (collectedNotifications.length > 0) {
        collectedNotifications.forEach(message => customLog(message, 'warn'));
    }

    // Update the original configuration object with the final, effective values
    Object.assign(operationalConfig, effectiveConfig);
}

// The main module export function, acting as the entry point for the Gulp task setup.
module.exports = function(userSettings = {}) { // Use default parameter for settings
    const runtimeOptions = { ...userSettings }; // Create a mutable copy of user settings

    // Execute initial validation and apply default configurations
    validateInputParameters(runtimeOptions);
    configureMissingOptions(runtimeOptions);

    // Gulp task definitions, with renamed tasks and adjusted execution flows

    // Task 1: Clean up previously generated icon-related files
    coreGulp.task('clean-icon-artifacts', function(doneCallback) {
        let cleanupPaths = [
            `${runtimeOptions.scssSourcePath}/icon-styles.*.scss`,
            `${runtimeOptions.cssStylesheetPath}/icon-styles.*.css`,
            `${runtimeOptions.pngOutputPath}/*.png`
        ];

        // Conditional removal of SCSS cleanup path if SCSS generation is disabled
        // AND the SCSS path is identical to the CSS path, to prevent accidental CSS file deletion.
        if (runtimeOptions.scssGenerationDisabled && runtimeOptions.scssSourcePath === runtimeOptions.cssStylesheetPath) {
            cleanupPaths = cleanupPaths.filter(p => !p.includes('.scss'));
            customLog("SCSS cleanup path omitted as SCSS generation is disabled and path overlaps with CSS.", 'info');
        }
        
        customLog(`Initiating cleanup for paths: ${cleanupPaths.join(', ')}`);
        return fileCleaner(cleanupPaths, doneCallback);
    });

    // Task 2: Process SVG icons: generate SVG-based SCSS and convert SVGs to PNGs (with PNG-based SCSS)
    coreGulp.task('generate-icon-assets', coreGulp.series('clean-icon-artifacts', function processAllIconVariants() {
        const svgSource = coreGulp.src(runtimeOptions.sourceGlob);

        // Stream for generating SCSS directly from SVG files
        const svgToScssStream = svgSource
            .pipe(iconProcessor({
                styleTemplate: runtimeOptions.templateFile,
                styleName: 'icon-styles.svg.scss',
                svgoOptions: runtimeOptions.svgOptimizationOptions,
                defaultWidth: runtimeOptions.baseIconWidth,
                defaultHeight: runtimeOptions.baseIconHeight
            }));
        
        if (!runtimeOptions.scssGenerationDisabled) {
            svgToScssStream.pipe(coreGulp.dest(runtimeOptions.scssSourcePath));
        } else {
            customLog("Skipping SVG-based SCSS generation due to 'scssGenerationDisabled' flag.", 'warn');
        }

        // Stream for converting SVGs to PNGs and then generating SCSS for these PNGs
        const svgToPngAndScssStream = svgSource
            .pipe(vectorToRaster()) // Convert to PNG format
            .pipe(coreGulp.dest(runtimeOptions.pngOutputPath)) // Save the generated PNGs
            .pipe(iconProcessor({ // Generate SCSS specifically for the PNG icons
                styleTemplate: runtimeOptions.templateFile,
                styleName: 'icon-styles.png.scss',
                defaultWidth: runtimeOptions.baseIconWidth,
                defaultHeight: runtimeOptions.baseIconHeight
            }));
        
        if (!runtimeOptions.scssGenerationDisabled) {
            svgToPngAndScssStream.pipe(coreGulp.dest(runtimeOptions.scssSourcePath));
        } else {
            customLog("Skipping PNG-based SCSS generation due to 'scssGenerationDisabled' flag.", 'warn');
        }

        // Return a Promise that resolves when both processing streams have completed
        return Promise.all([
            new Promise(resolve => svgToScssStream.on('end', resolve)),
            new Promise(resolve => svgToPngAndScssStream.on('end', resolve))
        ]);
    }));

    // Task 3: Create fallback SCSS styles for browsers that don't support SVG icons
    coreGulp.task('create-fallback-styles', coreGulp.series('generate-icon-assets', function generatePngFallbackStyles() {
        const pngFallbackStream = coreGulp.src(`${runtimeOptions.pngOutputPath}/*.png`)
            .pipe(iconProcessor({
                styleTemplate: runtimeOptions.templateFile,
                styleName: 'icon-styles.fallback.scss',
                noConvert: true, // Crucial flag: indicates these are already PNGs, don't convert again
                noConvertTarget: runtimeOptions.scssSourcePath // Target path for generated SCSS
            }));
        
        if (!runtimeOptions.scssGenerationDisabled) {
            pngFallbackStream.pipe(coreGulp.dest(runtimeOptions.scssSourcePath));
        } else {
            customLog("Skipping fallback SCSS generation as 'scssGenerationDisabled' is true.", 'warn');
        }
        return pngFallbackStream;
    }));

    // Task 4: Compile the generated SCSS files into compressed CSS stylesheets
    coreGulp.task('compile-stylesheets', coreGulp.series('create-fallback-styles', function compileScssToCss() {
        if (runtimeOptions.scssGenerationDisabled) {
            customLog("SCSS compilation skipped because 'scssGenerationDisabled' is active.", 'info');
            return Promise.resolve(); // Task is skipped, return a resolved promise
        }

        const scssCompilationStream = coreGulp.src(`${runtimeOptions.scssSourcePath}/icon-styles.*.scss`)
            .pipe(cssProcessor({
                outputStyle: 'compressed', // Output CSS in a compressed format
                includePaths: [runtimeOptions.scssSourcePath] // Ensure Sass can resolve imports
            }).on('error', cssProcessor.logError)) // Robust error logging for Sass compilation
            .pipe(coreGulp.dest(runtimeOptions.cssStylesheetPath));
        
        return scssCompilationStream;
    }));

    // Task 5: Main orchestration task to run the entire icon deployment process
    coreGulp.task('deploy-icons', coreGulp.series('compile-stylesheets', function finalCleanupAndCompletion() {
        // Perform a final cleanup of SCSS source files if generation was explicitly disabled
        // This handles cases where SCSS files might have been created temporarily or inadvertently.
        if (runtimeOptions.scssGenerationDisabled) {
            customLog("Initiating final SCSS file cleanup due to 'scssGenerationDisabled'.", 'info');
            return fileCleaner(`${runtimeOptions.scssSourcePath}/icon-styles.*.scss`);
        }
        customLog("Icon deployment process completed successfully.", 'info');
        return Promise.resolve(); // Nothing more to clean if SCSS was enabled or path was clean
    }));

    // Start the primary Gulp task sequence
    coreGulp.series('deploy-icons')();
};