module.exports = function(gRunner) {
  // Pattern to capture the basic URL path from CSS url() declarations
  const BASIC_PATH_PATTERN = 'url\\(["\']?([^"\'\\(\\)]+?)["\']?\\)[};,\\s]';
  // Pattern to match URLs that should NOT be embedded (explicit 'noembed' comment)
  const EXCLUDE_NO_EMBED_PATTERN = BASIC_PATH_PATTERN + '(?!\\s*?\\/\\*\\s*?noembed\\s*?\\*\\/)';
  // Pattern to match URLs that MUST be embedded (explicit 'embed' comment)
  const INCLUDE_EMBED_PATTERN = BASIC_PATH_PATTERN + '\\s*?\\/\\*\\s*?embed\\s*?\\*\\/';
  // Pattern to identify data URIs already present
  const DATA_URI_START_PATTERN = /^data:/;
  // Pattern to check for external HTTP/HTTPS resources
  const EXTERNAL_RESOURCE_PATTERN = /^(http|https):/;

  // Core Node.js modules for file system and path manipulation
  const fileSystemOps = require('fs');
  const pathUtils = require('path');
  // Third-party utilities for unit conversion, HTTP requests, and MIME type detection
  const sizeConverter = require('node-units');
  const httpRequest = require('request');
  const mimeTypeGuesser = require('mime');

  let magicMimeDetector;

  // Attempt to load 'mmmagic' for more accurate MIME type detection, fall back if not found
  try {
    const magicModule = require('mmmagic');
    magicMimeDetector = new magicModule.Magic(magicModule.MAGIC_MIME_TYPE);
  } catch (e) {
    // If mmmagic isn't available, we'll rely on 'mime' module
    gRunner.log.debug('mmmagic module not found, falling back to mime-type-guesser.');
  }

  /**
   * Checks if a given size exceeds the configured maximum.
   * @param {number} currentSize - The size in bytes.
   * @param {object} cfgOpts - Task configuration options.
   * @returns {boolean} True if the size is too large, false otherwise.
   */
  function exceedsSizeLimit(currentSize, cfgOpts) {
    if (!cfgOpts.maxAssetSize) {
      return false; // No limit configured
    }
    const limitInBytes = sizeConverter.convert(`${cfgOpts.maxAssetSize} to B`);
    return currentSize > limitInBytes;
  }

  /**
   * Performs the actual base64 embedding and updates the file content.
   * @param {string} assetPath - The original URL path of the asset.
   * @param {Buffer} assetBuffer - The content of the asset as a Buffer.
   * @param {string} detectedMimeType - The MIME type of the asset.
   * @param {object} fileDataContainer - An object holding the file's content (e.g., { content: '...' }).
   * @param {Function} proceedToNext - Callback to process the next URL.
   */
  function injectDataUriAndContinue(assetPath, assetBuffer, detectedMimeType, fileDataContainer, proceedToNext) {
    const base64EncodedContent = assetBuffer.toString('base64');
    const constructedDataUri = `("data:${detectedMimeType};base64,${base64EncodedContent}")`;

    // Escape special characters in the URL for safe use within a RegExp
    const safeAssetPath = assetPath.replace(/[-\[\]/{}()*+?.\\^$|]/g, '\\$&');
    const targetPattern = new RegExp(`\\(['"]?${safeAssetPath}['"]?\\)`, 'g');

    fileDataContainer.content = fileDataContainer.content.replace(targetPattern, constructedDataUri);

    gRunner.log.ok(`"${assetPath}" successfully inlined.`);

    proceedToNext();
  }

  /**
   * Determines the MIME type of the asset content and then proceeds with embedding.
   * @param {string} assetPath - The original URL path.
   * @param {Buffer|string} assetPayload - The content of the asset.
   * @param {object} fileDataContainer - Object holding the file's content.
   * @param {Function} proceedToNext - Callback for the next URL.
   */
  function determineMimeAndProcess(assetPath, assetPayload, fileDataContainer, proceedToNext) {
    const assetBuffer = Buffer.from(assetPayload);

    if (magicMimeDetector) {
      magicMimeDetector.detect(assetBuffer, (err, mimeString) => {
        let finalMimeType = mimeString;
        if (err) {
          finalMimeType = 'application/octet-stream';
          gRunner.log.warn(`Could not determine MIME-type for "${assetPath}". Defaulting to "${finalMimeType}". Error: ${err.message || err}`);
        } else if (!finalMimeType) {
          finalMimeType = mimeTypeGuesser.lookup(assetPath) || 'application/octet-stream';
          gRunner.log.verbose(`mmmagic returned empty MIME for "${assetPath}". Falling back to 'mime' module: "${finalMimeType}".`);
        }
        injectDataUriAndContinue(assetPath, assetBuffer, finalMimeType, fileDataContainer, proceedToNext);
      });
    } else {
      // Fallback to 'mime' module if 'mmmagic' is not available
      const fallbackMimeType = mimeTypeGuesser.lookup(assetPath) || 'application/octet-stream';
      injectDataUriAndContinue(assetPath, assetBuffer, fallbackMimeType, fileDataContainer, proceedToNext);
    }
  }

  /**
   * Advances the processing to the next URL in the array.
   * @param {object} fileDataContainer - Object holding the file's content.
   * @param {number} currentIdx - The current index being processed.
   * @param {Array<string>} pathList - Array of URLs to process.
   * @param {object} cfgOpts - Task configuration options.
   * @param {string} baseDirForAssets - Base directory for resolving local paths.
   * @param {boolean} isVerboseOutput - Flag for verbose logging.
   * @param {Function} completionCallback - Callback when all URLs are processed.
   */
  function advanceToNextResource(fileDataContainer, currentIdx, pathList, cfgOpts, baseDirForAssets, isVerboseOutput, completionCallback) {
    // If we've processed all URLs, call the final callback.
    if (currentIdx + 1 >= pathList.length) {
      completionCallback();
    } else {
      // Otherwise, process the next URL in the list.
      handleSingleResource(fileDataContainer, currentIdx + 1, pathList, cfgOpts, baseDirForAssets, isVerboseOutput, completionCallback);
    }
  }

  /**
   * Processes a single URL, fetching its content and preparing it for embedding.
   * Handles both remote (HTTP/HTTPS) and local file system URLs.
   * @param {object} fileDataContainer - Object holding the file's content.
   * @param {number} currentIdx - The index of the current URL being processed.
   * @param {Array<string>} pathList - Array of URLs to process.
   * @param {object} cfgOpts - Task configuration options.
   * @param {string} baseDirForAssets - Base directory for resolving local paths.
   * @param {boolean} isVerboseOutput - Flag for verbose logging.
   * @param {Function} completionCallback - Callback when all URLs are processed.
   */
  function handleSingleResource(fileDataContainer, currentIdx, pathList, cfgOpts, baseDirForAssets, isVerboseOutput, completionCallback) {
    const currentResourcePath = pathList[currentIdx];
    // Create a partially applied function for moving to the next resource
    const proceedWithNextResource = advanceToNextResource.bind(null, fileDataContainer, currentIdx, pathList, cfgOpts, baseDirForAssets, isVerboseOutput, completionCallback);

    try {
      if (isVerboseOutput) {
        gRunner.log.writeln(`\n[ Processing Resource #${currentIdx + 1} of ${pathList.length} ]`);
      }

      // Check if it's an external HTTP/HTTPS resource
      if (EXTERNAL_RESOURCE_PATTERN.test(currentResourcePath)) {
        if (!httpRequest) {
          gRunner.log.warn(`HTTP request module not available. Skipping remote resource: "${currentResourcePath}"`);
          return proceedWithNextResource();
        }
        httpRequest({ url: currentResourcePath, encoding: null, timeout: 10000 }, (err, res, body) => {
          if (err || !res || res.statusCode !== 200) {
            const failureMsg = `Failed to fetch remote resource "${currentResourcePath}"`;
            if (cfgOpts.failOnMissingUrl) {
              gRunner.fail.warn(`${failureMsg}\n`);
            }
            if (err) {
              gRunner.log.error(err);
            }
            gRunner.log.warn(failureMsg);
            return proceedWithNextResource();
          }

          if (exceedsSizeLimit(body.length, cfgOpts)) {
            gRunner.log.warn(`Remote resource "${currentResourcePath}" is too large (${body.length} bytes). Skipping.`);
            return proceedWithNextResource();
          }

          determineMimeAndProcess(currentResourcePath, body, fileDataContainer, proceedWithNextResource);
        });
      } else {
        // Handle local file system resources
        let pathWithoutQuery = currentResourcePath;
        const queryIdx = currentResourcePath.indexOf('?');
        if (queryIdx >= 0) {
          pathWithoutQuery = currentResourcePath.substring(0, queryIdx);
          if (isVerboseOutput) {
            gRunner.log.writeln(`Stripped query from "${currentResourcePath}" to "${pathWithoutQuery}"`);
          }
        }

        const absolutePath = pathUtils.resolve(baseDirForAssets, pathWithoutQuery);

        if (isVerboseOutput) {
          gRunner.log.writeln(`Resolved "${currentResourcePath}" to local path "${absolutePath}"`);
        }

        if (!gRunner.file.exists(absolutePath)) {
          const missingMsg = `Local resource "${(isVerboseOutput ? absolutePath : currentResourcePath)}" not found on disk`;
          if (cfgOpts.failOnMissingUrl) {
            gRunner.fail.warn(`${missingMsg}\n`);
          }
          gRunner.log.warn(missingMsg);
          return proceedWithNextResource();
        }

        const stats = fileSystemOps.statSync(absolutePath);
        const resourceSize = stats.size;

        if (exceedsSizeLimit(resourceSize, cfgOpts)) {
          gRunner.log.warn(`Local resource "${(isVerboseOutput ? absolutePath : currentResourcePath)}" is too large (${resourceSize} bytes). Skipping.`);
          return proceedWithNextResource();
        }

        const resourceContent = fileSystemOps.readFileSync(absolutePath);

        determineMimeAndProcess(currentResourcePath, resourceContent, fileDataContainer, proceedWithNextResource);
      }
    } catch (err) {
      gRunner.log.error(err);
      gRunner.fail.warn(`An error occurred while processing "${currentResourcePath}"\n`);
    }
  }

  /**
   * Processes a single stylesheet file, extracts URLs, and initiates embedding.
   * @param {string} sourceFilePath - The path to the input stylesheet file.
   * @param {string} destinationFilePath - The path where the modified file will be written.
   * @param {object} taskConfig - The configuration options for the current task.
   * @param {Function} finalFileCallback - Callback to signal completion for this file.
   */
  function transformStylesheetFile(sourceFilePath, destinationFilePath, taskConfig, finalFileCallback) {
    try {
      gRunner.log.subhead(`Processing source file: "${sourceFilePath}"`);

      let currentFileContent = gRunner.file.read(sourceFilePath);
      const enableVerbose = gRunner.option('verbose');
      const effectiveBaseDirectory = pathUtils.resolve(taskConfig.baseDirectory || pathUtils.dirname(sourceFilePath));
      const urlExtractionPattern = new RegExp(taskConfig.inclusiveEmbed ? INCLUDE_EMBED_PATTERN : EXCLUDE_NO_EMBED_PATTERN, 'g');

      const discoveredUrls = [];
      let urlMatchResult;
      while ((urlMatchResult = urlExtractionPattern.exec(currentFileContent)) !== null) {
        if (urlMatchResult[1]) { // Ensure the captured group exists
          discoveredUrls.push(urlMatchResult[1]);
        }
      }

      // Filter out any URLs that are already data URIs
      const candidateUrls = discoveredUrls.filter(u => !u.match(DATA_URI_START_PATTERN));

      if (candidateUrls.length === 0) {
        gRunner.file.write(destinationFilePath, currentFileContent);
        gRunner.log.writeln('No embeddable URLs found. Destination file created without changes.');
        return finalFileCallback();
      }

      if (enableVerbose) {
        gRunner.log.writeln(`Using "${effectiveBaseDirectory}" as the base for local assets.`);
      }

      // Remove duplicate URLs to avoid redundant processing
      const uniqueCandidateUrls = Array.from(new Set(candidateUrls)); // Using Set for uniqueness

      gRunner.log.writeln(`${uniqueCandidateUrls.length} unique asset path${uniqueCandidateUrls.length !== 1 ? 's' : ''} identified for inlining.`);

      // Wrap content in an object so it can be passed by reference and modified
      const fileContentReference = { content: currentFileContent };

      // Start processing the URLs sequentially
      handleSingleResource(fileContentReference, 0, uniqueCandidateUrls, taskConfig, effectiveBaseDirectory, enableVerbose, () => {
        gRunner.file.write(destinationFilePath, fileContentReference.content);
        gRunner.log.ok(`File "${destinationFilePath}" successfully generated.`);
        finalFileCallback();
      });

    } catch (e) {
      gRunner.log.error(e);
      gRunner.fail.warn(`Asset inlining operation failed for "${sourceFilePath}"\n`);
    }
  }

  // Register the Grunt multi-task
  gRunner.registerMultiTask('inlineAssetUrls', "Embed CSS asset URLs as Base64 data URIs", function() {
    const done = this.async(); // Grunt's async completion handler

    const taskConfiguration = this.options({
      failOnMissingUrl: true,    // Whether to fail the task if a URL is not found
      inclusiveEmbed: false,     // If true, only embed URLs explicitly marked with 'embed' comment
      maxAssetSize: '5KB'        // Default maximum size for assets to be embedded
    });

    const validFilesToProcess = this.files.filter(fileMapping => {
      if (!fileMapping.src || fileMapping.src.length === 0) {
        gRunner.log.warn(`No source files specified for destination: ${fileMapping.dest}`);
        return false;
      }
      const sourcePath = fileMapping.src[0];
      if (!gRunner.file.exists(sourcePath)) {
        gRunner.log.warn(`Source file "${sourcePath}" not found.`);
        return false;
      }
      return true;
    });

    if (validFilesToProcess.length === 0) {
      gRunner.log.warn('No valid source files found for processing. Task finished.');
      return done();
    }

    let filesRemaining = validFilesToProcess.length;

    validFilesToProcess.forEach(fileMapping => {
      transformStylesheetFile(fileMapping.src[0], fileMapping.dest, taskConfiguration, () => {
        filesRemaining--;
        if (filesRemaining === 0) {
          done(); // All files processed, signal Grunt task completion
        }
      });
    });
  });
};