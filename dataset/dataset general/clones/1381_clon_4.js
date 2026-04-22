(function() {
    "use strict";

    // A central registry for all active GaugeManipulator instances,
    // allowing global event listeners (like resize) to manage them.
    const activeGaugeManipulators = new Map();

    /**
     * Represents a custom range input control (slider) for a given DOM element.
     * It provides functionality to manage a draggable indicator within a fill segment.
     */
    class GaugeManipulator {
        // Private fields for internal state management, ensuring no identifier reuse.
        #enclosingPanel;        // The primary container element (corresponds to original `this.element`)
        #fillSegment;           // The visual progress bar element (corresponds to original `this._bar`)
        #indicatorHandle;       // The draggable thumb/handle element (corresponds to original `this._thumb`)
        #configuration;         // Stores dynamic settings like min, max, current value, and disabled state (original `this.options`)
        #layoutMetrics;         // Stores calculated dimensions for layout (original `this._dim`)
        #currentProportion;     // Current percentage of the handle's position within the draggable range (original `this._mypercent`)
        #isOperational;         // Flag indicating if the component has completed its initial setup (original `this._initialized`)
        #lastUpdateSource;      // Tracks how the value was last updated (e.g., 'drag', 'script', 'creation') (original `this._action`)
        #eventHandlers;         // A map to store references to bound event handlers for proper cleanup

        /**
         * Constructs a new GaugeManipulator instance.
         * @param {HTMLElement} panelElement - The DOM element to transform into a slider. Must be a valid HTMLElement.
         * @param {object} [initialSettings={}] - Optional initial configuration settings.
         */
        constructor(panelElement, initialSettings = {}) {
            if (!(panelElement instanceof HTMLElement)) {
                throw new Error("GaugeManipulator: Provided panel element is not a valid HTMLElement.");
            }

            this.#enclosingPanel = panelElement;
            this.#eventHandlers = new Map();

            // Locate or create the fill segment (progress bar)
            this.#fillSegment = this.#enclosingPanel.querySelector('.progress-bar');
            if (!this.#fillSegment) {
                this.#fillSegment = document.createElement('div');
                this.#fillSegment.className = 'progress-bar';
                this.#enclosingPanel.appendChild(this.#fillSegment);
            }
            // Temporarily disable CSS transitions for width to prevent animation during initial setup
            this.#fillSegment.style.transition = 'width 0s ease 0s';

            // Locate or create the draggable indicator handle
            this.#indicatorHandle = this.#enclosingPanel.querySelector('.slider-bar');
            if (!this.#indicatorHandle) {
                this.#indicatorHandle = document.createElement('div');
                this.#indicatorHandle.className = 'slider-bar';
                this.#enclosingPanel.appendChild(this.#indicatorHandle);
            }

            // Initialize configuration, prioritizing attributes over defaults, then initialSettings
            this.#configuration = {
                minimumValue: parseFloat(this.#fillSegment.getAttribute('aria-valuemin')) || 0,
                currentVal: parseFloat(this.#fillSegment.getAttribute('aria-valuenow')) || 0,
                maximumValue: parseFloat(this.#fillSegment.getAttribute('aria-valuemax')) || 100,
                isDisabled: false, // Default disabled state
                ...initialSettings
            };

            // Initialize layout metrics
            this.#layoutMetrics = {
                thumbWidth: 0,
                trackTotalWidth: 0,
                draggableRangeWidth: 0,
                trackLeftGlobalOffset: 0
            };
            this.#currentProportion = 0;
            this.#isOperational = false;
            this.#lastUpdateSource = 'creation'; // Initial state

            this.#establishInteractions(); // Set up event listeners for dragging
            this.recalculateLayout();       // Perform initial measurements and position the indicator
            this.#isOperational = true;     // Mark as fully initialized

            // Apply the initial current value after full setup
            if (this.#configuration.currentVal !== undefined) {
                this.updateConfiguration('currentVal', this.#configuration.currentVal);
            }

            // Register this instance for global management
            activeGaugeManipulators.set(this.#enclosingPanel, this);
        }

        /**
         * Sets up mouse and touch event listeners for dragging the indicator.
         * This replaces the functionality of jQuery UI's `_mouseInit` method.
         */
        #establishInteractions() {
            const startDrag = (evt) => {
                if (this.#configuration.isDisabled) return; // Ignore events if disabled
                evt.preventDefault(); // Prevent default browser actions like text selection

                this.#lastUpdateSource = "drag";
                this.recalculateLayout(); // Recalculate dimensions on drag start (e.g., if window resized)

                const moveDrag = (moveEvt) => {
                    this.#processDragMovement(moveEvt.pageX || (moveEvt.touches && moveEvt.touches[0] ? moveEvt.touches[0].pageX : undefined));
                    moveEvt.preventDefault();
                };

                const endDrag = () => {
                    document.removeEventListener('mousemove', moveDrag);
                    document.removeEventListener('mouseup', endDrag);
                    document.removeEventListener('touchmove', moveDrag);
                    document.removeEventListener('touchend', endDrag);
                    document.removeEventListener('touchcancel', endDrag);
                    this.#eventHandlers.delete('dragMove');
                    this.#eventHandlers.delete('dragEnd');
                };

                // Add global event listeners for dragging
                document.addEventListener('mousemove', moveDrag);
                document.addEventListener('mouseup', endDrag);
                document.addEventListener('touchmove', moveDrag, { passive: false });
                document.addEventListener('touchend', endDrag);
                document.addEventListener('touchcancel', endDrag);

                // Store references to the dynamic handlers for potential later removal (though `endDrag` handles it)
                this.#eventHandlers.set('dragMove', moveDrag);
                this.#eventHandlers.set('dragEnd', endDrag);

                // Process the initial click/touch position
                this.#processDragMovement(evt.pageX || (evt.touches && evt.touches[0] ? evt.touches[0].pageX : undefined));
            };

            // Attach initial event listeners to the main panel
            this.#enclosingPanel.addEventListener('mousedown', startDrag);
            this.#enclosingPanel.addEventListener('touchstart', startDrag, { passive: false });
            this.#eventHandlers.set('dragStart', startDrag);
        }

        /**
         * Calculates and updates all relevant layout dimensions of the slider elements.
         * This method is part of the `recalculateLayout` process.
         * Corresponds to original `_measure`.
         */
        #measureElements() {
            this.#layoutMetrics.thumbWidth = this.#indicatorHandle.offsetWidth;
            this.#layoutMetrics.trackTotalWidth = this.#enclosingPanel.offsetWidth; // Width of the entire .progress container
            this.#layoutMetrics.draggableRangeWidth = this.#layoutMetrics.trackTotalWidth - this.#layoutMetrics.thumbWidth;

            // Get the global left offset of the actual progress bar element,
            // as this was used in the original for coordinate calculations.
            this.#layoutMetrics.trackLeftGlobalOffset = this.#fillSegment.getBoundingClientRect().left;
        }

        /**
         * Processes an incoming drag movement event, updating the visual position of the indicator
         * and recalculating the slider's value.
         * This replaces the functionality of original `_updatepos` and `_mouseDrag`.
         * @param {number} absolutePageX - The X coordinate of the mouse/touch event relative to the viewport.
         */
        #processDragMovement(absolutePageX) {
            if (absolutePageX === undefined) return; // Guard against missing pageX in touch events if not handled.

            const thumbWidthHalf = this.#indicatorHandle.offsetWidth / 2;

            // Calculate the target X position for the LEFT edge of the thumb, relative to the
            // actual progress bar's left edge. This aligns with original `e.pageX - this._dim.ht_width`.
            let targetThumbLeftRelative = absolutePageX - this.#layoutMetrics.trackLeftGlobalOffset - thumbWidthHalf;

            // Clamp the thumb's left position within the valid draggable range (0 to draggableRangeWidth)
            const clampedThumbLeft = Math.max(0, Math.min(this.#layoutMetrics.draggableRangeWidth, targetThumbLeftRelative));

            // Calculate the CSS percentage for visual updates (relative to the total panel width)
            const visualProportionPercent = (clampedThumbLeft / this.#layoutMetrics.trackTotalWidth) * 100;

            this.#indicatorHandle.style.left = `${visualProportionPercent}%`;
            this.#fillSegment.style.width = `${visualProportionPercent}%`;

            // Calculate the logical proportion based on the draggable range (original `dwidth`)
            this.#currentProportion = (clampedThumbLeft * 100) / this.#layoutMetrics.draggableRangeWidth;

            // Convert this logical proportion back to the actual slider value
            this.#configuration.currentVal = this.#convertProportionToValue(this.#currentProportion);

            // Update the ARIA attribute for accessibility
            this.#fillSegment.setAttribute('aria-valuenow', this.#configuration.currentVal);

            // Dispatch custom events to notify listeners
            const eventDetails = {
                detail: {
                    currentValue: this.#configuration.currentVal,
                    updateSource: this.#lastUpdateSource
                }
            };
            this.#enclosingPanel.dispatchEvent(new CustomEvent('valueUpdated', eventDetails)); // Equivalent to original 'change' event

            // Dispatch a 'completion' event if the slider reaches 100%
            if (this.#currentProportion === 100) {
                this.#enclosingPanel.dispatchEvent(new CustomEvent('rangeCompleted', eventDetails)); // Equivalent to original 'complete' event
            }
        }

        /**
         * Updates a single configuration option for the slider.
         * This replaces the functionality of original `_setOption`.
         * @param {string} key - The name of the configuration property to update.
         * @param {*} val - The new value for the property.
         */
        updateConfiguration(key, val) {
            // Perform type conversion for numeric properties
            if (['minimumValue', 'currentVal', 'maximumValue'].includes(key)) {
                val = parseFloat(val);
            }

            // Apply the new value
            this.#configuration[key] = val;

            // Special handling for 'currentVal' changes
            if (key === 'currentVal' && this.#isOperational) {
                this.#lastUpdateSource = "script"; // Indicate programmatic update
                this.recalculateLayout(); // Re-measure and visually update the slider
            } else if (key === 'isDisabled' && typeof val === "boolean") {
                // Update visual disabled state and dispatch an event
                if (val) {
                    this.#enclosingPanel.classList.add('is-disabled');
                } else {
                    this.#enclosingPanel.classList.remove('is-disabled');
                }
                this.#enclosingPanel.dispatchEvent(new CustomEvent('stateChanged', { detail: { isDisabled: val } })); // Equivalent to original 'disabled' event
            }
        }

        /**
         * Updates multiple configuration options for the slider.
         * This replaces the functionality of original `_setOptions`.
         * @param {object} settings - An object containing key-value pairs of configuration properties.
         */
        applyConfigurations(settings) {
            for (const key in settings) {
                if (Object.prototype.hasOwnProperty.call(settings, key)) {
                    this.updateConfiguration(key, settings[key]);
                }
            }
        }

        /**
         * Re-measures the slider's dimensions and re-positions the indicator based on the current value.
         * This replaces the functionality of original `refresh`.
         */
        recalculateLayout() {
            this.#measureElements(); // Ensure all dimensions are up-to-date

            if (this.#configuration.currentVal !== undefined) {
                const proportion = this.#convertValueToProportion(this.#configuration.currentVal);
                // Calculate the left position for the thumb relative to the draggable range
                const clampedThumbLeft = (proportion / 100) * this.#layoutMetrics.draggableRangeWidth;
                
                // Calculate the CSS percentage for visual updates (relative to total panel width)
                const visualProportionPercent = (clampedThumbLeft / this.#layoutMetrics.trackTotalWidth) * 100;

                this.#indicatorHandle.style.left = `${visualProportionPercent}%`;
                this.#fillSegment.style.width = `${visualProportionPercent}%`;

                this.#currentProportion = proportion; // Update internal logical proportion
                this.#fillSegment.setAttribute('aria-valuenow', this.#configuration.currentVal); // Update aria attribute
            }
            // Re-enable transitions after initial positioning if they were disabled
            this.#fillSegment.style.transition = ''; 
        }

        /**
         * Converts a numerical value (within min/max) to a percentage (0-100).
         * Corresponds to original `_nowToPercent`.
         * @param {number} value - The value to convert.
         * @returns {number} The corresponding percentage.
         */
        #convertValueToProportion(value) {
            const range = this.#configuration.maximumValue - this.#configuration.minimumValue;
            if (range === 0) return 0; // Avoid division by zero
            return ((value - this.#configuration.minimumValue) / range) * 100;
        }

        /**
         * Converts a percentage (0-100) to a numerical value within the min/max range.
         * Corresponds to original `_percentToNow`.
         * @param {number} proportion - The percentage to convert.
         * @returns {number} The corresponding numerical value, rounded to two decimal places.
         */
        #convertProportionToValue(proportion) {
            const range = this.#configuration.maximumValue - this.#configuration.minimumValue;
            const value = (proportion / 100 * range) + this.#configuration.minimumValue;
            return Math.round(value * 100) / 100; // Match original rounding behavior
        }

        /**
         * Cleans up the component by removing event listeners and DOM elements.
         * This replaces the functionality of original `_destroy`.
         */
        discard() {
            // Remove the main drag start event listener
            const startHandler = this.#eventHandlers.get('dragStart');
            if (startHandler) {
                this.#enclosingPanel.removeEventListener('mousedown', startHandler);
                this.#enclosingPanel.removeEventListener('touchstart', startHandler);
            }
            // Other drag handlers (`moveDrag`, `endDrag`) are typically removed by `endDrag` itself.
            this.#eventHandlers.clear(); // Clear the map of handlers

            // Remove the indicator handle from the DOM
            if (this.#indicatorHandle && this.#indicatorHandle.parentElement === this.#enclosingPanel) {
                 this.#indicatorHandle.remove();
            }

            // Remove this instance from the global registry
            activeGaugeManipulators.delete(this.#enclosingPanel);
        }
    }

    // --- Global Initialization and Event Handling (replacing jQuery's $(window).on('load') and $(window).resize) ---

    // Expose the class to the global scope under a unique, divergent name
    window.GaugeManipulator = GaugeManipulator;

    // Auto-initialize slider instances on page load for elements with specific classes.
    // The original uses 'load', but 'DOMContentLoaded' is often sufficient for DOM interaction.
    document.addEventListener('DOMContentLoaded', () => {
        // Find all elements that are `.progress` containers and also have the `.slider` class.
        // The original initializes these as disabled.
        document.querySelectorAll('.progress.slider').forEach(element => {
            // Prevent double-initialization if the element somehow gets processed twice
            if (!activeGaugeManipulators.has(element)) {
                new GaugeManipulator(element, { isDisabled: true });
            }
        });
    });

    // Re-measure and update all active slider instances when the window is resized.
    window.addEventListener('resize', () => {
        activeGaugeManipulators.forEach(manipulator => {
            manipulator.recalculateLayout();
        });
    });

})(); // End of Immediately Invoked Function Expression (IIFE)