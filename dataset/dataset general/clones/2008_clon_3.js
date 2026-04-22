;
(function(jq, globalWin, htmlDoc, voidZero) {
    'use strict';

    // Core identification for the component
    const scrollingContentWidgetName = 'contentScroller';

    // Default settings for the content scrolling widget
    const defaultWidgetConfiguration = {
        itemHeightPx: 20, // Height of a single list item in pixels
        visibleItemCount: 3, // Maximum number of items visible at once
        animationDurationMs: 400, // Speed of the scroll animation in milliseconds
        scrollIntervalMs: 2500, // Time between automatic scrolls in milliseconds
        scrollDirection: 'up', // Initial scrolling direction: 'up' or 'down'
        autoStartEnabled: true, // Whether the widget should start scrolling automatically
        pauseOnHoverEnabled: true, // Pause scrolling when mouse hovers over the widget
        nextCycleButton: null, // jQuery object for the 'next' button
        prevCycleButton: null, // jQuery object for the 'previous' button
        activateButton: null, // jQuery object for the 'start' button
        deactivateButton: null, // jQuery object for the 'stop' button

        // Callback functions for various events
        onContentShifted: function() {},
        onScrollUpInitiated: function() {},
        onScrollDownInitiated: function() {},
        onWidgetActivated: function() {},
        onWidgetDeactivated: function() {},
        onScrollPaused: function() {},
        onScrollResumed: function() {}
    };

    /**
     * Main class for the content scrolling widget.
     * Handles initialization, state management, and animation logic.
     * @param {HTMLElement} hostDomElement - The DOM element to attach the widget to.
     * @param {object} customSettings - User-provided configuration options.
     */
    function ContentScrollerCore(hostDomElement, customSettings) {
        this.hostDomElement = hostDomElement;
        this.jQueryHost = jq(hostDomElement);
        this.currentWidgetOptions = jq.extend({}, defaultWidgetConfiguration, customSettings);

        // Internal state variables
        this.autoScrollTimerID = null; // Timer ID for the automatic scrolling interval
        this.isWidgetActive = false; // True if the widget is actively scrolling
        this.isScrollPaused = false; // True if automatic scrolling is temporarily paused
        this.isTransitionInProgress = false; // True if an animation is currently running

        // Validate the host element and initialize
        if (this.jQueryHost.is('ul, ol')) {
            this._initializeComponent();
        } else {
            console.error("ContentScroller: Host element must be an unordered or ordered list (<ul> or <ol>).");
            return; // Abort initialization if not a list
        }
    }

    ContentScrollerCore.prototype = {
        /**
         * Initializes the content scroller component.
         * Sets up dimensions, event handlers, and starts automatic scrolling if enabled.
         * @private
         */
        _initializeComponent: function() {
            const currentTotalHeight = this.currentWidgetOptions.itemHeightPx * this.currentWidgetOptions.visibleItemCount;
            this.jQueryHost.height(currentTotalHeight).css({
                overflow: 'hidden',
                position: 'relative' // Ensure proper positioning for animation
            });

            this._validateAnimationTimings();

            // Store 'this' context for event handlers
            const self = this;

            // Setup navigation button handlers
            if (self.currentWidgetOptions.nextCycleButton && self.currentWidgetOptions.nextCycleButton.length) {
                self.currentWidgetOptions.nextCycleButton.on('click', function(evt) {
                    self.scrollForward();
                    self._resetAutoScrollTimer();
                    evt.preventDefault(); // Prevent default button behavior
                });
            }
            if (self.currentWidgetOptions.prevCycleButton && self.currentWidgetOptions.prevCycleButton.length) {
                self.currentWidgetOptions.prevCycleButton.on('click', function(evt) {
                    self.scrollBackward();
                    self._resetAutoScrollTimer();
                    evt.preventDefault();
                });
            }
            if (self.currentWidgetOptions.deactivateButton && self.currentWidgetOptions.deactivateButton.length) {
                self.currentWidgetOptions.deactivateButton.on('click', function(evt) {
                    self.deactivateScrolling();
                    evt.preventDefault();
                });
            }
            if (self.currentWidgetOptions.activateButton && self.currentWidgetOptions.activateButton.length) {
                self.currentWidgetOptions.activateButton.on('click', function(evt) {
                    self.activateScrolling();
                    evt.preventDefault();
                });
            }

            // Setup pause-on-hover functionality
            if (self.currentWidgetOptions.pauseOnHoverEnabled) {
                self.jQueryHost.hover(
                    function() { // Mouse enter
                        if (self.isWidgetActive) {
                            self.pauseScrollActivity();
                        }
                    },
                    function() { // Mouse leave
                        if (self.isWidgetActive) {
                            self.resumeScrollActivity();
                        }
                    }
                );
            }

            // Begin auto-scrolling if configured
            if (self.currentWidgetOptions.autoStartEnabled) {
                self.activateScrolling();
            }
        },

        /**
         * Activates the automatic scrolling functionality.
         * @public
         */
        activateScrolling: function() {
            if (!this.isWidgetActive) {
                this.isWidgetActive = true;
                this._resetAutoScrollTimer();
                this.currentWidgetOptions.onWidgetActivated();
            }
        },

        /**
         * Deactivates the automatic scrolling functionality.
         * @public
         */
        deactivateScrolling: function() {
            if (this.isWidgetActive) {
                clearInterval(this.autoScrollTimerID);
                this.autoScrollTimerID = null; // Clear the timer ID
                this.isWidgetActive = false;
                this.currentWidgetOptions.onWidgetDeactivated();
            }
        },

        /**
         * Resets the automatic scrolling timer.
         * This is typically called after a manual scroll or a configuration change.
         * @private
         */
        _resetAutoScrollTimer: function() {
            if (this.isWidgetActive) {
                clearInterval(this.autoScrollTimerID);
                this.autoScrollTimerID = setInterval(() => {
                    this._performSingleScroll();
                }, this.currentWidgetOptions.scrollIntervalMs);
            }
        },

        /**
         * Executes a single scroll operation if not paused.
         * @private
         */
        _performSingleScroll: function() {
            if (!this.isScrollPaused) {
                this.scrollForward();
            }
        },

        /**
         * Initiates a scroll in the configured 'forward' direction.
         * 'Forward' means 'up' if scrollDirection is 'up', and 'down' if scrollDirection is 'down'.
         * @public
         */
        scrollForward: function() {
            if (this.currentWidgetOptions.scrollDirection === 'down') {
                this._animateContentDownward();
            } else { // Default or 'up'
                this._animateContentUpward();
            }
        },

        /**
         * Initiates a scroll in the 'backward' direction (opposite of 'forward').
         * 'Backward' means 'down' if scrollDirection is 'up', and 'up' if scrollDirection is 'down'.
         * @public
         */
        scrollBackward: function() {
            if (this.currentWidgetOptions.scrollDirection === 'down') {
                this._animateContentUpward();
            } else { // Default or 'up'
                this._animateContentDownward();
            }
        },

        /**
         * Pauses the automatic scrolling activity.
         * @public
         */
        pauseScrollActivity: function() {
            if (!this.isScrollPaused) {
                this.isScrollPaused = true;
                this.currentWidgetOptions.onScrollPaused();
            }
        },

        /**
         * Resumes the automatic scrolling activity.
         * @public
         */
        resumeScrollActivity: function() {
            if (this.isScrollPaused) {
                this.isScrollPaused = false;
                this.currentWidgetOptions.onScrollResumed();
            }
        },

        /**
         * Animates content by moving the last item to the top.
         * @private
         */
        _animateContentDownward: function() {
            if (this.isTransitionInProgress) {
                return; // Prevent animation conflicts
            }

            this.isTransitionInProgress = true;
            this.currentWidgetOptions.onScrollDownInitiated();

            const itemHeight = this.currentWidgetOptions.itemHeightPx;
            const lastItem = this.jQueryHost.children('li:last');

            // Prepend the last item and set its negative margin for animation
            lastItem.detach().prependTo(this.jQueryHost).css('margin-top', `-${itemHeight}px`);

            // Animate it down to 0 margin
            lastItem.animate({
                'margin-top': '0px'
            }, this.currentWidgetOptions.animationDurationMs, () => {
                this.isTransitionInProgress = false;
                this.currentWidgetOptions.onContentShifted();
            });
        },

        /**
         * Animates content by moving the first item to the bottom.
         * @private
         */
        _animateContentUpward: function() {
            if (this.isTransitionInProgress) {
                return; // Prevent animation conflicts
            }

            this.isTransitionInProgress = true;
            this.currentWidgetOptions.onScrollUpInitiated();

            const itemHeight = this.currentWidgetOptions.itemHeightPx;
            const firstItem = this.jQueryHost.children('li:first');

            // Animate the first item up and out of view
            firstItem.animate({
                'margin-top': `-${itemHeight}px`
            }, this.currentWidgetOptions.animationDurationMs, () => {
                // After animation, move it to the end and reset its margin
                firstItem.detach().css('margin-top', '0px').appendTo(this.jQueryHost);
                this.isTransitionInProgress = false;
                this.currentWidgetOptions.onContentShifted();
            });
        },

        /**
         * Updates a specific configuration setting for the widget.
         * If 'duration' or 'speed' are updated, timings are re-validated and timer reset.
         * @param {string} settingKey - The name of the option to update.
         * @param {*} newValue - The new value for the option.
         * @public
         */
        updateConfigurationSetting: function(settingKey, newValue) {
            if (Object.prototype.hasOwnProperty.call(this.currentWidgetOptions, settingKey)) {
                this.currentWidgetOptions[settingKey] = newValue;

                // Special handling for timing-related options
                if (settingKey === 'scrollIntervalMs' || settingKey === 'animationDurationMs') {
                    this._validateAnimationTimings();
                    this._resetAutoScrollTimer();
                }
                // If scroll direction changes, ensure it's valid
                if (settingKey === 'scrollDirection') {
                    if (newValue !== 'up' && newValue !== 'down') {
                        this.currentWidgetOptions.scrollDirection = defaultWidgetConfiguration.scrollDirection;
                        console.warn(`ContentScroller: Invalid scroll direction '${newValue}', defaulting to '${defaultWidgetConfiguration.scrollDirection}'.`);
                    }
                }
            } else {
                console.warn(`ContentScroller: Attempted to update non-existent setting: '${settingKey}'.`);
            }
        },

        /**
         * Retrieves the current operational status of the widget.
         * @returns {string} - A descriptive string indicating the widget's status.
         * @public
         */
        getWidgetStatus: function() {
            if (this.isScrollPaused) {
                return 'paused';
            } else if (this.isWidgetActive) {
                return 'active';
            } else {
                return 'inactive';
            }
        },

        /**
         * Ensures that animation duration is less than the scroll interval.
         * Adjusts animation duration if it's too close to or exceeds the interval.
         * @private
         */
        _validateAnimationTimings: function() {
            const safetyMargin = 25; // Minimum time gap between animation end and next scroll start
            if (this.currentWidgetOptions.scrollIntervalMs <= (this.currentWidgetOptions.animationDurationMs + safetyMargin)) {
                const newAnimationDuration = this.currentWidgetOptions.scrollIntervalMs - safetyMargin;
                if (newAnimationDuration < 0) {
                    console.warn("ContentScroller: Scroll interval is too short. Animation duration cannot be adjusted below zero. Please increase 'scrollIntervalMs'.");
                    this.currentWidgetOptions.animationDurationMs = 0; // Effectively instant animation
                } else {
                    console.warn(`ContentScroller: 'animationDurationMs' (${this.currentWidgetOptions.animationDurationMs}ms) was too close to 'scrollIntervalMs' (${this.currentWidgetOptions.scrollIntervalMs}ms). Adjusting 'animationDurationMs' to ${newAnimationDuration}ms.`);
                    this.currentWidgetOptions.animationDurationMs = newAnimationDuration;
                }
            }
        },

        /**
         * Cleans up resources and event handlers when the widget is no longer needed.
         * @public
         */
        disposeWidget: function() {
            this.deactivateScrolling(); // Stop any active timers

            // Remove event handlers from buttons
            if (this.currentWidgetOptions.nextCycleButton && this.currentWidgetOptions.nextCycleButton.length) {
                this.currentWidgetOptions.nextCycleButton.off('click');
            }
            if (this.currentWidgetOptions.prevCycleButton && this.currentWidgetOptions.prevCycleButton.length) {
                this.currentWidgetOptions.prevCycleButton.off('click');
            }
            if (this.currentWidgetOptions.activateButton && this.currentWidgetOptions.activateButton.length) {
                this.currentWidgetOptions.activateButton.off('click');
            }
            if (this.currentWidgetOptions.deactivateButton && this.currentWidgetOptions.deactivateButton.length) {
                this.currentWidgetOptions.deactivateButton.off('click');
            }

            // Remove hover handlers from the host element
            this.jQueryHost.off('mouseenter mouseleave');

            // Reset inline styles applied by the plugin
            this.jQueryHost.css({
                height: '',
                overflow: '',
                position: ''
            });

            // Remove the instance data from the DOM element
            this.jQueryHost.removeData('plugin_' + scrollingContentWidgetName);
        }
    };

    /**
     * jQuery plugin definition for ContentScroller.
     * Allows users to initialize and interact with the widget via jQuery.
     * @param {string|object} inputParam - Either a method name string or an options object.
     * @returns {jQuery} - The jQuery object for chaining.
     */
    jq.fn[scrollingContentWidgetName] = function(inputParam) {
        const invocationArguments = arguments; // Capture all arguments passed to the plugin

        return this.each(function() {
            const currentInstanceJQuery = jq(this);
            let componentInstance = currentInstanceJQuery.data('plugin_' + scrollingContentWidgetName);

            // If no instance exists, create a new one
            if (!componentInstance) {
                const optionsObject = (typeof inputParam === 'object' && inputParam) ? inputParam : {};
                componentInstance = new ContentScrollerCore(this, optionsObject);
                currentInstanceJQuery.data('plugin_' + scrollingContentWidgetName, componentInstance);
            }

            // If the first argument is a string, attempt to call a method on the instance
            if (typeof inputParam === 'string' && typeof componentInstance[inputParam] === 'function') {
                // Call the method with arguments, excluding the method name itself
                componentInstance[inputParam].apply(componentInstance, Array.prototype.slice.call(invocationArguments, 1));
            }
        });
    };

})(jQuery, window, document);