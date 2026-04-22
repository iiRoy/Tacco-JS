(async function() {
    const loaderVersion = '3.0.0';

    try {
        // Initialize or validate the global configuration object
        const loaderGlobal = window._RESOURCE_LOADER_CONFIG_ = window._RESOURCE_LOADER_CONFIG_ || {};

        // Validation similar to original PAGESETUP checks
        if (typeof loaderGlobal !== 'object' || loaderGlobal === null) {
            throw new Error('Resource Manager: Global configuration variable is not an object.');
        }
        loaderGlobal.assetList = loaderGlobal.assetList || [];
        loaderGlobal.isActivated = loaderGlobal.isActivated || false;
        loaderGlobal.uriParameters = loaderGlobal.uriParameters || {};
        loaderGlobal.initialDependencies = loaderGlobal.initialDependencies || [];
        loaderGlobal.loadCounter = loaderGlobal.loadCounter || 0;
        loaderGlobal.resourceAliases = loaderGlobal.resourceAliases || {};
        loaderGlobal.componentBreakdown = loaderGlobal.componentBreakdown || [];

        if (!loaderGlobal.baseUriOne) {
            throw new Error('Resource Manager: Configuration requires a primary CDN base URI in baseUriOne.');
        }
        if (!loaderGlobal.baseUriTwo) {
            throw new Error('Resource Manager: Configuration requires a secondary CDN base URI in baseUriTwo.');
        }

        // Prevent re-activation of the loader
        if (loaderGlobal.isActivated) {
            return;
        }
        loaderGlobal.loadedAssets = loaderGlobal.loadedAssets || {}; // Tracks processed assets globally

        const docHead = document.head || document.getElementsByTagName('head')[0];
        if (!docHead) {
            throw new Error('Resource Manager: Document head element not found.');
        }

        // --- Utility Functions ---

        // Extracts a query parameter value, caches results
        const extractParameterValue = (paramKey) => {
            if (!Object.prototype.hasOwnProperty.call(loaderGlobal.uriParameters, paramKey)) {
                const queryString = window.location.search.substring(1);
                if (queryString.length < 1) {
                    loaderGlobal.uriParameters[paramKey] = '';
                } else {
                    queryString.split('&').forEach(pair => {
                        const parts = pair.split('=');
                        if (parts.length === 2) {
                            loaderGlobal.uriParameters[parts[0]] = parts[1];
                        }
                    });
                }
            }
            return loaderGlobal.uriParameters[paramKey] || '';
        };

        // Deduplicates a list of assets, considering aliases
        const deduplicateAndResolveAliases = (sourceList, aliasMap) => {
            const processedSet = new Set();
            const filteredSequence = [];

            for (const itemIdentifier of sourceList) {
                const aliasedItem = aliasMap[itemIdentifier];

                const isItemAlreadyInSequence = processedSet.has(itemIdentifier);
                const isAliasedVersionAlreadyInSequence = aliasedItem ? processedSet.has(aliasedItem) : false;

                if (!isItemAlreadyInSequence && !isAliasedVersionAlreadyInSequence) {
                    filteredSequence.push(itemIdentifier);
                    processedSet.add(itemIdentifier);
                }
            }
            return filteredSequence;
        };

        // Constructs the final URL for a resource
        const buildFinalResourceUrl = (baseEntry, currentConfig, debugFlag) => {
            let processedUrl = baseEntry.replace(/\|/g, '/').replace(/;/g, '.');

            // Replace CDN placeholders
            if (processedUrl.includes('stub2')) {
                processedUrl = processedUrl.replace(/stub2/, currentConfig.baseUriTwo);
            } else if (processedUrl.includes('stub1')) {
                processedUrl = processedUrl.replace(/stub1/, currentConfig.baseUriOne);
            }

            // Apply min/debug suffixes based on flag and file name
            if (!processedUrl.startsWith('http') && !processedUrl.includes('utilities')) {
                if (debugFlag === 'debug') {
                    processedUrl = processedUrl.replace(/\.js$/, '-debug.js');
                } else if (!debugFlag) { // No flag, implies minified
                    processedUrl = processedUrl.replace(/\.js$/, '-min.js');
                }
            }
            return processedUrl;
        };

        // Injects a script element into the DOM and returns a Promise
        const injectScriptAsset = (sourceUri) => {
            return new Promise((resolve) => { // Always resolve, mimicking original's 'continue on error'
                const scriptElement = document.createElement('script');
                scriptElement.type = 'text/javascript';
                scriptElement.src = sourceUri;
                scriptElement.async = false; // Attempt to enforce sequential execution if browser respects it

                scriptElement.onload = () => {
                    loaderGlobal.loadCounter++;
                    loaderGlobal.loadedAssets[sourceUri] = 'success';
                    resolve();
                };
                scriptElement.onerror = (errEvent) => {
                    console.error(`Resource Manager: Failed to load resource: ${sourceUri}`, errEvent);
                    loaderGlobal.loadCounter++;
                    loaderGlobal.loadedAssets[sourceUri] = 'failure';
                    resolve(); // Continue the loading sequence even on error
                };
                docHead.appendChild(scriptElement);
            });
        };

        // --- Main Execution Logic ---

        const activeDebugFlag = extractParameterValue('jsflag');
        let initialResourceCollection = [];

        // Determine which set of resources to load first
        if (activeDebugFlag === 'full' || activeDebugFlag === 'debug') {
            initialResourceCollection = loaderGlobal.componentBreakdown.concat(loaderGlobal.assetList);
        } else {
            initialResourceCollection = loaderGlobal.initialDependencies.concat(loaderGlobal.assetList);
        }

        // Filter and prepare the final list of assets to load
        const uniqueResourceQueue = deduplicateAndResolveAliases(initialResourceCollection, loaderGlobal.resourceAliases);

        // Sequentially load each resource
        for (const resourceEntry of uniqueResourceQueue) {
            const finalAssetUri = buildFinalResourceUrl(resourceEntry, loaderGlobal, activeDebugFlag);

            // Mark resource as pending before injection, similar to original's PAGESETUP.loadedfiles[file] = 'loaded'
            if (!loaderGlobal.loadedAssets[finalAssetUri]) {
                loaderGlobal.loadedAssets[finalAssetUri] = 'pending';
            }

            await injectScriptAsset(finalAssetUri);
        }

        // Mark loader as fully activated and execute post-load callback
        loaderGlobal.isActivated = true;
        if (typeof loaderGlobal.postLoadCallback === 'function') {
            loaderGlobal.postLoadCallback();
        }

    } catch (e) {
        // Centralized error reporting
        throw new Error("Resource Manager Initialization Error: " + (e.message || e));
    }
})();