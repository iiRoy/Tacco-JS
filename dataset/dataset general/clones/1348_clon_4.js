(function() {

    // --- Core Resource Management System ---

    // A unique symbol to mark a resource as being currently loaded, preventing infinite loops in circular dependencies.
    const CURRENTLY_LOADING_MARKER = Symbol('currently_loading');

    /**
     * Custom error class for when a resource cannot be found or loaded.
     */
    class ResourceFailure extends Error {
        constructor(message, requestedKey, originPoint) {
            super(message);
            this.name = 'ResourceFailure';
            this.requestedKey = requestedKey;
            this.originPoint = originPoint;
            this.isResourceRetrievalError = true;
        }
    }

    /**
     * Finds the last occurrence of an item in an array.
     * @param {Array} collection - The array to search.
     * @param {*} itemToFind - The item to locate.
     * @returns {number} The index of the last occurrence, or -1 if not found.
     */
    function findLastElementIndex(collection, itemToFind) {
        let index = collection.length;
        while (index--) {
            if (collection[index] === itemToFind) return index;
        }
        return -1;
    }

    /**
     * Manages the registration, resolution, and loading of various code units (modules).
     */
    class CodeUnitManager {
        // Private fields to store unit definitions, aliases, and track active load operations.
        #unitDefinitions = new Map(); // Stores { definition: Function, content: Object | null, [CURRENTLY_LOADING_MARKER]: boolean }
        #keyAliases = new Map();      // Maps alias keys to canonical keys
        #loadingKeys = new Set();     // Tracks keys of units currently in the process of being loaded

        /**
         * Retrieves the exported content of a code unit.
         *
         * @param {string} unitKey - The identifier of the unit to retrieve.
         * @param {string} [requestingUnit='<root>'] - The identifier of the unit making the request.
         * @param {string} [originalRequest] - The original, un-resolved key provided by the caller.
         * @returns {object} The exported content of the unit.
         * @throws {ResourceFailure} If the unit cannot be found or loaded.
         */
        retrieveUnit(unitKey, requestingUnit = '<root>', originalRequest) {
            const finalKey = this.#resolveUnitKey(unitKey);

            if (finalKey === null) {
                const errorKey = originalRequest || unitKey;
                throw new ResourceFailure(
                    `Failed to retrieve "${errorKey}" from "${requestingUnit}"`,
                    errorKey,
                    requestingUnit
                );
            }

            let unitEntry = this.#unitDefinitions.get(finalKey);

            // Handle circular dependencies: if a unit is already being loaded, return its partially constructed output.
            if (unitEntry && unitEntry[CURRENTLY_LOADING_MARKER]) {
                return unitEntry.content;
            }

            // If the unit has not been loaded yet
            if (!unitEntry || unitEntry.content === null) {
                const unitPackage = {
                    output: {},
                    isClientSide: true, // Mimics original `mod.client = true`
                    isComponentModule: true // Mimics original `mod.component = true`
                };

                // Mark as currently loading to detect circular dependencies
                if (unitEntry) {
                    unitEntry[CURRENTLY_LOADING_MARKER] = true;
                } else {
                    // Create a placeholder if it wasn't registered yet (e.g., for aliases pointing to non-existent but later registered definitions)
                    unitEntry = { definition: null, content: null, [CURRENTLY_LOADING_MARKER]: true };
                    this.#unitDefinitions.set(finalKey, unitEntry);
                }

                try {
                    // Execute the unit's definition function
                    const definitionExecutor = unitEntry.definition || this.#unitDefinitions.get(finalKey).definition;
                    definitionExecutor.call(
                        undefined, // Context for the module function; original uses global 'this', typically not relied upon.
                        unitPackage.output,
                        this.#createRelativeFetcher(finalKey),
                        unitPackage
                    );
                    unitEntry.content = unitPackage.output;
                } finally {
                    // Clear the loading marker once the unit is processed
                    delete unitEntry[CURRENTLY_LOADING_MARKER];
                }
            }

            return unitEntry.content;
        }

        /**
         * Determines the canonical, full key for a given resource identifier.
         *
         * @param {string} rawIdentifier - The initial identifier provided.
         * @returns {string|null} The canonical key or null if no matching unit is found.
         */
        #resolveUnitKey(rawIdentifier) {
            let processedIdentifier = rawIdentifier.startsWith('/') ? rawIdentifier.slice(1) : rawIdentifier;

            const possibleExtensions = [
                '',
                '.js',
                '.json',
                '/index.js',
                '/index.json'
            ];

            // Iterate through possible keys (identifier + extension/index)
            const foundCandidate = possibleExtensions.find(ext => {
                const testKey = processedIdentifier + ext;
                return this.#unitDefinitions.has(testKey) || this.#keyAliases.has(testKey);
            });

            if (foundCandidate) {
                const matchedKey = processedIdentifier + foundCandidate;
                // Return the aliased key if it exists, otherwise the matched key
                return this.#keyAliases.get(matchedKey) || matchedKey;
            }

            return null;
        }

        /**
         * Normalizes a path, resolving '.' and '..' segments.
         *
         * @param {string} currentBasePath - The starting path.
         * @param {string} targetRelativePath - The path to resolve relative to the base.
         * @returns {string} The normalized, absolute path.
         */
        #normalizePathSegments(currentBasePath, targetRelativePath) {
            if (!targetRelativePath.startsWith('.')) return targetRelativePath;

            const baseSegments = currentBasePath.split('/');
            const relativeSegments = targetRelativePath.split('/');
            const finalSegments = [];

            relativeSegments.forEach(segment => {
                if (segment === '..') {
                    baseSegments.pop(); // Go up one level
                } else if (segment !== '.' && segment !== '') {
                    finalSegments.push(segment); // Add valid segments
                }
            });

            return baseSegments.concat(finalSegments).join('/');
        }

        /**
         * Stores a code unit's definition function.
         *
         * @param {string} key - The unique identifier for the unit.
         * @param {Function} definitionFunction - The function that defines the unit's exports.
         */
        registerUnit(key, definitionFunction) {
            this.#unitDefinitions.set(key, { definition: definitionFunction, content: null });
        }

        /**
         * Establishes an alias from one key to another existing unit key.
         *
         * @param {string} originalKey - The key of the existing unit.
         * @param {string} aliasKey - The new alias key.
         * @throws {Error} If the original unit key does not exist.
         */
        createKeyAlias(originalKey, aliasKey) {
            if (!this.#unitDefinitions.has(originalKey)) {
                throw new Error(`Cannot alias "${originalKey}", as it is not a registered unit.`);
            }
            this.#keyAliases.set(aliasKey, originalKey);
        }

        /**
         * Creates a function for fetching units relative to a given base path.
         *
         * @param {string} currentUnitKey - The base path for relative resolutions.
         * @returns {Function} A specialized fetcher function.
         */
        #createRelativeFetcher(currentUnitKey) {
            const parentAdjustedPath = this.#normalizePathSegments(currentUnitKey, '..');
            const managerInstance = this; // Capture 'this' for internal use

            /**
             * The relative fetcher function.
             * @param {string} requestedRelativeKey - The key to fetch, relative to the current context.
             * @returns {object} The exported content of the requested unit.
             */
            const relativeFetcher = function(requestedRelativeKey) {
                const resolvedRelativeKey = relativeFetcher.resolve(requestedRelativeKey);
                return managerInstance.retrieveUnit(resolvedRelativeKey, currentUnitKey, requestedRelativeKey);
            };

            /**
             * Resolves a relative key to its canonical form within the current context.
             * @param {string} requestedRelativeKey - The relative key.
             * @returns {string} The resolved canonical key.
             */
            relativeFetcher.resolve = function(requestedRelativeKey) {
                const firstChar = requestedRelativeKey.charAt(0);
                if (firstChar === '/') return requestedRelativeKey.slice(1); // Absolute path
                if (firstChar === '.') return managerInstance.#normalizePathSegments(parentAdjustedPath, requestedRelativeKey); // Relative path

                // Special handling for 'deps' directories
                const keySegments = currentUnitKey.split('/');
                let depsFolderIdx = findLastElementIndex(keySegments, 'deps');
                if (depsFolderIdx === -1) depsFolderIdx = 0; // If no 'deps' folder, resolve from root

                const baseForDeps = keySegments.slice(0, depsFolderIdx + 1).join('/');
                return `${baseForDeps}/deps/${requestedRelativeKey}`;
            };

            /**
             * Checks if a unit exists at a given relative path.
             * @param {string} requestedRelativeKey - The relative key.
             * @returns {boolean} True if the unit exists, false otherwise.
             */
            relativeFetcher.exists = function(requestedRelativeKey) {
                return managerInstance.#unitDefinitions.has(relativeFetcher.resolve(requestedRelativeKey));
            };

            return relativeFetcher;
        }
    }

    // Initialize the global code unit manager
    const globalCodeUnitManager = new CodeUnitManager();

    // Expose the primary unit retrieval function globally
    window.getCodeUnit = (key) => globalCodeUnitManager.retrieveUnit(key);

    // Expose registration and aliasing methods
    window.getCodeUnit.register = (key, definition) => globalCodeUnitManager.registerUnit(key, definition);
    window.getCodeUnit.alias = (from, to) => globalCodeUnitManager.createKeyAlias(from, to);


    // --- Bundled Code Unit Definitions ---

    // Unit: component-event/index.js (renamed to DomEventUtilities)
    window.getCodeUnit.register("component-event/index.js", function(output, fetchRelative, unitPkg){
        /**
         * Attaches an event listener to a DOM element.
         *
         * @param {Element} domElement - The target DOM element.
         * @param {String} eventType - The type of event (e.g., 'click').
         * @param {Function} eventHandler - The function to call when the event occurs.
         * @param {Boolean} useCapture - Whether to use capture phase.
         * @return {Function} The eventHandler function.
         */
        output.attachEvent = function(domElement, eventType, eventHandler, useCapture){
            if (domElement.addEventListener) {
                domElement.addEventListener(eventType, eventHandler, useCapture);
            } else {
                domElement.attachEvent('on' + eventType, eventHandler); // IE < 9
            }
            return eventHandler;
        };

        /**
         * Detaches an event listener from a DOM element.
         *
         * @param {Element} domElement - The target DOM element.
         * @param {String} eventType - The type of event.
         * @param {Function} eventHandler - The function to remove.
         * @param {Boolean} useCapture - Whether to use capture phase.
         * @return {Function} The eventHandler function.
         */
        output.detachEvent = function(domElement, eventType, eventHandler, useCapture){
            if (domElement.removeEventListener) {
                domElement.removeEventListener(eventType, eventHandler, useCapture);
            } else {
                domElement.detachEvent('on' + eventType, eventHandler); // IE < 9
            }
            return eventHandler;
        };
    });

    // Unit: component-event-manager/index.js (renamed to EventListenerCoordinator)
    window.getCodeUnit.register("component-event-manager/index.js", function(output, fetchRelative, unitPkg){
        /**
         * Expose `EventListenerCoordinator`.
         */
        unitPkg.output = EventListenerCoordinator;

        /**
         * Manages event subscriptions for a given target and callback object.
         *
         * @param {Object} eventTarget - The object or element that emits events.
         * @param {Object} callbackObject - The object whose methods will be called.
         */
        function EventListenerCoordinator(eventTarget, callbackObject) {
            this.eventTarget = eventTarget;
            this.callbackObject = callbackObject;
            this._managedSubscriptions = new Map(); // Map<eventType, Map<methodName, callbackFunction>>
        }

        /**
         * Sets a callback to be invoked when a new subscription is added.
         *
         * @param {Function} hookFunction - The function to call.
         * @return {EventListenerCoordinator} self
         */
        EventListenerCoordinator.prototype.onSubscriptionAdded = function(hookFunction){
            this._addedHook = hookFunction;
            return this;
        };

        /**
         * Sets a callback to be invoked when a subscription is removed.
         *
         * @param {Function} hookFunction - The function to call.
         * @return {EventListenerCoordinator} self
         */
        EventListenerCoordinator.prototype.onSubscriptionRemoved = function(hookFunction){
            this._removedHook = hookFunction;
            return this;
        };

        /**
         * Subscribes to an `eventType` on the `eventTarget`.
         * The `callbackObject` will have a method invoked.
         *
         * @param {String} eventType - The name of the event.
         * @param {String} [methodName] - The name of the method on `callbackObject`. Defaults to 'on' + eventType.
         * @return {Function} The generated callback function.
         */
        EventListenerCoordinator.prototype.addSubscription = function(eventType, methodName){
            const generatedFn = this.#createSubscriptionProxy.apply(this, arguments);
            if (this._addedHook) this._addedHook(eventType, methodName, generatedFn);
            this._internalBinder(eventType, generatedFn);
            return generatedFn;
        };

        /**
         * Creates and stores the proxy callback function for a subscription.
         *
         * @param {String} eventType
         * @param {String} methodName
         * @return {Function} The generated proxy callback.
         * @private
         */
        EventListenerCoordinator.prototype['#createSubscriptionProxy'] = function(eventType, methodName){
            const receiver = this.callbackObject;
            const chosenMethod = methodName || 'on' + eventType;
            const additionalArgs = Array.from(arguments).slice(2);

            // The actual function that will be attached to the event listener
            const proxyCallback = function() {
                const eventArgs = Array.from(arguments).concat(additionalArgs);
                receiver[chosenMethod].apply(receiver, eventArgs);
            };

            // Store the subscription
            let eventMethodMap = this._managedSubscriptions.get(eventType);
            if (!eventMethodMap) {
                eventMethodMap = new Map();
                this._managedSubscriptions.set(eventType, eventMethodMap);
            }
            eventMethodMap.set(chosenMethod, proxyCallback);

            return proxyCallback;
        };

        /**
         * Unsubscribes from events. Can remove a single subscription, all for an event type, or all managed.
         *
         * @param {String} [eventType] - The event type.
         * @param {String} [methodName] - The method name.
         * @return {Function|undefined} The removed callback function, or undefined.
         */
        EventListenerCoordinator.prototype.removeSubscription = function(eventType, methodName){
            if (arguments.length === 0) return this.clearAllSubscriptions();
            if (arguments.length === 1) return this.clearEventTypeSubscriptions(eventType);

            const methodMap = this._managedSubscriptions.get(eventType);
            if (!methodMap) return;

            const callbackToUnbind = methodMap.get(methodName);
            if (!callbackToUnbind) return;

            if (this._removedHook) this._removedHook(eventType, methodName, callbackToUnbind);
            this._internalUnbinder(eventType, callbackToUnbind);
            methodMap.delete(methodName);
            if (methodMap.size === 0) {
                this._managedSubscriptions.delete(eventType);
            }
            return callbackToUnbind;
        };

        /**
         * Clears all subscriptions managed by this coordinator.
         * @private
         */
        EventListenerCoordinator.prototype.clearAllSubscriptions = function(){
            for (let eventType of Array.from(this._managedSubscriptions.keys())) {
                this.clearEventTypeSubscriptions(eventType);
            }
        };

        /**
         * Clears all subscriptions for a specific event type.
         *
         * @param {String} eventType
         * @private
         */
        EventListenerCoordinator.prototype.clearEventTypeSubscriptions = function(eventType){
            const methodMap = this._managedSubscriptions.get(eventType);
            if (!methodMap) return;

            for (let methodName of Array.from(methodMap.keys())) {
                this.removeSubscription(eventType, methodName);
            }
        };

        // Placeholder methods to be overridden by an external factory for actual event binding/unbinding
        EventListenerCoordinator.prototype._internalBinder = function(e, f) {};
        EventListenerCoordinator.prototype._internalUnbinder = function(e, f) {};
    });

    // Unit: component-events/index.js (renamed to EventBindingFactory)
    window.getCodeUnit.register("component-events/index.js", function(output, fetchRelative, unitPkg){
        /**
         * Dependent modules.
         */
        const CoordinatorClass = fetchRelative('event-manager');
        const EventUtils = fetchRelative('event');

        /**
         * Factory function to create and configure an EventListenerCoordinator.
         */
        unitPkg.output = function(elementToObserve, handlerRecipient){
            const coordinatorInstance = new CoordinatorClass(elementToObserve, handlerRecipient);

            // Configure the coordinator's internal binder/unbinder methods
            coordinatorInstance._internalBinder = function(eventName, handlerFunc) {
                EventUtils.attachEvent(elementToObserve, eventName, handlerFunc);
            };
            coordinatorInstance._internalUnbinder = function(eventName, handlerFunc) {
                EventUtils.detachEvent(elementToObserve, eventName, handlerFunc);
            };

            return coordinatorInstance;
        };
    });

    // Unit: component-has-translate3d/index.js (renamed to ThreeDTransformSupport)
    window.getCodeUnit.register("component-has-translate3d/index.js", function(output, fetchRelative, unitPkg){
        const cssTransformProperty = fetchRelative('transform-property');
        if (!cssTransformProperty) {
            unitPkg.output = false; // No transform property found, so no 3D support
            return;
        }

        const cssPropertyMap = {
            webkitTransform: '-webkit-transform',
            OTransform: '-o-transform',
            msTransform: '-ms-transform',
            MozTransform: '-moz-transform',
            transform: 'transform'
        };

        let cached3dSupportResult = null; // Memoize the result

        /**
         * Performs a feature detection test to check for translate3d support.
         * The result is cached after the first execution.
         * @returns {boolean} True if translate3d is supported, false otherwise.
         */
        function checkTranslate3dCapability() {
            if (cached3dSupportResult !== null) return cached3dSupportResult;

            const testDiv = document.createElement('div');
            testDiv.style[cssTransformProperty] = 'translate3d(1px,1px,1px)';
            document.body.appendChild(testDiv); // Temporarily add to DOM to get computed style

            const computedValue = window.getComputedStyle(testDiv).getPropertyValue(cssPropertyMap[cssTransformProperty]);

            document.body.removeChild(testDiv); // Clean up

            cached3dSupportResult = (computedValue !== null && computedValue.length > 0 && computedValue !== 'none');
            return cached3dSupportResult;
        }

        unitPkg.output = checkTranslate3dCapability();
    });

    // Unit: component-transform-property/index.js (renamed to CssTransformPropertyDetector)
    window.getCodeUnit.register("component-transform-property/index.js", function(output, fetchRelative, unitPkg){
        const vendorPrefixedProperties = [
            'webkitTransform',
            'MozTransform',
            'msTransform',
            'OTransform',
            'transform'
        ];

        const dummyDomElement = document.createElement('p');
        let foundTransformProperty = null;

        // Iterate through the list to find the first supported CSS transform property
        for (const propertyName of vendorPrefixedProperties) {
            if (dummyDomElement.style[propertyName] !== undefined) {
                foundTransformProperty = propertyName;
                break;
            }
        }

        unitPkg.output = foundTransformProperty;
    });

    // Unit: jonykrause-translate/index.js (renamed to ElementPositioner)
    window.getCodeUnit.register("jonykrause-translate/index.js", function(output, fetchRelative, unitPkg){
        /**
         * Dependent modules.
         */
        const activeTransformProperty = fetchRelative('transform-property');
        const has3dFeature = fetchRelative('has-translate3d');

        /**
         * Expose `applyElementDisplacement`.
         */
        unitPkg.output = applyElementDisplacement;

        /**
         * Applies a 2D or 3D translation to a given DOM element.
         *
         * @param {Element} targetElement - The element to translate.
         * @param {Number} horizontalDisplacement - X-axis displacement.
         * @param {Number} verticalDisplacement - Y-axis displacement.
         * @param {String} [measurementUnit='px'] - The unit for displacement (e.g., 'px', '%', 'em').
         */
        function applyElementDisplacement(targetElement, horizontalDisplacement, verticalDisplacement, measurementUnit = 'px') {
            if (typeof activeTransformProperty === 'string') {
                if (has3dFeature) {
                    targetElement.style[activeTransformProperty] = `translate3d(${horizontalDisplacement}${measurementUnit},${verticalDisplacement}${measurementUnit}, 0)`;
                } else {
                    targetElement.style[activeTransformProperty] = `translate(${horizontalDisplacement}${measurementUnit},${verticalDisplacement}${measurementUnit})`;
                }
            }
        }
    });

})();