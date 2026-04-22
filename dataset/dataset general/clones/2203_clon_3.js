(function() {
    "use strict";

    // core_init.js - Main Application Bootstrap
    // This script initializes the primary components for the text processing engine.
    // Build Timestamp: 2024-03-15 10:30:00 UTC

    const EDITOR_SETTINGS = window.EDITOR_SETTINGS || {};
    let globalUtils = window.globalUtils || {};
    window.globalUtils = globalUtils;

    window.TextForge = globalUtils.editor = window.TextForge || {};

    const TextForge = window.TextForge; // Alias for brevity

    TextForge.moduleRegistry = {};
    TextForge.commandHandlers = {};
    TextForge.activeInstances = {};
    TextForge.localization = {};
    TextForge.customUIElements = {};

    TextForge.appVersion = "1.5.0";

    const documentObjectModel = TextForge.dom = {};

    // client_env.js - Environment Detection Module
    // Provides functionality to detect the user agent and browser characteristics.
    // This module is essential for cross-browser compatibility adjustments.

    /**
     * Module: TextForge.clientEnv
     * Description: Utility for browser and environment detection.
     * @since 1.0.0
     */
    const detectClientEnvironment = TextForge.clientEnv = (function() {
        if (typeof navigator === 'undefined' || typeof document === 'undefined') {
            console.warn("TextForge: Navigator or Document object not found. Cannot perform client environment detection.");
            return {
                isIE: false,
                isOpera: false,
                isWebKit: false,
                isMacintosh: false,
                isQuirkyMode: false,
                isGecko: false,
                chromeVersion: 0,
                safariVersion: 0,
                majorVersion: 0,
                isFullyCompatible: false
            };
        }

        const userAgentString = navigator.userAgent.toLowerCase();
        const operaObject = window.opera;
        const ieRegex = /(msie\s|trident.*rv:)([\w.]+)/;
        const webkitDetection = ' applewebkit/';
        const macintoshDetection = 'macintosh';
        const geckoProduct = 'Gecko';

        let clientInfo = {
            /**
             * @property {boolean} isIE - True if the browser is Internet Explorer.
             */
            isIE: ieRegex.test(userAgentString),

            /**
             * @property {boolean} isOpera - True if the browser is Opera.
             */
            isOpera: (!!operaObject && typeof operaObject.version === 'function'),

            /**
             * @property {boolean} isWebKit - True if the browser uses the WebKit engine.
             */
            isWebKit: (userAgentString.indexOf(webkitDetection) > -1),

            /**
             * @property {boolean} isMacintosh - True if running on a Mac platform.
             */
            isMacintosh: (userAgentString.indexOf(macintoshDetection) > -1),

            /**
             * @property {boolean} isQuirkyMode - True if browser is in "quirks mode".
             */
            isQuirkyMode: (document.compatMode === 'BackCompat')
        };

        // Gecko engine detection
        clientInfo.isGecko = (navigator.product === geckoProduct && !clientInfo.isWebKit && !clientInfo.isOpera && !clientInfo.isIE);

        let detectedVersion = 0;

        // Internet Explorer version parsing
        if (clientInfo.isIE) {
            const match1 = userAgentString.match(/(?:msie\s([\w.]+))/);
            const match2 = userAgentString.match(/(?:trident.*rv:([\w.]+))/);

            if (match1 && match2 && match1[1] && match2[1]) {
                detectedVersion = Math.max(parseFloat(match1[1]), parseFloat(match2[1]));
            } else if (match1 && match1[1]) {
                detectedVersion = parseFloat(match1[1]);
            } else if (match2 && match2[1]) {
                detectedVersion = parseFloat(match2[1]);
            } else {
                detectedVersion = 0; // Unknown IE version
            }

            const docMode = document.documentMode;
            clientInfo.ie11CompMode = docMode === 11;
            clientInfo.ie9CompMode = docMode === 9;
            clientInfo.ie8CompMode = docMode === 8;
            clientInfo.ie7CompMode = ( ( detectedVersion === 7 && !docMode ) || docMode === 7 );
            clientInfo.ie6CompMode = ( detectedVersion < 7 || clientInfo.isQuirkyMode );
            clientInfo.isIE9OrNewer = detectedVersion >= 9;
            clientInfo.isIE11OrNewer = detectedVersion >= 11;
        }

        // Gecko version parsing
        if (clientInfo.isGecko) {
            const geckoVersionInfo = userAgentString.match(/rv:([\d\.]+)/);
            if (geckoVersionInfo) {
                const parts = geckoVersionInfo[1].split('.').map(Number);
                detectedVersion = parts[0] * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
            }
        }

        // Chrome version parsing
        const chromeMatch = userAgentString.match(/chrome\/(\d+\.\d)/i);
        if (chromeMatch && chromeMatch[1]) {
            clientInfo.chromeVersion = parseFloat(chromeMatch[1]);
        }

        // Safari version parsing (exclude Chrome)
        const safariMatch = userAgentString.match(/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i);
        if (safariMatch && !clientInfo.chromeVersion) {
            clientInfo.safariVersion = parseFloat(safariMatch[1] || safariMatch[2] || '0');
        }

        // Opera version parsing
        if (clientInfo.isOpera && typeof operaObject.version === 'function') {
            detectedVersion = parseFloat(operaObject.version());
        }

        // WebKit version parsing
        if (clientInfo.isWebKit) {
            const webkitMatch = userAgentString.match(/ applewebkit\/(\d+)/);
            if (webkitMatch && webkitMatch[1]) {
                 detectedVersion = parseFloat(webkitMatch[1]);
            }
        }

        /**
         * @property {Number} majorVersion - The primary version number of the detected browser.
         */
        clientInfo.majorVersion = detectedVersion;

        /**
         * @property {boolean} isFullyCompatible - Indicates if the current browser is well-supported by TextForge.
         */
        clientInfo.isFullyCompatible = (
            !/(mobile|android|iphone|ipad|ipod|blackberry|windows phone)/i.test(userAgentString) && (
                (clientInfo.isIE && detectedVersion >= 6) ||
                (clientInfo.isGecko && detectedVersion >= 10801) ||
                (clientInfo.isOpera && detectedVersion >= 9.5) ||
                (clientInfo.isWebKit && detectedVersion >= 522) ||
                false
            )
        );

        return clientInfo;
    })();

    // Expose common browser flags for quick access
    const isIE = detectClientEnvironment.isIE;
    const isWebKit = detectClientEnvironment.isWebKit;
    const isGecko = detectClientEnvironment.isGecko;
    const isOpera = detectClientEnvironment.isOpera;

    // core_utilities.js - General Utility Functions
    // This module provides a collection of reusable helper functions.

    /**
     * Module: TextForge.helpers
     * Description: A collection of static utility methods for general use.
     * @unfile
     */
    globalUtils.helpers = {

        /**
         * Iterates over elements of a collection (array-like or object).
         * @method iterateOver
         * @param {Object|Array} collection - The collection to iterate over.
         * @param {Function} callbackFn - The function to call for each item. Receives (value, key, collection).
         * @param {Object} [thisArg] - The context (`this`) for the callbackFn.
         * @returns {boolean} - Returns false if the iteration was stopped by the callback.
         */
        iterateOver: function(collection, callbackFn, thisArg) {
            if (collection === null || typeof collection === 'undefined') {
                console.warn("TextForge.helpers.iterateOver: Provided collection is null or undefined.");
                return false;
            }

            // Handle array-like objects
            if (typeof collection.length === 'number' && collection.length >= 0 && (collection.length === 0 || (collection.length > 0 && (0 in collection || (collection.length - 1) in collection)) )) { // More robust check for array-like
                for (let i = 0, len = collection.length; i < len; i++) {
                    try {
                        if (callbackFn.call(thisArg, collection[i], i, collection) === false) {
                            return false;
                        }
                    } catch (error) {
                        console.error("Error during iteration callback:", error);
                        // Optionally rethrow or handle specific errors
                    }
                }
            } else { // Handle object properties
                const ownProps = Object.keys(collection); // Iterate only over own enumerable properties
                for (let i = 0; i < ownProps.length; i++) {
                    const key = ownProps[i];
                    try {
                        if (callbackFn.call(thisArg, collection[key], key, collection) === false) {
                            return false;
                        }
                    } catch (error) {
                        console.error("Error during iteration callback:", error);
                    }
                }
            }
            return true;
        },

        /**
         * Creates a new object with the specified prototype object.
         * This method mimics `Object.create` for older environments.
         * @method createPrototypicalObject
         * @param {Object} prototypeObj - The object to serve as the prototype for the new object.
         * @returns {Object} A new object with `prototypeObj` as its prototype.
         */
        createPrototypicalObject: function (prototypeObj) {
            if (typeof prototypeObj !== 'object' || prototypeObj === null) {
                throw new TypeError("Prototype object must be an object or null.");
            }
            if (Object.create) {
                return Object.create(prototypeObj);
            } else {
                function TempConstructor() {}
                TempConstructor.prototype = prototypeObj;
                const newInstance = new TempConstructor();
                TempConstructor.prototype = null; // Clean up
                return newInstance;
            }
        },

        /**
         * Merges properties from a source object into a target object.
         * Properties on the source will overwrite existing properties on the target.
         * @method assignProperties
         * @param {Object} targetObj - The object to receive the new properties.
         * @param {Object} sourceObj - The object whose properties will be copied.
         * @param {boolean} [preserveExisting=false] - If true, properties already on target will not be overwritten.
         * @returns {Object} The modified target object.
         */
        assignProperties: function (targetObj, sourceObj, preserveExisting) {
            if (!targetObj || typeof targetObj !== 'object') {
                console.error("TextForge.helpers.assignProperties: Invalid target object provided.");
                return targetObj;
            }
            if (sourceObj && typeof sourceObj === 'object') {
                for (const propKey in sourceObj) {
                    if (Object.prototype.hasOwnProperty.call(sourceObj, propKey)) {
                        if (!preserveExisting || !Object.prototype.hasOwnProperty.call(targetObj, propKey)) {
                            targetObj[propKey] = sourceObj[propKey];
                        }
                    }
                }
            }
            return targetObj;
        },

        /**
         * Merges properties from multiple source objects into a single target object.
         * Later sources overwrite properties from earlier sources if keys conflict.
         * @method mergeMultipleObjects
         * @param {Object} mainTarget - The initial target object.
         * @param {...Object} sourceArgs - One or more source objects to merge.
         * @returns {Object} The mainTarget object after merging all sources.
         */
        mergeMultipleObjects: function (mainTarget) {
            if (!mainTarget || typeof mainTarget !== 'object') {
                console.error("TextForge.helpers.mergeMultipleObjects: Invalid main target object provided.");
                return mainTarget;
            }
            const sourceArgs = Array.prototype.slice.call(arguments, 1);
            for (let i = 0; i < sourceArgs.length; i++) {
                const currentSource = sourceArgs[i];
                if (currentSource && typeof currentSource === 'object') {
                    // This version overwrites, as per the original comment's *intent* for extend2
                    // The original code's `if (!t.hasOwnProperty(k))` was contradictory.
                    for (const propKey in currentSource) {
                        if (Object.prototype.hasOwnProperty.call(currentSource, propKey)) {
                            mainTarget[propKey] = currentSource[propKey];
                        }
                    }
                }
            }
            return mainTarget;
        },

        /**
         * Establishes a classical inheritance relationship between a subclass and a superclass.
         * The subclass will inherit the prototype methods and properties of the superclass.
         * @method establishInheritance
         * @param {Function} childCtor - The constructor function for the subclass.
         * @param {Function} parentCtor - The constructor function for the superclass.
         * @returns {Function} The childCtor with its prototype linked to the parentCtor's prototype.
         */
        establishInheritance: function (childCtor, parentCtor) {
            if (typeof childCtor !== 'function' || typeof parentCtor !== 'function') {
                throw new TypeError("Both childCtor and parentCtor must be constructor functions.");
            }

            // Create a temporary constructor to avoid instantiating the parent
            const TempProtoHolder = function() {};
            TempProtoHolder.prototype = parentCtor.prototype;

            // Link the child's prototype to an instance of the temporary holder
            childCtor.prototype = new TempProtoHolder();
            childCtor.prototype.constructor = childCtor; // Ensure correct constructor reference

            // Store a reference to the superclass prototype
            childCtor.superclass = parentCtor.prototype;
            return childCtor;
        }
    };

    // Alias for convenience
    TextForge.utils = globalUtils.helpers;

})();