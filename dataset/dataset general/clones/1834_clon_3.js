const pathModule = require('path');
const fileSystem = require('fs');
const DataStream = require('./mu/stream'); // Renamed Stream for clarity
const SyntaxAnalyzer = require('./mu/parser'); // Renamed parser for clarity
const ContentRenderer = require('./mu/renderer'); // Renamed renderer for clarity

/**
 * @class TemplateProcessingError
 * @extends Error
 * @description Custom error class for template engine operations, providing specific error codes.
 */
class TemplateProcessingError extends Error {
  constructor(message, code = 'GENERIC_TEMPLATE_ERROR', originalError = null) {
    super(message);
    this.name = 'TemplateProcessingError';
    this.code = code;
    this.original = originalError; // Store the underlying error if any
    Object.setPrototypeOf(this, TemplateProcessingError.prototype); // Correct prototype chain
  }
}

// The core template processing engine object.
// This object will be exported as the module.
const templateEngine = module.exports = {};

/**
 * @property {string} baseDirectory
 * @description The root directory used for resolving relative template paths.
 *              Defaults to the current working directory of the process.
 */
templateEngine.baseDirectory = process.cwd();

/**
 * @property {Map<string, {parsedContent: object, isFullyCompiled: boolean}>} compiledAssetCache
 * @description An internal cache storing compiled template structures.
 *              Uses a Map for efficient key-value storage and management.
 *              Each entry contains the parsed template and a flag indicating if all its partials have also been compiled.
 */
templateEngine.compiledAssetCache = new Map();

/**
 * Asynchronously reads the content of a template file.
 * Handles both absolute and relative file paths.
 *
 * @param {string} assetPath The path to the template file.
 * @param {function(TemplateProcessingError|null, string)} completionHandler Callback function receiving an error or the file content.
 */
templateEngine.readTemplateFile = (assetPath, completionHandler) => {
  if (typeof assetPath !== 'string' || assetPath.trim().length === 0) {
    return completionHandler(new TemplateProcessingError('Asset path must be a non-empty string.', 'INVALID_ASSET_PATH_TYPE'));
  }

  let finalPath;
  if (pathModule.isAbsolute(assetPath)) {
    finalPath = assetPath;
  } else {
    // Validate baseDirectory before constructing relative path
    if (typeof templateEngine.baseDirectory !== 'string' || templateEngine.baseDirectory.trim().length === 0) {
        return completionHandler(new TemplateProcessingError('Base directory not configured for resolving relative paths.', 'CONFIG_ERROR'));
    }
    finalPath = pathModule.join(templateEngine.baseDirectory, assetPath);
  }

  fileSystem.readFile(finalPath, { encoding: 'utf8' }, (readErr, content) => {
    if (readErr) {
      return completionHandler(new TemplateProcessingError(`Failed to read template file: ${finalPath}`, 'FILE_READ_FAILURE', readErr));
    }
    completionHandler(null, content);
  });
};

/**
 * Compiles a template file into its parsed representation and caches it.
 * This process recursively compiles any partials referenced within the template.
 *
 * @param {string} assetPath The path to the template file.
 * @param {function(TemplateProcessingError|null, object)} completionHandler Callback function for the compiled template.
 * @param {Set<string>} [processedPartials=new Set()] Internal set to track partials already processed in the current compilation chain, preventing infinite recursion.
 */
templateEngine.processTemplate = (assetPath, completionHandler, processedPartials = new Set()) => {
  if (typeof assetPath !== 'string' || assetPath.trim().length === 0) {
    return completionHandler(new TemplateProcessingError('Template asset path for compilation must be a non-empty string.', 'INVALID_COMPILATION_PATH'));
  }

  // Check if the template is already fully compiled and cached
  const cachedEntry = templateEngine.compiledAssetCache.get(assetPath);
  if (cachedEntry && cachedEntry.isFullyCompiled) {
    return completionHandler(null, cachedEntry.parsedContent);
  }

  // Prevent re-processing the same partial in the current dependency chain
  if (processedPartials.has(assetPath)) {
    // If it's in the set, it means we're already compiling it or it's an ancestor.
    // This could indicate a circular dependency if not handled carefully,
    // but for simple cases, we can just return the (potentially incomplete) cached version for now
    // or indicate an error. For simplicity, we'll let the existing process finish.
    // A more robust solution might involve returning a Promise and waiting for it.
    // For now, we'll proceed, assuming the cache will eventually be updated.
    return completionHandler(null, cachedEntry ? cachedEntry.parsedContent : null); // Return partial if available
  }
  processedPartials.add(assetPath);

  templateEngine.readTemplateFile(assetPath, (readErr, fileContent) => {
    if (readErr) {
      processedPartials.delete(assetPath); // Clean up on error
      return completionHandler(readErr);
    }

    let parsedStructure;
    try {
      parsedStructure = SyntaxAnalyzer.parse(fileContent);
    } catch (parseErr) {
      processedPartials.delete(assetPath); // Clean up on error
      return completionHandler(new TemplateProcessingError(`Failed to parse template content for ${assetPath}.`, 'TEMPLATE_SYNTAX_ERROR', parseErr));
    }

    // Cache the initial parsed structure, marking it as not fully compiled yet.
    templateEngine.compiledAssetCache.set(assetPath, {
      parsedContent: parsedStructure,
      isFullyCompiled: false,
    });

    const templatePartials = parsedStructure.partials || [];
    let currentPartialIndex = 0;

    const recursivelyProcessPartials = (partialError) => {
      if (partialError) {
        processedPartials.delete(assetPath); // Clean up on error
        return completionHandler(partialError);
      }

      if (currentPartialIndex < templatePartials.length) {
        const nextPartialPath = templatePartials[currentPartialIndex];
        currentPartialIndex++;
        // Recursively call processTemplate for the next partial
        templateEngine.processTemplate(nextPartialPath, recursivelyProcessPartials, processedPartials);
      } else {
        // All partials for this template have been processed. Mark as fully compiled.
        const finalEntry = templateEngine.compiledAssetCache.get(assetPath);
        if (finalEntry) {
          finalEntry.isFullyCompiled = true;
          templateEngine.compiledAssetCache.set(assetPath, finalEntry); // Update the cache entry
        }
        processedPartials.delete(assetPath); // Remove from tracking set
        completionHandler(null, parsedStructure);
      }
    };

    // Begin processing partials for this template
    recursivelyProcessPartials(null);
  });
};

/**
 * Compiles a raw template string into its parsed form.
 * The result can optionally be cached under a specified identifier.
 *
 * @param {string} contentString The template content as a string.
 * @param {string} [cacheIdentifier] An optional name to store the compiled template in the cache.
 * @param {function(TemplateProcessingError|null, object)} [completionCallback] An optional callback for asynchronous processing.
 * @returns {object|undefined} The parsed template structure if no callback is provided, otherwise undefined.
 * @throws {TemplateProcessingError} If parsing fails and no callback is provided.
 */
templateEngine.compileString = (contentString, cacheIdentifier, completionCallback) => {
  let finalContentString = contentString;
  let finalCacheIdentifier = cacheIdentifier;
  let finalCompletionCallback = completionCallback;

  // Handle flexible argument signature: (content, callback) or (name, content, callback)
  if (typeof cacheIdentifier === 'function' && completionCallback === undefined) {
    finalCompletionCallback = cacheIdentifier;
    finalCacheIdentifier = undefined; // No cache identifier provided
  } else if (typeof cacheIdentifier === 'string' && typeof contentString === 'string' && completionCallback === undefined) {
    // This case matches (name, content) where contentString is the actual content
    // and cacheIdentifier is the name. If the user passed (content, name), it's ambiguous.
    // We'll assume the most common pattern: (name, content) or (content) or (content, callback)
    // To resolve, if contentString is clearly content and cacheIdentifier is clearly a name.
    // If the first arg is a string and the second is also a string, assume (name, content)
    // If the first is a string and second is a function, assume (content, callback)
    // The original code implies (name, template, callback) or (template, callback) if name is undefined.
    // Let's stick to (name, content, callback) or (content, callback)
    // The original `if (typeof template === 'undefined') { template = name; name = undefined; }` logic
    // means if only two args are given and the second is *not* a function, it's (content, name).
    // But then 'template' (our contentString) would be the second arg.
    // Let's simplify: if the second arg is a function, it's (content, callback). Otherwise, (name, content, [callback]).
    if (typeof cacheIdentifier === 'function') { // This means `cacheIdentifier` is actually `completionCallback`
        finalCompletionCallback = cacheIdentifier;
        finalContentString = contentString;
        finalCacheIdentifier = undefined;
    } else { // It's (name, content, [callback])
        finalCacheIdentifier = contentString; // The first arg is the name
        finalContentString = cacheIdentifier; // The second arg is the content
        finalCompletionCallback = completionCallback;
    }
  }

  // Re-evaluating the argument handling based on typical JS patterns.
  // If `cacheIdentifier` is a function, it implies `compileString(content, callback)`
  if (typeof cacheIdentifier === 'function') {
    finalCompletionCallback = cacheIdentifier;
    finalCacheIdentifier = undefined; // No explicit cache key provided
    finalContentString = contentString;
  } else {
    // Else, it's `compileString(content)` OR `compileString(cacheKey, content)` OR `compileString(cacheKey, content, callback)`
    // The original code handled `(name, template)` where `template` was optional.
    // Let's assume `compileString(content)` or `compileString(cacheKey, content)` or `compileString(cacheKey, content, callback)`
    // So if 2nd arg is not a function, it's content, and 1st is name.
    finalContentString = typeof cacheIdentifier === 'string' ? cacheIdentifier : contentString; // If cacheIdentifier is string, then it's content. Else, contentString is content.
    finalCacheIdentifier = typeof cacheIdentifier === 'string' ? contentString : undefined; // If cacheIdentifier is string, then contentString is name. Else, no name.
    finalCompletionCallback = completionCallback;
    // This is getting complex. Let's simplify and make the API clearer than the original.
    // The original's `if (typeof template === 'undefined') { template = name; name = undefined; }`
    // means if `template` (2nd arg) is missing, 1st arg is `template`, `name` is undefined.
    // If `template` is present, 1st arg is `name`, 2nd is `template`.
    // My new `compileString(contentString, cacheIdentifier, completionCallback)` makes `cacheIdentifier` optional.
    // So if `cacheIdentifier` is a string, it's the key. If it's undefined/null, no key.
    // If `cacheIdentifier` is a function, it's the callback, and no key.
    // Let's retry argument parsing for clarity:
    if (typeof cacheIdentifier === 'function') {
        finalCompletionCallback = cacheIdentifier;
        finalCacheIdentifier = undefined;
        finalContentString = contentString;
    } else if (typeof cacheIdentifier === 'string') {
        finalCacheIdentifier = cacheIdentifier;
        finalContentString = contentString;
        finalCompletionCallback = completionCallback;
    } else { // Only one argument provided: `contentString`
        finalCacheIdentifier = undefined;
        finalContentString = contentString;
        finalCompletionCallback = cacheIdentifier; // This would be the callback if provided as the second arg.
    }
    // This pattern is still tricky. Let's force `cacheIdentifier` to be explicitly passed as the second param if desired.
    // If only two args, and second is a function, it's (content, callback)
    // If only two args, and second is a string, it's (cacheKey, content)
    // If three args, it's (cacheKey, content, callback)
    if (arguments.length === 2 && typeof arguments[1] === 'function') {
        finalCompletionCallback = arguments[1];
        finalContentString = arguments[0];
        finalCacheIdentifier = undefined;
    } else if (arguments.length === 2 && typeof arguments[1] === 'string') {
        finalCacheIdentifier = arguments[0];
        finalContentString = arguments[1];
        finalCompletionCallback = undefined;
    } else if (arguments.length === 1 && typeof arguments[0] === 'string') {
        finalContentString = arguments[0];
        finalCacheIdentifier = undefined;
        finalCompletionCallback = undefined;
    } else { // Assumes 3 arguments or malformed.
        // Use the original passed values.
    }
  }


  if (typeof finalContentString !== 'string' || finalContentString.trim().length === 0) {
    const err = new TemplateProcessingError('Template content string for compilation cannot be empty.', 'EMPTY_STRING_CONTENT');
    if (finalCompletionCallback) return finalCompletionCallback(err);
    throw err;
  }

  let parsedOutput;
  try {
    parsedOutput = SyntaxAnalyzer.parse(finalContentString);

    if (finalCacheIdentifier && typeof finalCacheIdentifier === 'string') {
      templateEngine.compiledAssetCache.set(finalCacheIdentifier, {
        parsedContent: parsedOutput,
        isFullyCompiled: true, // String compilation doesn't involve partials, so it's always fully compiled.
      });
    }

    if (finalCompletionCallback) {
      finalCompletionCallback(null, parsedOutput);
    } else {
      return parsedOutput;
    }
  } catch (parseError) {
    const err = new TemplateProcessingError('Failed to parse the provided template string.', 'STRING_PARSING_FAILURE', parseError);
    if (finalCompletionCallback) {
      finalCompletionCallback(err);
    } else {
      throw err;
    }
  }
};

/**
 * Renders a previously compiled template, either by its cache identifier or a direct parsed object.
 *
 * @param {string|object} templateReference A string representing the cache key or a direct parsed template object.
 * @param {object} viewData The data context (view object) to apply during rendering.
 * @returns {DataStream} A stream that will output the rendered content.
 * @throws {TemplateProcessingError} If the template reference is invalid or not found in cache.
 */
templateEngine.executeRender = (templateReference, viewData) => {
  if (!templateReference) {
    throw new TemplateProcessingError('A template reference (cache key or parsed object) is required for rendering.', 'MISSING_RENDER_REFERENCE');
  }

  let finalParsedContent;

  if (typeof templateReference === 'object' && templateReference !== null && templateReference.tokens) {
    // Direct parsed object provided
    finalParsedContent = templateReference;
  } else if (typeof templateReference === 'string' && templateReference.trim().length > 0) {
    // Cache key provided
    const cachedEntry = templateEngine.compiledAssetCache.get(templateReference);
    if (!cachedEntry || !cachedEntry.isFullyCompiled) {
      throw new TemplateProcessingError(`Template "${templateReference}" not found in cache or not fully compiled.`, 'TEMPLATE_NOT_READY');
    }
    finalParsedContent = cachedEntry.parsedContent;
  } else {
    throw new TemplateProcessingError('Invalid template reference type. Must be a non-empty string or a parsed template object.', 'INVALID_RENDER_REFERENCE_TYPE');
  }

  return initiateContentStreaming(finalParsedContent.tokens, viewData, templateEngine.compiledAssetCache);
};

/**
 * Renders a template directly from a string, allowing for specific inline partials to be provided.
 * Inline partials override globally cached partials with the same name.
 *
 * @param {string} templateSource The raw template string to be rendered.
 * @param {object} dataContext The data context for rendering.
 * @param {object} [customPartials={}] An object where keys are partial names and values are either raw template strings or pre-parsed template objects.
 * @returns {DataStream} A stream emitting the rendered output.
 * @throws {TemplateProcessingError} If the source string is invalid or an inline partial fails to parse.
 */
templateEngine.renderString = (templateSource, dataContext, customPartials = {}) => {
  if (typeof templateSource !== 'string' || templateSource.trim().length === 0) {
    throw new TemplateProcessingError('Cannot render an empty template source string.', 'EMPTY_RENDER_SOURCE');
  }

  const mergedPartialsMap = new Map();

  // Populate with globally cached partials first
  for (const [key, entry] of templateEngine.compiledAssetCache.entries()) {
    if (entry && entry.parsedContent && entry.isFullyCompiled) {
      mergedPartialsMap.set(key, entry.parsedContent);
    }
  }

  // Process and add custom inline partials, overriding global ones if names clash
  for (const partialName in customPartials) {
    if (Object.prototype.hasOwnProperty.call(customPartials, partialName)) {
      let partialEntry = customPartials[partialName];
      if (typeof partialEntry === 'string') {
        try {
          partialEntry = SyntaxAnalyzer.parse(partialEntry);
        } catch (parseErr) {
          throw new TemplateProcessingError(`Failed to parse inline partial "${partialName}".`, 'INLINE_PARTIAL_PARSE_FAIL', parseErr);
        }
      }
      if (partialEntry && typeof partialEntry === 'object' && partialEntry.tokens) {
        mergedPartialsMap.set(partialName, partialEntry);
      } else {
          console.warn(`Warning: Inline partial "${partialName}" provided is not a valid parsed object or string content.`);
      }
    }
  }

  const currentParsed = SyntaxAnalyzer.parse(templateSource);
  return initiateContentStreaming(currentParsed.tokens, dataContext, mergedPartialsMap);
};

/**
 * Clears the entire template cache or removes a specific entry.
 *
 * @param {string} [entryIdentifier] If provided, only the template associated with this identifier is removed.
 *                                  If omitted, the entire cache is cleared.
 */
templateEngine.evictCache = (entryIdentifier) => {
  if (entryIdentifier === undefined) {
    templateEngine.compiledAssetCache.clear();
  } else if (typeof entryIdentifier === 'string') {
    templateEngine.compiledAssetCache.delete(entryIdentifier);
  } else {
    console.warn(`Warning: Attempted to evict cache with an invalid identifier type (${typeof entryIdentifier}). No action taken.`);
  }
};

/**
 * Compiles a template (if not already cached) and immediately renders it,
 * returning a stream for the output. This is a convenience function.
 *
 * @param {string} templateIdentifier The identifier (path or name) of the template to process and render.
 * @param {object} renderContext The data context for rendering.
 * @returns {DataStream} The stream that will deliver the rendered content.
 */
templateEngine.prepareAndStream = (templateIdentifier, renderContext) => {
  const resultStream = new DataStream();
  const cachedEntry = templateEngine.compiledAssetCache.get(templateIdentifier);

  if (cachedEntry && cachedEntry.isFullyCompiled) {
    deferRenderingToStream(cachedEntry.parsedContent.tokens, renderContext, templateEngine.compiledAssetCache, resultStream);
  } else {
    templateEngine.processTemplate(templateIdentifier, (compileError, compiledStructure) => {
      if (compileError) {
        return resultStream.emit('error', compileError);
      }
      if (!compiledStructure || !compiledStructure.tokens) {
          return resultStream.emit('error', new TemplateProcessingError(`Compiled structure for ${templateIdentifier} is invalid.`, 'INVALID_COMPILED_STRUCTURE'));
      }
      deferRenderingToStream(compiledStructure.tokens, renderContext, templateEngine.compiledAssetCache, resultStream);
    });
  }

  return resultStream;
};


/// Internal Helper Functions

/**
 * Creates and initializes a new DataStream for rendering.
 *
 * @param {Array<object>} tokenSequence The array of parsed template tokens.
 * @param {object} dataPayload The data context for rendering.
 * @param {Map<string, object>} availablePartials A map of partials accessible during rendering.
 * @returns {DataStream} The newly created stream.
 */
function initiateContentStreaming(tokenSequence, dataPayload, availablePartials) {
  const outputChannel = new DataStream();
  deferRenderingToStream(tokenSequence, dataPayload, availablePartials, outputChannel);
  return outputChannel;
}

/**
 * Defers the actual rendering logic to the next event loop tick using `setImmediate`.
 * This allows stream consumers to attach event listeners before rendering begins.
 *
 * @param {Array<object>} tokenSequence The array of parsed template tokens.
 * @param {object} dataPayload The data context for rendering.
 * @param {Map<string, object>} availablePartials A map of partials accessible during rendering.
 * @param {DataStream} outputChannel The stream to which rendered content will be written.
 */
function deferRenderingToStream(tokenSequence, dataPayload, availablePartials, outputChannel) {
  // Using setImmediate for deferral, which runs after I/O callbacks but before next event loop iteration.
  // This is generally suitable for non-critical deferrals.
  setImmediate(() => {
    try {
      ContentRenderer.render(tokenSequence, dataPayload, availablePartials, outputChannel, () => {
        outputChannel.emit('end'); // Signal the end of rendering
      });
    } catch (runtimeError) {
      outputChannel.emit('error', new TemplateProcessingError('An error occurred during template rendering execution.', 'RENDERING_RUNTIME_ERROR', runtimeError));
    }
  });
}