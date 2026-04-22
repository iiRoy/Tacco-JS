/*
 * Web Content Injection & Management Utility (v1.0)
 *
 * A versatile tool for dynamically loading JavaScript and CSS resources.
 *
 * This software is provided under the MIT License.
 * For details, please refer to: https://opensource.org/licenses/MIT
 */

"use strict"; // Enforce strict parsing and error handling for better code quality

// Define a global object to encapsulate our utility functions
window.webToolKit = {
    // Stores references to dynamically loaded CSS link elements
    activeStyles: {},
    // Stores references to dynamically loaded JavaScript script elements
    loadedScripts: {},
    // Flag to indicate if a jQuery instance has been loaded and configured
    hasJQuery: false,

    /**
     * Initializes the toolkit by loading a primary script and then executing a configuration.
     * @param {string} entryScriptUrl - The URL of the initial JavaScript file to load.
     * @returns {boolean} False if no entry script is provided, true otherwise (async operation).
     */
    initiate: function (entryScriptUrl) {
        // Validate input: An entry script URL is mandatory for initiation.
        if (!entryScriptUrl || typeof entryScriptUrl !== 'string') {
            console.warn("WebToolKit: Initiation failed. A valid entry script URL is required.");
            return false;
        }

        // Load the main script, and once it's complete, process the toolkit's configuration.
        this.injectScript(entryScriptUrl, () => {
            // Retrieve global configuration options, if any, or default to an empty object.
            const globalConfig = window.webToolKit.options || {};
            this.processConfig(globalConfig); // Proceed with processing the collected options.
        });

        return true; // Indicate that the initiation process has begun.
    },

    /**
     * Processes a set of options to load necessary CSS and JS, then executes a final callback.
     * This is the core logic for setting up dynamic content.
     * @param {object} toolConfiguration - An object containing configuration parameters (e.g., styleAssets, scriptAssets, jqCdnUrl, onInitialization).
     */
    processConfig: function (toolConfiguration) {
        // Ensure that a configuration object is provided.
        if (typeof toolConfiguration !== 'object' || toolConfiguration === null) {
            console.error("WebToolKit: Invalid configuration provided. Expected an object.");
            return;
        }

        // Normalize CSS asset paths: ensure 'styleAssets' is an array.
        // If 'styleAssets' is a single string, convert it to an array. If null/undefined, initialize as empty array.
        toolConfiguration.styleAssets = [].concat(toolConfiguration.styleAssets || []);

        // Normalize JavaScript asset paths: ensure 'scriptAssets' is an array.
        // If 'scriptAssets' is a single string, convert it to an array. If null/undefined, initialize as empty array.
        toolConfiguration.scriptAssets = [].concat(toolConfiguration.scriptAssets || []);

        // Load all specified CSS files first to ensure styles are applied early.
        if (toolConfiguration.styleAssets.length > 0) {
            for (const styleUrl of toolConfiguration.styleAssets) {
                this.addStyleLink(styleUrl);
            }
        }

        // If a jQuery source is specified, prepend it to the list of JavaScript assets to ensure it loads first.
        const jquerySource = toolConfiguration.jqCdnUrl;
        if (jquerySource && typeof jquerySource === 'string') {
            toolConfiguration.scriptAssets.unshift(jquerySource);
        } else if (jquerySource) {
            console.warn("WebToolKit: Invalid jQuery CDN URL provided. Skipping jQuery preloading.");
        }

        // Load all JavaScript files in sequence, then execute the final 'onReady' callback.
        this.injectMultipleScripts(toolConfiguration.scriptAssets, () => {
            // Check if jQuery was requested and loaded.
            if (toolConfiguration.jqCdnUrl) {
                if (!this.hasJQuery && typeof window.jQuery !== 'undefined') {
                    // Store the jQuery instance and put it in no-conflict mode for isolation.
                    this.hasJQuery = window.jQuery.noConflict(true);
                }

                // If jQuery is available, execute the ready callback using jQuery's ready function.
                if (this.hasJQuery && typeof toolConfiguration.onInitialization === 'function') {
                    this.hasJQuery(toolConfiguration.onInitialization);
                } else if (typeof toolConfiguration.onInitialization === 'function') {
                    console.warn("WebToolKit: jQuery was requested but not available or failed to load. Executing callback without jQuery context.");
                    toolConfiguration.onInitialization();
                } else {
                    console.info("WebToolKit: No jQuery callback specified.");
                }
            } else {
                // If jQuery was not requested, directly execute the ready callback.
                if (typeof toolConfiguration.onInitialization === 'function') {
                    toolConfiguration.onInitialization();
                } else {
                    console.info("WebToolKit: No callback specified for non-jQuery scenario.");
                }
            }
        });
    },

    /**
     * Recursively loads multiple JavaScript files in the order they appear in the array.
     * @param {string[]} scriptUrls - An array of URLs for the JavaScript files to load.
     * @param {function} completionHandler - A callback function to execute after all scripts are loaded.
     */
    injectMultipleScripts: function (scriptUrls, completionHandler) {
        // If no scripts are left to load, or the array is empty, call the completion handler.
        if (!scriptUrls || scriptUrls.length === 0) {
            if (typeof completionHandler === 'function') {
                completionHandler();
            }
            return; // Exit the recursion.
        }

        // Take the first script URL from the array.
        const currentScript = scriptUrls.shift();

        // Inject the current script, and once it's loaded, recursively call this function for the rest.
        this.injectScript(currentScript, () => {
            this.injectMultipleScripts(scriptUrls, completionHandler);
        });
    },

    /**
     * Dynamically injects a single JavaScript file into the document.
     * @param {string} scriptSource - The URL of the JavaScript file.
     * @param {function} callbackFn - A function to execute once the script is loaded.
     * @returns {HTMLScriptElement|boolean} The script element if loaded/injected, false if already loaded.
     */
    injectScript: function (scriptSource, callbackFn) {
        // Check if the script has already been loaded to prevent duplicates.
        const existingElement = this.isScriptLoaded(scriptSource);
        if (existingElement) {
            // If already loaded, immediately invoke the callback if provided.
            if (typeof callbackFn === 'function') {
                // Pass the existing element as context if the callback expects it.
                callbackFn.call(existingElement);
            }
            return false; // Indicate that no new script was injected.
        }

        // Create a new script element.
        const scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = scriptSource;
        scriptElement.async = true; // Use async for non-blocking script loading.

        // Define a unified load handler for cross-browser compatibility.
        const handleLoad = () => {
            // Ensure the callback is only executed once.
            if (typeof callbackFn === 'function') {
                callbackFn.call(scriptElement); // Execute the callback in the context of the script element.
            }
            // Clean up event handlers to prevent memory leaks, especially for IE.
            scriptElement.onload = scriptElement.onreadystatechange = null;
        };

        // Attach event listeners for script loading completion.
        // Modern browsers use 'onload'. Older IE versions use 'onreadystatechange'.
        scriptElement.onload = handleLoad;
        scriptElement.onerror = (e) => {
            console.error(`WebToolKit: Failed to load script: ${scriptSource}`, e);
            // Optionally, call handleLoad even on error if the flow needs to continue.
            handleLoad();
        };

        // For IE-specific handling (readyState property).
        if (!document.attachEvent) { // Check if it's NOT IE (modern browser path)
            // onload is sufficient
        } else { // It's IE
            scriptElement.onreadystatechange = function () {
                if (scriptElement.readyState === 'complete' || scriptElement.readyState === 'loaded') {
                    handleLoad();
                }
            };
        }

        // Append the script element to the document body to initiate loading.
        document.body.appendChild(scriptElement);

        // Store a reference to the loaded script element.
        this.loadedScripts[scriptSource] = scriptElement;

        return scriptElement; // Return the newly created script element.
    },

    /**
     * Dynamically injects a single CSS stylesheet file into the document.
     * @param {string} styleSource - The URL of the CSS file.
     * @returns {HTMLLinkElement|boolean} The link element if injected, false if already loaded.
     */
    addStyleLink: function (styleSource) {
        // Prevent duplicate CSS loading.
        if (this.isStyleLoaded(styleSource)) {
            return false;
        }

        // Create a new link element for the stylesheet.
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet'; // Specifies the relationship to the document.
        linkElement.type = 'text/css'; // Specifies the content type.
        linkElement.href = styleSource; // Sets the URL of the stylesheet.

        // Append the link element to the document's head section.
        const headElement = document.head || document.getElementsByTagName('head')[0];
        if (headElement) {
            headElement.appendChild(linkElement);
        } else {
            console.warn("WebToolKit: Document head not found, cannot inject CSS:", styleSource);
            return false;
        }

        // Store a reference to the loaded CSS link element.
        this.activeStyles[styleSource] = linkElement;

        return linkElement; // Return the newly created link element.
    },

    /**
     * Checks if a specific JavaScript file has already been loaded by the toolkit.
     * @param {string} scriptPath - The URL of the script to check.
     * @returns {HTMLScriptElement|null} The script element if loaded, otherwise null.
     */
    isScriptLoaded: function (scriptPath) {
        // Return the stored element if it exists, otherwise null.
        return this.loadedScripts[scriptPath] || null;
    },

    /**
     * Checks if a specific CSS stylesheet file has already been loaded by the toolkit.
     * @param {string} stylePath - The URL of the stylesheet to check.
     * @returns {HTMLLinkElement|null} The link element if loaded, otherwise null.
     */
    isStyleLoaded: function (stylePath) {
        // Return the stored element if it exists, otherwise null.
        return this.activeStyles[stylePath] || null;
    },

    /**
     * Removes all dynamically injected JavaScript and CSS assets from the document.
     * This effectively "resets" the injected state.
     */
    cleanUp: function () {
        // Remove all loaded script elements.
        for (const scriptKey in this.loadedScripts) {
            if (Object.prototype.hasOwnProperty.call(this.loadedScripts, scriptKey)) {
                const scriptEl = this.loadedScripts[scriptKey];
                if (scriptEl && scriptEl.parentNode) {
                    scriptEl.parentNode.removeChild(scriptEl);
                }
            }
        }

        // Remove all loaded style link elements.
        for (const styleKey in this.activeStyles) {
            if (Object.prototype.hasOwnProperty.call(this.activeStyles, styleKey)) {
                const styleEl = this.activeStyles[styleKey];
                if (styleEl && styleEl.parentNode) {
                    styleEl.parentNode.removeChild(styleEl);
                }
            }
        }

        // Reset internal state.
        this.loadedScripts = {};
        this.activeStyles = {};
        this.hasJQuery = false; // Clear the jQuery instance.

        console.info("WebToolKit: All dynamically loaded assets have been removed.");
    }
};

// Example usage: A custom tool that uses the WebToolKit to inject jQuery and modify the page.
window.webToolKit.runMyCustomTool = function () {
    const jqueryCdn = 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js'; // Updated jQuery version
    
    // Define the configuration for our custom tool.
    const toolConfig = {
        jqCdnUrl: jqueryCdn, // Specify the jQuery source to load.
        onInitialization: function ($) { // This function runs after jQuery and other scripts are loaded.
            if ($) { // Ensure jQuery is available.
                console.log("WebToolKit: jQuery loaded successfully, version:", $.fn.jquery);
                $("body").css("background", "#e0ffff").append('<div style="position:fixed;top:10px;right:10px;background:white;padding:5px;border:1px solid #ccc;z-index:99999;">Toolkit Active!</div>');
            } else {
                console.error("WebToolKit: jQuery not available in onInitialization callback.");
            }
            // After the tool's operations, clean up injected assets to leave the page tidy.
            window.webToolKit.cleanUp();
        }
    };

    // Execute the custom tool's configuration.
    window.webToolKit.processConfig(toolConfig);
};