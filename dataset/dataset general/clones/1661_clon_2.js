module.exports = function(taskRunner) {
  // Define regex patterns for URL extraction and identification within stylesheets.
  var COMMON_LINK_PATTERN = 'url\\(["\']?([^"\'\\(\\)]+?)["\']?\\)[};,\\s]';
  // This pattern matches URLs that are NOT followed by a 'noembed' comment.
  var EXCLUDE_COMMENTED_PATTERN = COMMON_LINK_PATTERN + '(?!\\s*?\\/\\*\\s*?noembed\\s*?\\*\\/)';
  // This pattern specifically targets URLs that ARE followed by an 'embed' comment.
  var INCLUDE_COMMENTED_PATTERN = COMMON_LINK_PATTERN + '\\s*?\\/\\*\\s*?embed\\s*?\\*\\/';
  // Regex to detect if a URL is already a data URI.
  var DATA_URI_PATTERN = /^data:/;
  // Regex to identify remote HTTP/HTTPS resources.
  var EXTERNAL_RESOURCE_PATTERN = /^(http|https):/;


  // Load external modules required for file system operations, path resolution,
  // unit conversion, HTTP requests, and MIME type determination.
  var fileSys = require('fs');
  var pathUtil = require('path');
  var sizeConverter = require('node-units');
  var httpFetcher = require('request');
  var typeGuesser = require('mime');

  // Variable to store the mmmagic MIME type detection object, if available.
  var magicTypeDetector;

  // Attempt to load the 'mmmagic' library for more robust MIME type detection.
  try {
    var typeMagic = require('mmmagic');
    magicTypeDetector = new typeMagic.Magic(typeMagic.MAGIC_MIME_TYPE);
  } catch (problem) {
    // If 'mmmagic' is not installed or fails to load, gracefully degrade
    // and rely on 'mime' for type guessing.
  }

  /**
   * Determines if a given resource's size exceeds the configured maximum limit.
   *
   * @param {number} itemSize The size of the resource in bytes.
   * @param {object} configSettings The task's configuration options.
   * @returns {boolean} True if the resource is too large, false otherwise.
   */
  function exceedsSizeLimit(itemSize, configSettings) {
    return configSettings.skipUrlsLargerThan && itemSize > sizeConverter.convert(configSettings.skipUrlsLargerThan + ' to B');
  }

  /**
   * Embeds the base64-encoded content into the document and then proceeds to the next URL.
   *
   * @param {string} resourceLink The original URL string.
   * @param {Buffer} resourceBytes The binary content of the resource.
   * @param {string} contentType The determined MIME type of the resource.
   * @param {object} documentData An object containing the current document's content.
   * @param {function} proceedToNextResource Callback to execute for the next URL.
   */
  function insertDataUriAndContinue(resourceLink, resourceBytes, contentType, documentData, proceedToNextResource) {
    // Convert the binary content to a base64 string.
    var encodedData = resourceBytes.toString('base64');
    // Construct the full data URI string.
    var embeddedUri = '("data:' + contentType + ';base64,' + encodedData + '")';
    // Escape any special characters in the URL to safely use it in a regex.
    var safeLinkPattern = resourceLink.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    // Create a regex to find instances of the original URL within the document.
    var insertionPattern = '\\([\'"]?' + safeLinkPattern + '[\'"]?\\)';

    // Replace all occurrences of the original URL with the new data URI.
    documentData.content = documentData.content.replace(new RegExp(insertionPattern, 'g'), embeddedUri);

    // Log the successful embedding operation.
    taskRunner.log.ok('Resource "' + resourceLink + '" successfully embedded');

    // Advance to process the next resource.
    proceedToNextResource();
  }

  /**
   * Resolves the MIME type for a resource, then triggers its embedding and proceeds.
   *
   * @param {string} resourceLink The URL of the resource.
   * @param {Buffer} resourcePayload The raw content of the resource.
   * @param {object} documentData An object containing the current document's content.
   * @param {function} proceedToNextResource Callback to execute for the next URL.
   */
  function determineTypeInsertAndAdvance(resourceLink, resourcePayload, documentData, proceedToNextResource) {
    var resourceBytes = new Buffer(resourcePayload);

    // Prioritize 'mmmagic' for MIME type detection if it's available.
    if (magicTypeDetector) {
      magicTypeDetector.detect(resourceBytes, function(issue, contentType) {
        if (issue) {
          // If 'mmmagic' fails, default to a generic binary MIME type and log a warning.
          contentType = 'application/octet-stream';
          taskRunner.log.warn('Could not determine MIME type for "' + resourceLink + '". Defaulting to "' + contentType + '".');
        }

        // Proceed to embed the URL with the determined (or default) MIME type.
        insertDataUriAndContinue(resourceLink, resourceBytes, contentType, documentData, proceedToNextResource);
      });
    } else {
      // If 'mmmagic' is not available, use the 'mime' module as a fallback.
      insertDataUriAndContinue(resourceLink, resourceBytes, typeGuesser.lookup(resourceLink), documentData, proceedToNextResource);
    }
  }

  /**
   * Manages the flow of processing URLs, moving to the next or signaling completion.
   *
   * @param {object} documentData Reference to the document content being modified.
   * @param {number} currentIndex The index of the URL currently being processed.
   * @param {Array<string>} resourceList The array of all URLs to process.
   * @param {object} configSettings Task configuration options.
   * @param {string} baseDirectory The base path for resolving local files.
   * @param {boolean} verboseMode Flag for verbose logging.
   * @param {function} completionHandler Function to call when all URLs are handled.
   */
  function advanceToNextItem(documentData, currentIndex, resourceList, configSettings, baseDirectory, verboseMode, completionHandler) {
    // Increment the index and check if all URLs in the list have been processed.
    if (++currentIndex === resourceList.length) {
      completionHandler(); // All URLs processed, signal completion.
    } else {
      // If there are more URLs, process the next one.
      processSingleResource(documentData, currentIndex, resourceList, configSettings, baseDirectory, verboseMode, completionHandler);
    }
  }

  /**
   * Handles the processing of a single URL, including fetching content, size checks, and embedding.
   *
   * @param {object} documentData Reference to the document content being modified.
   * @param {number} currentIndex The index of the URL currently being processed.
   * @param {Array<string>} resourceList The array of all URLs to process.
   * @param {object} configSettings Task configuration options.
   * @param {string} baseDirectory The base path for resolving local files.
   * @param {boolean} verboseMode Flag for verbose logging.
   * @param {function} completionHandler Function to call when all URLs are handled.
   */
  function processSingleResource(documentData, currentIndex, resourceList, configSettings, baseDirectory, verboseMode, completionHandler) {
    var resourceLink = resourceList[currentIndex];
    // Create a function bound with current context to easily move to the next URL.
    var nextItemCallback = advanceToNextItem.bind(null, documentData, currentIndex, resourceList, configSettings, baseDirectory, verboseMode, completionHandler);

    try {
      if (verboseMode) {
        taskRunner.log.writeln('\n[ Processing resource #' + (currentIndex + 1) + ' ]');
      }

      // Check if the resource is external (HTTP/HTTPS).
      if (EXTERNAL_RESOURCE_PATTERN.test(resourceLink)) {
        httpFetcher({ url: resourceLink, encoding: null }, function(issue, httpResponse, responseBody) {
          // Handle cases where the HTTP request fails or returns a non-200 status.
          if (issue || httpResponse.statusCode !== 200) {
            var fetchFailureMsg = 'Failed to fetch external resource: "' + resourceLink + '"';

            if (configSettings.failOnMissingUrl) {
              taskRunner.fail.warn(fetchFailureMsg + '\n');
            }

            if (issue) {
              taskRunner.log.error(issue);
            }

            taskRunner.log.warn(fetchFailureMsg);

            return nextItemCallback(); // Skip this URL and proceed.
          }

          // Check if the fetched resource's size exceeds the limit.
          if (exceedsSizeLimit(responseBody.length, configSettings)) {
            taskRunner.log.warn('External resource "' + resourceLink + '" is too large to embed');

            return nextItemCallback(); // Skip this URL and proceed.
          }

          // Resolve MIME type, embed the content, and move to the next.
          determineTypeInsertAndAdvance(resourceLink, responseBody, documentData, nextItemCallback);
        });
      } else {
        // Handle local file paths.
        var cleanLink = resourceLink;

        // Remove query parameters from local file paths if present.
        if (resourceLink.indexOf('?') >= 0) {
          cleanLink = resourceLink.split('?')[0];

          if (verboseMode) {
            taskRunner.log.writeln('Resource "' + resourceLink + '" trimmed to "' + cleanLink + '"');
          }
        }

        // Resolve the absolute path of the local resource.
        var absolutePath = pathUtil.resolve(baseDirectory + '/' + cleanLink);

        if (verboseMode) {
          taskRunner.log.writeln('Resource "' + resourceLink + '" resolved to local path "' + absolutePath + '"');
        }

        // Verify if the local file exists on disk.
        if (!taskRunner.file.exists(absolutePath)) {
          var notFoundMsg = 'Local file "' + (verboseMode ? absolutePath : resourceLink) + '" not found';

          if (configSettings.failOnMissingUrl) {
            taskRunner.fail.warn(notFoundMsg + '\n');
          }

          taskRunner.log.warn(notFoundMsg);

          return nextItemCallback(); // Skip and proceed.
        }

        // Get the size of the local file.
        var resourceByteSize = fileSys.statSync(absolutePath)['size'];

        // Check if the local file's size exceeds the limit.
        if (exceedsSizeLimit(resourceByteSize, configSettings)) {
          taskRunner.log.warn('Local file "' + (verboseMode ? absolutePath : resourceLink) + '" is too large to embed');

          return nextItemCallback(); // Skip and proceed.
        }

        // Read the content of the local file.
        var resourcePayload = fileSys.readFileSync(absolutePath);

        // Resolve MIME type, embed the content, and move to the next.
        determineTypeInsertAndAdvance(resourceLink, resourcePayload, documentData, nextItemCallback);
      }
    } catch (issue) {
      taskRunner.log.error(issue);
      taskRunner.fail.warn('An error occurred while embedding "' + resourceLink + '"\n');
    }
  }

  /**
   * Coordinates the embedding process for a single source file.
   * It reads the file, extracts URLs, processes them, and writes the modified content.
   *
   * @param {string} sourcePath The path to the input file.
   * @param {string} destinationPath The path where the processed file will be written.
   * @param {object} configSettings Task configuration options.
   * @param {function} doneCallback Callback to signal completion for this file.
   */
  function handleDocument(sourcePath, destinationPath, configSettings, doneCallback) {
    try {
      taskRunner.log.subhead('Processing input file: "' + sourcePath + '"');

      var documentContent = taskRunner.file.read(sourcePath);
      var verboseMode = taskRunner.option('verbose');
      // Determine the base directory for resolving relative URLs, defaulting to the source file's directory.
      var baseDirectory = pathUtil.resolve(configSettings.baseDir ? configSettings.baseDir : pathUtil.dirname(sourcePath));
      // Select the appropriate regex based on the 'inclusive' option.
      var linkExtractionPattern = new RegExp(configSettings.inclusive ? INCLUDE_COMMENTED_PATTERN : EXCLUDE_COMMENTED_PATTERN, 'g');
      var discoveredLinks = [];
      var linkMatch;

      // Loop to find all URLs matching the chosen pattern in the document.
      while ((linkMatch = linkExtractionPattern.exec(documentContent))) {
        discoveredLinks.push(linkMatch[1]);
      }

      // Filter out any URLs that are already data URIs.
      var eligibleLinks = discoveredLinks.filter(function(resourceLink) { return !resourceLink.match(DATA_URI_PATTERN); });

      // If no eligible URLs are found, simply copy the file and complete.
      if (eligibleLinks.length === 0) {
        taskRunner.file.write(destinationPath, documentContent);
        taskRunner.log.writeln('No embeddable links found in file. Skipping embedding.');
        taskRunner.log.writeln('Output file "' + destinationPath + '" created.');
        return doneCallback();
      }

      if (verboseMode) {
        taskRunner.log.writeln('Using "' + baseDirectory + '" as the base directory for URL resolution.');
      }

      // Remove duplicate URLs to avoid redundant processing.
      var distinctEligibleLinks = taskRunner.util._.uniq(eligibleLinks);

      taskRunner.log.writeln(distinctEligibleLinks.length + ' unique embeddable link' + (distinctEligibleLinks.length > 1 ? 's' : '') + ' identified.');

      // Wrap the document content in an object to allow modification by reference in callbacks.
      var documentReference = { content: documentContent };

      // Start processing the first unique URL.
      processSingleResource(documentReference, 0, distinctEligibleLinks, configSettings, baseDirectory, verboseMode, function() {
        // Once all URLs are processed, write the modified content to the destination.
        taskRunner.file.write(destinationPath, documentReference.content);
        taskRunner.log.writeln('Output file "' + destinationPath + '" created.');
        doneCallback();
      });
    } catch (issue) {
      taskRunner.log.error(issue);
      taskRunner.fail.warn('Processing failed for file: ' + sourcePath + '\n');
    }
  }

  // Register the Grunt multi-task named 'styleAssetEmbedder'.
  taskRunner.registerMultiTask('styleAssetEmbedder', "Embed resource URLs as base64 strings directly into CSS files", function() {
    var asyncTaskDone = this.async(); // Grunt's asynchronous task completion function.

    // Set up default options and merge with any user-provided configurations.
    var configSettings = this.options({
      failOnMissingUrl: true, // If true, the task will fail if a resource cannot be found.
      inclusive: false // If true, only URLs explicitly marked for embedding are processed.
    });

    // Filter the list of files to process, ensuring only existing source files are included.
    var targetFiles = this.files.filter(function(currentFile) {
      if (!taskRunner.file.exists(currentFile.src[0])) {
        taskRunner.log.warn('Source file "' + currentFile.src[0] + '" does not exist. Skipping.');
        return false;
      }

      return true;
    });

    var pendingTasks = targetFiles.length; // Counter to track remaining files.

    // Iterate over each target file and initiate its processing.
    targetFiles.forEach(function(currentFile) {
      handleDocument(currentFile.src[0], currentFile.dest, configSettings, function() {
        // Decrement the counter when a file's processing is complete.
        if (--pendingTasks === 0) {
          asyncTaskDone(); // All files processed, signal Grunt task completion.
        }
      });
    });
  });
};