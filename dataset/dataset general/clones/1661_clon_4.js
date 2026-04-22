module.exports = function(kit) {
    const fileSystemAsync = require('fs').promises;
    const pathUtilities = require('path');
    const webRequester = require('request');
    const typeGuesser = require('mime');
    const underscoreUtilities = require('lodash');

    let magicDetectorInstance;
    try {
        const mmmagicModule = require('mmmagic');
        magicDetectorInstance = new mmmagicModule.Magic(mmmagicModule.MAGIC_MIME_TYPE);
    } catch (e) { /* mmmagic is optional, ignore errors */ }

    // Unified pattern to capture URL and any associated embed/noembed comment
    const URL_EXTRACTION_PATTERN = /url\(['"]?([^'"()\s]+?)['"]?\)\s*(?:\/\*\s*?(embed|noembed)\s*?\*\/)?/g;
    const DATA_URI_PREFIX = /^data:/;
    const PROTOCOL_IDENTIFIER = /^(http|https):/;

    // Converts human-readable size string (e.g., '5KB', '1MB') to bytes
    const convertMagnitudeToBytes = (magnitudeText) => {
        if (!magnitudeText) return 0;
        const match = magnitudeText.match(/^(\d+(\.\d+)?)\s*(B|KB|MB|GB)?$/i);
        if (!match) return 0;
        let value = parseFloat(match[1]);
        const unit = (match[3] || 'B').toUpperCase();
        switch (unit) {
            case 'KB': value *= 1024; break;
            case 'MB': value *= 1024 * 1024; break;
            case 'GB': value *= 1024 * 1024 * 1024; break;
        }
        return Math.round(value);
    };

    // Checks if the given size exceeds a configured limit
    const checkExceedsLimit = (currentSize, configSettings) => {
        if (!configSettings.skipSourcesLargerThan) return false;
        const sizeThreshold = convertMagnitudeToBytes(configSettings.skipSourcesLargerThan);
        return currentSize > sizeThreshold;
    };

    // Promisified wrapper for webRequester
    const executeWebRequest = (address) => {
        return new Promise((resolve, reject) => {
            webRequester({ url: address, encoding: null }, (err, res, body) => {
                if (err) return reject(err);
                resolve({ response: res, body: body });
            });
        });
    };

    // Promisified wrapper for mmmagic detection
    const detectMediaTypeMagic = (buffer, magicObj) => {
        return new Promise((resolve, reject) => {
            if (!magicObj) return reject(new Error("Magic detection module not available."));
            magicObj.detect(buffer, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    };

    // Determines the MIME type of content, preferring mmmagic if available
    const inferContentType = async (dataBuffer, dataAddress, magicObj, mimeObj, taskKit) => {
        try {
            return await detectMediaTypeMagic(dataBuffer, magicObj);
        } catch (error) {
            const fallbackType = mimeObj.lookup(dataAddress);
            taskKit.log.warn(`Failed to precisely determine MIME-type for "${dataAddress}". Defaulting to "${fallbackType}".`);
            return fallbackType;
        }
    };

    // Generates a base64 data URI string
    const generateDataPayload = (binaryData, contentType) => {
        const encodedData = binaryData.toString('base64');
        return `("data:${contentType};base64,${encodedData}")`;
    };

    // Escapes special characters in a string for use in a RegExp constructor
    const escapeRegexChars = (text) => {
        return text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    };

    // Replaces all occurrences of an original URI string with a new data URI in the content
    const substituteUriInContent = (fullContent, originalUri, replacementUri) => {
        const sanitizedUriForRegex = escapeRegexChars(originalUri);
        const replacementPattern = new RegExp('\\([\'"]?' + sanitizedUriForRegex + '[\'"]?\\)', 'g');
        return fullContent.replace(replacementPattern, replacementUri);
    };

    // Processes a single URI (local or remote) for embedding into the document content
    const processSingleUriForEmbedding = async (
        targetUri,
        currentDocumentText,
        configSettings,
        basePath,
        isDiagnosticMode,
        taskKit
    ) => {
        let contentBuffer;
        let contentSize;
        let originalSourceForLogging = targetUri;

        if (isDiagnosticMode) {
            taskKit.log.writeln(`Attempting to inline: "${targetUri}"`);
        }

        // Handle remote assets
        if (PROTOCOL_IDENTIFIER.test(targetUri)) {
            try {
                const { response, body } = await executeWebRequest(targetUri);
                if (response.statusCode !== 200) {
                    throw new Error(`Request failed with status ${response.statusCode}`);
                }
                contentBuffer = body;
                contentSize = body.length;
            } catch (error) {
                const errorMessage = `Remote asset "${targetUri}" retrieval failed: ${error.message}`;
                if (configSettings.failOnMissingSource) {
                    taskKit.fail.warn(errorMessage);
                }
                taskKit.log.warn(errorMessage);
                return currentDocumentText; // Return original content on failure
            }
        } else { // Handle local assets
            let normalizedLocalPath = targetUri;
            if (targetUri.indexOf('?') >= 0) {
                normalizedLocalPath = targetUri.split('?')[0];
                if (isDiagnosticMode) {
                    taskKit.log.writeln(`Stripped query parameters from "${targetUri}" to "${normalizedLocalPath}"`);
                }
            }

            const fullSourcePath = pathUtilities.resolve(basePath, normalizedLocalPath);
            originalSourceForLogging = fullSourcePath;

            if (isDiagnosticMode) {
                taskKit.log.writeln(`Resolved local path: "${fullSourcePath}"`);
            }

            if (!kit.file.exists(fullSourcePath)) {
                const errorMessage = `Local asset "${fullSourcePath}" not found on disk.`;
                if (configSettings.failOnMissingSource) {
                    taskKit.fail.warn(errorMessage);
                }
                taskKit.log.warn(errorMessage);
                return currentDocumentText;
            }

            try {
                const fileStats = await fileSystemAsync.stat(fullSourcePath);
                contentSize = fileStats.size;
                contentBuffer = await fileSystemAsync.readFile(fullSourcePath);
            } catch (error) {
                const errorMessage = `Failed to read local asset "${fullSourcePath}": ${error.message}`;
                if (configSettings.failOnMissingSource) {
                    taskKit.fail.warn(errorMessage);
                }
                taskKit.log.warn(errorMessage);
                return currentDocumentText;
            }
        }

        if (checkExceedsLimit(contentSize, configSettings)) {
            taskKit.log.warn(`Asset "${originalSourceForLogging}" (${contentSize} bytes) exceeds configured size limit.`);
            return currentDocumentText;
        }

        const determinedMimeType = await inferContentType(contentBuffer, targetUri, magicDetectorInstance, typeGuesser, taskKit);
        const dataPayload = generateDataPayload(contentBuffer, determinedMimeType);
        const updatedDocument = substituteUriInContent(currentDocumentText, targetUri, dataPayload);

        taskKit.log.ok(`"${targetUri}" successfully inlined.`);
        return updatedDocument;
    };

    // Processes an entire stylesheet file, extracting and inlining URLs
    const processAssetSheet = async (sourcePath, destinationPath, configSettings, taskKit) => {
        kit.log.subhead(`Processing source: "${sourcePath}"`);
        let sheetContent = await fileSystemAsync.readFile(sourcePath, 'utf8');
        const isDiagnosticMode = kit.option('verbose');
        const basePath = pathUtilities.resolve(configSettings.baseDirectory || pathUtilities.dirname(sourcePath));

        if (isDiagnosticMode) {
            kit.log.writeln(`Using "${basePath}" as base directory for asset resolution.`);
        }

        let discoveredUris = [];
        for (const match of sheetContent.matchAll(URL_EXTRACTION_PATTERN)) {
            const uri = match[1];
            const commentFlag = match[2]; // 'embed', 'noembed', or undefined

            if (DATA_URI_PREFIX.test(uri)) {
                continue; // Skip URIs that are already data URIs
            }

            // Apply inclusive/exclusive logic based on comments
            if (configSettings.inclusiveMode) {
                if (commentFlag === 'embed') {
                    discoveredUris.push(uri);
                }
            } else { // Exclusive mode is default
                if (commentFlag !== 'noembed') {
                    discoveredUris.push(uri);
                }
            }
        }

        const distinctUris = underscoreUtilities.uniq(discoveredUris);

        if (distinctUris.length === 0) {
            kit.file.write(destinationPath, sheetContent);
            kit.log.writeln('No external assets identified for inlining.');
            kit.log.writeln(`Result saved to "${destinationPath}"`);
            return;
        }

        kit.log.writeln(`${distinctUris.length} unique asset reference${distinctUris.length > 1 ? 's' : ''} found.`);

        // Process URIs sequentially, updating content in each step
        let finalContent = await distinctUris.reduce(async (previousContentPromise, currentUri, index) => {
            const currentContent = await previousContentPromise;
            if (isDiagnosticMode) {
                kit.log.writeln(`\n[ #${index + 1} ]`);
            }
            return await processSingleUriForEmbedding(
                currentUri,
                currentContent,
                configSettings,
                basePath,
                isDiagnosticMode,
                kit
            );
        }, Promise.resolve(sheetContent));

        kit.file.write(destinationPath, finalContent);
        kit.log.writeln(`Result saved to "${destinationPath}"`);
    };

    // Grunt task registration
    kit.registerMultiTask('assetInliner', "Inlines external assets into stylesheets as base64 data URIs", async function() {
        const completionSignal = this.async();
        const taskOptions = this.options({
            failOnMissingSource: true,
            inclusiveMode: false,
            // Example: skipSourcesLargerThan: '5KB',
            // Example: baseDirectory: 'path/to/assets'
        });

        const validFilePairs = this.files.filter(assetPair => {
            if (!kit.file.exists(assetPair.src[0])) {
                kit.log.warn(`Source file "${assetPair.src[0]}" does not exist.`);
                return false;
            }
            return true;
        });

        // Process files in parallel
        const fileProcessingPromises = validFilePairs.map(async assetPair => {
            try {
                await processAssetSheet(assetPair.src[0], assetPair.dest, taskOptions, kit);
            } catch (error) {
                kit.log.error(`Critical error processing file "${assetPair.src[0]}": ${error.message}`);
                if (taskOptions.failOnMissingSource) {
                    kit.fail.warn(`File processing terminated for "${assetPair.src[0]}"`);
                }
            }
        });

        await Promise.all(fileProcessingPromises);
        completionSignal();
    });
};