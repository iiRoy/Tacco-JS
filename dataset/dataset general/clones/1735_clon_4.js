'use strict';

var filepathTools = require('path');
var cssPrefixerCore = require('autoprefixer-core');
var textComparison = require('diff');
var colorizer = require('chalk');

module.exports = function(grntInst) {

    var taskConfiguration;
    var activeProcessor;

    /**
     * Obtains previous source map content if configured.
     * @param {string} originalCssPath Input CSS file path.
     * @returns {?string} Previous map content or null.
     */
    function retrievePreviousMapContent(originalCssPath) {
        if (typeof taskConfiguration.map.prev === 'string') {
            var mapLocation = taskConfiguration.map.prev + filepathTools.basename(originalCssPath) + '.map';

            if (grntInst.file.exists(mapLocation)) {
                return grntInst.file.read(mapLocation);
            }
        }
        return null;
    }

    /**
     * Generates the map configuration object for the CSS processor.
     * @param {object} config The main task configuration.
     * @param {string} sourcePath Current source file path.
     * @returns {boolean|object} Map configuration for autoprefixer-core.
     */
    function establishMapSettings(config, sourcePath) {
        if (typeof config.map === 'boolean') {
            return config.map;
        }

        return {
            prev: retrievePreviousMapContent(sourcePath),
            inline: (typeof config.map.inline === 'boolean') ? config.map.inline : true,
            annotation: (typeof config.map.annotation === 'string') ? config.map.annotation : true,
            sourcesContent: (typeof config.map.sourcesContent === 'boolean') ? config.map.sourcesContent : true
        };
    }

    /**
     * Processes CSS content using the active autoprefixer instance.
     * @param {string} sourceText Input CSS content.
     * @param {string} originalPath Original CSS file path.
     * @param {string} outputPath Desired output CSS file path.
     * @returns {{css: string, map: ?string}} Processed CSS and optional source map.
     */
    function processCssContent(sourceText, originalPath, outputPath) {
        return activeProcessor.process(sourceText, {
            map: establishMapSettings(taskConfiguration, originalPath),
            from: originalPath,
            to: outputPath,
            safe: taskConfiguration.safe
        });
    }

    /**
     * Reports verbose progress messages.
     * @param {string} message Log message.
     */
    function reportProgress(message) {
        grntInst.verbose.writeln(message);
    }

    /**
     * Simple pluralization helper.
     * @param {number} count The number.
     * @param {string} singular Singular form.
     * @param {string} plural Plural form.
     * @returns {string} Correct form.
     */
    function formPlural(count, singular, plural) {
        return count === 1 ? singular : plural;
    }


    grntInst.registerMultiTask('css_auto_prefixer', 'Transforms CSS files by adding vendor prefixes.', function() {
        taskConfiguration = this.options({
            browsers: undefined,
            cascade: true,
            diff: false,
            map: false,
            remove: true,
            safe: false
        });

        var processingSummary = {
            cssFiles: 0,
            mapFiles: 0,
            diffFiles: 0
        };

        activeProcessor = cssPrefixerCore({
            browsers: taskConfiguration.browsers,
            cascade: taskConfiguration.cascade,
            remove: taskConfiguration.remove
        });

        this.files.reduce(function(accumulator, currentFileGroup) {
            if (!currentFileGroup.src.length) {
                grntInst.fail.warn('No source documents specified for processing.');
                return accumulator;
            }

            try {
                currentFileGroup.src.reduce(function(innerAccumulator, currentSourcePath) {
                    var targetPath = currentFileGroup.dest || currentSourcePath;
                    var sourceText = grntInst.file.read(currentSourcePath);
                    var processedResult = processCssContent(sourceText, currentSourcePath, targetPath);

                    grntInst.file.write(targetPath, processedResult.css);
                    reportProgress('Document ' + colorizer.cyan(targetPath) + ' generated.');
                    innerAccumulator.cssFiles++;

                    if (processedResult.map) {
                        grntInst.file.write(targetPath + '.map', processedResult.map.toString());
                        reportProgress('Document ' + colorizer.cyan(targetPath + '.map') + ' generated (source mapping).');
                        innerAccumulator.mapFiles++;
                    }

                    if (taskConfiguration.diff) {
                        var patchLocation = (typeof taskConfiguration.diff === 'string') ? taskConfiguration.diff : targetPath + '.diff';

                        grntInst.file.write(patchLocation, textComparison.createPatch(targetPath, sourceText, processedResult.css));
                        reportProgress('Document ' + colorizer.cyan(patchLocation) + ' generated (difference report).');
                        innerAccumulator.diffFiles++;
                    }
                    return innerAccumulator;
                }, accumulator);

            } catch (processingError) {
                grntInst.fail.fatal(processingError);
            }
            return accumulator;
        }, processingSummary);

        if (processingSummary.cssFiles) {
            grntInst.log.ok(processingSummary.cssFiles + ' ' + 'auto-prefixed ' + formPlural(processingSummary.cssFiles, 'style sheet', 'style sheets') + ' generated.');
        }

        if (processingSummary.mapFiles) {
            grntInst.log.ok(processingSummary.mapFiles + ' ' + formPlural(processingSummary.mapFiles, 'source map', 'source maps') + ' generated.');
        }

        if (processingSummary.diffFiles) {
            grntInst.log.ok(processingSummary.diffFiles + ' ' + formPlural(processingSummary.diffFiles, 'difference report', 'difference reports') + ' generated.');
        }
    });
};