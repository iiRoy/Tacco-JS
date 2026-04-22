(function(jq) {

    jq.fn.modestCarousel = function modestCarouselInit(params) {

        function ModestCarousel(hostElement, params) {
            this.$hostElement = jq(hostElement);
            this.$contentWrapper = this.$hostElement.find(".item-wrapper");
            this.$mediaItems = this.$contentWrapper.find(".carousel-item");

            this.params = params;

            this.$contentWrapper.css('transition', 'left ' + this.params.animationDuration + 's cubic-bezier(0.25, 0.1, 0.25, 1.0)');


            this.activeItemIndex = 0;
            this.itemCount = undefined;

            this.initialize();
        }

        ModestCarousel.prototype = {
            /**
             * Determines if the carousel contains only a single displayable item.
             * @returns {boolean} True if only one item is present, false otherwise.
             */
            hasSingleItem: function() {
                return (jq(this.$hostElement).find(".carousel-item").not(".preview-mode").length) <= 1;
            },

            initialize: function() {
                // Initial setup tasks for the carousel component.

                // jq(this.params.gesture.activationSelector).find(this.$hostElement).find('.preview-mode').remove();

                // Dynamically append navigation controls to the DOM, if enabled.
                if (!this.hasSingleItem() && this.params.showControls) {
                    this.$hostElement.append(
                        `<a href='#' class='nav-buttons'>
                            <img class='forward-btn' src='${this.params.forwardIconSrc}'/>
                            <span class='item-count-display'>${this.activeItemIndex + 1}/${this.itemCount}</span>
                        </a>`
                    );
                }

                // Attach event listener for clicks on navigation buttons.
                this.$hostElement.find(".nav-buttons").on("click", function(evt) {
                    evt.preventDefault();
                    this.handleUserInput(1);
                }.bind(this));

                // this.$hostElement.find(".miniature-item").on("click", this.miniatureItemClickHandler.bind(this));


                // If there's only one item, hide navigation controls.
                if (this.itemCount === 1) {
                    this.$hostElement.find(".nav-buttons").addClass("hidden-element");
                }
                /*
                 * Logic for stopping swipe suggestion animation (if any).
                 * else {
                 *  // Stop any ongoing swipe suggestion visual cues when the carousel is interacted with.
                 *  this.$hostElement.on('click', function() {
                 *      clearInterval(this.promptAnimationTimer);
                 *  });
                 * }
                 */

                // Enable touch gesture support if configured.
                if (this.params.gesture.enabled) {
                    jq(this.params.gesture.activationSelector).find(this.$contentWrapper).swipe({
                        triggerOnTouchEnd: true,
                        swipeStatus: this.gestureStateUpdate.bind(this),
                        allowPageScroll: "vertical"
                    });
                }

                // Enable keyboard navigation for previous/next items.
                if (this.params.keyboard.enabled) {
                    jq(document).on('keydown', function(evt) {
                        switch (evt.which) {
                            case this.params.keyboard.prevKey: // Navigate to the prior item
                                this.handleUserInput(-1);
                                break;

                            case this.params.keyboard.nextKey: // Navigate to the subsequent item
                                this.handleUserInput(1);
                                break;

                            default:
                                return; // Ignore other key presses
                        }
                        evt.preventDefault();
                    }.bind(this));
                }

                this.itemCount = this.$hostElement.find('.carousel-item').length;
                this.recalculateDimensions();
                this.updateDisplayCount();
            },

            /**
             * @param clickEvent Event object from the thumbnail click.
             * miniatureItemClickHandler : function(clickEvent) {
             *    clickEvent.preventDefault();
             *    let distanceToShift = this.activeItemIndex;
             *    this.activeItemIndex = parseInt(clickEvent.currentTarget.dataset.itemId, 10);
             *    distanceToShift -= this.activeItemIndex;
             *    this.transitionToItem(distanceToShift);
             * },
             */

            /**
             * Sets up the necessary CSS properties for carousel functionality.
             */
            recalculateDimensions: function() {
                this.$hostElement.css("overflow", "hidden");
                this.$contentWrapper.css({
                    width: this.itemCount * 100 + "%"
                });
                this.$mediaItems.css({
                    float: "left",
                    width: 100 / this.itemCount + "%"
                });

                this.$mediaItems.find('img').hiResLoader({
                    useTransparentGif: true
                });
                this.$mediaItems.find('.media-holder').css({
                    'height': '0px',
                    'padding-top': this.params.aspectRatio
                });
            },

            /**
             * Updates the textual counter showing the current item position.
             */
            updateDisplayCount: function() {
                this.$hostElement.find(".item-count-display").text((this.activeItemIndex + 1) + "/" + (this.itemCount));
            },

            /**
             * updateNavButtonVisibility : function() {
             *    if(this.activeItemIndex === this.itemCount - 1) {
             *        this.$hostElement.find(".nav-buttons").addClass("hidden-element");
             *    } else {
             *        this.$hostElement.find(".nav-buttons").removeClass("hidden-element");
             *    }
             * },
             */

            /**
             * Executes the visual transition to a new item.
             * @param slideIncrement (optional) Number of items moved, affecting transition duration.
             */
            transitionToItem: function(slideIncrement) {
                if (typeof slideIncrement === 'undefined') {
                    slideIncrement = 1;
                }
                slideIncrement = Math.abs(slideIncrement);

                this.$contentWrapper.css({
                    transition: "left, " + this.params.animationDuration * slideIncrement + "s cubic-bezier(0.25, 0.1, 0.25, 1.0)",
                    left: (this.activeItemIndex * -100) + "%"
                });

                // this.updateNavButtonVisibility();

                this.updateDisplayCount();
            },

            /**
             * Processes user interaction (e.g., button click, key press) to determine the next item.
             * @param directionChange - Indicates the direction and magnitude of item change.
             * A robust modulo operation is used to handle negative results correctly in JavaScript.
             */
            handleUserInput: function(directionChange) {
                let movementDelta = this.activeItemIndex;
                this.activeItemIndex = (((this.activeItemIndex + directionChange) % this.itemCount) + this.itemCount) % this.itemCount;
                movementDelta -= this.activeItemIndex;

                this.transitionToItem(movementDelta);
            },

            /*
             animateSwipePrompt : function() {
             this.$contentWrapper.css('left', '-15px');
             setTimeout(function() {
             this.$contentWrapper.css('left', '7px');

             setTimeout(function() {
             this.$contentWrapper.css('left', '0px');
             }, 250);
             }, 250);
             },

             promptAnimationTimer : setInterval(this.animateSwipePrompt, 3000),
             */

            /**
             * Moves the carousel to the item immediately preceding the current one.
             */
            gotoPreviousItem: function() {
                let itemShiftAmount = this.activeItemIndex;
                this.activeItemIndex = Math.max(this.activeItemIndex - 1, 0);
                itemShiftAmount -= this.activeItemIndex;
                this.transitionToItem(itemShiftAmount);
            },

            /**
             * Advances the carousel to the item immediately following the current one.
             */
            gotoNextItem: function() {
                let itemShiftAmount = this.activeItemIndex;
                this.activeItemIndex = Math.min(this.activeItemIndex + 1, this.itemCount - 1);
                itemShiftAmount -= this.activeItemIndex;
                this.transitionToItem(itemShiftAmount);
            },

            /**
             * Adjusts the visible position of the content wrapper during a drag.
             */
            panContent: function(dragOffsetPx, animationDurationSec) {
                /*
                 * // Clear any active swipe suggestion animation on touch devices.
                 * if (this.promptAnimationTimer) {
                 *  clearInterval(this.promptAnimationTimer);
                 * }
                 */
                // Invert the offset if necessary for CSS 'left' property.
                let adjustedPercentage = (dragOffsetPx < 0 ? "" : "-") + Math.abs(dragOffsetPx).toString();
                this.$contentWrapper.css("transition", `left ${animationDurationSec}s cubic-bezier(0.25, 0.1, 0.25, 1.0)`);
                this.$contentWrapper.css("left", adjustedPercentage + "%");
            },

            /**
             * Callback function for handling different phases of a swipe gesture.
             * move: Drags the content wrapper.
             * cancel: Snaps the content back to its original position.
             * end: Completes the swipe, transitioning to the next or previous item.
             */

            gestureStateUpdate: function(touchEvent, gesturePhase, swipeDirection, currentDragDistance, activeFingers) {
                let percentageMoved = 100 / jq(this.$hostElement).width() * currentDragDistance;
                // If a swipe is in progress (move phase) and in a horizontal direction, manually pan the items.
                if (gesturePhase === "move" && (swipeDirection === "left" || swipeDirection === "right")) {
                    let transitionTime = 0;

                    if (swipeDirection === "left")
                        this.panContent((100 * this.activeItemIndex) + percentageMoved, transitionTime);

                    else if (swipeDirection === "right")
                        this.panContent((100 * this.activeItemIndex) - percentageMoved, transitionTime);
                }

                // If the swipe is cancelled, revert to the current item's position.
                else if (gesturePhase === "cancel") {
                    this.panContent(100 * this.activeItemIndex, this.params.animationDuration);
                }

                // If the swipe completes, transition to the adjacent item.
                else if (gesturePhase === "end") {
                    if (swipeDirection === "right")
                        this.gotoPreviousItem();
                    else if (swipeDirection === "left")
                        this.gotoNextItem();
                }
            }
        };

        this.each(function() {
            let instanceSettings = jq.extend({}, DomUtil.fn.modestCarousel.STANDARD_SETTINGS, params);
            jq(this).data('modestCarousel', new ModestCarousel(this, instanceSettings));
        });
        return this; // Enable jQuery method chaining
    };

    /**************************************************************************************
     * IMPORTANT: Provide custom settings via parameters; avoid directly modifying defaults. *
     **************************************************************************************/
    DomUtil.fn.modestCarousel.STANDARD_SETTINGS = {
        /**
         * The duration in seconds for a single item's slide animation.
         * For example, sliding 3 items would take (3 * animationDuration) seconds.
         */
        animationDuration: 0.5,

        /**
         * Configuration for touch-based gesture interactions (e.g., swiping).
         *
         * activationSelector: A CSS selector for the element that must contain the carousel
         * for swipe gestures to be active. The default '.touch' targets Modernizr's class
         * indicating touch support.
         *
         * To always enable swiping, set this to 'html' or 'body'.
         */
        gesture: {
            enabled: true,
            activationSelector: '.touch'
        },

        /**
         * Configuration for keyboard navigation.
         * prevKey / nextKey values represent the key codes for moving backward/forward.
         * Defaults are left (37) and right (39) arrow keys.
         */
        keyboard: {
            enabled: true,
            prevKey: 37,
            nextKey: 39
        },

        showControls: true, // It is strongly recommended to keep navigation controls enabled.

        /**
         * The source path (or base64 encoded string) for the image displayed
         * within the navigation control buttons.
         * Default is a white base64 encoded SVG arrow graphic.
         */
        forwardIconSrc: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNS4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkViZW5lXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMjAwcHgiIGhlaWdodD0iMjAwcHgiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBlbmFibGUtYmFja2dyb3VuZz0ibmV3IDAgMCAyMDAgMjAwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwb2x5bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHBvaW50cz0iDQoJNTUuMzU0LDUuOTQ2IDE0NC42NDYsOTkuNjE0IDU1LjM1NCwxOTQuMDUzICIvPg0KPC9zdmc+DQo=',

        aspectRatio: '50%' // Defines the aspect ratio of carousel items (e.g., '50%' means 2:1 width-to-height ratio).
    };

})(jQuery);