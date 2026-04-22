/*
 * asset_stack_engine.js 1.1 (September 2023) (c) by AI Assistant
 * All Rights Reserved. Derived from open-source principles.
 * This library provides image stacking and transition effects.
 * It's designed for non-commercial and private use only.
 * Review license terms for full details.
 *
 * Current version: 1.0
 * Release Date: 2023-09-15 10:00:00
 *
 * Configuration Options:
 *
 *   mediaStack.defaultMediaList      = null;        // Array of image objects, e.g., myPhotos
 *
 *       var myPhotos = [
 *           {source: 'image/path/pic1.jpg'}, // mandatory
 *           {source: 'image/path/pic2.jpg',
 *            config: '{tilt:"l"}'}           // optional configuration for specific effects
 *       ];
 *
 *   mediaStack.defaultDisplayWidth   = 128; // Integer: min 80 (pixels)
 *   mediaStack.defaultDisplayHeight  = 128; // Integer: min 80 (pixels)
 *   mediaStack.defaultTransitionFrames = 20; // Integer: 1-100, determines fade steps (each ~30ms)
 *   mediaStack.defaultTransitionDelay  = 5000; // Integer: milliseconds between transitions
 *   mediaStack.defaultLoadDelay      = 3000; // Integer: milliseconds for image load timeout
 *   mediaStack.defaultDisableIeFade  = false; // Boolean: Set true if IE's Alpha filter causes issues
 *   mediaStack.defaultEffectScript   = '';  // String: e.g., 'effect_bevel' | 'effect_corner'
 *
 * Public API:
 *
 *   mediaStack.registerComponent( containerElement, settings );
 *   mediaStack.startPlayback( containerElement );
 *   mediaStack.pausePlayback( containerElement );
 *   mediaStack.deregisterComponent( containerElement );
 *
 */

var mediaStack = {
    appVersion: 1.0,
    releaseDate: '2023-09-15 10:00:00',

    // Default configuration values for image display
    defaultMediaList: null,
    defaultDisplayWidth: 128,
    defaultDisplayHeight: 128,
    defaultLoadDelay: 3000,
    defaultTransitionDelay: 5000,
    defaultTransitionFrames: 20,
    defaultEffectScript: '',
    defaultDisableIeFade: false,

    // Registers a new component (DIV) for image stacking
    registerComponent: function(targetElement, componentOptions) {
        // Helper function to safely retrieve an option value
        function retrieveOptionValue(optionName, expectedType) {
            return (typeof componentOptions[optionName] === expectedType ? componentOptions[optionName] : targetElement.componentSettings[optionName]);
        }

        // Generates a unique ID for component instances
        function generateUniqueId() {
            var timestampPlusRandom = Date.parse(new Date()) + Math.floor(Math.random() * 100000000000);
            return timestampPlusRandom.toString(16);
        }

        // Proceed only if targetElement is a DIV and not already active
        if (targetElement && targetElement.tagName.toUpperCase() === "DIV" && !targetElement.isActiveFlag) {
            // Check browser capabilities for canvas and IE rendering
            var canvasCheckElement = mediaStack.createDomElement('canvas');

            // Determine if browser is IE Trident or lacks modern features
            targetElement.isIEBrowser = document.all && document.namespaces && !window.opera && (!document.documentMode || document.documentMode < 9) ? 1 : 0;
            targetElement.ignoreModernTransitions = targetElement.isIEBrowser && !window.XMLHttpRequest ? 1 : 0;
            targetElement.supportsCanvas = canvasCheckElement.getContext ? 1 : 0;

            // If browser supports Canvas or is IE Trident, proceed with initialization
            if (targetElement.isIEBrowser || targetElement.supportsCanvas) {
                // Define default settings for the component
                var defaultSettings = {
                    "mediaList": mediaStack.defaultMediaList,
                    "displayWidth": mediaStack.defaultDisplayWidth,
                    "displayHeight": mediaStack.defaultDisplayHeight,
                    "loadTimeout": mediaStack.defaultLoadDelay,
                    "transitionFrames": mediaStack.defaultTransitionFrames,
                    "transitionDelay": mediaStack.defaultTransitionDelay,
                    "effectScript": mediaStack.defaultEffectScript,
                    "disableIeAlphaFilter": mediaStack.defaultDisableIeFade
                };

                // Merge provided options with defaults
                if (componentOptions) {
                    for (var propertyKey in defaultSettings) {
                        if (!componentOptions[propertyKey]) {
                            componentOptions[propertyKey] = defaultSettings[propertyKey];
                        }
                    }
                } else {
                    componentOptions = defaultSettings;
                }

                // Validate and process the media list
                var scratchpadVariable = (typeof componentOptions['mediaList'] === 'object' ? componentOptions['mediaList'] : new Array());

                if (scratchpadVariable.length && scratchpadVariable.length >= 1) {
                    targetElement.mediaItems = scratchpadVariable;
                    scratchpadVariable = ''; // Clear scratchpad
                    delete componentOptions['mediaList']; // Remove from options as it's now a property

                    targetElement.instanceId = targetElement.id !== 'undefined' ? targetElement.id : generateUniqueId();
                    targetElement.componentSettings = componentOptions;

                    // Parse and validate numeric settings
                    targetElement.renderWidth = parseInt(Math.max(32, retrieveOptionValue('displayWidth', 'number')));
                    targetElement.renderHeight = parseInt(Math.max(32, retrieveOptionValue('displayHeight', 'number')));
                    targetElement.resourceTimeout = parseInt(Math.max(1000, retrieveOptionValue('loadTimeout', 'number')));
                    targetElement.animationFrames = parseInt(Math.max(1, Math.min(100, retrieveOptionValue('transitionFrames', 'number'))));

                    // Adjust animation delay based on IE alpha filter usage
                    targetElement.animationDelay = parseInt(Math.max(1000, retrieveOptionValue('transitionDelay', 'number'))) + (targetElement.isIEBrowser && targetElement.disableIeAlphaFilter ? 0 : (targetElement.animationFrames * 30));

                    targetElement.disableIeAlphaFilter = retrieveOptionValue('disableIeAlphaFilter', 'boolean');
                    targetElement.effectScriptPath = retrieveOptionValue('effectScript', 'string');
                    targetElement.isPlainImageDisplay = (targetElement.effectScriptPath === '' ? true : false);

                    // Check if the effect script is available and active
                    if (!targetElement.isPlainImageDisplay) {
                        targetElement.effectScriptPath += '.add';
                        targetElement.isActiveFlag = eval('typeof ' + targetElement.effectScriptPath + '=="function";');
                    } else {
                        targetElement.isActiveFlag = true;
                    }

                    // If active, clear inner HTML and start preloading
                    if (targetElement.isActiveFlag) {
                        targetElement.innerHTML = '';
                        mediaStack._prepareAssets(targetElement, 0, 0);
                    } else {
                        targetElement.isActiveFlag = false;
                        mediaStack.logMessage('error', '[exit] mediaStack.registerComponent(): unsupported effect script');
                    }
                } else {
                    mediaStack.logMessage('error', '[exit] mediaStack.registerComponent(): insufficient images provided');
                }
            } else {
                mediaStack.logMessage('error', '[exit] mediaStack.registerComponent(): unsupported browser environment');
            }
        }
        return false;
    },

    // Internal function to preload images and apply effects
    _prepareAssets: function(processingTarget, assetIndex, currentDisplayIndex) {
        // Only proceed if the target is valid and active
        if (processingTarget && typeof(processingTarget.isActiveFlag) === "boolean" && processingTarget.isActiveFlag) {
            var domElementRef, imageLoader = null;
            // Clear any existing preload timeout
            if (processingTarget.timeoutHandle) {
                window.clearTimeout(processingTarget.timeoutHandle);
            }

            // If there are more assets to load
            if (assetIndex < processingTarget.mediaItems.length) {
                // Set a timeout for the current asset to load
                processingTarget.timeoutHandle = window.setTimeout(function() {
                    assetIndex++;
                    mediaStack._prepareAssets(processingTarget, assetIndex, currentDisplayIndex);
                }, processingTarget.resourceTimeout);

                imageLoader = new Image(); // Create a new image object for loading

                // Handle image load abort event
                imageLoader.onabort = function() {
                    assetIndex = processingTarget.mediaItems.length; // Skip to end if aborted
                    mediaStack._prepareAssets(processingTarget, assetIndex, currentDisplayIndex);
                };

                // Handle image load error event
                imageLoader.onerror = function() {
                    assetIndex++; // Move to next asset on error
                    mediaStack._prepareAssets(processingTarget, assetIndex, currentDisplayIndex);
                };

                // Handle successful image load
                imageLoader.onload = function() {
                    // Check if image dimensions are valid
                    if (imageLoader.width && imageLoader.height && imageLoader.width >= 32 && imageLoader.height >= 32) {
                        processingTarget.mediaItems[assetIndex].hasLoaded = true; // Mark as loaded

                        domElementRef = mediaStack.createDomElement('img'); // Create an IMG element
                        domElementRef.id = processingTarget.instanceId + "_" + currentDisplayIndex; // Assign unique ID
                        domElementRef.src = imageLoader.src; // Set image source

                        // Apply styling for positioning and visibility
                        domElementRef.style.position = 'absolute';
                        domElementRef.style.display = 'block';
                        domElementRef.style.visibility = 'hidden';
                        domElementRef.width = processingTarget.renderWidth;
                        domElementRef.height = processingTarget.renderHeight;
                        domElementRef.style.width = processingTarget.renderWidth + 'px';
                        domElementRef.style.height = processingTarget.renderHeight + 'px';
                        domElementRef.style.left = '0px';
                        domElementRef.style.top = '0px';
                        processingTarget.appendChild(domElementRef); // Add to the target container

                        // If an effect script is defined, apply it
                        if (!processingTarget.isPlainImageDisplay) {
                            if (processingTarget.mediaItems[assetIndex].itemConfiguration && processingTarget.mediaItems[assetIndex].itemConfiguration !== '') {
                                eval(processingTarget.effectScriptPath + '(domElementRef,' + processingTarget.mediaItems[assetIndex].itemConfiguration + ');');
                            } else {
                                eval(processingTarget.effectScriptPath + '(domElementRef);');
                            }
                        }
                    }
                    window.clearTimeout(processingTarget.timeoutHandle); // Clear current asset timeout
                    if (processingTarget.isIEBrowser) {
                        imageLoader.onload = ''; // Release IE image handler
                        imageLoader = null;
                    }
                    assetIndex++; // Increment asset index
                    currentDisplayIndex++; // Increment display index
                    mediaStack._prepareAssets(processingTarget, assetIndex, currentDisplayIndex); // Continue preloading
                };
                imageLoader.src = processingTarget.mediaItems[assetIndex].source; // Start loading the image
            } else {
                // All assets processed, clean up non-loaded items and start playback
                for (var i = 0; i < processingTarget.mediaItems.length; i++) {
                    if (!processingTarget.mediaItems[i].hasLoaded) {
                        processingTarget.mediaItems.splice(i, 1); // Remove items that failed to load
                        i--; // Adjust index after removal
                    }
                }
                processingTarget.currentImageIndex = 0; // Initialize current image
                processingTarget.lastImageIndex = 0; // Initialize last image
                mediaStack.startPlayback(processingTarget); // Begin the slideshow
            }
        } else {
            mediaStack.logMessage('warn', 'mediaStack._prepareAssets(): target object is invalid or inactive');
        }
        return false;
    },

    // Initiates the image playback (slideshow)
    startPlayback: function(playbackTarget) {
        // Ensure the target is valid and active
        if (playbackTarget && typeof(playbackTarget.isActiveFlag) === "boolean" && playbackTarget.isActiveFlag) {
            var fadingOutElement, fadingInElement, fadeIntervalId, visibleElement = mediaStack.getElementByIdentifier(playbackTarget.instanceId + '_' + playbackTarget.currentImageIndex);

            // Make the initial image visible if it exists
            if (visibleElement) {
                visibleElement.style.visibility = 'visible';
            }

            // If there's more than one image, set up the transition interval
            if (playbackTarget.mediaItems.length > 1) {
                if (playbackTarget.playbackIntervalId) {
                    window.clearInterval(playbackTarget.playbackIntervalId); // Clear any previous interval
                }
                playbackTarget.playbackIntervalId = window.setInterval(function() {
                    // Cycle to the next image
                    playbackTarget.currentImageIndex = (playbackTarget.currentImageIndex < (playbackTarget.mediaItems.length - 1) ? playbackTarget.currentImageIndex + 1 : 0);

                    // Initialize fade parameters
                    var fadeInOpacity = 0,
                        fadeOutOpacity = 100,
                        frameCounter = 0,
                        totalFrames = playbackTarget.animationFrames,
                        opacityStep = fadeOutOpacity / totalFrames;

                    // Get references to the images involved in the transition
                    fadingInElement = mediaStack.getElementByIdentifier(playbackTarget.instanceId + '_' + playbackTarget.currentImageIndex);
                    fadingOutElement = mediaStack.getElementByIdentifier(playbackTarget.instanceId + '_' + playbackTarget.lastImageIndex);

                    // Perform the fade transition if both elements exist
                    if (fadingInElement && fadingOutElement) {
                        // Handle IE-specific non-fade scenario (rough edges)
                        if (playbackTarget.isIEBrowser && playbackTarget.disableIeAlphaFilter) {
                            fadingOutElement.style.visibility = 'hidden';
                            fadingInElement.style.visibility = 'visible';
                            playbackTarget.lastImageIndex = playbackTarget.currentImageIndex; // Update last image
                        } else {
                            // Prepare elements for fading
                            if (playbackTarget.isIEBrowser) {
                                fadingOutElement.style.filter = "alpha(opacity=100)";
                            } else {
                                fadingOutElement.style.opacity = 1;
                            }
                            fadingOutElement.style.visibility = 'visible';

                            if (playbackTarget.isIEBrowser) {
                                fadingInElement.style.filter = "alpha(opacity=0)";
                            } else {
                                fadingInElement.style.opacity = 0;
                            }
                            fadingInElement.style.visibility = 'visible';

                            // Clear any previous fade interval
                            if (fadeIntervalId) {
                                window.clearInterval(fadeIntervalId);
                            }

                            // Start the fade animation interval
                            fadeIntervalId = window.setInterval(function() {
                                fadeInOpacity += opacityStep;
                                if (playbackTarget.isIEBrowser) {
                                    fadingInElement.style.filter = "alpha(opacity=" + fadeInOpacity + ")";
                                } else {
                                    fadingInElement.style.opacity = fadeInOpacity / 100;
                                }

                                fadeOutOpacity -= opacityStep;
                                if (playbackTarget.isIEBrowser) {
                                    fadingOutElement.style.filter = "alpha(opacity=" + fadeOutOpacity + ")";
                                } else {
                                    fadingOutElement.style.opacity = fadeOutOpacity / 100;
                                }

                                frameCounter++; // Increment frame counter

                                // End fade animation when all frames are rendered
                                if (frameCounter > totalFrames) {
                                    window.clearInterval(fadeIntervalId); // Stop fade interval

                                    // Ensure final opacity states are set
                                    if (playbackTarget.isIEBrowser) {
                                        fadingInElement.style.filter = "alpha(opacity=100)";
                                        fadingInElement.style.filter = ""; // Clear IE filter for better rendering sometimes
                                        fadingOutElement.style.filter = "alpha(opacity=0)";
                                    } else {
                                        fadingInElement.style.opacity = 1;
                                        fadingOutElement.style.opacity = 0;
                                    }
                                    fadingOutElement.style.visibility = 'hidden'; // Hide the faded-out element
                                    playbackTarget.lastImageIndex = playbackTarget.currentImageIndex; // Update last image
                                }
                            }, 30); // Interval for each fade step (approx 30ms)
                        }
                    } else {
                        window.clearInterval(playbackTarget.playbackIntervalId); // Stop playback if elements are missing
                    }
                }, playbackTarget.animationDelay); // Main interval for changing images
            }
        } else {
            mediaStack.logMessage('warn', 'mediaStack.startPlayback(): target object is invalid or inactive');
        }
        return false;
    },

    // Pauses the current image playback
    pausePlayback: function(pauseTarget) {
        // Check if the target is valid and active, then clear its timer
        if (pauseTarget && typeof(pauseTarget.isActiveFlag) === "boolean" && pauseTarget.isActiveFlag) {
            if (pauseTarget.playbackIntervalId) {
                window.clearInterval(pauseTarget.playbackIntervalId);
            }
        } else {
            mediaStack.logMessage('warn', 'mediaStack.pausePlayback(): target object is invalid or inactive');
        }
        return false;
    },

    // Removes a component and cleans up its resources
    deregisterComponent: function(removalTarget) {
        // Ensure the target is valid and active
        if (removalTarget && typeof(removalTarget.isActiveFlag) === "boolean" && removalTarget.isActiveFlag) {
            if (removalTarget.playbackIntervalId) {
                window.clearInterval(removalTarget.playbackIntervalId); // Clear any active playback timer
            }
            // If not IE Trident, remove canvas elements
            if (!removalTarget.isIEBrowser) {
                var canvasElements = removalTarget.getElementsByTagName('canvas');
                for (var loopIndex = 0; loopIndex < canvasElements.length; loopIndex++) {
                    removalTarget.removeChild(canvasElements[loopIndex]);
                }
            }
            removalTarget.innerHTML = ''; // Clear all inner HTML
            removalTarget.isActiveFlag = false; // Mark as inactive
        } else {
            mediaStack.logMessage('warn', 'mediaStack.deregisterComponent(): target object is invalid or inactive');
        }
        return false;
    },

    // Logs messages to the console or other fallback mechanisms
    logMessage: function(logType, logValue) {
        logType = logType.toLowerCase() || 'info'; // Default to 'info' if type is not specified
        if (window.console) {
            window.console[logType](logValue); // Use browser console if available
        } else if (window.opera) {
            window.opera.postError(logType + ': ' + logValue); // Opera specific error reporting
        } else {
            window.document.title = logType + ': ' + logValue; // Fallback to document title
        }
    },

    // Retrieves a DOM element by its ID
    getElementByIdentifier: function(elementIdentifier) {
        return (document.getElementById(elementIdentifier));
    },

    // Creates a new DOM element with the specified tag name
    createDomElement: function(tagName) {
        return (document.createElement(tagName));
    },

    // Appends a child DOM element to a parent
    appendDomChild: function(parentElement, childElement) {
        parentElement.appendChild(childElement);
    }
};