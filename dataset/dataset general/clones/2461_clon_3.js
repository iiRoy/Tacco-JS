(function (globalWindow, documentElement, jQueryAlias, undefinedValue) {
    "use strict";

    // Global references to key DOM elements and the main plugin object
    let htmlRoot = jQueryAlias("html"),
        viewportDimensionWatcher = jQueryAlias(globalWindow),
        documentObserver = jQueryAlias(documentElement),
        galleryCore = jQueryAlias.fancyApp = function () {
            // Entry point for launching the gallery, delegates to the main open function
            galleryCore.activateModal.apply(this, arguments);
        },
        // Check for Internet Explorer to handle specific quirks
        isLegacyBrowser = navigator.userAgent.match(/msie/i),
        // Flag to track if the display state has been updated
        displayUpdateRequired = null,
        // Detect touch device capabilities
        touchInteractionEnabled = documentElement.createTouch !== undefinedValue,

        // --- Core Utility Functions ---

        // Verifies if an object is a jQuery instance
        isJQueryWrapper = function (candidateObj) {
            return candidateObj && candidateObj.hasOwnProperty && candidateObj instanceof jQueryAlias;
        },
        // Determines if a value is a string type
        isTextValue = function (inputString) {
            return inputString && jQueryAlias.type(inputString) === "string";
        },
        // Checks if a string represents a percentage value
        isPercentageValue = function (inputString) {
            // Ensure it's a string and contains a '%' character
            if (!isTextValue(inputString)) {
                return false;
            }
            return inputString.indexOf('%') > -1;
        },
        // Ascertains if a given DOM element is scrollable
        elementScrollCheck = function (targetElement) {
            // An element is scrollable if it has content overflowing its visible area
            // and its overflow style isn't explicitly 'hidden'.
            if (!targetElement || (targetElement.style.overflow && targetElement.style.overflow === 'hidden')) {
                return false;
            }

            const hasHorizontalScroll = targetElement.clientWidth && targetElement.scrollWidth > targetElement.clientWidth;
            const hasVerticalScroll = targetElement.clientHeight && targetElement.scrollHeight > targetElement.clientHeight;

            return hasHorizontalScroll || hasVerticalScroll;
        },
        // Converts a dimension value (e.g., '100px', '50%') into an absolute pixel scalar
        retrieveNumericDimension = function (originalValue, dimensionType) {
            let numericResult = parseInt(originalValue, 10); // Attempt to parse as integer

            // If parsing fails, default to 0
            if (isNaN(numericResult)) {
                numericResult = 0;
            }

            // If a percentage is provided and a dimension type (e.g., 'width', 'height') is given
            if (dimensionType && isPercentageValue(originalValue)) {
                // Calculate percentage relative to the viewport
                const viewportDimensions = galleryCore.getViewportMetrics();
                if (viewportDimensions && viewportDimensions[dimensionType]) {
                    numericResult = (viewportDimensions[dimensionType] / 100) * numericResult;
                }
            }

            return Math.ceil(numericResult);
        },
        // Formats a dimension value into a CSS pixel string
        formatPixelDimension = function (inputDimension, dimensionDescriptor) {
            const calculatedScalar = retrieveNumericDimension(inputDimension, dimensionDescriptor);
            return calculatedScalar + 'px';
        };

    // --- Extend the main plugin object with properties and methods ---
    jQueryAlias.extend(galleryCore, {
        // The current release number of the fancyApp library
        libVersion: '2.1.5',

        // Default configuration options for the gallery
        defaultSettings: {
            contentPadding: 15,
            outerMargin: 20,

            contentWidth: 800,
            contentHeight: 600,
            minimumWidth: 100,
            minimumHeight: 100,
            maximumWidth: 9999,
            maximumHeight: 9999,
            displayPixelRatio: 1, // Set to 2 for retina display support

            autoSizeContent: true,
            autoHeightContent: false,
            autoWidthContent: false,

            autoResizeWindow: true,
            autoCenterModal: !touchInteractionEnabled,
            fitToViewport: true,
            maintainAspectRatio: false,
            verticalPositionRatio: 0.5, // 0.5 means center vertically
            horizontalPositionRatio: 0.5, // 0.5 means center horizontally

            scrollBehavior: 'auto', // 'auto', 'yes' or 'no'
            customWrapperClass: '',

            showNavigationArrows: true,
            displayCloseButton: true,
            closeOnContentClick: false,
            nextOnClick: false,
            enableMouseWheel: true,
            autoStartSlideshow: false,
            slideshowInterval: 3000,
            preloadAdjacent: 3, // Number of items to preload
            isModalWindow: false,
            loopContent: true,

            ajaxConfig: {
                dataType: 'html',
                requestHeaders: { 'X-fancyApp': true }
            },
            iframeConfig: {
                scrollBehavior: 'auto',
                preloadFrame: true
            },
            flashConfig: {
                windowMode: 'transparent',
                allowFullscreen: 'true',
                allowScriptAccess: 'always'
            },

            keyboardShortcuts: {
                navNext: {
                    13: 'left', // enter
                    34: 'up',   // page down
                    39: 'left', // right arrow
                    40: 'up'    // down arrow
                },
                navPrev: {
                    8: 'right',  // backspace
                    33: 'down',   // page up
                    37: 'right',  // left arrow
                    38: 'down'    // up arrow
                },
                closeModal: [27], // escape key
                toggleSlideshow: [32], // space - start/stop slideshow
                toggleFullscreen: [70]  // letter "f" - toggle fullscreen
            },

            navigationDirection: {
                next: 'left',
                prev: 'right'
            },

            allowScrollOutside: true,

            // Overridable properties for individual items
            initialIndex: 0,
            contentType: null,
            contentSource: null,
            htmlContent: null,
            contentTitle: null,

            // HTML structure templates
            templateElements: {
                wrapper: '<div class="modal-container" tabIndex="-1"><div class="modal-skin"><div class="modal-outer-box"><div class="modal-inner-area"></div></div></div></div>',
                image: '<img class="content-image" src="{href}" alt="" />',
                iframe: '<iframe id="content-frame{rnd}" name="content-frame{rnd}" class="content-frame" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (isLegacyBrowser ? ' allowtransparency="true"' : '') + '></iframe>',
                errorMessage: '<p class="error-message-display">The requested content could not be loaded.<br/>Please try again later.</p>',
                closeControl: '<a title="Close" class="control-element close-button" href="javascript:;"></a>',
                nextControl: '<a title="Next" class="navigation-button next-button" href="javascript:;"><span></span></a>',
                prevControl: '<a title="Previous" class="navigation-button previous-button" href="javascript:;"><span></span></a>'
            },

            // Animation properties for various actions
            // Opening the modal
            openAnimationEffect: 'fade', // 'elastic', 'fade' or 'none'
            openAnimationSpeed: 250,
            openAnimationEasing: 'swing',
            openAnimationOpacity: true,
            openTransitionMethod: 'zoomIn',

            // Closing the modal
            closeAnimationEffect: 'fade', // 'elastic', 'fade' or 'none'
            closeAnimationSpeed: 250,
            closeAnimationEasing: 'swing',
            closeAnimationOpacity: true,
            closeTransitionMethod: 'zoomOut',

            // Changing to the next gallery item
            nextAnimationEffect: 'elastic', // 'elastic', 'fade' or 'none'
            nextAnimationSpeed: 250,
            nextAnimationEasing: 'swing',
            nextTransitionMethod: 'changeIn',

            // Changing to the previous gallery item
            prevAnimationEffect: 'elastic', // 'elastic', 'fade' or 'none'
            prevAnimationSpeed: 250,
            prevAnimationEasing: 'swing',
            prevTransitionMethod: 'changeOut',

            // Enable default helper modules
            helperModules: {
                overlay: true,
                itemTitle: true
            },

            // Callback hooks for lifecycle events
            onCancelOperation: jQueryAlias.noop, // Triggered if action is canceled
            onBeforeContentLoad: jQueryAlias.noop, // Before content starts loading
            onAfterContentLoad: jQueryAlias.noop, // After content is loaded
            onBeforeModalShow: jQueryAlias.noop, // Before showing the modal with new content
            onAfterModalShow: jQueryAlias.noop, // After the modal is fully displayed
            onBeforeItemChange: jQueryAlias.noop, // Before switching to a new gallery item
            onBeforeModalClose: jQueryAlias.noop, // Before the modal begins to close
            onAfterModalClose: jQueryAlias.noop  // After the modal is completely closed
        },

        // --- Current State Variables ---
        itemCollection: {}, // The array of items in the current gallery group
        activeOptions: {}, // Merged options for the current session
        priorItem: null,  // Reference to the item displayed before the current one
        nextItemCandidate: null,  // Reference to the item currently being loaded
        currentItem: null,  // Reference to the currently displayed item
        activeSession: false, // Flag indicating if the gallery is active
        modalOpenState: false, // Flag indicating if the modal is visually open
        fullyDisplayed: false, // Flag indicating if the modal has completed its open animation

        // DOM element references
        mainWrapper: null,
        skinLayer: null,
        outerFrame: null,
        innerContent: null,

        // Slideshow player state
        mediaPlayer: {
            timerHandle: null,
            playerActive: false
        },

        // Loader handles
        ajaxRequestHandle: null,
        imageLoader: null,

        // Collections for dynamic components
        animationEffects: {},
        utilityModules: {},

        /*
         *	Static methods for the gallery functionality
         */

        // Initiates the display of gallery content
        activateModal: function (itemsGroup, displayOptions) {
            // Do not proceed if no items are provided
            if (!itemsGroup) {
                return;
            }

            // Ensure displayOptions is an object, if not, initialize it as an empty object
            if (typeof displayOptions !== 'object' || displayOptions === null) {
                displayOptions = {};
            }

            // If a gallery is already active, attempt to close it first.
            // If the close operation is explicitly prevented (returns false), then abort activation.
            if (galleryCore.terminateDisplay(true) === false) {
                return;
            }

            // Normalize the input `itemsGroup` into an array of item objects
            let normalizedGroup = itemsGroup;
            if (!Array.isArray(normalizedGroup)) {
                // If it's a jQuery object, convert it to a plain array of DOM elements
                if (isJQueryWrapper(normalizedGroup)) {
                    normalizedGroup = jQueryAlias(normalizedGroup).get();
                } else {
                    // Otherwise, wrap it in an array
                    normalizedGroup = [normalizedGroup];
                }
            }

            // Iterate through each item in the group to parse its properties
            normalizedGroup.forEach(function (currentElement, elementIndex) {
                let itemData = {},
                    sourceHref,
                    displayTitle,
                    elementContent,
                    itemType,
                    matchedResult,
                    urlParts,
                    contentSelector;

                // If the element is an object, process its properties
                if (jQueryAlias.type(currentElement) === "object") {
                    // If it's a raw DOM node, wrap it in jQuery
                    if (currentElement.nodeType) {
                        currentElement = jQueryAlias(currentElement);
                    }

                    // If it's a jQuery object, extract data attributes and attributes
                    if (isJQueryWrapper(currentElement)) {
                        itemData = {
                            contentSource: currentElement.data('fancybox-href') || currentElement.attr('href'),
                            contentTitle: jQueryAlias('<div/>').text(currentElement.data('fancybox-title') || currentElement.attr('title')).html(),
                            isDomElement: true,
                            originalElement: currentElement
                        };

                        // If jQuery metadata plugin is available, extend with metadata
                        if (jQueryAlias.metadata) {
                            jQueryAlias.extend(true, itemData, currentElement.metadata());
                        }

                    } else {
                        // If it's a plain object, use it directly
                        itemData = currentElement;
                    }
                }

                // Determine the content source (href) and title
                sourceHref = displayOptions.contentSource || itemData.contentSource || (isTextValue(currentElement) ? currentElement : null);
                displayTitle = (displayOptions.contentTitle !== undefinedValue) ? displayOptions.contentTitle : (itemData.contentTitle || '');

                // Determine the actual content and type
                elementContent = displayOptions.htmlContent || itemData.htmlContent;
                itemType = elementContent ? 'html' : (displayOptions.contentType || itemData.contentType);

                // If type is not yet determined and it's a DOM element
                if (!itemType && itemData.isDomElement) {
                    itemType = currentElement.data('fancybox-type');

                    if (!itemType) {
                        matchedResult = currentElement.prop('class').match(/fancybox\.(\w+)/);
                        itemType = matchedResult ? matchedResult[1] : null;
                    }
                }

                // If a source href is available, try to guess the content type
                if (isTextValue(sourceHref)) {
                    if (!itemType) {
                        if (galleryCore.isImageCheck(sourceHref)) {
                            itemType = 'image';
                        } else if (galleryCore.isFlashCheck(sourceHref)) {
                            itemType = 'swf';
                        } else if (sourceHref.charAt(0) === '#') {
                            itemType = 'inline';
                        } else if (isTextValue(currentElement)) {
                            itemType = 'html';
                            elementContent = currentElement; // If element itself is a string, treat as HTML
                        }
                    }

                    // Handle AJAX content with a selector (e.g., "page.html #id")
                    if (itemType === 'ajax') {
                        urlParts = sourceHref.split(/\s+/, 2);
                        sourceHref = urlParts.shift();
                        contentSelector = urlParts.shift();
                    }
                }

                // If content is still not explicitly set, try to derive it based on type
                if (!elementContent) {
                    if (itemType === 'inline') {
                        if (sourceHref) {
                            // Extract selector from href for inline content
                            elementContent = jQueryAlias(isTextValue(sourceHref) ? sourceHref.replace(/.*(?=#[^\s]+$)/, '') : sourceHref);
                        } else if (itemData.isDomElement) {
                            elementContent = currentElement;
                        }
                    } else if (itemType === 'html') {
                        elementContent = sourceHref;
                    } else if (!itemType && !sourceHref && itemData.isDomElement) {
                        // Fallback: if no type/href but it's a DOM element, treat as inline
                        itemType = 'inline';
                        elementContent = currentElement;
                    }
                }

                // Merge all parsed properties into the item data object
                jQueryAlias.extend(itemData, {
                    contentSource: sourceHref,
                    contentType: itemType,
                    htmlContent: elementContent,
                    contentTitle: displayTitle,
                    contentSelector: contentSelector
                });

                // Update the normalized group with the processed item data
                normalizedGroup[elementIndex] = itemData;
            });

            // Merge default settings with provided options
            // Perform a deep merge for most options
            galleryCore.activeOptions = jQueryAlias.extend(true, {}, galleryCore.defaultSettings, displayOptions);

            // Special handling for keyboard shortcuts: only shallow merge if provided
            if (displayOptions.keyboardShortcuts !== undefinedValue) {
                galleryCore.activeOptions.keyboardShortcuts = displayOptions.keyboardShortcuts ?
                    jQueryAlias.extend({}, galleryCore.defaultSettings.keyboardShortcuts, displayOptions.keyboardShortcuts) :
                    false; // If explicitly false, disable shortcuts
            }

            // Store the processed group
            galleryCore.itemCollection = normalizedGroup;

            // Validate that the item collection is not empty before starting
            if (galleryCore.itemCollection.length === 0) {
                console.warn("fancyApp: No valid items found to display.");
                return false;
            }

            // Begin the gallery display process with the initial item
            return galleryCore._startDisplay(galleryCore.activeOptions.initialIndex);
        },

        // Aborts any ongoing loading operations (image preload, AJAX request)
        abortOperation: function () {
            const currentCandidate = galleryCore.nextItemCandidate;

            // Trigger an 'onCancelOperation' event. If a handler returns false, prevent cancellation.
            if (currentCandidate && galleryCore.emitEvent('onCancelOperation') === false) {
                return false;
            }

            galleryCore.hideLoadingIndicator();

            if (!currentCandidate) {
                return; // Nothing to cancel
            }

            // Abort any active AJAX request
            if (galleryCore.ajaxRequestHandle) {
                galleryCore.ajaxRequestHandle.abort();
            }
            galleryCore.ajaxRequestHandle = null;

            // Clear image preload handlers
            if (galleryCore.imageLoader) {
                galleryCore.imageLoader.onload = galleryCore.imageLoader.onerror = null;
            }

            // If the item has a wrapper, stop its animations and remove it
            if (currentCandidate.mainWrapper) {
                currentCandidate.mainWrapper.stop(true, true).trigger('onReset').remove();
            }

            galleryCore.nextItemCandidate = null; // Clear the pending item

            // If no item was currently displayed (i.e., we canceled the very first item)
            if (!galleryCore.currentItem) {
                galleryCore._afterCloseAnimation(currentCandidate); // Perform cleanup
            }
        },

        // Initiates the closing sequence for the gallery
        terminateDisplay: function (forceClose) {
            // First, attempt to cancel any pending operations
            galleryCore.abortOperation();

            // Trigger 'onBeforeModalClose' event. If a handler returns false, prevent closing.
            if (galleryCore.emitEvent('onBeforeModalClose') === false) {
                return false;
            }

            // Unbind all gallery-related global event listeners
            galleryCore.removeEventHandlers();

            // If the gallery isn't active, there's nothing to close
            if (!galleryCore.activeSession) {
                return;
            }

            // If not fully open or forceClose is true, immediately remove elements
            if (!galleryCore.modalOpenState || forceClose === true) {
                jQueryAlias('.modal-container').stop(true).trigger('onReset').remove();
                galleryCore._afterCloseAnimation(); // Perform immediate cleanup
            } else {
                // Otherwise, proceed with the closing animation
                galleryCore.modalOpenState = false;
                galleryCore.fullyDisplayed = false;
                galleryCore.isClosing = true; // Set a flag indicating closure is in progress

                // Remove navigation and close buttons
                jQueryAlias('.control-element, .navigation-button').remove();

                // Stop wrapper animations and remove 'modal-opened' class
                if (galleryCore.mainWrapper) {
                    galleryCore.mainWrapper.stop(true, true).removeClass('modal-opened');
                }

                // Execute the configured close transition
                if (galleryCore.currentItem && galleryCore.animationEffects[galleryCore.currentItem.closeTransitionMethod]) {
                    galleryCore.animationEffects[galleryCore.currentItem.closeTransitionMethod]();
                } else {
                    // Fallback if no specific method or currentItem is missing
                    galleryCore._afterCloseAnimation();
                }
            }
            return true; // Indicate that termination was initiated
        },

        // Manages the slideshow functionality
        toggleSlideshow: function (actionCommand) {
            let clearTimer = function () {
                    clearTimeout(galleryCore.mediaPlayer.timerHandle);
                },
                setNewTimer = function () {
                    clearTimer(); // Clear any existing timer

                    // Only set a new timer if an item is current and the player is active
                    if (galleryCore.currentItem && galleryCore.mediaPlayer.playerActive) {
                        galleryCore.mediaPlayer.timerHandle = setTimeout(galleryCore.advanceItem, galleryCore.currentItem.slideshowInterval);
                    }
                },
                stopSlideshow = function () {
                    clearTimer(); // Clear the timer
                    documentObserver.unbind('.player'); // Unbind player-specific events
                    galleryCore.mediaPlayer.playerActive = false; // Deactivate player
                    galleryCore.emitEvent('onSlideshowEnd'); // Emit event
                },
                startSlideshow = function () {
                    // Start only if there's a current item and looping is enabled or it's not the last item
                    const currentItem = galleryCore.currentItem;
                    if (currentItem && (currentItem.loopContent || currentItem.initialIndex < galleryCore.itemCollection.length - 1)) {
                        galleryCore.mediaPlayer.playerActive = true; // Activate player

                        // Bind events to manage the slideshow state
                        documentObserver.bind({
                            'onCancelOperation.player onBeforeModalClose.player': stopSlideshow,
                            'onUpdate.player': setNewTimer,
                            'onBeforeContentLoad.player': clearTimer
                        });

                        setNewTimer(); // Set the initial timer
                        galleryCore.emitEvent('onSlideshowStart'); // Emit event
                    }
                };

            // Determine action based on command or current player state
            if (actionCommand === true || (!galleryCore.mediaPlayer.playerActive && actionCommand !== false)) {
                startSlideshow(); // Start if true, or if not active and not explicitly false
            } else {
                stopSlideshow(); // Stop if false, or if active and no explicit command
            }
        },

        // Navigates to the next item in the gallery
        advanceItem: function (transitionDirection) {
            const currentActiveItem = galleryCore.currentItem;

            if (!currentActiveItem) {
                return; // No current item to advance from
            }

            // Default transition direction if not specified
            if (typeof transitionDirection !== 'string') {
                transitionDirection = currentActiveItem.navigationDirection.next;
            }

            const nextItemIndex = currentActiveItem.initialIndex + 1;

            // Ensure the next index is within the bounds of the collection
            if (nextItemIndex < galleryCore.itemCollection.length) {
                galleryCore.navigateToItem(nextItemIndex, transitionDirection, 'next');
            } else if (currentActiveItem.loopContent) {
                // If looping is enabled, go to the first item
                galleryCore.navigateToItem(0, transitionDirection, 'next');
            }
        },

        // Navigates to the previous item in the gallery
        revertItem: function (transitionDirection) {
            const currentActiveItem = galleryCore.currentItem;

            if (!currentActiveItem) {
                return; // No current item to revert from
            }

            // Default transition direction if not specified
            if (typeof transitionDirection !== 'string') {
                transitionDirection = currentActiveItem.navigationDirection.prev;
            }

            const prevItemIndex = currentActiveItem.initialIndex - 1;

            // Ensure the previous index is within the bounds of the collection
            if (prevItemIndex >= 0) {
                galleryCore.navigateToItem(prevItemIndex, transitionDirection, 'prev');
            } else if (currentActiveItem.loopContent) {
                // If looping is enabled, go to the last item
                galleryCore.navigateToItem(galleryCore.itemCollection.length - 1, transitionDirection, 'prev');
            }
        }
    });

})(window, document, jQuery);