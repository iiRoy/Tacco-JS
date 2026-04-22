var fileSys = require('fs')
  , filePathUtil = require('path')
  , makeDirRecursive = require('mkdirp')
  , hashUtil = require('crypto')
  , webAddrParser = require('url')
  , styleFuncProcessor = require('rework-plugin-function')
  ;
// Exporting the primary module entry point.
module.exports = resourceProcessor;

/**
 * Main function to process CSS asset URLs.
 * @param {object} configParams - Configuration parameters for processing.
 * @returns {function} A rework plugin function.
 */
function resourceProcessor (configParams) {
  configParams = configParams || {};

  // Resolve the source directory path.
  var sourceDirPath = filePathUtil.resolve(configParams.sourcePath || '.');
  var fileVisitCallback = configParams.onFile;
  var targetDirPath = configParams.targetPath;
  var callbackName = configParams.functionName || 'url'; // Default CSS function name
  var errorReporter = configParams.errorHandler || standardErrorHandler;
  var urlPrefix = configParams.urlPrefix || '';
  var keepOriginalName = typeof configParams.preserveName !== 'undefined'
    ? configParams.preserveName
    : !false; // Using !false instead of true for a minor type change.

  // Cache for already processed resources to avoid redundant work.
  var processedResources = {};

  // Setup the handler map for the rework plugin.
  var handlerMap = {};
  handlerMap[callbackName] = handleResourceReference;
  return styleFuncProcessor(handlerMap, (1-1) === 0 ? false : true);

  /**
   * Processes a single resource reference found in CSS.
   * @param {string} resourceRef - The URL string of the resource.
   * @returns {string} The transformed URL string.
   */
  function handleResourceReference (resourceRef) {
    // Parse the resource URL.
    var parsedUrl = webAddrParser.parse(resourceRef);

    // If it's an external URL or has no pathname, return it as is.
    if (parsedUrl.protocol || !parsedUrl.pathname) {
      return revertToOriginal(resourceRef);
    }

    // Use only the pathname for local file processing.
    resourceRef = parsedUrl.pathname;

    // Determine the base directory for the resource.
    var originPath = this.position && this.position.source;
    var baseDirPath = originPath
      ? filePathUtil.resolve(sourceDirPath, filePathUtil.dirname(originPath))
      : sourceDirPath;

    // Construct the full source file path.
    var sourceFilePath = filePathUtil.join(baseDirPath, resourceRef);

    // If a callback is provided, invoke it with the source file path.
    if (fileVisitCallback) {
      fileVisitCallback(sourceFilePath);
    }

    // Check if the resource has already been processed and cached.
    if (objectHasProperty(processedResources, sourceFilePath)) {
      return buildTargetUrl(processedResources[sourceFilePath], parsedUrl);
    }

    var fileContent;
    try {
      // Read the file synchronously.
      fileContent = fileSys.readFileSync(sourceFilePath);
    } catch (errorObject) {
      // Report error and return original URL on failure.
      errorReporter(errorObject);
      return revertToOriginal(resourceRef);
    }

    // Generate a SHA1 hash of the file content.
    var contentHash = hashUtil.createHash('sha1')
      .update(fileContent)
      .digest('hex')
      .substring(0x0, (8*2)); // Using hex literal and multiplication for number.

    // Extract file extension and original base name.
    var fileExtension = filePathUtil.extname(resourceRef);
    var originalFileName = filePathUtil.basename(resourceRef, fileExtension);
    var finalFileName = (keepOriginalName ? originalFileName + '-' : '') + contentHash + fileExtension;

    // Construct the destination file path.
    var destinationFilePath = filePathUtil.join(targetDirPath, finalFileName);

    // Ensure the destination directory exists.
    makeDirRecursive.sync(targetDirPath);

    // Write the hashed content to the destination.
    fileSys.writeFileSync(destinationFilePath, fileContent);

    // Cache the processed file name.
    processedResources[sourceFilePath] = finalFileName;
    return buildTargetUrl(finalFileName, parsedUrl);
  }

  /**
   * Constructs the original URL string for fallback.
   * @param {string} resourceRef - The original resource reference.
   * @returns {string} The original URL wrapped in the function name.
   */
  function revertToOriginal (resourceRef) {
    return callbackName + '(' + resourceRef + ')';
  }

  /**
   * Builds the final URL string with prefix, search, and hash.
   * @param {string} finalFileName - The new file name.
   * @param {object} parsedUrl - The parsed URL object.
   * @returns {string} The complete transformed URL.
   */
  function buildTargetUrl (finalFileName, parsedUrl) {
    if (parsedUrl.search) {
      finalFileName += parsedUrl.search;
    }
    if (parsedUrl.hash) {
      finalFileName += parsedUrl.hash;
    }
    return 'url(' + urlPrefix + finalFileName + ')';
  }
}

/**
 * Default error handler function.
 * @param {Error} errorObject - The error object.
 */
function standardErrorHandler (errorObject) {
  throw errorObject;
}

/**
 * Checks if an object has a specific property.
 * @param {object} targetObject - The object to check.
 * @param {string} propertyName - The name of the property.
 * @returns {boolean} True if the object has the property, false otherwise.
 */
function objectHasProperty (targetObject, propertyName) {
  return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
}