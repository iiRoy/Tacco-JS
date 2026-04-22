var FlashEmbedder = (function() {

    const UNDEF_TYPE_STR = "undefined";
    const OBJECT_TYPE_ID = "object";
    const SHOCKWAVE_PLUGIN_NAME = "Shockwave Flash";
    const FLASH_ACTIVE_X_ID = "ShockwaveFlash.ShockwaveFlash";
    const FLASH_MIME_TYPE_STRING = "application/x-shockwave-flash";

    const currentBrowserWindow = window;
    const currentHTMLDocument = document;
    const currentBrowserNavigator = navigator;

    let registeredComponentIDs = []; // Stores IDs of dynamically embedded Flash objects for cleanup if needed

    // Internal object to store detected platform capabilities
    let _platformCapabilitiesData = null;

    // Helper to get an element by its ID
    function fetchElementById(identifier) {
        let selectedElement = null;
        try {
            selectedElement = currentHTMLDocument.getElementById(identifier);
        } catch (e) { /* swallow error */ }
        return selectedElement;
    }

    // Helper to create a DOM element
    function generateNewElement(tagName) {
        return currentHTMLDocument.createElement(tagName);
    }

    // Function to perform the initial browser and plugin capability scan
    function _performInitialCapabilityScan() {
        const hasW3CDOMSupport = typeof currentHTMLDocument.getElementById !== UNDEF_TYPE_STR &&
                                 typeof currentHTMLDocument.getElementsByTagName !== UNDEF_TYPE_STR &&
                                 typeof currentHTMLDocument.createElement !== UNDEF_TYPE_STR;
        const userAgentText = currentBrowserNavigator.userAgent.toLowerCase();
        const platformText = currentBrowserNavigator.platform.toLowerCase();
        const isWindowsOperatingSystem = platformText ? /win/.test(platformText) : /win/.test(userAgentText);
        const isMacintoshOperatingSystem = platformText ? /mac/.test(platformText) : /mac/.test(userAgentText);
        const webkitEngineVersion = /webkit/.test(userAgentText) ? parseFloat(userAgentText.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : null;
        let isMicrosoftInternetExplorer = !+"\v1"; // Feature detection for IE
        let flashPluginSoftwareVersion = { major: 0, minor: 0, patch: 0 };
        let pluginIsPresent = false; // Indicates if any Flash plugin is found by initial scan

        if (typeof currentBrowserNavigator.plugins !== UNDEF_TYPE_STR && typeof currentBrowserNavigator.plugins[SHOCKWAVE_PLUGIN_NAME] === OBJECT_TYPE_ID) {
            let pluginDescriptionText = currentBrowserNavigator.plugins[SHOCKWAVE_PLUGIN_NAME].description;
            if (pluginDescriptionText && !(typeof currentBrowserNavigator.mimeTypes !== UNDEF_TYPE_STR && currentBrowserNavigator.mimeTypes[FLASH_MIME_TYPE_STRING] && !currentBrowserNavigator.mimeTypes[FLASH_MIME_TYPE_STRING].enabledPlugin)) {
                pluginIsPresent = true;
                isMicrosoftInternetExplorer = false; // Override IE flag if plugin detected in non-IE way
                pluginDescriptionText = pluginDescriptionText.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                flashPluginSoftwareVersion.major = parseInt(pluginDescriptionText.replace(/^(.*)\..*$/, "$1"), 10);
                flashPluginSoftwareVersion.minor = parseInt(pluginDescriptionText.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                flashPluginSoftwareVersion.patch = /[a-zA-Z]/.test(pluginDescriptionText) ? parseInt(pluginDescriptionText.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
            }
        } else if (typeof currentBrowserWindow.ActiveXObject !== UNDEF_TYPE_STR) {
            try {
                let activeXControl = new ActiveXObject(FLASH_ACTIVE_X_ID);
                if (activeXControl) {
                    let activeXVersion = activeXControl.GetVariable("$version");
                    if (activeXVersion) {
                        isMicrosoftInternetExplorer = true;
                        let versionComponents = activeXVersion.split(" ")[1].split(",");
                        flashPluginSoftwareVersion.major = parseInt(versionComponents[0], 10);
                        flashPluginSoftwareVersion.minor = parseInt(versionComponents[1], 10);
                        flashPluginSoftwareVersion.patch = parseInt(versionComponents[2], 10);
                    }
                }
            } catch(e) { /* swallow error */ }
        }

        _platformCapabilitiesData = {
            domAvailable: hasW3CDOMSupport,
            playerSoftwareVersion: flashPluginSoftwareVersion,
            isWebKitBased: webkitEngineVersion,
            isIEBrowser: isMicrosoftInternetExplorer,
            isWindowsPlatform: isWindowsOperatingSystem,
            isMacPlatform: isMacintoshOperatingSystem,
            initialPluginFound: pluginIsPresent
        };
    }

    // Function to perform a more precise Flash Player version probe for non-IE browsers using an embedded object
    function _probeFlashVersionViaDOMObject() {
        if (!_platformCapabilitiesData.initialPluginFound || _platformCapabilitiesData.isIEBrowser) {
            return; // Only probe if a plugin is initially found and it's not IE
        }

        const documentBodyElement = currentHTMLDocument.getElementsByTagName("body")[0];
        if (!documentBodyElement) {
            return; // Cannot probe if document body is not available
        }

        const temporaryObject = generateNewElement("object");
        temporaryObject.setAttribute("type", FLASH_MIME_TYPE_STRING);
        temporaryObject.style.position = "absolute";
        temporaryObject.style.width = "1px";
        temporaryObject.style.height = "1px";
        temporaryObject.style.zIndex = "-1";
        temporaryObject.style.visibility = "hidden";

        const appendedObjectReference = documentBodyElement.appendChild(temporaryObject);

        if (appendedObjectReference) {
            let retryCounter = 0;
            const maxRetries = 10;
            const retryDelayMilliseconds = 10;

            function checkObjectForVersion() {
                if (typeof appendedObjectReference.GetVariable !== UNDEF_TYPE_STR) {
                    const versionDetails = appendedObjectReference.GetVariable("$version");
                    if (versionDetails) {
                        const versionParts = versionDetails.split(" ")[1].split(",");
                        _platformCapabilitiesData.playerSoftwareVersion.major = parseInt(versionParts[0], 10);
                        _platformCapabilitiesData.playerSoftwareVersion.minor = parseInt(versionParts[1], 10);
                        _platformCapabilitiesData.playerSoftwareVersion.patch = parseInt(versionParts[2], 10);
                    }
                    documentBodyElement.removeChild(temporaryObject);
                } else if (retryCounter < maxRetries) {
                    retryCounter++;
                    setTimeout(checkObjectForVersion, retryDelayMilliseconds);
                } else {
                    documentBodyElement.removeChild(temporaryObject); // Clean up on timeout
                }
            }
            checkObjectForVersion();
        }
    }

    // Compares the current player version against a required version string
    function isPlayerVersionSufficient(requiredVersionString) {
        const currentVersion = _platformCapabilitiesData.playerSoftwareVersion;
        const requiredParts = requiredVersionString.split(".").map(Number);
        const reqMajor = requiredParts[0] || 0;
        const reqMinor = requiredParts[1] || 0;
        const reqPatch = requiredParts[2] || 0;

        return (currentVersion.major > reqMajor ||
                (currentVersion.major === reqMajor && currentVersion.minor > reqMinor) ||
                (currentVersion.major === reqMajor && currentVersion.minor === reqMinor && currentVersion.patch >= reqPatch));
    }

    // Encodes a string if it contains problematic characters (XSS protection)
    function cleanAndEncodeString(inputStr) {
        const problematicCharacters = /[\\\"<>\.;]/;
        return problematicCharacters.test(inputStr) && typeof encodeURIComponent !== UNDEF_TYPE_STR ? encodeURIComponent(inputStr) : inputStr;
    }

    // Core logic for inserting the Flash component into the DOM
    function insertFlashComponent(componentAttributes, componentParameters, targetElementID) {
        let insertedComponentRef = null;
        const targetDOMContainer = fetchElementById(targetElementID);

        if (_platformCapabilitiesData.isWebKitBased && _platformCapabilitiesData.isWebKitBased < 312) {
            return insertedComponentRef; // Early exit for old WebKit versions
        }

        if (targetDOMContainer) {
            if (typeof componentAttributes.id === UNDEF_TYPE_STR) {
                componentAttributes.id = targetElementID; // Inherit ID if not specified
            }

            if (_platformCapabilitiesData.isIEBrowser && _platformCapabilitiesData.isWindowsPlatform) {
                // Internet Explorer specific creation using outerHTML
                let attributeHTMLString = "";
                for (const attrKey in componentAttributes) {
                    if (Object.prototype.hasOwnProperty.call(componentAttributes, attrKey)) {
                        if (attrKey.toLowerCase() === "data") {
                            componentParameters.movie = componentAttributes[attrKey]; // 'data' attribute becomes 'movie' param for IE
                        } else if (attrKey.toLowerCase() === "styleclass") {
                            attributeHTMLString += ` class="${componentAttributes[attrKey]}"`;
                        } else if (attrKey.toLowerCase() !== "classid") { // 'classid' is hardcoded
                            attributeHTMLString += ` ${attrKey}="${componentAttributes[attrKey]}"`;
                        }
                    }
                }

                let parameterHTMLString = "";
                for (const paramKey in componentParameters) {
                    if (Object.prototype.hasOwnProperty.call(componentParameters, paramKey)) {
                        parameterHTMLString += `<param name="${paramKey}" value="${componentParameters[paramKey]}" />`;
                    }
                }
                targetDOMContainer.outerHTML = `<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"${attributeHTMLString}>${parameterHTMLString}</object>`;
                registeredComponentIDs.push(componentAttributes.id); // Store ID
                insertedComponentRef = fetchElementById(componentAttributes.id);
            } else {
                // W3C DOM compliant browsers
                const newFlashObject = generateNewElement("object");
                newFlashObject.setAttribute("type", FLASH_MIME_TYPE_STRING);

                for (const attrKey in componentAttributes) {
                    if (Object.prototype.hasOwnProperty.call(componentAttributes, attrKey)) {
                        if (attrKey.toLowerCase() === "styleclass") {
                            newFlashObject.setAttribute("class", componentAttributes[attrKey]);
                        } else if (attrKey.toLowerCase() !== "classid") {
                            newFlashObject.setAttribute(attrKey, componentAttributes[attrKey]);
                        }
                    }
                }

                for (const paramKey in componentParameters) {
                    if (Object.prototype.hasOwnProperty.call(componentParameters, paramKey) && paramKey.toLowerCase() !== "movie") {
                        const newParamElement = generateNewElement("param");
                        newParamElement.setAttribute("name", paramKey);
                        newParamElement.setAttribute("value", componentParameters[paramKey]);
                        newFlashObject.appendChild(newParamElement);
                    }
                }
                targetDOMContainer.parentNode.replaceChild(newFlashObject, targetDOMContainer);
                insertedComponentRef = newFlashObject;
            }
        }
        return insertedComponentRef;
    }

    // Main public method to deploy a Flash media object
    function deployFlashMediaObject(
        mediaSourceURL,
        targetContainerIdentifier,
        displayDimensionWidth,
        displayDimensionHeight,
        minimumRequiredVersion,
        dynamicVariablesObject,
        behaviorPropertiesObject,
        elementHTMLAttributesObject,
        completionCallbackFunction
    ) {
        const operationResult = { successful: false, elementID: targetContainerIdentifier };

        if (_platformCapabilitiesData.domAvailable &&
            !(_platformCapabilitiesData.isWebKitBased && _platformCapabilitiesData.isWebKitBased < 312) &&
            mediaSourceURL && targetContainerIdentifier && displayDimensionWidth && displayDimensionHeight && minimumRequiredVersion
        ) {
            const widthString = String(displayDimensionWidth);
            const heightString = String(displayDimensionHeight);

            // Clone attribute and parameter objects to avoid modification of original inputs
            const attributesCopy = { ...elementHTMLAttributesObject };
            attributesCopy.data = mediaSourceURL;
            attributesCopy.width = widthString;
            attributesCopy.height = heightString;

            const parametersCopy = { ...behaviorPropertiesObject };

            // Process dynamic variables (flashvars)
            if (dynamicVariablesObject && typeof dynamicVariablesObject === OBJECT_TYPE_ID) {
                const flashVariablesEncoded = Object.entries(dynamicVariablesObject)
                                                   .map(([key, value]) => `${key}=${value}`)
                                                   .join("&");
                if (flashVariablesEncoded) {
                    parametersCopy.flashvars = parametersCopy.flashvars ? `${parametersCopy.flashvars}&${flashVariablesEncoded}` : flashVariablesEncoded;
                }
            }

            if (isPlayerVersionSufficient(minimumRequiredVersion)) {
                const embeddedComponent = insertFlashComponent(attributesCopy, parametersCopy, targetContainerIdentifier);
                operationResult.successful = true;
                operationResult.reference = embeddedComponent;
            }

            if (completionCallbackFunction) {
                completionCallbackFunction(operationResult);
            }
        } else if (completionCallbackFunction) {
            completionCallbackFunction(operationResult);
        }
    }

    // Perform initial capability scan immediately when script loads
    _performInitialCapabilityScan();

    // Attach the delayed version probing to DOMContentLoaded or window.load
    function onDocumentReadyOrLoaded() {
        if (currentHTMLDocument.readyState === "complete" || currentHTMLDocument.readyState === "interactive") {
            _probeFlashVersionViaDOMObject();
            currentHTMLDocument.removeEventListener("DOMContentLoaded", onDocumentReadyOrLoaded);
            currentBrowserWindow.removeEventListener("load", onDocumentReadyOrLoaded);
        }
    }

    if (currentHTMLDocument.readyState === "complete" || currentHTMLDocument.readyState === "interactive") {
        _probeFlashVersionViaDOMObject();
    } else {
        currentHTMLDocument.addEventListener("DOMContentLoaded", onDocumentReadyOrLoaded);
        currentBrowserWindow.addEventListener("load", onDocumentReadyOrLoaded); // Fallback
    }


    return {
        // Public API methods
        incorporateFlashElement: deployFlashMediaObject,

        getSystemCapabilities: function() {
            // Return a copy to prevent external modification of internal state
            return { ..._platformCapabilitiesData, playerSoftwareVersion: { ..._platformCapabilitiesData.playerSoftwareVersion } };
        },

        retrieveFlashPlayerVersion: function() {
            return {
                major: _platformCapabilitiesData.playerSoftwareVersion.major,
                minor: _platformCapabilitiesData.playerSoftwareVersion.minor,
                release: _platformCapabilitiesData.playerSoftwareVersion.patch
            };
        },

        checkFlashPlayerVersion: isPlayerVersionSufficient,

        createDOMFlashObject: function(attributes, parameters, targetId) {
            if (_platformCapabilitiesData.domAvailable) {
                return insertFlashComponent(attributes, parameters, targetId);
            }
            return undefined;
        },

        extractURLQueryParameter: function(parameterName) {
            let queryPart = currentHTMLDocument.location.search || currentHTMLDocument.location.hash;
            if (queryPart) {
                if (queryPart.startsWith("?")) {
                    queryPart = queryPart.substring(1);
                }
                if (parameterName === null) {
                    return cleanAndEncodeString(queryPart);
                }
                const parameterPairs = queryPart.split("&");
                for (let i = 0; i < parameterPairs.length; i++) {
                    const currentPair = parameterPairs[i];
                    const equalsIndex = currentPair.indexOf("=");
                    if (equalsIndex !== -1 && currentPair.substring(0, equalsIndex) === parameterName) {
                        return cleanAndEncodeString(currentPair.substring(equalsIndex + 1));
                    }
                }
            }
            return "";
        }
    };

})();