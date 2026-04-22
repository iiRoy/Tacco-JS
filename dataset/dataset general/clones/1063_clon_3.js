/*
 * Scrollable Content Ticker Module v2.1.0
 *
 * Copyright 2023, Your Name/Organization
 * License: Apache License 2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * This utility facilitates creating dynamic, auto-scrolling content sections.
 * It's designed to be flexible and integrate with jQuery.
 */

// Basic Object.create polyfill for older environments.
// Ensures `Object.create` is available for proper prototypal inheritance.
if (typeof Object.create !== 'function') {
    Object.create = function (protoObject) {
        function ConstructorFn() {}
        ConstructorFn.prototype = protoObject;
        return new ConstructorFn();
    };
}

// Encapsulate the plugin within an immediately invoked function expression (IIFE)
// to prevent global scope pollution and ensure jQuery is available.
(function ($, windowRef, documentRef, undefined) {

    // Internal logging utility. Only logs if debug mode is enabled.
    const _logger = {
        log: function(message, type = 'info') {
            if ($.fn.scrollableTicker.defaults.debug && typeof console !== 'undefined') {
                const prefix = `[ScrollableTicker ${type.toUpperCase()}]:`;
                if (type === 'error' && console.error) {
                    console.error(prefix, message);
                } else if (type === 'warn' && console.warn) {
                    console.warn(prefix, message);
                } else if (console.log) {
                    console.log(prefix, message);
                }
            }
        },
        error: function(message) { this.log(message, 'error'); },
        warn: function(message) { this.log(message, 'warn'); }
    };

    /**
     * @namespace TickerWidget
     * @description Core logic for the scrollable content ticker.
     */
    var TickerWidget = {

        /**
         * Initializes the ticker widget instance.
         * @param {object} userConfig - User-provided configuration options.
         * @param {HTMLElement} targetElement - The DOM element to attach the ticker to.
         */
        initialize: function (userConfig, targetElement) {
            // Cache references to the current instance and its DOM element.
            var instance = this;
            instance.targetElement = targetElement;
            instance.cachedTarget = $(targetElement);

            // Extract the tag name and class name of the first direct child for dynamic item handling.
            // Using `localName` and `className` for direct DOM property access.
            const firstChild = instance.cachedTarget.children().first()[0];
            if (!firstChild) {
                _logger.error("Ticker requires at least one child element to operate.");
                return; // Abort initialization if no children are found.
            }
            instance.itemTag = firstChild.localName;
            instance.itemClass = firstChild.className || 'ticker-item'; // Assign a default class if none exists.

            // Initialize internal state variables.
            instance.autoAdvanceTimer = null;        // Timer for auto-scrolling.
            instance.resizeDebounceTimer = null;     // Timer for debouncing window resize events.
            instance.isAnimationInProgress = false;  // Flag to prevent multiple animations concurrently.
            instance.isMouseOver = false;            // Flag to track if the mouse is hovering over the widget.

            // Handle configuration: merge user settings with defaults.
            if (typeof userConfig === 'string') {
                // String input is not supported for configuration overrides.
                _logger.error("Direct string property override is not supported. Please pass an object for configuration.");
                throw new Error("Invalid configuration type: String property override not supported.");
            } else if (typeof userConfig === 'object' || userConfig === undefined) {
                // Merge default options with user-provided settings.
                instance.config = $.extend({}, $.fn.scrollableTicker.defaults, userConfig);

                // Perform initial setup of the display layout.
                instance.setupDisplay();

                // If auto-scrolling is enabled, start the animation loop.
                if (instance.config.autoScroll) {
                    instance.startAutoAdvance();
                }

                // If navigation controls are desired, build them.
                if (instance.config.showControls) {
                    instance.createControls();
                }

                // Execute a user-defined callback function after initialization.
                if (typeof instance.config.onInitialized === 'function') {
                    instance.config.onInitialized.apply(instance, arguments);
                }
            } else {
                 _logger.error("Unsupported configuration type provided.");
                 throw new Error("Unsupported configuration type.");
            }
        },

        /**
         * Sets up the initial display layout and binds necessary events.
         */
        setupDisplay: function() {
            var instance = this;

            // Deregister previous resize handler to prevent multiple bindings on re-layout.
            $(windowRef).off('resize.scrollableTicker', instance._resizeHandler);

            // Bind mouse events using event delegation for efficiency.
            // These events control pausing/resuming auto-advance on hover.
            instance.cachedTarget
                .off('mouseenter.scrollableTicker mouseleave.scrollableTicker') // Remove prior bindings
                .on('mouseenter.scrollableTicker', function() {
                    instance.resetAutoAdvance(true); // Pause
                })
                .on('mouseleave.scrollableTicker', function() {
                    instance.resetAutoAdvance(false); // Resume
                });


            // Determine the actual number of items to display.
            const totalItems = instance.cachedTarget.find(instance.itemTag).length;
            // Validate `itemsVisible` configuration.
            if (instance.config.itemsVisible <= 0) {
                _logger.warn(`'itemsVisible' must be greater than 0. Defaulting to 1.`);
                instance.config.itemsVisible = 1;
            }
            // Ensure we don't try to show more items than available.
            if (totalItems < instance.config.itemsVisible) {
                instance.config.itemsVisible = totalItems;
            }

            // Iterate through all items to set their initial visibility.
            // Items beyond `itemsVisible` count are hidden.
            instance.cachedTarget.find(instance.itemTag).each(function(idx, currentItem) {
                if (idx >= instance.config.itemsVisible) {
                    $(currentItem).hide();
                } else {
                    $(currentItem).show();
                }
            });

            // Calculate the required height for the ticker container.
            // Sums the heights of visible items plus any configured spacing.
            let totalHeight = 0;
            instance.cachedTarget.find(instance.itemTag).each(function(idx, currentItem) {
                if (idx < instance.config.itemsVisible) {
                    totalHeight += parseFloat($(currentItem).outerHeight(true)) + instance.config.itemSpacing;
                }
            });

            // Apply calculated height and overflow properties to the container.
            instance.cachedTarget.css({
                "overflow-y": "hidden",
                "height": totalHeight + "px" // Ensure 'px' unit
            });

            // Re-calculate layout on window resize with a debounce mechanism.
            // This prevents excessive calls during resizing.
            instance._resizeHandler = function() {
                if (instance.resizeDebounceTimer !== null) {
                    clearTimeout(instance.resizeDebounceTimer);
                }
                instance.resizeDebounceTimer = setTimeout(function() {
                    _logger.log("Window resized, re-calculating ticker layout.");
                    instance.setupDisplay(); // Re-run layout setup
                }, 200); // Debounce delay in milliseconds
            };
            $(windowRef).on('resize.scrollableTicker', instance._resizeHandler);
        },

        /**
         * Attempts to find a parent container element marked as a panel.
         * Looks for a parent with a specific data attribute or class.
         * @returns {jQuery|undefined} The jQuery object of the panel, or undefined if not found.
         */
        locateContainerPanel: function() {
            // Traverse up the DOM tree from the ticker element.
            // We're looking for a parent with `data-ticker-container="true"` or class `panel`.
            let parentPanel = this.cachedTarget.closest('[data-ticker-container="true"], .panel');

            // If a panel is found, return it. Otherwise, return undefined.
            return parentPanel.length ? parentPanel : undefined;
        },

        /**
         * Creates and appends navigation controls (previous/next buttons) to the panel footer.
         */
        createControls: function() {
            var instance = this;
            var parentPanel = instance.locateContainerPanel();

            if (parentPanel) {
                // Construct the HTML for the navigation controls.
                const controlMarkup = `
                    <div class="ticker-controls">
                        <button class="${instance.config.prevButtonClass}" aria-label="Previous Item">
                            <span class="${instance.config.prevIconClass}"></span>
                        </button>
                        <button class="${instance.config.nextButtonClass}" aria-label="Next Item">
                            <span class="${instance.config.nextIconClass}"></span>
                        </button>
                    </div>
                    <div class="clearfix"></div>`;

                // Find or create the panel footer.
                let panelFooter = parentPanel.find(".panel-footer");
                if (panelFooter.length) {
                    panelFooter.append(controlMarkup);
                } else {
                    // If no footer exists, create one and append controls.
                    parentPanel.append(`<div class="panel-footer">${controlMarkup}</div>`);
                    panelFooter = parentPanel.find(".panel-footer"); // Re-select the newly added footer
                }

                // Bind click handlers to the navigation buttons using event delegation on the footer.
                panelFooter.on('click', `.${instance.config.prevButtonClass}`, function(eventObj) {
                    eventObj.preventDefault();
                    instance.navigatePrevious();
                });

                panelFooter.on('click', `.${instance.config.nextButtonClass}`, function(eventObj) {
                    eventObj.preventDefault();
                    instance.navigateNext();
                });
            } else {
                _logger.warn("Could not find a suitable parent panel to attach navigation controls.");
            }
        },

        /**
         * Pauses the automatic scrolling of the ticker.
         */
        pauseAutoAdvance: function() {
            var instance = this;
            instance.isMouseOver = true;
            if (instance.config.autoScroll && instance.autoAdvanceTimer) {
                clearTimeout(instance.autoAdvanceTimer);
                instance.autoAdvanceTimer = null; // Clear timer reference
                _logger.log("Auto-advance paused.");
                if (typeof instance.config.onPaused === 'function') {
                    instance.config.onPaused.call(instance);
                }
            }
        },

        /**
         * Resets or resumes the auto-advance timer based on hover status.
         * @param {boolean} hoverStatus - True if hovered, false if not.
         */
        resetAutoAdvance: function(hoverStatus) {
            var instance = this;

            // Clear any existing timer to prevent multiple timers running.
            if (instance.autoAdvanceTimer) {
                clearTimeout(instance.autoAdvanceTimer);
                instance.autoAdvanceTimer = null;
            }

            // Update hover status.
            instance.isMouseOver = hoverStatus;

            // If auto-scrolling is enabled, restart the animation loop.
            if (instance.config.autoScroll) {
                if (hoverStatus && instance.config.pauseOnHover) {
                    instance.pauseAutoAdvance();
                } else if (!hoverStatus) {
                    _logger.log("Auto-advance resumed.");
                    instance.startAutoAdvance();
                }
            }

            if (typeof instance.config.onReset === 'function') {
                instance.config.onReset.call(instance, hoverStatus);
            }
        },

        /**
         * Starts the auto-advance mechanism for the ticker.
         * This function schedules the next scroll action.
         */
        startAutoAdvance: function() {
            var instance = this;
            // Only start if a timer isn't already running and auto-scroll is enabled.
            if (instance.autoAdvanceTimer || !instance.config.autoScroll) {
                return;
            }

            instance.autoAdvanceTimer = setTimeout(function() {
                // If pauseOnHover is active and mouse is over, do not advance.
                if (instance.config.pauseOnHover && instance.isMouseOver) {
                    instance.startAutoAdvance(); // Reschedule for later
                    return;
                }

                // Determine scroll direction and call the appropriate handler.
                if (instance.config.scrollDirection === 'vertical-up') {
                    instance.navigateNext();
                } else if (instance.config.scrollDirection === 'vertical-down') {
                    instance.navigatePrevious();
                } else {
                    _logger.warn(`Unknown scroll direction: ${instance.config.scrollDirection}. Defaulting to 'vertical-up'.`);
                    instance.navigateNext();
                }

                // If the animation was blocked (e.g., another animation was in progress),
                // we need to reschedule the timer manually. Otherwise, it's reset by the animation callback.
                if (instance.isAnimationInProgress) {
                     instance.startAutoAdvance();
                }

            }, instance.config.scrollInterval);
        },

        /**
         * Navigates the ticker to display the previous item(s).
         */
        navigatePrevious: function() {
            var instance = this;

            // Prevent new animation if one is already in progress.
            if (instance.isAnimationInProgress) {
                _logger.log("Animation already in progress, blocking 'previous' navigation.");
                return false;
            }
            instance.isAnimationInProgress = true;

            const allItems = instance.cachedTarget.find(instance.itemTag);
            if (allItems.length <= instance.config.itemsVisible) {
                 _logger.log("Not enough items to scroll 'previous'.");
                 instance.isAnimationInProgress = false;
                 instance.resetAutoAdvance(instance.isMouseOver);
                 return false;
            }

            // Clone the last visible item and prepend it to the list (hidden).
            // This creates the visual effect of the last item sliding in from the top.
            const lastItem = allItems.last();
            const clonedItemMarkup = `<${instance.itemTag} style="display:none;" class="${instance.itemClass}">${lastItem.html()}</${instance.itemTag}>`;
            instance.cachedTarget.prepend(clonedItemMarkup);

            // Animate the newly prepended item to slide down (become visible).
            instance.cachedTarget.find(instance.itemTag).first().slideDown(instance.config.scrollSpeed, function() {
                // After the new item is visible, remove the last item from the original list.
                lastItem.remove();
            });

            // Simultaneously, animate the item that is now the (itemsVisible + 1)-th to slide up (become hidden).
            // This creates the effect of the first item disappearing.
            allItems.eq(instance.config.itemsVisible).slideUp(instance.config.scrollSpeed, function() {
                instance.isAnimationInProgress = false; // Animation complete.
                instance.resetAutoAdvance(instance.isMouseOver); // Reset timer.
                if (typeof instance.config.onPrevious === 'function') {
                    instance.config.onPrevious.call(instance);
                }
            });
        },

        /**
         * Navigates the ticker to display the next item(s).
         */
        navigateNext: function() {
            var instance = this;

            // Prevent new animation if one is already in progress.
            if (instance.isAnimationInProgress) {
                _logger.log("Animation already in progress, blocking 'next' navigation.");
                return false;
            }
            instance.isAnimationInProgress = true;

            const allItems = instance.cachedTarget.find(instance.itemTag);
            if (allItems.length <= instance.config.itemsVisible) {
                 _logger.log("Not enough items to scroll 'next'.");
                 instance.isAnimationInProgress = false;
                 instance.resetAutoAdvance(instance.isMouseOver);
                 return false;
            }

            // Clone the first visible item and append it to the list (hidden).
            // This prepares the item to be "recycled" at the end.
            const firstItem = allItems.first();
            const clonedItemMarkup = `<${instance.itemTag} style="display:none;" class="${instance.itemClass}">${firstItem.html()}</${instance.itemTag}>`;
            instance.cachedTarget.append(clonedItemMarkup);

            // Animate the first item to slide up (become hidden).
            firstItem.slideUp(instance.config.scrollSpeed, function() {
                $(this).remove(); // Remove the item once it's hidden.
            });

            // Simultaneously, animate the item that is now the (itemsVisible + 1)-th to slide down (become visible).
            // This is the item that was previously the first item in the *next* block, now becoming visible.
            instance.cachedTarget.find(instance.itemTag + ':nth-child(' + parseInt(instance.config.itemsVisible + 1) + ')').slideDown(instance.config.scrollSpeed, function() {
                instance.isAnimationInProgress = false; // Animation complete.
                instance.resetAutoAdvance(instance.isMouseOver); // Reset timer.
                if (typeof instance.config.onNext === 'function') {
                    instance.config.onNext.call(instance);
                }
            });
        },

        /**
         * Cleans up the ticker instance, removing event handlers and timers.
         */
        destroy: function() {
            var instance = this;

            // Clear any active timers.
            if (instance.autoAdvanceTimer) {
                clearTimeout(instance.autoAdvanceTimer);
                instance.autoAdvanceTimer = null;
            }
            if (instance.resizeDebounceTimer) {
                clearTimeout(instance.resizeDebounceTimer);
                instance.resizeDebounceTimer = null;
            }

            // Remove event handlers associated with this instance.
            instance.cachedTarget.off('.scrollableTicker'); // Remove all delegated events
            $(windowRef).off('resize.scrollableTicker', instance._resizeHandler);

            // Remove navigation controls if they were added.
            const parentPanel = instance.locateContainerPanel();
            if (parentPanel) {
                parentPanel.find('.ticker-controls').parent().off('click', `.${instance.config.prevButtonClass}`).off('click', `.${instance.config.nextButtonClass}`);
                parentPanel.find('.ticker-controls').remove();
            }

            // Reset CSS properties.
            instance.cachedTarget.css({
                "overflow-y": "",
                "height": ""
            });

            // Show all items that might have been hidden.
            instance.cachedTarget.find(instance.itemTag).show();

            // Remove the instance data from the element.
            instance.cachedTarget.removeData('scrollableTickerInstance');

            _logger.log("Ticker instance destroyed.");
        }
    };

    /**
     * jQuery plugin definition for scrollableTicker.
     * Allows initialization and method calls.
     * @param {object|string} methodOrConfig - Configuration object or method name.
     */
    $.fn.scrollableTicker = function (methodOrConfig) {
        // If a method name is passed, attempt to call it on existing instances.
        if (typeof methodOrConfig === 'string' && TickerWidget[methodOrConfig]) {
            const argsPassed = Array.prototype.slice.call(arguments, 1); // Get arguments for the method.
            let results = [];
            this.each(function () {
                const instance = $(this).data('scrollableTickerInstance');
                if (instance) {
                    const methodResult = TickerWidget[methodOrConfig].apply(instance, argsPassed);
                    if (methodResult !== undefined) {
                        results.push(methodResult);
                    }
                } else {
                    _logger.warn(`Attempted to call method "${methodOrConfig}" on an uninitialized element.`, this);
                }
            });
            // Return result for method calls, or the jQuery object for chaining.
            return results.length ? (results.length === 1 ? results[0] : results) : this;
        }

        // Otherwise, initialize the plugin for each selected element.
        return this.each(function () {
            // Check if an instance already exists on this element.
            if (!$.data(this, 'scrollableTickerInstance')) {
                // Create a new instance using Object.create for prototypal inheritance.
                var tickerInstance = Object.create(TickerWidget);
                tickerInstance.initialize(methodOrConfig, this);
                // Store the instance data on the element for future access.
                $.data(this, 'scrollableTickerInstance', tickerInstance);
                _logger.log("Ticker initialized on element:", this);
            } else {
                _logger.warn("ScrollableTicker already initialized on this element, skipping.", this);
            }
        });
    };

    /**
     * Default configuration options for the scrollableTicker plugin.
     * These can be overridden by user-provided options during initialization.
     */
    $.fn.scrollableTicker.defaults = {
        itemsVisible: 4,                // Number of items to display at once.
        showControls: true,             // Whether to generate navigation buttons.
        autoScroll: true,               // Whether the ticker should auto-advance.
        scrollDirection: 'vertical-up', // 'vertical-up' or 'vertical-down'.
        scrollSpeed: 400,               // Speed of the animation in milliseconds.
        scrollInterval: 5000,           // Time between auto-scrolls in milliseconds.
        pauseOnHover: true,             // Pause auto-scroll when mouse is over the ticker.
        itemSpacing: 10,                // Additional spacing (in pixels) between items for height calculation.
        debug: false,                   // Enable/disable console logging for debugging.

        // Navigation button classes (can be Font Awesome, Bootstrap Glyphs, etc.)
        prevButtonClass: 'ticker-btn-prev',
        nextButtonClass: 'ticker-btn-next',
        prevIconClass: 'fas fa-chevron-down', // Example: Font Awesome 5
        nextIconClass: 'fas fa-chevron-up',   // Example: Font Awesome 5

        // Callback functions for lifecycle events.
        onStopped: null,      // Called when auto-scroll explicitly stopped (not fully implemented in this version).
        onPaused: null,       // Called when auto-scroll is paused (e.g., on hover).
        onReset: null,        // Called when auto-scroll timer is reset/resumed.
        onPrevious: null,     // Called after a 'previous' navigation completes.
        onNext: null,         // Called after a 'next' navigation completes.
        onInitialized: null   // Called after the ticker has been fully initialized.
    };

})(jQuery, window, document);