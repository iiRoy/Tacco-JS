const pathUtil = require('path');
const yamlParser = require('js-yaml');
const fileSystem = require('fs');

/**
 * A utility module designed to dynamically load configuration or data files
 * based on their file extension. It supports YAML, JSON, and JavaScript modules.
 *
 * @param {string} configSourcePath - The path to the configuration file.
 * @returns {object | any} The parsed content of the file.
 * @throws {TypeError} If the provided path is not a valid string.
 * @throws {Error} If the file does not exist, cannot be read, has an unsupported format,
 *                 or contains malformed data.
 */
module.exports = function(configSourcePath) {

    // --- Input validation and path normalization ---
    // Ensure the input path is a non-empty string for reliable processing.
    if (typeof configSourcePath !== 'string' || configSourcePath.trim().length === 0) {
        throw new TypeError('Configuration loader requires a non-empty string path as input.');
    }

    // Resolve the path to an absolute one for consistent file system operations.
    const fullyQualifiedPath = pathUtil.resolve(configSourcePath);

    // --- Initial file existence check ---
    // Perform a synchronous check to confirm the file exists before attempting to read it.
    if (!fileSystem.existsSync(fullyQualifiedPath)) {
        const missingFileError = new Error(`Configuration file not found at: '${configSourcePath}'`);
        missingFileError.code = 'FILE_NOT_FOUND';
        missingFileError.details = {
            inputPath: configSourcePath,
            resolvedPath: fullyQualifiedPath
        };
        console.error('Loader Error: Specified config source does not exist.', missingFileError.details);
        throw missingFileError;
    }

    // --- Determine file type by extension ---
    // Extract the file extension and normalize it for case-insensitive comparison.
    // The leading dot is removed for cleaner matching.
    const rawFileExtension = pathUtil.extname(fullyQualifiedPath);
    const normalizedExtension = rawFileExtension.toLowerCase().slice(1);

    // Define supported extensions for clarity and maintainability.
    const supportedYamlExtensions = ['yaml', 'yml'];
    const supportedScriptingExtensions = ['json', 'js', 'coffee', 'ls']; // 'ls' for LiveScript

    // --- Process based on file extension ---

    // Handle YAML files (.yaml, .yml)
    if (supportedYamlExtensions.includes(normalizedExtension)) {
        let fileDataBuffer;
        try {
            // Read the file's raw content as a buffer first for flexible encoding.
            fileDataBuffer = fileSystem.readFileSync(fullyQualifiedPath);
        } catch (readOperationError) {
            const readError = new Error(`Failed to read YAML file '${configSourcePath}': ${readOperationError.message}`);
            readError.code = 'FILE_READ_ERROR';
            console.error('Loader Error: Unable to read YAML file.', readError.details);
            throw readError;
        }

        // Convert the buffer to a UTF-8 string before parsing.
        const fileContentAsString = fileDataBuffer.toString('utf8');

        try {
            // Utilize js-yaml's safeLoad for secure parsing of YAML data.
            const parsedYamlObject = yamlParser.safeLoad(fileContentAsString);
            return parsedYamlObject;
        } catch (yamlParsingError) {
            const parseError = new Error(`Invalid YAML format in '${configSourcePath}': ${yamlParsingError.message}`);
            parseError.code = 'YAML_PARSE_ERROR';
            parseError.details = {
                line: yamlParsingError.mark ? yamlParsingError.mark.line + 1 : 'N/A',
                column: yamlParsingError.mark ? yamlParsingError.mark.column + 1 : 'N/A'
            };
            console.error('Loader Error: Malformed YAML content.', parseError.details);
            throw parseError;
        }
    }

    // Handle JavaScript, JSON, CoffeeScript, LiveScript files
    else if (supportedScriptingExtensions.includes(normalizedExtension)) {
        try {
            // For these file types, Node.js's native 'require' mechanism is leveraged.
            // It handles parsing, caching, and module resolution automatically.
            const loadedModuleContent = require(fullyQualifiedPath);

            // Optional: Add a sanity check for potentially empty or null exports,
            // though 'require' typically throws for unparseable or non-existent modules.
            if (loadedModuleContent === undefined || loadedModuleContent === null) {
                console.warn(`Loader Warning: Module loaded from '${configSourcePath}' appears to be empty (undefined/null export).`);
            }
            return loadedModuleContent;
        } catch (moduleLoadingError) {
            const loadError = new Error(`Failed to load module from '${configSourcePath}': ${moduleLoadingError.message}`);
            loadError.code = 'MODULE_LOAD_ERROR';
            console.error('Loader Error: Problem loading scripting module.', loadError.details);
            throw loadError;
        }
    }

    // --- Fallback for unsupported file types ---
    // If the file extension doesn't match any of the supported types, throw an error.
    else {
        const unsupportedTypeError = new Error(`Unsupported file type for '${configSourcePath}'. Extension '.${normalizedExtension}' is not recognized.`);
        unsupportedTypeError.code = 'UNSUPPORTED_FILE_TYPE';
        unsupportedTypeError.details = {
            inputPath: configSourcePath,
            extension: normalizedExtension,
            supported: [...supportedYamlExtensions, ...supportedScriptingExtensions]
        };
        console.error('Loader Error: File type not supported.', unsupportedTypeError.details);
        throw unsupportedTypeError;
    }
};