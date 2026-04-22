(function($) {
    // Defines a class to manage a visual content rotator.
    class VisualNavigator {
        // Default configuration values for the rotator.
        static defaultSettings = {
            cycleInterval: 5000,     // Time between transitions in ms
            animationDuration: 500,  // Duration of fade animations in ms
            sizingFactor: 1,         // Line height factor for responsive sizing
            autoAdjustHeight: 'auto', // Placeholder, height is calculated
            pauseOnHover: false,     // Pause rotation when mouse is over slides
            showPaging: true,        // Display slide indicators
            enableNavigation: true,  // Placeholder for nav buttons (not implemented in original, so not in clone)
            enableKeyControl: true   // Allow keyboard navigation
        };

        // Constructor to initialize the rotator on a given element.
        constructor(domElement, customSettings) {
            this._mainFrame = $(domElement); // The main container jQuery object
            this._configOptions = $.extend({}, VisualNavigator.defaultSettings, customSettings);

            this._itemPanels = $('.slides li', this._mainFrame); // All individual slide panels
            this._indicatorElements = null; // Will store pager elements if they exist or are created

            this._presentIndex = 0; // Index of the currently displayed slide
            this._futureIndex = 1;  // Index of the next slide to be displayed

            this._cycleHandle = null; // Stores the setTimeout ID for auto-cycling
            this._aspectRatio = 0;    // Aspect ratio of the first image for responsive sizing

            this._containerWidth = 0; // Current width of the main container
            this._calculatedHeight = 0; // Calculated height for the container

            // Ensure there are slides to work with
            if (this._itemPanels.length === 0) {
                console.warn("VisualNavigator: No slide items found in the container.");
                return;
            }

            this._extractImageDimensions();
            this._setupInitialDisplay();
            this._configurePaging();
            this._recalibrateSize();
            this._attachHandlers();
            this._beginCycle(); // Start the auto-rotation
        }

        // Extracts dimensions from the first image to determine aspect ratio.
        _extractImageDimensions() {
            const firstImage = this._itemPanels.eq(this._presentIndex).find('img');
            if (firstImage.length) {
                const imgNaturalWidth = firstImage[0].naturalWidth || firstImage.width();
                const imgNaturalHeight = firstImage[0].naturalHeight || firstImage.height();
                if (imgNaturalHeight > 0) {
                    this._aspectRatio = imgNaturalWidth / imgNaturalHeight;
                }
            }
        }

        // Sets up the initial visibility and active state of slides.
        _setupInitialDisplay() {
            this._itemPanels.hide().eq(this._presentIndex).fadeIn(this._configOptions.animationDuration).addClass('active-panel');
        }

        // Manages the creation and event binding for pagination indicators.
        _configurePaging() {
            this._indicatorElements = $('.pager li', this._mainFrame);

            if (this._indicatorElements.length) {
                this._indicatorElements.eq(this._presentIndex).addClass('active-indicator');
            } else if (this._configOptions.showPaging) {
                const pagerContainer = $('<ul class="pager-nav"></ul>');
                this._itemPanels.each((idx) => {
                    pagerContainer.append(`<li><a href="#" data-panel-index="${idx}"><span>${idx + 1}</span></a></li>`);
                });
                this._mainFrame.append(pagerContainer);
                this._indicatorElements = $('.pager-nav li', this._mainFrame);
                this._indicatorElements.eq(this._presentIndex).addClass('active-indicator');
            }

            if (this._indicatorElements && this._indicatorElements.length) {
                this._mainFrame.on('click.visualNavigator', '.pager-nav a', (evt) => {
                    evt.preventDefault();
                    const targetIndex = parseInt($(evt.currentTarget).data('panel-index'), 10);
                    if (!isNaN(targetIndex) && targetIndex !== this._presentIndex) {
                        this._jumpToPanel(targetIndex);
                    }
                });
            }
        }

        // Primary function to transition between slides.
        _executeChange() {
            // Fade out current, remove active class
            this._itemPanels.eq(this._presentIndex).fadeOut(this._configOptions.animationDuration).removeClass('active-panel');

            // Fade in next, add active class, and then schedule the next cycle
            this._itemPanels.eq(this._futureIndex).fadeIn(this._configOptions.animationDuration).addClass('active-panel').promise().done(() => {
                this._postponeCycle(); // Schedule the next transition after current one completes
            });

            // Update pager indicators
            if (this._indicatorElements && this._indicatorElements.length) {
                this._indicatorElements.eq(this._presentIndex).removeClass('active-indicator');
                this._indicatorElements.eq(this._futureIndex).addClass('active-indicator');
            }

            // Update indices for the next round
            this._presentIndex = this._futureIndex;
            this._futureIndex = (this._presentIndex + 1) % this._itemPanels.length;
        }

        // Schedules the next slide transition using setTimeout.
        _postponeCycle() {
            clearTimeout(this._cycleHandle); // Clear any existing timer
            this._cycleHandle = setTimeout(() => {
                this._executeChange();
            }, this._configOptions.cycleInterval);
        }

        // Starts the auto-cycling process.
        _beginCycle() {
            this._postponeCycle();
        }

        // Pauses the auto-cycling.
        _haltCycle() {
            clearTimeout(this._cycleHandle);
        }

        // Resumes the auto-cycling.
        _initiateCycle() {
            this._postponeCycle();
        }

        // Jumps to a specific slide panel by index.
        _jumpToPanel(targetIndex) {
            if (targetIndex === this._presentIndex) return; // No change needed

            this._haltCycle(); // Stop current cycle
            this._futureIndex = targetIndex;
            this._executeChange(); // Execute transition immediately
        }

        // Advances to the next slide panel.
        _moveForward() {
            this._haltCycle();
            this._executeChange();
        }

        // Moves to the previous slide panel.
        _moveBackward() {
            this._haltCycle();
            this._futureIndex = (this._presentIndex - 1 + this._itemPanels.length) % this._itemPanels.length;
            this._executeChange();
        }

        // Calculates and applies the responsive height to the container.
        _recalibrateSize() {
            if (this._aspectRatio > 0) {
                this._containerWidth = $('.slides', this._mainFrame).width();
                this._calculatedHeight = Math.floor(
                    ((this._containerWidth / this._aspectRatio) / this._configOptions.sizingFactor)
                ) * this._configOptions.sizingFactor;
                $('.slides', this._mainFrame).css({ height: this._calculatedHeight });
            }
        }

        // Attaches all necessary event handlers (resize, hover, keynav).
        _attachHandlers() {
            $(window).on('resize.visualNavigator', () => this._recalibrateSize());

            if (this._configOptions.pauseOnHover) {
                this._mainFrame.on('mouseenter.visualNavigator', () => this._haltCycle());
                this._mainFrame.on('mouseleave.visualNavigator', () => this._initiateCycle());
            }

            if (this._configOptions.enableKeyControl) {
                $(document).on('keyup.visualNavigator', (keyEvt) => {
                    // Use key property for modern browsers, fallback to keyCode
                    switch (keyEvt.key) {
                        case 'ArrowRight':
                        case ' ': // Spacebar
                            this._moveForward();
                            break;
                        case 'ArrowLeft':
                            this._moveBackward();
                            break;
                    }
                    if (!keyEvt.key) { // Fallback for older browsers if key property is not available
                        switch (keyEvt.keyCode) {
                            case 39: // Right arrow
                            case 32: // Spacebar
                                this._moveForward();
                                break;
                            case 37: // Left arrow
                                this._moveBackward();
                                break;
                        }
                    }
                });
            }
        }

        // Public method to destroy the instance and clean up events.
        destroy() {
            this._haltCycle();
            $(window).off('.visualNavigator');
            this._mainFrame.off('.visualNavigator');
            $(document).off('.visualNavigator');
            this._mainFrame.removeData('visualNavigatorInstance'); // Clean up stored instance
            // Optionally revert DOM changes like removing dynamically created pager
            if (this._configOptions.showPaging && $('.pager-nav', this._mainFrame).length) {
                $('.pager-nav', this._mainFrame).remove();
            }
            this._itemPanels.css({ display: '', height: '' }).removeClass('active-panel'); // Reset slide styles
            this._itemPanels.first().css({ display: '' }); // Show first slide if it was hidden
        }
    }

    // jQuery plugin wrapper
    $.fn.sliderWidget = function(commandOrOptions) {
        // If a string command is passed (e.g., 'destroy')
        if (typeof commandOrOptions === 'string') {
            const args = Array.prototype.slice.call(arguments, 1);
            return this.each(function() {
                const instance = $.data(this, 'visualNavigatorInstance');
                if (instance && typeof instance[commandOrOptions] === 'function') {
                    instance[commandOrOptions].apply(instance, args);
                } else if (!instance) {
                    console.warn('sliderWidget: Attempted to call method "' + commandOrOptions + '" on an uninitialized element.');
                } else {
                    console.warn('sliderWidget: Method "' + commandOrOptions + '" does not exist on the instance.');
                }
            });
        }

        // Otherwise, initialize the plugin
        const settings = commandOrOptions;
        return this.each(function() {
            // Prevent multiple initializations on the same element
            if (!$.data(this, 'visualNavigatorInstance')) {
                $.data(this, 'visualNavigatorInstance', new VisualNavigator(this, settings));
            }
        });
    };
})(jQuery);