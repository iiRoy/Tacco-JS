let toolkit        =  require ( 'util'  ),
    fileIO         =  require ( 'fs'    ),
    filepath       =  require ( 'path'  ),
    Flow           =  require ( './tpl/dataflow'  ),
    syntaxAnalyzer =  require ( './tpl/syntaxer'  ),
    presenter      =  require ( './tpl/presenter' ),
    issueTracker   =  require ( './tpl/issues'    );

const templateEngine = module.exports = {};

templateEngine.baseDirectory = process.cwd();
templateEngine.storageMap    = {};

templateEngine.readFromDisk = function ( resourceName, completionHandler ) {
  // Determine if the provided resource name is absolute or relative
  resourceName = (resourceName.charAt(0) === '/') || (resourceName.substring(1, 3) === ':\\')
    ? resourceName // It's an absolute path
    : filepath.join(templateEngine.baseDirectory, resourceName); // It's relative, combine with base path
  fileIO.readFile(resourceName, 'utf-8', completionHandler);
};

/**
 * Processes a template file from disk. The processed representation
 * is stored in the internal cache using its file path as the key,
 * making it available for subsequent rendering requests.
 *
 * @param {string} sourceFilePath The path to the template file.
 *        If it begins with '/', it's treated as an absolute path;
 *        otherwise, it's relative to the engine's base directory.
 * @param {Function(Error|null, Object)} processCompletion A handler
 *        to be invoked once the file has been processed.
 * @param {Object} distinctInfo Optional object for unique processing flags.
 */
templateEngine.processTemplateFile = function ( sourceFilePath, processCompletion, distinctInfo ) {
  let analyzedStructure;
  let currentDistinctInfo = distinctInfo || {}; // Use 'let' for local vars

  // Read the content of the template file
  templateEngine.readFromDisk(sourceFilePath, function ( errorObject, fileContent ) {
    if (errorObject) {
      return processCompletion(errorObject);
    }

    // Parse the file content into an abstract syntax tree
    analyzedStructure = syntaxAnalyzer.analyze(fileContent);
    // Store the parsed structure in the engine's cache
    templateEngine.storageMap[sourceFilePath] = [analyzedStructure, currentDistinctInfo];

    let iteratorIndex = 0;
    // Inner function to handle recursive compilation of partials
    (function continueProcessing( errorObjectFromPartial ) {
      if (errorObjectFromPartial) {
        return processCompletion(errorObjectFromPartial);
      }

      // Check if there are more partials to compile
      if (iteratorIndex < analyzedStructure.partials.length) {
        // Recursively compile the next partial
        templateEngine.processTemplateFile(analyzedStructure.partials[iteratorIndex], continueProcessing, currentDistinctInfo);
        iteratorIndex++; // Increment index for the next partial
      } else {
        // All partials compiled, signal completion
        processCompletion(null, [analyzedStructure, {}]);
      }
    }());
  });
};

/**
 * Parses a template string directly into its structured form.
 * If a 'cacheKey' is supplied, the parsed structure is stored under that key.
 * The result can be directly used by the rendering function.
 *
 * @param {string} cacheKey (Optional) The key to use if caching the parsed result.
 * @param {string} templateContent The raw template string to be parsed.
 * @param {Function(Error|null, Object)} completionAction (Optional) A callback
 *        function invoked upon completion, aligning with the file compilation API.
 *
 * @returns {Object|void} The parsed template structure, unless a callback is provided.
 */
templateEngine.parseTemplateString = function ( cacheKey, templateContent, completionAction ) {
  let parsedStructure; // Declare with 'let'

  // Handle optional 'cacheKey' argument if 'templateContent' is omitted
  if (templateContent === undefined) {
    templateContent = cacheKey;
    cacheKey        = undefined;
  }

  try {
    // Perform the actual parsing of the template string
    parsedStructure = syntaxAnalyzer.analyze(templateContent);

    // If a cache key was provided, store the parsed structure
    if (cacheKey) {
      templateEngine.storageMap[cacheKey] = [parsedStructure, {}];
    }

    // Invoke callback or return the parsed structure directly
    if (completionAction) completionAction(null, parsedStructure);
    else return parsedStructure;

  } catch (parsingError) {
    // Handle parsing errors
    if (completionAction) completionAction(parsingError);
    else throw parsingError;
  }
};

/**
 * Initiates the rendering process for a previously parsed template,
 * which can be identified by its cache key or provided directly as an object.
 *
 * @param {string|Object} sourceOrObject The cache key (string) or the
 *        pre-parsed template structure (object) to be rendered.
 * @param {Object} dataContext The data object that will populate the template.
 *
 * @returns {Flow} A streaming object that will emit the rendered output.
 * @throws {Error} If the specified template cannot be found in the cache.
 */
templateEngine.generateOutput = function ( sourceOrObject, dataContext ) {
  let outputFlow; // Declared but not initialized here
  let retrievedStructure = typeof sourceOrObject === 'object'
    ? sourceOrObject // Direct object provided
    : templateEngine.storageMap[sourceOrObject]; // Retrieve from cache by key

  if (retrievedStructure) {
    // If it's a cached entry, it might be an array [parsed, unique], so get the first element
    retrievedStructure = retrievedStructure[0] || retrievedStructure;
    // Start the rendering process
    return initiatePresentation(retrievedStructure.tokens, dataContext, templateEngine.storageMap);
  } else {
    // Template not found, throw an error
    throw new issueTracker.MissingTemplateError(`Template '${sourceOrObject}' not found in cache.`);
  }
};

templateEngine.renderStringContent = function ( contentString, modelData, fragmentMap ) {
  let fragmentKey, processedContent, contentTokens, resultFlow; // Using 'let' for local declarations

  fragmentMap = fragmentMap || {};
  // Create a shallow copy to avoid modifying the original fragment map
  fragmentMap = createShallowCopy(fragmentMap);
  // Set the prototype to include the engine's global cache for partials lookup
  fragmentMap.__proto__ = templateEngine.storageMap;

  // Iterate through provided partials and parse any that are raw strings
  for (fragmentKey in fragmentMap) {
    if (fragmentMap.hasOwnProperty(fragmentKey) && !fragmentMap[fragmentKey].tokens) {
      fragmentMap[fragmentKey] = syntaxAnalyzer.analyze(fragmentMap[fragmentKey]);
    }
  }

  // Parse the main template string
  processedContent = syntaxAnalyzer.analyze(contentString);
  contentTokens    = processedContent.tokens;

  // Begin the rendering process with the collected tokens, data, and partials
  return initiatePresentation(contentTokens, modelData, fragmentMap);
};

/**
 * Manages the engine's internal storage map (cache).
 * It can either remove a specific template entry or clear the entire cache.
 *
 * @param {string} itemIdentifier (Optional) If provided, only the template
 *        associated with this identifier will be removed from storage.
 *        Otherwise, the entire storage map is reset.
 */
templateEngine.purgeStorage = function ( itemIdentifier ) {
  if (itemIdentifier) {
    delete templateEngine.storageMap[itemIdentifier];
  } else {
    templateEngine.storageMap = {}; // Reset the entire cache
  }
};

/**
 * Orchestrates the compilation and immediate rendering of a template.
 * It first checks the cache for the template; if found, it renders directly.
 * Otherwise, it compiles the template, caches it, and then renders.
 *
 * @param {string} templateRef The unique identifier or path of the template to process.
 * @param {Object} dataModel The data object to be used for populating the template.
 * @returns {Flow} A streaming object that delivers the final rendered output.
 */
templateEngine.processAndPresent = function ( templateRef, dataModel ) {
  const resultDataFlow = new Flow(); // Use 'const' for stream as it's not reassigned
  const cachedItem     = templateEngine.storageMap[templateRef]; // Check if template is already cached

  if (cachedItem) {
    // If cached, proceed directly to rendering
    startStreamedPresentation(cachedItem[0].tokens, dataModel, templateEngine.storageMap, resultDataFlow);
  } else {
    // If not cached, compile the template first
    templateEngine.processTemplateFile(templateRef, function ( processingError, compiledResult ) {
      if (processingError) return resultDataFlow.emit('error', processingError); // Handle compilation error
      // Once compiled, render the template
      startStreamedPresentation(compiledResult[0].tokens, dataModel, templateEngine.storageMap, resultDataFlow);
    });
  }

  return resultDataFlow;
};


// --- Internal Utility Functions ---

const OUTPUT_CHUNK_SIZE = 1024 * 8; // Define a constant for buffer sizing


/**
 * Commences the rendering process, returning a new data flow stream.
 *
 * @param {Array} templateTokens An array of parsed template tokens.
 * @param {Object} modelData The data context for rendering.
 * @param {Object} fragmentCollection A map of partials/fragments.
 * @returns {Flow} A new data flow stream for the rendered output.
 */
function initiatePresentation( templateTokens, modelData, fragmentCollection ) {
  const outputFlow = new Flow(); // Instantiate a new data flow stream
  startStreamedPresentation(templateTokens, modelData, fragmentCollection, outputFlow);
  return outputFlow;
}

/**
 * Executes the rendering operation within a stream, deferring the actual
 * rendering to the next tick of the event loop to prevent blocking.
 *
 * @param {Array} templateTokens An array of parsed template tokens.
 * @param {Object} modelData The data context for rendering.
 * @param {Object} fragmentCollection A map of partials/fragments.
 * @param {Flow} outputFlow The stream to which rendered content will be written.
 */
function startStreamedPresentation( templateTokens, modelData, fragmentCollection, outputFlow ) {
  let operationCounter = 0; // Local counter, though not used in the original logic, kept for structural fidelity.

  process.nextTick(function () {
    try {
      // Delegate the actual rendering to the presenter module
      presenter.generate(templateTokens, modelData, fragmentCollection, outputFlow, function () {
        outputFlow.emit('completion'); // Signal the end of rendering
      });
    } catch (renderingIssue) {
      outputFlow.emit('failure', renderingIssue); // Emit an error if rendering fails
    }
  });
}

/**
 * Creates a shallow copy of an object.
 *
 * @param {Object} sourceObject The object to be copied.
 * @returns {Object} A new object containing the same top-level properties.
 */
function createShallowCopy( sourceObject ) {
  const targetObject = {}; // Initialize an empty object for the copy

  // Iterate over the source object's own enumerable properties
  for (const propertyKey in sourceObject) {
    if (sourceObject.hasOwnProperty(propertyKey)) {
      targetObject[propertyKey] = sourceObject[propertyKey]; // Copy the property
    }
  }

  return targetObject;
}