// This file contains a foundational utility library for application setup and common operations.
// It's designed for flexibility and to support various execution environments.

// Global configuration flags and the root application namespace object.
const _APPLICATION_IS_OPTIMIZED_ = false; // Indicates if this build is compiled for production (e.g., minified).
const appCore = appCore || {}; // The primary global object for all core utilities.

/**
 * @type {Window|Global|Object}
 * Reference to the global execution context (e.g., `window` in browsers, `global` in Node.js).
 */
appCore.globalExecutionContext = this;

/**
 * @type {boolean}
 * Flag to control development-specific features, logging, and assertions.
 */
appCore.isDevelopmentEnvironment = true;

/**
 * @type {string}
 * The default locale for the application, influencing internationalization.
 */
appCore.currentApplicationLocale = "en-US";

/**
 * @type {boolean}
 * Determines if the current environment is considered secure (e.g., HTTPS, trusted origin).
 * Can influence security-sensitive behaviors.
 */
appCore.isSecureContext = true;

/**
 * Registers a new module within the application's namespace hierarchy.
 * This function ensures that the full object path for the module exists.
 * In development builds, it also performs checks for duplicate module declarations.
 * @param {string} modulePathIdentifier - The fully qualified name of the module (e.g., "myApp.ui.Button").
 * @throws {Error} If an invalid module identifier is provided or if a module is redeclared in dev mode.
 */
appCore.registerNewModule = function(modulePathIdentifier) {
  // Validate input: ensure the module identifier is a non-empty string.
  if (typeof modulePathIdentifier !== 'string' || modulePathIdentifier.trim().length === 0) {
    throw new Error("Invalid module path identifier: Must be a non-empty string.");
  }

  // Perform verbose checks only in non-optimized builds.
  if (!_APPLICATION_IS_OPTIMIZED_) {
    // Check for existing module registration to prevent unintended overrides.
    if (appCore.isModulePathRegistered_(modulePathIdentifier)) {
      const duplicateError = `Module "${modulePathIdentifier}" has already been explicitly declared.`;
      if (appCore.globalExecutionContext.console) {
        appCore.globalExecutionContext.console.error(duplicateError);
      }
      throw new Error(duplicateError);
    }

    // Remove the module from the list of implicitly created namespaces, as it's now explicit.
    delete appCore.implicitPathCreations_[modulePathIdentifier];

    // Recursively mark parent namespaces as implicitly created if they don't yet exist.
    let currentSegment = modulePathIdentifier;
    let parentSegment;
    const pathSeparator = ".";
    // Loop while there's a parent segment and that parent segment doesn't resolve to an existing object.
    while ((parentSegment = currentSegment.substring(0, currentSegment.lastIndexOf(pathSeparator))) && !appCore.getObjectFromPath(parentSegment)) {
      appCore.implicitPathCreations_[parentSegment] = true;
      currentSegment = parentSegment;
    }
  }
  // Ensure the entire path structure exists in the global context.
  appCore.ensureObjectPathExists(modulePathIdentifier);
};

/**
 * Designates a block of code as strictly for testing purposes.
 * If this function is invoked in an optimized production build, it will throw an error.
 * @param {string=} customFailureMessage - An optional message to include in the error for more context.
 * @throws {Error} If this function is called in a production environment.
 */
appCore.markForTestingOnly = function(customFailureMessage) {
  // In an optimized build where development features are disabled, this indicates an erroneous import.
  if (_APPLICATION_IS_OPTIMIZED_ && !appCore.isDevelopmentEnvironment) {
    const detail = customFailureMessage ? `: ${customFailureMessage}` : ".";
    const errorText = `Attempted to load test-only code into a production environment${detail}`;
    // Log the issue to the console before throwing, if a console is available.
    if (appCore.globalExecutionContext.console && typeof appCore.globalExecutionContext.console.error === 'function') {
      appCore.globalExecutionContext.console.error(errorText);
    }
    throw new Error(errorText);
  }
};

// Conditional initialization for module registration tracking, active only in non-optimized builds.
if (!_APPLICATION_IS_OPTIMIZED_) {
  /**
   * Internal utility to check if a module's path is already registered or exists in the global context.
   * This differentiates between explicitly declared modules and implicitly created namespaces.
   * @param {string} namespaceKey - The full dot-separated namespace string.
   * @returns {boolean} True if the namespace key corresponds to an existing object and was not just implicitly created.
   * @private
   */
  appCore.isModulePathRegistered_ = function(namespaceKey) {
    // Check if the namespace exists as an object AND it's not merely an implicitly created placeholder.
    const isImplicitlyCreated = appCore.implicitPathCreations_.hasOwnProperty(namespaceKey) && appCore.implicitPathCreations_[namespaceKey] === true;
    const objectRefExists = appCore.getObjectFromPath(namespaceKey) !== null;
    return !isImplicitlyCreated && objectRefExists;
  };

  /**
   * @type {Object<string, boolean>}
   * A map tracking namespaces that have been implicitly created as parent objects
   * during the processing of `appCore.registerNewModule`.
   * @private
   */
  appCore.implicitPathCreations_ = {};
}

/**
 * Ensures that a sequence of nested objects, represented by a dot-separated string path,
 * exists within a given base context. Intermediate objects are created as empty objects if missing.
 * An optional value can be assigned to the final segment of the path.
 * @param {string} objectPath - The dot-separated path string (e.g., "my.app.config").
 * @param {*} [valueToAssign] - The value to set at the very end of the path.
 * @param {Object=} baseContext - The object within which to create the path (defaults to `appCore.globalExecutionContext`).
 */
appCore.ensureObjectPathExists = function(objectPath, valueToAssign, baseContext) {
  // Input validation: ensure a valid path string.
  if (typeof objectPath !== 'string' || objectPath.trim().length === 0) {
    console.warn("Attempted to ensure an empty or invalid object path.");
    return;
  }

  const pathSegments = objectPath.split(".");
  let currentObjectReference = baseContext || appCore.globalExecutionContext;

  // Handle potential legacy `execScript` for the very first segment in old IE environments.
  const firstPathPart = pathSegments[0];
  if (firstPathPart && !(firstPathPart in currentObjectReference) && currentObjectReference.execScript) {
    try {
      currentObjectReference.execScript(`var ${firstPathPart};`);
    } catch (e) {
      // Log but do not halt for environment-specific script execution failures.
      console.warn(`Failed to execute initial script for "${firstPathPart}": ${e.message}`);
    }
  }

  let segmentIterator = 0;
  while (segmentIterator < pathSegments.length) {
    const segmentName = pathSegments[segmentIterator];
    const isFinalSegment = (segmentIterator === pathSegments.length - 1);

    if (isFinalSegment && appCore.isDefined(valueToAssign)) {
      currentObjectReference[segmentName] = valueToAssign;
    } else {
      // If the current segment does not exist, initialize it as an empty object.
      if (!currentObjectReference[segmentName]) {
        currentObjectReference[segmentName] = {};
      }
      // Move deeper into the object structure.
      currentObjectReference = currentObjectReference[segmentName];
    }
    segmentIterator++;
  }
};

/**
 * Retrieves an object by its dot-separated path from a base object or the global context.
 * Returns `null` if any part of the path does not exist or is `null`/`undefined`.
 * @param {string} qualifiedObjectName - The dot-separated path to the object (e.g., "my.app.data.records").
 * @param {Object=} searchBaseObject - The object from which to start the path resolution (defaults to `appCore.globalExecutionContext`).
 * @returns {*|null} The resolved object, or `null` if the path cannot be fully resolved.
 */
appCore.getObjectFromPath = function(qualifiedObjectName, searchBaseObject) {
  // Input validation.
  if (typeof qualifiedObjectName !== 'string' || qualifiedObjectName.trim().length === 0) {
    console.warn("Cannot resolve object for an empty or invalid path.");
    return null;
  }

  const pathParts = qualifiedObjectName.split(".");
  let currentResolvedObject = searchBaseObject || appCore.globalExecutionContext;
  let partIndex = 0;

  // Iterate through each part of the path.
  while (partIndex < pathParts.length) {
    const currentPathPart = pathParts[partIndex];
    // If the current part exists and is not null/undefined, continue traversing.
    if (appCore.existsAndIsNotNull(currentResolvedObject[currentPathPart])) {
      currentResolvedObject = currentResolvedObject[currentPathPart];
    } else {
      // Path segment not found, or it's null/undefined.
      return null;
    }
    partIndex++;
  }
  return currentResolvedObject;
};

/**
 * Copies all own enumerable properties from a source object to a destination object.
 * If no destination is provided, properties are copied to the global execution context.
 * @param {Object} sourceObject - The object whose properties will be copied.
 * @param {Object=} destinationObject - The object to which properties will be copied (defaults to `appCore.globalExecutionContext`).
 * @throws {Error} If the sourceObject is not a valid non-null object.
 */
appCore.transferPropertiesToGlobal = function(sourceObject, destinationObject) {
  if (typeof sourceObject !== 'object' || sourceObject === null) {
    throw new Error("Source object must be a non-null object for property transfer.");
  }
  const target = destinationObject || appCore.globalExecutionContext;
  for (const propertyKey in sourceObject) {
    // Ensure only own properties are copied, not those from the prototype chain.
    if (Object.prototype.hasOwnProperty.call(sourceObject, propertyKey)) {
      target[propertyKey] = sourceObject[propertyKey];
    }
  }
};

/**
 * Internal dependency tracking and loading mechanism for non-optimized builds.
 * This structure is used by the dynamic script loader.
 * @private
 */
if (!_APPLICATION_IS_OPTIMIZED_) {
  appCore.dependencyManager = {
    moduleToScriptMap: {},     // Maps module names (e.g., "my.module") to their script paths (e.g., "my/module.js").
    scriptToProvidedModules: {}, // Maps script paths to an object of modules they provide.
    scriptToRequiredModules: {}, // Maps script paths to an object of modules they require.
    loadedAndProcessedScripts: {}, // Tracks script paths that have been successfully loaded.
    traversalHistory: {},      // Used during dependency graph traversal to detect cycles.
    scriptsPendingLoad: {}     // Scripts that have been identified for loading but not yet injected.
  };

  /**
   * Registers a script file and its provided/required modules with the dependency manager.
   * This data is typically generated by a build tool (e.g., Closure Compiler's `deps.js`).
   * @param {string} scriptRelativePath - The path to the JavaScript file, relative to the base directory.
   * @param {Array<string>} modulesProvided - A list of module names that this script defines.
   * @param {Array<string>} modulesRequired - A list of module names that this script depends on.
   */
  appCore.registerScriptDependencies = function(scriptRelativePath, modulesProvided, modulesRequired) {
    // Normalize path separators to use forward slashes consistently.
    const normalizedPath = scriptRelativePath.replace(/\\/g, "/");

    // Populate the module-to-script path map.
    for (const providedModule of modulesProvided) {
      appCore.dependencyManager.moduleToScriptMap[providedModule] = normalizedPath;
      // Also update the reverse map (script to provided modules).
      if (!appCore.dependencyManager.scriptToProvidedModules[normalizedPath]) {
        appCore.dependencyManager.scriptToProvidedModules[normalizedPath] = {};
      }
      appCore.dependencyManager.scriptToProvidedModules[normalizedPath][providedModule] = true;
    }

    // Populate the script-to-required modules map.
    if (modulesRequired.length > 0) {
      if (!appCore.dependencyManager.scriptToRequiredModules[normalizedPath]) {
        appCore.dependencyManager.scriptToRequiredModules[normalizedPath] = {};
      }
      for (const requiredModule of modulesRequired) {
        appCore.dependencyManager.scriptToRequiredModules[normalizedPath][requiredModule] = true;
      }
    }
  };
}

/**
 * @type {boolean}
 * Global flag to enable or disable dynamic script loading based on `appCore.importModule`.
 * This should generally be `false` in production builds.
 */
appCore.allowDynamicScriptLoading = true;

/**
 * Imports a specified module, ensuring its code is loaded and available.
 * In development builds, this function can trigger dynamic script loading based on registered dependencies.
 * @param {string} moduleQualifiedName - The full dot-separated name of the module to import.
 * @throws {Error} If the module cannot be found or loaded, especially in dynamic loading scenarios.
 */
appCore.importModule = function(moduleQualifiedName) {
  // In optimized builds, modules are expected to be pre-bundled, so no dynamic loading.
  if (!_APPLICATION_IS_OPTIMIZED_ && !appCore.isModulePathRegistered_(moduleQualifiedName)) {
    // Attempt dynamic loading if enabled.
    if (appCore.allowDynamicScriptLoading) {
      const scriptFileForModule = appCore.resolveScriptPathForModule_(moduleQualifiedName);
      if (scriptFileForModule) {
        // Add the script to the queue for loading and process the queue.
        appCore.dependencyManager.scriptsPendingLoad[scriptFileForModule] = true;
        appCore.processPendingScripts_();
        // Log successful dynamic load.
        if (appCore.globalExecutionContext.console) {
          appCore.globalExecutionContext.console.log(`Dynamically loaded script for module: "${moduleQualifiedName}".`);
        }
        return;
      }
    }
    // If we reach here, the module wasn't found/loaded.
    const failureMessage = `Module "${moduleQualifiedName}" could not be found or dynamically loaded. Check dependencies.`;
    if (appCore.globalExecutionContext.console && typeof appCore.globalExecutionContext.console.error === 'function') {
      appCore.globalExecutionContext.console.error(failureMessage);
    }
    throw new Error(failureMessage);
  }
};

/**
 * @type {string}
 * The base URL path from which all application scripts are loaded.
 * Automatically detected or explicitly set.
 */
appCore.applicationBaseUrl = "";

/**
 * A function that performs no operation. Useful as a default callback or placeholder.
 */
appCore.noOperation = function() {};

/**
 * A simple identity function that returns its first argument unmodified.
 * @param {*} value - Any input value.
 * @returns {*} The exact input value.
 */
appCore.identityFunction = function(value) {
  return value;
};

/**
 * Throws an error indicating that an abstract method has not been implemented.
 * Intended for use in abstract classes or interface definitions.
 * @throws {Error} Always throws an error.
 */
appCore.throwUnimplementedError = function() {
  throw new Error("This abstract method must be overridden by a concrete implementation.");
};

/**
 * Augments a constructor function with a static `getInstance` method,
 * implementing the singleton design pattern. Subsequent calls to `getInstance`
 * will return the same instance.
 * @param {function(new:T, ...*)} ConstructorReference - The constructor function to make a singleton.
 * @template T
 * @throws {Error} If `ConstructorReference` is not a function.
 */
appCore.implementSingletonPattern = function(ConstructorReference) {
  if (typeof ConstructorReference !== 'function') {
    throw new Error("Cannot apply singleton pattern to a non-function constructor.");
  }

  // Use a unique symbol or a complex string as the instance property key to prevent conflicts.
  const singletonInstanceKey = `_singleton_instance_ref_${ConstructorReference.name || 'anonymous'}_${Math.random().toString(36).substring(2, 9)}`;

  ConstructorReference.getInstance = function() {
    // If an instance already exists, return it.
    if (ConstructorReference[singletonInstanceKey]) {
      return ConstructorReference[singletonInstanceKey];
    }
    // In development mode, track newly instantiated singletons.
    if (appCore.isDevelopmentEnvironment) {
      appCore.trackingSingletons_.push(ConstructorReference);
    }
    // Create and store the new instance.
    return ConstructorReference[singletonInstanceKey] = new ConstructorReference();
  };
};

/**
 * @type {Array<function(new:*, ...*)>}
 * An internal array to keep track of singleton constructors that have been instantiated.
 * Primarily used for debugging and diagnostics in development environments.
 * @private
 */
appCore.trackingSingletons_ = [];

// Extensive conditional block for dynamic script loading and dependency management,
// active only when not in an optimized build and dynamic loading is enabled.
if (!_APPLICATION_IS_OPTIMIZED_ && appCore.allowDynamicScriptLoading) {
  /**
   * @type {Object<string, boolean>}
   * A map to keep track of script files that have been explicitly included
   * through the dynamic loader.
   * @private
   */
  appCore.currentlyLoadedScripts_ = {};

  /**
   * Checks if the current execution environment is a web browser with HTML document capabilities.
   * Specifically looks for the `document` object and its `write` method.
   * @returns {boolean} True if running in a browser that can write to the document.
   * @private
   */
  appCore.isBrowserDocumentAvailable_ = function() {
    const documentRef = appCore.globalExecutionContext.document;
    return typeof documentRef === "object" && documentRef !== null && typeof documentRef.write === "function";
  };

  /**
   * Detects and sets the base URL for application scripts.
   * It prioritizes a global `APPLICATION_BASE_URL` variable, then attempts to infer it
   * from the `src` attribute of script tags in the HTML document.
   * @private
   */
  appCore.determineApplicationBaseUrl_ = function() {
    if (appCore.globalExecutionContext.APPLICATION_BASE_URL) {
      appCore.applicationBaseUrl = appCore.globalExecutionContext.APPLICATION_BASE_URL;
      return; // Explicitly set base URL takes precedence.
    }

    if (appCore.isBrowserDocumentAvailable_()) {
      const scriptTags = appCore.globalExecutionContext.document.getElementsByTagName("script");
      // Iterate backwards to find the script that loaded this core library (e.g., base.js).
      for (let i = scriptTags.length - 1; i >= 0; --i) {
        const scriptSource = scriptTags[i].src;
        // Strip query parameters from the script source URL.
        const queryParamIndex = scriptSource.lastIndexOf("?");
        const cleanSourcePath = queryParamIndex === -1 ? scriptSource : scriptSource.substring(0, queryParamIndex);

        // Look for a common base script name (e.g., "base.js" or "boot.js").
        const baseScriptMarker = "base.js";
        if (cleanSourcePath.endsWith(baseScriptMarker)) {
          appCore.applicationBaseUrl = cleanSourcePath.substring(0, cleanSourcePath.length - baseScriptMarker.length);
          break;
        }
      }
    }
  };

  /**
   * Dynamically loads a JavaScript file by injecting a script tag into the document.
   * It uses a custom script injection function if `CLOSURE_IMPORT_SCRIPT` is defined globally.
   * @param {string} scriptFullUrl - The complete URL of the script file to load.
   * @returns {boolean} True if the script was successfully queued for injection.
   * @private
   */
  appCore.injectScriptFile_ = function(scriptFullUrl) {
    const customScriptHook = appCore.globalExecutionContext.CLOSURE_IMPORT_SCRIPT;
    // Only proceed if the script hasn't been loaded already and the injection mechanism allows it.
    if (!appCore.dependencyManager.loadedAndProcessedScripts[scriptFullUrl] &&
        (customScriptHook ? customScriptHook(scriptFullUrl) : appCore.insertScriptTagIntoDocument_(scriptFullUrl))) {
      appCore.dependencyManager.loadedAndProcessedScripts[scriptFullUrl] = true;
      return true;
    }
    return false;
  };

  /**
   * Inserts a `<script>` HTML tag into the current document for synchronous loading.
   * This method is primarily for use during the initial document parsing phase.
   * @param {string} scriptSourceUrl - The `src` attribute for the script tag.
   * @returns {boolean} True if the script tag was successfully written.
   * @throws {Error} If attempting to write scripts after the document has fully loaded.
   * @private
   */
  appCore.insertScriptTagIntoDocument_ = function(scriptSourceUrl) {
    if (!appCore.isBrowserDocumentAvailable_()) {
      console.warn(`Cannot inject script tag for "${scriptSourceUrl}": Not in a browser environment.`);
      return false;
    }

    const currentDocument = appCore.globalExecutionContext.document;
    if (currentDocument.readyState === "complete" || currentDocument.readyState === "interactive") {
      // Prevent writing scripts after document is fully loaded, unless it's the `deps.js` file (which is often loaded late).
      if (!scriptSourceUrl.endsWith("deps.js")) {
        throw new Error(`Cannot dynamically load "${scriptSourceUrl}" after the document has finished loading.`);
      }
      return false; // Do not write deps.js if document is complete, it's likely too late.
    }

    // Use `document.write` for synchronous loading during the initial HTML parse.
    currentDocument.write(`<script type="text/javascript" src="${scriptSourceUrl}"></script>`);
    return true;
  };

  /**
   * Processes the queue of scripts that need to be loaded due to module `importModule` calls.
   * This involves resolving dependencies and loading scripts in the correct order.
   * @private
   */
  appCore.processPendingScripts_ = function() {
    /**
     * Recursive helper function to traverse the dependency graph and build a loading order.
     * @param {string} currentScriptPath - The script path to analyze.
     * @param {Object} scriptsToLoadQueue - A temporary object to collect scripts in order.
     * @param {Object} visitedPaths - Tracks paths visited in the current recursion to detect cycles.
     */
    const resolveAndQueueScript = (currentScriptPath, scriptsToLoadQueue, visitedPaths) => {
      // If this script has already been processed or is currently in the recursion stack, skip.
      if (appCore.dependencyManager.loadedAndProcessedScripts[currentScriptPath] || visitedPaths[currentScriptPath]) {
        return;
      }

      visitedPaths[currentScriptPath] = true; // Mark as currently visiting.

      const requiredModulesByThisScript = appCore.dependencyManager.scriptToRequiredModules[currentScriptPath];
      if (requiredModulesByThisScript) {
        for (const requiredModuleName in requiredModulesByThisScript) {
          // If a required module is not yet registered (i.e., its script not loaded).
          if (!appCore.isModulePathRegistered_(requiredModuleName)) {
            const dependencyScriptPath = appCore.dependencyManager.moduleToScriptMap[requiredModuleName];
            if (dependencyScriptPath) {
              resolveAndQueueScript(dependencyScriptPath, scriptsToLoadQueue, visitedPaths);
            } else {
              // This indicates a missing dependency declaration.
              const missingDepError = `Undefined script path for required module: "${requiredModuleName}" needed by "${currentScriptPath}".`;
              if (appCore.globalExecutionContext.console) {
                appCore.globalExecutionContext.console.error(missingDepError);
              }
              throw new Error(missingDepError);
            }
          }
        }
      }
      // Add the current script to the queue after all its dependencies are processed.
      if (!scriptsToLoadQueue[currentScriptPath]) {
        scriptsToLoadQueue[currentScriptPath] = true;
      }
      delete visitedPaths[currentScriptPath]; // Unmark after processing.
    };

    const finalLoadOrder = [];
    const temporaryScriptQueue = {}; // Uses object for efficient `in` checks.
    const temporaryVisitedSet = {}; // To prevent infinite loops in cyclic dependencies.

    // Start processing from the scripts that were initially requested.
    for (const pendingScriptPath in appCore.dependencyManager.scriptsPendingLoad) {
      if (!appCore.dependencyManager.loadedAndProcessedScripts[pendingScriptPath]) {
        resolveAndQueueScript(pendingScriptPath, temporaryScriptQueue, temporaryVisitedSet);
      }
    }

    // Convert the temporary queue (object) into an ordered array.
    for (const pathKey in temporaryScriptQueue) {
      if (Object.prototype.hasOwnProperty.call(temporaryScriptQueue, pathKey)) {
        finalLoadOrder.push(pathKey);
      }
    }

    // Execute the script loading in the determined order.
    for (let i = 0; i < finalLoadOrder.length; i++) {
      const scriptToInject = finalLoadOrder[i];
      if (scriptToInject) {
        appCore.injectScriptFile_(appCore.applicationBaseUrl + scriptToInject);
      } else {
        console.error("Encountered an empty script path in the dynamic loading queue.");
        throw new Error("Invalid script path encountered during dynamic loading.");
      }
    }
    // Clear the pending queue after all scripts have been processed.
    appCore.dependencyManager.scriptsPendingLoad = {};
  };

  /**
   * Retrieves the relative script path for a given module name from the dependency manager.
   * @param {string} moduleName - The name of the module (e.g., "my.namespace.Module").
   * @returns {string|null} The relative path to the script file, or `null` if not found.
   * @private
   */
  appCore.resolveScriptPathForModule_ = function(moduleName) {
    return appCore.dependencyManager.moduleToScriptMap[moduleName] || null;
  };

  // Perform initial detection of the application's base URL.
  appCore.determineApplicationBaseUrl_();

  // Attempt to load the `deps.js` file if not instructed to skip dependency loading.
  if (!appCore.globalExecutionContext.SKIP_DEP_LOADING) {
    const dependencyManifestPath = appCore.applicationBaseUrl + "deps.js";
    if (!appCore.injectScriptFile_(dependencyManifestPath)) {
      console.warn(`Could not load dependency manifest from "${dependencyManifestPath}". Dynamic module loading may be incomplete.`);
    }
  }
}

/**
 * Determines the precise type of a given JavaScript value.
 * Provides more specific types than `typeof` (e.g., "array" instead of "object").
 * @param {*} inputValue - The value to inspect.
 * @returns {string} A lowercase string representing the type (e.g., "string", "number", "array", "function", "null").
 */
appCore.getAccurateType = function(inputValue) {
  // Handle null as a special case, as `typeof null` returns "object".
  if (inputValue === null) {
    return "null";
  }

  const primitiveType = typeof inputValue;
  // For most primitives, `typeof` is sufficient.
  if (primitiveType !== "object") {
    // Edge case: In some older JS engines, `typeof` a host object or certain built-ins might be 'function'
    // but without a `call` method. This is usually an object.
    if (primitiveType === 'function' && typeof inputValue.call === 'undefined') {
        return 'object';
    }
    return primitiveType;
  }

  // For complex types, use `Object.prototype.toString` for reliable identification.
  const objectStringRepresentation = Object.prototype.toString.call(inputValue);

  switch (objectStringRepresentation) {
    case "[object Array]":
      return "array";
    case "[object Function]":
      return "function";
    case "[object Date]":
      return "date";
    case "[object RegExp]":
      return "regexp";
    case "[object Arguments]":
      return "arguments";
    case "[object Error]":
      return "error";
    case "[object Window]": // Specific browser environment check.
      return "object";
    default:
      return "object"; // Default for all other non-primitive objects.
  }
};

/**
 * Checks if a value is explicitly defined (i.e., not `undefined`).
 * @param {*} valueToCheck - The value to evaluate.
 * @returns {boolean} `true` if the value is not `undefined`, `false` otherwise.
 */
appCore.isDefined = function(valueToCheck) {
  return valueToCheck !== undefined;
};

/**
 * Checks if a value is strictly `null`.
 * @param {*} valueToCheck - The value to evaluate.
 * @returns {boolean} `true` if the value is `null`, `false` otherwise.
 */
appCore.isStrictlyNull = function(valueToCheck) {
  return valueToCheck === null;
};

/**
 * Checks if a value is both defined (not `undefined`) and not `null`.
 * This is a common check for existence of a meaningful value.
 * @param {*} valueToCheck - The value to evaluate.
 * @returns {boolean} `true` if the value is neither `undefined` nor `null`.
 */
appCore.existsAndIsNotNull = function(valueToCheck) {
  return valueToCheck !== undefined && valueToCheck !== null;
};

/**
 * Determines if a given value is an Array.
 * @param {*} candidateValue - The value to check.
 * @returns {boolean} `true` if the value is an Array, `false` otherwise.
 */
appCore.isArrayType = function(candidateValue) {
  return appCore.getAccurateType(candidateValue) === "array";
};

/**
 * Checks if a value is "array-like", meaning it has a numeric `length` property.
 * This includes actual arrays, strings, DOM collections, and `arguments` objects.
 * @param {*} candidateValue - The value to check.
 * @returns {boolean} `true` if the value is array-like.
 */
appCore.isArrayLikeType = function(candidateValue) {
  const typeIdentifier = appCore.getAccurateType(candidateValue);
  return typeIdentifier === "array" || (typeIdentifier === "object" && typeof candidateValue.length === "number");
};

/**
 * Determines if a value is a Date object or has Date-like properties (e.g., `getFullYear`).
 * @param {*} candidateValue - The value to check.
 * @returns {boolean} `true` if the value is a Date-like object.
 */
appCore.isDateLikeObject = function(candidateValue) {
  return appCore.isObjectType(candidateValue) && typeof candidateValue.getFullYear === "function";
};

/**
 * Checks if a value is a string primitive.
 * @param {*} candidateValue - The value to check.
 * @returns {boolean} `true` if the value is a string.
 */
appCore.isStringType = function(candidateValue) {
  return typeof candidateValue === "string";
};

/**
 * Checks if a value is a boolean primitive.
 * @param {*} candidateValue - The value to check.
 * @returns {boolean} `true` if the value is a boolean.
 */
appCore.isBooleanType = function(candidateValue) {
  return typeof candidateValue === "boolean";
};

/**
 * Checks if a value is a number primitive.
 * @param {*} candidateValue - The value to check.
 * @returns {boolean} `true` if the value is a number.
 */
appCore.isNumberType = function(candidateValue) {
  return typeof candidateValue === "number";
};

/**
 * Checks if a value is a function.
 * @param {*} candidateValue - The value to check.
 * @returns {boolean} `true` if the value is a function.
 */
appCore.isFunctionType = function(candidateValue) {
  return appCore.getAccurateType(candidateValue) === "function";
};

/**
 * Checks if a value is an object (non-null, and not a primitive type).
 * Functions are also considered objects in JavaScript.
 * @param {*} candidateValue - The value to check.
 * @returns {boolean} `true` if the value is an object or a function.
 */
appCore.isObjectType = function(candidateValue) {
  const typeId = typeof candidateValue;
  return (typeId === "object" && candidateValue !== null) || (typeId === "function");
};

// --- Unique Identifier Generation Facilities ---
/**
 * A unique string key used to store unique IDs directly on objects.
 * This key is randomized to reduce collision probability.
 * @private
 */
appCore.UNIQUE_ID_PROPERTY_KEY_ = `_appcore_uid_prop_${Math.floor(Math.random() * 1e9)}`;

/**
 * A counter for generating monotonically increasing unique IDs.
 * @private
 */
appCore.uniqueIdCounter_ = 0;

/**
 * Assigns and retrieves a unique, numerical ID for a given JavaScript object.
 * The ID is stored as a non-enumerable property on the object itself.
 * @param {Object} targetObj - The object for which to obtain a unique ID.
 * @returns {number} The unique ID assigned to the object.
 * @throws {Error} If `targetObj` is `null` or `undefined`.
 */
appCore.getUniqueObjectIdentifier = function(targetObj) {
  if (!appCore.existsAndIsNotNull(targetObj)) {
    throw new Error("Cannot generate unique ID for null or undefined object.");
  }
  // If the object already possesses an ID, return it.
  if (targetObj[appCore.UNIQUE_ID_PROPERTY_KEY_]) {
    return targetObj[appCore.UNIQUE_ID_PROPERTY_KEY_];
  }
  // Otherwise, increment the counter and assign a new ID.
  appCore.uniqueIdCounter_ = appCore.uniqueIdCounter_ + 1;
  return targetObj[appCore.UNIQUE_ID_PROPERTY_KEY_] = appCore.uniqueIdCounter_;
};

/**
 * Removes the unique ID property from an object.
 * This is useful for memory management or when an object's identity is no longer needed.
 * @param {Object} targetObj - The object from which to remove the unique ID.
 */
appCore.removeUniqueObjectIdentifier = function(targetObj) {
  if (!appCore.existsAndIsNotNull(targetObj)) {
    return; // Nothing to remove.
  }
  try {
    delete targetObj[appCore.UNIQUE_ID_PROPERTY_KEY_];
  } catch (e) {
    // Log a warning if deletion fails (e.g., in strict mode for non-configurable properties).
    console.warn(`Failed to delete unique ID property from object: ${e.message}`);
  }
  // For DOM elements, also attempt to remove the attribute.
  if (typeof targetObj.removeAttribute === 'function') {
    targetObj.removeAttribute(appCore.UNIQUE_ID_PROPERTY_KEY_);
  }
};

/**
 * Alias for `appCore.getUniqueObjectIdentifier`. Provides an alternative name for hashing.
 * @function
 * @param {Object} obj - The object.
 * @returns {number} The unique ID.
 */
appCore.getObjectHash = appCore.getUniqueObjectIdentifier;

/**
 * Alias for `appCore.removeUniqueObjectIdentifier`. Provides an alternative name for hash removal.
 * @function
 * @param {Object} obj - The object.
 */
appCore.removeObjectHash = appCore.removeUniqueObjectIdentifier;

/**
 * Creates a deep copy of an object or array.
 * Primitive values are returned directly. If an object has a `clone()` method, it will be used.
 * Otherwise, objects and arrays are recursively traversed and copied.
 * @param {*} sourceItem - The item (primitive, object, or array) to clone.
 * @returns {*} A new, independent copy of the source item.
 */
appCore.createDeepClone = function(sourceItem) {
  const itemCurrentType = appCore.getAccurateType(sourceItem);

  // Primitives, null, and undefined are returned as-is.
  if (itemCurrentType !== "object" && itemCurrentType !== "array") {
    return sourceItem;
  }

  // If the object defines its own `clone` method, delegate to it.
  if (typeof sourceItem.clone === "function") {
    return sourceItem.clone();
  }

  // Initialize the cloned structure based on the source item's type.
  const clonedStructure = (itemCurrentType === "array") ? [] : {};

  // Recursively clone properties for objects and elements for arrays.
  for (const key in sourceItem) {
    if (Object.prototype.hasOwnProperty.call(sourceItem, key)) {
      clonedStructure[key] = appCore.createDeepClone(sourceItem[key]);
    }
  }
  return clonedStructure;
};

// --- Function Binding and Partial Application Utilities ---

/**
 * Internal helper for binding a function to a specific context using the native `Function.prototype.bind` method.
 * @param {function(...*): *} funcToBind - The function to be bound.
 * @param {*} thisContext - The `this` value to be set for the function.
 * @param {...*} leadingArgs - Any arguments to be prepended to the bound function's call.
 * @returns {function(...*): *} The new bound function.
 * @private
 */
appCore.bindWithNativeMethod_ = function(funcToBind, thisContext, ...leadingArgs) {
  // `Function.prototype.bind.apply` allows passing `thisContext` as the first argument
  // and `leadingArgs` as subsequent arguments to `bind`.
  return funcToBind.bind.apply(funcToBind, [thisContext, ...leadingArgs]);
};

/**
 * Internal helper for binding a function using a JavaScript polyfill implementation.
 * This is used when native `Function.prototype.bind` is unavailable or unreliable.
 * @param {function(...*): *} funcToBind - The function to be bound.
 * @param {*} thisContext - The `this` value to be set for the function.
 * @param {...*} leadingArgs - Any arguments to be prepended.
 * @returns {function(...*): *} The new bound function.
 * @private
 */
appCore.bindWithPolyfill_ = function(funcToBind, thisContext, ...leadingArgs) {
  if (typeof funcToBind !== 'function') {
    throw new Error("Cannot bind a non-function value. Provided input is not a function.");
  }
  // Convert arguments to a real array for easier manipulation.
  const fixedArguments = Array.from(leadingArgs);

  return function(...runtimeArgs) {
    // Combine the fixed arguments with arguments provided at call time.
    const combinedArguments = [...fixedArguments, ...runtimeArgs];
    return funcToBind.apply(thisContext, combinedArguments);
  };
};

/**
 * Creates a new function that has a permanently bound `this` context and optionally,
 * a set of leading arguments. It intelligently selects between native `Function.prototype.bind`
 * and a polyfill implementation based on feature detection.
 * @param {function(...*): *} originalFunction - The function to bind.
 * @param {*} contextObject - The object that will be `this` when `originalFunction` is called.
 * @param {...*} additionalArgs - Optional arguments to prepend to the function's arguments.
 * @returns {function(...*): *} A new function with the specified context and prepended arguments.
 */
appCore.createBoundFunction = function(originalFunction, contextObject, ...additionalArgs) {
  // Feature detection for native `bind` is performed once and the function is re-assigned.
  // Check for `Function.prototype.bind` existence and if its `toString()` suggests native implementation.
  if (Function.prototype.bind && Function.prototype.bind.toString().includes("[native code]")) {
    appCore.createBoundFunction = appCore.bindWithNativeMethod_;
  } else {
    appCore.createBoundFunction = appCore.bindWithPolyfill_;
  }
  // Call the newly assigned implementation.
  return appCore.createBoundFunction(originalFunction, contextObject, ...additionalArgs);
};

/**
 * Creates a new function by partially applying initial arguments to an existing function.
 * The `this` context of the returned function is determined by its call site.
 * @param {function(...*): *} funcToPartiallyApply - The original function.
 * @param {...*} initialParameters - Arguments to prepend to the function's argument list.
 * @returns {function(...*): *} A new function that, when called, will invoke `funcToPartiallyApply`
 *   with `initialParameters` followed by any arguments passed to the new function.
 */
appCore.createPartialApplication = function(funcToPartiallyApply, ...initialParameters) {
  if (typeof funcToPartiallyApply !== 'function') {
    throw new Error("Cannot create a partial application for a non-function value.");
  }
  const fixedArguments = Array.from(initialParameters);

  return function(...runtimeParameters) {
    // Combine the fixed arguments with those passed at call time.
    const allArguments = [...fixedArguments, ...runtimeParameters];
    // Preserve the `this` context from the call site of the partial function.
    return funcToPartiallyApply.apply(this, allArguments);
  };
};

/**
 * Merges all own enumerable properties from a source object into a target object.
 * This performs a shallow copy, overwriting existing properties in the target if names conflict.
 * @param {Object} targetObject - The object that will receive the properties.
 * @param {Object} sourceObject - The object from which properties will be copied.
 * @throws {Error} If either `targetObject` or `sourceObject` are not valid non-null objects.
 */
appCore.mergeObjectProperties = function(targetObject, sourceObject) {
  if (typeof targetObject !== 'object' || targetObject === null) {
    throw new Error("Target object must be a non-null object for property merging.");
  }
  if (typeof sourceObject !== 'object' || sourceObject === null) {
    throw new Error("Source object must be a non-null object for property merging.");
  }

  for (const propertyName in sourceObject) {
    // Only copy own properties, not those inherited from the prototype chain.
    if (Object.prototype.hasOwnProperty.call(sourceObject, propertyName)) {
      targetObject[propertyName] = sourceObject[propertyName];
    }
  }
};

/**
 * Retrieves the current timestamp in milliseconds since the Unix epoch.
 * It prefers `Date.now()` for performance and security in trusted environments,
 * falling back to `new Date().getTime()` otherwise.
 * @returns {number} The current time in milliseconds.
 */
appCore.getCurrentUnixTimestamp = function() {
  if (appCore.isSecureContext && typeof Date.now === 'function') {
    return Date.now();
  } else {
    // Fallback for older environments or non-trusted contexts.
    return (new Date()).getTime();
  }
};

/**
 * Executes a given JavaScript code string within the global scope of the application.
 * It attempts various methods: `execScript` (for IE), `eval` (with a global scope check),
 * or dynamic script tag injection (for broad browser compatibility).
 * @param {string} jsCodeString - The JavaScript code to execute.
 * @throws {Error} If no suitable method for global script execution is found or available.
 */
appCore.executeScriptGlobally = function(jsCodeString) {
  if (typeof jsCodeString !== 'string' || jsCodeString.trim().length === 0) {
    console.warn("Attempted to execute an empty or invalid script string globally.");
    return;
  }

  const globalScope = appCore.globalExecutionContext;

  // Method 1: Internet Explorer's `execScript` (legacy).
  if (globalScope.execScript) {
    globalScope.execScript(jsCodeString, "JavaScript");
    return;
  }

  // Method 2: `eval`, with a check to ensure it operates in the global scope.
  if (globalScope.eval) {
    // Perform a one-time test to determine if `eval` creates global variables directly.
    if (appCore.evalAffectsGlobalScope_ === null) {
      try {
        const testVar = "_appCore_eval_test_marker_";
        globalScope.eval(`var ${testVar} = 1;`);
        appCore.evalAffectsGlobalScope_ = (typeof globalScope[testVar] !== 'undefined');
        if (appCore.evalAffectsGlobalScope_) {
          delete globalScope[testVar]; // Clean up the test variable.
        }
      } catch (e) {
        console.warn("Global eval scope test failed:", e.message);
        appCore.evalAffectsGlobalScope_ = false;
      }
    }

    if (appCore.evalAffectsGlobalScope_) {
      globalScope.eval(jsCodeString);
      return;
    } else {
      // Method 3: Fallback to dynamic script tag injection if `eval` doesn't affect globals.
      // This ensures global scope but is less efficient.
      const documentRef = globalScope.document;
      if (documentRef && typeof documentRef.createElement === 'function') {
        const scriptElement = documentRef.createElement("script");
        scriptElement.type = "text/javascript";
        scriptElement.defer = false; // Ensure immediate execution.
        try {
          scriptElement.appendChild(documentRef.createTextNode(jsCodeString));
          documentRef.body.appendChild(scriptElement); // Append to body for execution.
          documentRef.body.removeChild(scriptElement); // Remove immediately after execution.
          return;
        } catch (e) {
          console.error("Failed to inject script tag for global execution:", e.message);
        }
      }
    }
  }

  // If all attempts to execute the script globally fail.
  throw new Error("appCore.executeScriptGlobally: No suitable mechanism available for global script execution.");
};

/**
 * @type {boolean|null}
 * Stores the result of a one-time check to determine if `eval()` directly creates global variables.
 * `null` indicates the check has not yet been performed.
 * @private
 */
appCore.evalAffectsGlobalScope_ = null;

// --- CSS Class Name Mapping and Generation ---

/**
 * @type {Object<string, string>|null}
 * Internal map for CSS class name renaming, typically populated by a build tool.
 * @private
 */
appCore.cssClassMap_ = null;

/**
 * @type {string|null}
 * Specifies the strategy for CSS class name mapping ("WHOLE_NAME" or "SPLIT_PARTS").
 * @private
 */
appCore.cssMappingStrategy_ = null;

/**
 * Generates a CSS class name, applying configured renaming rules if available.
 * This allows for CSS class obfuscation in production builds.
 * @param {string} baseClassName - The base name of the CSS class (e.g., "my-component").
 * @param {string=} optionalModifier - An optional modifier to append (e.g., "active" for "my-component--active").
 * @returns {string} The potentially mapped and combined CSS class name.
 */
appCore.getMappedCssClassName = function(baseClassName, optionalModifier) {
  /**
   * Helper to map a single CSS name part.
   * @param {string} part - A segment of a CSS class name.
   * @returns {string} The mapped part or the original if no mapping exists.
   */
  const mapSingleCssPart = (part) => appCore.cssClassMap_[part] || part;

  /**
   * Helper to map a full CSS class name by splitting it into parts and mapping each.
   * @param {string} fullCssName - The complete CSS class name.
   * @returns {string} The re-joined mapped name.
   */
  const mapBySplittingParts = (fullCssName) => {
    const parts = fullCssName.split("-");
    const mappedParts = parts.map(mapSingleCssPart);
    return mappedParts.join("-");
  };

  // Determine the effective mapping function based on configuration.
  let currentMapper = (name) => name; // Default: no mapping.
  if (appCore.cssClassMap_) {
    if (appCore.cssMappingStrategy_ === "WHOLE_NAME") {
      currentMapper = mapSingleCssPart;
    } else { // Assumes "SPLIT_PARTS" or any other value.
      currentMapper = mapBySplittingParts;
    }
  }

  // Apply mapping to the base name.
  const mappedBase = currentMapper(baseClassName);
  // If a modifier is provided, map it and append.
  return optionalModifier ? `${mappedBase}-${currentMapper(optionalModifier)}` : mappedBase;
};

/**
 * Configures the CSS class name mapping and its application strategy.
 * This function is typically called during the application's initialization phase,
 * often with data generated by a CSS renaming tool.
 * @param {Object<string, string>} nameMapping - An object where keys are original CSS names/parts and values are their mapped equivalents.
 * @param {string} mappingStrategy - The strategy to apply the mapping ("WHOLE_NAME" or "SPLIT_PARTS").
 */
appCore.setCssNameMappingConfiguration = function(nameMapping, mappingStrategy) {
  appCore.cssClassMap_ = nameMapping;
  appCore.cssMappingStrategy_ = mappingStrategy;
};

// Initialize CSS class name mapping if a global override is present (e.g., from a build system).
if (!_APPLICATION_IS_OPTIMIZED_ && appCore.globalExecutionContext.CUSTOM_CSS_CLASS_MAP) {
  appCore.cssClassMap_ = appCore.globalExecutionContext.CUSTOM_CSS_CLASS_MAP;
}

// --- Internationalization and Message Formatting ---

/**
 * Formats a template string by replacing placeholders with values from a provided object.
 * Placeholders are identified by `{$KEY}`.
 * @param {string} messageTemplate - The string containing placeholders (e.g., "Hello, {$NAME}!").
 * @param {Object<string, *>=} substitutionValues - An object where keys match placeholders and values are replacements.
 * @returns {string} The formatted string with all placeholders replaced.
 */
appCore.formatTemplatedMessage = function(messageTemplate, substitutionValues) {
  if (typeof messageTemplate !== 'string') {
    console.warn("Message template must be a string for formatting.");
    return String(messageTemplate); // Coerce to string for robustness.
  }

  let finalMessage = messageTemplate;
  const replacements = substitutionValues || {};

  for (const keyToReplace in replacements) {
    if (Object.prototype.hasOwnProperty.call(replacements, keyToReplace)) {
      const replacementString = String(replacements[keyToReplace]).replace(/\$/g, "$$$$"); // Escape '$' in replacement.
      const placeholderRegex = new RegExp(`\\{\\$${keyToReplace}\\}`, "gi");
      finalMessage = finalMessage.replace(placeholderRegex, replacementString);
    }
  }
  return finalMessage;
};

/**
 * A pass-through function for message retrieval, which can be extended
 * in a full internationalization system to provide fallback messages or dynamic loading.
 * @param {string} primaryText - The primary message text.
 * @param {string=} secondaryText - An optional fallback message (currently unused in this basic implementation).
 * @returns {string} The `primaryText` value.
 */
appCore.getLocalizedMessage = function(primaryText, secondaryText) {
  // In a more sophisticated i18n system, `secondaryText` might be used as a fallback
  // if `primaryText` isn't available in the current locale.
  return primaryText;
};

// --- Namespace and Property Exporting ---

/**
 * Publishes a symbol (e.g., a variable, function, or object) to a specific path
 * within the application's global namespace structure.
 * This is an alias for `appCore.ensureObjectPathExists(symbolPath, symbolValue, targetContext)`.
 * @param {string} symbolPath - The dot-separated path where the symbol should be made available.
 * @param {*} symbolValue - The actual value (symbol) to publish.
 * @param {Object=} targetContext - The base object where the path should be created (defaults to global).
 */
appCore.publishGlobalSymbol = function(symbolPath, symbolValue, targetContext) {
  appCore.ensureObjectPathExists(symbolPath, symbolValue, targetContext);
};

/**
 * Directly attaches a property with a given value to a specified target object.
 * This is a straightforward property assignment utility.
 * @param {Object} targetObject - The object to which the property will be attached.
 * @param {string} propertyName - The name of the property to set.
 * @param {*} propertyValue - The value to assign to the property.
 * @throws {Error} If `targetObject` is not a valid non-null object.
 */
appCore.attachObjectProperty = function(targetObject, propertyName, propertyValue) {
  if (typeof targetObject !== 'object' || targetObject === null) {
    throw new Error("Cannot attach property to a non-object target.");
  }
  targetObject[propertyName] = propertyValue;
};

// --- Class-Based Inheritance Utility ---

/**
 * Establishes a classical inheritance relationship between a child constructor and a parent constructor.
 * The `ChildClass` will inherit methods and properties from `ParentClass.prototype`.
 * A `basePrototype_` property is also added to `ChildClass` for easy access to the parent's prototype.
 * @param {function(new:Child,...*)} ChildClassConstructor - The constructor function for the child class.
 * @param {function(new:Parent,...*)} ParentClassConstructor - The constructor function for the parent class.
 * @template Child, Parent
 * @throws {Error} If either argument is not a valid constructor function.
 */
appCore.setupClassInheritance = function(ChildClassConstructor, ParentClassConstructor) {
  if (typeof ChildClassConstructor !== 'function' || typeof ParentClassConstructor !== 'function') {
    throw new Error("Both ChildClassConstructor and ParentClassConstructor must be functions.");
  }

  // Create a temporary constructor to serve as an intermediary for the prototype chain.
  // This avoids calling the `ParentClassConstructor` directly when setting up inheritance.
  const PrototypeChainBridge = function() {};
  PrototypeChainBridge.prototype = ParentClassConstructor.prototype;

  // Link the child's prototype to an instance of the bridge, effectively inheriting from the parent.
  ChildClassConstructor.prototype = new PrototypeChainBridge();

  // Store a direct reference to the parent's prototype on the child constructor.
  // This is useful for calling "super" methods.
  ChildClassConstructor.basePrototype_ = ParentClassConstructor.prototype;

  // Ensure the `constructor` property on the child's prototype points back to the `ChildClassConstructor`.
  ChildClassConstructor.prototype.constructor = ChildClassConstructor;
};

/**
 * Invokes a method from the parent class's prototype, simulating a "super" call.
 * This function relies on `arguments.callee.caller`, which is deprecated and
 * may not work in strict mode or optimized JavaScript engines. Modern `super` keyword
 * is the preferred approach where supported by the language or transpilation.
 * @param {Object} instanceReference - The `this` context of the current instance.
 * @param {string} methodKey - The name of the method to invoke on the parent.
 * @param {...*} methodCallArgs - Arguments to pass to the parent method.
 * @returns {*} The return value of the invoked parent method.
 * @throws {Error} If the parent method cannot be resolved or accessed.
 */
appCore.callParentMethod = function(instanceReference, methodKey, ...methodCallArgs) {
  // Warning: `arguments.callee.caller` is deprecated and will not work in strict mode.
  // This implementation is for compatibility with older Closure Compiler code patterns.
  const callingFunction = arguments.callee.caller;

  if (!callingFunction) {
    throw new Error("appCore.callParentMethod: Unable to determine calling function. " +
                    "This utility may not work in strict mode or optimized code. Consider using `super`.");
  }

  // First, check if the calling function's constructor has a `basePrototype_` reference.
  // This is the most direct way to find the parent's prototype.
  if (callingFunction.basePrototype_) {
    // Special handling for the constructor itself.
    if (methodKey === 'constructor') {
      return callingFunction.basePrototype_.constructor.apply(instanceReference, methodCallArgs);
    }
    const parentMethod = callingFunction.basePrototype_[methodKey];
    if (typeof parentMethod === 'function') {
      return parentMethod.apply(instanceReference, methodCallArgs);
    }
  }

  // Fallback: Traverse the prototype chain if `basePrototype_` was not directly available
  // or the method wasn't found there (e.g., if it's further up the chain).
  let currentConstructor = instanceReference.constructor;
  let callerFoundInChain = false;

  while (currentConstructor) {
    // Check if the method on the current prototype level matches the calling function.
    if (currentConstructor.prototype[methodKey] === callingFunction) {
      callerFoundInChain = true;
    } else if (callerFoundInChain && currentConstructor.basePrototype_ && typeof currentConstructor.basePrototype_[methodKey] === 'function') {
      // If the caller was just found and we're now at the next parent level, invoke its method.
      return currentConstructor.basePrototype_[methodKey].apply(instanceReference, methodCallArgs);
    }
    // Move up to the parent constructor's prototype.
    currentConstructor = currentConstructor.basePrototype_ && currentConstructor.basePrototype_.constructor;
  }

  // If no parent method was found after exhaustive search.
  if (instanceReference[methodKey] === callingFunction) {
    // If the method on the instance is the same as the caller, it implies the call was to itself,
    // and we need to look one level up on its own prototype.
    if (typeof instanceReference.constructor.prototype[methodKey] === 'function') {
      return instanceReference.constructor.prototype[methodKey].apply(instanceReference, methodCallArgs);
    }
  }

  throw new Error(`appCore.callParentMethod: Failed to resolve parent method for key "${methodKey}". ` +
                  "Verify inheritance structure and method existence.");
};

/**
 * Executes a provided function with `appCore.globalExecutionContext` set as its `this` context.
 * This is useful for creating a local scope within the global context, mimicking a "closure scope".
 * @param {function(): *} functionToExecute - The function to be executed.
 * @throws {Error} If `functionToExecute` is not a function.
 */
appCore.executeFunctionInGlobalScope = function(functionToExecute) {
  if (typeof functionToExecute !== 'function') {
    throw new Error("Input must be a function to execute in global scope.");
  }
  functionToExecute.call(appCore.globalExecutionContext);
};

// --- Advanced Text Processing Utilities ---
appCore.stringManipulation = {};

/**
 * @const {string}
 * The Unicode non-breaking space character.
 */
appCore.stringManipulation.NON_BREAKING_SPACE = "\u00a0";

/**
 * Checks if a `mainString` begins with a specified `prefixString`.
 * @param {string} mainString - The string to examine.
 * @param {string} prefixString - The prefix to search for.
 * @returns {boolean} `true` if `mainString` starts with `prefixString`.
 */
appCore.stringManipulation.beginsWith = function(mainString, prefixString) {
  if (typeof mainString !== 'string' || typeof prefixString !== 'string') return false;
  return mainString.startsWith(prefixString); // Utilizes native `String.prototype.startsWith`.
};

/**
 * Checks if a `mainString` ends with a specified `suffixString`.
 * @param {string} mainString - The string to examine.
 * @param {string} suffixString - The suffix to search for.
 * @returns {boolean} `true` if `mainString` ends with `suffixString`.
 */
appCore.stringManipulation.endsWith = function(mainString, suffixString) {
  if (typeof mainString !== 'string' || typeof suffixString !== 'string') return false;
  return mainString.endsWith(suffixString); // Utilizes native `String.prototype.endsWith`.
};

/**
 * Performs a case-insensitive check to see if `mainString` starts with `prefixString`.
 * @param {string} mainString - The string to check.
 * @param {string} prefixString - The prefix to compare against.
 * @returns {boolean} `true` if `mainString` starts with `prefixString` ignoring case.
 */
appCore.stringManipulation.beginsWithIgnoreCase = function(mainString, prefixString) {
  if (typeof mainString !== 'string' || typeof prefixString !== 'string') return false;
  // Compare the lowercase prefix with the lowercase beginning of the main string.
  return appCore.stringManipulation.compareStringsIgnoreCase(prefixString, mainString.substring(0, prefixString.length)) === 0;
};

/**
 * Performs a case-insensitive check to see if `mainString` ends with `suffixString`.
 * @param {string} mainString - The string to check.
 * @param {string} suffixString - The suffix to compare against.
 * @returns {boolean} `true` if `mainString` ends with `suffixString` ignoring case.
 */
appCore.stringManipulation.endsWithIgnoreCase = function(mainString, suffixString) {
  if (typeof mainString !== 'string' || typeof suffixString !== 'string') return false;
  const startPosition = mainString.length - suffixString.length;
  if (startPosition < 0) return false; // Suffix cannot be longer than the main string.
  // Compare the lowercase suffix with the lowercase ending of the main string.
  return appCore.stringManipulation.compareStringsIgnoreCase(suffixString, mainString.substring(startPosition)) === 0;
};

/**
 * Substitutes placeholders (e.g., `%s`) in a template string with provided arguments.
 * Each `%s` is replaced sequentially by the arguments.
 * @param {string} templateString - The template containing `%s` placeholders.
 * @param {...*} replacementArgs - Arguments to insert into the template.
 * @returns {string} The string with all substitutions made.
 */
appCore.stringManipulation.substitutePlaceholders = function(templateString, ...replacementArgs) {
  let result = String(templateString);
  for (let i = 0; i < replacementArgs.length; i++) {
    // Escape '$' in the replacement value to prevent unintended regex behavior.
    const safeReplacement = String(replacementArgs[i]).replace(/\$/g, "$$$$");
    result = result.replace(/%s/, safeReplacement);
  }
  return result;
};

/**
 * Collapses sequences of multiple whitespace characters (including non-breaking spaces)
 * into a single regular space, and then trims leading/trailing whitespace.
 * @param {string} inputText - The string to process.
 * @returns {string} The normalized string.
 */
appCore.stringManipulation.condenseWhitespace = function(inputText) {
  if (typeof inputText !== 'string') return '';
  return inputText.replace(/[\s\u00a0]+/g, " ").trim();
};

/**
 * Checks if a string is empty or consists solely of whitespace characters (including non-breaking spaces).
 * @param {string} inputText - The string to check.
 * @returns {boolean} `true` if the string is empty or only whitespace.
 */
appCore.stringManipulation.isEmptyOrWhitespace = function(inputText) {
  if (typeof inputText !== 'string') return true;
  return /^[\s\u00a0]*$/.test(inputText);
};

/**
 * Safely checks if a value, after being converted to a string, is empty or contains only whitespace.
 * Useful for handling potentially non-string inputs.
 * @param {*} value - The value to convert to string and check.
 * @returns {boolean} `true` if the string representation is empty or whitespace-only.
 */
appCore.stringManipulation.isEmptyStringSafe = function(value) {
  // Safely convert any value to its string representation before checking.
  return appCore.stringManipulation.isEmptyOrWhitespace(String(value));
};

/**
 * Determines if a string contains only "breaking" whitespace characters (space, tab, newline, carriage return).
 * @param {string} inputText - The string to check.
 * @returns {boolean} `true` if the string is composed entirely of breaking whitespace.
 */
appCore.stringManipulation.isOnlyBreakingWhitespace = function(inputText) {
  if (typeof inputText !== 'string') return false;
  return !/[^\t\n\r ]/.test(inputText);
};

/**
 * Checks if a string consists exclusively of alphabetic characters (a-z, A-Z).
 * @param {string} inputText - The string to check.
 * @returns {boolean} `true` if the string is purely alphabetic.
 */
appCore.stringManipulation.isPurelyAlphabetic = function(inputText) {
  if (typeof inputText !== 'string') return false;
  return /^[a-zA-Z]*$/.test(inputText);
};

/**
 * Checks if a string consists exclusively of numeric digits (0-9).
 * @param {string} inputText - The string to check.
 * @returns {boolean} `true` if the string is purely numeric.
 */
appCore.stringManipulation.isPurelyNumeric = function(inputText) {
  if (typeof inputText !== 'string') return false;
  return /^[0-9]*$/.test(inputText);
};

/**
 * Checks if a string consists exclusively of alphanumeric characters (a-z, A-Z, 0-9).
 * @param {string} inputText - The string to check.
 * @returns {boolean} `true` if the string is purely alphanumeric.
 */
appCore.stringManipulation.isPurelyAlphaNumeric = function(inputText) {
  if (typeof inputText !== 'string') return false;
  return /^[a-zA-Z0-9]*$/.test(inputText);
};

/**
 * Checks if a string is exactly a single space character.
 * @param {string} inputText - The string to check.
 * @returns {boolean} `true` if the string is " ".
 */
appCore.stringManipulation.isSingleSpaceChar = function(inputText) {
  return inputText === " ";
};

/**
 * Checks if a string is a single character within a basic Unicode range (ASCII printable or Latin-1 Supplement).
 * This definition is derived from the original Closure Library utility.
 * @param {string} inputText - The string to check.
 * @returns {boolean} `true` if it's a single character in the specified range.
 */
appCore.stringManipulation.isBasicPrintableUnicodeChar = function(inputText) {
  if (typeof inputText !== 'string' || inputText.length !== 1) return false;
  const charCode = inputText.charCodeAt(0);
  // Checks for ASCII printable characters (0x20-0x7E) or extended Latin-1 (0x80-0xFFFD).
  return (charCode >= 0x20 && charCode <= 0x7E) || (charCode >= 0x80 && charCode <= 0xFFFD);
};

/**
 * Replaces all occurrences of newline sequences (`\r\n`, `\r`, `\n`) with a single space character.
 * @param {string} inputText - The string from which to strip newlines.
 * @returns {string} The string with newlines replaced.
 */
appCore.stringManipulation.stripAllNewlines = function(inputText) {
  if (typeof inputText !== 'string') return '';
  return inputText.replace(/(\r\n|\r|\n)+/g, " ");
};

/**
 * Normalizes all various newline sequences (`\r\n`, `\r`, `\n`) to a consistent single line feed (`\n`).
 * @param {string} inputText - The string to normalize.
 * @returns {string} The string with standardized newlines.
 */
appCore.stringManipulation.normalizeNewlineCharacters = function(inputText) {
  if (typeof inputText !== 'string') return '';
  return inputText.replace(/(\r\n|\r|\n)/g, "\n");
};

/**
 * Converts all whitespace characters (including non-breaking spaces) to regular spaces.
 * @param {string} inputText - The string to normalize.
 * @returns {string} The string with all whitespace converted to regular spaces.
 */
appCore.stringManipulation.standardizeAllWhitespace = function(inputText) {
  if (typeof inputText !== 'string') return '';
  return inputText.replace(/[\u00a0\s]/g, " ");
};

/**
 * Normalizes sequences of non-breaking spaces or multiple spaces/tabs to a single regular space.
 * @param {string} inputText - The string to normalize.
 * @returns {string} The string with standardized space sequences.
 */
appCore.stringManipulation.standardizeSpaceSequences = function(inputText) {
  if (typeof inputText !== 'string') return '';
  return inputText.replace(/\u00a0|[ \t]+/g, " ");
};

/**
 * Collapses sequences of breaking whitespace (tabs, newlines, spaces) into a single space,
 * and also trims leading/trailing breaking whitespace.
 * @param {string} inputText - The string to process.
 * @returns {string} The condensed and trimmed string.
 */
appCore.stringManipulation.collapseBreakingSpacesAndTrim = function(inputText) {
  if (typeof inputText !== 'string') return '';
  return inputText.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "");
};

/**
 * Trims leading and trailing whitespace characters (including non-breaking spaces) from a string.
 * @param {string} inputText - The string to trim.
 * @returns {string} The trimmed string.
 */
appCore.stringManipulation.trimString = function(inputText) {
  if (typeof inputText !== 'string') return '';
  return inputText.replace(/^[\s\u00a0]+|[\s\u00a0]+$/g, "");
};

/**
 * Trims only leading whitespace characters (including non-breaking spaces) from a string.
 * @param {string} inputText - The string to trim.
 * @returns {string} The string with leading whitespace removed.
 */
appCore.stringManipulation.trimLeadingWhitespace = function(inputText) {
  if (typeof inputText !== 'string') return '';
  return inputText.replace(/^[\s\u00a0]+/, "");
};

/**
 * Trims only trailing whitespace characters (including non-breaking spaces) from a string.
 * @param {string} inputText - The string to trim.
 * @returns {string} The string with trailing whitespace removed.
 */
appCore.stringManipulation.trimTrailingWhitespace = function(inputText) {
  if (typeof inputText !== 'string') return '';
  return inputText.replace(/[\s\u00a0]+$/, "");
};

/**
 * Performs a case-insensitive comparison between two strings.
 * @param {string} firstString - The first string for comparison.
 * @param {string} secondString - The second string for comparison.
 * @returns {number} -1 if `firstString` is "less than", 0 if "equal", 1 if "greater than" `secondString`.
 */
appCore.stringManipulation.compareStringsIgnoreCase = function(firstString, secondString) {
  const lowerFirst = String(firstString || "").toLowerCase();
  const lowerSecond = String(secondString || "").toLowerCase();

  if (lowerFirst < lowerSecond) {
    return -1;
  }
  if (lowerFirst === lowerSecond) {
    return 0;
  }
  return 1;
};

/**
 * Regular expression used by `compareStringsNumerically` to tokenize strings into numeric and non-numeric parts.
 * @private
 */
appCore.stringManipulation.numericTokenPattern_ = /(\.\d+)|(\d+)|(\D+)/g;

/**
 * Compares two strings "numerically", meaning sequences of digits are compared as numbers
 * rather than lexicographically (e.g., "item10" > "item2").
 * @param {string} stringOne - The first string to compare.
 * @param {string} stringTwo - The second string to compare.
 * @returns {number} -1, 0, or 1 based on the numerical comparison.
 */
appCore.stringManipulation.compareStringsNumerically = function(stringOne, stringTwo) {
  if (stringOne === stringTwo) {
    return 0;
  }
  // Handle null/undefined/empty strings for consistent sorting.
  if (!stringOne) {
    return -1;
  }
  if (!stringTwo) {
    return 1;
  }

  // Tokenize both strings into parts (numbers, decimals, non-numbers).
  const partsA = String(stringOne).toLowerCase().match(appCore.stringManipulation.numericTokenPattern_) || [];
  const partsB = String(stringTwo).toLowerCase().match(appCore.stringManipulation.numericTokenPattern_) || [];

  const minPartsLength = Math.min(partsA.length, partsB.length);

  for (let i = 0; i < minPartsLength; i++) {
    const partA = partsA[i];
    const partB = partsB[i];

    if (partA === partB) {
      continue; // Parts are identical, move to the next token.
    }

    const numValueA = parseInt(partA, 10);
    const numValueB = parseInt(partB, 10);

    // If both parts are valid numbers, compare them numerically.
    if (!isNaN(numValueA) && !isNaN(numValueB)) {
      const numericDifference = numValueA - numValueB;
      if (numericDifference !== 0) {
        return numericDifference;
      }
    } else {
      // If not both numbers, compare lexicographically.
      if (partA < partB) {
        return -1;
      }
      return 1;
    }
  }

  // If one string is a prefix of the other, the longer string is "greater".
  if (partsA.length !== partsB.length) {
    return partsA.length - partsB.length;
  }

  // Fallback to standard lexicographical comparison if all parts were equal.
  return stringOne < stringTwo ? -1 : (stringOne === stringTwo ? 0 : 1);
};

/**
 * Encodes a string for use in a URL component (e.g., query parameter value).
 * @param {string} rawString - The string to encode.
 * @returns {string} The URL-encoded string.
 */
appCore.stringManipulation.encodeUrlComponent = function(rawString) {
  if (typeof rawString !== 'string') return '';
  return encodeURIComponent(String(rawString));
};

/**
 * Decodes a URL-encoded string, also replacing '+' characters with spaces.
 * @param {string} encodedString - The string to decode.
 * @returns {string} The URL-decoded string.
 */
appCore.stringManipulation.decodeUrlComponent = function(encodedString) {
  if (typeof encodedString !== 'string') return '';
  return decodeURIComponent(encodedString.replace(/\+/g, " "));
};

/**
 * Replaces newline characters (`\r\n`, `\r`, `\n`) in a string with HTML `<br>` tags.
 * @param {string} textContent - The input text.
 * @param {boolean} useXhtmlStandard - If `true`, uses `<br />` for XHTML compatibility; otherwise, `<br>`.
 * @returns {string} The text with newlines converted to `<br>` tags.
 */
appCore.stringManipulation.replaceNewlinesWithBreakTags = function(textContent, useXhtmlStandard) {
  if (typeof textContent !== 'string') return '';
  const breakTag = useXhtmlStandard ? "<br />" : "<br>";
  return textContent.replace(/(\r\n|\r|\n)/g, breakTag);
};

/**
 * Regular expression for matching the ampersand character.
 * @private
 */
appCore.stringManipulation.ampersandRegex_ = /&/g;
/**
 * Regular expression for matching the less-than sign.
 * @private
 */
appCore.stringManipulation.lessThanRegex_ = /</g;
/**
 * Regular expression for matching the greater-than sign.
 * @private
 */
appCore.stringManipulation.greaterThanRegex_ = />/g;
/**
 * Regular expression for matching the double-quote character.
 * @private
 */
appCore.stringManipulation.doubleQuoteRegex_ = /"/g;
/**
 * Regular expression for matching the single-quote (apostrophe) character.
 * @private
 */
appCore.stringManipulation.singleQuoteRegex_ = /'/g;
/**
 * Combined regular expression for matching all HTML special characters that require escaping.
 * @private
 */
appCore.stringManipulation.allHtmlSpecialCharsRegex_ = /[&<>"']/g;

/**
 * Escapes HTML special characters in a given string to prevent XSS vulnerabilities.
 * @param {string} rawHtmlText - The string containing potentially unsafe HTML characters.
 * @param {boolean=} fastMode - If `true`, performs a slightly faster escape by always replacing,
 *   without first checking if the character exists.
 * @returns {string} The HTML-escaped string.
 */
appCore.stringManipulation.escapeHtmlEntities = function(rawHtmlText, fastMode) {
  if (typeof rawHtmlText !== 'string') return '';

  if (fastMode) {
    // Fast mode directly applies replacements without checking for character presence.
    return rawHtmlText.replace(appCore.stringManipulation.ampersandRegex_, "&amp;")
                      .replace(appCore.stringManipulation.lessThanRegex_, "&lt;")
                      .replace(appCore.stringManipulation.greaterThanRegex_, "&gt;")
                      .replace(appCore.stringManipulation.doubleQuoteRegex_, "&quot;")
                      .replace(appCore.stringManipulation.singleQuoteRegex_, "&#39;"); // Added single quote for robust XSS.
  }

  // Standard mode: Check for presence of special characters first for minor optimization
  // if most strings are expected to be clean.
  if (!appCore.stringManipulation.allHtmlSpecialCharsRegex_.test(rawHtmlText)) {
    return rawHtmlText; // No special characters found, return original string.
  }

  let escapedOutput = rawHtmlText;
  if (escapedOutput.includes("&")) {
    escapedOutput = escapedOutput.replace(appCore.stringManipulation.ampersandRegex_, "&amp;");
  }
  if (escapedOutput.includes("<")) {
    escapedOutput = escapedOutput.replace(appCore.stringManipulation.lessThanRegex_, "&lt;");
  }
  if (escapedOutput.includes(">")) {
    escapedOutput = escapedOutput.replace(appCore.stringManipulation.greaterThanRegex_, "&gt;");
  }
  if (escapedOutput.includes('"')) {
    escapedOutput = escapedOutput.replace(appCore.stringManipulation.doubleQuoteRegex_, "&quot;");
  }
  if (escapedOutput.includes("'")) {
    escapedOutput = escapedOutput.replace(appCore.stringManipulation.singleQuoteRegex_, "&#39;");
  }

  return escapedOutput;
};