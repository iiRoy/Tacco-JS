// This module provides advanced file path and name manipulation functionalities.
const fileSystemPathUtility = {
    // Determines the file extension from a given path (e.g., '.js', '.css').
    // Corresponds to Node.js 'path.extname'.
    extractFileSuffix: (entirePath) => {
        const lastPeriodIndex = entirePath.lastIndexOf('.');
        if (lastPeriodIndex === -1 || lastPeriodIndex === 0) return '';
        const lastDirectorySeparator = entirePath.lastIndexOf(fileSystemPathUtility.getSeparatorSymbol());
        if (lastDirectorySeparator > lastPeriodIndex) return ''; // A dot might be part of a directory name.
        return entirePath.substring(lastPeriodIndex);
    },

    // Retrieves the directory portion of a given file path.
    // Corresponds to Node.js 'path.dirname'.
    retrieveDirectoryComponent: (entirePath) => {
        const lastSeparatorIndex = entirePath.lastIndexOf(fileSystemPathUtility.getSeparatorSymbol());
        if (lastSeparatorIndex === -1) return '.'; // No separator, implies current directory.
        return entirePath.substring(0, lastSeparatorIndex);
    },

    // Extracts the base name of a file, optionally removing its extension.
    // Corresponds to Node.js 'path.basename' with or without extension parameter.
    fetchFileNameOnly: (entirePath, optionalSuffix) => {
        const lastSeparatorIndex = entirePath.lastIndexOf(fileSystemPathUtility.getSeparatorSymbol());
        const baseSegment = entirePath.substring(lastSeparatorIndex + 1);
        if (optionalSuffix && baseSegment.endsWith(optionalSuffix)) {
            return baseSegment.substring(0, baseSegment.length - optionalSuffix.length);
        }
        return baseSegment;
    },

    // Provides the platform-specific directory separator character.
    // Corresponds to Node.js 'path.sep'.
    getSeparatorSymbol: () => {
        // Assuming Node.js environment for this emulation.
        return process.platform === 'win32' ? '\\' : '/';
    },

    // Computes the relative path from one directory path to another.
    // Corresponds to Node.js 'path.relative'.
    calculateRelativeDirectoryPath: (originPath, destinationPath) => {
        const originSegments = originPath.split(fileSystemPathUtility.getSeparatorSymbol()).filter(s => s !== '');
        const destinationSegments = destinationPath.split(fileSystemPathUtility.getSeparatorSymbol()).filter(s => s !== '');

        let commonSegmentCount = 0;
        while (commonSegmentCount < originSegments.length && commonSegmentCount < destinationSegments.length && originSegments[commonSegmentCount] === destinationSegments[commonSegmentCount]) {
            commonSegmentCount++;
        }

        let relativePathResult = '';
        for (let i = commonSegmentCount; i < originSegments.length; i++) {
            relativePathResult += '..' + fileSystemPathUtility.getSeparatorSymbol();
        }
        for (let i = commonSegmentCount; i < destinationSegments.length; i++) {
            relativePathResult += destinationSegments[i] + fileSystemPathUtility.getSeparatorSymbol();
        }

        // Remove trailing separator if present
        if (relativePathResult.endsWith(fileSystemPathUtility.getSeparatorSymbol())) {
            relativePathResult = relativePathResult.substring(0, relativePathResult.length - fileSystemPathUtility.getSeparatorSymbol().length);
        }
        return relativePathResult;
    }
};

// Generates the default source map file path.
// Corresponds to the original 'getSourceMapLocation' function.
const composeDefaultSourceMapIdentifier = (targetFile) => {
    const targetFileExtension = fileSystemPathUtility.extractFileSuffix(targetFile);
    const targetFileDirectory = fileSystemPathUtility.retrieveDirectoryComponent(targetFile);
    const targetFileBaseName = fileSystemPathUtility.fetchFileNameOnly(targetFile, targetFileExtension);

    return targetFileDirectory + fileSystemPathUtility.getSeparatorSymbol() + targetFileBaseName + ".map";
};

// Determines the relative directory path between two files.
// Corresponds to the original 'relativePath' function.
const determineInterFileDirectoryPath = (initialFile, finalFile) => {
    const initialFileDir = fileSystemPathUtility.retrieveDirectoryComponent(initialFile);
    const finalFileDir = fileSystemPathUtility.retrieveDirectoryComponent(finalFile);

    if (initialFileDir !== finalFileDir) {
        const directoryRelative = fileSystemPathUtility.calculateRelativeDirectoryPath(initialFileDir, finalFileDir);
        return directoryRelative ? directoryRelative + fileSystemPathUtility.getSeparatorSymbol() : '';
    } else {
        return "";
    }
};

// External utility for code compression.
// Corresponds to 'lib/uglify'. Renamed and re-imported.
const codeMinificationEngine = require('./lib/uglify');

// External utility for reporting file size differences.
// Corresponds to 'maxmin'. Renamed and re-imported.
const sizeComparisonReporter = require('maxmin');

// Simple console colorizer, replacing 'chalk'.
const consoleColorAccent = (textValue) => `\x1b[36m${textValue}\x1b[0m`; // Cyan for emphasis.

// The main task processing function, replacing `module.exports = function(grunt) { ... }`.
// It takes a 'hostRuntime' object which mimics the Grunt API.
module.exports = function(hostRuntime) {
    // Initialize the code minification engine.
    const activeMinifier = codeMinificationEngine.init(hostRuntime);

    // Register a multi-task within the host runtime environment.
    hostRuntime.registerMultiTask('codeShrink', 'Compress JavaScript assets using an optimization engine.', function() {
        // Retrieve and merge task-specific settings with defaults.
        const processingConfiguration = this.options({
            prependContent: '',
            appendContent: '',
            compressionSettings: {
                warningSuppression: false
            },
            variableRenamingOptions: {},
            prettyOutputFormat: false,
            reportingMode: 'min' // 'min' or 'gzip'
        });

        const contentPrefix = processingConfiguration.prependContent;
        const contentSuffix = processingConfiguration.appendContent;
        let mapNameComposer, inputMapNameComposer;

        // Iterate through all defined source-destination file groups.
        this.files.forEach(function(fileGroup) {
            const validSourceFiles = fileGroup.source.filter(function(filePath) {
                // Verify existence of source files.
                if (!hostRuntime.file.exists(filePath)) {
                    hostRuntime.log.warn('Input file ' + consoleColorAccent(filePath) + ' not found.');
                    return false;
                } else {
                    return true;
                }
            });

            if (validSourceFiles.length === 0) {
                hostRuntime.log.warn('Output target ' + consoleColorAccent(fileGroup.destination) + ' not generated due to absence of valid input files.');
                return; // Skip this file group.
            }

            // Custom function for source map name generation.
            if (typeof processingConfiguration.sourceMapOutputName === "function") {
                mapNameComposer = processingConfiguration.sourceMapOutputName;
            }

            // Custom function for incoming source map file name.
            if (typeof processingConfiguration.sourceMapInputFile === "function") {
                if (validSourceFiles.length !== 1) {
                    hostRuntime.fail.warn('Cannot specify `sourceMapInputFile` for multiple source files.');
                }
                inputMapNameComposer = processingConfiguration.sourceMapInputFile;
            }

            // Determine the final source map output name.
            if (mapNameComposer) {
                try {
                    processingConfiguration.finalSourceMapName = mapNameComposer(fileGroup.destination);
                } catch (e) {
                    const issue = new Error('Source map naming process failed.');
                    issue.originalError = e;
                    hostRuntime.fail.warn(issue);
                }
            } else if (!processingConfiguration.sourceMapOutputName) {
                processingConfiguration.finalSourceMapName = composeDefaultSourceMapIdentifier(fileGroup.destination);
            } else {
                processingConfiguration.finalSourceMapName = processingConfiguration.sourceMapOutputName;
            }

            // Determine the final incoming source map name.
            if (inputMapNameComposer) {
                try {
                    processingConfiguration.sourceMapInputFile = inputMapNameComposer(validSourceFiles[0]);
                } catch (e) {
                    const issue = new Error('Incoming source map naming process failed.');
                    issue.originalError = e;
                    hostRuntime.fail.warn(issue);
                }
            }

            // Calculate the relative path from the destination file to its source map.
            if (processingConfiguration.enableSourceMaps) {
                const destinationToMapRelativePath = determineInterFileDirectoryPath(fileGroup.destination, processingConfiguration.finalSourceMapName);
                const mapFileName = fileSystemPathUtility.fetchFileNameOnly(processingConfiguration.finalSourceMapName); // Get basename with extension
                processingConfiguration.destinationToMapLink = destinationToMapRelativePath + mapFileName;
            }

            // Execute the minification process.
            let optimizationResult;
            try {
                optimizationResult = activeMinifier.minify(validSourceFiles, fileGroup.destination, processingConfiguration);
            } catch (e) {
                console.error(e); // Keeping console.error for raw exception logging.
                const issue = new Error('Code optimization encountered an error.');
                if (e.message) {
                    issue.message += '\n' + e.message + '. \n';
                    if (e.line) {
                        issue.message += 'Line ' + e.line + ' in ' + validSourceFiles + '\n';
                    }
                }
                issue.originalError = e;
                hostRuntime.log.warn('Optimization of source ' + consoleColorAccent(validSourceFiles) + ' was unsuccessful.');
                hostRuntime.fail.warn(issue);
            }

            // Assemble the final output content.
            let completeOutput = optimizationResult.minifiedCode + contentSuffix;

            // Prepend banner only if source maps are not enabled (as minifier handles it then).
            if (!processingConfiguration.enableSourceMaps) {
                completeOutput = contentPrefix + completeOutput;
            }

            // Write the processed content to the destination file.
            hostRuntime.file.write(fileGroup.destination, completeOutput);

            // Write the source map file if enabled.
            if (processingConfiguration.enableSourceMaps) {
                hostRuntime.file.write(processingConfiguration.finalSourceMapName, optimizationResult.sourceMapContent);
                hostRuntime.log.writeln('File ' + consoleColorAccent(processingConfiguration.finalSourceMapName) + ' created (source map).');
            }

            // Log the size comparison report.
            hostRuntime.log.writeln('File ' + consoleColorAccent(fileGroup.destination) + ' created: ' +
                                    sizeComparisonReporter(optimizationResult.originalSize, completeOutput, processingConfiguration.reportingMode === 'gzip'));
        });
    });
};