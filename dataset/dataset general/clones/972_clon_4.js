const AssetManagementSystem = (function() {
    const assetRegistry = new Map(); // Stores loaded asset URLs by type (e.g., 'script', 'style')
    let currentConfiguration = {
        processingTimeout: 1500, // Milliseconds to wait for remote asset processing
        defaultAssetKind: 'script', // Default type for assets if not specified
        dataHostElement: document.body // Conceptual element for data storage (not actively used for DOM data)
    };

    // Merges input options with current settings to produce final options for a load request
    const finalizeOptions = (initialInput) => {
        let specificParameters = {};
        if (typeof initialInput === 'string') {
            specificParameters.assetSource = initialInput;
        } else if (typeof initialInput === 'object' && initialInput !== null) {
            specificParameters = { ...initialInput };
        }
        return {
            assetSource: null,
            assetKind: currentConfiguration.defaultAssetKind,
            onSuccess: null,
            onFailure: null,
            ...specificParameters
        };
    };

    // Safely executes a callback function if it's available
    const triggerCallback = (callbackReference, argument) => {
        if (typeof callbackReference === 'function') {
            callbackReference(argument);
        }
    };

    // Checks if a specific asset (URL and type) is already recorded as loaded
    const checkAssetStatus = (sourceIdentifier, assetClassification) => {
        const typeSet = assetRegistry.get(assetClassification);
        return typeSet ? typeSet.has(sourceIdentifier) : false;
    };

    // Records a successfully loaded asset
    const recordAssetLoad = (sourceIdentifier, assetClassification) => {
        if (!assetRegistry.has(assetClassification)) {
            assetRegistry.set(assetClassification, new Set());
        }
        assetRegistry.get(assetClassification).add(sourceIdentifier);
    };

    // Determines if a given URL points to an external (cross-origin) resource
    const checkExternalOrigin = (resourceURL) => {
        try {
            const currentSiteOrigin = window.location.origin;
            const targetSiteOrigin = new URL(resourceURL, window.location.origin).origin;
            return currentSiteOrigin !== targetSiteOrigin;
        } catch (e) {
            // Treat invalid/relative URLs as same-origin for this check
            return false;
        }
    };

    // Logic for loading JavaScript assets
    const processScriptLoad = (requestOptions) => {
        return new Promise((resolve, reject) => {
            if (checkAssetStatus(requestOptions.assetSource, requestOptions.assetKind)) {
                triggerCallback(requestOptions.onSuccess, requestOptions.assetSource);
                return resolve(requestOptions.assetSource);
            }

            const scriptNode = document.createElement('script');
            scriptNode.src = requestOptions.assetSource;
            scriptNode.async = true;

            const successfulLoadHandler = () => {
                recordAssetLoad(requestOptions.assetSource, requestOptions.assetKind);
                triggerCallback(requestOptions.onSuccess, requestOptions.assetSource);
                resolve(requestOptions.assetSource);
            };

            const failedLoadHandler = (event) => {
                const errorDetail = `Script acquisition failed: ${requestOptions.assetSource}`;
                triggerCallback(requestOptions.onFailure, errorDetail);
                reject(new Error(errorDetail));
            };

            scriptNode.addEventListener('load', successfulLoadHandler);
            scriptNode.addEventListener('error', failedLoadHandler);

            document.head.appendChild(scriptNode);

            // Special timeout handling for external scripts, mirroring original behavior
            if (checkExternalOrigin(requestOptions.assetSource)) {
                setTimeout(() => {
                    if (!checkAssetStatus(requestOptions.assetSource, requestOptions.assetKind)) {
                        // If not loaded by timeout, manually dispatch an error event
                        scriptNode.dispatchEvent(new Event('error'));
                    }
                }, currentConfiguration.processingTimeout);
            }
        });
    };

    // Logic for loading CSS stylesheet assets
    const processStyleLoad = (requestOptions) => {
        return new Promise((resolve, reject) => {
            if (checkAssetStatus(requestOptions.assetSource, requestOptions.assetKind)) {
                triggerCallback(requestOptions.onSuccess, requestOptions.assetSource);
                return resolve(requestOptions.assetSource);
            }

            const isLocalAsset = !checkExternalOrigin(requestOptions.assetSource);

            if (isLocalAsset) {
                // For local CSS, fetch content and inject into a <style> tag
                fetch(requestOptions.assetSource)
                    .then(response => {
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        return response.text();
                    })
                    .then(cssContent => {
                        const styleNode = document.createElement('style');
                        styleNode.textContent = cssContent;
                        styleNode.setAttribute('data-asset-path', requestOptions.assetSource);
                        document.head.appendChild(styleNode);
                        recordAssetLoad(requestOptions.assetSource, requestOptions.assetKind);
                        triggerCallback(requestOptions.onSuccess, requestOptions.assetSource);
                        resolve(requestOptions.assetSource);
                    })
                    .catch(e => {
                        const errorDetail = `Local style acquisition failed: ${requestOptions.assetSource} - ${e.message}`;
                        triggerCallback(requestOptions.onFailure, errorDetail);
                        reject(new Error(errorDetail));
                    });
            } else {
                // For external CSS, use a <link> tag
                const linkNode = document.createElement('link');
                linkNode.rel = 'stylesheet';
                linkNode.type = 'text/css';
                linkNode.href = requestOptions.assetSource;

                const successfulLoadHandler = () => {
                    // This event might fire before the stylesheet is fully parsed/applied
                    if (!checkAssetStatus(requestOptions.assetSource, requestOptions.assetKind)) {
                        recordAssetLoad(requestOptions.assetSource, requestOptions.assetKind);
                        triggerCallback(requestOptions.onSuccess, requestOptions.assetSource);
                        resolve(requestOptions.assetSource);
                    }
                };

                const failedLoadHandler = () => {
                    const errorDetail = `External style acquisition failed: ${requestOptions.assetSource}`;
                    triggerCallback(requestOptions.onFailure, errorDetail);
                    reject(new Error(errorDetail));
                };

                linkNode.addEventListener('load', successfulLoadHandler);
                linkNode.addEventListener('error', failedLoadHandler);

                document.head.appendChild(linkNode);

                // Timeout for CSS validation, mimicking original's delayed check
                setTimeout(() => {
                    const isStylesheetPresent = Array.from(document.styleSheets).some(sheet => {
                        try {
                            return sheet.href === linkNode.href || (sheet.ownerNode && sheet.ownerNode === linkNode);
                        } catch (e) {
                            // Cross-origin stylesheet access can throw SecurityError, assume loaded if href matches
                            return sheet.href === linkNode.href;
                        }
                    });

                    if (isStylesheetPresent && !checkAssetStatus(requestOptions.assetSource, requestOptions.assetKind)) {
                        recordAssetLoad(requestOptions.assetSource, requestOptions.assetKind);
                        triggerCallback(requestOptions.onSuccess, requestOptions.assetSource);
                        resolve(requestOptions.assetSource);
                    } else if (!isStylesheetPresent && !checkAssetStatus(requestOptions.assetSource, requestOptions.assetKind)) {
                        linkNode.dispatchEvent(new Event('error'));
                    }
                }, currentConfiguration.processingTimeout);
            }
        });
    };

    // Public API methods
    const exposedUtility = {
        // Main method to request and load an external resource
        obtainResource: (parameters) => {
            const finalizedOptions = finalizeOptions(parameters);
            if (!finalizedOptions.assetSource) {
                const errorMessage = 'Resource path is a mandatory parameter.';
                triggerCallback(finalizedOptions.onFailure, errorMessage);
                return Promise.reject(new Error(errorMessage));
            }

            if (checkAssetStatus(finalizedOptions.assetSource, finalizedOptions.assetKind)) {
                triggerCallback(finalizedOptions.onSuccess, finalizedOptions.assetSource);
                return Promise.resolve(finalizedOptions.assetSource);
            }

            switch (finalizedOptions.assetKind) {
                case 'script':
                    return processScriptLoad(finalizedOptions);
                case 'style':
                    return processStyleLoad(finalizedOptions);
                default:
                    const errorMessage = `Unsupported resource classification: ${finalizedOptions.assetKind}`;
                    triggerCallback(finalizedOptions.onFailure, errorMessage);
                    return Promise.reject(new Error(errorMessage));
            }
        },

        // Checks if a specific resource has been loaded
        checkResourceExistence: (sourcePath, kindOfAsset) => {
            kindOfAsset = kindOfAsset || currentConfiguration.defaultAssetKind;
            return checkAssetStatus(sourcePath, kindOfAsset);
        },

        // Retrieves a consolidated list of all loaded resources
        retrieveAllResources: () => {
            const collectedAssets = {};
            for (const [kind, sources] of assetRegistry.entries()) {
                collectedAssets[kind] = Array.from(sources);
            }
            return collectedAssets;
        },

        // Retrieves a list of loaded resources of a specific type
        retrieveResourcesByType: (resourceKind) => {
            const specificSet = assetRegistry.get(resourceKind);
            return specificSet ? Array.from(specificSet) : [];
        },

        // Allows modification of the loader's internal settings
        adjustSettings: (newSettings) => {
            Object.assign(currentConfiguration, newSettings);
        }
    };

    return exposedUtility;
})();

// Expose the utility globally
window.ResourceLoaderSystem = AssetManagementSystem;