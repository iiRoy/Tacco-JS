/*
 * Flash Content Embedder Utility (derived from SWFObject 2.2)
 * This utility focuses on dynamic embedding of Flash objects.
 * Based on the MIT License.
 *
 * This version includes structural and stylistic modifications for Type III cloning.
 */

var contentEmbedder = (function() {

    // --- Private Constants and Initial State ---
    var UNDEFINED_TYPE_STR = "undefined";
    var OBJECT_TYPE_STR = "object";
    var FLASH_PLUGIN_NAME = "Shockwave Flash";
    var FLASH_ACTIVEX_ID = "ShockwaveFlash.ShockwaveFlash";
    var FLASH_MIME_TYPE_APP = "application/x-shockwave-flash";
    var EXPRESS_INSTALL_SWF_ID = "FlashInstallUtility"; // Renamed from EXPRESS_INSTALL_ID, though not used in this stripped version.

    var currentWindow = window;
    var currentDocument = document;
    var currentNavigator = navigator;

    var hasFlashPlugin = false; // Flag indicating if Flash plugin is detected
    var embeddedObjectIDs = []; // Stores IDs of dynamically embedded Flash objects

    /**
     * Internal utility for browser and Flash Player capability detection.
     * Executes immediately to gather initial environment data.
     * @returns {object} An object containing browser and player capabilities.
     */
    var browserCapabilities = (function() {
        var isW3CCompliantDOM = typeof currentDocument.getElementById !== UNDEFINED_TYPE_STR &&
                               typeof currentDocument.getElementsByTagName !== UNDEFINED_TYPE_STR &&
                               typeof currentDocument.createElement !== UNDEFINED_TYPE_STR;

        var userAgentLowercase = currentNavigator.userAgent.toLowerCase();
        var platformLowercase = currentNavigator.platform.toLowerCase();

        var isWindowsOS = platformLowercase ? /win/.test(platformLowercase) : /win/.test(userAgentLowercase);
        var isMacOS = platformLowercase ? /mac/.test(platformLowercase) : /mac/.test(userAgentLowercase);

        // WebKit version detection, returns version number or false
        var webkitVersion = /webkit/.test(userAgentLowercase) ? parseFloat(userAgentLowercase.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false;

        // Simplified IE detection, will be refined if Flash ActiveX is found.
        var isInternetExplorer = false; // Initial assumption, updated below if ActiveX is detected.

        var detectedPlayerVersion = [0, 0, 0]; // [major, minor, build]
        var pluginDescription = null; // Holds plugin description string

        // Check for Netscape-style plugins
        if (typeof currentNavigator.plugins !== UNDEFINED_TYPE_STR &&
            typeof currentNavigator.plugins[FLASH_PLUGIN_NAME] === OBJECT_TYPE_STR) {

            pluginDescription = currentNavigator.plugins[FLASH_PLUGIN_NAME].description;

            // Ensure plugin is enabled and description exists
            if (pluginDescription && !(typeof currentNavigator.mimeTypes !== UNDEFINED_TYPE_STR &&
                                        currentNavigator.mimeTypes[FLASH_MIME_TYPE_APP] &&
                                        !currentNavigator.mimeTypes[FLASH_MIME_TYPE_APP].enabledPlugin)) {
                hasFlashPlugin = true;
                isInternetExplorer = false; // If a Netscape-style plugin is found, it's not IE.

                // Parse version from description string
                pluginDescription = pluginDescription.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                detectedPlayerVersion[0] = parseInt(pluginDescription.replace(/^(.*)\..*$/, "$1"), 10);
                detectedPlayerVersion[1] = parseInt(pluginDescription.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                detectedPlayerVersion[2] = /[a-zA-Z]/.test(pluginDescription) ? parseInt(pluginDescription.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
            }
        }
        // Check for ActiveXObject (Internet Explorer)
        else if (typeof currentWindow.ActiveXObject !== UNDEFINED_TYPE_STR) {
            try {
                var flashActiveX = new ActiveXObject(FLASH_ACTIVEX_ID);
                if (flashActiveX) { // ActiveX object successfully created
                    pluginDescription = flashActiveX.GetVariable("$version");
                    if (pluginDescription) {
                        isInternetExplorer = true; // Confirmed IE
                        hasFlashPlugin = true; // Flash ActiveX is available
                        var versionParts = pluginDescription.split(" ")[1].split(",");
                        detectedPlayerVersion = [
                            parseInt(versionParts[0], 10),
                            parseInt(versionParts[1], 10),
                            parseInt(versionParts[2], 10)
                        ];
                    }
                }
            } catch (e) {
                // ActiveX object creation failed, possibly disabled.
            }
        }

        return {
            w3cDom: isW3CCompliantDOM,
            playerVer: detectedPlayerVersion,
            wkVer: webkitVersion,
            isIE: isInternetExplorer,
            isWin: isWindowsOS,
            isMac: isMacOS
        };
    })();

    // --- Helper Functions ---

    /**
     * Safely retrieves an element by its ID.
     * @param {string} elementId The ID of the element to retrieve.
     * @returns {HTMLElement|null} The element if found, otherwise null.
     */
    function retrieveElementById(elementId) {
        try {
            return currentDocument.getElementById(elementId);
        } catch (error) {
            return null;
        }
    }

    /**
     * Creates a new DOM element.
     * @param {string} tagName The tag name of the element to create.
     * @returns {HTMLElement} The newly created element.
     */
    function makeDOMElement(tagName) {
        return currentDocument.createElement(tagName);
    }

    /**
     * Performs a deep check to ensure a property belongs to the object itself
     * and is not inherited from the prototype chain.
     * @param {object} obj The object to check.
     * @param {string} prop The property name.
     * @returns {boolean} True if the property is owned by the object, false otherwise.
     */
    function isOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    /**
     * Verifies if the installed Flash Player version meets the required version.
     * @param {string} requiredVersionString Version string in "major.minor.release" format.
     * @returns {boolean} True if the player version is sufficient, false otherwise.
     */
    function checkPlayerVersion(requiredVersionString) {
        var currentPV = browserCapabilities.playerVer;
        var reqV = requiredVersionString.split(".").map(Number); // Convert parts to numbers

        // Support for short notation like "9" instead of "9.0.0"
        reqV[0] = reqV[0] || 0;
        reqV[1] = reqV[1] || 0;
        reqV[2] = reqV[2] || 0;

        // Compare major, then minor, then release versions
        if (currentPV[0] > reqV[0]) return true;
        if (currentPV[0] < reqV[0]) return false;

        // Major versions match, compare minor
        if (currentPV[1] > reqV[1]) return true;
        if (currentPV[1] < reqV[1]) return false;

        // Minor versions match, compare release
        return currentPV[2] >= reqV[2];
    }

    /**
     * Sanitizes a string for URL parameters to prevent common XSS vectors.
     * @param {string} inputString The string to encode.
     * @returns {string} The encoded string, or original if no encoding needed/supported.
     */
    function sanitizeURLParam(inputString) {
        var unsafeCharsRegex = /[\\\"<>\.;]/; // Characters to look out for
        var containsUnsafeChars = unsafeCharsRegex.test(inputString);

        if (containsUnsafeChars && typeof encodeURIComponent !== UNDEFINED_TYPE_STR) {
            return encodeURIComponent(inputString);
        }
        return inputString;
    }

    /**
     * Attaches a <param> element to an object element.
     * @param {HTMLElement} targetObject The <object> element.
     * @param {string} paramName The name of the parameter.
     * @param {string} paramValue The value of the parameter.
     */
    function addObjParameter(targetObject, paramName, paramValue) {
        var paramElement = makeDOMElement("param");
        paramElement.setAttribute("name", paramName);
        paramElement.setAttribute("value", paramValue);
        targetObject.appendChild(paramElement);
    }

    /**
     * Attempts to detect the Flash Player version more accurately for non-IE browsers
     * by dynamically creating an object element and querying it.
     * This method requires DOM availability.
     * @param {function} callback A function to call once version detection is complete.
     */
    function detectNonIePlayerVersion(callback) {
        var bodyElement = currentDocument.getElementsByTagName("body")[0];
        if (!bodyElement) {
            // If body is not available, proceed without this specific detection.
            callback();
            return;
        }

        var tempObject = makeDOMElement(OBJECT_TYPE_STR);
        tempObject.setAttribute("type", FLASH_MIME_TYPE_APP);
        tempObject.style.position = "absolute"; // Hide the temporary object
        tempObject.style.left = "-9999px";
        tempObject.style.top = "-9999px";
        tempObject.style.width = "1px";
        tempObject.style.height = "1px";

        var appendedObject = bodyElement.appendChild(tempObject);
        var pollAttempts = 0;
        var maxPollAttempts = 10;
        var pollIntervalMs = 10;

        // Use a named function for polling to avoid `arguments.callee`
        var pollVersion = function() {
            if (typeof appendedObject.GetVariable !== UNDEFINED_TYPE_STR) {
                var versionData = appendedObject.GetVariable("$version");
                if (versionData) {
                    var parts = versionData.split(" ")[1].split(",");
                    browserCapabilities.playerVer = [
                        parseInt(parts[0], 10),
                        parseInt(parts[1], 10),
                        parseInt(parts[2], 10)
                    ];
                }
                // Cleanup and callback
                bodyElement.removeChild(tempObject);
                callback();
            } else if (pollAttempts < maxPollAttempts) {
                pollAttempts++;
                setTimeout(pollVersion, pollIntervalMs);
            } else {
                // Polling failed after max attempts, cleanup and callback
                bodyElement.removeChild(tempObject);
                callback();
            }
        };

        // Start polling
        pollVersion();
    }

    /**
     * Placeholder for processing pending Flash embeds once version detection is complete.
     * In the original SWFObject, this would trigger the actual embedding based on collected data.
     * For this stripped version, it primarily marks the readiness.
     */
    function processPendingEmbeds() {
        // No pending embeds logic in this stripped down version.
        // The public embedSWF will check player version directly.
    }

    /**
     * Core function to create and embed a SWF object into the DOM.
     * Handles browser-specific quirks for object creation.
     * @param {object} attributesObject Attributes for the <object> tag.
     * @param {object} parametersObject Parameters for the <param> tags.
     * @param {string} targetElementId The ID of the element to replace.
     * @returns {HTMLElement|undefined} The newly created Flash object element, or undefined on failure.
     */
    function generateSWFObject(attributesObject, parametersObject, targetElementId) {
        var replacementElement = retrieveElementById(targetElementId);

        // Early exit for old WebKit versions with known issues
        if (browserCapabilities.wkVer && browserCapabilities.wkVer < 312) {
            console.warn(`Embedding skipped for old WebKit browser (v${browserCapabilities.wkVer}).`);
            return;
        }

        if (!replacementElement) {
            console.error(`Target element '${targetElementId}' not found for Flash embedding.`);
            return;
        }

        var finalObjectElement = undefined; // Will hold the created object

        // Ensure the ID is set for the object element.
        if (typeof attributesObject.id === UNDEFINED_TYPE_STR) {
            attributesObject.id = targetElementId;
        }

        // Internet Explorer specific embedding using outerHTML
        if (browserCapabilities.isIE && browserCapabilities.isWin) {
            var attributeString = "";
            for (var attrKey in attributesObject) {
                if (isOwnProperty(attributesObject, attrKey)) {
                    var lowerKey = attrKey.toLowerCase();
                    if (lowerKey === "data") {
                        parametersObject.movie = attributesObject[attrKey]; // Map 'data' to 'movie' for IE
                    } else if (lowerKey === "styleclass") {
                        attributeString += ` class="${attributesObject[attrKey]}"`;
                    } else if (lowerKey !== "classid") { // classid is fixed for ActiveX
                        attributeString += ` ${attrKey}="${attributesObject[attrKey]}"`;
                    }
                }
            }

            var parameterString = "";
            for (var paramKey in parametersObject) {
                if (isOwnProperty(parametersObject, paramKey)) {
                    parameterString += `<param name="${paramKey}" value="${parametersObject[paramKey]}" />`;
                }
            }

            // Construct and inject the object element using outerHTML
            replacementElement.outerHTML = `<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"${attributeString}>${parameterString}</object>`;
            embeddedObjectIDs.push(attributesObject.id); // Store ID for potential cleanup (though cleanup logic is removed)
            finalObjectElement = retrieveElementById(attributesObject.id);
        }
        // W3C DOM compliant browsers
        else {
            var newObjectElement = makeDOMElement(OBJECT_TYPE_STR);
            newObjectElement.setAttribute("type", FLASH_MIME_TYPE_APP);

            for (var objAttrKey in attributesObject) {
                if (isOwnProperty(attributesObject, objAttrKey)) {
                    var lowerAttrKey = objAttrKey.toLowerCase();
                    if (lowerAttrKey === "styleclass") {
                        newObjectElement.setAttribute("class", attributesObject[objAttrKey]);
                    } else if (lowerAttrKey !== "classid") { // IE-specific classid is not needed here
                        newObjectElement.setAttribute(objAttrKey, attributesObject[objAttrKey]);
                    }
                }
            }

            for (var objParamKey in parametersObject) {
                if (isOwnProperty(parametersObject, objParamKey) && objParamKey.toLowerCase() !== "movie") { // 'movie' is IE-specific
                    addObjParameter(newObjectElement, objParamKey, parametersObject[objParamKey]);
                }
            }
            replacementElement.parentNode.replaceChild(newObjectElement, replacementElement);
            finalObjectElement = newObjectElement;
        }
        return finalObjectElement;
    }

    // --- Public API ---
    return {
        /**
         * Embeds a SWF file into the DOM, replacing a target element.
         * @param {string} swfPath The URL of the SWF file.
         * @param {string} targetElementId The ID of the HTML element to be replaced by the SWF.
         * @param {string|number} displayWidth The width of the SWF (e.g., "100%", "500").
         * @param {string|number} displayHeight The height of the SWF (e.g., "300", "100%").
         * @param {string} requiredFlashVersion The minimum Flash Player version required (e.g., "9.0.0").
         * @param {object} [flashVariables={}] An object containing flashvars.
         * @param {object} [swfParameters={}] An object containing <param> attributes.
         * @param {object} [swfAttributes={}] An object containing <object> tag attributes.
         * @param {function} [completionCallback] Optional callback function `function(embedStatus)`.
         *                                        `embedStatus` object has `success:boolean`, `id:string`, `ref:HTMLElement`.
         */
        placeFlashContent: function(
            swfPath,
            targetElementId,
            displayWidth,
            displayHeight,
            requiredFlashVersion,
            flashVariables,
            swfParameters,
            swfAttributes,
            completionCallback
        ) {
            var embedResult = { success: false, id: targetElementId, ref: null };

            // Input validation and early exit if fundamental requirements are not met.
            if (!browserCapabilities.w3cDom || (browserCapabilities.wkVer && browserCapabilities.wkVer < 312) ||
                !swfPath || !targetElementId || !displayWidth || !displayHeight || !requiredFlashVersion) {
                if (completionCallback) {
                    console.warn("Flash embedding failed due to missing or invalid core parameters.");
                    completionCallback(embedResult);
                }
                return;
            }

            var objectAttributes = {};
            // Deep copy attributes to prevent modification of original object
            if (swfAttributes && typeof swfAttributes === OBJECT_TYPE_STR) {
                Object.keys(swfAttributes).forEach(function(key) {
                    objectAttributes[key] = swfAttributes[key];
                });
            }
            objectAttributes.data = swfPath;
            objectAttributes.width = String(displayWidth); // Ensure string type
            objectAttributes.height = String(displayHeight); // Ensure string type

            var objectParameters = {};
            // Deep copy parameters
            if (swfParameters && typeof swfParameters === OBJECT_TYPE_STR) {
                Object.keys(swfParameters).forEach(function(key) {
                    objectParameters[key] = swfParameters[key];
                });
            }

            // Process Flash Variables
            if (flashVariables && typeof flashVariables === OBJECT_TYPE_STR) {
                var flashVarStrings = [];
                Object.keys(flashVariables).forEach(function(key) {
                    flashVarStrings.push(`${key}=${flashVariables[key]}`);
                });
                if (flashVarStrings.length > 0) {
                    // Prepend to existing flashvars if any, otherwise set.
                    objectParameters.flashvars = objectParameters.flashvars ?
                                                 `${objectParameters.flashvars}&${flashVarStrings.join('&')}` :
                                                 flashVarStrings.join('&');
                }
            }

            // Check if the Flash Player version is sufficient
            if (checkPlayerVersion(requiredFlashVersion)) {
                var embeddedObj = generateSWFObject(objectAttributes, objectParameters, targetElementId);
                if (embeddedObj) {
                    embedResult.success = true;
                    embedResult.ref = embeddedObj;
                }
            } else {
                console.warn(`Flash Player version (${browserCapabilities.playerVer.join('.')}) is insufficient for required version (${requiredFlashVersion}). Embedding skipped.`);
            }

            if (completionCallback) {
                completionCallback(embedResult);
            }
        },

        // Expose browser capabilities object
        browserInfo: browserCapabilities,

        /**
         * Retrieves the detected Flash Player version.
         * @returns {object} An object with major, minor, and release versions.
         */
        getDetectedPlayerVersion: function() {
            var pv = browserCapabilities.playerVer;
            return { major: pv[0], minor: pv[1], release: pv[2] };
        },

        /**
         * Checks if the current Flash Player meets a minimum version requirement.
         * @param {string} versionStr The required version string (e.g., "10.0.0").
         * @returns {boolean} True if the player version is sufficient, false otherwise.
         */
        canPlayVersion: checkPlayerVersion,

        /**
         * Directly creates a SWF object, bypassing some of the `placeFlashContent` logic.
         * Useful for advanced scenarios where the element replacement logic is handled externally.
         * @param {object} objAttrs Attributes for the <object> tag.
         * @param {object} objParams Parameters for the <param> tags.
         * @param {string} targetId The ID of the element to replace.
         * @returns {HTMLElement|undefined} The created Flash object element, or undefined.
         */
        createFlashObject: function(objAttrs, objParams, targetId) {
            if (browserCapabilities.w3cDom) {
                return generateSWFObject(objAttrs, objParams, targetId);
            } else {
                console.warn("Flash object creation not supported in this browser mode.");
                return undefined;
            }
        },

        /**
         * Extracts a query parameter value from the current URL.
         * @param {string} [paramName=null] The name of the parameter to retrieve. If null, returns the entire query string.
         * @returns {string} The value of the parameter, or the full query string, or an empty string if not found.
         */
        fetchQueryParameter: function(paramName) {
            var queryString = currentDocument.location.search || currentDocument.location.hash;
            if (!queryString) {
                return "";
            }

            // Strip leading '?' or '#' if present
            if (queryString.startsWith("?") || queryString.startsWith("#")) {
                queryString = queryString.substring(1);
            }

            if (paramName === null) {
                return sanitizeURLParam(queryString);
            }

            var paramPairs = queryString.split("&");
            for (var i = 0; i < paramPairs.length; i++) {
                var pair = paramPairs[i];
                var eqIndex = pair.indexOf("=");
                if (eqIndex === -1) continue; // Skip malformed pairs

                var key = pair.substring(0, eqIndex);
                if (key === paramName) {
                    var value = pair.substring(eqIndex + 1);
                    return sanitizeURLParam(value);
                }
            }
            return "";
        }
    };
})();