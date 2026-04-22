const fileSysOp = require('fs');
const dirUtil = require('path');
const makeDirs = require('mkdirp');
const hashGen = require('crypto');
const webAddress = require('url');
const transformCssFn = require('rework-plugin-function');

/**
 * Exports the primary function for processing asset URLs within CSS.
 * This function acts as a ReworkCSS plugin factory, generating a plugin
 * that transforms asset references (like `url(...)`) into hashed versions,
 * copying the original assets to a specified destination directory.
 */
module.exports = resourceProcessor;

/**
 * Generates a ReworkCSS plugin to handle asset URLs.
 * The plugin will replace `url()` functions in CSS with new URLs pointing
 * to hashed versions of the assets, and manage the copying of these assets.
 *
 * @param {object} inputConfig - An object containing configuration parameters.
 * @param {string} [inputConfig.src='.'] - The root directory from which relative asset paths are resolved.
 * @param {function} [inputConfig.onFile] - An optional callback function invoked for each source asset file found.
 * @param {string} inputConfig.dest - The mandatory destination directory where processed assets will be copied.
 * @param {string} [inputConfig.func='url'] - The name of the CSS function to target for processing (e.g., 'url', 'asset').
 * @param {function} [inputConfig.onError] - An error handling function that will be called if an operation fails.
 * @param {string} [inputConfig.prefix=''] - A URL path prefix to prepend to the new asset URLs in the CSS output.
 * @param {boolean} [inputConfig.retainName=true] - If true, the original filename will be retained as part of the hashed output filename.
 * @returns {function} A ReworkCSS plugin function ready to be used with Rework.
 */
function resourceProcessor(inputConfig) {
    // Validate and normalize the input configuration, ensuring it's an object.
    const effectiveConfig = inputConfig instanceof Object ? inputConfig : {};

    // Define a set of default settings for clarity and robustness.
    const defaultSettings = {
        sourceRoot: '.',
        fileVisitor: null,
        outputDestination: null, // This remains mandatory, no default for safety.
        cssFunctionName: 'url',
        errorObserver: standardErrorHandler,
        outputUrlPrefix: '',
        preserveOriginalName: true
    };

    // Merge the provided configuration with defaults.
    // Explicitly mapping input names to internal names for better readability and structure.
    const currentSettings = Object.assign({}, defaultSettings, {
        sourceRoot: effectiveConfig.src !== undefined ? effectiveConfig.src : defaultSettings.sourceRoot,
        fileVisitor: effectiveConfig.onFile !== undefined ? effectiveConfig.onFile : defaultSettings.fileVisitor,
        outputDestination: effectiveConfig.dest, // `dest` is critical, no default from `defaultSettings`.
        cssFunctionName: effectiveConfig.func !== undefined ? effectiveConfig.func : defaultSettings.cssFunctionName,
        errorObserver: effectiveConfig.onError !== undefined ? effectiveConfig.onError : defaultSettings.errorObserver,
        outputUrlPrefix: effectiveConfig.prefix !== undefined ? effectiveConfig.prefix : defaultSettings.outputUrlPrefix,
        preserveOriginalName: typeof effectiveConfig.retainName !== 'undefined'
            ? effectiveConfig.retainName
            : defaultSettings.preserveOriginalName
    });

    // Extract and resolve key configuration parameters.
    const sourceBaseFolder = dirUtil.resolve(currentSettings.sourceRoot);
    const fileVisitCallback = currentSettings.fileVisitor;
    const targetOutputFolder = currentSettings.outputDestination; // This is the resolved destination path.
    const cssTargetFuncName = currentSettings.cssFunctionName;
    const errorHandler = currentSettings.errorObserver;
    const urlPathPrefix = currentSettings.outputUrlPrefix;
    const keepOriginalFilename = currentSettings.preserveOriginalName;

    // A map to cache already processed asset paths to their new generated filenames.
    // This prevents redundant file reads, hashing, and writes for duplicate asset references.
    const assetCacheMap = {};

    // --- Nested Utility Functions ---

    /**
     * Constructs the final CSS `url()` string, including the configured prefix,
     * and any original query parameters or hash fragments.
     * @param {string} finalAssetName - The generated (e.g., hashed) name of the asset.
     * @param {object} parsedUrlComponents - The result of `webAddress.parse()` for the original URL.
     * @returns {string} The complete, transformed CSS function string.
     */
    const buildOutputUrl = (finalAssetName, parsedUrlComponents) => {
        let constructedUrl = finalAssetName;
        // Append original search query if it exists.
        if (parsedUrlComponents.search) {
            constructedUrl += parsedUrlComponents.search;
        }
        // Append original hash fragment if it exists.
        if (parsedUrlComponents.hash) {
            constructedUrl += parsedUrlComponents.hash;
        }
        // Return the full CSS function string with the new URL.
        return `${cssTargetFuncName}(${urlPathPrefix}${constructedUrl})`;
    };

    /**
     * Generates the original CSS function call string, used when an asset cannot be processed.
     * @param {string} originalResourcePath - The original path or URL of the asset.
     * @returns {string} The untransformed CSS function string.
     */
    const revertToOriginal = (originalResourcePath) => {
        return `${cssTargetFuncName}(${originalResourcePath})`;
    };

    // --- Main Asset Processing Logic ---

    /**
     * This is the core function called by `rework-plugin-function` for each
     * CSS function matching `cssTargetFuncName`. It handles the logic for
     * locating, hashing, copying, and renaming assets.
     * @param {string} resourcePath - The argument string of the CSS function (e.g., 'path/to/image.png').
     * @returns {string} The new asset URL string to replace the original in the CSS.
     */
    function handleCssResource(resourcePath) {
        const parsedUrlComponents = webAddress.parse(resourcePath);

        // Guard clause: If the resource has a protocol (e.g., 'http:', 'data:')
        // or no discernible pathname, it's an external or invalid URL.
        // We cannot process it, so return the original.
        if (parsedUrlComponents.protocol || !parsedUrlComponents.pathname) {
            // console.log(`[ResourceProcessor] Skipping external or invalid URL: ${resourcePath}`); // Debug log
            return revertToOriginal(resourcePath);
        }

        // Use the pathname as the local asset path.
        const localAssetRelativePath = parsedUrlComponents.pathname;

        // Determine the base directory for resolving the asset.
        // If `this.position.source` is available (meaning we're inside a CSS file),
        // resolve the asset relative to that CSS file's directory. Otherwise, use `sourceBaseFolder`.
        const currentContextPosition = this.position; // Capturing `this.position` for clarity.
        const resolvedBaseFolder = currentContextPosition && currentContextPosition.source
            ? dirUtil.resolve(sourceBaseFolder, dirUtil.dirname(currentContextPosition.source))
            : sourceBaseFolder;

        // Construct the full absolute path to the source asset file.
        const sourceFilePath = dirUtil.join(resolvedBaseFolder, localAssetRelativePath);

        // If a file visitor callback is provided and is a function, invoke it.
        if (typeof fileVisitCallback === 'function') {
            fileVisitCallback(sourceFilePath);
        }

        // Check the cache first to avoid reprocessing.
        if (objHasProp(assetCacheMap, sourceFilePath)) {
            // console.log(`[ResourceProcessor] Cache hit for: ${sourceFilePath}`); // Debug log
            return buildOutputUrl(assetCacheMap[sourceFilePath], parsedUrlComponents);
        }

        let fileContentBuffer;
        try {
            // Synchronously read the content of the asset file.
            fileContentBuffer = fileSysOp.readFileSync(sourceFilePath);
        } catch (readOperationError) {
            // If reading fails, report the error and return the original URL.
            errorHandler(readOperationError);
            return revertToOriginal(resourcePath);
        }

        // Additional guard: If the file content is empty, treat it as an error.
        if (!fileContentBuffer || fileContentBuffer.length === 0) {
            errorHandler(new Error(`Asset file is empty or unreadable: ${sourceFilePath}`));
            return revertToOriginal(resourcePath);
        }

        // Generate a SHA1 hash of the file's content.
        // This hash will be used to create a unique filename.
        const contentHashValue = hashGen.createHash('sha1')
            .update(fileContentBuffer)
            .digest('hex')
            .substring(0, 16); // Truncate to 16 characters for brevity.

        // Extract the original file extension and base name.
        const fileExtension = dirUtil.extname(localAssetRelativePath);
        const originalFileName = dirUtil.basename(localAssetRelativePath, fileExtension);

        // Construct the new filename based on the `keepOriginalFilename` setting.
        const finalOutputName = keepOriginalFilename
            ? `${originalFileName}-${contentHashValue}${fileExtension}`
            : `${contentHashValue}${fileExtension}`;

        // Crucial validation: Ensure the output destination is defined before attempting to write.
        if (!targetOutputFolder) {
            errorHandler(new Error(`Output destination directory is not specified for asset: ${sourceFilePath}`));
            return revertToOriginal(resourcePath);
        }

        // Construct the full destination path for the new asset file.
        const destinationFilePath = dirUtil.join(targetOutputFolder, finalOutputName);

        try {
            // Ensure that the destination directory structure exists.
            makeDirs.sync(targetOutputFolder);
            // Write the asset's content to its new, hashed destination.
            fileSysOp.writeFileSync(destinationFilePath, fileContentBuffer);
            // console.log(`[ResourceProcessor] Copied asset: ${sourceFilePath} -> ${destinationFilePath}`); // Debug log
        } catch (writeOperationError) {
            // If writing fails, report the error and return the original URL.
            errorHandler(writeOperationError);
            return revertToOriginal(resourcePath);
        }

        // Store the new filename in the cache for future references to the same source file.
        assetCacheMap[sourceFilePath] = finalOutputName;

        // Return the newly constructed URL for the CSS output.
        return buildOutputUrl(finalOutputName, parsedUrlComponents);
    }

    // Prepare the function map required by `rework-plugin-function`.
    // The key is the CSS function name to intercept, and the value is our handler.
    const cssFunctionHandlers = {};
    cssFunctionHandlers[cssTargetFuncName] = handleCssResource;

    // Return the configured ReworkCSS plugin. The `false` argument indicates
    // that the plugin should not process nested function calls (e.g., `url(data:image...)`).
    return transformCssFn(cssFunctionHandlers, false);
}

/**
 * A default error handler function.
 * This handler logs the error message to the console and then re-throws the error,
 * which is a common behavior for unhandled exceptions.
 * @param {Error} caughtError - The error object to handle.
 */
function standardErrorHandler(caughtError) {
    console.error(`[ResourceProcessor: ERROR] An issue occurred during asset processing: ${caughtError.message}`);
    throw caughtError;
}

/**
 * A utility function to safely check if an object possesses a specific property directly
 * (i.e., not inherited from its prototype chain).
 * @param {object} targetObject - The object to inspect.
 * @param {string} propertyName - The name of the property to check for.
 * @returns {boolean} True if the property exists directly on the object, false otherwise.
 */
function objHasProp(targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
}