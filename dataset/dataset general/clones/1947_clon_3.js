// This file provides functionality for displaying a dynamic image carousel,
// allowing for sequential loading, smooth transitions, and integration with
// external image processing libraries.
// Original source: istack.netzgesta.de (Christian Effenberger)
// Distributed under Netzgestade Non-commercial Software License Agreement.

// Configuration and global settings for the image carousel utility.
// These values can be overridden during initialization.
const visualCarousel = {
    // Default configuration values for new carousel instances.
    _baseConfig: {
        imageSources: null,       // OBJ e.g. [{src: 'path/img.jpg'}, {src: 'path/img2.jpg', opts: {effect:'blur'}}]
        displayAreaWidth: 128,    // INT 80-n (pixels width)
        displayAreaHeight: 128,   // INT 80-n (pixels height)
        imageLoadTimeout: 3000,   // INT 1000-n (milliseconds for each image to load)
        transitionSteps: 20,      // INT 1-100 (frames for fade animation, ~30ms per frame)
        slideInterval: 5000,      // INT 1000-n (milliseconds between slides)
        presentationScript: '',   // STRING e.g. 'cvi_bevel'|'cvi_corner' (external script for image effects)
        disableIEFilter: false    // BOOLEAN If true, avoids IE's Alpha filter for fades (can cause rough edges)
    },

    // Utility function to log messages.
    // Renamed from L.
    reportIssue: function(level, message) {
        const normalizedLevel = level.toLowerCase() || 'log';
        if (window.console && typeof window.console[normalizedLevel] === 'function') {
            window.console[normalizedLevel](message);
        } else if (window.opera) {
            opera.postError(`${normalizedLevel}: ${message}`);
        } else {
            // Fallback for very old browsers: update document title.
            window.document.title = `${normalizedLevel}: ${message}`;
        }
    },

    // Utility function to get a DOM element by its ID.
    // Renamed from G.
    getElementByIdRef: function(elementId) {
        return document.getElementById(elementId);
    },

    // Utility function to create a new DOM element.
    // Renamed from E.
    createDomElement: function(tagName) {
        return document.createElement(tagName);
    },

    // Helper to apply opacity across different browser engines.
    // New addition for Type III.
    _setElementOpacity: function(element, opacityValue) {
        if (!element) return;
        if (element._carouselState && element._carouselState.isLegacyIE && !element._carouselState.userConfig.disableIEFilter) {
            // IE's Alpha filter expects values from 0-100.
            element.style.filter = `alpha(opacity=${Math.round(opacityValue * 100)})`;
        } else {
            // Standard opacity expects values from 0-1.
            element.style.opacity = opacityValue;
        }
    },

    // Initializes an image stack within a given DOM element.
    // Renamed from 'add'.
    initializeStack: function(targetContainer, configOverrides) {
        // Input validation and early exit conditions.
        if (!targetContainer || targetContainer.nodeType !== Node.ELEMENT_NODE || targetContainer.tagName.toUpperCase() !== 'DIV') {
            visualCarousel.reportIssue('error', '[Setup] Target container must be a valid DIV element.');
            return false;
        }
        if (targetContainer._carouselState && targetContainer._carouselState.isActive) {
            visualCarousel.reportIssue('warn', '[Setup] Carousel already active on this element.');
            return false;
        }

        // Determine browser capabilities for legacy IE filters.
        // Simplified IE detection (Type III update).
        const isLegacyIE = document.all && document.namespaces && !window.opera && (!document.documentMode || document.documentMode < 9);

        // Merge default configuration with user-provided overrides.
        // Using Object.assign for cleaner merging (Type III update).
        const currentConfig = Object.assign({}, visualCarousel._baseConfig, configOverrides);

        let initialImageSourceArray = currentConfig.imageSources;
        if (!Array.isArray(initialImageSourceArray) || initialImageSourceArray.length < 1) {
            visualCarousel.reportIssue('error', '[Setup] Insufficient image sources provided. An array of at least one image is required.');
            return false;
        }

        // Store carousel-specific state directly on the target element for easy access and cleanup.
        // This is a Type III change, consolidating state.
        targetContainer._carouselState = {
            uniqueInstanceId: targetContainer.id || `vc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Unique ID generation (Type III update)
            imageCollection: initialImageSourceArray,
            userConfig: currentConfig,
            isLegacyIE: isLegacyIE,
            isActive: false, // Will be set to true if setup succeeds
            currentImageIndex: 0,
            lastImageIndex: 0,
            animationTimer: null,
            transitionTimer: null,
            imageLoadTimer: null,
            // Removed unused 'canvas' check from original.
            isPureImagesMode: currentConfig.presentationScript === '' // Flag for whether external scripts are used
        };

        const state = targetContainer._carouselState;

        // Ensure numeric parameters are valid and within bounds.
        state.userConfig.displayAreaWidth = Math.max(32, parseInt(state.userConfig.displayAreaWidth, 10));
        state.userConfig.displayAreaHeight = Math.max(32, parseInt(state.userConfig.displayAreaHeight, 10));
        state.userConfig.imageLoadTimeout = Math.max(1000, parseInt(state.userConfig.imageLoadTimeout, 10));
        state.userConfig.transitionSteps = Math.max(1, Math.min(100, parseInt(state.userConfig.transitionSteps, 10)));
        // Adjust slide interval based on transition time if IE filter is not disabled.
        state.userConfig.slideInterval = parseInt(state.userConfig.slideInterval, 10) +
                                         (state.isLegacyIE && state.userConfig.disableIEFilter ? 0 : (state.userConfig.transitionSteps * 30));
        state.userConfig.slideInterval = Math.max(1000, state.userConfig.slideInterval);


        // Validate external presentation script.
        if (!state.isPureImagesMode) {
            // Check if the script exists and is callable.
            const scriptParts = state.userConfig.presentationScript.split('.');
            const scriptNamespace = window[scriptParts[0]];
            const scriptFunction = scriptNamespace ? scriptNamespace[scriptParts[1]] : null;
            if (typeof scriptFunction === 'function') {
                state.isActive = true;
            } else {
                visualCarousel.reportIssue('error', `[Setup] Presentation script '${state.userConfig.presentationScript}' not found or invalid.`);
                state.isActive = false;
            }
        } else {
            state.isActive = true; // Pure image mode is always active.
        }

        if (state.isActive) {
            targetContainer.innerHTML = ''; // Clear existing content.
            visualCarousel._loadVisualsSequentially(targetContainer, 0, 0);
        } else {
            visualCarousel.reportIssue('error', '[Setup] Failed to initialize carousel due to configuration issues.');
            // Clean up state if initialization failed.
            delete targetContainer._carouselState;
        }
        return state.isActive;
    },

    // Preloads images sequentially into the carousel container.
    // Renamed from '_preload'.
    _loadVisualsSequentially: function(carouselInstance, currentLoadIndex, validImageCount) {
        const state = carouselInstance._carouselState;

        if (!carouselInstance || !state || !state.isActive) {
            visualCarousel.reportIssue('warn', '[Loading] Carousel instance or state is invalid or inactive.');
            return false;
        }

        // Clear any previous loading timer to avoid race conditions.
        if (state.imageLoadTimer) {
            window.clearTimeout(state.imageLoadTimer);
        }

        if (currentLoadIndex < state.imageCollection.length) {
            // Set a timeout for the current image to load.
            state.imageLoadTimer = window.setTimeout(() => {
                visualCarousel.reportIssue('warn', `[Loading] Image load timed out for: ${state.imageCollection[currentLoadIndex].source}`);
                visualCarousel._loadVisualsSequentially(carouselInstance, currentLoadIndex + 1, validImageCount);
            }, state.userConfig.imageLoadTimeout);

            const currentImageLoader = new Image();
            currentImageLoader.alt = `Carousel Image ${currentLoadIndex + 1}`; // Add alt text (Type III addition)

            // Generic handler for image load failures/abortions.
            const imageLoadFailureHandler = () => {
                if (state.imageLoadTimer) {
                    window.clearTimeout(state.imageLoadTimer); // Clear timeout on error
                }
                visualCarousel.reportIssue('warn', `[Loading] Failed to load image: ${currentImageLoader.src}`);
                // Proceed to next image regardless of load failure.
                visualCarousel._loadVisualsSequentially(carouselInstance, currentLoadIndex + 1, validImageCount);
            };

            currentImageLoader.onabort = imageLoadFailureHandler;
            currentImageLoader.onerror = imageLoadFailureHandler;

            currentImageLoader.onload = () => {
                if (state.imageLoadTimer) {
                    window.clearTimeout(state.imageLoadTimer); // Clear timeout on successful load
                }

                // Validate image dimensions. Minimum 32x32 pixels.
                if (currentImageLoader.width >= 32 && currentImageLoader.height >= 32) {
                    state.imageCollection[currentLoadIndex].isLoaded = true;

                    const imageDisplayElement = visualCarousel.createDomElement('img');
                    imageDisplayElement.id = `${state.uniqueInstanceId}_${validImageCount}`;
                    imageDisplayElement.src = currentImageLoader.src;
                    imageDisplayElement.alt = currentImageLoader.alt; // Preserve alt text (Type III addition)

                    // Apply base styling.
                    Object.assign(imageDisplayElement.style, { // Using Object.assign for style (Type III update)
                        position: 'absolute',
                        display: 'block',
                        visibility: 'hidden', // Hidden until activated
                        width: `${state.userConfig.displayAreaWidth}px`,
                        height: `${state.userConfig.displayAreaHeight}px`,
                        left: '0px',
                        top: '0px'
                    });

                    carouselInstance.appendChild(imageDisplayElement); // Removed `visualCarousel.A` helper.

                    // Apply external presentation script if configured.
                    if (!state.isPureImagesMode) {
                        const visualSource = state.imageCollection[currentLoadIndex];
                        const scriptParts = state.userConfig.presentationScript.split('.');
                        const scriptNamespace = window[scriptParts[0]];
                        const scriptFunction = scriptNamespace ? scriptNamespace[scriptParts[1]] : null;

                        if (typeof scriptFunction === 'function') {
                            let optionsObject = null;
                            if (visualSource.options) {
                                if (typeof visualSource.options === 'string') {
                                    try {
                                        optionsObject = JSON.parse(visualSource.options);
                                    } catch (e) {
                                        visualCarousel.reportIssue('warn', `[Configuration] Invalid JSON options string for script: '${visualSource.options}'. Using default options.`);
                                    }
                                } else if (typeof visualSource.options === 'object') {
                                    optionsObject = visualSource.options;
                                }
                            }

                            try {
                                if (optionsObject) {
                                    scriptFunction(imageDisplayElement, optionsObject);
                                } else {
                                    scriptFunction(imageDisplayElement);
                                }
                            } catch (e) {
                                visualCarousel.reportIssue('error', `[Script Execution] Failed to execute presentation script '${state.userConfig.presentationScript}' for image: ${imageDisplayElement.src}. Error: ${e.message}`);
                            }
                        } else {
                            visualCarousel.reportIssue('warn', `[Configuration] Presentation script function not found for '${state.userConfig.presentationScript}'. Skipping.`);
                        }
                    }
                    validImageCount++;
                } else {
                    visualCarousel.reportIssue('warn', `[Loading] Image dimensions too small (${currentImageLoader.width}x${currentImageLoader.height}) for: ${currentImageLoader.src}`);
                }

                // Detach event handlers to prevent memory leaks in legacy IE (Type III update).
                if (state.isLegacyIE) {
                    currentImageLoader.onload = currentImageLoader.onerror = currentImageLoader.onabort = null;
                }
                visualCarousel._loadVisualsSequentially(carouselInstance, currentLoadIndex + 1, validImageCount);
            };

            currentImageLoader.src = state.imageCollection[currentLoadIndex].source;
        } else {
            // All images processed. Filter out any that failed to load.
            state.imageCollection = state.imageCollection.filter(img => img.isLoaded);

            if (state.imageCollection.length === 0) {
                visualCarousel.reportIssue('error', '[Loading] No valid images loaded. Cannot start carousel.');
                visualCarousel.disposeStack(carouselInstance); // Clean up (Type III addition)
                return false;
            }

            // Start the presentation after all images are loaded.
            state.currentImageIndex = 0;
            state.lastImageIndex = 0;
            visualCarousel.startPresentation(carouselInstance);
        }
        return true;
    },

    // Starts the image slideshow with transitions.
    // Renamed from 'play'.
    startPresentation: function(carouselInstance) {
        const state = carouselInstance._carouselState;

        if (!carouselInstance || !state || !state.isActive) {
            visualCarousel.reportIssue('warn', '[Presentation] Carousel instance or state is invalid or inactive.');
            return false;
        }

        // Ensure the current image is visible initially.
        const initialImageElement = visualCarousel.getElementByIdRef(`${state.uniqueInstanceId}_${state.currentImageIndex}`);
        if (initialImageElement) {
            initialImageElement.style.visibility = 'visible';
            visualCarousel._setElementOpacity(initialImageElement, 1); // Ensure full opacity for the first image
        }

        if (state.imageCollection.length > 1) {
            visualCarousel.haltPresentation(carouselInstance); // Clear any existing interval.

            state.animationTimer = window.setInterval(() => {
                state.currentImageIndex = (state.currentImageIndex < (state.imageCollection.length - 1) ? state.currentImageIndex + 1 : 0);

                let fadeInOpacity = 0; // Opacity value for the incoming image, starts at 0.
                let fadeOutOpacity = 1; // Opacity value for the outgoing image, starts at 1.
                let animationStepCounter = 0;
                const totalAnimationSteps = state.userConfig.transitionSteps;
                const opacityStepIncrement = 1 / totalAnimationSteps;

                const fadingInElement = visualCarousel.getElementByIdRef(`${state.uniqueInstanceId}_${state.currentImageIndex}`);
                const fadingOutElement = visualCarousel.getElementByIdRef(`${state.uniqueInstanceId}_${state.lastImageIndex}`);

                if (fadingInElement && fadingOutElement) {
                    // If disabling IE filter, just swap visibility (no actual fade).
                    if (state.isLegacyIE && state.userConfig.disableIEFilter) {
                        fadingOutElement.style.visibility = 'hidden';
                        fadingInElement.style.visibility = 'visible';
                        state.lastImageIndex = state.currentImageIndex;
                    } else {
                        // Prepare elements for fading.
                        visualCarousel._setElementOpacity(fadingOutElement, 1);
                        fadingOutElement.style.visibility = 'visible';
                        visualCarousel._setElementOpacity(fadingInElement, 0);
                        fadingInElement.style.visibility = 'visible';

                        // Clear previous fade timer if active.
                        if (state.transitionTimer) {
                            window.clearInterval(state.transitionTimer);
                        }

                        state.transitionTimer = window.setInterval(() => {
                            animationStepCounter++;
                            fadeInOpacity += opacityStepIncrement;
                            fadeOutOpacity -= opacityStepIncrement;

                            // Ensure values stay within 0-1 range to prevent visual glitches.
                            fadeInOpacity = Math.min(1, Math.max(0, fadeInOpacity));
                            fadeOutOpacity = Math.min(1, Math.max(0, fadeOutOpacity));

                            visualCarousel._setElementOpacity(fadingInElement, fadeInOpacity);
                            visualCarousel._setElementOpacity(fadingOutElement, fadeOutOpacity);

                            if (animationStepCounter >= totalAnimationSteps) {
                                window.clearInterval(state.transitionTimer);
                                state.transitionTimer = null; // Clear reference (Type III addition)

                                // Final state: incoming image fully opaque, outgoing hidden and transparent.
                                visualCarousel._setElementOpacity(fadingInElement, 1);
                                fadingOutElement.style.visibility = 'hidden';
                                visualCarousel._setElementOpacity(fadingOutElement, 0); // Ensure outgoing is fully transparent.
                                state.lastImageIndex = state.currentImageIndex;
                            }
                        }, 30); // Fixed interval for fade steps (approx. 30ms).
                    }
                } else {
                    visualCarousel.reportIssue('error', '[Presentation] Missing image elements for transition. Halting carousel.');
                    visualCarousel.haltPresentation(carouselInstance);
                }
            }, state.userConfig.slideInterval);
        } else if (state.imageCollection.length === 1) {
             // If only one image, ensure it's visible and no animation runs. (Type III addition)
            visualCarousel.reportIssue('info', '[Presentation] Only one image available. No slideshow will run.');
            const singleImageElement = visualCarousel.getElementByIdRef(`${state.uniqueInstanceId}_0`);
            if (singleImageElement) {
                singleImageElement.style.visibility = 'visible';
                visualCarousel._setElementOpacity(singleImageElement, 1);
            }
        }
        return true;
    },

    // Pauses the image slideshow.
    // Renamed from 'pause'.
    haltPresentation: function(carouselInstance) {
        const state = carouselInstance._carouselState;
        if (carouselInstance && state && state.isActive) {
            if (state.animationTimer) {
                window.clearInterval(state.animationTimer);
                state.animationTimer = null; // Clear reference (Type III addition)
            }
            if (state.transitionTimer) { // Also clear the active fade transition if any. (Type III addition)
                window.clearInterval(state.transitionTimer);
                state.transitionTimer = null;
            }
            visualCarousel.reportIssue('info', '[Presentation] Carousel paused.');
            return true;
        } else {
            visualCarousel.reportIssue('warn', '[Presentation] Cannot pause: Carousel instance or state is invalid or inactive.');
            return false;
        }
    },

    // Removes the carousel and cleans up its resources.
    // Renamed from 'remove'.
    disposeStack: function(carouselInstance) {
        const state = carouselInstance._carouselState;
        if (carouselInstance && state && state.isActive) {
            visualCarousel.haltPresentation(carouselInstance); // Ensure all animation timers are stopped.
            if (state.imageLoadTimer) { // Also clear any pending image load timers. (Type III addition)
                window.clearTimeout(state.imageLoadTimer);
                state.imageLoadTimer = null;
            }

            // Remove all child image elements by clearing innerHTML.
            // This is a simpler and more robust cleanup than iterating children (Type III update).
            carouselInstance.innerHTML = '';

            // Remove the stored state from the DOM element.
            delete carouselInstance._carouselState;
            visualCarousel.reportIssue('info', `[Cleanup] Carousel instance '${state.uniqueInstanceId}' disposed.`);
            return true;
        } else {
            visualCarousel.reportIssue('warn', '[Cleanup] Cannot dispose: Carousel instance or state is invalid or inactive.');
            return false;
        }
    }
};

// --- END OF VISUAL CAROUSEL LIBRARY ---