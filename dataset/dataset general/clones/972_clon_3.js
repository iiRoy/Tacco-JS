/*
* Asset Dispenser for Web Resources
*
* Copyright (c) 2023 Acme Corp. - All Rights Reserved
*
* Project Repository: https://github.com/acmecorp/asset-dispenser
* Documentation: https://docs.acmecorp.com/asset-dispenser
*
* This software is provided under the terms of the MIT License.
* For details, please refer to: https://opensource.org/licenses/MIT
*/
; (function(webContext) {

    // Ensure jQuery is available before proceeding.
    if (!webContext || typeof webContext.fn === 'undefined') {
        console.error("AssetDispenser requires jQuery to be loaded.");
        return;
    }

    // Define constants for resource types to improve readability and maintainability.
    const SCRIPT_TYPE = 'script';
    const STYLESHEET_TYPE = 'stylesheet';

    webContext.AssetDispenser = {
        // Main function to load a script or stylesheet asynchronously.
        // Accepts either a URL string or an object with detailed settings.
        requestResource: _FetchAssetOrModule,

        // Checks if a specific resource (script or stylesheet) has already been loaded
        // and registered by this utility.
        isResourceRegistered: _HasAssetBeenLinked,

        // Provides a comprehensive list of all resources managed by this dispenser,
        // categorized by their type (scripts, stylesheets).
        retrieveAllManagedAssets: _RetrieveLinkedAssets,

        // Returns an array of managed resources filtered by a specified type.
        retrieveManagedAssetsByType: _RetrieveLinkedAssetsByType,

        // Core configuration settings for the dispenser's internal operations.
        systemConfig: {
            assetRegistryKey: "AssetDispenserData", // Unique key for jQuery data storage
            hostElementSelector: "html", // DOM element used to host the jQuery data collection
            externalResourceTimeout: 2500 // Milliseconds to wait for an external script to load before timeout check
        },

        // Default options for resource loading requests.
        defaultOptions: {
            sourceURI: null, // The URL of the resource to be loaded (required).
            resourceType: SCRIPT_TYPE, // 'script' or 'stylesheet'. Defaults to 'script'.
            onLoadSuccess: null, // Callback function executed upon successful resource loading.
            onLoadFailure: null // Callback function invoked if an error occurs during loading.
        }
    };

    /**
     * Initiates the loading process for a web resource (script or stylesheet).
     *
     * @param {string|object} inputConfiguration - The URL string of the resource, or
     *   an object containing detailed loading parameters.
     */
    function _FetchAssetOrModule(inputConfiguration) {
        let assetSettings;

        // Determine settings based on input type.
        if (typeof inputConfiguration === 'string') {
            assetSettings = webContext.extend({}, webContext.AssetDispenser.defaultOptions, { sourceURI: inputConfiguration });
        } else if (typeof inputConfiguration === 'object' && inputConfiguration !== null) {
            assetSettings = webContext.extend({}, webContext.AssetDispenser.defaultOptions, inputConfiguration);
        } else {
            console.warn("AssetDispenser: Invalid input provided for resource loading. Please provide a URL string or an options object.");
            return; // Exit early if input is invalid
        }

        // Basic validation for source URI.
        if (!assetSettings.sourceURI) {
            _NotifyFailure(assetSettings, "Missing source URI for resource request.");
            return;
        }

        // Check if the resource is already loaded to prevent duplicates.
        if (_HasAssetBeenLinked(assetSettings.sourceURI, assetSettings.resourceType)) {
            _ExecuteCallbackSafely(assetSettings.onLoadSuccess, assetSettings.sourceURI);
            return;
        }

        // Process based on resource type.
        if (assetSettings.resourceType === SCRIPT_TYPE) {
            _HandleScriptLoading(assetSettings);
        } else if (assetSettings.resourceType === STYLESHEET_TYPE) {
            _InjectStylesheet(assetSettings);
        } else {
            _NotifyFailure(assetSettings, `Unsupported resource type specified: ${assetSettings.resourceType}`);
        }
    }

    /**
     * Checks if a resource with the given URL and type is already registered as loaded.
     *
     * @param {string} resourceURI - The URL of the resource.
     * @param {string} resourceType - The type of the resource ('script' or 'stylesheet').
     * @returns {boolean} - True if loaded, false otherwise.
     */
    function _HasAssetBeenLinked(resourceURI, resourceType) {
        const assetCollection = _RetrieveLinkedAssets();
        // Ensure the type exists and the URL is within that type's array.
        return !!(assetCollection && assetCollection[resourceType] && webContext.inArray(resourceURI, assetCollection[resourceType]) !== -1);
    }

    /**
     * Retrieves the entire collection of resources managed by the dispenser.
     *
     * @returns {object|null} An object containing arrays for 'script' and 'stylesheet' resources, or null if no data.
     */
    function _RetrieveLinkedAssets() {
        const hostElement = webContext(webContext.AssetDispenser.systemConfig.hostElementSelector);
        const registryData = hostElement.data(webContext.AssetDispenser.systemConfig.assetRegistryKey);
        // Safely access the managedAssets property.
        return (registryData && registryData.managedAssets) ? registryData.managedAssets : null;
    }

    /**
     * Retrieves a subset of managed assets based on their type.
     *
     * @param {string} desiredType - The type of resources to retrieve ('script' or 'stylesheet').
     * @returns {Array|null} An array of resource URIs for the specified type, or null if none.
     */
    function _RetrieveLinkedAssetsByType(desiredType) {
        const allAssets = _RetrieveLinkedAssets();
        // Return the specific array if it exists, otherwise null.
        return (allAssets && allAssets[desiredType]) ? allAssets[desiredType] : null;
    }

    // --- Private Helper Functions for Internal Operations ---

    /**
     * Handles the loading of JavaScript files.
     * @param {object} assetSettings - Configuration for the script to load.
     */
    function _HandleScriptLoading(assetSettings) {
        if (_IsExternalURL(assetSettings.sourceURI)) {
            // For external scripts, set a timeout to check if it has loaded,
            // as AJAX error callbacks might not always fire reliably for script loading.
            // This deferred pattern allows for more robust error handling for remote scripts.
            webContext.Deferred(function(dfd) {
                setTimeout(() => {
                    if (!_HasAssetBeenLinked(assetSettings.sourceURI, SCRIPT_TYPE)) {
                        _NotifyFailure(assetSettings, `External script timeout for: ${assetSettings.sourceURI}`);
                        dfd.reject(); // Reject the deferred if timeout occurs without success
                    } else {
                        dfd.resolve(); // Resolve if it's already registered by another means
                    }
                }, webContext.AssetDispenser.systemConfig.externalResourceTimeout);
            });
        }

        webContext.ajax({
            dataType: SCRIPT_TYPE,
            url: assetSettings.sourceURI,
            cache: true, // Allow browser caching for scripts
            success: function() {
                _NotifySuccess(assetSettings);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                const errorMessage = `Failed to load script: ${assetSettings.sourceURI}. Status: ${textStatus}, Error: ${errorThrown}`;
                _NotifyFailure(assetSettings, errorMessage);
            }
            // No 'data' property needed for simple script GET requests, it's implicitly empty.
        });
    }

    /**
     * Executes the error callback if available, logging the issue.
     *
     * @param {object} assetSettings - The settings object for the failed resource.
     * @param {string} [message="An unknown error occurred."] - Optional error message.
     */
    function _NotifyFailure(assetSettings, message = "An unknown error occurred during resource loading.") {
        console.error(`AssetDispenser Error: ${message} (Resource: ${assetSettings.sourceURI}, Type: ${assetSettings.resourceType})`);
        _ExecuteCallbackSafely(assetSettings.onLoadFailure, message);
    }

    /**
     * Executes the success callback, registers the asset, and logs success.
     *
     * @param {object} assetSettings - The settings object for the successfully loaded resource.
     */
    function _NotifySuccess(assetSettings) {
        _RegisterLoadedAsset(assetSettings);
        _ExecuteCallbackSafely(assetSettings.onLoadSuccess, assetSettings.sourceURI);
        console.info(`AssetDispenser: Successfully loaded ${assetSettings.resourceType}: ${assetSettings.sourceURI}`);
    }

    /**
     * Verifies if a dynamically injected stylesheet has loaded successfully.
     * This is primarily for older browser compatibility and may not be fully reliable.
     *
     * @param {object} assetSettings - Configuration for the stylesheet.
     */
    function _VerifyStylesheetLoad(assetSettings) {
        const $insertedLink = webContext(`link[href='${assetSettings.sourceURI}']`);
        let loadStatus = false;
        let diagnosticMessage = "Unknown stylesheet load status.";

        if (!$insertedLink.length) {
            diagnosticMessage = "Stylesheet link element not found in DOM after insertion.";
        } else {
            const linkDomElement = $insertedLink[0];
            // Check for IE-specific readyState property.
            if (linkDomElement && linkDomElement.readyState) {
                const readyStateVal = linkDomElement.readyState;
                loadStatus = (readyStateVal === "complete" || readyStateVal === "loaded");
                diagnosticMessage = `IE readyState: ${readyStateVal}`;
            } else {
                // For modern browsers, the 'onload' event is generally used.
                // If we reach here, the 'onload' event has fired or it's a browser
                // that doesn't support readyState and we assume successful insertion.
                loadStatus = true; // Optimistic for non-IE, relying on 'load' event.
                diagnosticMessage = "Modern browser, relying on 'load' event for success.";
            }
        }

        if (loadStatus) {
            _NotifySuccess(assetSettings);
        } else {
            _NotifyFailure(assetSettings, `Stylesheet validation failed: ${diagnosticMessage}`);
        }
    }

    /**
     * Injects a stylesheet into the document's head.
     * It handles both local (via AJAX) and remote (via <link> tag) stylesheets.
     *
     * @param {object} assetSettings - Configuration for the stylesheet to inject.
     */
    function _InjectStylesheet(assetSettings) {
        const headElement = webContext("head");
        if (_IsExternalURL(assetSettings.sourceURI)) {
            // For external stylesheets, use a <link> tag.
            // The 'onload' event on <link> is not universally reliable for all browsers/versions,
            // but is the standard for modern browsers.
            webContext("<link />")
                .attr({
                    "rel": "stylesheet",
                    "type": "text/css",
                    "href": assetSettings.sourceURI
                })
                .on('load', function() {
                    // A small delay to ensure DOM paint/parsing before final validation.
                    setTimeout(() => _VerifyStylesheetLoad(assetSettings), 50);
                })
                .on('error', function() {
                    _NotifyFailure(assetSettings, `Failed to load external stylesheet: ${assetSettings.sourceURI}`);
                })
                .appendTo(headElement);
        } else {
            // For local stylesheets, fetch content via AJAX and inject as <style> block.
            webContext.ajax({
                url: assetSettings.sourceURI,
                dataType: "text",
                cache: true,
                success: function(content) {
                    const uniqueId = "asset-style-" + Math.random().toString(36).substring(2, 9);
                    const $styleNode = webContext("<style />")
                        .attr({ "type": "text/css", "id": uniqueId });

                    $styleNode.appendTo(headElement);

                    // Defer setting content to ensure DOM element is ready, especially for older IE.
                    setTimeout(function() {
                        const insertedElement = webContext("#" + uniqueId)[0]; // Get native DOM element
                        if (insertedElement && insertedElement.styleSheet) { // IE specific path
                            try {
                                insertedElement.styleSheet.cssText = content;
                            } catch (e) {
                                console.warn("AssetDispenser: Could not set CSS text for IE stylesheet (potential security issue or malformed CSS). Error: ", e);
                                _NotifyFailure(assetSettings, "Failed to set CSS text for IE due to content issues.");
                                return;
                            }
                        } else if (insertedElement) { // Modern browsers path
                            insertedElement.textContent = content;
                        } else {
                            _NotifyFailure(assetSettings, "Could not find inserted style element to set content.");
                            return;
                        }
                        _NotifySuccess(assetSettings);
                    }, 20); // A slightly longer delay for safety
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    _NotifyFailure(assetSettings, `Failed to fetch local stylesheet via AJAX: ${assetSettings.sourceURI}. Status: ${textStatus}, Error: ${errorThrown}`);
                }
                // No 'data' property needed.
            });
        }
    }

    /**
     * Adds the successfully loaded resource to the internal registry.
     * This ensures we don't load the same resource multiple times.
     *
     * @param {object} assetSettings - The settings of the loaded resource.
     */
    function _RegisterLoadedAsset(assetSettings) {
        const hostElement = webContext(webContext.AssetDispenser.systemConfig.hostElementSelector);
        let currentRegistryData = hostElement.data(webContext.AssetDispenser.systemConfig.assetRegistryKey);

        // Initialize registry structure if it doesn't exist or is incomplete.
        if (!currentRegistryData || !currentRegistryData.managedAssets) {
            currentRegistryData = { managedAssets: { [SCRIPT_TYPE]: [], [STYLESHEET_TYPE]: [] } };
        } else {
            // Ensure both types exist in the managedAssets object.
            if (!currentRegistryData.managedAssets[SCRIPT_TYPE]) {
                currentRegistryData.managedAssets[SCRIPT_TYPE] = [];
            }
            if (!currentRegistryData.managedAssets[STYLESHEET_TYPE]) {
                currentRegistryData.managedAssets[STYLESHEET_TYPE] = [];
            }
        }

        const assetsOfType = currentRegistryData.managedAssets[assetSettings.resourceType];
        // Only add if not already present to avoid redundant entries.
        if (assetsOfType && webContext.inArray(assetSettings.sourceURI, assetsOfType) === -1) {
            assetsOfType.push(assetSettings.sourceURI);
        }

        hostElement.data(webContext.AssetDispenser.systemConfig.assetRegistryKey, currentRegistryData);
    }

    /**
     * Safely attempts to execute a callback function if it's defined and a function.
     * Includes basic error handling for the callback execution itself.
     *
     * @param {Function} callbackFn - The function to execute.
     * @param {*} parameter - The parameter to pass to the function.
     */
    function _ExecuteCallbackSafely(callbackFn, parameter) {
        if (typeof callbackFn === 'function') {
            try {
                callbackFn(parameter);
            } catch (e) {
                console.error("AssetDispenser: Error executing callback function:", e);
            }
        }
    }

    /**
     * Determines if a given URL points to an external (remote) resource.
     * This checks if the URL starts with 'http'/'https' and is not hosted on the current domain.
     *
     * @param {string} urlCandidate - The URL to check.
     * @returns {boolean} True if the URL is external, false otherwise.
     */
    function _IsExternalURL(urlCandidate) {
        if (typeof urlCandidate !== 'string' || urlCandidate.length === 0) {
            return false; // Invalid or empty URL candidate cannot be external.
        }
        const lowerCaseUrl = urlCandidate.toLowerCase();
        const isHttp = lowerCaseUrl.startsWith("http://");
        const isHttps = lowerCaseUrl.startsWith("https://");

        if (!isHttp && !isHttps) {
            return false; // Not an absolute HTTP/HTTPS URL.
        }

        const currentHost = window.location.host.toLowerCase();
        // Regex to check if the URL's host matches the current window's host.
        // Accounts for different ports or trailing slashes.
        const urlHostPattern = new RegExp(`^(http|https)://${currentHost}(:|/|$)`, 'i');

        // It's external if it starts with http/https AND its host is different from the current window's host.
        return !urlHostPattern.test(lowerCaseUrl);
    }

})(jQuery);