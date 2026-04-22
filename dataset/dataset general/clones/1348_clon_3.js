;(function () {
  /**
   * Provides a mechanism for loading modules by their path.
   * This function acts as the primary module resolver and executor.
   *
   * @param {string} modulePath - The identifier of the module to load.
   * @param {string} [referrerPath] - The path of the module requesting this load.
   * @param {string} [originalRequest] - The initial, un-resolved path provided by the caller.
   * @returns {object} The exports object of the loaded module.
   * @throws {Error} If the module cannot be found or loaded.
   * @public
   */
  function depLoader(modulePath, referrerPath, originalRequest) {
    // Attempt to locate the module's canonical identifier.
    const resolvedIdentifier = depLoader.findModuleId(modulePath);

    // If the lookup fails, we can't proceed.
    if (!resolvedIdentifier) {
      const actualRequest = originalRequest || modulePath;
      const requestingEntity = referrerPath || 'application_root';
      const failureError = new Error(
        `Module resolution failed for "${actualRequest}" requested from "${requestingEntity}".`
      );
      failureError.requestedPath = actualRequest;
      failureError.requestingModule = requestingEntity;
      failureError.loaderIssue = true; // Custom property for identification.
      throw failureError;
    }

    // Retrieve the module definition from the internal registry.
    const registeredModule = depLoader.registry[resolvedIdentifier];

    // Execute the module's factory function if it hasn't been processed yet.
    // This ensures each module is initialized only once.
    if (!registeredModule._initializationInProgress && !registeredModule.moduleExports) {
      const moduleContainer = {};
      moduleContainer.moduleExports = {}; // The object that will hold the module's public interface.
      moduleContainer.isClientSide = true; // Indicates client-side context.
      moduleContainer.isComponent = true; // Indicates component-style module.

      registeredModule._initializationInProgress = true; // Prevent re-entry during execution.
      // Call the module's factory, passing it the exports object,
      // a relative loader, and the module container itself.
      registeredModule.call(
        this,
        moduleContainer.moduleExports,
        depLoader.createRelativeLoader(resolvedIdentifier),
        moduleContainer
      );
      delete registeredModule._initializationInProgress; // Clear the flag.
      registeredModule.moduleExports = moduleContainer.moduleExports; // Store the final exports.
    }

    // Return the module's public interface.
    return registeredModule.moduleExports;
  }

  /**
   * Internal store for registered module factory functions.
   * Keys are canonical module identifiers, values are the factory functions.
   */
  depLoader.registry = {};

  /**
   * Internal store for module aliases.
   * Maps an alias identifier to a canonical module identifier.
   */
  depLoader.moduleMaps = {};

  /**
   * Resolves a given `lookupPath` to its canonical module identifier.
   * It attempts several common patterns for module files.
   *
   * @param {string} lookupPath - The path to resolve.
   * @returns {string|null} The canonical module identifier or null if not found.
   * @private
   */
  depLoader.findModuleId = function (lookupPath) {
    let currentLookup = lookupPath;
    // Remove leading slash if present, as identifiers are usually relative.
    if (currentLookup.startsWith('/')) {
      currentLookup = currentLookup.substring(1);
    }

    // Define a set of potential file extensions and directory structures.
    const possiblePaths = [
      currentLookup,
      currentLookup + '.js',
      currentLookup + '.json',
      currentLookup + '/index.js',
      currentLookup + '/index.json',
    ];

    // Iterate through possibilities to find a match in the registry or aliases.
    for (let i = 0; i < possiblePaths.length; i++) {
      const testPath = possiblePaths[i];
      if (depLoader.registry.hasOwnProperty(testPath)) {
        return testPath; // Found in the primary registry.
      }
      if (depLoader.moduleMaps.hasOwnProperty(testPath)) {
        return depLoader.moduleMaps[testPath]; // Found via an alias.
      }
    }
    return null; // No match found.
  };

  /**
   * Normalizes a `targetPath` relative to a `basePath`.
   * Handles '.' and '..' segments in paths.
   *
   * @param {string} basePath - The current working directory path.
   * @param {string} targetPath - The path to normalize.
   * @returns {string} The normalized path.
   * @private
   */
  depLoader.standardizePath = function (basePath, targetPath) {
    const resultingSegments = [];

    // If the target path is absolute or clearly not relative, return it directly.
    if (!targetPath.startsWith('.')) {
      return targetPath;
    }

    const baseParts = basePath.split('/');
    const targetParts = targetPath.split('/');

    for (let j = 0; j < targetParts.length; ++j) {
      const part = targetParts[j];
      if (part === '..') {
        baseParts.pop(); // Go up one directory.
      } else if (part !== '.' && part !== '') {
        resultingSegments.push(part); // Add valid segment.
      }
    }

    return baseParts.concat(resultingSegments).join('/');
  };

  /**
   * Registers a module definition with the loader.
   *
   * @param {string} moduleId - The unique identifier for the module.
   * @param {Function} moduleFactory - The function that defines the module's logic.
   * @private
   */
  depLoader.addDefinition = function (moduleId, moduleFactory) {
    depLoader.registry[moduleId] = moduleFactory;
  };

  /**
   * Creates an alias from one module identifier to another.
   *
   * @param {string} originalId - The canonical identifier of the module.
   * @param {string} aliasId - The new alias to map to the original module.
   * @private
   */
  depLoader.createAlias = function (originalId, aliasId) {
    if (!depLoader.registry.hasOwnProperty(originalId)) {
      throw new Error(`Cannot create alias for "${originalId}", as it is not a registered module.`);
    }
    depLoader.moduleMaps[aliasId] = originalId;
  };

  /**
   * Generates a module loader function that resolves paths relative to a given parent module.
   *
   * @param {string} contextPath - The path of the parent module.
   * @returns {Function} A new loader function.
   * @private
   */
  depLoader.createRelativeLoader = function (contextPath) {
    // Calculate the base path for relative lookups (e.g., '..').
    const normalizedContext = depLoader.standardizePath(contextPath, '..');

    /**
     * Helper function to find the last occurrence of an element in an array.
     *
     * @param {Array} collection - The array to search.
     * @param {*} searchItem - The item to find.
     * @returns {number} The index of the last occurrence, or -1 if not found.
     */
    function findLastIndex(collection, searchItem) {
      let k = collection.length;
      while (k--) {
        if (collection[k] === searchItem) return k;
      }
      return -1;
    }

    /**
     * The generated relative module loader.
     *
     * @param {string} requestedPath - The path to load, relative to the parent.
     * @returns {object} The exports of the loaded module.
     */
    function scopedLoader(requestedPath) {
      const finalResolvedPath = scopedLoader.resolve(requestedPath);
      // Delegate to the main loader, providing context for error messages.
      return depLoader(finalResolvedPath, contextPath, requestedPath);
    }

    /**
     * Resolves a path relative to the `contextPath` for the `scopedLoader`.
     *
     * @param {string} subPath - The path to resolve.
     * @returns {string} The fully resolved module identifier.
     */
    scopedLoader.resolve = function (subPath) {
      if (subPath.startsWith('/')) {
        return subPath.substring(1); // Absolute path.
      }
      if (subPath.startsWith('.')) {
        return depLoader.standardizePath(normalizedContext, subPath); // Relative path.
      }

      // Special handling for "deps" convention:
      // Try to resolve dependencies by looking in a 'deps' directory
      // relative to the nearest 'deps' segment in the context path, or from the root.
      const contextSegments = contextPath.split('/');
      let depsIndex = findLastIndex(contextSegments, 'deps');
      if (depsIndex === -1) {
        depsIndex = 0; // If no 'deps' found, start from root.
      } else {
        depsIndex++; // If 'deps' found, start after it.
      }

      // Construct the 'deps' relative path.
      const basePathForDeps = contextSegments.slice(0, depsIndex).join('/');
      const fullDepsPath = basePathForDeps + (basePathForDeps ? '/' : '') + 'deps/' + subPath;
      return fullDepsPath;
    };

    /**
     * Checks if a module is registered and resolvable via this relative loader.
     *
     * @param {string} targetPath - The path to check.
     * @returns {boolean} True if the module exists, false otherwise.
     */
    scopedLoader.exists = function (targetPath) {
      const resolvedTarget = scopedLoader.resolve(targetPath);
      return depLoader.registry.hasOwnProperty(resolvedTarget) || depLoader.moduleMaps.hasOwnProperty(resolvedTarget);
    };

    return scopedLoader;
  };

  // --- Module Definitions Start Here ---

  depLoader.addDefinition('component-event/index.js', function (moduleExports, localDepLoader, moduleObject) {
    /**
     * Binds an event listener to an HTML element.
     *
     * @param {Element} targetElement - The DOM element to attach the listener to.
     * @param {string} eventType - The type of event (e.g., 'click', 'mouseover').
     * @param {Function} handlerFunction - The callback function to execute.
     * @param {boolean} [useCapture=false] - Whether to use capture phase.
     * @returns {Function} The handler function provided.
     * @public
     */
    moduleExports.add = function (targetElement, eventType, handlerFunction, useCapture) {
      if (targetElement.addEventListener) {
        targetElement.addEventListener(eventType, handlerFunction, useCapture);
      } else if (targetElement.attachEvent) {
        // IE < 9 support
        targetElement.attachEvent('on' + eventType, handlerFunction);
      } else {
        // Fallback for older browsers (not strictly equivalent, but best effort)
        // Note: This simple assignment will overwrite existing handlers.
        // For a full polyfill, more complex logic would be needed.
        targetElement['on' + eventType] = handlerFunction;
      }
      return handlerFunction;
    };

    /**
     * Removes an event listener from an HTML element.
     *
     * @param {Element} targetElement - The DOM element to remove the listener from.
     * @param {string} eventType - The type of event.
     * @param {Function} handlerFunction - The callback function to remove.
     * @param {boolean} [useCapture=false] - Whether capture phase was used during binding.
     * @returns {Function} The handler function provided.
     * @public
     */
    moduleExports.remove = function (targetElement, eventType, handlerFunction, useCapture) {
      if (targetElement.removeEventListener) {
        targetElement.removeEventListener(eventType, handlerFunction, useCapture);
      } else if (targetElement.detachEvent) {
        // IE < 9 support
        targetElement.detachEvent('on' + eventType, handlerFunction);
      } else {
        // Fallback for older browsers
        if (targetElement['on' + eventType] === handlerFunction) {
          targetElement['on' + eventType] = null;
        }
      }
      return handlerFunction;
    };
  });

  depLoader.addDefinition('component-event-manager/index.js', function (moduleExports, localDepLoader, moduleObject) {
    /**
     * Expose the `EventBus` class.
     */
    moduleObject.moduleExports = EventBus;

    /**
     * Initializes a new `EventBus` instance.
     * This manager facilitates binding and unbinding multiple events to a target object,
     * routing them to methods on a specified handler object.
     *
     * @param {object} eventSource - The object that will emit the events (e.g., a DOM element).
     * @param {object} eventHandler - The object whose methods will be called when events occur.
     * @public
     */
    function EventBus(eventSource, eventHandler) {
      if (!(this instanceof EventBus)) {
        return new EventBus(eventSource, eventHandler);
      }
      this.eventSource = eventSource;
      this.eventHandler = eventHandler;
      this._activeBindings = {}; // Stores { eventType: { methodName: callbackFn } }
      this._customBindHook = null; // Optional external bind function.
      this._customUnbindHook = null; // Optional external unbind function.
    }

    /**
     * Sets a custom function to be called when an event is bound.
     * This allows external libraries to manage the actual event subscription.
     *
     * @param {Function} bindFn - The function `(eventType, handler)` to call for binding.
     * @returns {EventBus} The current EventBus instance for chaining.
     * @public
     */
    EventBus.prototype.onBindCustom = function (bindFn) {
      this._customBindHook = bindFn;
      return this;
    };

    /**
     * Sets a custom function to be called when an event is unbound.
     *
     * @param {Function} unbindFn - The function `(eventType, handler)` to call for unbinding.
     * @returns {EventBus} The current EventBus instance for chaining.
     * @public
     */
    EventBus.prototype.onUnbindCustom = function (unbindFn) {
      this._customUnbindHook = unbindFn;
      return this;
    };

    /**
     * Binds an event `eventName` from `eventSource` to a method on `eventHandler`.
     * If `methodName` is not provided, it defaults to "on" + `eventName`.
     *
     * @param {string} eventName - The name of the event to bind (e.g., 'click', 'login').
     * @param {string} [methodName] - The name of the method on `eventHandler` to invoke.
     * @param {...any} [args] - Additional arguments to pass to the handler method after event args.
     * @returns {Function} The generated callback function that was bound.
     * @public
     */
    EventBus.prototype.attach = function (eventName, methodName) {
      const bindingCallback = this.createHandlerCallback.apply(this, arguments);

      if (this._customBindHook) {
        this._customBindHook(this.eventSource, eventName, bindingCallback);
      } else {
        // Default binding mechanism if no custom hook is provided.
        // This is a placeholder and would typically be implemented by the consumer
        // through onBindCustom, as the EventBus itself doesn't know how to bind.
        console.warn(`EventBus: No custom bind hook provided. Cannot bind event "${eventName}".`);
      }

      return bindingCallback;
    };

    /**
     * Internal method to create the actual callback function that will be bound to the event.
     * This callback ensures the `eventHandler` method is called with the correct context and arguments.
     *
     * @param {string} eventName - The event name.
     * @param {string} [methodName] - The method name on `eventHandler`.
     * @param {...any} [extraArgs] - Additional arguments to append to the handler call.
     * @returns {Function} The generated callback.
     * @private
     */
    EventBus.prototype.createHandlerCallback = function (eventName, methodName) {
      const targetHandler = this.eventHandler;
      const effectiveMethodName = methodName || 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1); // e.g., 'onClick'
      const additionalArguments = Array.prototype.slice.call(arguments, 2); // Capture any extra args passed to .attach

      // The actual function that will be registered as an event listener.
      const generatedCallback = function () {
        const eventArguments = Array.prototype.slice.call(arguments); // Arguments from the event itself.
        const allArguments = eventArguments.concat(additionalArguments);

        if (typeof targetHandler[effectiveMethodName] === 'function') {
          targetHandler[effectiveMethodName].apply(targetHandler, allArguments);
        } else {
          console.warn(`EventBus: Handler method "${effectiveMethodName}" not found on target object.`);
        }
      };

      // Store the binding for later unbinding.
      this._activeBindings[eventName] = this._activeBindings[eventName] || {};
      this._activeBindings[eventName][effectiveMethodName] = generatedCallback;

      return generatedCallback;
    };

    /**
     * Unbinds events. Can unbind a specific binding, all bindings for an event, or all manager bindings.
     *
     * @param {string} [eventName] - The event type to unbind from.
     * @param {string} [methodName] - The specific method name to unbind.
     * @returns {Function|undefined} The unbound callback function, or undefined if unbinding all.
     * @public
     */
    EventBus.prototype.detach = function (eventName, methodName) {
      const argCount = arguments.length;

      if (argCount === 0) {
        this.clearAllBindings();
        return undefined;
      }
      if (argCount === 1) {
        this.clearEventBindings(eventName);
        return undefined;
      }

      // Specific unbinding: eventName and methodName provided.
      const eventBindings = this._activeBindings[eventName];
      if (!eventBindings) return undefined; // No bindings for this event.

      const callbackToUnbind = eventBindings[methodName];
      if (!callbackToUnbind) return undefined; // No such specific binding.

      if (this._customUnbindHook) {
        this._customUnbindHook(this.eventSource, eventName, callbackToUnbind);
      } else {
        console.warn(`EventBus: No custom unbind hook provided. Cannot unbind event "${eventName}".`);
      }

      delete eventBindings[methodName]; // Remove from internal tracking.
      if (Object.keys(eventBindings).length === 0) {
        delete this._activeBindings[eventName]; // Clean up empty event entry.
      }
      return callbackToUnbind;
    };

    /**
     * Clears all event bindings managed by this EventBus instance.
     *
     * @private
     */
    EventBus.prototype.clearAllBindings = function () {
      for (const evtName in this._activeBindings) {
        if (this._activeBindings.hasOwnProperty(evtName)) {
          this.clearEventBindings(evtName);
        }
      }
    };

    /**
     * Clears all bindings associated with a specific event type.
     *
     * @param {string} eventName - The event type whose bindings should be cleared.
     * @private
     */
    EventBus.prototype.clearEventBindings = function (eventName) {
      const bindingsForEvent = this._activeBindings[eventName];
      if (!bindingsForEvent) return;

      // Iterate over a copy of keys to avoid issues with deleting during iteration.
      Object.keys(bindingsForEvent).forEach((methodName) => {
        this.detach(eventName, methodName); // Use detach to ensure custom hook is called.
      });
    };
  });

  depLoader.addDefinition('component-events/index.js', function (moduleExports, localDepLoader, moduleObject) {
    /**
     * Module dependencies.
     */
    const EventHandler = localDepLoader('event-manager');
    const domEvents = localDepLoader('event');

    /**
     * Returns a new event manager instance tailored for DOM events.
     * This utility simplifies binding and unbinding DOM events to a handler object.
     *
     * @param {Element} targetElement - The DOM element to manage events for.
     * @param {object} handlerObject - The object containing methods to call on event.
     * @returns {EventHandler} A configured EventHandler instance.
     */
    moduleObject.moduleExports = function (targetElement, handlerObject) {
      const domEventManager = new EventHandler(targetElement, handlerObject);

      // Configure the custom bind hook to use the 'domEvents' utility.
      domEventManager.onBindCustom(function (element, eventType, callback) {
        domEvents.add(element, eventType, callback, false); // Assuming no capture by default.
      });

      // Configure the custom unbind hook.
      domEventManager.onUnbindCustom(function (element, eventType, callback) {
        domEvents.remove(element, eventType, callback, false); // Assuming no capture by default.
      });

      return domEventManager;
    };
  });

  depLoader.addDefinition('component-has-translate3d/index.js', function (moduleExports, localDepLoader, moduleObject) {
    const transformProperty = localDepLoader('transform-property');

    // If no transform property is supported, then 3D transforms are definitely not.
    if (!transformProperty) {
      moduleObject.moduleExports = false;
      return;
    }

    // Mapping of JavaScript style properties to their CSS equivalents.
    const cssPropMap = {
      webkitTransform: '-webkit-transform',
      OTransform: '-o-transform',
      msTransform: '-ms-transform',
      MozTransform: '-moz-transform',
      transform: 'transform',
    };

    // Check if `document` is available, as this module is DOM-dependent.
    if (typeof document === 'undefined' || !document.body) {
      moduleObject.moduleExports = false; // Cannot check without a DOM.
      return;
    }

    // Create a temporary element to test for 3D transform support.
    const testElement = document.createElement('div');
    // Set a 3D transform value to the detected transform property.
    testElement.style[transformProperty] = 'translate3d(1px,1px,1px)';

    // Append to body to ensure computed styles can be retrieved.
    document.body.appendChild(testElement);

    // Retrieve the computed style and check if the browser retained the 3D value.
    const computedTransformValue = window
      .getComputedStyle(testElement)
      .getPropertyValue(cssPropMap[transformProperty]);

    // Clean up the temporary element.
    document.body.removeChild(testElement);

    // Determine support: value must exist, not be empty, and not be 'none'.
    const has3DSupport =
      computedTransformValue != null && computedTransformValue.length > 0 && computedTransformValue !== 'none';

    moduleObject.moduleExports = has3DSupport;
  });

  depLoader.addDefinition('component-transform-property/index.js', function (moduleExports, localDepLoader, moduleObject) {
    // List of potential CSS transform properties across different browsers.
    const potentialTransformProps = [
      'webkitTransform', // Chrome, Safari
      'MozTransform', // Firefox
      'msTransform', // IE
      'OTransform', // Opera (older)
      'transform', // Standard
    ];

    // Create a dummy DOM element to test for property support.
    const tempElement = document.createElement('p');
    let supportedProperty = null;

    // Iterate through the list and check if the property exists on the element's style object.
    for (let k = 0; k < potentialTransformProps.length; k++) {
      const currentProp = potentialTransformProps[k];
      if (tempElement.style[currentProp] !== undefined) {
        // If the property is found, store it and break the loop.
        supportedProperty = currentProp;
        break;
      }
    }

    // Export the detected transform property name (e.g., 'transform' or 'webkitTransform').
    // If none are found, it will export null.
    moduleObject.moduleExports = supportedProperty;
  });

  depLoader.addDefinition('jonykrause-translate/index.js', function (moduleExports, localDepLoader, moduleObject) {
    /**
     * Dependencies for CSS transform detection.
     */
    const cssTransformProp = localDepLoader('transform-property');
    const supports3D = localDepLoader('has-translate3d');

    /**
     * Export the main translation utility function.
     */
    moduleObject.moduleExports = applyTranslation;

    /**
     * Applies a 2D or 3D translation to a given DOM element.
     * It intelligently uses `translate3d` if supported, otherwise falls back to `translate`.
     *
     * @param {Element} targetElement - The DOM element to translate.
     * @param {number} xOffset - The horizontal translation value.
     * @param {number} yOffset - The vertical translation value.
     * @param {string} [unit='px'] - The unit for the translation values (e.g., 'px', '%').
     * @public
     */
    function applyTranslation(targetElement, xOffset, yOffset, unit) {
      const translationUnit = unit || 'px';

      // Ensure a transform property was detected.
      if (typeof cssTransformProp === 'string' && targetElement && targetElement.style) {
        let transformValue;
        if (supports3D) {
          // Use hardware-accelerated 3D transform if available.
          transformValue = `translate3d(${xOffset}${translationUnit}, ${yOffset}${translationUnit}, 0)`;
        } else {
          // Fallback to 2D transform.
          transformValue = `translate(${xOffset}${translationUnit}, ${yOffset}${translationUnit})`;
        }
        targetElement.style[cssTransformProp] = transformValue;
      } else {
        // Fallback for no transform support or invalid element.
        // This is a simplified fallback; a real-world scenario might adjust `left`/`top`.
        console.warn('Translate: CSS transform property not available or invalid element provided.', {
          element: targetElement,
          x: xOffset,
          y: yOffset,
        });
      }
    }
  });
})();