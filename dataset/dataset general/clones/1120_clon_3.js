/*
 * tourguide.js
 * @author Guilherme Augusto Madaleno <guimadaleno@me.com> (Original Author)
 * @version 1.0.0 (Type III Clone)
 * A jQuery plugin for creating interactive guided tours.
 */

// Ensure jQuery is loaded before attempting to define the plugin.
if (typeof jQuery === 'undefined') {
    throw new Error('GuidedTour requires jQuery.');
}

(function($) {
    // Utility function to check if a value is a function
    const isCallable = val => typeof val === 'function';

    // Helper for deep merging options
    const deepMerge = (target, source) => {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
                    target[key] = deepMerge(target[key] || {}, source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };

    /**
     * Initializes the guided tour for selected elements.
     * @param {object} customOptions - User-defined options to override defaults.
     */
    $.fn.guidedTour = function(customOptions) {
        // Default configuration for the tour system
        const defaultSettings = {
            // Main selector for tour steps, derived from the jQuery selection
            targetClass: (this.selector && this.selector.length > 1 && (this.selector.startsWith('.') || this.selector.startsWith('#'))) ? this.selector.substring(1) : 'tour-step',

            // General tour behavior settings
            general: {
                keyboardNavigation: true, // Allow keyboard (arrow keys) navigation
                smoothScrolling: true,    // Animate scroll to active element
                paddingValue: '40px',     // Spacing around the highlighted element
                animationSpeed: 0.3,      // CSS transition duration in seconds
                minViewportHeight: 400    // Minimum window height required for the tour
            },

            // Backdrop (overlay) settings
            backdrop: {
                cssClass: 'guided-tour-backdrop',
                backgroundColor: 'rgba(0,0,0,0.85)',
                escapeKeyCloses: true,    // Allow closing with the Escape key
                onCloseCallback: false    // Callback function when backdrop is closed
            },

            // Control button settings
            controls: {
                closeButton: {
                    cssClass: 'guided-tour-btn-close',
                    label: 'End Tour',
                    onClickAction: false
                },
                previousButton: {
                    cssClass: 'guided-tour-btn-prev',
                    label: '&larr; Previous',
                    onClickAction: false
                },
                nextButton: {
                    cssClass: 'guided-tour-btn-next',
                    label: 'Next &rarr;',
                    onClickAction: false
                }
            },

            // CSS classes used internally by the tour
            styleClasses: {
                // Tooltip arrow positioning classes
                pointers: {
                    top: "gt-tooltip-arrow-top",
                    right: "gt-tooltip-arrow-right",
                    bottom: "gt-tooltip-arrow-bottom",
                    left: "gt-tooltip-arrow-left"
                },
                // Content panel classes
                contentPanel: {
                    buttonsWrapper: "gt-buttons-container",
                    highlightWrapper: "gt-highlight-wrapper",
                    textDisplay: "gt-text-content",
                    tooltipBox: "gt-tooltip-box"
                }
            },

            // Data attributes used for tour elements
            dataAttributes: {
                stepOrder: "data-gt-order",
                originalElementPosition: "data-gt-orig-position",
                originalElementZIndex: "data-gt-orig-zindex",
                tooltipText: "data-gt-tip"
            },

            // Lifecycle callbacks
            onTourStart: false, // Callback executed when the tour officially begins

            // Main container ID and class for the entire tour UI
            mainTourContainerId: "guided-tour-main-wrapper",
            mainTourContainerClass: "guided-tour-main-wrapper"
        };

        // Deep merge user options with defaults
        const tourConfig = deepMerge(defaultSettings, customOptions || {});

        // Internal state and runtime data for the tour instance
        const tourState = {
            alignmentTimer: null,
            currentActiveElement: null,
            tourElementsCollection: this, // The initial jQuery collection of elements
            orderedElementsCount: 0,
            currentElementComputedPosition: '',
            elementHeightPx: 0,
            elementLeftPx: 0,
            elementOffsetCoords: null,
            elementMarginPx: 0,
            orderedElementsArray: [], // Stores elements in their tour order
            totalTourSteps: 0,
            elementTopPx: 0,
            elementWidthPx: 0,
            elementWindowTopBound: 0,
            elementWindowRightBound: 0,
            elementWindowLeftBound: 0,
            elementZIndexValue: 0,
            zIndexRecalculationTimer: null,
            highlightContainerCss: null,
            activeStep: 0,       // 0-based index for the current step in orderedElementsArray
            isTourActive: false, // Flag to indicate if the tour is running
            resizeDebounceTimer: null
        };

        // Core tour logic module
        const tourCore = {
            /**
             * Initializes the tour, sets up elements, and displays the first step.
             */
            initTour: function() {
                // Pre-check for minimum viewport height
                if ($(window).height() < tourConfig.general.minViewportHeight) {
                    return; // Abort tour initialization
                }

                // Ensure the DOM is fully loaded before manipulating it
                $(document).ready(() => {
                    // Count eligible elements for the tour
                    tourState.tourElementsCollection.each(function() {
                        const $thisElement = $(this);
                        if ($thisElement.hasClass(tourConfig.targetClass) && $thisElement.attr(tourConfig.dataAttributes.tooltipText)) {
                            tourState.totalTourSteps++;
                        }
                        if ($thisElement.attr(tourConfig.dataAttributes.stepOrder)) {
                            tourState.orderedElementsCount++;
                        }
                    });

                    // If elements have explicit order, reorder the collection
                    if (tourState.orderedElementsCount > 0 && tourState.totalTourSteps > 0) {
                        tourState.tourElementsCollection.each(function() {
                            const orderVal = parseInt($(this).attr(tourConfig.dataAttributes.stepOrder), 10);
                            if (!isNaN(orderVal) && orderVal >= 1) { // Ensure order is a valid positive number
                                tourState.orderedElementsArray[orderVal - 1] = this;
                            }
                        });
                        // Filter out any undefined/null entries if some orders were skipped or invalid
                        tourState.orderedElementsArray = tourState.orderedElementsArray.filter(el => el !== undefined && el !== null);
                        // Update total steps based on the actual ordered array
                        tourState.totalTourSteps = tourState.orderedElementsArray.length;
                    } else {
                        // If no explicit order, use the original collection as is for steps
                        tourState.orderedElementsArray = tourState.tourElementsCollection.get().filter($el =>
                            $($el).hasClass(tourConfig.targetClass) && $($el).attr(tourConfig.dataAttributes.tooltipText)
                        );
                        tourState.totalTourSteps = tourState.orderedElementsArray.length;
                    }

                    // Remove any existing tour wrapper to prevent duplicates
                    $('#' + tourConfig.mainTourContainerId).remove();

                    // Dynamically create the main tour UI elements
                    const $mainWrapper = $('<div>')
                        .attr('id', tourConfig.mainTourContainerId)
                        .addClass(tourConfig.mainTourContainerClass)
                        .hide();

                    const $backdrop = $('<div>')
                        .addClass(tourConfig.backdrop.cssClass);

                    const $highlightContainer = $('<div>')
                        .addClass(tourConfig.styleClasses.contentPanel.highlightWrapper);

                    const $tooltipBox = $('<div>')
                        .addClass(tourConfig.styleClasses.contentPanel.tooltipBox);

                    const $textContent = $('<div>')
                        .addClass(tourConfig.styleClasses.contentPanel.textDisplay);

                    const $buttonsContainer = $('<div>')
                        .addClass(tourConfig.styleClasses.contentPanel.buttonsWrapper);

                    // Append buttons
                    const $closeBtn = $('<a>')
                        .attr('href', '#')
                        .addClass(tourConfig.controls.closeButton.cssClass)
                        .html(tourConfig.controls.closeButton.label);

                    const $prevBtn = $('<a>')
                        .attr('href', '#')
                        .addClass(tourConfig.controls.previousButton.cssClass)
                        .html(tourConfig.controls.previousButton.label);

                    const $nextBtn = $('<a>')
                        .attr('href', '#')
                        .addClass(tourConfig.controls.nextButton.cssClass)
                        .html(tourConfig.controls.nextButton.label);

                    $buttonsContainer.append($closeBtn, $prevBtn, $nextBtn);
                    $tooltipBox.append($textContent, $buttonsContainer);
                    $highlightContainer.append($tooltipBox);
                    $mainWrapper.append($backdrop, $highlightContainer);

                    $('body').append($mainWrapper);

                    // Proceed only if there are steps to display
                    if (tourState.totalTourSteps > 0) {
                        tourState.isTourActive = true;
                        // Display the first block
                        tourCore.renderStep(tourState.orderedElementsArray[tourState.activeStep]);
                        tourCore.updateNavigationButtons(tourState.activeStep + 1, tourState.totalTourSteps);

                        // Execute onTourStart callback if provided
                        if (isCallable(tourConfig.onTourStart)) {
                            tourConfig.onTourStart();
                        }

                        // Attach event listeners
                        tourCore.bindEvents();

                        // Show the main tour wrapper
                        $('#' + tourConfig.mainTourContainerId).fadeIn(250);
                    } else {
                        // If no tour steps, clean up the empty wrapper
                        $('#' + tourConfig.mainTourContainerId).remove();
                    }
                });
            },

            /**
             * Binds all necessary event listeners for tour navigation and closing.
             */
            bindEvents: function() {
                // Navigation buttons
                $(`.${tourConfig.controls.previousButton.cssClass}`).off('click.guidedTour').on('click.guidedTour', function(e) {
                    e.preventDefault();
                    tourCore.goToPreviousStep(function() {
                        if (isCallable(tourConfig.controls.previousButton.onClickAction)) {
                            tourConfig.controls.previousButton.onClickAction(tourState.activeStep, tourState.orderedElementsArray);
                        }
                    });
                });

                $(`.${tourConfig.controls.nextButton.cssClass}`).off('click.guidedTour').on('click.guidedTour', function(e) {
                    e.preventDefault();
                    tourCore.goToNextStep(function() {
                        if (isCallable(tourConfig.controls.nextButton.onClickAction)) {
                            tourConfig.controls.nextButton.onClickAction(tourState.activeStep, tourState.orderedElementsArray);
                        }
                    });
                });

                // Close button
                $(`.${tourConfig.controls.closeButton.cssClass}`).off('click.guidedTour').on('click.guidedTour', function(e) {
                    e.preventDefault();
                    let shouldClose = true;
                    if (isCallable(tourConfig.controls.closeButton.onClickAction)) {
                        shouldClose = tourConfig.controls.closeButton.onClickAction();
                    }
                    if (shouldClose !== false) { // Allow callback to prevent closing
                        tourCore.hideTour();
                    }
                });

                // Keyboard navigation
                if (tourConfig.general.keyboardNavigation) {
                    $(window).off('keyup.guidedTour').on('keyup.guidedTour', function(e) {
                        if (!tourState.isTourActive) return; // Only respond if tour is active
                        if (e.keyCode === 37) { // Left arrow
                            e.preventDefault();
                            tourCore.goToPreviousStep(function() {
                                if (isCallable(tourConfig.controls.previousButton.onClickAction)) {
                                    tourConfig.controls.previousButton.onClickAction(tourState.activeStep, tourState.orderedElementsArray);
                                }
                            });
                        } else if (e.keyCode === 39) { // Right arrow
                            e.preventDefault();
                            tourCore.goToNextStep(function() {
                                if (isCallable(tourConfig.controls.nextButton.onClickAction)) {
                                    tourConfig.controls.nextButton.onClickAction(tourState.activeStep, tourState.orderedElementsArray);
                                }
                            });
                        }
                    });
                }

                // Escape key to close tour
                if (tourConfig.backdrop.escapeKeyCloses) {
                    $(window).off('keyup.escapeTour').on('keyup.escapeTour', function(e) {
                        if (!tourState.isTourActive) return;
                        if (e.keyCode === 27) { // Escape key
                            e.preventDefault();
                            if (isCallable(tourConfig.backdrop.onCloseCallback)) {
                                tourConfig.backdrop.onCloseCallback();
                            }
                            tourCore.hideTour();
                        }
                    });
                }

                // Backdrop click to close tour
                $(`.${tourConfig.backdrop.cssClass}`).off('click.guidedTour').on('click.guidedTour', function(e) {
                    e.preventDefault();
                    if (isCallable(tourConfig.backdrop.onCloseCallback)) {
                        tourConfig.backdrop.onCloseCallback();
                    }
                    tourCore.hideTour();
                });

                // Window resize event to re-align current step
                $(window).off('resize.guidedTour').on('resize.guidedTour', function() {
                    clearTimeout(tourState.resizeDebounceTimer);
                    tourState.resizeDebounceTimer = setTimeout(() => {
                        if (tourState.isTourActive && tourState.currentActiveElement) {
                            tourCore.renderStep(tourState.currentActiveElement);
                        }
                    }, 200); // Debounce for 200ms
                });
            },

            /**
             * Unbinds all tour-related event listeners.
             */
            unbindEvents: function() {
                // Unbind all events namespaced with '.guidedTour'
                $(window).off('.guidedTour .escapeTour');
                $(`.${tourConfig.controls.previousButton.cssClass}`).off('.guidedTour');
                $(`.${tourConfig.controls.nextButton.cssClass}`).off('.guidedTour');
                $(`.${tourConfig.controls.closeButton.cssClass}`).off('.guidedTour');
                $(`.${tourConfig.backdrop.cssClass}`).off('.guidedTour');
            },

            /**
             * Renders a specific tour step, highlighting the element and positioning the tooltip.
             * @param {HTMLElement} elementToHighlight - The DOM element for the current step.
             */
            renderStep: function(elementToHighlight) {
                if (!elementToHighlight) {
                    tourCore.hideTour(); // Close tour if no valid element
                    return;
                }

                const $targetElement = $(elementToHighlight);

                // Restore previous element's Z-index and position if applicable
                if (tourState.currentActiveElement && tourState.currentActiveElement !== elementToHighlight) {
                    const $prevElement = $(tourState.currentActiveElement);
                    const prevZIndex = $prevElement.attr(tourConfig.dataAttributes.originalElementZIndex);
                    const prevPosition = $prevElement.attr(tourConfig.dataAttributes.originalElementPosition);
                    if (prevZIndex) {
                        $prevElement.css('z-index', prevZIndex);
                        $prevElement.removeAttr(tourConfig.dataAttributes.originalElementZIndex);
                    }
                    if (prevPosition) {
                        $prevElement.css('position', prevPosition);
                        $prevElement.removeAttr(tourConfig.dataAttributes.originalElementPosition);
                    }
                }

                // Store current element and its original properties
                tourState.currentActiveElement = elementToHighlight;
                const targetRect = elementToHighlight.getBoundingClientRect(); // Get position relative to viewport
                tourState.elementOffsetCoords = $targetElement.offset(); // Get position relative to document

                tourState.elementMarginPx = parseFloat(tourConfig.general.paddingValue); // Ensure numeric
                if (isNaN(tourState.elementMarginPx)) {
                    tourState.elementMarginPx = 40; // Fallback
                }

                // Calculate dimensions including padding
                tourState.elementWidthPx = targetRect.width + tourState.elementMarginPx;
                tourState.elementHeightPx = targetRect.height + tourState.elementMarginPx;
                tourState.elementTopPx = tourState.elementOffsetCoords.top - (tourState.elementMarginPx / 2);
                tourState.elementLeftPx = tourState.elementOffsetCoords.left - (tourState.elementMarginPx / 2);

                // Calculate viewport bounds for positioning tooltip
                tourState.elementWindowTopBound = targetRect.top + targetRect.height;
                tourState.elementWindowRightBound = targetRect.right;
                tourState.elementWindowLeftBound = targetRect.left;

                // Prepare CSS for the highlight wrapper
                tourState.highlightContainerCss = {
                    position: 'absolute',
                    width: tourState.elementWidthPx + 'px',
                    height: tourState.elementHeightPx + 'px',
                    top: tourState.elementTopPx + 'px',
                    left: tourState.elementLeftPx + 'px',
                    transition: `all ${tourConfig.general.animationSpeed}s ease-in-out`,
                    backgroundColor: 'transparent'
                };

                // Apply highlight wrapper styles
                $(`.${tourConfig.styleClasses.contentPanel.highlightWrapper}`).css(tourState.highlightContainerCss);

                // Update tooltip content
                $(`.${tourConfig.styleClasses.contentPanel.textDisplay}`).html($targetElement.attr(tourConfig.dataAttributes.tooltipText));

                // Save original z-index and position, then elevate the current element
                tourState.elementZIndexValue = $targetElement.css('z-index');
                tourState.currentElementComputedPosition = $targetElement.css('position');

                if (!$targetElement.attr(tourConfig.dataAttributes.originalElementZIndex)) {
                    $targetElement.attr(tourConfig.dataAttributes.originalElementZIndex, tourState.elementZIndexValue);
                }
                if (!$targetElement.attr(tourConfig.dataAttributes.originalElementPosition)) {
                    $targetElement.attr(tourConfig.dataAttributes.originalElementPosition, tourState.currentElementComputedPosition);
                }

                // Use a timer to ensure CSS transition applies before z-index change
                if (tourState.zIndexRecalculationTimer) {
                    clearTimeout(tourState.zIndexRecalculationTimer);
                }
                tourState.zIndexRecalculationTimer = setTimeout(function() {
                    $targetElement.css({
                        zIndex: '2147483637', // Max z-index
                        position: (tourState.currentElementComputedPosition === 'static') ? 'relative' : tourState.currentElementComputedPosition
                    });
                }, (tourConfig.general.animationSpeed * 1000)); // Delay based on animation speed

                // Style the backdrop
                $(`.${tourConfig.backdrop.cssClass}`).css({
                    position: 'fixed',
                    left: '0px',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    backgroundColor: tourConfig.backdrop.backgroundColor
                });

                // Style the main tour container (it covers the entire viewport)
                $('#' + tourConfig.mainTourContainerId).css({
                    position: 'absolute', // Or fixed, depending on desired scrolling behavior
                    left: '0px',
                    top: '0px',
                    right: '0px',
                    bottom: '0px'
                });

                // Determine tooltip arrow and position based on viewport space
                tourCore.setTooltipPosition($targetElement, targetRect);

                // Scroll to element if auto-scrolling is enabled
                if (tourConfig.general.smoothScrolling) {
                    let scrollTargetY = tourState.elementTopPx - ($(`.${tourConfig.styleClasses.contentPanel.tooltipBox}`).outerHeight() || 0) - 40;
                    if (scrollTargetY < 0) scrollTargetY = 0; // Prevent scrolling above top
                    $('html, body').stop(true, true).animate({ scrollTop: scrollTargetY }, 500);
                }
            },

            /**
             * Helper to set the tooltip's position and arrow class.
             * @param {jQuery} $targetElement - The jQuery object of the highlighted element.
             * @param {DOMRect} targetRect - The bounding client rect of the target element.
             */
            setTooltipPosition: function($targetElement, targetRect) {
                const $tooltip = $(`.${tourConfig.styleClasses.contentPanel.tooltipBox}`);
                const windowHeight = $(window).height();
                const windowWidth = $(window).width();
                const tooltipHeight = $tooltip.outerHeight();
                const tooltipWidth = $tooltip.outerWidth();
                const elementMidpointX = targetRect.left + (targetRect.width / 2);

                // Reset arrow classes
                $tooltip.removeClass(Object.values(tourConfig.styleClasses.pointers).join(' '));

                // Default tooltip position (below element, centered horizontally)
                let tooltipCss = {
                    left: '50%',
                    right: 'auto',
                    top: (tourState.elementHeightPx + 20) + 'px', // 20px below highlight
                    marginLeft: -(tooltipWidth / 2) + 'px',
                    marginRight: 'inherit'
                };
                $tooltip.addClass(tourConfig.styleClasses.pointers.top); // Default arrow points up

                // Check vertical space: If not enough space below, try above
                if (tourState.elementWindowTopBound + tooltipHeight + 20 > windowHeight && targetRect.top - tooltipHeight - 20 > 0) {
                    tooltipCss.top = '-' + (tooltipHeight + 20) + 'px'; // 20px above highlight
                    $tooltip.removeClass(tourConfig.styleClasses.pointers.top).addClass(tourConfig.styleClasses.pointers.bottom);
                } else if (targetRect.top - tooltipHeight - 20 <= 0 && tourState.elementWindowTopBound + tooltipHeight + 20 <= windowHeight) {
                    // If no space above but space below, force below (default)
                    tooltipCss.top = (tourState.elementHeightPx + 20) + 'px';
                    $tooltip.removeClass(tourConfig.styleClasses.pointers.bottom).addClass(tourConfig.styleClasses.pointers.top);
                }
                // If neither above nor below has enough space, it will default to below and might overlap

                // Check horizontal space: adjust left/right if near window edges
                if (elementMidpointX - (tooltipWidth / 2) < 20) { // Too close to left edge
                    tooltipCss.left = '0px';
                    tooltipCss.marginLeft = 'inherit';
                    $tooltip.removeClass(tourConfig.styleClasses.pointers.top)
                            .removeClass(tourConfig.styleClasses.pointers.bottom)
                            .addClass(tourConfig.styleClasses.pointers.left); // Arrow on left side
                } else if (elementMidpointX + (tooltipWidth / 2) > windowWidth - 20) { // Too close to right edge
                    tooltipCss.left = 'auto';
                    tooltipCss.right = '0px';
                    tooltipCss.marginRight = 'inherit';
                    $tooltip.removeClass(tourConfig.styleClasses.pointers.top)
                            .removeClass(tourConfig.styleClasses.pointers.bottom)
                            .addClass(tourConfig.styleClasses.pointers.right); // Arrow on right side
                }

                $tooltip.css(tooltipCss);
            },

            /**
             * Updates the visibility and state of navigation buttons.
             * @param {number} currentStepNumber - The 1-based index of the current step.
             * @param {number} totalSteps - Total number of steps in the tour.
             */
            updateNavigationButtons: function(currentStepNumber, totalSteps) {
                const $prevBtn = $(`.${tourConfig.controls.previousButton.cssClass}`);
                const $nextBtn = $(`.${tourConfig.controls.nextButton.cssClass}`);

                // Hide previous button on the first step
                if (currentStepNumber <= 1) {
                    $prevBtn.hide();
                } else {
                    $prevBtn.show();
                }

                // Hide next button on the last step
                if (currentStepNumber >= totalSteps) {
                    $nextBtn.hide();
                } else {
                    $nextBtn.show();
                }
            },

            /**
             * Navigates to the previous tour step.
             * @param {function} [callback] - Optional callback to execute after navigation.
             */
            goToPreviousStep: function(callback) {
                if (tourState.activeStep > 0) {
                    tourState.activeStep--;
                    tourCore.renderStep(tourState.orderedElementsArray[tourState.activeStep]);
                    tourCore.updateNavigationButtons(tourState.activeStep + 1, tourState.totalTourSteps);
                    if (isCallable(callback)) {
                        callback();
                    }
                }
            },

            /**
             * Navigates to the next tour step.
             * @param {function} [callback] - Optional callback to execute after navigation.
             */
            goToNextStep: function(callback) {
                if (tourState.activeStep < tourState.totalTourSteps - 1) {
                    tourState.activeStep++;
                    tourCore.renderStep(tourState.orderedElementsArray[tourState.activeStep]);
                    tourCore.updateNavigationButtons(tourState.activeStep + 1, tourState.totalTourSteps);
                    if (isCallable(callback)) {
                        callback();
                    }
                }
            },

            /**
             * Hides the tour UI and cleans up.
             */
            hideTour: function() {
                if (!tourState.isTourActive) return; // Only hide if active

                // Fade out the main wrapper
                $('#' + tourConfig.mainTourContainerId).fadeOut(250, function() {
                    $(this).remove(); // Remove from DOM after fading out
                    tourCore.cleanupElements();
                    tourCore.unbindEvents();
                    tourState.isTourActive = false;
                    // Clear any pending timers
                    clearTimeout(tourState.zIndexRecalculationTimer);
                    clearTimeout(tourState.resizeDebounceTimer);
                });
            },

            /**
             * Resets the Z-index and position of all affected tour elements.
             */
            cleanupElements: function() {
                // Restore original styles for all tour elements
                tourState.orderedElementsArray.forEach(element => {
                    const $el = $(element);
                    const originalZIndex = $el.attr(tourConfig.dataAttributes.originalElementZIndex);
                    const originalPosition = $el.attr(tourConfig.dataAttributes.originalElementPosition);

                    if (originalZIndex) {
                        $el.css('z-index', originalZIndex);
                        $el.removeAttr(tourConfig.dataAttributes.originalElementZIndex);
                    }
                    if (originalPosition) {
                        $el.css('position', originalPosition);
                        $el.removeAttr(tourConfig.dataAttributes.originalElementPosition);
                    }
                });
                tourState.currentActiveElement = null; // Clear active element reference
            }
        };

        // Initialize the tour if it hasn't been initialized already on this page.
        // This plugin is designed as a singleton per page for the tour functionality.
        if (!$.fn.guidedTour.isInitialized) {
            tourCore.initTour();
            $.fn.guidedTour.isInitialized = true; // Set flag to prevent re-initialization
        }

        // Expose a public destroy method for external control
        $.fn.guidedTour.destroy = function() {
            if (tourState.isTourActive) {
                tourCore.hideTour();
                $.fn.guidedTour.isInitialized = false;
            }
        };

        return this; // Return jQuery object for chaining
    };

    // Add a flag to prevent multiple initializations on the same page
    $.fn.guidedTour.isInitialized = false;

})(jQuery);