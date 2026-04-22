(function(jq) {
    /**
     * @fileoverview A robust and dynamic image carousel plugin for jQuery.
     * This plugin transforms a standard HTML structure into an interactive image slider,
     * featuring navigation controls, responsive layout adjustments, and optional autoplay.
     *
     * @license MIT
     * @version 1.1.0
     * @author CloneGenius
     */

    /**
     * Initializes a dynamic image carousel on the selected element.
     *
     * @param {object} [userConfig] - Configuration options for the carousel.
     * @param {number} [userConfig.transitionSpeed=400] - Duration of the slide animation in milliseconds.
     * @param {string} [userConfig.animationType='swing'] - Easing function for the animation (e.g., 'swing', 'linear').
     * @param {boolean} [userConfig.enableAutoplay=false] - Whether the carousel should automatically advance slides.
     * @param {number} [userConfig.autoplayInterval=3000] - Time in milliseconds between automatic slide transitions.
     * @param {boolean} [userConfig.enableLooping=true] - Whether the carousel should loop back to the beginning after the last slide.
     * @returns {jQuery} The jQuery object to allow for method chaining.
     */
    jq.fn.dynamicImageCarousel = function(userConfig) {
        // Define default configuration settings for the carousel
        const defaultSettings = {
            transitionSpeed: 400, // Speed of slide animation
            animationType: 'swing', // Easing for animations
            enableAutoplay: false, // Autoplay feature toggle
            autoplayInterval: 3000, // Time between auto-advances
            enableLooping: true // Carousel loops or stops at ends
        };

        // Merge user-provided configuration with defaults
        const currentSettings = jq.extend({}, defaultSettings, userConfig);

        // Reference to the jQuery object representing the plugin's main container
        const pluginTarget = this;

        // --- DOM Element Selectors (renamed from original) ---
        const carouselWindowSelector = '#carousel-display-area';
        const slideItemSelector = '.carousel-panel';
        const previousButtonSelector = '#prev-slide-btn';
        const nextButtonSelector = '#next-slide-btn';

        // --- Initial Guard Clauses and Element Retrieval ---
        // Ensure the plugin is called on an existing element
        if (!pluginTarget.length) {
            console.warn('Dynamic Image Carousel: Target element not found on the page. Initialization aborted.');
            return pluginTarget;
        }

        // Find core DOM elements within the plugin's target container
        let slideTrack = pluginTarget.find(carouselWindowSelector); // Renamed from 'sliders'
        let slidePanels = pluginTarget.find(slideItemSelector); // Renamed from 'img'
        let prevNavigation = pluginTarget.find(previousButtonSelector); // Renamed from 'prev'
        let nextNavigation = pluginTarget.find(nextButtonSelector); // Renamed from 'next'

        // Essential element validation
        if (!slideTrack.length || !slidePanels.length) {
            console.error('Dynamic Image Carousel: Required elements (carousel display area or slide panels) are missing. Plugin cannot function.');
            return pluginTarget;
        }

        // --- Internal State Variables (renamed from original) ---
        let singlePanelWidth = 0; // Stores the calculated width of a single slide panel
        let totalPanelCount = slidePanels.length; // Total number of slide panels
        let lastValidPanelIndex = totalPanelCount - 1; // Maximum index for a slide panel
        let activePanelIndex = 0; // Current displayed slide panel index
        let autoplayTimerIdentifier = null; // Holds the ID for the autoplay interval

        // --- Helper Functions ---

        /**
         * Adjusts the layout of the carousel, including slide widths and container position.
         * This function is called on initialization and window resize events.
         */
        const synchronizeLayout = function() {
            // Determine the width of each individual slide panel based on the window's current width
            // This ensures responsiveness to screen size changes.
            singlePanelWidth = jq(window).width();

            // Apply the calculated width to each slide panel
            slidePanels.each(function() {
                jq(this).css({ width: singlePanelWidth });
            });

            // Set the total width of the slide track (container holding all panels)
            // This width is sum of all panel widths, allowing horizontal scrolling/animation.
            slideTrack.css({
                width: totalPanelCount * singlePanelWidth
            });

            // Reposition the slide track to correctly display the active panel
            slideTrack.css({
                left: -activePanelIndex * singlePanelWidth
            });

            // Optionally, re-enable buttons after resize if they were disabled
            updateNavigationButtonStates();
        };

        /**
         * Navigates the carousel to a specified slide panel index.
         * Handles looping behavior and animation.
         * @param {number} targetPanelIdx - The index of the slide panel to navigate to.
         */
        const advanceToPanel = function(targetPanelIdx) {
            let finalTargetIndex = targetPanelIdx;

            // Handle looping logic if enabled
            if (currentSettings.enableLooping) {
                if (finalTargetIndex < 0) {
                    finalTargetIndex = lastValidPanelIndex; // Loop to the last slide
                } else if (finalTargetIndex > lastValidPanelIndex) {
                    finalTargetIndex = 0; // Loop to the first slide
                }
            } else {
                // If not looping, prevent navigation beyond bounds
                if (finalTargetIndex < 0 || finalTargetIndex > lastValidPanelIndex) {
                    return; // Do nothing if target is out of bounds
                }
            }

            activePanelIndex = finalTargetIndex; // Update current slide index

            // Stop any ongoing animation before starting a new one to prevent queuing issues
            slideTrack.stop(true, true).animate({
                left: -activePanelIndex * singlePanelWidth // Calculate new left position
            }, currentSettings.transitionSpeed, currentSettings.animationType);

            // Update the enabled/disabled state of navigation buttons
            updateNavigationButtonStates();
        };

        /**
         * Manages the enabled/disabled state of the previous and next navigation buttons.
         * This is particularly relevant when looping is disabled.
         */
        const updateNavigationButtonStates = function() {
            if (!currentSettings.enableLooping) {
                prevNavigation.prop('disabled', activePanelIndex === 0);
                nextNavigation.prop('disabled', activePanelIndex === lastValidPanelIndex);
            } else {
                // Ensure buttons are always enabled if looping
                prevNavigation.prop('disabled', false);
                nextNavigation.prop('disabled', false);
            }
        };

        /**
         * Starts the automatic slide advancement if autoplay is enabled.
         */
        const activateAutoplay = function() {
            if (currentSettings.enableAutoplay) {
                deactivateAutoplay(); // Clear any existing timer before starting a new one
                autoplayTimerIdentifier = setInterval(() => {
                    advanceToPanel(activePanelIndex + 1); // Move to the next slide
                }, currentSettings.autoplayInterval);
            }
        };

        /**
         * Stops any active automatic slide advancement.
         */
        const deactivateAutoplay = function() {
            if (autoplayTimerIdentifier) {
                clearInterval(autoplayTimerIdentifier);
                autoplayTimerIdentifier = null;
            }
        };

        // --- Event Binding ---

        // Bind click event for the next slide button
        nextNavigation.on('click', function() {
            deactivateAutoplay(); // Stop autoplay on user interaction
            advanceToPanel(activePanelIndex + 1);
        });

        // Bind click event for the previous slide button
        prevNavigation.on('click', function() {
            deactivateAutoplay(); // Stop autoplay on user interaction
            advanceToPanel(activePanelIndex - 1);
        });

        // Bind resize event to the window for responsive adjustments
        // Debounce the resize event to improve performance by limiting how often `synchronizeLayout` is called
        jq(window).on('resize', function() {
            clearTimeout(pluginTarget.resizeDelayTimer); // Clear any pending resize timer
            pluginTarget.resizeDelayTimer = setTimeout(function() {
                synchronizeLayout(); // Re-calculate and apply layout changes
                activateAutoplay(); // Restart autoplay (if active) to ensure correct timing
            }, 150); // Wait 150ms after resizing stops before updating layout
        });

        // --- Initial Setup Calls ---

        // Perform initial layout synchronization
        synchronizeLayout();

        // Set initial button states based on looping configuration
        updateNavigationButtonStates();

        // Start autoplay if enabled in settings
        activateAutoplay();

        // --- Public Methods (optional, for external control) ---
        /**
         * Allows external control to navigate to a specific slide index.
         * @param {number} index - The zero-based index of the slide to display.
         */
        pluginTarget.goToSlide = function(index) {
            deactivateAutoplay(); // Stop autoplay on manual control
            advanceToPanel(index);
        };

        // Return the jQuery object to maintain chainability
        return pluginTarget;
    };
})(jQuery);