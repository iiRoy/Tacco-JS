const fileSystemPath = require('path');
const postcssAutoprefixer = require('autoprefixer'); // Using 'autoprefixer' directly, common update from 'autoprefixer-core'
const textComparison = require('diff');
const consoleColors = require('chalk');

// This module exports a Grunt task definition function.
module.exports = function(buildTool) {

    // Internal variable to hold the resolved task configuration options.
    let taskConfiguration;
    // Internal variable to hold the instantiated PostCSS Autoprefixer processor.
    let styleProcessorInstance;

    /**
     * Utility function to check if a given value is strictly a boolean.
     * @param {*} valueToCheck - The value to evaluate.
     * @returns {Boolean} - True if the value is a boolean, false otherwise.
     */
    const isStrictlyBoolean = (valueToCheck) => typeof valueToCheck === 'boolean';

    /**
     * Utility function to check if a given value is strictly a string.
     * @param {*} valueToCheck - The value to evaluate.
     * @returns {Boolean} - True if the value is a string, false otherwise.
     */
    const isStrictlyString = (valueToCheck) => typeof valueToCheck === 'string';

    /**
     * Locates and retrieves the content of a previously generated source map, if specified and existing.
     * This is useful for incremental processing where an existing map needs to be updated.
     * @param {String} sourceInputPath - The file path of the CSS input for which to find a previous map.
     * @returns {?String} - The content of the found source map as a string, or `null` if none is applicable or found.
     */
    function obtainPreviousSourceMapContent(sourceInputPath) {
        // Check if the source map configuration has a specific path for previous maps.
        if (isStrictlyString(taskConfiguration.sourceMapSettings.previousMapPath)) {
            // Construct the expected full path for the previous source map file.
            const potentialMapFileLocation = taskConfiguration.sourceMapSettings.previousMapPath + fileSystemPath.basename(sourceInputPath) + '.map';

            // Verify the existence of this file on the file system.
            if (buildTool.file.exists(potentialMapFileLocation)) {
                // If the file exists, read and return its content.
                return buildTool.file.read(potentialMapFileLocation);
            }
        }
        // No previous map path configured, or the file was not found.
        return null;
    }

    /**
     * Processes the raw CSS content using the configured Autoprefixer instance.
     * It handles source map generation and configuration based on task options.
     * @param {String} rawCssContent - The unprocessed CSS string.
     * @param {String} sourceOriginPath - The original path of the CSS file.
     * @param {String} destinationOutputPath - The intended output path for the processed CSS.
     * @returns {{css: String, map: ?String}} - An object containing the processed CSS and an optional source map.
     */
    function executeCssPrefixing(rawCssContent, sourceOriginPath, destinationOutputPath) {
        let actualMapOptions = false; // Default to no source map generation.
        const configuredMapSetting = taskConfiguration.sourceMapSettings;

        // Determine the detailed source map configuration.
        if (isStrictlyBoolean(configuredMapSetting) && configuredMapSetting === true) {
            actualMapOptions = true; // Simple boolean 'true' enables default map generation.
        } else if (typeof configuredMapSetting === 'object' && configuredMapSetting !== null) {
            // Detailed object configuration for source maps.
            actualMapOptions = {
                prev: obtainPreviousSourceMapContent(sourceOriginPath),
                inline: isStrictlyBoolean(configuredMapSetting.inline) ? configuredMapSetting.inline : true,
                annotation: isStrictlyString(configuredMapSetting.annotation) ? configuredMapSetting.annotation : true,
                sourcesContent: isStrictlyBoolean(configuredMapSetting.sourcesContent) ? configuredMapSetting.sourcesContent : true
            };
        }
        // If configuredMapSetting is falsy or not an object/boolean true, actualMapOptions remains false.

        // Pass the CSS content and options to the Autoprefixer processor.
        return styleProcessorInstance.process(rawCssContent, {
            map: actualMapOptions,
            from: sourceOriginPath,
            to: destinationOutputPath,
            safe: taskConfiguration.safeModeEnabled // Utilizing the renamed option.
        });
    }

    /**
     * Writes a message to the Grunt's verbose log output.
     * @param {String} logMessage - The string message to be logged.
     */
    function outputVerboseLog(logMessage) {
        buildTool.verbose.writeln(logMessage);
    }

    // Register the Grunt multi-task 'postcssPrefixer'.
    buildTool.registerMultiTask('postcssPrefixer', 'Applies vendor prefixes to CSS files using PostCSS Autoprefixer.', function() {
        // Resolve task options, applying defaults where none are explicitly provided in the Gruntfile.
        taskConfiguration = this.options({
            targetBrowsers: undefined,       // Renamed from 'browsers'
            enableCascade: true,             // Renamed from 'cascade'
            generateDiffFile: false,         // Renamed from 'diff'
            sourceMapSettings: false,        // Renamed from 'map'
            removeDeprecatedPrefixes: true,  // Renamed from 'remove'
            safeModeEnabled: false           // Renamed from 'safe'
        });

        // Initialize an object to keep track of various operation counts.
        const processingMetrics = {
            cssFilesProcessed: 0,
            sourceMapsGenerated: 0,
            diffFilesCreated: 0
        };

        // Instantiate the PostCSS Autoprefixer with the specific browser targets and other settings.
        styleProcessorInstance = postcssAutoprefixer({
            browsers: taskConfiguration.targetBrowsers,
            cascade: taskConfiguration.enableCascade,
            remove: taskConfiguration.removeDeprecatedPrefixes
        });

        // Iterate over each file group defined in the Grunt configuration for this task.
        this.files.forEach(function(currentFileGroup) {
            // Guard clause: If a file group has no source files, log a warning and skip it.
            if (currentFileGroup.src.length === 0) {
                buildTool.failure.warn(`No source files found for the target: ${currentFileGroup.orig.dest || 'unspecified'}. Skipping this group.`);
                return;
            }

            try {
                // Process each individual source file within the current file group.
                currentFileGroup.src.forEach(function(currentSourceFilePath) {
                    // Determine the final output path for the processed CSS.
                    const finalDestinationPath = currentFileGroup.dest || currentSourceFilePath;

                    // Read the content of the source CSS file.
                    const sourceContentBuffer = buildTool.file.read(currentSourceFilePath);

                    // Execute the core CSS prefixing logic.
                    const processingResult = executeCssPrefixing(sourceContentBuffer, currentSourceFilePath, finalDestinationPath);

                    // Write the processed CSS to its destination.
                    buildTool.file.write(finalDestinationPath, processingResult.css);
                    outputVerboseLog(`Successfully wrote processed CSS to: ${consoleColors.cyan(finalDestinationPath)}.`);
                    processingMetrics.cssFilesProcessed++;

                    // If a source map was generated, write it to a separate file.
                    if (processingResult.map) {
                        const mapOutputString = processingResult.map.toString(); // Ensure map content is a string.
                        const mapFileLocation = `${finalDestinationPath}.map`;
                        buildTool.file.write(mapFileLocation, mapOutputString);
                        outputVerboseLog(`Generated source map at: ${consoleColors.cyan(mapFileLocation)}.`);
                        processingMetrics.sourceMapsGenerated++;
                    }

                    // If diff file generation is enabled, create and write the diff.
                    if (taskConfiguration.generateDiffFile) {
                        // Determine the diff file's output path.
                        const diffOutputLocation = isStrictlyString(taskConfiguration.generateDiffFile) ?
                            taskConfiguration.generateDiffFile : `${finalDestinationPath}.diff`;

                        // Generate the text comparison patch.
                        const diffPatchContent = textComparison.createPatch(finalDestinationPath, sourceContentBuffer, processingResult.css);
                        buildTool.file.write(diffOutputLocation, diffPatchContent);
                        outputVerboseLog(`Created difference file at: ${consoleColors.cyan(diffOutputLocation)}.`);
                        processingMetrics.diffFilesCreated++;
                    }
                });
            } catch (processingIssue) {
                // If any error occurs during file processing, halt the Grunt task with a fatal error.
                buildTool.failure.halt(`A critical error occurred during CSS processing for a file group: ${processingIssue.message}`);
            }
        });

        // Output a summary of the task's execution results.
        if (processingMetrics.cssFilesProcessed > 0) {
            const sheetPlural = buildTool.utility.pluralize(processingMetrics.cssFilesProcessed, 'stylesheet/stylesheets');
            buildTool.logger.success(`${processingMetrics.cssFilesProcessed} ${sheetPlural} successfully processed.`);
        }

        if (processingMetrics.sourceMapsGenerated > 0) {
            const mapPlural = buildTool.utility.pluralize(processingMetrics.sourceMapsGenerated, 'sourcemap/sourcemaps');
            buildTool.logger.success(`${processingMetrics.sourceMapsGenerated} ${mapPlural} generated.`);
        }

        if (processingMetrics.diffFilesCreated > 0) {
            const diffPlural = buildTool.utility.pluralize(processingMetrics.diffFilesCreated, 'diff/diffs');
            buildTool.logger.success(`${processingMetrics.diffFilesCreated} ${diffPlural} produced.`);
        }
    });
};