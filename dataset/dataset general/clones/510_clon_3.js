/*
 * Adaptive Pagination Layout Enhancer for jQuery-based UI components.
 * This script dynamically adjusts Bootstrap-style pagination controls
 * to ensure they fit within their parent container, preventing overflow.
 * It hides less critical page number links and inserts ellipsis indicators
 * when necessary, providing a responsive user experience.
 *
 * Project inspired by: https://github.com/auxiliary/rpage
 *
 * @author Pagination Layout Maintainer Team
 * @version 1.1.0
 */

(function ($) { // Encapsulate the plugin to prevent global scope pollution
    "use strict"; // Enforce stricter parsing and error handling

    // Define constants for better readability and maintainability
    const PADDING_OFFSET_PX = 15; // Minimum padding to maintain within the parent container
    const RESIZE_DEBOUNCE_MS = 150; // Delay for debouncing window resize events
    const ELLIPSIS_TEXT = '...';
    const PREV_PAGE_CHAR = '«';
    const NEXT_PAGE_CHAR = '»';
    const REMOVABLE_ELLIPSIS_CLASS = 'pagination-ellipsis-placeholder';
    const DISTANCE_CLASS_PREFIX = 'pg-dist-';
    const BOUNDARY_CLASS_LEFT = 'boundary-left';
    const BOUNDARY_CLASS_RIGHT = 'boundary-right';

    // Extend jQuery's prototype with our new functionality
    $.fn.adaptPaginationLayout = function () {
        const targetElements = $(this); // The jQuery collection of elements to process

        if (!targetElements.length) {
            console.warn("adaptPaginationLayout: No elements found for the selector.");
            return this; // Return the jQuery object to maintain chainability
        }

        // Iterate over each selected DOM element and initialize the adapter
        targetElements.each(function () {
            // Create a new instance of our layout adapter for each pagination container
            new PaginationLayoutAdapter($(this));
        });

        return this; // Ensure chainability
    };

    /**
     * Constructor function for managing the layout of a single pagination component.
     * @param {jQuery} paginationContainer The jQuery object representing the UL.pagination container.
     */
    function PaginationLayoutAdapter(paginationContainer) {
        // Basic validation for the input container
        if (!(paginationContainer instanceof $ && paginationContainer.length > 0)) {
            console.error("PaginationLayoutAdapter: Invalid jQuery container provided.");
            return; // Exit if the container is not valid
        }

        const self = this; // Capture 'this' for use in nested scopes
        let debounceTimerId; // Timer for handling resize events

        // Store all 'li' elements within the pagination container
        this.allPageItems = paginationContainer.find("li");
        this.parentContainer = paginationContainer.parent().parent(); // The grand-parent is usually the actual width constraint

        // --- Core Methods for Layout Adaptation ---

        /**
         * Calculates and assigns CSS classes to pagination items indicating their
         * distance from the currently active page.
         */
        this.applyProximityMarkers = function () {
            // Remove any previously applied distance classes
            this.allPageItems.removeClass((index, currentClass) => {
                const classesToRemove = (currentClass.match(new RegExp(`\\b${DISTANCE_CLASS_PREFIX}\\S+`, 'g')) || []).join(' ');
                return classesToRemove;
            });
            this.allPageItems.removeClass(`${BOUNDARY_CLASS_LEFT} ${BOUNDARY_CLASS_RIGHT}`);

            const activePageIndex = this.allPageItems.filter(".active").index();

            if (activePageIndex === -1) {
                // If no active page, we can't label based on proximity, so just return
                console.warn("No active page found in pagination. Proximity markers skipped.");
                return;
            }

            this.allPageItems.each(function () {
                const currentItem = $(this);
                const currentIndex = currentItem.index();

                if (!self.isNavigationControl(currentItem)) {
                    // For regular page number links, mark distance from active
                    const distance = Math.abs(activePageIndex - currentIndex);
                    currentItem.addClass(`${DISTANCE_CLASS_PREFIX}${distance}`);
                } else {
                    // For 'Next' / 'Prev' links, mark as boundary controls
                    if (currentIndex > activePageIndex) {
                        currentItem.addClass(BOUNDARY_CLASS_RIGHT);
                    } else {
                        currentItem.addClass(BOUNDARY_CLASS_LEFT);
                    }
                }
            });
        };

        /**
         * Initiates the responsive layout adjustment process.
         * Resets the layout, then iteratively hides elements until the pagination fits.
         */
        this.ensureLayoutFits = function () {
            this.resetLayout(); // First, show all elements and remove any ellipsis
            let currentTotalWidth = this.measureTotalItemWidth();
            const availableSpace = this.parentContainer.outerWidth() - PADDING_OFFSET_PX;

            // Loop to hide elements until the pagination fits within the available space
            // Add a safeguard to prevent infinite loops in extreme cases
            let iterationCount = 0;
            const MAX_ITERATIONS = this.allPageItems.length * 2; // Should be more than enough

            while (currentTotalWidth > availableSpace && iterationCount < MAX_ITERATIONS) {
                const itemWasHidden = this.hideFarthestPageItem();
                if (!itemWasHidden) {
                    // No more items can be hidden, break the loop
                    break;
                }
                currentTotalWidth = this.measureTotalItemWidth();
                iterationCount++;
            }
            if (iterationCount >= MAX_ITERATIONS) {
                console.warn("PaginationLayoutAdapter: Max iterations reached during layout adjustment. Layout might not fit.");
            }
        };

        /**
         * Determines if a given pagination item is a 'Next' or 'Previous' navigation control.
         * @param {jQuery} element The jQuery object of the list item.
         * @returns {boolean} True if it's a navigation control, false otherwise.
         */
        this.isNavigationControl = function (element) {
            const elementText = element.text().trim(); // Use trim for robustness
            return elementText === PREV_PAGE_CHAR || elementText === NEXT_PAGE_CHAR;
        };

        /**
         * Checks if a given pagination item is a candidate for being hidden
         * to save space.
         * @param {jQuery} itemCandidate The jQuery object of the list item.
         * @returns {boolean} True if the item can be hidden, false otherwise.
         */
        this.isHideableCandidate = function (itemCandidate) {
            // Navigation controls should never be hidden
            if (this.isNavigationControl(itemCandidate)) {
                return false;
            }
            // Active page should never be hidden
            if (itemCandidate.hasClass("active")) {
                return false;
            }
            // Ellipsis placeholders should not be hidden
            if (itemCandidate.hasClass(REMOVABLE_ELLIPSIS_CLASS) || itemCandidate.text().trim() === ELLIPSIS_TEXT) {
                return false;
            }

            const currentItemIndex = this.allPageItems.index(itemCandidate);
            const totalItemsCount = this.allPageItems.length;

            // Don't hide the first or last *visible* page number (e.g., '1' or 'N')
            // This is a more robust check than just index == 1
            const visibleItems = this.allPageItems.filter(':visible');
            const firstVisiblePageIndex = visibleItems.first().index();
            const lastVisiblePageIndex = visibleItems.last().index();

            // Guard the first and last *numeric* page links if they are still visible
            // This logic is tricky. The original code's "index == 1" was for the 2nd element.
            // Let's refine this to protect the first and last *real* page numbers,
            // assuming the first/last elements are always nav controls or '1'/'N'.
            if (currentItemIndex === firstVisiblePageIndex && !this.isNavigationControl(itemCandidate)) {
                return false; // Protect the first visible page number
            }
            if (currentItemIndex === lastVisiblePageIndex && !this.isNavigationControl(itemCandidate)) {
                return false; // Protect the last visible page number
            }

            // Also, don't hide an element if the element *after* it is a navigation control (e.g., 'Next')
            // This prevents hiding a page number directly before '»' unless it's the last page number itself.
            const nextItem = this.allPageItems.eq(currentItemIndex + 1);
            if (nextItem.length && this.isNavigationControl(nextItem)) {
                return false;
            }
            // Similarly for the previous item
            const prevItem = this.allPageItems.eq(currentItemIndex - 1);
            if (prevItem.length && this.isNavigationControl(prevItem)) {
                return false;
            }

            return true;
        };

        /**
         * Attempts to hide one suitable pagination item, prioritizing those
         * furthest from the active page. Inserts ellipsis if needed.
         * @returns {boolean} True if an item was successfully hidden, false otherwise.
         */
        this.hideFarthestPageItem = function () {
            const activeItemIndex = this.allPageItems.filter(".active").index();
            const lastPossibleIndex = this.allPageItems.length - 1; // Last element index

            // Iterate through distance classes, starting from the farthest
            for (let dist = lastPossibleIndex; dist > 0; dist--) {
                const candidatesAtDistance = this.allPageItems.filter(`.${DISTANCE_CLASS_PREFIX}${dist}`);

                // Filter for visible items among candidates
                const visibleCandidates = candidatesAtDistance.filter(':visible');

                if (visibleCandidates.length > 0) {
                    // Prioritize hiding items further from the active page
                    // If multiple items have the same distance, prefer those closer to the ends
                    // or just pick one (the original code picks the first found in reverse distance order).
                    // Let's iterate through them to find the first truly removable one.
                    for (let j = 0; j < visibleCandidates.length; j++) {
                        const currentCandidate = visibleCandidates.eq(j);

                        if (this.isHideableCandidate(currentCandidate)) {
                            currentCandidate.hide(); // Hide the element

                            // Check and insert ellipsis signs if required
                            this.updateEllipsisIndicators(activeItemIndex);

                            return true; // An item was successfully hidden
                        }
                    }
                }
            }
            return false; // No removable item was found
        };

        /**
         * Updates the presence of ellipsis (...) indicators based on hidden elements.
         * @param {number} activePageIndex The index of the currently active page item.
         */
        this.updateEllipsisIndicators = function (activePageIndex) {
            // Check for ellipsis on the left side (between 'Prev'/'1' and active page)
            const firstNavOrPage = this.allPageItems.filter(':visible').first();
            const firstNavOrPageIndex = firstNavOrPage.index();

            if (this.shouldPlaceEllipsis(firstNavOrPageIndex, activePageIndex)) {
                // Find the appropriate insertion point.
                // The original code inserted before the second-to-last item.
                // Let's try to insert after the first visible item that is not a navigation control.
                const insertAfterElement = this.allPageItems.filter(':visible').filter((idx, el) => !self.isNavigationControl($(el)) && $(el).text().trim() !== ELLIPSIS_TEXT).first();
                if (insertAfterElement.length) {
                    $(`<li class="disabled ${REMOVABLE_ELLIPSIS_CLASS}"><span>${ELLIPSIS_TEXT}</span></li>`).insertAfter(insertAfterElement);
                } else {
                    // Fallback: if no suitable non-nav element, insert after the first visible item
                    $(`<li class="disabled ${REMOVABLE_ELLIPSIS_CLASS}"><span>${ELLIPSIS_TEXT}</span></li>`).insertAfter(firstNavOrPage);
                }
            }

            // Check for ellipsis on the right side (between active page and 'Next'/'N')
            const lastNavOrPage = this.allPageItems.filter(':visible').last();
            const lastNavOrPageIndex = lastNavOrPage.index();

            if (this.shouldPlaceEllipsis(activePageIndex, lastNavOrPageIndex)) {
                // Insert before the last visible item that is not a navigation control.
                const insertBeforeElement = this.allPageItems.filter(':visible').filter((idx, el) => !self.isNavigationControl($(el)) && $(el).text().trim() !== ELLIPSIS_TEXT).last();
                if (insertBeforeElement.length) {
                    $(`<li class="disabled ${REMOVABLE_ELLIPSIS_CLASS}"><span>${ELLIPSIS_TEXT}</span></li>`).insertBefore(insertBeforeElement);
                } else {
                    // Fallback: if no suitable non-nav element, insert before the last visible item
                    $(`<li class="disabled ${REMOVABLE_ELLIPSIS_CLASS}"><span>${ELLIPSIS_TEXT}</span></li>`).insertBefore(lastNavOrPage);
                }
            }
            // Re-cache allPageItems as new elements might have been added
            this.allPageItems = paginationContainer.find("li");
        };


        /**
         * Determines if an ellipsis placeholder should be displayed between two indices.
         * This occurs if there are hidden elements between them and no ellipsis is already present.
         * @param {number} startIndex The starting index for the check.
         * @param {number} endIndex The ending index for the check.
         * @returns {boolean} True if an ellipsis is needed, false otherwise.
         */
        this.shouldPlaceEllipsis = function (startIndex, endIndex) {
            // An ellipsis is only needed if there's at least one hidden element
            // AND there isn't already an ellipsis in the range.
            if (endIndex - startIndex <= 1) { // Not enough space for hidden items
                return false;
            }

            let hasHiddenItemsInRange = false;
            let hasExistingEllipsis = false;

            // Iterate between the start and end indices (exclusive)
            for (let k = startIndex + 1; k < endIndex; k++) {
                const item = this.allPageItems.eq(k);
                if (item.css("display") === "none") {
                    hasHiddenItemsInRange = true;
                }
                if (item.hasClass(REMOVABLE_ELLIPSIS_CLASS) || item.text().trim() === ELLIPSIS_TEXT) {
                    hasExistingEllipsis = true;
                }
                // Optimization: if both conditions are met, we can potentially break early
                if (hasHiddenItemsInRange && hasExistingEllipsis) break;
            }

            return hasHiddenItemsInRange && !hasExistingEllipsis;
        };


        /**
         * Resets the pagination layout: makes all items visible and removes any ellipsis placeholders.
         */
        this.resetLayout = function () {
            this.allPageItems.show(); // Make all list items visible
            paginationContainer.find(`li.${REMOVABLE_ELLIPSIS_CLASS}`).remove(); // Remove temporary ellipsis
            // Re-cache allPageItems after removing elements
            this.allPageItems = paginationContainer.find("li");
        };

        /**
         * Calculates the total outer width of all currently visible pagination items.
         * @returns {number} The total width in pixels.
         */
        this.measureTotalItemWidth = function () {
            let totalWidth = 0;
            // Iterate only over visible list items
            this.allPageItems.filter(':visible').each(function () {
                const currentItem = $(this);
                // outerWidth(true) includes margin, which is crucial for accurate layout calculation
                // Consider children <a> or <span> as the main content for width calculation
                const contentElement = currentItem.children('a, span').first();
                if (contentElement.length) {
                    totalWidth += contentElement.outerWidth(true);
                } else {
                    // Fallback to the li's width if no direct children found or needed
                    totalWidth += currentItem.outerWidth(true);
                }
            });
            return totalWidth;
        };

        // --- Initialization and Event Handling ---

        // Initial setup: apply proximity markers and adjust layout
        this.applyProximityMarkers();
        this.ensureLayoutFits();

        // Attach a debounced resize handler to the window
        $(window).on('resize.paginationAdapter', $.proxy(function () {
            clearTimeout(debounceTimerId); // Clear any existing timer
            debounceTimerId = setTimeout($.proxy(function () {
                this.applyProximityMarkers(); // Re-label items as active page might change visually
                this.ensureLayoutFits(); // Re-adjust layout
            }, this), RESIZE_DEBOUNCE_MS);
        }, this));

        // Add a cleanup method for when the plugin is no longer needed (optional, but good practice)
        this.destroy = function() {
            $(window).off('resize.paginationAdapter');
            this.resetLayout(); // Restore original state
            this.allPageItems.removeClass((index, currentClass) => {
                const classesToRemove = (currentClass.match(new RegExp(`\\b${DISTANCE_CLASS_PREFIX}\\S+`, 'g')) || []).join(' ');
                return classesToRemove;
            });
            this.allPageItems.removeClass(`${BOUNDARY_CLASS_LEFT} ${BOUNDARY_CLASS_RIGHT}`);
            // Remove any other classes or data attributes added by the plugin
            paginationContainer.removeData('paginationLayoutAdapterInstance'); // If we stored it
        };

        // Store instance on the element for potential later access (e.g., for destroy method)
        paginationContainer.data('paginationLayoutAdapterInstance', this);
    }

})(jQuery); // Pass jQuery as an argument