'use strict';

const nodePath = require('path');
const styleTransformer = require('postcss');
const styleCompressor = require('csswring');
const colorizer = require('chalk');
const sizeReporter = require('maxmin');

module.exports = function(externalContext) {

    let globalConfig;
    let transformationEngine;

    /**
     * Obtains source map content or configuration based on settings.
     * @param {string} originPath
     * @returns {string|boolean|undefined}
     */
    function retrieveMapData(originPath) {
        if (typeof globalConfig.sourceMap === 'string') {
            const mapLocation = globalConfig.sourceMap + nodePath.basename(originPath) + '.map';
            if (externalContext.file.exists(mapLocation)) {
                return externalContext.file.read(mapLocation);
            }
        }
        return globalConfig.sourceMap;
    }

    /**
     * Generates a PostCSS plugin to insert a header comment.
     * @param {string} preambleText
     * @returns {Function}
     */
    function constructPreambleInserter(preambleText) {
        return (stylingNode) => {
            stylingNode.prepend(styleTransformer.comment({ text: preambleText }));
            // Insert a newline after the preamble if there are subsequent rules
            if (stylingNode.nodes && stylingNode.nodes.length > 1 && stylingNode.nodes[1]) {
                stylingNode.nodes[1].raws.before = '\n';
            }
        };
    }

    /**
     * Executes the PostCSS pipeline on the combined stylesheet.
     * @param {styleTransformer.Root} combinedAst The PostCSS root node for processing.
     * @param {string} destinationPath The target output file path.
     * @returns {{css: string, map?: string}}
     */
    function processStylesheet(combinedAst, destinationPath) {
        return transformationEngine.process(combinedAst, {
            inlineMap: globalConfig.inlineSourceMap,
            map: globalConfig.sourceMap,
            to: destinationPath
        });
    }

    externalContext.registerMultiTask('style_shrink', 'Condenses CSS files using a PostCSS-based compressor.', function() {
        globalConfig = this.options({
            headerText: undefined,
            sourceMap: undefined,
            inlineSourceMap: undefined,
            keepHacks: undefined,
            stripAllComments: undefined,
            outputReport: 'min'
        });

        const compressionModule = styleCompressor({
          preserveHacks: !!globalConfig.keepHacks,
          removeAllComments: !!globalConfig.stripAllComments
        }).postcss;

        let pipelineStages = [];

        if (typeof globalConfig.headerText === 'string') {
            pipelineStages.push(constructPreambleInserter(globalConfig.headerText));
        }
        pipelineStages.push(compressionModule);

        transformationEngine = styleTransformer(pipelineStages);

        this.files.forEach(function(fileGroup) {
            let combinedAst = null;

            const processedSources = fileGroup.src.reduce((accumulator, sourcePath) => {
                if (!externalContext.file.exists(sourcePath)) {
                    externalContext.log.warn('Input resource "' + sourcePath + '" not located. Skipping.');
                    return accumulator;
                }

                const rawContent = externalContext.file.read(sourcePath);
                const parsedSegment = styleTransformer.parse(rawContent, {
                    from: sourcePath,
                    map: retrieveMapData(sourcePath)
                });

                if (accumulator) {
                    return accumulator.append(parsedSegment);
                } else {
                    return parsedSegment;
                }
            }, null);

            if (!processedSources) {
                return;
            }

            const initialCssString = processedSources.toString();
            const transformationOutcome = processStylesheet(processedSources, fileGroup.dest);

            externalContext.file.write(fileGroup.dest, transformationOutcome.css);
            externalContext.log.writeln('File ' + colorizer.cyan(fileGroup.dest) + ' generated: ' + sizeReporter(initialCssString, transformationOutcome.css, globalConfig.outputReport === 'gzip') );

            if (transformationOutcome.map) {
                externalContext.file.write(fileGroup.dest + '.map', transformationOutcome.map);
                externalContext.log.writeln('File ' + colorizer.cyan(fileGroup.dest + '.map') + ' generated (source map data).');
            }
        });
    });
};