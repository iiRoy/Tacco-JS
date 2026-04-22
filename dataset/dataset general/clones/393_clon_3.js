/**
 * =====================
 * JQLite ImageCarousel
 * =====================
 * @author A. J. Developer
 * @version 1.0.0
 *
 * This software is provided under a permissive license.
 */

(function($) {

    // Define the jQuery plugin entry point.
    $.fn.imageCarousel = function processCarouselElements(options) {

        /**
         * Core engine for handling image carousel functionality.
         * Manages DOM elements, user interactions, and visual transitions.
         * @param {HTMLElement} elementRef - The DOM element to initialize the carousel on.
         * @param {object} settings - Configuration settings for the carousel.
         * @constructor
         */
        function ImageCarouselEngine(elementRef, settings) {
            // Validate the root element reference.
            if (!elementRef || !$(elementRef).length) {
                console.error("ImageCarouselEngine: Invalid or missing root element reference.");
                return;
            }

            this.$rootContainer = $(elementRef); // The main container for the carousel.
            this.$itemWrapper = this.$rootContainer.find(".carousel-container-wrapper"); // The element holding all carousel items.
            this.$carouselItems = this.$itemWrapper.find(".carousel-item"); // Individual items within the carousel.

            this.settings = settings; // Merged configuration options.

            // Set up the initial CSS transition for the item wrapper.
            this.$itemWrapper.css('transition', `left ${this.settings.animationDuration}s ease-in-out`);

            this.activePageIndex = 0; // Index of the currently displayed item (0-based).
            this.totalPageCount = this.$carouselItems.length; // Total number of items.

            this.isTransitioning = false; // Flag to prevent rapid, overlapping transitions.

            // Perform initial setup routines.
            this.initialize();
        }

        ImageCarouselEngine.prototype = {
            /**
             * Determines if the carousel contains only one displayable item.
             * This helps in deciding whether to show navigation controls.
             * @returns {boolean} True if only one item is present, false otherwise.
             */
            hasSingleItem : function() {
                // We consider an item singular if there's only one visible carousel item.
                return (this.$carouselItems.length <= 1);
            },

            /**
             * Initializes the carousel by setting up controls, event listeners,
             * and performing initial layout adjustments.
             */
            initialize : function () {
                // Ensure there are items to display.
                if (this.totalPageCount === 0) {
                    console.warn("ImageCarouselEngine: No carousel items found. Initialization halted.");
                    return;
                }

                // Append navigation controls if enabled and multiple items exist.
                if (!this.hasSingleItem() && this.settings.showControls) {
                    const navControlsMarkup = `
                        <div class="carousel-nav-controls">
                            <button class="nav-btn prev-btn" aria-label="Previous image">
                                <img src="${this.settings.controlIconData}" alt="Previous">
                            </button>
                            <span class="page-counter-display"></span>
                            <button class="nav-btn next-btn" aria-label="Next image">
                                <img src="${this.settings.controlIconData}" alt="Next">
                            </button>
                        </div>`;
                    this.$rootContainer.append(navControlsMarkup);

                    // Attach click handlers to the navigation buttons.
                    this.$rootContainer.find(".nav-btn.prev-btn").on("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Prevent propagation to avoid conflicts
                        this.handleNavigationInput(-1); // Move to the previous item
                    });
                    this.$rootContainer.find(".nav-btn.next-btn").on("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Prevent propagation to avoid conflicts
                        this.handleNavigationInput(1); // Move to the next item
                    });
                }

                // If there's only one item, hide any controls that might have been added.
                if (this.totalPageCount <= 1) {
                    this.$rootContainer.find(".carousel-nav-controls").addClass("is-hidden");
                }

                // Enable touch swipe gestures if configured.
                if(this.settings.touchControl.enabled) {
                    // Using a generic touch library (e.g., jQuery-mobile or custom swipe plugin)
                    // The original code used a 'swipe' plugin, so we simulate its call.
                    $(this.settings.touchControl.activationSelector).find(this.$itemWrapper).swipe( {
                        triggerOnTouchEnd : true,
                        swipeStatus : this.handleSwipeAction.bind(this),
                        allowPageScroll:"vertical" // Allow vertical page scrolling during horizontal swipes.
                    });
                }

                // Enable keyboard navigation for accessibility.
                if(this.settings.keyboardControl.enabled) {
                    $(document).on('keydown.carousel', (e) => { // Using namespaced event for easier unbinding
                        switch(e.key) {
                            case this.settings.keyboardControl.prevKey: // Previous item key
                                this.handleNavigationInput(-1);
                                break;
                            case this.settings.keyboardControl.nextKey: // Next item key
                                this.handleNavigationInput(1);
                                break;
                            default:
                                return; // Ignore other keys
                        }
                        e.preventDefault(); // Prevent default browser actions for arrow keys.
                    });
                }

                this.layoutAdjustments(); // Apply necessary CSS for layout.
                this.updatePageIndicator(); // Refresh the counter display.
            },

            /**
             * Applies essential CSS properties to ensure the carousel functions correctly.
             * This includes setting overflow, width for the wrapper, and item widths.
             */
            layoutAdjustments : function() {
                this.$rootContainer.css("overflow", "hidden"); // Hide overflowing items.
                this.$itemWrapper.css({
                    'width': (this.totalPageCount * 100) + '%' // Wrapper spans all items.
                });
                this.$carouselItems.css({
                    'float': 'left', // Arrange items horizontally.
                    'width': (100 / this.totalPageCount) + '%' // Each item takes its proportional width.
                });

                // Apply aspect ratio padding for responsive image containers.
                this.$carouselItems.find('.item-content-wrapper').css({
                    'height': '0px',
                    'padding-top': this.settings.aspectRatioPadding // Use padding-top for aspect ratio.
                });
            },

            /**
             * Updates the textual display indicating the current item number
             * relative to the total number of items.
             */
            updatePageIndicator : function() {
                this.$rootContainer.find(".page-counter-display").text(`${this.activePageIndex + 1} / ${this.totalPageCount}`);
            },

            /**
             * Transitions the carousel to display a specific item.
             * @param {number} [pageMovementAmount=1] - The number of pages moved, used to adjust transition duration.
             */
            transitionToPage : function(pageMovementAmount) {
                // Default to 1 if no movement amount is specified.
                const actualMovement = Math.abs(pageMovementAmount || 1);

                this.isTransitioning = true; // Set flag to prevent new transitions.

                // Apply CSS for smooth transition.
                this.$itemWrapper.css({
                    'transition': `left ${this.settings.animationDuration * actualMovement}s ease-in-out`,
                    'left': `${this.activePageIndex * -100}%`
                });

                // Reset transition flag after animation completes.
                setTimeout(() => {
                    this.isTransitioning = false;
                }, this.settings.animationDuration * actualMovement * 1000); // Convert seconds to milliseconds.

                this.updatePageIndicator(); // Refresh the counter.
            },

            /**
             * Calculates the new active page index based on an offset and
             * initiates the transition to that page.
             * Handles wrapping around when reaching the start or end.
             * @param {number} pageChangeDelta - The change in page index (-1 for previous, 1 for next).
             */
            handleNavigationInput : function(pageChangeDelta) {
                if (this.isTransitioning || this.totalPageCount <= 1) {
                    return; // Prevent new transitions if one is ongoing or if there's only one item.
                }

                const previousIndex = this.activePageIndex;
                // Calculate new index, handling negative modulo results correctly.
                this.activePageIndex = (this.activePageIndex + pageChangeDelta);
                if (this.activePageIndex < 0) {
                    this.activePageIndex = this.totalPageCount - 1;
                } else if (this.activePageIndex >= this.totalPageCount) {
                    this.activePageIndex = 0;
                }

                // Determine the actual number of pages moved for transition duration calculation.
                const actualPageChange = Math.abs(previousIndex - this.activePageIndex);

                this.transitionToPage(actualPageChange);
            },

            /**
             * Navigates to the previous image, ensuring it doesn't go below the first image.
             * This method is typically used for swipe gestures that shouldn't wrap around.
             */
            showPreviousItem : function()
            {
                if (this.isTransitioning || this.activePageIndex === 0) {
                    return;
                }
                const previousIndex = this.activePageIndex;
                this.activePageIndex = Math.max(this.activePageIndex - 1, 0);
                const actualPageChange = previousIndex - this.activePageIndex;
                this.transitionToPage(actualPageChange);
            },

            /**
             * Navigates to the next image, ensuring it doesn't go beyond the last image.
             * This method is typically used for swipe gestures that shouldn't wrap around.
             */
            showNextItem : function()
            {
                if (this.isTransitioning || this.activePageIndex === this.totalPageCount - 1) {
                    return;
                }
                const previousIndex = this.activePageIndex;
                this.activePageIndex = Math.min(this.activePageIndex + 1, this.totalPageCount - 1);
                const actualPageChange = this.activePageIndex - previousIndex;
                this.transitionToPage(actualPageChange);
            },

            /**
             * Manually adjusts the CSS 'left' property of the item wrapper
             * during a drag or swipe gesture for immediate visual feedback.
             * @param {number} currentOffsetPercent - The target 'left' position as a percentage.
             * @param {number} durationSeconds - The duration of the CSS transition in seconds.
             */
            adjustWrapperPosition : function(currentOffsetPercent, durationSeconds)
            {
                // Ensure smooth visual feedback by setting transition duration.
                this.$itemWrapper.css("transition", `left ${durationSeconds}s linear`);
                this.$itemWrapper.css("left", `${currentOffsetPercent}%`);
            },

            /**
             * Callback function for the swipe gesture library.
             * Interprets swipe phases (move, cancel, end) to control carousel movement.
             * @param {Event} event - The original touch event.
             * @param {string} phase - Current phase of the swipe ('move', 'cancel', 'end').
             * @param {string} direction - Direction of the swipe ('left', 'right', 'up', 'down').
             * @param {number} distance - Total distance swiped in pixels.
             * @param {number} fingers - Number of fingers used in the swipe.
             */
            handleSwipeAction : function(event, phase, direction, distance, fingers)
            {
                if (fingers !== 1 || this.totalPageCount <= 1) {
                    return; // Only respond to single-finger horizontal swipes on multi-item carousels.
                }

                // Calculate the distance as a percentage relative to the carousel's width.
                const relativeSwipeDistance = (distance / this.$rootContainer.width()) * 100;
                let currentItemLeftPosition = this.activePageIndex * 100;

                // Handle the 'move' phase: continuously update the wrapper's position.
                if( phase === "move" && (direction === "left" || direction === "right") )
                {
                    const transitionDuration = 0; // Instantaneous adjustment during drag.

                    if (direction === "left") {
                        this.adjustWrapperPosition(currentItemLeftPosition + relativeSwipeDistance, transitionDuration);
                    } else if (direction === "right") {
                        this.adjustWrapperPosition(currentItemLeftPosition - relativeSwipeDistance, transitionDuration);
                    }
                }
                // Handle the 'cancel' phase: snap back to the current item if swipe not completed.
                else if ( phase === "cancel")
                {
                    this.adjustWrapperPosition(currentItemLeftPosition, this.settings.animationDuration);
                }
                // Handle the 'end' phase: trigger a full item transition based on swipe direction.
                else if ( phase === "end" )
                {
                    if (direction === "right") {
                        this.showPreviousItem();
                    } else if (direction === "left") {
                        this.showNextItem();
                    }
                }
            }
        };

        // Iterate over each selected element and apply the carousel.
        this.each(function() {
            // Merge default options with user-provided options.
            // Using deep merge (true) to combine nested objects like 'touchControl' and 'keyboardControl'.
            const mergedOpts = $.extend(true, {}, $.fn.imageCarousel.DEFAULT_OPTIONS, options);
            // Store the carousel instance on the element's data for later access.
            $(this).data('imageCarouselInstance', new ImageCarouselEngine(this, mergedOpts));
        });

        return this; // Allow jQuery chaining.
    };

    /**
     * Define default configuration options for the Image Carousel.
     * These can be overridden by passing an options object to the plugin.
     */
    $.fn.imageCarousel.DEFAULT_OPTIONS = {
        /**
         * Duration in seconds for a single item slide animation.
         * Multiplied by the number of pages moved for longer transitions.
         */
        animationDuration:  0.4, // Slightly faster default.

        /**
         * Configuration for touch swipe gesture support.
         *
         * activationSelector: A CSS selector for the element that will trigger swipe events.
         * Default value '.touch' is often used by Modernizr to indicate touch support.
         * Set to 'html' or 'body' to always enable swipe on the entire document.
         */
        touchControl: {
            enabled: true,
            activationSelector: '.touch'
        },

        /**
         * Configuration for keyboard navigation support.
         *
         * prevKey / nextKey values represent the string name of the key (e.g., 'ArrowLeft', 'ArrowRight').
         */
        keyboardControl: {
            enabled: true,
            prevKey: 'ArrowLeft', // Left arrow key
            nextKey: 'ArrowRight' // Right arrow key
        },

        showControls: true, // Whether to display navigation buttons.

        /**
         * Base64 encoded SVG for the navigation control icon.
         * This example uses a simple right-pointing arrow in white.
         */
        controlIconData: 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cuc2NvbS9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4NCiAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTEwIDZMMTggMTJMOCAxOHoiLz4NCjwvc3ZnPg==',

        /**
         * Aspect ratio padding for carousel items.
         * e.g., '56.25%' for 16:9, '75%' for 4:3.
         * This helps maintain image aspect ratios responsively.
         */
        aspectRatioPadding: '56.25%' // Default to 16:9 aspect ratio.
    };

})(jQuery);