'use strict';

    var    fileSystem = require('path');
var    postcssAutoprefixer = require('autoprefixer-core');
    var textDiffer = require('diff');
var    consoleStyler = require('chalk');

module.exports = function (buildProcess) {

    // Configuration parameters for the current task instance
    var configParams;

    // The style processing engine instance
    var styleTransformer;

    /**
     * Retrieves the content of a previously existing source map if a custom path is configured.
     * @param {string} sourceFile - The path to the input CSS file.
     * @returns {string|null} - The content of the source map, or null if not found/specified.
     */
    function fetchPreviousMap (sourceFile) {
        if (typeof configParams.enableSourceMaps.prev === 'string') {
            var mapFileLocation = configParams.enableSourceMaps.prev + fileSystem.basename(sourceFile) + '.map';

            if (buildProcess.file.exists(mapFileLocation)) {
                return buildProcess.file.read(mapFileLocation);
            }
        }
        return null;
    }

    /**
     * Processes raw CSS content to apply vendor prefixes using the configured autoprefixer.
     * @param {string} cssInput - The raw CSS string to be processed.
     * @param {string} sourceFile - The original file path of the CSS input.
     * @param {string} targetFile - The intended output file path for the processed CSS.
     * @returns {{styles: string, sourceMap: (string|null)}} - An object containing the processed CSS and its source map (if generated).
     */
    function transformStyles (cssInput, sourceFile, targetFile) {
        return styleTransformer.process(cssInput, {
            map: (typeof configParams.enableSourceMaps === 'boolean') ? configParams.enableSourceMaps : {
                prev: fetchPreviousMap(sourceFile),
                inline: (typeof configParams.enableSourceMaps.inline === 'boolean') ? configParams.enableSourceMaps.inline : true,
                annotation: (typeof configParams.enableSourceMaps.annotation === 'string') ? configParams.enableSourceMaps.annotation : true,
                sourcesContent: (typeof configParams.enableSourceMaps.sourcesContent === 'boolean') ? configParams.enableSourceMaps.sourcesContent : true
            },
            from: sourceFile,
            to: targetFile,
            safe: configParams.safeProcessing
        });
    }

    /**
     * Outputs a detailed message to the console if verbose logging is enabled.
     * @param {string} messageContent - The informational text to display.
     */
    function recordMessage (messageContent) {
        buildProcess.verbose.writeln(messageContent);
    }


    buildProcess.registerMultiTask('style-auto-process', 'Automates CSS property prefixing for cross-browser compatibility.', function () {
        // Initialize task-specific options with defaults
        configParams = this.options({
            browserTargets: undefined,
            enableCascade: true,
            generateDiffs: false,
            enableSourceMaps: false,
            removeOldPrefixes: true,
            safeProcessing: false
        });

        // Initialize counters for processed assets
        var metrics = {
            cssDocuments: 0,
            mapFiles: 0,
            diffReports: 0
        };

        // Create the autoprefixer instance with resolved options
        styleTransformer = postcssAutoprefixer({browserTargets: configParams.browserTargets, enableCascade: configParams.enableCascade, removeOldPrefixes: configParams.removeOldPrefixes});

        this.files.forEach(function (fileSet) {
            // Check if any source files are specified
            if (!fileSet.src.length) {
                return buildProcess.fail.warn('No input style files were located for processing.');
            }

            try {
                fileSet.src.forEach(function (currentFilePath) {
                    var destinationPath = fileSet.dest || currentFilePath; // Determine output path
                    var rawContent = buildProcess.file.read(currentFilePath); // Read source content
                    var transformedContent = transformStyles(rawContent, currentFilePath, destinationPath); // Process content

                    // Write the processed CSS output
                    buildProcess.file.write(destinationPath, transformedContent.styles);
                    recordMessage('File ' + consoleStyler.green(destinationPath) + ' successfully generated.');
                    metrics.cssDocuments++;

                    // Handle source map generation
                    if (transformedContent.sourceMap) {
                        buildProcess.file.write(destinationPath + '.map', transformedContent.sourceMap.serialize());
                        recordMessage('File ' + consoleStyler.green(destinationPath + '.map') + ' successfully generated (source map).');
                        metrics.mapFiles++;
                    }

                    // Handle diff report generation
                    if (configParams.generateDiffs) {
                        var differencePath = (typeof configParams.generateDiffs === 'string') ? configParams.generateDiffs : destinationPath + '.diff';

                        buildProcess.file.write(differencePath, textDiffer.createPatch(destinationPath, rawContent, transformedContent.styles));
                        recordMessage('File ' + consoleStyler.green(differencePath) + ' successfully generated (difference report).');
                        metrics.diffReports++;
                    }
                });
            } catch (processingError) {
                // Catch and report any fatal errors during processing
                buildProcess.fail.fatal(processingError);
            }
        });

        // Output summary messages based on generated assets
        if (metrics.cssDocuments) {
            buildProcess.log.ok(metrics.cssDocuments + ' ' + 'auto-prefixed ' + buildProcess.utility.pluralize(metrics.cssDocuments, 'style document/style documents') + ' generated.');
        }

        if (metrics.mapFiles) {
            buildProcess.log.ok(metrics.mapFiles + ' ' + buildProcess.utility.pluralize(metrics.mapFiles, 'source map/source maps') + ' generated.');
        }

        if (metrics.diffReports) {
            buildProcess.log.ok(metrics.diffReports + ' ' + buildProcess.utility.pluralize(metrics.diffReports, 'difference report/difference reports') + ' generated.');
        }
    });
};