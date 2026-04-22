(function (globalWindow, domDocument, jQuery, undefined) {
    "use strict";

    // Root HTML element and global window/document objects
    const docRoot = jQuery("html");
    const viewPort = jQuery(globalWindow);
    const docBody = jQuery(domDocument);

    // Main LightboxKit object, aliased for internal use
    const LightboxKit = jQuery.lightboxKit = function () {
        LightboxKit.launch.apply(this, arguments);
    };

    // Feature detection and utility functions
    const isLegacyBrowser = navigator.userAgent.match(/msie/i); // Checks for Internet Explorer
    let hasBeenUpdated = null; // Flag for tracking UI updates
    const isTouchDevice = domDocument.createTouch !== undefined; // Detects touch-enabled devices

    // Helper to check if an object is a jQuery instance
    const isJQueryInstance = function (candidate) {
        return candidate && candidate.hasOwnProperty && candidate instanceof jQuery;
    };

    // Helper to verify if a value is a string
    const isTextual = function (candidateString) {
        return candidateString && typeof candidateString === "string";
    };

    // Helper to check if a string represents a percentage value
    const isRatioValue = function (inputString) {
        return isTextual(inputString) && inputString.indexOf('%') > 0;
    };

    // Helper to determine if an element has scrollable content
    const canScroll = function (targetElement) {
        if (!targetElement || (targetElement.style.overflow && targetElement.style.overflow === 'hidden')) {
            return false;
        }
        const hasHorizontalScroll = targetElement.clientWidth && targetElement.scrollWidth > targetElement.clientWidth;
        const hasVerticalScroll = targetElement.clientHeight && targetElement.scrollHeight > targetElement.clientHeight;
        return hasHorizontalScroll || hasVerticalScroll;
    };

    // Converts an input value (string or number) into an integer, potentially scaling by dimension
    const getNumericValue = function (originalValue, dimensionType) {
        let numericResult = parseInt(originalValue, 10) || 0; // Parse as integer, default to 0

        // If a dimension type is provided and the value is a percentage, calculate based on viewport
        if (dimensionType && isRatioValue(originalValue)) {
            const viewportDimensions = LightboxKit.getViewportDimensions();
            if (viewportDimensions && viewportDimensions[dimensionType]) {
                numericResult = viewportDimensions[dimensionType] / 100 * numericResult;
            } else {
                // Fallback for cases where viewport dimension is missing (e.g., 'x' or 'y')
                console.warn("Invalid dimension type provided for percentage calculation:", dimensionType);
            }
        }
        return Math.ceil(numericResult); // Round up to the nearest whole number
    };

    // Formats a value into a pixel string (e.g., "100px")
    const getPixelValue = function (inputVal, dimKey) {
        return getNumericValue(inputVal, dimKey) + 'px';
    };

    // Extend the main LightboxKit object with static properties and methods
    jQuery.extend(LightboxKit, {
        // Current version of the LightboxKit library
        libVersion: '2.1.5',

        // Default configuration settings for the lightbox
        configPresets: {
            contentPadding: 20, // Padding around the content
            outerMargin: 25,    // Margin around the entire lightbox container

            defaultWidth: 800,  // Default content width
            defaultHeight: 600, // Default content height
            minimumWidth: 100,  // Minimum allowed content width
            minimumHeight: 100, // Minimum allowed content height
            maximumWidth: 9999, // Maximum allowed content width
            maximumHeight: 9999,// Maximum allowed content height
            devicePixelRatio: 1, // Set to 2 for Retina display support

            autoSizeContent: true, // Automatically adjust content dimensions
            autoHeightAdjust: false, // Automatically adjust content height
            autoWidthAdjust: false,  // Automatically adjust content width

            responsiveResize: true,  // Enable responsive resizing on window changes
            centerOnScreen: !isTouchDevice, // Automatically center the lightbox (disabled for touch by default)
            fitContentToView: true,  // Ensure content fits within the viewport
            maintainAspectRatio: false, // Keep content aspect ratio
            verticalPositionRatio: 0.5, // Vertical positioning (0.5 for center)
            horizontalPositionRatio: 0.5, // Horizontal positioning (0.5 for center)

            scrollBehavior: 'auto', // 'auto', 'yes', or 'no' for content scrolling
            customWrapClass: '',    // Custom CSS class for the wrapper element

            showNavigationArrows: true, // Display navigation arrows
            showCloseButton: true,      // Display the close button
            closeOnClick: false,        // Close when clicking on the overlay
            nextOnClick: false,         // Navigate to next item on content click
            enableMouseWheel: true,     // Enable mouse wheel navigation
            autoPlaySlideshow: false,   // Start slideshow automatically
            slideshowInterval: 3000,    // Slideshow transition interval in ms
            preloadItems: 3,            // Number of items to preload
            isModal: false,             // Modal mode (disables closing on escape/click outside)
            loopCollection: true,       // Loop through the collection of items

            ajaxConfig: {
                requestDataType: 'html',
                requestHeaders: { 'X-LightboxKit': true }
            },
            iframeConfig: {
                iframeScrolling: 'no',
                iframePreload: true
            },
            flashConfig: {
                flashWmode: 'transparent',
                flashAllowFullScreen: 'true',
                flashAllowScriptAccess: 'always'
            },

            keyboardShortcuts: {
                nextItem: {
                    13: 'left', // Enter key
                    34: 'up',   // Page Down key
                    39: 'left', // Right arrow key
                    40: 'up'    // Down arrow key
                },
                prevItem: {
                    8: 'right',  // Backspace key
                    33: 'down',   // Page Up key
                    37: 'right',  // Left arrow key
                    38: 'down'    // Up arrow key
                },
                closeLightbox: [27], // Escape key
                togglePlay: [32],    // Space key - start/stop slideshow
                toggleFullscreen: [70] // 'f' key - toggle fullscreen
            },

            itemTransitionDirection: {
                next: 'left', // Direction for next item transition
                prev: 'right' // Direction for previous item transition
            },

            allowScrollOutside: true, // Allow scrolling the parent page when lightbox is open

            // Dynamic content properties
            initialIndex: 0,
            contentType: null,
            contentSource: null, // URL or selector
            contentBody: null,   // Actual content (HTML string, DOM element)
            contentTitle: null,

            // HTML templates used for rendering various parts of the lightbox
            uiTemplates: {
                mainWrapper: '<div class="lbk-wrap" tabIndex="-1"><div class="lbk-skin"><div class="lbk-outer"><div class="lbk-inner"></div></div></div></div>',
                imageDisplay: '<img class="lbk-image" src="{href}" alt="" />',
                iframeDisplay: '<iframe id="lbk-frame{uniqueID}" name="lbk-frame{uniqueID}" class="lbk-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (isLegacyBrowser ? ' allowtransparency="true"' : '') + '></iframe>',
                errorMessage: '<p class="lbk-error">Content could not be loaded.<br/>Please retry later.</p>',
                closeControl: '<a title="Close" class="lbk-item lbk-close" href="javascript:;"></a>',
                nextControl: '<a title="Next" class="lbk-nav lbk-next" href="javascript:;"><span></span></a>',
                prevControl: '<a title="Previous" class="lbk-nav lbk-prev" href="javascript:;"><span></span></a>'
            },

            // Animation properties for different actions
            // Opening the lightbox
            openAnimationEffect: 'fade', // 'elastic', 'fade', or 'none'
            openAnimationSpeed: 250,
            openAnimationEasing: 'swing',
            openWithOpacity: true,
            openAnimationMethod: 'zoomIn',

            // Closing the lightbox
            closeAnimationEffect: 'fade', // 'elastic', 'fade', or 'none'
            closeAnimationSpeed: 250,
            closeAnimationEasing: 'swing',
            closeWithOpacity: true,
            closeAnimationMethod: 'zoomOut',

            // Transitioning to the next gallery item
            nextItemEffect: 'elastic', // 'elastic', 'fade', or 'none'
            nextItemSpeed: 250,
            nextItemEasing: 'swing',
            nextItemMethod: 'changeIn',

            // Transitioning to the previous gallery item
            prevItemEffect: 'elastic', // 'elastic', 'fade', or 'none'
            prevItemSpeed: 250,
            prevItemEasing: 'swing',
            prevItemMethod: 'changeOut',

            // Enable default helper modules
            helperModules: {
                overlay: true,
                title: true
            },

            // Callback functions at various lifecycle stages
            onCancellation: jQuery.noop,    // Called if operation is canceled
            beforeContentLoad: jQuery.noop, // Before content starts loading
            afterContentLoad: jQuery.noop,  // After content has loaded
            beforeDisplayShow: jQuery.noop, // Before the current item is shown
            afterDisplayShow: jQuery.noop,  // After the lightbox has fully opened
            beforeItemChange: jQuery.noop,  // Before changing to a new gallery item
            beforeLightboxClose: jQuery.noop, // Before the lightbox starts closing
            afterLightboxClose: jQuery.noop   // After the lightbox has fully closed
        },

        // Current operational state of the lightbox
        collection: {},         // The array of items in the current gallery
        currentSettings: {},    // Merged options for the current session
        priorElement: null,     // The element that was previously active
        pendingElement: null,   // The element currently being loaded
        activeElement: null,    // The element currently displayed
        kitIsActive: false,     // True if lightbox is in an active state (opening/open/closing)
        kitIsOpen: false,       // True if the lightbox is fully visible
        kitHasOpened: false,    // True if the lightbox has been fully opened at least once

        containerWrap: null,    // The main wrapper jQuery object
        visualSkin: null,       // The skin container jQuery object
        outerShell: null,       // The outer content area jQuery object
        innerContent: null,     // The inner content area jQuery object

        mediaPlayer: {
            autoplayTimer: null,
            isActive: false
        },

        // Handles for ongoing asynchronous operations
        ajaxRequestHandle: null,
        imageLoader: null,

        // References to transition and helper modules
        animationHandlers: {},
        utilityModules: {},

        /*
         * Core static methods for LightboxKit control
         */

        // Initiates the lightbox display with a given group of items
        launch: function (itemGroup, displayOptions) {
            // Basic validation for the item group
            if (!itemGroup) {
                console.warn("LightboxKit.launch: No item group provided.");
                return;
            }

            // Ensure displayOptions is an object, if not, initialize it
            if (typeof displayOptions !== "object" || displayOptions === null) {
                displayOptions = {};
            }

            // If a lightbox is already active, attempt to close it first.
            // If the close operation is blocked by a callback, then abort launch.
            if (LightboxKit.terminate(true) === false) {
                console.log("LightboxKit.launch: Termination of existing instance blocked.");
                return;
            }

            // Normalize the itemGroup into an array of objects
            let processedGroup = [];
            if (!jQuery.isArray(itemGroup)) {
                processedGroup = isJQueryInstance(itemGroup) ? jQuery(itemGroup).get() : [itemGroup];
            } else {
                processedGroup = itemGroup;
            }

            // Iterate through each item in the group to standardize its properties
            jQuery.each(processedGroup, function (idx, rawItem) {
                let itemData = {};
                let itemHref, itemTitle, itemContent, itemType;
                let resolverResult, hrefParts, contentSelector;

                if (typeof rawItem === "object" && rawItem !== null) {
                    // If it's a DOM element, wrap it with jQuery
                    if (rawItem.nodeType) {
                        rawItem = jQuery(rawItem);
                    }

                    if (isJQueryInstance(rawItem)) {
                        itemData = {
                            contentSource: rawItem.data('lbk-href') || rawItem.attr('href'),
                            contentTitle: rawItem.data('lbk-title') || rawItem.attr('title'),
                            isDomElement: true,
                            sourceElement: rawItem
                        };
                        // Optionally merge metadata if jQuery.metadata plugin is available
                        if (jQuery.metadata) {
                            jQuery.extend(true, itemData, rawItem.metadata());
                        }
                    } else {
                        // If it's a plain object, use it directly
                        itemData = rawItem;
                    }
                } else if (isTextual(rawItem)) {
                    // If it's just a string, treat it as href
                    itemData = { contentSource: rawItem };
                } else {
                    // If item is neither object nor string, skip or log an error
                    console.warn("LightboxKit.launch: Invalid item in group at index", idx, rawItem);
                    return true; // continue to next item in $.each
                }

                // Determine content properties, prioritizing explicit options, then item data
                itemHref = displayOptions.contentSource !== undefined ? displayOptions.contentSource : (itemData.contentSource || (isTextual(rawItem) ? rawItem : null));
                itemTitle = displayOptions.contentTitle !== undefined ? displayOptions.contentTitle : (itemData.contentTitle || '');
                itemContent = displayOptions.contentBody !== undefined ? displayOptions.contentBody : itemData.contentBody;
                itemType = itemContent ? 'html' : (displayOptions.contentType !== undefined ? displayOptions.contentType : itemData.contentType);

                // If type is still undetermined and it's a DOM element, try to infer from data attributes or class names
                if (!itemType && itemData.isDomElement) {
                    itemType = rawItem.data('lbk-type');
                    if (!itemType) {
                        resolverResult = rawItem.prop('class').match(/lightboxkit\.(\w+)/);
                        itemType = resolverResult ? resolverResult[1] : null;
                    }
                }

                // If content source is a string, try to guess the content type
                if (isTextual(itemHref)) {
                    if (!itemType) {
                        // This would be replaced by LightboxKit.resolveContentType(itemHref)
                        if (LightboxKit.isImageSource(itemHref)) {
                            itemType = 'image';
                        } else if (LightboxKit.isFlashSource(itemHref)) {
                            itemType = 'swf';
                        } else if (itemHref.charAt(0) === '#') {
                            itemType = 'inline';
                        } else if (isTextual(rawItem) && !itemHref.match(/\.(jpg|gif|png|bmp|jpeg|webp)(\?.*)?$/i) && !itemHref.match(/\.(swf)(\?.*)?$/i)) {
                            // If it's a string, and not clearly an image/swf, assume html for ajax
                            itemType = 'ajax';
                        }
                    }

                    // For 'ajax' type, split URL for content selector (e.g., "/page.html #id")
                    if (itemType === 'ajax' && itemHref.indexOf(' ') > -1) {
                        hrefParts = itemHref.split(/\s+/, 2);
                        itemHref = hrefParts.shift();
                        contentSelector = hrefParts.shift();
                    }
                }

                // Resolve the actual content based on type
                if (!itemContent) {
                    switch (itemType) {
                        case 'inline':
                            if (itemHref) {
                                // Strip URL part for IE7 compatibility if it's a selector
                                itemContent = jQuery(isTextual(itemHref) ? itemHref.replace(/.*(?=#[^\s]+$)/, '') : itemHref);
                            } else if (itemData.isDomElement) {
                                itemContent = rawItem;
                            }
                            break;
                        case 'html':
                            itemContent = itemHref;
                            break;
                        default:
                            // If no type and no href, but it's a DOM element, treat as inline
                            if (!itemType && !itemHref && itemData.isDomElement) {
                                itemType = 'inline';
                                itemContent = rawItem;
                            }
                            break;
                    }
                }

                // Update the item object with resolved properties
                jQuery.extend(itemData, {
                    contentSource: itemHref,
                    contentType: itemType,
                    contentBody: itemContent,
                    contentTitle: itemTitle,
                    contentSelector: contentSelector
                });

                processedGroup[idx] = itemData; // Store the standardized item back into the array
            });

            // Merge default settings with user-provided options
            LightboxKit.currentSettings = jQuery.extend(true, {}, LightboxKit.configPresets, displayOptions);

            // Special handling for keyboard shortcuts: merge, don't overwrite completely
            if (displayOptions.keyboardShortcuts !== undefined) {
                if (displayOptions.keyboardShortcuts) {
                    LightboxKit.currentSettings.keyboardShortcuts = jQuery.extend({}, LightboxKit.configPresets.keyboardShortcuts, displayOptions.keyboardShortcuts);
                } else {
                    LightboxKit.currentSettings.keyboardShortcuts = false; // Disable if explicitly set to false
                }
            }

            LightboxKit.collection = processedGroup; // Set the current collection

            // Begin the display process with the specified initial item
            return LightboxKit._beginDisplay(LightboxKit.currentSettings.initialIndex);
        },

        // Aborts any ongoing content loading or display operations
        abortOperation: function () {
            const currentPending = LightboxKit.pendingElement;

            // Trigger onCancellation callback; if it returns false, stop the abortion
            if (LightboxKit.triggerEvent('onCancellation') === false) {
                console.log("LightboxKit.abortOperation: Cancellation blocked by callback.");
                return false;
            }

            LightboxKit.hideLoadingIndicator(); // Hide any active loading indicators

            if (!currentPending) {
                return; // Nothing pending to abort
            }

            // If an AJAX request is active, terminate it
            if (LightboxKit.ajaxRequestHandle && typeof LightboxKit.ajaxRequestHandle.abort === 'function') {
                LightboxKit.ajaxRequestHandle.abort();
                LightboxKit.ajaxRequestHandle = null;
            }

            // If an image preload is active, clear its event handlers
            if (LightboxKit.imageLoader) {
                LightboxKit.imageLoader.onload = LightboxKit.imageLoader.onerror = null;
                LightboxKit.imageLoader = null;
            }

            // If the pending item has a wrapper, stop its animations, trigger reset, and remove it
            if (currentPending.containerWrap) {
                currentPending.containerWrap.stop(true, true).trigger('onReset').remove();
            }

            LightboxKit.pendingElement = null; // Clear the pending element reference

            // If no item is currently active, it means the first item was canceled during loading
            // In this case, perform a full cleanup after zoom out.
            if (!LightboxKit.activeElement) {
                LightboxKit._postZoomOutCleanup(currentPending);
            }
            return true;
        },

        // Closes the lightbox, optionally bypassing animation if `forceImmediate` is true
        terminate: function (forceImmediate) {
            // First, attempt to abort any pending operations
            LightboxKit.abortOperation();

            // Trigger `beforeLightboxClose` callback; if it returns false, block termination
            if (LightboxKit.triggerEvent('beforeLightboxClose') === false) {
                console.log("LightboxKit.terminate: Closing blocked by callback.");
                return false;
            }

            LightboxKit.removeEventHandlers(); // Unbind all lightbox-specific event listeners

            // If the lightbox is not active, there's nothing to close
            if (!LightboxKit.kitIsActive) {
                return;
            }

            // If not fully open or forced immediate, just remove elements directly
            if (!LightboxKit.kitIsOpen || forceImmediate === true) {
                jQuery('.lbk-wrap').stop(true).trigger('onReset').remove();
                LightboxKit._postZoomOutCleanup(); // Perform cleanup
            } else {
                // Otherwise, initiate the closing animation
                LightboxKit.kitIsOpen = LightboxKit.kitHasOpened = false;
                LightboxKit.isClosing = true; // Set a flag indicating closure is in progress

                // Remove UI elements like close button and navigation arrows
                jQuery('.lbk-item, .lbk-nav').remove();

                // Stop any animations on the wrapper, remove 'lbk-opened' class
                LightboxKit.containerWrap.stop(true, true).removeClass('lbk-opened');

                // Execute the defined close animation method
                const closeMethod = LightboxKit.activeElement && LightboxKit.activeElement.closeAnimationMethod
                    ? LightboxKit.activeElement.closeAnimationMethod
                    : LightboxKit.currentSettings.closeAnimationMethod;

                if (LightboxKit.animationHandlers[closeMethod]) {
                    LightboxKit.animationHandlers[closeMethod]();
                } else {
                    console.warn(`LightboxKit.terminate: No animation handler found for method "${closeMethod}".`);
                    LightboxKit._postZoomOutCleanup(); // Fallback to immediate cleanup
                }
            }
            return true;
        },

        // Manages the slideshow functionality
        //   LightboxKit.startSlideshow(); - toggles slideshow
        //   LightboxKit.startSlideshow( true ); - starts slideshow
        //   LightboxKit.startSlideshow( false ); - stops slideshow
        startSlideshow: function (actionCommand) {
            // Internal function to clear any active slideshow timer
            const clearTimer = function () {
                clearTimeout(LightboxKit.mediaPlayer.autoplayTimer);
            };

            // Internal function to set a new slideshow timer
            const setupTimer = function () {
                clearTimer(); // Clear existing timer first
                // If an item is active and slideshow is active, set a new timer for the next item
                if (LightboxKit.activeElement && LightboxKit.mediaPlayer.isActive) {
                    LightboxKit.mediaPlayer.autoplayTimer = setTimeout(LightboxKit.advanceItem, LightboxKit.activeElement.slideshowInterval);
                }
            };

            // Internal function to stop the slideshow
            const haltSlideshow = function () {
                clearTimer(); // Clear the timer
                docBody.off('.mediaPlayer'); // Unbind player-specific events
                LightboxKit.mediaPlayer.isActive = false; // Mark player as inactive
                LightboxKit.triggerEvent('onPlayEnd'); // Trigger end event
            };

            // Internal function to start the slideshow
            const initiateSlideshow = function () {
                // Ensure there's an active item and the collection allows looping or has more items
                if (LightboxKit.activeElement && (LightboxKit.activeElement.loopCollection || LightboxKit.activeElement.initialIndex < LightboxKit.collection.length - 1)) {
                    LightboxKit.mediaPlayer.isActive = true; // Mark player as active

                    // Bind events to control the slideshow
                    docBody.on({
                        'onCancellation.mediaPlayer beforeLightboxClose.mediaPlayer': haltSlideshow,
                        'onUpdate.mediaPlayer': setupTimer,
                        'beforeContentLoad.mediaPlayer': clearTimer
                    });

                    setupTimer(); // Set the initial timer
                    LightboxKit.triggerEvent('onPlayStart'); // Trigger start event
                }
            };

            // Logic to handle the action command
            if (actionCommand === true || (!LightboxKit.mediaPlayer.isActive && actionCommand !== false)) {
                initiateSlideshow(); // Start slideshow
            } else {
                haltSlideshow(); // Stop slideshow
            }
        },

        // Navigates to the next item in the gallery
        advanceItem: function (transitionDirection) {
            const currentActive = LightboxKit.activeElement;

            if (currentActive) {
                // If no direction is specified, use the default next direction from current item config
                if (!isTextual(transitionDirection)) {
                    transitionDirection = currentActive.itemTransitionDirection.next;
                }
                // Navigate to the next index
                LightboxKit.navigateToItem(currentActive.initialIndex + 1, transitionDirection, 'next');
            }
        },

        // Navigates to the previous item in the gallery
        revertItem: function (transitionDirection) {
            const currentActive = LightboxKit.activeElement;

            if (currentActive) {
                // If no direction is specified, use the default previous direction from current item config
                if (!isTextual(transitionDirection)) {
                    transitionDirection = currentActive.itemTransitionDirection.prev;
                }
                // Navigate to the previous index
                LightboxKit.navigateToItem(currentActive.initialIndex - 1, transitionDirection, 'prev');
            }
        },

        // Dummy functions (placeholders for actual implementation)
        _beginDisplay: jQuery.noop,
        _postZoomOutCleanup: jQuery.noop,
        hideLoadingIndicator: jQuery.noop,
        triggerEvent: jQuery.noop,
        removeEventHandlers: jQuery.noop,
        navigateToItem: jQuery.noop,
        getViewportDimensions: function () { return { width: viewPort.width(), height: viewPort.height() }; },
        isImageSource: function (src) { return src.match(/\.(jpg|gif|png|bmp|jpeg|webp)(\?.*)?$/i); },
        isFlashSource: function (src) { return src.match(/\.(swf)(\?.*)?$/i); }
    });

})(window, document, jQuery);