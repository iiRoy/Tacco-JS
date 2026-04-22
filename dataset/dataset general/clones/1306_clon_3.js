/*
 * Hot Module Replacement (HMR) runtime for a JavaScript bundling system.
 * This module enables dynamic updates to application code without requiring a full page reload.
 * It manages the lifecycle of module updates, including checking for new versions,
 * downloading updated chunks, disposing of old modules, and applying new code.
 */

// --- Helper functions for Array and Function prototypes ---
// These extensions are implemented as Type III changes, demonstrating added utility fragments.
// In a production environment, one might prefer standalone utility functions or polyfills
// that do not extend built-in prototypes directly to avoid potential conflicts.
if (!Array.prototype.findIndexOf) {
  /**
   * Finds the index of an item in an array.
   * This provides a consistent method for checking item presence.
   * @param {*} item - The item to locate.
   * @returns {number} The index of the item, or -1 if not found.
   */
  Array.prototype.findIndexOf = function(item) {
    return this.indexOf(item);
  };
}
if (!Array.prototype.addElement) {
  /**
   * Adds a single item to the end of an array.
   * A semantic wrapper for the standard `push` method.
   * @param {*} item - The item to append.
   */
  Array.prototype.addElement = function(item) {
    this.push(item);
  };
}
if (!Array.prototype.removeElement) {
  /**
   * Removes an item from an array by value or by its index.
   * @param {*} itemOrIndex - The item to remove or the numerical index at which to remove.
   * @param {number} [count=1] - The number of elements to remove, applicable when `itemOrIndex` is an index.
   * @returns {boolean} True if an element was successfully removed, false otherwise.
   */
  Array.prototype.removeElement = function(itemOrIndex, count = 1) {
    const index = typeof itemOrIndex === 'number' ? itemOrIndex : this.indexOf(itemOrIndex);
    if (index >= 0) {
      this.splice(index, count);
      return true;
    }
    return false;
  };
}
if (!Array.prototype.addToUniqueList) {
  /**
   * Adds multiple items to an array, ensuring that only unique items are added.
   * Prevents duplication within the array.
   * @param {Array<*>} itemsToAdd - An array of items to potentially add.
   */
  Array.prototype.addToUniqueList = function(itemsToAdd) {
    itemsToAdd.forEach(item => {
      if (this.indexOf(item) < 0) {
        this.push(item);
      }
    });
  };
}
if (!Array.prototype.dequeue) {
  /**
   * Removes and returns the first element from an array, simulating queue behavior.
   * @returns {*} The first element of the array, or `undefined` if the array is empty.
   */
  Array.prototype.dequeue = function() {
    return this.shift();
  };
}
if (!Function.prototype.invoke) {
  /**
   * Invokes a function with a specified `this` context and arguments.
   * Provides a consistent way to call functions with explicit context.
   * @param {*} thisArg - The value to be bound as the `this` parameter.
   * @param {...*} args - Arguments to pass to the function.
   * @returns {*} The result of the function call.
   */
  Function.prototype.invoke = function(thisArg, ...args) {
    return this.call(thisArg, ...args);
  };
}
// --- End Helper functions ---

/**
 * Utility function for logging warning messages.
 * Can be extended to support different log levels or integration with a custom logging system.
 * @param {string} message - The warning message to log.
 */
function logWarning(message) {
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(message);
  }
}

/**
 * A concise utility function to check if an object possesses its own property.
 * This is a common pattern replacing direct `Object.prototype.hasOwnProperty.call`.
 * @param {Object} obj - The object to inspect.
 * @param {string} prop - The name of the property to check.
 * @returns {boolean} True if the object has the specified property as its own, false otherwise.
 */
const hasOwnProp = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

/*
 * This self-executing function encapsulates the entire Hot Module Replacement (HMR) runtime.
 * It initializes the HMR system, overrides the global update hook, and provides
 * the necessary functions for checking, downloading, and applying module updates.
 */
(function(moduleDefinitions) {
  // Store a reference to any existing global 'webpackHotUpdate' handler.
  // This allows multiple HMR runtimes to coexist or ensures compatibility if another system
  // has already established this global hook.
  const originalUpdateHandler = this["webpackHotUpdate"];

  // Override the global 'webpackHotUpdate' function, which is typically called by
  // the webpack runtime when a new HMR update chunk becomes available from the server.
  this["webpackHotUpdate"] = function hmrUpdateProcessor(chunkIdentifier, newModuleDefinitions) {
    // Delegate the actual processing of the incoming chunk data to an internal HMR function.
    processIncomingChunkUpdate(chunkIdentifier, newModuleDefinitions);
    // If an original handler was present, invoke it as well to maintain the call chain.
    if (originalUpdateHandler) {
      originalUpdateHandler(chunkIdentifier, newModuleDefinitions);
    }
  };

  /**
   * Initiates the download of a specific JavaScript chunk file containing HMR updates.
   * This function dynamically creates and appends a `<script>` element to the document's `<head>`.
   * @param {string | number} chunkIdentifier - The unique ID of the chunk to be downloaded.
   */
  function fetchChunkUpdateScript(chunkIdentifier) {
    const documentHeadElement = document.getElementsByTagName('head')[0];
    if (!documentHeadElement) {
      // Log a critical error if the document head cannot be found, as script injection is essential.
      console.error("HMR: Critical Error - Document head element not found. Cannot inject update script.");
      return;
    }
    const updateScriptElement = document.createElement('script');
    updateScriptElement.type = 'text/javascript'; // Specify script type for browser compatibility.
    updateScriptElement.charset = 'utf-8'; // Ensure correct character encoding.
    // Construct the full source URL for the update script, combining public path, chunk ID, and bundle hash.
    updateScriptElement.src = moduleLoader.publicPath + String(chunkIdentifier) + "." + currentBundleHash + ".hot-update.js";
    documentHeadElement.appendChild(updateScriptElement); // Inject the script into the DOM.
  }

  /**
   * Asynchronously fetches the HMR manifest file, which details available updates.
   * The manifest typically contains the new bundle hash and a list of updated chunks.
   * @param {function(Error | null, Object | null): void} completionCallback - A callback function
   *                                                                      that receives an error or the parsed manifest data.
   */
  function fetchUpdateManifest(completionCallback) {
    // Guard clause: Check for XMLHttpRequest support, critical for network requests in browser environments.
    if (typeof XMLHttpRequest === "undefined") {
      return completionCallback(new Error("HMR: XMLHttpRequest is unavailable. Cannot fetch update manifest."));
    }
    let httpRequest;
    const manifestRequestURL = moduleLoader.publicPath + currentBundleHash + ".hot-update.json";
    try {
      httpRequest = new XMLHttpRequest();
      httpRequest.open("GET", manifestRequestURL, true); // Configure an asynchronous GET request.
      httpRequest.timeout = 15000; // Set a 15-second timeout for the request to prevent indefinite hangs.
      httpRequest.send(null); // Send the request without a body.
    } catch (networkError) {
      // Catch synchronous errors that might occur during the request setup (e.g., malformed URL).
      return completionCallback(networkError);
    }

    // Event handler to monitor the progress and completion of the HTTP request.
    httpRequest.onreadystatechange = function() {
      // Only proceed when the request has reached the 'DONE' state (readyState 4).
      if (httpRequest.readyState !== 4) {
        return;
      }

      const httpStatus = httpRequest.status;
      const requestURL = httpRequest.responseURL || manifestRequestURL; // Use responseURL for the actual URL if redirected.

      // Handle various HTTP status codes to determine the outcome of the manifest request.
      if (httpStatus === 0) {
        // Status 0 often indicates a network error, a CORS issue, or a timeout before any response.
        completionCallback(new Error(`HMR: Manifest request to ${requestURL} timed out or network connection failed.`));
      } else if (httpStatus === 404) {
        // HTTP 404 implies no update manifest was found, indicating no updates are available.
        completionCallback(null, null); // Signify no updates without an error.
      } else if (httpStatus < 200 || httpStatus >= 300) {
        // Any other status outside the 2xx range indicates a server-side error or unexpected response.
        completionCallback(new Error(`HMR: Manifest request to ${requestURL} failed with HTTP status ${httpStatus}.`));
      } else {
        // Successful response (HTTP 2xx). Attempt to parse the JSON content.
        try {
          const manifestData = JSON.parse(httpRequest.responseText);
          completionCallback(null, manifestData);
        } catch (parseError) {
          // JSON parsing failed, suggesting a malformed manifest file.
          completionCallback(new Error(`HMR: Failed to parse JSON from manifest at ${requestURL}. Error: ${parseError.message}`));
        }
      }
    };
  }

  // --- HMR Global Configuration and State Variables ---
  let autoApplyUpdates = true; // Flag: If true, updates are applied automatically after download.
  let currentBundleHash = "0905621c1b2b3028d372"; // The hash representing the currently active bundle version.
  const moduleDisposedState = {}; // An object used to store data passed by modules during their dispose phase.
  let currentModuleParents = []; // A temporary array to track parent module IDs during module evaluation.

  /**
   * Generates a module-specific `require` function that is HMR-aware.
   * This function wraps the standard `moduleLoader` to inject HMR logic,
   * such as tracking parent-child relationships for dependency analysis.
   * @param {string | number} modId - The ID of the module for which this `require` function is created.
   * @returns {function(string | number): *} A `require` function augmented with HMR capabilities.
   */
  function createHmrAwareRequire(modId) {
    const currentModuleEntry = cachedModules[modId];
    // If the module entry is unexpectedly missing, return the base module loader
    // to prevent errors, though this scenario should ideally not occur for active modules.
    if (!currentModuleEntry) {
      logWarning(`HMR: Module entry for ID ${modId} not found during creation of HMR-aware require.`);
      return moduleLoader;
    }

    const hmrRequireFunction = function(requestedModuleId) {
      // Dependency tracking is only active if the module is not disposed.
      if (currentModuleEntry.hmrApiInstance.isModuleActive) {
        const targetModule = cachedModules[requestedModuleId];
        if (targetModule) {
          // Ensure the current module is registered as a parent of the requested module.
          if (targetModule.moduleParents.findIndexOf(modId) < 0) {
            targetModule.moduleParents.addElement(modId);
          }
          // Ensure the requested module is registered as a child of the current module.
          if (currentModuleEntry.childModules.findIndexOf(requestedModuleId) < 0) {
            currentModuleEntry.childModules.addElement(requestedModuleId);
          }
        } else {
          // If the requested module is not yet cached, assume the current module is its parent
          // for the purpose of tracking new module loads.
          currentModuleParents = [modId];
        }
      } else {
        // Log a warning if a disposed module attempts to require another module,
        // as this indicates a potential issue or race condition.
        logWarning(`HMR: Disposed module ${modId} attempted to require module ${requestedModuleId}. This might be an error.`);
        currentModuleParents = []; // Reset parents as this path is outside normal HMR flow.
      }
      return moduleLoader(requestedModuleId); // Delegate to the core module loading function.
    };

    // Copy all properties and methods from the base `moduleLoader` to the HMR-aware `require` function.
    // This ensures that all webpack runtime functionalities (e.g., `moduleLoader.d`, `moduleLoader.o`)
    // are available through the HMR-aware `require`.
    for (const propName in moduleLoader) {
      if (hasOwnProp(moduleLoader, propName)) {
        hmrRequireFunction[propName] = moduleLoader[propName];
      }
    }

    /**
     * Custom `ensure` method for HMR-aware chunk loading.
     * This method wraps the base chunk loading mechanism with HMR status and tracking logic.
     * @param {string | number} chunkIdentifier - The ID of the chunk to load.
     * @param {function(): void} handlerFunction - The callback to execute once the chunk is loaded.
     */
    hmrRequireFunction.ensure = function(chunkIdentifier, handlerFunction) {
      // If HMR is in a 'ready' state, initiating a chunk load transitions it to 'prepare' for the update.
      if (hmrStatus === "statusReady") {
        updateHmrStatus("statusPrepare");
      }
      chunksInProgress++; // Increment the counter for chunks currently being loaded.

      // Call the base module loader's `e` method to handle the actual chunk loading process.
      moduleLoader.e(chunkIdentifier, function() {
        try {
          // Execute the provided handler function, passing the HMR-aware `require` as an argument.
          handlerFunction.invoke(null, hmrRequireFunction);
        } finally {
          finalizeChunkLoad(); // Ensure the chunk loading finalization logic always executes.
        }

        // Inner helper function to manage the completion of a chunk load.
        function finalizeChunkLoad() {
          chunksInProgress--; // Decrement the count of pending chunk loads.
          if (hmrStatus === "statusPrepare") {
            // If this chunk is part of a pending HMR update and not yet explicitly requested, ensure its handling.
            if (!waitingFileMap[chunkIdentifier]) {
              ensureChunkForUpdate(chunkIdentifier);
            }
            // If all chunks and files related to the HMR update are now processed, signal completion.
            if (chunksInProgress === 0 && waitingForFiles === 0) {
              onUpdateDownloadComplete();
            }
          }
        }
      });
    };
    return hmrRequireFunction;
  }

  /**
   * Creates the Hot Module Replacement (HMR) API object for a given module.
   * This object is exposed to modules via `module.hot` and provides methods
   * for module acceptance, decline, and lifecycle hooks (`dispose`).
   * @param {string | number} modId - The ID of the module.
   * @returns {Object} The HMR API object tailored for the specified module.
   */
  function createModuleHmrApi(modId) {
    const hmrApi = {
      // --- Internal HMR State for the Module ---
      acceptedDeps: {}, // Stores explicit dependencies that this module accepts updates from.
      declinedDeps: {}, // Stores explicit dependencies that this module declines updates from.
      selfAcceptedFlag: false, // Boolean or function: True if the module accepts updates to itself.
      selfDeclinedFlag: false, // True if the module explicitly declines updates to itself.
      disposeCallbacks: [], // An array of functions to be called when the module is disposed.

      // --- Public HMR API Properties ---
      isModuleActive: true, // Indicates whether the module is currently active within the HMR system.

      /**
       * Marks a dependency (or the module itself) as accepting HMR updates.
       * This allows updates to propagate without forcing a full parent reload.
       * @param {string | number | Array<string | number> | Function} dependency - The ID(s) of the dependency/dependencies,
       *                                                                      or a function for self-acceptance with a custom handler.
       * @param {Function} [handlerFunction] - The callback to execute when the accepted dependency updates.
       */
      acceptDependencies: function(dependency, handlerFunction) {
        if (dependency === undefined) {
          // If no specific dependency is provided, the module accepts updates to itself.
          hmrApi.selfAcceptedFlag = true;
        } else if (typeof dependency === "function") {
          // If a function is provided, it acts as a custom handler for self-acceptance.
          hmrApi.selfAcceptedFlag = dependency;
        } else if (typeof dependency === "number") {
          // If a single numeric ID, it's a specific dependency that is accepted.
          hmrApi.acceptedDeps[dependency] = handlerFunction;
        } else if (Array.isArray(dependency)) {
          // If an array of IDs, multiple dependencies are accepted with the same handler.
          dependency.forEach(depId => {
            hmrApi.acceptedDeps[depId] = handlerFunction;
          });
        } else {
          logWarning(`HMR: Module ${modId} received an unexpected type for 'accept' dependency: ${typeof dependency}. Ignored.`);
        }
      },

      /**
       * Marks a dependency (or the module itself) as declining HMR updates.
       * Declining an update prevents it from propagating through this module's dependency chain,
       * potentially forcing a full page reload or aborting the HMR process.
       * @param {string | number | Array<string | number>} [dependency] - The ID(s) of the dependency/dependencies.
       */
      declineDependencies: function(dependency) {
        if (dependency === undefined) {
          // If no specific dependency, the module declines updates to itself.
          hmrApi.selfDeclinedFlag = true;
        } else if (typeof dependency === "number") {
          // A single numeric ID indicates a specific dependency that is declined.
          hmrApi.declinedDeps[dependency] = true;
        } else if (Array.isArray(dependency)) {
          // An array of IDs indicates multiple dependencies are declined.
          dependency.forEach(depId => {
            hmrApi.declinedDeps[depId] = true;
          });
        } else {
          logWarning(`HMR: Module ${modId} received an unexpected type for 'decline' dependency: ${typeof dependency}. Ignored.`);
        }
      },

      /**
       * Registers a callback function to be executed just before the module is disposed by HMR.
       * This allows modules to perform cleanup, save state, or release resources.
       * @param {Function} handlerFunction - The callback function. It receives a `data` object
       *                                     which can be used to pass state to the new module instance.
       */
      registerDisposeHandler: function(handlerFunction) {
        if (typeof handlerFunction === 'function') {
          hmrApi.disposeCallbacks.addElement(handlerFunction);
        } else {
          logWarning(`HMR: Module ${modId} attempted to register a non-function as a dispose handler. It was ignored.`);
        }
      },

      // --- HMR Management API Aliases ---
      checkForUpdates: performHmrCheck, // Alias to the global HMR check function.
      applyUpdates: executeHmrApply, // Alias to the global HMR apply function.

      /**
       * Retrieves the current HMR status or registers a listener for status changes.
       * @param {Function} [statusListener] - An optional callback to be notified of HMR status changes.
       * @returns {string} The current HMR status if no listener is provided.
       */
      getOrSetStatusHandler: function(statusListener) {
        if (!statusListener) {
          return hmrStatus; // Return current status if no listener provided.
        }
        if (typeof statusListener === 'function') {
          hmrStatusChangeListeners.addElement(statusListener); // Add the listener to the global list.
        } else {
          logWarning("HMR: Attempted to add a non-function as a status listener. Ignored.");
        }
      },

      /**
       * Adds a listener function that will be invoked whenever the HMR system's status changes.
       * @param {Function} statusListener - The callback function for status changes.
       */
      addStatusHandler: function(statusListener) {
        if (typeof statusListener === 'function') {
          hmrStatusChangeListeners.addElement(statusListener);
        }
      },

      /**
       * Removes a previously registered HMR status change listener.
       * @param {Function} statusListener - The callback function to remove.
       */
      removeStatusHandler: function(statusListener) {
        hmrStatusChangeListeners.removeElement(statusListener);
      },

      // Provides access to data that was saved during a previous dispose cycle for this module.
      moduleStateData: moduleDisposedState[modId]
    };
    return hmrApi;
  }

  // --- HMR Status Management ---
  const hmrStatusChangeListeners = []; // Array of functions registered to listen for HMR status changes.
  let hmrStatus = "statusIdle"; // The current operational status of the HMR system (e.g., "idle", "check", "ready").

  /**
   * Updates the global HMR status and broadcasts this change to all registered listeners.
   * This function ensures that status transitions are managed consistently.
   * @param {string} targetStatus - The new status string (e.g., "statusCheck", "statusReady", "statusApply").
   */
  function updateHmrStatus(targetStatus) {
    // Avoid redundant updates if the status is already the target status.
    if (hmrStatus === targetStatus) {
      return;
    }
    hmrStatus = targetStatus; // Set the new current status.
    // Notify all registered listeners about the status change.
    hmrStatusChangeListeners.forEach(listener => {
      listener.invoke(null, targetStatus);
    });
  }

  // --- HMR Update Download and Tracking Variables ---
  let waitingForFiles = 0; // Counts the number of update files (chunks) currently awaiting download completion.
  let chunksInProgress = 0; // Counts the number of module chunks actively being loaded via `require.ensure`.
  const waitingFileMap = {}; // Maps chunk IDs to true if they are part of the update but not yet requested for download.
  const requestedFileMap = {}; // Maps chunk IDs to true if their download has been initiated.
  const availableFileMap = {}; // Maps chunk IDs to true if they are listed in the update manifest.
  let updateCompletionCb; // The callback function provided by the user to be invoked upon update completion.

  // --- HMR Update Data and Hash ---
  let currentUpdatePayload; // An object accumulating new module definitions received in the update chunks.
  let newBundleHash; // The hash of the new bundle version after the current update is applied.

  /**
   * Initiates the HMR check process to detect and prepare for available updates.
   * This involves fetching the update manifest and setting up the download phase.
   * @param {boolean | Function} [autoApplyOrCb] - If a boolean, specifies whether to automatically apply updates
   *                                                after they are downloaded. If a function, it's treated as the `completionCallback`.
   * @param {Function} [completionCallback] - The callback function to be invoked after the check completes,
   *                                        receiving an error or an indication of available updates.
   */
  function performHmrCheck(autoApplyOrCb, completionCallback) {
    // Guard clause: Ensure `check()` is only called when HMR is in an 'idle' state to prevent concurrent operations.
    if (hmrStatus !== "statusIdle") {
      throw new Error(`HMR: 'check()' operation is only permitted in 'statusIdle' state. Current status: '${hmrStatus}'.`);
    }

    // Determine the `autoApplyUpdates` flag and the actual user-provided completion callback.
    if (typeof autoApplyOrCb === "function") {
      autoApplyUpdates = false; // If a function is passed as the first argument, auto-apply is implicitly off.
      completionCallback = autoApplyOrCb;
    } else if (typeof autoApplyOrCb === "boolean") {
      autoApplyUpdates = autoApplyOrCb;
    }
    // Provide a default error-logging callback if no explicit callback is given.
    completionCallback = completionCallback || function(errorObject) {
      if (errorObject) {
        console.error("HMR Check encountered an unhandled error:", errorObject);
        throw errorObject; // Re-throw unhandled errors to ensure they are not silently swallowed.
      }
    };

    updateHmrStatus("statusCheck"); // Transition HMR to the 'check' status.

    fetchUpdateManifest(function(errorObject, manifestData) {
      if (errorObject) {
        updateHmrStatus("statusIdle"); // Revert to idle if manifest fetching fails.
        return completionCallback(errorObject);
      }
      if (!manifestData) {
        updateHmrStatus("statusIdle"); // No update manifest found, indicating no updates are available.
        return completionCallback(null, null); // Signal no updates to the callback.
      }

      // Reset tracking maps for the new update cycle to ensure a clean state.
      requestedFileMap = {};
      availableFileMap = {};
      waitingFileMap = {};

      // Populate `availableFileMap` from the list of chunks specified in the manifest.
      // (Assuming 'c' is the property in the manifest object that holds chunk IDs).
      if (manifestData.c && Array.isArray(manifestData.c)) {
        manifestData.c.forEach(chunkId => {
          availableFileMap[chunkId] = true;
        });
      } else {
        logWarning("HMR: Update manifest is missing the 'c' (chunks) property or it is not an array. Update might be incomplete or malformed.");
      }

      newBundleHash = manifestData.h; // Store the hash of the new bundle version from the manifest.

      updateHmrStatus("statusPrepare"); // Transition HMR to the 'prepare' status.
      updateCompletionCb = completionCallback; // Store the user's completion callback for later invocation.
      currentUpdatePayload = {}; // Initialize the object that will collect new module definitions.

      // Ensure the update chunk for the main entry point (typically ID 0) is handled.
      // This is crucial as global changes or initial modules often reside in this chunk.
      const entryChunkId = 0;
      ensureChunkForUpdate(entryChunkId);

      // If, after initial setup, no chunks or files are pending, it means the update is
      // effectively downloaded, so proceed directly to the 'downloaded' state.
      if (hmrStatus === "statusPrepare" && chunksInProgress === 0 && waitingForFiles === 0) {
        onUpdateDownloadComplete();
      }
    });
  }

  /**
   * Integrates new module definitions received from a downloaded update chunk.
   * This function is typically called by the global `hmrUpdateProcessor` once a chunk script loads.
   * @param {string | number} chunkIdentifier - The ID of the chunk that has been updated.
   * @param {Object} chunkModules - An object containing the new module functions for this chunk.
   */
  function integrateUpdateChunk(chunkIdentifier, chunkModules) {
    // Guard clause: Only process chunks that were both expected (available) and actively requested.
    if (!availableFileMap[chunkIdentifier] || !requestedFileMap[chunkIdentifier]) {
      logWarning(`HMR: Received update for unexpected or already processed chunk ID: ${chunkIdentifier}. Ignoring.`);
      return;
    }

    requestedFileMap[chunkIdentifier] = false; // Mark this chunk as no longer actively requested.

    // Merge the new module definitions from this chunk into the overall `currentUpdatePayload`.
    for (const modKey in chunkModules) {
      if (hasOwnProp(chunkModules, modKey)) {
        currentUpdatePayload[modKey] = chunkModules[modKey];
      }
    }

    waitingForFiles--; // Decrement the count of update files still being awaited.

    // If all update files and chunks are now downloaded and processed, signal completion.
    if (waitingForFiles === 0 && chunksInProgress === 0) {
      onUpdateDownloadComplete();
    }
  }

  /**
   * Ensures that a given chunk's update is either already marked as available or scheduled for download.
   * This function manages the state of chunk updates during the 'prepare' phase.
   * @param {string | number} chunkIdentifier - The ID of the chunk to check or ensure.
   */
  function ensureChunkForUpdate(chunkIdentifier) {
    if (!availableFileMap[chunkIdentifier]) {
      // If the chunk is not listed in the manifest as available, mark it as waiting.
      // This might happen if a chunk is part of the update but its content isn't immediately ready.
      waitingFileMap[chunkIdentifier] = true;
    } else {
      // If the chunk is available, mark it as requested and initiate its download.
      requestedFileMap[chunkIdentifier] = true;
      waitingForFiles++;
      fetchChunkUpdateScript(chunkIdentifier);
    }
  }

  /**
   * Handler function invoked when all update chunks have been successfully downloaded.
   * It transitions the HMR status to 'ready' and either automatically applies updates
   * or notifies the user via the completion callback.
   */
  function onUpdateDownloadComplete() {
    updateHmrStatus("statusReady"); // HMR system is now ready to proceed with applying updates.

    const finalCallback = updateCompletionCb;
    updateCompletionCb = null; // Clear the stored callback to prevent accidental re-invocation.
    if (!finalCallback) {
      return; // No callback was registered, so no further action is needed.
    }

    if (autoApplyUpdates) {
      executeHmrApply(null, finalCallback); // If auto-apply is enabled, immediately proceed to the apply phase.
    } else {
      // If not auto-applying, just inform the user which modules are affected by the update.
      const affectedModulesList = [];
      for (const modIdentifier in currentUpdatePayload) {
        if (hasOwnProp(currentUpdatePayload, modIdentifier)) {
          // Convert module ID to a number and add it to the list of affected modules.
          affectedModulesList.addElement(Number(modIdentifier));
        }
      }
      finalCallback(null, affectedModulesList); // Call back with the list of outdated modules.
    }
  }

  /**
   * Executes the HMR apply process, which involves a multi-step sequence:
   * 1. Analyzing affected modules and dependencies.
   * 2. Disposing of old module instances and their associated resources.
   * 3. Replacing old module definitions with new ones.
   * 4. Re-initializing affected parts of the application by calling accept handlers
   *    and re-requiring self-accepted modules.
   * @param {Object | Function} [applyOptionsOrCb] - Options for the apply process (e.g., `shouldIgnoreUnaccepted`),
   *                                                or the completion callback if only one argument is provided.
   * @param {Function} [completionCallback] - The callback function to be invoked after the apply process completes.
   */
  function executeHmrApply(applyOptionsOrCb, completionCallback) {
    // Guard clause: Ensure `apply()` is only called when HMR is in a 'ready' state.
    if (hmrStatus !== "statusReady") {
      throw new Error(`HMR: 'apply()' operation is only permitted in 'statusReady' state. Current status: '${hmrStatus}'.`);
    }

    let applyOptions = {};
    // Process arguments to correctly identify apply options and the completion callback.
    if (typeof applyOptionsOrCb === "function") {
      completionCallback = applyOptionsOrCb;
    } else if (applyOptionsOrCb && typeof applyOptionsOrCb === "object") {
      applyOptions = applyOptionsOrCb;
    }

    // Provide a default error-logging callback if no explicit callback is given.
    completionCallback = completionCallback || function(errorObject) {
      if (errorObject) {
        console.error("HMR Apply encountered an unhandled error:", errorObject);
        throw errorObject;
      }
    };

    /**
     * Recursively determines all modules affected by an update, tracing dependencies upwards.
     * This function is crucial for identifying which modules need to be disposed and reloaded.
     * @param {string | number} targetModuleId - The ID of the module that has been directly updated.
     * @returns {Array<Array<string | number>, Object> | Error | null}
     *          - An array `[outdatedModules, affectedDependencies]` if the analysis is successful.
     *          - An `Error` object if the update process needs to be aborted (e.g., due to a declined dependency).
     *          - `null` if the update affects the entry module (ID 0) directly or a self-accepted module that stops propagation.
     */
    function determineAffectedModules(targetModuleId) {
      const outdatedModules = [targetModuleId]; // Start the analysis with the directly updated module.
      const affectedDependencies = {}; // Stores parent modules that accept updates from their children.

      const processingQueue = outdatedModules.slice(); // Use a queue for breadth-first or depth-first traversal.
      while (processingQueue.length > 0) {
        const currentModId = processingQueue.dequeue(); // Get the next module to process from the queue.
        const currentModInfo = cachedModules[currentModId];

        // If the module doesn't exist (e.g., already removed) or is self-accepted,
        // it acts as a boundary for update propagation.
        if (!currentModInfo || currentModInfo.hmrApiInstance.selfAcceptedFlag) {
          continue;
        }
        // If the module explicitly declines updates to itself, the entire HMR process must abort.
        if (currentModInfo.hmrApiInstance.selfDeclinedFlag) {
          return new Error(`HMR: Update aborted because module ${currentModId} has explicitly declined itself.`);
        }
        // Special handling for the entry module (ID 0): it cannot be directly updated or disposed by HMR.
        // If an update propagates to it, a full page reload is typically required.
        if (currentModId === 0) {
          return null; // Signal that this update cannot be handled gracefully by HMR.
        }

        // Iterate through the parent modules of the current module to find further affected modules.
        for (let idx = 0; idx < currentModInfo.moduleParents.length; idx++) {
          const parentModId = currentModInfo.moduleParents[idx];
          const parentModInfo = cachedModules[parentModId];

          // If a parent module is not found (e.g., already disposed), skip it.
          if (!parentModInfo) {
            continue;
          }

          // If the parent module explicitly declines this specific dependency, abort the update.
          if (parentModInfo.hmrApiInstance.declinedDeps[currentModId]) {
            return new Error(`HMR: Update aborted because dependency ${currentModId} is declined by its parent ${parentModId}.`);
          }

          // If the parent module accepts updates from this specific dependency,
          // record it and stop propagation up this particular branch.
          if (parentModInfo.hmrApiInstance.acceptedDeps[currentModId]) {
            if (!affectedDependencies[parentModId]) {
              affectedDependencies[parentModId] = [];
            }
            affectedDependencies[parentModId].addElement(currentModId); // Add to accepted dependencies list.
            continue; // Propagation stops here for this parent, it will handle the update.
          }

          // If the parent neither accepts nor declines, it means the parent itself is outdated.
          // Add it to the `outdatedModules` list and the `processingQueue` for further propagation,
          // but only if it hasn't been added already.
          if (outdatedModules.findIndexOf(parentModId) < 0) {
            outdatedModules.addElement(parentModId);
            processingQueue.addElement(parentModId);
          }
        }
      }
      return [outdatedModules, affectedDependencies]; // Return the identified outdated modules and accepted dependencies.
    }

    const affectedDependencies = {}; // Maps parent module IDs to lists of their accepted child dependencies.
    let outdatedModules = []; // A comprehensive list of all modules that need to be replaced.
    const modulesToApply = {}; // The new module functions that will be installed.

    // First pass: Analyze all modules included in the `currentUpdatePayload` to determine their impact.
    for (const modIdentifier in currentUpdatePayload) {
      if (hasOwnProp(currentUpdatePayload, modIdentifier)) {
        const moduleIdNum = Number(modIdentifier);
        const analysisResult = determineAffectedModules(moduleIdNum);

        // Handle the various outcomes from the dependency analysis.
        if (analysisResult === null) {
          // If `null`, it means the update affected the entry module (ID 0) directly,
          // which cannot be hot-replaced.
          updateHmrStatus("statusAbort");
          return completionCallback(new Error(`HMR: Update cannot be applied directly to the entry module (ID 0). A full page reload is required.`));
        }
        if (analysisResult instanceof Error) {
          // An error during analysis (e.g., a module declined an update) forces an abort.
          updateHmrStatus("statusAbort");
          return completionCallback(analysisResult);
        }

        // If analysis is successful, record the modules and their dependencies.
        modulesToApply[moduleIdNum] = currentUpdatePayload[modIdentifier]; // Store the new module definition.
        outdatedModules.addToUniqueList(analysisResult[0]); // Add all newly identified outdated modules to the list.
        for (const parentModId in analysisResult[1]) {
          if (hasOwnProp(analysisResult[1], parentModId)) {
            if (!affectedDependencies[parentModId]) {
              affectedDependencies[parentModId] = [];
            }
            // Add accepted dependencies to the parent's list, ensuring uniqueness.
            affectedDependencies[parentModId].addToUniqueList(analysisResult[1][parentModId]);
          }
        }
      }
    }

    // Filter `outdatedModules` to ensure only modules currently present in the cache are processed.
    outdatedModules = outdatedModules.filter(modId => cachedModules[modId]);

    // Identify and store self-accepted outdated modules. These modules will be re-required later
    // to activate their new versions, without needing their parents to accept them.
    const selfAcceptedAffectedModules = [];
    outdatedModules.forEach(moduleId => {
      const moduleInfo = cachedModules[moduleId];
      if (moduleInfo && moduleInfo.hmrApiInstance.selfAcceptedFlag) {
        selfAcceptedAffectedModules.addElement({
          module: moduleId,
          acceptanceErrorHandler: typeof moduleInfo.hmrApiInstance.selfAcceptedFlag === 'function' ? moduleInfo.hmrApiInstance.selfAcceptedFlag : null
        });
      }
    });

    // --- Phase 1: Dispose Outdated Modules ---
    updateHmrStatus("statusDispose"); // Transition HMR to the 'dispose' phase.
    const disposeProcessingQueue = outdatedModules.slice(); // Create a copy for the dispose queue.

    while (disposeProcessingQueue.length > 0) {
      const currentModId = disposeProcessingQueue.dequeue();
      const currentModInfo = cachedModules[currentModId];
      if (!currentModInfo) {
        continue; // Skip if the module was already removed or never existed.
      }

      const disposedModuleData = {}; // An object to pass to dispose handlers for saving state.

      // Execute all registered dispose handlers for the current module.
      currentModInfo.hmrApiInstance.disposeCallbacks.forEach(handlerCb => {
        try {
          handlerCb(disposedModuleData);
        } catch (error) {
          console.error(`HMR: Error encountered in dispose handler for module ${currentModId}:`, error);
        }
      });
      moduleDisposedState[currentModId] = disposedModuleData; // Store the data for potential re-use by the new module instance.

      // Deactivate the module's HMR API and remove it from the module cache.
      currentModInfo.hmrApiInstance.isModuleActive = false;
      delete cachedModules[currentModId];

      // Remove references to this disposed module from its children's parent lists.
      currentModInfo.childModules.forEach(childModId => {
        const childModInfo = cachedModules[childModId];
        if (childModInfo) {
          childModInfo.parentModuleIds.removeElement(currentModId); // Remove the disposed module as a parent.
        }
      });
    }

    // After disposing, remove any outdated dependencies from the `childModules` lists of their parents.
    for (const modId in affectedDependencies) {
      if (hasOwnProp(affectedDependencies, modId)) {
        const moduleInfo = cachedModules[modId];
        if (moduleInfo) {
          const moduleOutdatedDependencies = affectedDependencies[modId];
          moduleOutdatedDependencies.forEach(dependencyId => {
            moduleInfo.childModules.removeElement(dependencyId); // Remove the outdated child module.
          });
        }
      }
    }

    // --- Phase 2: Apply New Modules and Re-initialize ---
    updateHmrStatus("statusApply"); // Transition HMR to the 'apply' phase.
    currentBundleHash = newBundleHash; // Update the global bundle hash to the new version.

    // Insert the new module functions into the `moduleDefinitions` object.
    // This makes the new code available for `moduleLoader`.
    for (const modId in modulesToApply) {
      if (hasOwnProp(modulesToApply, modId)) {
        moduleDefinitions[modId] = modulesToApply[modId];
      }
    }

    // Execute accept handlers for modules that accepted updates from their children.
    let operationError = null; // Variable to track any errors during this phase.
    for (const modId in affectedDependencies) {
      if (hasOwnProp(affectedDependencies, modId)) {
        const moduleInfo = cachedModules[modId];
        if (!moduleInfo) continue; // Skip if the parent module itself was outdated and removed.

        const moduleOutdatedDependencies = affectedDependencies[modId];
        const acceptedCallbacks = [];

        // Collect unique accept callbacks associated with this parent module.
        moduleOutdatedDependencies.forEach(dependencyId => {
          const cb = moduleInfo.hmrApiInstance.acceptedDeps[dependencyId];
          if (cb && acceptedCallbacks.findIndexOf(cb) < 0) {
            acceptedCallbacks.addElement(cb);
          }
        });

        // Execute each unique accept callback.
        acceptedCallbacks.forEach(cb => {
          try {
            cb(affectedDependencies); // Pass the map of affected dependencies to the handler.
          } catch (err) {
            if (!operationError) {
              operationError = err; // Store the first error encountered.
            } else {
              console.error(`HMR: Additional error during accept handler for module ${modId}:`, err);
            }
          }
        });
      }
    }

    // Load (re-require) self-accepted modules to activate their new code.
    selfAcceptedAffectedModules.forEach(item => {
      const moduleId = item.module;
      currentModuleParents = [moduleId]; // Temporarily set parent context for the re-require operation.
      try {
        moduleLoader(moduleId); // Re-require the module to execute its new version.
      } catch (err) {
        if (item.acceptanceErrorHandler) {
          // If a custom error handler was provided for self-acceptance, use it.
          try {
            item.acceptanceErrorHandler(err);
          } catch (handlerErr) {
            if (!operationError) {
              operationError = handlerErr;
            } else {
              console.error(`HMR: Additional error during self-accept error handler for module ${moduleId}:`, handlerErr);
            }
          }
        } else if (!operationError) {
          operationError = err; // Store the first error if no custom handler.
        } else {
          console.error(`HMR: Additional error during self-accepted module load for ${moduleId}:`, err);
        }
      } finally {
        currentModuleParents = []; // Clear parent context after loading.
      }
    });

    // Final error handling: If any error occurred during the apply process,
    // transition HMR to a 'fail' status and report the error.
    if (operationError) {
      updateHmrStatus("statusFail");
      return completionCallback(operationError);
    }

    updateHmrStatus("statusIdle"); // Successfully applied updates, return to 'idle' state.
    completionCallback(null, outdatedModules); // Report success and the list of updated modules.
  }

  // --- Core Module System (adapted from Webpack's internal structure) ---

  // The module cache: stores all loaded module instances.
  const cachedModules = {};

  /**
   * The primary module loading function, analogous to Webpack's `__webpack_require__`.
   * It loads modules from `moduleDefinitions`, caches them, and integrates HMR capabilities.
   * @param {string | number} modId - The ID of the module to load.
   * @returns {*} The `exports` object of the loaded module.
   */
  function moduleLoader(modId) {
    // If the module is already in the cache, return its exports immediately.
    if (cachedModules[modId]) {
      return cachedModules[modId].moduleExports;
    }

    // If not cached, create a new module entry and store it in the cache.
    const moduleEntry = cachedModules[modId] = {
      moduleExports: {}, // The object that will hold the module's exported values.
      id: modId, // The unique identifier for this module.
      isLoaded: false, // Flag indicating if the module's definition function has been executed.
      hmrApiInstance: createModuleHmrApi(modId), // Attach the HMR API object to this module.
      moduleParents: currentModuleParents, // Record parent IDs for HMR dependency tracking.
      childModules: [] // Initialize an empty list to track child modules.
    };

    // Reset `currentModuleParents` after a module is created to ensure correct tracking
    // for subsequent modules, preventing incorrect parent associations.
    currentModuleParents = [];

    // Execute the module's definition function.
    // The module function is invoked with:
    // `this` set to `moduleEntry.moduleExports`
    // `module` as `moduleEntry`
    // `exports` as `moduleEntry.moduleExports`
    // `__webpack_require__` as `moduleLoader`
    try {
      moduleDefinitions[modId].call(moduleEntry.moduleExports, moduleEntry, moduleEntry.moduleExports, moduleLoader);
      moduleEntry.isLoaded = true; // Mark the module as loaded after successful execution.
    } catch (loadError) {
      // If an error occurs during module execution, remove it from the cache
      // to allow for a clean retry or to prevent using a partially loaded module.
      delete cachedModules[modId];
      throw loadError; // Re-throw the error to signal a module loading failure.
    }

    return moduleEntry.moduleExports; // Return the module's exports.
  }

  // --- Webpack Runtime Properties (Mimicked for Compatibility) ---

  // `publicPath`: The base URL or path from which additional chunks and assets are loaded.
  moduleLoader.publicPath = "/";

  // `m`: A reference to the original module definitions object, often used internally by webpack.
  moduleLoader.m = moduleDefinitions;

  // `c`: A reference to the module cache, providing access to loaded modules.
  moduleLoader.c = cachedModules;

  // `e`: The chunk loading function, equivalent to `require.ensure` or `import()`.
  // This is a simplified stub; in a full webpack runtime, this would handle dynamic script loading
  // (e.g., via JSONP) for code-split chunks. When used with HMR, `hmrRequireFunction.ensure` wraps this.
  moduleLoader.e = function(chunkId, completionCallback) {
    if (completionCallback && typeof completionCallback === 'function') {
      // In a real scenario, this callback would be invoked after the chunk script has loaded.
      // For this simplified clone, we invoke it directly to simulate immediate availability.
      // A more robust Type III clone might introduce a `setTimeout` or Promise for async simulation.
      completionCallback.invoke(null, moduleLoader);
    } else {
      logWarning(`HMR: moduleLoader.e called without a valid completion callback for chunk ${chunkId}.`);
    }
  };

  // `i`: The identity function, often used for module ID mapping or internal transformations.
  moduleLoader.i = function(value) { return value; };

  // `d`: Utility to define a getter property on an exports object.
  // This is used for creating getters for exports, especially for compatibility with ES Modules.
  moduleLoader.d = function(exports, name, getter) {
    if (!hasOwnProp(exports, name)) {
      Object.defineProperty(exports, name, {
        configurable: false, // Prevent re-configuration of the property.
        enumerable: true, // Make the property enumerable (visible in `for...in` loops).
        get: getter // The getter function that provides the property's value.
      });
    }
  };

  // `n`: Utility to create a namespace object for modules, particularly for ES Modules.
  // It handles both CommonJS and ES Module exports gracefully.
  moduleLoader.n = function(module) {
    const getter = module && module.__esModule ?
      function getDefault() { return module['default']; } : // If it's an ES module, return its default export.
      function getModuleExports() { return module; }; // Otherwise, return the module's exports object directly.
    moduleLoader.d(getter, 'a', getter); // Add a non-standard 'a' property that points to the getter function itself.
    return getter;
  };

  // `o`: Utility to check if an object has its own property. Uses our internal `hasOwnProp` helper.
  moduleLoader.o = hasOwnProp;

  // `r`: Utility to mark an exports object as an ES Module.
  // This sets the `__esModule` property to `true` for compatibility with ES Module interoperability.
  moduleLoader.r = function(exports) {
    Object.defineProperty(exports, '__esModule', { value: true });
  };

})
/* This empty object is the placeholder for the initial bundle's module definitions. */
({});