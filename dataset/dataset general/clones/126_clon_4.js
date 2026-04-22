(function() {
    'use strict';

    // A simple console logger, replacing Gumby.debug
    function outputLog(severity, messageText, targetNode) {
        if (typeof console !== 'undefined' && console[severity]) {
            // For a Type IV clone, we'll keep it simple and just log info
            console.info('Image Display Manager: ' + messageText, targetNode);
        }
    }

    // A WeakMap to store references to the responsive image manager instances,
    // allowing them to be garbage collected when their associated DOM element is removed.
    const activeImageManagers = new WeakMap();

    // Factory function to create and manage dynamic image displays for a single DOM element.
    function createResponsiveImageManager(targetElement) {
        let currentDisplayMode; // 'imageTag' for <img>, 'backgroundStyle' for others
        let capabilityConditions = []; // Array of { test: 'feature', assetURL: 'url' }
        let mediaQueryConditions = [];   // Array of { test: 'query', assetURL: 'url' }
        let fallbackAssetURL = null;    // Default image URL
        let currentlyShownAsset = null; // The URL of the image currently displayed on the element

        // Determines how the image will be displayed (as an <img> src or background-image CSS)
        const identifyDisplayMode = () => {
            return targetElement.tagName.toLowerCase() === 'img' ? 'imageTag' : 'backgroundStyle';
        };

        // Parses attribute strings like "webp|img/webp.jpg, (min-width: 768px)|img/large.jpg"
        const decomposeAttributeString = (attributeContent) => {
            const resultsList = [];
            if (!attributeContent) {
                return resultsList;
            }

            const sections = attributeContent.split(',');
            sections.forEach(section => {
                const subSections = section.split('|');
                if (subSections.length === 2) {
                    resultsList.push({
                        test: normalizeQueryExpression(subSections[0].trim()),
                        assetURL: subSections[1].trim()
                    });
                }
            });
            return resultsList;
        };

        // Normalizes media query syntax, similar to the original's shorthand()
        const normalizeQueryExpression = (inputQuery) => {
            let processedExpression = inputQuery;

            // Replace > and < with min/max-width for media queries
            if (processedExpression.includes('>') || processedExpression.includes('<')) {
                processedExpression = processedExpression.replace('>', 'min-width: ').replace('<', 'max-width: ');
            }

            // Wrap width-based queries in parentheses if not already wrapped
            if (processedExpression.includes('width') && !processedExpression.startsWith('(') && !processedExpression.endsWith(')')) {
                processedExpression = `(${processedExpression})`;
            }

            return processedExpression;
        };

        // Executes a test condition (Modernizr feature or media query)
        const executeTestCondition = (testCategory, conditionValue) => {
            if (testCategory === 'feature') {
                // Check for Modernizr global object and the specific feature
                return typeof window.Modernizr !== 'undefined' && window.Modernizr[conditionValue];
            } else if (testCategory === 'query') {
                // Check for window.matchMedia and the media query
                return typeof window.matchMedia !== 'undefined' && window.matchMedia(conditionValue).matches;
            }
            return false;
        };

        // Iterates through a list of conditions and returns the URL of the first matching asset
        const locateMatchingAsset = (conditionSet, testCategory) => {
            for (const conditionItem of conditionSet) {
                if (executeTestCondition(testCategory, conditionItem.test)) {
                    return conditionItem.assetURL;
                }
            }
            return null;
        };

        // Applies the new image URL to the DOM element
        const applyImageToElement = (displayMode, newImageURL) => {
            const temporaryImageLoader = new Image();

            temporaryImageLoader.onload = () => {
                if (displayMode === 'imageTag') {
                    targetElement.setAttribute('src', newImageURL);
                } else { // 'backgroundStyle'
                    targetElement.style.backgroundImage = `url('${newImageURL}')`;
                }

                // Dispatch a custom event after the image is successfully loaded and displayed
                targetElement.dispatchEvent(new CustomEvent('visualUpdateComplete', {
                    detail: {
                        newSource: newImageURL,
                        element: targetElement
                    }
                }));
                outputLog('info', 'Image source updated successfully for element', targetElement);
            };

            temporaryImageLoader.onerror = () => {
                outputLog('error', 'Failed to load image from URL: ' + newImageURL, targetElement);
            };

            // Start loading the image
            temporaryImageLoader.src = newImageURL;
        };

        // The central function to evaluate all conditions and update the image display
        const evaluateAndApplyImage = () => {
            outputLog('info', 'Initiating source evaluation for element', targetElement);
            let selectedAsset = null;

            // 1. Check for Modernizr feature conditions first
            if (capabilityConditions.length > 0 && typeof window.Modernizr !== 'undefined') {
                selectedAsset = locateMatchingAsset(capabilityConditions, 'feature');
            }

            // 2. If no feature match, check media query conditions
            if (!selectedAsset && mediaQueryConditions.length > 0 && typeof window.matchMedia !== 'undefined') {
                selectedAsset = locateMatchingAsset(mediaQueryConditions, 'query');
            }

            // 3. If still no match, use the fallback default asset
            if (!selectedAsset && fallbackAssetURL) {
                selectedAsset = fallbackAssetURL;
            }

            // Only update the display if a new asset is selected and it's different from the current one
            if (selectedAsset && selectedAsset !== currentlyShownAsset) {
                currentlyShownAsset = selectedAsset;
                applyImageToElement(currentDisplayMode, selectedAsset);
            } else if (!selectedAsset) {
                outputLog('warn', 'No suitable image source found for element', targetElement);
            }
        };

        // Initial setup method for the manager, reads attributes and configures
        const configureManagerInitial = () => {
            outputLog('info', 'Setting up responsive image manager for element', targetElement);
            currentDisplayMode = identifyDisplayMode();

            capabilityConditions = decomposeAttributeString(targetElement.getAttribute('data-capability'));
            mediaQueryConditions = decomposeAttributeString(targetElement.getAttribute('data-view'));
            fallbackAssetURL = targetElement.getAttribute('data-base') || null;

            evaluateAndApplyImage(); // Perform an immediate evaluation after configuration
        };

        // Public interface of the manager instance
        const managerPublicAPI = {
            // Method to manually trigger a re-evaluation of image sources
            reassessImageSource: evaluateAndApplyImage,
            // Method to re-read attributes and re-configure the manager
            reconfigureAndReassess: configureManagerInitial
        };

        // Listen for a custom event to re-configure this specific manager
        targetElement.addEventListener('visualReconfigure', () => {
            outputLog('info', 'Received re-configuration request for element', targetElement);
            managerPublicAPI.reconfigureAndReassess();
            managerPublicAPI.reassessImageSource();
        });

        // Listen for a global trigger event to re-evaluate (e.g., from resize or custom global trigger)
        targetElement.addEventListener('globalImageRefreshTrigger', () => {
            managerPublicAPI.reassessImageSource();
        });

        configureManagerInitial(); // Execute initial setup when the manager is created
        return managerPublicAPI;
    }

    // Global function to find all relevant DOM elements and initialize/re-initialize managers
    const discoverAndManageImages = (forceReinitializeAll = false) => {
        outputLog('info', 'Searching for elements requiring dynamic image management.');
        const potentialImageElements = document.querySelectorAll(
            '[data-capability], [data-view], [data-base]'
        );

        potentialImageElements.forEach(elementNode => {
            const isAlreadyManaged = activeImageManagers.has(elementNode);

            if (!isAlreadyManaged || forceReinitializeAll) {
                if (isAlreadyManaged && forceReinitializeAll) {
                    outputLog('info', 'Forcing re-initialization of managed element', elementNode);
                    // Dispatch custom event to trigger re-initialization on existing manager
                    elementNode.dispatchEvent(new CustomEvent('visualReconfigure'));
                } else {
                    outputLog('info', 'Initializing new dynamic image manager for element', elementNode);
                    // Create a new manager instance and store it
                    const newManager = createResponsiveImageManager(elementNode);
                    activeImageManagers.set(elementNode, newManager);
                }
            }
        });
    };

    // Global event listener for the 'load' event to perform initial setup
    window.addEventListener('load', () => {
        discoverAndManageImages(); // Discover and set up all images on page load
        // After initial setup, trigger a global refresh to ensure all images are evaluated
        document.dispatchEvent(new CustomEvent('globalImageRefreshTrigger'));
    });

    // Global event listener for the 'resize' event, with debouncing for performance
    let globalResizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(globalResizeTimer);
        globalResizeTimer = setTimeout(() => {
            // Dispatch a global custom event which all individual managers listen to
            document.dispatchEvent(new CustomEvent('globalImageRefreshTrigger'));
        }, 150); // Debounce by 150 milliseconds
    });

    // Expose a global API for manual interaction, replacing Gumby's UIModule functionality
    window.dynamicImageHandler = {
        // Method to manually scan the DOM and initialize/re-initialize managers
        initiateAllImageManagers: (forceReinit = false) => {
            discoverAndManageImages(forceReinit);
            document.dispatchEvent(new CustomEvent('globalImageRefreshTrigger')); // Trigger a refresh after (re)initialization
        },
        // Method to trigger a refresh on all currently managed images
        triggerGlobalImageRefresh: () => {
            document.dispatchEvent(new CustomEvent('globalImageRefreshTrigger'));
        },
        // Method to trigger a refresh on a specific DOM element
        refreshSpecificImage: (elementNode) => {
            const manager = activeImageManagers.get(elementNode);
            if (manager) {
                manager.reassessImageSource();
            } else {
                outputLog('warn', 'Requested element is not managed by dynamicImageHandler', elementNode);
            }
        }
    };

})();