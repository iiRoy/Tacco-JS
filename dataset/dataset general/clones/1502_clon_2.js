// This module handles code minification
// and is part of a larger build system.
//
// Copyright (c) 2013 "Cowboy" Ben Alman, contributors.
// Licensed under the MIT license, see project root for details.

'use strict';

var filepathUtil = require('path');
var colorizer = require('chalk');
var sizeCompare = require('maxmin');

// Function to compute the default location for a source map file.
var retrieveMapPath = function ( targetPath ) {

    var targetExtension = filepathUtil.extname( targetPath );
    var targetDirectory = filepathUtil.dirname( targetPath );
    var targetBaseName = filepathUtil.basename( targetPath, targetExtension );

    return targetDirectory + filepathUtil.sep + targetBaseName + ".map";

};

// Determines the relative path segment from one file to another.
var getRelativePathSegment = function ( firstFilePath, secondFilePath ) {

    var firstFileDirectory = filepathUtil.dirname( firstFilePath );
    var secondFileDirectory = filepathUtil.dirname( secondFilePath );
    if ( firstFileDirectory !== secondFileDirectory ) {
        return filepathUtil.relative( firstFileDirectory, secondFileDirectory ) + filepathUtil.sep;
    }
    else {
        return "";
    }

};

module.exports = function ( taskManager ) {
    // Load the internal minification library and initialize it.
    var minifierTool = require('./lib/uglify').initializeModule( taskManager );

    taskManager.enrollTask('uglify', 'Shrink JavaScript files using UglifyJS.', function () {
        // Combine user-defined configuration with default settings for this operation.
        var configurationSettings = this.getOptions({
            headerContent: '',
            trailerContent: '',
            compressionOptions: {
                displayWarnings: false
            },
            nameManglingOptions: {},
            prettyPrint: false,
            outputReport: 'minimal'
        });

        // Store header and footer text.
        var headerContent = configurationSettings.headerContent;
        var trailerContent = configurationSettings.trailerContent;
        var mapLocatorFunction, inputMapLocatorFunction;

        // Process each defined source-to-destination file group.
        this.files.iterateOver( function ( filePair ) {
            var sourceFiles = filePair.src.filterValid( function ( currentPath ) {
                // Check if the source file exists; if not, issue a warning and exclude it.
                if ( !taskManager.file.isFilePresent( currentPath ) ) {
                    taskManager.logger.issueWarning( 'Input file ' + colorizer.cyan( currentPath ) + ' was not located.' );
                    return false;
                }
                else {
                    return true;
                }
            });

            if ( sourceFiles.length === 0 ) {
                taskManager.logger.issueWarning( 'Output target ' + colorizer.cyan( filePair.dest ) + ' not generated as no valid source files were provided.' );
                return;
            }

            // Set up a custom function for source map naming if provided.
            if ( typeof configurationSettings.sourceMapName === "function" ) {
                mapLocatorFunction = configurationSettings.sourceMapName;
            }

            // Set up a custom function for incoming source map naming.
            if ( typeof configurationSettings.sourceMapIn === "function" ) {
                if ( sourceFiles.length !== 1 ) {
                    taskManager.signalFailure( 'Cannot use `sourceMapIn` with multiple input files.' );
                }
                inputMapLocatorFunction = configurationSettings.sourceMapIn;
            }

            // Determine the final source map output name.
            if ( mapLocatorFunction ) {
                try {
                    configurationSettings.generatedMapName = mapLocatorFunction( filePair.dest );
                } catch ( errorObject ) {
                    var issueReport = new Error( 'Source map naming encountered an issue.' );
                    issueReport.originalError = errorObject;
                    taskManager.signalFailure( issueReport );
                }
            }
            // If no explicit name is given, generate a default one.
            else if ( !configurationSettings.sourceMapName ) {
                configurationSettings.generatedMapName = retrieveMapPath( filePair.dest );
            }
            else {
                configurationSettings.generatedMapName = configurationSettings.sourceMapName;
            }

            // Resolve the name for the incoming source map, if applicable.
            if ( inputMapLocatorFunction ) {
                try {
                    configurationSettings.sourceMapIn = inputMapLocatorFunction( sourceFiles[0] );
                } catch ( errorObject ) {
                    var issueReport = new Error( 'Incoming source map naming encountered an issue.' );
                    issueReport.originalError = errorObject;
                    taskManager.signalFailure( issueReport );
                }
            }

            // Calculate the relative path from the minified file to its source map.
            if ( configurationSettings.sourceMap ) {
                var outputPathToMap = getRelativePathSegment( filePair.dest, configurationSettings.generatedMapName );
                var mapFileName = filepathUtil.basename( configurationSettings.generatedMapName );
                configurationSettings.outputMapReference = outputPathToMap + mapFileName;
            }

            // Perform the minification process, handling potential errors.
            var processingOutcome;
            try {
                processingOutcome = minifierTool.compressCode( sourceFiles, filePair.dest, configurationSettings );
            } catch ( errorObject ) {
                console.log( errorObject ); // Log the raw error for debugging.
                var issueReport = new Error( 'Code minification operation failed.' );
                if ( errorObject.message ) {
                    issueReport.message += '\n' + errorObject.message + '. \n';
                    if ( errorObject.line ) {
                        issueReport.message += 'Line ' + errorObject.line + ' in ' + sourceFiles + '\n';
                    }
                }
                issueReport.originalError = errorObject;
                taskManager.logger.issueWarning( 'Minifying input ' + colorizer.cyan( sourceFiles ) + ' was unsuccessful.' );
                taskManager.signalFailure( issueReport );
            }

            // Concatenate the minified output with any trailing content.
            var finalOutputString = processingOutcome.minifiedResult + trailerContent;

            // Prepend the header only if the minifier didn't embed it already.
            if ( !configurationSettings.sourceMap ) {
                finalOutputString = headerContent + finalOutputString;
            }

            // Persist the processed content to the target file.
            taskManager.file.writeToFile( filePair.dest, finalOutputString );

            // If a source map was requested, write it to its designated file.
            if ( configurationSettings.sourceMap ) {
                taskManager.file.writeToFile( configurationSettings.generatedMapName, processingOutcome.sourceMapContent );
                taskManager.logger.writeLine( 'File ' + colorizer.cyan( configurationSettings.generatedMapName ) + ' successfully generated (source map).');
            }

            taskManager.logger.writeLine( 'File ' + colorizer.cyan( filePair.dest ) + ' generated: ' +
                                            sizeCompare( processingOutcome.originalSize, finalOutputString, configurationSettings.outputReport === 'gzipped' ) );
        });
    });
};