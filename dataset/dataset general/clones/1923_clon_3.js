const fileSystemTools = require('path');
const styleProcessorCore = require('postcss');
const styleCompressionModule = require('csswring');
const consoleColorizer = require('chalk');
const sizeComparisonUtility = require('maxmin');

/**
 * Initializes the Grunt task for CSS compression.
 * This function is the entry point for the Grunt plugin.
 * @param {object} buildAutomation - The Grunt API object provided by the Grunt runtime.
 */
module.exports = function(buildAutomation) {

    let taskConfig; // Stores the resolved task options.
    let cssTransformationPipeline; // The PostCSS processor instance, configured with plugins.

    /**
     * A utility function for logging file-related operations with consistent formatting and color.
     * @param {string} filePath - The path of the file involved in the operation.
     * @param {string} messageSuffix - A descriptive message to append after the file path.
     * @param {Function} [colorizerFn=consoleColorizer.white] - An optional Chalk.js function to color the file path.
     */
    const logFileOperation = (filePath, messageSuffix, colorizerFn = consoleColorizer.white) => {
        buildAutomation.log.info(`File ${colorizerFn(filePath)} ${messageSuffix}`);
    };

    /**
     * Determines the correct source map configuration based on the task's options.
     * If `sourceMapSetting` is a string, it attempts to load an existing source map file.
     * Otherwise, it returns the boolean or undefined value of `sourceMapSetting`.
     * @param {string} sourceFileIdentifier - The path to the original CSS file for which a map might exist.
     * @returns {string|boolean|undefined} The content of an existing map, a boolean (true/false), or undefined.
     */
    const resolveMapConfiguration = (sourceFileIdentifier) => {
        if (typeof taskConfig.sourceMapSetting === 'string') {
            const potentialMapLocation = taskConfig.sourceMapSetting + fileSystemTools.basename(sourceFileIdentifier) + '.map';
            if (buildAutomation.file.checkExistence(potentialMapLocation)) {
                buildAutomation.log.debug(`Detected and loading existing source map from: ${potentialMapLocation}`);
                return buildAutomation.file.readContent(potentialMapLocation);
            } else {
                buildAutomation.log.verbose(`No pre-existing source map found at '${potentialMapLocation}' for '${sourceFileIdentifier}'.`);
            }
        }
        return taskConfig.sourceMapSetting;
    };

    /**
     * Generates a PostCSS plugin function that prepends a banner comment to the CSS output.
     * It also ensures a newline character separates the banner from the subsequent CSS rules for clarity.
     * @param {string} headerContent - The text content to be used in the banner comment.
     * @returns {Function} A PostCSS plugin function that can be `use`d by a PostCSS processor.
     */
    const createHeaderInjectionPlugin = (headerContent) => {
        return (styleDocument) => {
            // Validate header content before proceeding.
            if (!headerContent || typeof headerContent !== 'string' || headerContent.trim() === '') {
                buildAutomation.log.warning('Provided banner content is empty or invalid. Skipping banner injection.');
                return;
            }
            const bannerCommentNode = styleProcessorCore.comment({ text: headerContent });
            styleDocument.prepend(bannerCommentNode);
            buildAutomation.log.debug('Banner comment node successfully prepended.');

            // Locate the first non-comment node after the banner to insert a newline.
            let firstContentNode = null;
            for (const node of styleDocument.nodes) {
                if (node !== bannerCommentNode && node.type !== 'comment') {
                    firstContentNode = node;
                    break;
                }
            }

            if (firstContentNode) {
                // Ensure raws object exists and prepend a newline to 'before'.
                firstContentNode.raws = firstContentNode.raws || {};
                firstContentNode.raws.before = '\n' + (firstContentNode.raws.before || '');
                buildAutomation.log.verbose('Newline character added after banner for improved formatting.');
            } else {
                buildAutomation.log.verbose('No subsequent content nodes found after banner; skipping newline insertion.');
            }
        };
    };

    /**
     * Executes the configured CSS transformation pipeline on the given PostCSS AST.
     * It applies all registered PostCSS plugins and options.
     * @param {object} inputCssAst - The PostCSS Abstract Syntax Tree (AST) representing the input CSS.
     * @param {string} destinationPath - The target file path for the output, used primarily for source map metadata ('to' option).
     * @returns {{css: string, map?: string}} An object containing the transformed CSS string and an optional source map string.
     */
    const executeCssTransformation = (inputCssAst, destinationPath) => {
        // Guard against invalid or empty AST input.
        if (!inputCssAst || inputCssAst.type !== 'root') {
            buildAutomation.log.error('Received an invalid or non-root PostCSS AST for transformation. Returning empty CSS.');
            return { css: '', map: undefined }; // Return a consistent structure.
        }
        buildAutomation.log.verbose(`Commencing CSS transformation for output path: ${destinationPath}`);
        return cssTransformationPipeline.process(inputCssAst, {
            inlineMap: taskConfig.inlineSourceMaps, // Controls if map is embedded in CSS.
            map: taskConfig.sourceMapSetting,      // General source map setting (boolean or path).
            to: destinationPath                    // Destination file path for source map metadata.
        });
    };

    // Main Grunt multi-task registration.
    buildAutomation.declareMultiTask('csswring', 'Efficiently compresses CSS files utilizing the PostCSS-based CSSWring plugin.', function() {
        buildAutomation.log.verbose('Starting CSS compression task execution...');
        const taskStartTime = process.hrtime.bigint(); // High-resolution timer for task duration.

        // Resolve Grunt task options, providing fallback defaults for robustness.
        taskConfig = this.getTaskOptions({
            taskHeader: null,                   // By default, no header banner is added.
            sourceMapSetting: false,            // Default to no source map generation.
            inlineSourceMaps: false,            // Default to not embedding source maps directly in CSS.
            preserveBrowserHacks: false,        // Default to removing browser-specific hacks.
            stripAllCommentsConfig: false,      // Default to preserving some 'important' comments.
            reportFormat: 'min'                 // Default report shows minified size, not gzipped.
        });

        // Explicitly normalize source map settings if they were left undefined.
        if (taskConfig.sourceMapSetting === undefined) {
             taskConfig.sourceMapSetting = false;
             buildAutomation.log.debug('`sourceMapSetting` was undefined, defaulting to `false`.');
        }
        if (taskConfig.inlineSourceMaps === undefined) {
            taskConfig.inlineSourceMaps = false;
            buildAutomation.log.debug('`inlineSourceMaps` was undefined, defaulting to `false`.');
        }

        // Initialize the core CSS compression engine using `styleCompressionModule`.
        const compressionEngineInstance = styleCompressionModule({
            preserveHacks: Boolean(taskConfig.preserveBrowserHacks), // Ensure boolean type.
            removeAllComments: Boolean(taskConfig.stripAllCommentsConfig)
        }).postcss;

        // Construct the PostCSS transformation pipeline and add the compression engine.
        cssTransformationPipeline = styleProcessorCore().use(compressionEngineInstance);
        buildAutomation.log.debug('CSS compression engine integrated into the PostCSS pipeline.');

        // Conditionally add the banner injection plugin if a valid header is provided.
        if (taskConfig.taskHeader && typeof taskConfig.taskHeader === 'string' && taskConfig.taskHeader.trim().length > 0) {
            cssTransformationPipeline.use(createHeaderInjectionPlugin(taskConfig.taskHeader));
            buildAutomation.log.verbose('Custom header banner plugin successfully added to the pipeline.');
        } else {
            buildAutomation.log.debug('No valid or non-empty task header detected; banner plugin skipped.');
        }

        // Iterate over each file group defined in the Grunt configuration.
        for (const fileSpecification of this.inputOutputFiles) { // Using modern `for...of` loop for iteration.
            buildAutomation.log.debug(`Initiating processing for file group targeting: ${fileSpecification.dest}`);

            // Guard clauses for essential file group properties.
            if (!fileSpecification.src || fileSpecification.src.length === 0) {
                buildAutomation.log.warning(`No source files specified for destination "${fileSpecification.dest}". This group will be skipped.`);
                continue; // Proceed to the next file group.
            }
            if (!fileSpecification.dest) {
                buildAutomation.log.error('A destination path is missing for a file group. Cannot process. Skipping this group.');
                continue;
            }

            let combinedInputAst = null; // This variable will accumulate the AST from all source files.

            try {
                // Filter out non-existent source files and then combine the remaining into a single AST.
                combinedInputAst = fileSpecification.src
                    .filter(currentSourceFilePath => {
                        if (!buildAutomation.file.checkExistence(currentSourceFilePath)) {
                            buildAutomation.log.warning(`Source file "${currentSourceFilePath}" not found. It will be excluded from this compilation.`);
                            return false; // Exclude non-existent files.
                        }
                        buildAutomation.log.verbose(`Including source file: ${currentSourceFilePath}`);
                        return true; // Include existing files.
                    })
                    .reduce((accumulatorAst, currentSourceFilePath) => {
                        const fileContentBuffer = buildAutomation.file.readContent(currentSourceFilePath);
                        // Parse each individual CSS file, potentially using its own source map.
                        const parsedFragmentAst = styleProcessorCore.parse(fileContentBuffer, {
                            from: currentSourceFilePath,
                            map: resolveMapConfiguration(currentSourceFilePath)
                        });
                        // Append parsed fragment to the accumulator AST or start a new AST.
                        return accumulatorAst ? accumulatorAst.append(parsedFragmentAst) : parsedFragmentAst;
                    }, null); // Start with a null accumulator.
            } catch (parsingError) {
                buildAutomation.log.error(`An unhandled error occurred during CSS parsing for group "${fileSpecification.dest}": ${parsingError.message}`);
                buildAutomation.log.debug(`Parsing error stack trace: ${parsingError.stack}`);
                continue; // Skip the current file group if parsing fails.
            }

            // Early exit if no valid CSS AST could be generated from the source files.
            if (!combinedInputAst) {
                buildAutomation.log.warning(`No valid CSS content could be aggregated for destination "${fileSpecification.dest}". Skipping output generation for this group.`);
                continue;
            }

            // Generate the original CSS string from the combined AST for size comparison reporting.
            const originalCompiledCss = combinedInputAst.toResult().css;
            let transformationOutcome;

            try {
                // Execute the main CSS transformation process.
                transformationOutcome = executeCssTransformation(combinedInputAst, fileSpecification.dest);
            } catch (processingError) {
                buildAutomation.log.error(`An error occurred during CSS transformation for "${fileSpecification.dest}": ${processingError.message}`);
                buildAutomation.log.debug(`Transformation error stack trace: ${processingError.stack}`);
                continue; // Skip the current file group if transformation fails.
            }

            // Write the transformed CSS content to the specified destination file.
            buildAutomation.file.writeContent(fileSpecification.dest, transformationOutcome.css);

            // Determine if the size report should include gzip compression details.
            const isReportGzip = (taskConfig.reportFormat === 'gzip');
            const sizeReportMessage = sizeComparisonUtility(originalCompiledCss, transformationOutcome.css, isReportGzip);
            logFileOperation(fileSpecification.dest, `successfully compressed and created: ${sizeReportMessage}`, consoleColorizer.highlightBlue);

            // Handle the output of the associated source map, if one was generated.
            if (transformationOutcome.map) {
                const mapOutputFileName = fileSpecification.dest + '.map';
                buildAutomation.file.writeContent(mapOutputFileName, transformationOutcome.map);
                logFileOperation(mapOutputFileName, 'created (its associated source map).', consoleColorizer.highlightBlue);
            } else {
                buildAutomation.log.verbose(`No source map was generated for "${fileSpecification.dest}" based on current configuration.`);
            }
        } // End of file group iteration.

        const taskEndTime = process.hrtime.bigint();
        const durationMs = Number(taskEndTime - taskStartTime) / 1_000_000; // Convert nanoseconds to milliseconds.
        buildAutomation.log.verbose(`CSS compression task completed successfully in ${durationMs.toFixed(2)} ms.`);
    });
};