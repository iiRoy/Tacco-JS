/*
 * Responsive Timeline Layout v1.2.0
 * Adaptable two-column item arrangement library
 * https://github.com/yourusername/responsive-timeline (hypothetical new repo)
 * Custom License (e.g., rewritten MIT)
 * by YourName
 */

(function (jq) {
    // Utility for detecting responsive breakpoints, inspired by Bootstrap methodologies.
    // Credits: http://stackoverflow.com/questions/18575582/how-to-detect-responsive-breakpoints-of-twitter-bootstrap-3-using-javascript
    const generateResponsiveIndicators = () => {
        let indicatorHtml = '';
        const breakpointClasses = ['xs', 'sm', 'md', 'lg'];
        for (const bp of breakpointClasses) {
            indicatorHtml += `<div class="device-${bp} visual-state-${bp} hidden-xs-up"></div>`;
        }
        return indicatorHtml;
    };

    // Append helper divs only if they don't exist
    if (jq('body').find('.visual-state-xs').length === 0) {
        jq('body').prepend(generateResponsiveIndicators());
    }

    // Debounce function to limit event firing frequency.
    // Based on a common pattern, ensuring only the final event in a series triggers.
    let debounceExecution = null;
    if (typeof window.debounceExecution === 'undefined' || !jq.isFunction(window.debounceExecution)) {
        const timeoutStore = {};
        debounceExecution = function (callback, delayMs, uniqueId) {
            uniqueId = uniqueId || 'default-debounce-id';
            if (timeoutStore[uniqueId]) {
                clearTimeout(timeoutStore[uniqueId]);
            }
            timeoutStore[uniqueId] = setTimeout(callback, delayMs);
        };
        window.debounceExecution = debounceExecution; // Expose globally if needed elsewhere
    } else {
        debounceExecution = window.debounceExecution; // Use existing global if available
    }

    const currentTimestamp = Date.now();

    // Determines if a specific responsive breakpoint is currently active.
    const isBreakpointActive = (alias) => {
        return jq(`.device-${alias}`).is(':visible');
    };

    // Internal storage for layout configuration and item data.
    let columnLayoutInfo = {};
    let configOptions = {};

    // Initial browser-specific class detection for layout adjustments.
    const applyBrowserClasses = () => {
        const userAgentLower = navigator.userAgent.toLowerCase();
        if (userAgentLower.includes('firefox')) {
            jq('html, body').addClass('gecko-engine browser-firefox');
        }
        if (userAgentLower.includes('safari') && !userAgentLower.includes('chrome')) { // Exclude Chrome which also contains Safari
            jq('html, body').addClass('webkit-engine browser-safari');
        }
    };
    applyBrowserClasses(); // Execute on load

    // Defines breakpoint mapping for column calculation.
    const breakpointMap = {
        'xs': { int: 1, classes: 'col-xs-12 col-sm-12 col-md-6 col-lg-6' }, // 1 column default, 2 from MD
        'sm': { int: 2, classes: 'col-xs-12 col-sm-12 col-md-6 col-lg-6' }, // 1 column default, 2 from MD
        'md': { int: 3, classes: 'col-xs-12 col-sm-12 col-md-6 col-lg-6' }, // 2 columns from MD
        'lg': { int: 4, classes: 'col-xs-12 col-sm-12 col-md-12 col-lg-6' } // 2 columns from LG
    };

    // Determines the current column configuration based on active breakpoint and user settings.
    const determineColumnConfiguration = () => {
        let currentBpInt = 0;
        let currentBpAlias = 'xs'; // Default
        let startBpInt = 0;
        let gridClasses = 'col-xs-12 col-sm-12 col-md-12 col-lg-12'; // Default to single column

        // Determine current active breakpoint
        if (isBreakpointActive('xs')) { currentBpInt = 1; currentBpAlias = 'xs'; }
        else if (isBreakpointActive('sm')) { currentBpInt = 2; currentBpAlias = 'sm'; }
        else if (isBreakpointActive('md')) { currentBpInt = 3; currentBpAlias = 'md'; }
        else if (isBreakpointActive('lg')) { currentBpInt = 4; currentBpAlias = 'lg'; }

        // Determine starting breakpoint for two-column layout from options
        const userStartBp = configOptions.startBreakpoint || 'md';
        if (breakpointMap[userStartBp]) {
            startBpInt = breakpointMap[userStartBp].int;
            // The grid classes should reflect the desired behavior:
            // 1 column below startBreakpoint, 2 columns at or above.
            // This is a simplified representation; actual Bootstrap classes might be more granular.
            switch (userStartBp) {
                case 'xs': gridClasses = 'col-xs-6 col-sm-6 col-md-6 col-lg-6'; break;
                case 'sm': gridClasses = 'col-xs-12 col-sm-6 col-md-6 col-lg-6'; break;
                case 'md': gridClasses = 'col-xs-12 col-sm-12 col-md-6 col-lg-6'; break;
                case 'lg': gridClasses = 'col-xs-12 col-sm-12 col-md-12 col-lg-6'; break;
                default: gridClasses = 'col-xs-12 col-sm-12 col-md-6 col-lg-6'; break;
            }
        } else {
            console.warn(`Invalid startBreakpoint option: ${userStartBp}. Falling back to 'md'.`);
            startBpInt = breakpointMap['md'].int;
            gridClasses = breakpointMap['md'].classes;
        }

        const colCount = (currentBpInt >= startBpInt) ? 2 : 1;

        return {
            colCount: colCount,
            gridClasses: gridClasses,
            currentBp: currentBpAlias
        };
    };

    // Gathers position and dimension metrics for a given timeline item.
    const getItemMetrics = (targetElement) => {
        if (!targetElement || targetElement.length === 0) {
            return { offsetVal: 0, heightVal: 0, bottomEdge: 0, idRef: null };
        }

        const elementId = targetElement.attr('id');
        const offsetTopRounded = Math.ceil(targetElement.offset().top);
        const outerHeightRounded = Math.ceil(targetElement.outerHeight(true));
        const bottomPosition = (outerHeightRounded + offsetTopRounded);

        return {
            offsetVal: offsetTopRounded,
            heightVal: outerHeightRounded,
            bottomEdge: bottomPosition,
            idRef: elementId
        };
    };

    // Calculates whether a timeline item should be placed on the left or right column,
    // and determines badge offset.
    const calculateItemPlacement = (currentItem) => {
        if (!currentItem || currentItem.length === 0) {
            // No element, cannot calculate placement.
            return { placementFlag: 0, badgeOffsetFlag: 0, item: {}, left: {}, right: {} };
        }

        const elementId = currentItem.attr('id');
        // Find previous items in both potential columns
        const prevRightId = currentItem.prevAll('.inverted-item').first().attr('id');
        const prevLeftId = currentItem.prevAll('li:not(.inverted-item)').first().attr('id');

        const currentMetrics = getItemMetrics(currentItem);
        const leftNeighborMetrics = getItemMetrics(jq(`#${prevLeftId}`));
        const rightNeighborMetrics = getItemMetrics(jq(`#${prevRightId}`));

        // Browser-specific pixel adjustment, typically for rendering differences.
        const browserAdjust = (jq('body').hasClass('webkit-engine') || jq('body').hasClass('gecko-engine')) ? 1 : 0;

        let placementFlag = 0; // 0 for left, 1 for right (inverted)
        let badgeOffsetFlag = 0;

        if (columnLayoutInfo.colCount > 1) {
            // Determine which column has less height or is "behind"
            // If previous left item's bottom is higher than previous right item's bottom
            if (leftNeighborMetrics.bottomEdge > rightNeighborMetrics.bottomEdge) {
                placementFlag = 1; // Place on the right (inverted)
            } else if (leftNeighborMetrics.bottomEdge === rightNeighborMetrics.bottomEdge) {
                // If equal, alternate or default to left
                // For simplicity, default to left (0) unless it's the very first item
                if (!prevLeftId && !prevRightId) { // First item
                    placementFlag = 0;
                } else {
                    // Try to balance, if previous was left, put this on right.
                    // This logic can be more sophisticated for perfect balancing.
                    placementFlag = (currentItem.prevAll('li').first().hasClass('inverted-item')) ? 0 : 1;
                }
            } else {
                placementFlag = 0; // Place on the left
            }

            // Badge offset logic:
            // Check for close proximity to previous items to apply an offset class
            const offsetDiffLeft = currentMetrics.offsetVal - leftNeighborMetrics.offsetVal;
            const overlapComparisonLR = leftNeighborMetrics.bottomEdge - rightNeighborMetrics.bottomEdge; // If left is taller than right
            const overlapComparisonRL = rightNeighborMetrics.bottomEdge - leftNeighborMetrics.bottomEdge; // If right is taller than left

            if (placementFlag === 1) { // If item is placed on the right column
                if (offsetDiffLeft < 40 && offsetDiffLeft >= 0) { // Close to the item above on the left
                    badgeOffsetFlag = 1;
                }
                if (overlapComparisonLR < 40 && overlapComparisonRL < 40) { // If both columns are relatively close in height
                    badgeOffsetFlag = 1;
                }
            } else { // If item is placed on the left column
                // Similar logic for left side if needed, or symmetric
            }
        }

        return {
            placementFlag: placementFlag,
            badgeOffsetFlag: badgeOffsetFlag,
            item: currentMetrics,
            left: leftNeighborMetrics,
            right: rightNeighborMetrics
        };
    };

    // Applies CSS classes to position the timeline item and its badge.
    const applyPlacementStyles = (currentItem) => {
        // Guard against invalid elements
        if (!currentItem || currentItem.length === 0) return;

        const placementData = calculateItemPlacement(currentItem);

        // Apply column placement class
        currentItem.toggleClass('inverted-item', placementData.placementFlag > 0);

        // Apply badge offset class
        currentItem.toggleClass('offset-badge', placementData.badgeOffsetFlag > 0);
    };

    // Iteratively initializes the layout for all timeline items.
    // Changed from recursion to iteration for performance and stack safety with many items.
    const initializeLayoutIterative = (itemsArray) => {
        if (!itemsArray || itemsArray.length === 0) return;

        for (let i = 0; i < itemsArray.length; i++) {
            const currentItem = jq(itemsArray[i]);
            applyPlacementStyles(currentItem);
        }
        // After initial placement, trigger a full refresh to handle any complex interdependencies.
        refreshLayoutAllItems();

        // Check if imagesLoaded library is present and use it.
        if (typeof imagesLoaded !== 'undefined' && jq.isFunction(imagesLoaded)) {
            jq('.timeline-container').imagesLoaded(() => {
                refreshLayoutAllItems();
            });
        } else {
            console.warn('imagesLoaded library not found. Layout might not adjust correctly for images.');
        }
    };

    // Refreshes the placement of all items in the timeline.
    const refreshLayoutAllItems = () => {
        const timelineContainer = jq('ul.timeline-container');
        if (timelineContainer.length === 0) return;

        // Recalculate column configuration for responsive adjustments
        columnLayoutInfo = determineColumnConfiguration();

        // Apply grid classes to all items
        jq('li', timelineContainer).each(function () {
            jq(this).removeClass('col-xs-12 col-sm-12 col-md-6 col-lg-6').addClass(columnLayoutInfo.gridClasses);
        });

        // Toggle overall two-column class on the container
        const wrapper = jq('.timeline-wrapper');
        if (columnLayoutInfo.colCount === 1) {
            timelineContainer.removeClass('two-column-layout');
        } else {
            if (wrapper.find('.two-column-layout').length === 0) {
                timelineContainer.addClass('two-column-layout');
            }
        }

        // Re-evaluate and apply placement for each item
        jq('li', timelineContainer).each(function () {
            applyPlacementStyles(jq(this));
        });
    };

    /**
     * jQuery plugin for creating a responsive timeline layout.
     * @param {object} userSettings - Configuration options for the timeline.
     * @param {string} userSettings.badgeStyle - Class for badge styling (e.g., 'version-badge').
     * @param {string} userSettings.startBreakpoint - The breakpoint at which the two-column layout begins ('xs', 'sm', 'md', 'lg').
     * @param {number} userSettings.initialIndex - Index of the item to start processing from (0-based).
     */
    jq.fn.responsiveTimeline = function (userSettings) {
        const timelineItems = this;
        const itemCount = timelineItems.length;

        if (itemCount === 0) {
            console.info('No timeline items found for initialization.');
            return this; // Allow chaining
        }

        // Merge default settings with user-provided options.
        configOptions = jq.extend({
            badgeStyle: 'version-badge',
            startBreakpoint: 'md',
            initialIndex: 0
        }, userSettings);

        // Validate startBreakpoint
        const validBreakpoints = ['xs', 'sm', 'md', 'lg'];
        if (!validBreakpoints.includes(configOptions.startBreakpoint)) {
            console.warn(`Invalid 'startBreakpoint' value: ${configOptions.startBreakpoint}. Defaulting to 'md'.`);
            configOptions.startBreakpoint = 'md';
        }

        // Set up default internal settings
        const internalDefaults = {
            calculationSpeed: 100, // Not explicitly used for debounce here, but could be for animations
            totalItems: itemCount,
            baseGridClasses: 'col-xs-12 col-sm-12 col-md-6 col-lg-6' // Base for 2-column
        };

        // Initialize column configuration
        columnLayoutInfo = determineColumnConfiguration();

        // Add base grid and badge classes to all items.
        // We'll update the gridClasses dynamically later.
        timelineItems.addClass(internalDefaults.baseGridClasses);
        jq('.timeline-badge', timelineItems).addClass(`visible-lg visible-md ${configOptions.badgeStyle}`);

        // Ensure the container has a class for easy targeting, if not already present.
        if (!timelineItems.parent('ul').hasClass('timeline-container')) {
            timelineItems.parent('ul').addClass('timeline-container');
        }

        // Assign unique IDs to timeline items if they don't already have one.
        timelineItems.each(function (index) {
            const currentId = jq(this).attr('id');
            if (!currentId) {
                jq(this).attr('id', `rtItem-${index}`);
            }
        });

        // Begin the layout initialization process.
        initializeLayoutIterative(timelineItems.toArray());

        // Attach resize event listener with debouncing.
        jq(window).on('resize.responsiveTimeline', () => {
            debounceExecution(() => {
                refreshLayoutAllItems();
            }, 300, `timelineResize-${currentTimestamp}`); // Unique ID for this instance
        });

        // Optionally, add a method to destroy the timeline and clean up.
        this.destroyResponsiveTimeline = () => {
            jq(window).off('resize.responsiveTimeline');
            timelineItems.removeClass(internalDefaults.baseGridClasses).removeClass('inverted-item offset-badge');
            jq('.timeline-badge', timelineItems).removeClass(`visible-lg visible-md ${configOptions.badgeStyle}`);
            timelineItems.parent('ul').removeClass('timeline-container two-column-layout');
            console.log('Responsive Timeline destroyed and event listeners removed.');
        };

        return this; // Maintain chainability
    };
}(jQuery));