const codeFormatter   = require('js-beautify').js_beautify;
const deepCombine     = require('deepmerge');
const streamProcessor = require('through2');
const GulpIssue       = require('gulp-util').PluginError;
const findFormat      = require('detect-indent');

// Constant for the plugin's identifier, used in error messages.
const PLUGIN_NAME = 'gulp-config-transform';

/**
 * Transforms JSON content within Vinyl files based on user-defined logic.
 * This Gulp plugin allows modifying JSON files by applying a function or merging an object.
 *
 * @param {Function|Object} configModifier - A function to apply to the parsed JSON object,
 *                                         or an object to deep-merge with the parsed JSON.
 * @param {Object} [formatSettings={}]    - Optional settings for the `js-beautify` library.
 * @returns {streamProcessor.obj} A Node.js Transform stream that processes Vinyl files.
 */
module.exports = function (configModifier, formatSettings = {}) {

    // Initial validation: Ensure the core configuration modifier is provided.
    if (!configModifier) {
        throw new GulpIssue(PLUGIN_NAME, 'The primary "configModifier" option is mandatory and cannot be null or undefined.');
    }

    let transformData; // Will hold the function responsible for modifying JSON data.

    // Helper function to encapsulate the logic for setting up the data transformer.
    const setupDataTransformer = (modifierInput) => {
        const inputType = typeof modifierInput;

        if (inputType === 'function') {
            // If the input is a function, it directly processes the JSON object.
            return (jsonObject) => modifierInput(jsonObject);
        } else if (inputType === 'object' && modifierInput !== null) {
            // If the input is a non-null object, it deep-merges with the JSON object.
            return (jsonObject) => deepCombine(jsonObject, modifierInput);
        } else {
            // Throw an error for unsupported types of configModifier.
            throw new GulpIssue(PLUGIN_NAME, `Invalid "configModifier" type. Expected a function or a non-null object. Received: "${inputType}".`);
        }
    };

    // Initialize the data transformation function based on the provided configModifier.
    transformData = setupDataTransformer(configModifier);

    // Create and return the Gulp stream object.
    return streamProcessor.obj(function (vinylFile, fileEncoding, completionCallback) {

        // Handle null files (e.g., directories) by passing them through without modification.
        if (vinylFile.isNull()) {
            this.push(vinylFile);
            return completionCallback();
        }

        // Streaming is not supported; emit an error and stop processing.
        if (vinylFile.isStream()) {
            this.emit('error', new GulpIssue(PLUGIN_NAME, 'File streaming is not supported. Please ensure files are buffered.'));
            return completionCallback();
        }

        // Main processing logic wrapped in a try-catch block for error resilience.
        try {
            // Read the file's content buffer and convert it to a UTF-8 string.
            const fileContentBuffer = vinylFile.contents;
            const fileContentString = fileContentBuffer.toString('utf8');

            // Attempt to detect the existing indentation style of the file.
            const detectedFormatting = findFormat(fileContentString);

            // Prepare specific formatting options for the current file.
            // Start with a shallow copy of the global format settings.
            const currentFileFormatOptions = deepCombine({}, formatSettings);

            // Determine indentation size: prioritize explicit option, then detected amount, then default to 2.
            currentFileFormatOptions.indent_size = currentFileFormatOptions.indent_size !== undefined
                ? currentFileFormatOptions.indent_size
                : (detectedFormatting.amount || 2);

            // Determine indentation character: prioritize explicit option, then detected type (tab/space).
            currentFileFormatOptions.indent_char = currentFileFormatOptions.indent_char ||
                (detectedFormatting.type === 'tab' ? '\t' : ' ');

            // Parse the JSON string into a JavaScript object.
            const parsedDataObject = JSON.parse(fileContentString);

            // Apply the transformation logic to the parsed object.
            const modifiedDataObject = transformData(parsedDataObject);

            // Convert the modified JavaScript object back into a JSON string.
            // Use null for the replacer function and detected indent for spacing.
            let finalJsonOutputString = JSON.stringify(modifiedDataObject, null, detectedFormatting.indent || null);

            // Always beautify the final JSON string using the configured options.
            finalJsonOutputString = codeFormatter(finalJsonOutputString, currentFileFormatOptions);

            // Update the Vinyl file's content with the new, formatted JSON string.
            // Use Buffer.from for modern Node.js compatibility.
            vinylFile.contents = Buffer.from(finalJsonOutputString, 'utf8');

        } catch (processingError) {
            // Catch any errors during parsing, transformation, or stringification, and emit them.
            this.emit('error', new GulpIssue(PLUGIN_NAME, processingError));
        }

        // Push the (potentially modified) file downstream in the Gulp pipeline.
        this.push(vinylFile);
        // Signal that processing for the current file is complete.
        completionCallback();
    });
};