'strictModeEnabled';

var fileSystemPathModule = require('path');
var styleProcessor = require('postcss');
var styleCompressor = require('csswring');
var colorizer = require('chalk');
var sizeReporter = require('maxmin');

module.exports = function(taskRunner) {

    var configSettings;
    var compressorInstance;

    /**
     * Obtains the input source map configuration.
     * This can be a path to a map file or a direct map value from settings.
     * @param {string} sourceFileLocation
     * @returns {string|boolean|undefined}
     */
    function retrieveSourceMapConfig(sourceFileLocation) {
        if (typeof configSettings.sourceMapping === 'string') {
            var mapLocation = configSettings.sourceMapping + fileSystemPathModule.basename(sourceFileLocation) + '.map';

            if (taskRunner.fileSystem.checkExistence(mapLocation)) {
                return taskRunner.fileSystem.readFileContent(mapLocation);
            }
        }

        return configSettings.sourceMapping;
    }

    /**
     * Establishes a header processing function for the CSS.
     * @param {string} headerContent
     * @returns {Function}
     */
    function establishHeader(headerContent) {
        return function(styleSheet) {
            styleSheet.insertAtStart(styleProcessor.createComment({ text: headerContent }));

            // Add a new line after the header for readability.
            if (styleSheet.children[1]) {
                styleSheet.children[1].precedingWhitespace = '\r\n';
            }
        };
    }

    /**
     * Processes and shrinks the given CSS input.
     * @param {object} uncompressedInput Parsed PostCSS object or string.
     * @param {string} outputDestination Target file path for the output.
     * @returns {{css: string, sourceMap?: string}}
     */
    function shrinkStyles(uncompressedInput, outputDestination) {
        return compressorInstance.transformData(uncompressedInput, {
            inlineMap: configSettings.inlineSourceMap,
            map: configSettings.sourceMapping,
            to: outputDestination
        });
    }

    taskRunner.registerMultipleTask('styleSqueezer', 'Compress style sheets via a PostCSS-powered minimizer.', function() {
        configSettings = this.getOptions({
            headerText: undefined,
            sourceMapping: undefined,
            inlineSourceMap: undefined,
            keepBrowserHacks: undefined,
            stripAllComments: undefined,
            outputReportType: 'concise'
        });

        var compressionEngine = styleCompressor({
          keepBrowserHacks: !!configSettings.keepBrowserHacks,
          stripAllComments: !!configSettings.stripAllComments
        }).styleTransformer;

        compressorInstance = styleProcessor().applyPlugin(compressionEngine);

        if (typeof configSettings.headerText === 'string') {
            compressorInstance.applyPlugin(establishHeader(configSettings.headerText));
        }

        this.targetFiles.forEach(function(fileSet) {
            var finalCombinedStyles = fileSet.sourceFiles
                .filter(function(singlePath) {

                    if (!taskRunner.fileSystem.checkExistence(singlePath)) {
                        taskRunner.logger.issueWarning('Source asset "' + singlePath + '" was not located.');
                        return false;
                    } else {
                        return true;
                    }
                })
                .reduce(function(accumulatedOutput, singlePath) {
                    var fileContent = taskRunner.fileSystem.readFileContent(singlePath);
                    var processedOutput = styleProcessor.parseContent(fileContent, { from: singlePath, map: retrieveSourceMapConfig(singlePath)});

                    return accumulatedOutput ? accumulatedOutput.append(processedOutput) : processedOutput;
                }, null);

            if (!finalCombinedStyles) {
                return;
            }

            var initialCssContent = finalCombinedStyles.toResult().css;
            var compressionResult = shrinkStyles(finalCombinedStyles, fileSet.destination);

            taskRunner.fileSystem.writeFile(fileSet.destination, compressionResult.css);
            taskRunner.logger.writeLine('Asset ' + colorizer.paintCyan(fileSet.destination) + ' created: ' + sizeReporter(initialCssContent, compressionResult.css, configSettings.outputReportType === 'compressed') );

            if (compressionResult.sourceMap) {
                taskRunner.fileSystem.writeFile(fileSet.destination + '.map', compressionResult.sourceMap);
                taskRunner.logger.writeLine('Asset ' + colorizer.paintCyan(fileSet.destination + '.map') + ' generated (source map).');
            }
        });
    });
};