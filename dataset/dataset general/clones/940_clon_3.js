// This file orchestrates the dynamic loading of client-side resources.
// It's a re-engineered version of a legacy script loader, incorporating
// modern JavaScript practices and structural variations.
//
// Original Copyright (C) 2009-2011 Edmunds.com, Inc.
// This derivative work is provided under the same Apache License, Version 2.0.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software distributed
// under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS
// OF ANY KIND, either express or implied. See the License for the specific language
// governing permissions and limitations under the License.

(function () {
    'use strict'; // Enforce stricter parsing and error handling.

    try {
        // Core configuration and environment setup.
        const CURRENT_REVISION = '3.0.1-alpha'; // Updated version string.
        let documentHeadElement = document.head || document.getElementsByTagName('head')[0]; // More robust head element retrieval.

        // Guard against missing head element - critical for script insertion.
        if (!documentHeadElement) {
            throw new Error('ScriptLoader: Document head element not found, cannot proceed.');
        }

        // Global settings object for managing application state.
        // Renamed from PAGESETUP to ApplicationConfig for clarity.
        window.ApplicationConfig = window.ApplicationConfig || {};
        let appSettings = window.ApplicationConfig;

        // Ensure essential properties exist or initialize them with defaults.
        // Using a more declarative approach for initial property checks.
        const requiredProps = {
            resourcePaths: {}, // Renamed from urlstub1, urlstub2
            scriptManifest: [], // Renamed from files
            isInitialized: false, // Renamed from loaded
            queryStringParameters: {}, // Renamed from query_vars
            defaultLibraries: [], // Renamed from default_libs
            scriptsLoadedCount: 0 // Renamed from jsdownloaded
        };

        Object.keys(requiredProps).forEach(propKey => {
            if (appSettings[propKey] === undefined) {
                appSettings[propKey] = requiredProps[propKey];
            }
        });

        // Specific validation for critical resource paths.
        if (!appSettings.resourcePaths.yuiCdn) { // Formerly urlstub1
            throw new Error('ApplicationConfig Error: YUI CDN base path (resourcePaths.yuiCdn) is not defined.');
        }
        if (!appSettings.resourcePaths.coreCdn) { // Formerly urlstub2
            throw new Error('ApplicationConfig Error: Core UI CDN base path (resourcePaths.coreCdn) is not defined.');
        }

        // Browser environment detection. Using more modern checks where possible,
        // but retaining original logic for legacy browser support if necessary.
        const userAgentString = navigator.userAgent.toLowerCase();
        const isLegacyIE = userAgentString.includes('msie'); // Checks for older IE versions.
        const isFirefoxPre4 = /firefox\/3\./i.test(userAgentString); // Specific check for Firefox 3.x.
        const isBlackBerryDevice = userAgentString.includes('blackberry'); // Blackberries were relevant then.

        // Prevent multiple loader instances from running concurrently.
        if (appSettings.isInitialized) {
            console.warn('ScriptLoader: Loader already initialized and running. Exiting.');
            return;
        }
        appSettings.isInitialized = true;
        appSettings.processedResources = new Set(); // Using a Set for efficient tracking of loaded files.

        /**
         * Parses query string parameters from the current URL.
         * Stores results in appSettings.queryStringParameters for subsequent access.
         *
         * @param {string} paramKey - The name of the query parameter to retrieve.
         * @returns {string | undefined} The value of the parameter, or undefined if not found.
         */
        const retrieveQueryParameterValue = (paramKey) => {
            // If parameters haven't been parsed yet, do it once.
            if (Object.keys(appSettings.queryStringParameters).length === 0) {
                const urlQuery = window.location.search.substring(1); // Remove leading '?'
                if (!urlQuery) return undefined; // No query string present.

                urlQuery.split('&').forEach(pair => {
                    const parts = pair.split('=');
                    if (parts.length === 2) {
                        appSettings.queryStringParameters[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
                    }
                });
            }
            return appSettings.queryStringParameters[paramKey];
        };

        /**
         * Filters an array to remove duplicate entries, considering aliases.
         *
         * @param {string[]} sourceArray - The array potentially containing duplicates.
         * @param {Object.<string, string>} aliasMap - An object mapping aliased script names to their canonical forms.
         * @returns {string[]} A new array with only unique, canonical script names.
         */
        const filterUniqueScripts = (sourceArray, aliasMap = {}) => {
            const seenItems = new Set();
            const uniqueOutput = [];

            for (const item of sourceArray) {
                const canonicalItem = aliasMap[item] || item; // Check if item has an alias.
                if (!seenItems.has(canonicalItem)) {
                    uniqueOutput.push(item); // Push original item, but mark canonical as seen.
                    seenItems.add(canonicalItem);
                }
            }
            return uniqueOutput;
        };

        // Internal helper to log messages (can be expanded for more sophisticated logging).
        const logLoaderProgress = (message, level = 'info') => {
            if (console && console[level]) {
                console[level](`[AssetLoader ${CURRENT_REVISION}]: ${message}`);
            }
        };

        /**
         * Asynchronously loads JavaScript files one by one from a queue.
         * It handles path transformations (CDN stubs, minification/debug versions)
         * and ensures scripts are executed in order for legacy browsers.
         */
        const loadScriptQueueSequentially = () => {
            if (!appSettings.pendingScriptLoadQueue || appSettings.pendingScriptLoadQueue.length === 0) {
                // All scripts loaded. Execute post-load callbacks.
                appSettings.scriptsLoadedCount = appSettings.processedResources.size; // Update final count.
                logLoaderProgress(`All ${appSettings.scriptsLoadedCount} scripts processed. Initiating post-load actions.`);

                if (typeof appSettings.postLoadCallback === 'function') { // Renamed from execControls
                    try {
                        appSettings.postLoadCallback();
                    } catch (cbErr) {
                        logLoaderProgress(`Error in post-load callback: ${cbErr.message}`, 'error');
                    }
                }
                return; // Exit recursion.
            }

            const currentScriptPath = appSettings.pendingScriptLoadQueue.shift(); // Get next script.

            // Skip if this script (or its canonical form) was already processed.
            if (appSettings.processedResources.has(currentScriptPath)) {
                logLoaderProgress(`Skipping already processed script: ${currentScriptPath}`, 'warn');
                loadScriptQueueSequentially(); // Move to the next script.
                return;
            }
            appSettings.processedResources.add(currentScriptPath); // Mark as processing/processed.

            let finalScriptUrl = currentScriptPath;

            // Normalize URL format.
            finalScriptUrl = finalScriptUrl.replace(/\|/g, '/').replace(/\;/g, '.');

            // Apply CDN paths if not an absolute URL.
            if (!finalScriptUrl.startsWith('http')) {
                if (finalScriptUrl.includes('coreCdn')) { // Formerly stub2
                    finalScriptUrl = finalScriptUrl.replace(/coreCdn/, appSettings.resourcePaths.coreCdn);
                } else if (finalScriptUrl.includes('yuiCdn')) { // Formerly stub1
                    finalScriptUrl = finalScriptUrl.replace(/yuiCdn/, appSettings.resourcePaths.yuiCdn);
                }

                // Determine minified or debug version based on query flag.
                const currentDebugFlag = retrieveQueryParameterValue('jsflag');
                const isUtilityScript = finalScriptUrl.includes('utilities'); // Keep original logic for 'utilities'.

                if (!currentDebugFlag && !isUtilityScript) {
                    finalScriptUrl = finalScriptUrl.replace(/\.js$/, '-min.js');
                } else if (currentDebugFlag === 'debug' && !isUtilityScript) {
                    finalScriptUrl = finalScriptUrl.replace(/\.js$/, '-debug.js');
                }
            }

            // Create and append the script element.
            const scriptTag = document.createElement('script');
            scriptTag.type = 'text/javascript';
            scriptTag.src = finalScriptUrl;
            scriptTag.charset = 'utf-8'; // Explicitly set charset.

            // Event handlers for script loading.
            const handleScriptLoadComplete = () => {
                logLoaderProgress(`Successfully loaded: ${finalScriptUrl}`);
                loadScriptQueueSequentially(); // Continue with the next script in the queue.
            };

            const handleScriptError = (event) => {
                logLoaderProgress(`Failed to load script: ${finalScriptUrl} (Error: ${event.type})`, 'error');
                // Decide whether to continue loading or halt. For now, continue.
                loadScriptQueueSequentially();
            };

            scriptTag.onload = handleScriptLoadComplete;
            scriptTag.onerror = handleScriptError;

            // Special handling for legacy IE's 'onreadystatechange'.
            if (isLegacyIE) {
                scriptTag.onreadystatechange = function () {
                    if (this.readyState === 'complete' || this.readyState === 'loaded') {
                        // Prevent double-execution if both onload and onreadystatechange fire.
                        this.onreadystatechange = null;
                        this.onload = null;
                        handleScriptLoadComplete();
                    }
                };
            }

            // Append script to the DOM. For modern browsers, `async` is often default.
            // Original code had a strange mix of `head` and `body` appends.
            // Let's standardize to `head` for better practice for JS files.
            // The original's `js.async` logic was also a bit convoluted.
            // For true parallel, we'd just append all at once. For sequential,
            // we must wait for each to load. The original's `else` block was parallel
            // but also tried to be sequential with `onload`.
            // This re-implementation strictly enforces sequential loading.

            documentHeadElement.appendChild(scriptTag);
        };

        // --- Main execution flow for setting up the script queue ---

        // Map for combined libraries (e.g., individual YUI components bundled into one file).
        // Renamed from combined_libs to consolidatedComponents.
        appSettings.consolidatedComponents = appSettings.consolidatedComponents || {};

        // Detailed breakdown for debug/full mode.
        // Renamed from edmui_util_breakdown_full to debugModeComponentList.
        const debugModeComponentList = appSettings.debugModeComponentList || [];

        const runtimeFlag = retrieveQueryParameterValue('jsflag');
        let initialScriptCollection;

        // If 'full' or 'debug' flag is set, include detailed component breakdown.
        if (runtimeFlag === 'full' || runtimeFlag === 'debug') {
            initialScriptCollection = debugModeComponentList.concat(appSettings.scriptManifest);
            logLoaderProgress(`Debug/Full mode detected. Loading detailed component breakdown.`);
        } else {
            // Otherwise, load default libraries and then the main script manifest.
            initialScriptCollection = appSettings.defaultLibraries.concat(appSettings.scriptManifest);
            logLoaderProgress(`Standard mode. Loading default libraries.`);
        }

        // Deduplicate the combined list of scripts.
        appSettings.pendingScriptLoadQueue = filterUniqueScripts(
            initialScriptCollection,
            appSettings.consolidatedComponents
        );

        logLoaderProgress(`Starting script loading sequence for ${appSettings.pendingScriptLoadQueue.length} unique scripts.`);

        // Initiate the loading process.
        loadScriptQueueSequentially();

    } catch (operationError) {
        // Centralized error reporting for the loader.
        console.error(`CRITICAL LOADER ERROR: ${operationError.message || operationError}`);
        // Optionally, re-throw or notify external error tracking service.
        throw new Error(`AssetLoader Initialization Failure: ${operationError.message || operationError}`);
    }
})();