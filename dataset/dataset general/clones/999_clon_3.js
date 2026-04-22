(function (globalWindow, domDocument, jQueryAlias, undefined) {
    "use strict";

    // --- Core Display Manager (CDM) - A modern content overlay system ---
    // This module handles the presentation of various media types in an interactive overlay.
    // Version: 2.1.5 (Refactored)
    // Requires: jQuery v1.9+
    // License: MIT - For educational cloning purposes.
    // Copyright 2024 - CodeClone Labs

    const bodyElement = jQueryAlias("body"); // Using body for some global operations
    const htmlElement = jQueryAlias("html");
    const windowObject = jQueryAlias(globalWindow);
    const documentObject = jQueryAlias(domDocument);

    // Main API object for the overlay system
    const overlaySystem = jQueryAlias.contentDisplay = function () {
        overlaySystem.launchView.apply(this, arguments);
    };

    // Environment detection flags
    const isLegacyIE = globalWindow.navigator.userAgent.match(/msie/i);
    let updatePending = null; // Used for debouncing updates
    const hasTouchSupport = domDocument.createTouch !== undefined;

    /**
     * Checks if an object is a jQuery instance.
     * @param {any} testVal - The value to check.
     * @returns {boolean} True if it's a jQuery object.
     */
    const isJqueryInstance = (testVal) => testVal && testVal.jquery && testVal instanceof jQueryAlias;

    /**
     * Verifies if a variable is a string.
     * @param {any} testVal - The value to check.
     * @returns {boolean} True if it's a string.
     */
    const isSimpleString = (testVal) => typeof testVal === "string";

    /**
     * Determines if a string represents a percentage value.
     * @param {string} inputStr - The string to evaluate.
     * @returns {boolean} True if the string contains a percentage sign.
     */
    const isPercentValue = (inputStr) => isSimpleString(inputStr) && inputStr.includes('%');

    /**
     * Checks if an element has scrollable content.
     * @param {HTMLElement} targetEl - The DOM element to inspect.
     * @returns {boolean} True if the element can be scrolled.
     */
    const canElementScroll = (targetEl) => {
        if (!targetEl || targetEl.style.overflow === 'hidden') return false;
        const hasHorizontalScroll = targetEl.clientWidth && targetEl.scrollWidth > targetEl.clientWidth;
        const hasVerticalScroll = targetEl.clientHeight && targetEl.scrollHeight > targetEl.clientHeight;
        return hasHorizontalScroll || hasVerticalScroll;
    };

    /**
     * Converts a dimension value (e.g., "50%", "100px") into an absolute pixel value.
     * @param {string|number} dimensionValue - The input dimension.
     * @param {string} dimensionType - 'width' or 'height' for percentage calculations.
     * @returns {number} The calculated pixel value.
     */
    const convertToPixels = (dimensionValue, dimensionType) => {
        let numericValue = parseInt(dimensionValue, 10) || 0;

        if (dimensionType && isPercentValue(dimensionValue)) {
            const viewportDims = overlaySystem.fetchViewportDimensions();
            numericValue = (viewportDims[dimensionType] / 100) * numericValue;
        }
        return Math.ceil(numericValue);
    };

    /**
     * Returns a CSS pixel string from a dimension value.
     * @param {string|number} dimensionValue - The input dimension.
     * @param {string} dimKey - 'width' or 'height'.
     * @returns {string} CSS pixel string.
     */
    const getPixelStyle = (dimensionValue, dimKey) => `${convertToPixels(dimensionValue, dimKey)}px`;

    // Extend the main overlaySystem object with properties and methods
    jQueryAlias.extend(overlaySystem, {
        // Current module version
        moduleVersion: '2.1.5',

        // Default configuration options for the display manager
        defaultSettings: {
            framePadding: 15,
            frameMargin: 20,

            viewWidth: 800,
            viewHeight: 600,
            minViewWidth: 100,
            minViewHeight: 100,
            maxViewWidth: 9999,
            maxViewHeight: 9999,
            displayPixelRatio: 1, // Useful for high-DPI screens

            responsiveSizing: true,
            autoAdjustHeight: false,
            autoAdjustWidth: false,

            autoResizeWindow: true,
            autoCenterView: !hasTouchSupport, // Disable auto-centering on touch devices by default
            fitContentToView: true,
            maintainAspectRatio: false,
            verticalPositionRatio: 0.5,
            horizontalPositionRatio: 0.5,

            overflowBehavior: 'auto', // 'auto', 'yes' or 'no'
            customWrapClass: '',

            showNavigationArrows: true,
            showCloseButton: true,
            closeOnBackgroundClick: false,
            nextOnClick: false,
            enableMouseWheel: true,
            enableAutoPlay: false,
            autoPlayInterval: 3000,
            preloadItems: 3,
            isModal: false, // Prevents closing on escape/overlay click if true
            loopContent: true,

            ajaxOptions: {
                dataType: 'html',
                headers: { 'X-ContentDisplay': true }
            },
            iframeOptions: {
                scrolling: 'auto',
                preloadFrame: true
            },
            flashOptions: {
                wmode: 'transparent',
                allowfullscreen: 'true',
                allowscriptaccess: 'always'
            },

            keyboardControls: {
                // Key mappings for navigation
                nextItem: {
                    13: 'left', // Enter
                    34: 'up',   // Page Down
                    39: 'left', // Right arrow
                    40: 'up'    // Down arrow
                },
                prevItem: {
                    8: 'right',  // Backspace
                    33: 'down',   // Page Up
                    37: 'right',  // Left arrow
                    38: 'down'    // Up arrow
                },
                exitDisplay: [27], // Escape key
                togglePlay: [32], // Space - start/stop slideshow
                toggleFullscreen: [70]  // Letter "f"
            },

            navigationDirection: {
                next: 'left',
                prev: 'right'
            },

            allowScrollOutside: true,

            // Item-specific overrides
            startIndex: 0,
            contentType: null,
            contentSource: null,
            contentData: null,
            itemTitle: null,

            // HTML structure templates
            displayTemplates: {
                mainWrapper: '<div class="content-display-wrapper" tabindex="-1"><div class="content-display-skin"><div class="content-display-outer"><div class="content-display-inner"></div></div></div></div>',
                imageItem: '<img class="content-display-image" src="{contentSource}" alt="" />',
                iframeItem: `<iframe id="content-display-frame{uniqueId}" name="content-display-frame{uniqueId}" class="content-display-iframe" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen${isLegacyIE ? ' allowtransparency="true"' : ''}></iframe>`,
                errorMessage: '<p class="content-display-error">Oops! Content could not be loaded.<br/>Please check the source or try again.</p>',
                closeButton: '<a title="Close Viewer" class="content-display-button content-display-close" href="javascript:;"></a>',
                nextButton: '<a title="Next Item" class="content-display-nav content-display-next" href="javascript:;"><span></span></a>',
                prevButton: '<a title="Previous Item" class="content-display-nav content-display-prev" href="javascript:;"><span></span></a>',
                loadingSpinner: '<div id="content-display-loading"><div></div></div>'
            },

            // Animation properties
            // Opening sequence
            entryAnimation: 'fade', // 'elastic', 'fade' or 'none'
            entrySpeed: 250,
            entryEasing: 'swing',
            entryOpacityEffect: true,
            entryMethod: 'zoomIn',

            // Closing sequence
            exitAnimation: 'fade', // 'elastic', 'fade' or 'none'
            exitSpeed: 250,
            exitEasing: 'swing',
            exitOpacityEffect: true,
            exitMethod: 'zoomOut',

            // Transitioning to next item
            nextTransition: 'elastic', // 'elastic', 'fade' or 'none'
            nextTransitionSpeed: 250,
            nextTransitionEasing: 'swing',
            nextTransitionMethod: 'changeIn',

            // Transitioning to previous item
            prevTransition: 'elastic', // 'elastic', 'fade' or 'none'
            prevTransitionSpeed: 250,
            prevTransitionEasing: 'swing',
            prevTransitionMethod: 'changeOut',

            // Enabled helper modules
            enabledHelpers: {
                overlay: true,
                title: true
            },

            // Callback hooks
            onOperationCancel: jQueryAlias.noop, // When an operation is cancelled
            onBeforeContentLoad: jQueryAlias.noop, // Before content loading starts
            onAfterContentLoad: jQueryAlias.noop, // After content is loaded
            onBeforeDisplayShow: jQueryAlias.noop, // Before display becomes visible
            onAfterDisplayShow: jQueryAlias.noop, // After display is fully shown
            onBeforeItemChange: jQueryAlias.noop, // Before switching gallery items
            onBeforeDisplayClose: jQueryAlias.noop, // Before display starts closing
            onAfterDisplayClose: jQueryAlias.noop  // After display is fully closed
        },

        // --- Internal State Variables ---
        currentGroup: {},       // The collection of items to display
        activeOptions: {},      // Merged configuration for the current group
        previousItem: null,     // Reference to the item previously displayed
        incomingItem: null,     // The item currently being prepared/loaded
        currentItem: null,      // The item currently visible in the display
        isDisplayActive: false, // True if the display manager is active (loading or showing)
        isDisplayOpen: false,   // True if the display is currently shown
        hasDisplayOpened: false,// True if the display has been fully opened at least once

        displayWrapper: null,   // The main jQuery wrapper element
        displaySkin: null,      // The skin element
        displayOuter: null,     // The outer container
        displayInner: null,     // The inner content container

        slideshowManager: {
            timerHandle: null,
            isSlideshowActive: false
        },

        // Loaders for content
        activeAjaxRequest: null,
        imagePreloader: null,

        // Collection of registered transition effects and helper modules
        animationEffects: {},
        utilityModules: {},

        /*
         * Public API Methods
         */

        /**
         * Initializes and opens the content display with a group of items.
         * @param {Array|HTMLElement|jQuery} contentSourceGroup - The items to display.
         * @param {Object} [overrideOptions] - Options to merge with defaults.
         * @returns {boolean|undefined} False if an operation fails, undefined otherwise.
         */
        launchView: function (contentSourceGroup, overrideOptions) {
            // Early exit if no content is provided
            if (!contentSourceGroup) {
                console.warn("ContentDisplay: No content provided for launchView.");
                return;
            }

            // Ensure options is an object
            const currentOptions = jQueryAlias.isPlainObject(overrideOptions) ? overrideOptions : {};

            // If an instance is already active, attempt to close it first.
            // If the close operation is explicitly prevented (returns false), then abort.
            if (this.shutDown(true) === false) {
                return;
            }

            // Normalize the input group into an array of objects
            let normalizedGroup = [];
            if (Array.isArray(contentSourceGroup)) {
                normalizedGroup = [...contentSourceGroup];
            } else if (isJqueryInstance(contentSourceGroup)) {
                normalizedGroup = contentSourceGroup.get();
            } else {
                normalizedGroup = [contentSourceGroup];
            }

            // Process each item in the group to determine its type and properties
            for (let i = 0; i < normalizedGroup.length; i++) {
                let item = normalizedGroup[i];
                let itemDetails = {};
                let itemHref, itemTitle, itemContent, itemType, typeMatch, urlParts, contentSelector;

                // Handle jQuery objects or DOM elements
                if (isJqueryInstance(item) || item.nodeType) {
                    const jqueryElement = jQueryAlias(item);
                    itemDetails = {
                        contentSource: jqueryElement.data('display-href') || jqueryElement.attr('href'),
                        itemTitle: jqueryElement.data('display-title') || jqueryElement.attr('title') || '',
                        isDomElement: true,
                        sourceElement: jqueryElement
                    };
                    // Clean up title HTML if present
                    itemDetails.itemTitle = jQueryAlias('<div/>').text(itemDetails.itemTitle).html();

                } else if (typeof item === "object" && item !== null) {
                    // Assume it's already an object with content properties
                    itemDetails = item;
                } else if (isSimpleString(item)) {
                    // If it's just a string, treat it as a href or HTML content
                    itemDetails.contentSource = item;
                } else {
                    console.warn("ContentDisplay: Unrecognized item format in group:", item);
                    continue; // Skip invalid items
                }

                // Merge item-specific overrides with global options
                itemHref = currentOptions.contentSource || itemDetails.contentSource || (isSimpleString(item) ? item : null);
                itemTitle = (currentOptions.itemTitle !== undefined) ? currentOptions.itemTitle : itemDetails.itemTitle || '';
                itemContent = currentOptions.contentData || itemDetails.contentData;
                itemType = itemContent ? 'html' : (currentOptions.contentType || itemDetails.contentType);

                // Try to infer type from DOM element's data attribute or class
                if (!itemType && itemDetails.isDomElement) {
                    itemType = itemDetails.sourceElement.data('display-type');
                    if (!itemType) {
                        typeMatch = itemDetails.sourceElement.prop('class').match(/content-display\.(\w+)/);
                        itemType = typeMatch ? typeMatch[1] : null;
                    }
                }

                // Further infer type if contentSource is a string
                if (isSimpleString(itemHref)) {
                    if (!itemType) {
                        // Check common file extensions/patterns
                        if (overlaySystem.isImageFile(itemHref)) {
                            itemType = 'image';
                        } else if (overlaySystem.isFlashFile(itemHref)) {
                            itemType = 'flash';
                        } else if (itemHref.startsWith('#')) {
                            itemType = 'inline';
                        } else if (isSimpleString(item) && !itemHref.includes('.')) { // Heuristic for raw HTML string
                            itemType = 'html';
                            itemContent = item;
                        }
                    }

                    // For AJAX, split URL and optional selector (e.g., "mypage.html #my_id")
                    if (itemType === 'ajax') {
                        urlParts = itemHref.split(/\s+/, 2);
                        itemHref = urlParts.shift();
                        contentSelector = urlParts.shift();
                    }
                }

                // Final content assignment based on type
                if (!itemContent) {
                    if (itemType === 'inline') {
                        // For inline content, href points to an ID selector
                        if (itemHref) {
                            itemContent = jQueryAlias(itemHref.replace(/.*(?=#[^\s]+$)/, '')); // Strip base URL for IE7 compatibility
                        } else if (itemDetails.isDomElement) {
                            itemContent = itemDetails.sourceElement;
                        }
                    } else if (itemType === 'html') {
                        itemContent = itemHref;
                    } else if (!itemType && !itemHref && itemDetails.isDomElement) {
                        // Fallback: if no type/href and it's a DOM element, treat as inline
                        itemType = 'inline';
                        itemContent = itemDetails.sourceElement;
                    }
                }

                // Update the item object with resolved properties
                Object.assign(itemDetails, {
                    contentSource: itemHref,
                    contentType: itemType,
                    contentData: itemContent,
                    itemTitle: itemTitle,
                    contentSelector: contentSelector
                });

                normalizedGroup[i] = itemDetails; // Store the processed item
            }

            // Merge global default settings with current options
            overlaySystem.activeOptions = jQueryAlias.extend(true, {}, overlaySystem.defaultSettings, currentOptions);

            // Handle keyboard controls merging separately to avoid deep merge issues
            if (currentOptions.keyboardControls !== undefined) {
                overlaySystem.activeOptions.keyboardControls = currentOptions.keyboardControls ?
                    jQueryAlias.extend({}, overlaySystem.defaultSettings.keyboardControls, currentOptions.keyboardControls) :
                    false; // Explicitly disable if false
            }

            overlaySystem.currentGroup = normalizedGroup;

            // Begin the display process with the specified start index
            return overlaySystem.beginDisplaySequence(overlaySystem.activeOptions.startIndex);
        },

        /**
         * Cancels any ongoing content loading or transition.
         * @returns {boolean} False if the cancellation was prevented by a callback.
         */
        abortLoading: function () {
            const currentIncoming = overlaySystem.incomingItem;

            if (currentIncoming && overlaySystem.notifyEvent('onOperationCancel') === false) {
                return false;
            }

            overlaySystem.hideLoadingSpinner();

            if (!currentIncoming) {
                return; // Nothing to cancel
            }

            // Abort any active AJAX request
            if (overlaySystem.activeAjaxRequest) {
                overlaySystem.activeAjaxRequest.abort();
                overlaySystem.activeAjaxRequest = null;
            }

            // Clear image preloader callbacks
            if (overlaySystem.imagePreloader) {
                overlaySystem.imagePreloader.onload = overlaySystem.imagePreloader.onerror = null;
                overlaySystem.imagePreloader = null;
            }

            // Clean up the incoming item's wrapper if it exists
            if (currentIncoming.displayWrapper) {
                currentIncoming.displayWrapper.stop(true, true).trigger('onReset').remove();
            }

            overlaySystem.incomingItem = null;

            // If no current item is shown, perform cleanup after initial zoom out
            if (!overlaySystem.currentItem) {
                overlaySystem.finishZoomOut(currentIncoming);
            }
        },

        /**
         * Initiates the closing animation or immediately removes the display.
         * @param {boolean} [forceImmediate=false] - If true, close immediately without animation.
         * @returns {boolean} False if closing is prevented by a callback.
         */
        shutDown: function (forceImmediate) {
            overlaySystem.abortLoading(); // Always try to cancel pending operations first

            if (overlaySystem.notifyEvent('onBeforeDisplayClose') === false) {
                return false; // Closing prevented
            }

            overlaySystem.removeEventHandlers();

            if (!overlaySystem.isDisplayActive) {
                return; // Not active, nothing to close
            }

            if (!overlaySystem.isDisplayOpen || forceImmediate === true) {
                // If not fully open or forced, remove immediately
                jQueryAlias('.content-display-wrapper').stop(true).trigger('onReset').remove();
                overlaySystem.finishZoomOut(); // Perform final cleanup
            } else {
                // Perform animated close
                overlaySystem.isDisplayOpen = false;
                overlaySystem.hasDisplayOpened = false; // Reset for next open
                overlaySystem.isClosingNow = true; // Flag for ongoing close operation

                jQueryAlias('.content-display-button, .content-display-nav').remove(); // Remove buttons

                // Stop any ongoing animations on the wrapper and remove 'opened' class
                overlaySystem.displayWrapper.stop(true, true).removeClass('content-display-opened');

                // Trigger the configured exit animation method
                const exitMethodName = overlaySystem.currentItem.exitMethod;
                if (overlaySystem.animationEffects[exitMethodName]) {
                    overlaySystem.animationEffects[exitMethodName]();
                } else {
                    console.warn(`ContentDisplay: Unknown exit method '${exitMethodName}'. Defaulting to instant close.`);
                    overlaySystem.finishZoomOut();
                }
            }
        },

        /**
         * Manages the slideshow functionality (start, stop, toggle).
         * @param {boolean} [shouldStart] - True to start, false to stop. If undefined, toggles.
         */
        manageSlideshow: function (shouldStart) {
            const clearPlaybackTimer = () => {
                clearTimeout(overlaySystem.slideshowManager.timerHandle);
            };

            const setPlaybackTimer = () => {
                clearPlaybackTimer();
                if (overlaySystem.currentItem && overlaySystem.slideshowManager.isSlideshowActive) {
                    overlaySystem.slideshowManager.timerHandle = setTimeout(overlaySystem.advanceToNext, overlaySystem.currentItem.autoPlayInterval);
                }
            };

            const stopSlideshow = () => {
                clearPlaybackTimer();
                documentObject.off('.slideshowPlayer'); // Unbind player-specific events
                overlaySystem.slideshowManager.isSlideshowActive = false;
                overlaySystem.notifyEvent('onPlayEnd');
            };

            const startSlideshow = () => {
                // Ensure there's a current item and it's not the last one if looping is disabled
                const canPlay = overlaySystem.currentItem && (overlaySystem.currentItem.loopContent || overlaySystem.currentItem.index < overlaySystem.currentGroup.length - 1);
                if (canPlay) {
                    overlaySystem.slideshowManager.isSlideshowActive = true;
                    documentObject.on({
                        'onOperationCancel.slideshowPlayer onBeforeDisplayClose.slideshowPlayer': stopSlideshow,
                        'onUpdate.slideshowPlayer': setPlaybackTimer,
                        'onBeforeContentLoad.slideshowPlayer': clearPlaybackTimer
                    });
                    setPlaybackTimer(); // Start the timer
                    overlaySystem.notifyEvent('onPlayStart');
                }
            };

            // Logic to start/stop/toggle
            if (shouldStart === true || (!overlaySystem.slideshowManager.isSlideshowActive && shouldStart !== false)) {
                startSlideshow();
            } else {
                stopSlideshow();
            }
        },

        /**
         * Navigates to the next item in the gallery.
         * @param {string} [transitionDirection] - Override the default transition direction.
         */
        advanceToNext: function (transitionDirection) {
            const activeItem = overlaySystem.currentItem;
            if (activeItem) {
                const direction = isSimpleString(transitionDirection) ? transitionDirection : activeItem.navigationDirection.next;
                overlaySystem.jumpToItem(activeItem.index + 1, direction, 'next');
            }
        },

        /**
         * Navigates to the previous item in the gallery.
         * @param {string} [transitionDirection] - Override the default transition direction.
         */
        revertToPrevious: function (transitionDirection) {
            const activeItem = overlaySystem.currentItem;
            if (activeItem) {
                const direction = isSimpleString(transitionDirection) ? transitionDirection : activeItem.navigationDirection.prev;
                overlaySystem.jumpToItem(activeItem.index - 1, direction, 'prev');
            }
        }
    });

    // --- Placeholder for methods that would be defined later in a full clone ---
    // These methods are referenced but not provided in the original snippet.
    // In a real clone, these would be implemented similar to the ones above.
    jQueryAlias.extend(overlaySystem, {
        beginDisplaySequence: jQueryAlias.noop, // Corresponds to _start
        hideLoadingSpinner: jQueryAlias.noop,   // Corresponds to hideLoading
        finishZoomOut: jQueryAlias.noop,        // Corresponds to _afterZoomOut
        removeEventHandlers: jQueryAlias.noop,  // Corresponds to unbindEvents
        notifyEvent: jQueryAlias.noop,          // Corresponds to trigger
        jumpToItem: jQueryAlias.noop,           // Corresponds to jumpto
        isImageFile: jQueryAlias.noop,          // Corresponds to F.isImage
        isFlashFile: jQueryAlias.noop,          // Corresponds to F.isSWF
        fetchViewportDimensions: () => ({ width: windowObject.width(), height: windowObject.height() }) // Corresponds to F.getViewport
    });

})(window, document, jQuery);