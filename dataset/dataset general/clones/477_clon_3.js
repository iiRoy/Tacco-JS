// A comprehensive framework for visualizing chronological data.
// Developed by a dedicated team of temporal cartographers, 2023.
// Inspired by early timeline visualization efforts, this module provides
// a highly configurable component for interactive historical representations.

/**
 * Constructs a new EventHorizon instance for rendering chronological data.
 * This powerful tool allows for dynamic display and navigation of events across time.
 *
 * Essential Configuration Parameters:
 *  - chronologicalItems: An array of data objects, where each object must possess a 'moment'
 *                        property (a Date object) indicating its position in time.
 *                        For the default primary data renderer, a 'descriptor' property (HTML string)
 *                        is also required to define the item's visual content.
 *  - primaryViewSelector: A standard jQuery selector string used to locate the main
 *                         display container for the timeline. This element will house
 *                         the detailed chronological visualization.
 *
 * Optional Configuration Parameters:
 *  - miniMapSelector: A jQuery selector string for an optional, condensed overview
 *                     or minimap display of the timeline. If provided, a smaller,
 *                     navigable representation will be rendered.
 *  - primaryRenderer: A custom callback function designed to generate the HTML
 *                     representation of an item within the primary timeline.
 *                     It receives the item's data object as an argument and must
 *                     return a valid HTML string. Defaults to `EventHorizon.defaultPrimaryRenderer`.
 *  - miniMapRenderer: A custom callback function for rendering items on the minimap.
 *                     Similar to `primaryRenderer`, it takes an item's data object
 *                     and returns an HTML string for its minimap representation.
 *                     Defaults to `EventHorizon.defaultMiniMapRenderer`.
 *  - scrollLeftControl: A jQuery selector for an element that, when clicked,
 *                       will scroll the primary timeline view to the left.
 *  - scrollRightControl: A jQuery selector for an element that, when clicked,
 *                        will scroll the primary timeline view to the right.
 *  - scrollStepAmount: Defines the number of pixels the primary timeline
 *                      will scroll when a navigation arrow (left/right control) is activated.
 *                      Defaults to 800 pixels.
 *  - pixelsPerAnnum: The foundational pixel width assigned to a single year
 *                    on the primary timeline. This value sets the base zoom level.
 *                    Defaults to 200 pixels per year.
 *  - onItemClick: A callback function that is triggered when a chronological item
 *                 on either timeline (primary or minimap) is clicked by the user.
 *                 The function receives the full data object of the clicked item.
 *                 Example: `function(itemData) { console.log("Item selected: " + itemData.title); }`.
 *  - miniMapPadding: The number of pixels of empty space to allocate before the
 *                    first year marker on the minimap, ensuring clear visibility
 *                    of the initial timeline boundary. Defaults to 3 pixels.
 *
 * Advanced Configuration Parameters:
 *  - calculatePixelsForYear: A specialized function used to dynamically determine
 *                            the pixel width for a specific year. This overrides
 *                            the `pixelsPerAnnum` value and allows for variable
 *                            year widths (e.g., for different zoom levels or emphasis).
 *                            Signature: `(config, yearNumber) => number`.
 *  - itemOffsetPixels: The pixel offset applied to an item's visual element
 *                      from its precise chronological point on the timeline.
 *                      Often used to center icons or visual markers accurately.
 *  - overlayTimelineElements: A boolean flag. If `true`, visual elements like
 *                             year labels and background time blocks on the primary
 *                             timeline are allowed to visually overlap. This can
 *                             facilitate certain design aesthetics. Defaults to `true`.
 *  - dateToPixelPosition: A function responsible for converting a JavaScript Date object
 *                         into a corresponding pixel position along the primary timeline.
 *                         Signature: `(config, earliestYearOnTimeline, dateObject) => number`.
 *  - pixelPositionToDate: A function that performs the inverse operation: converting
 *                         a pixel coordinate on the primary timeline back into
 *                         its corresponding Date object.
 *                         Signature: `(config, earliestYearOnTimeline, pixelsFromLeft) => Date`.
 */
function EventHorizon(setupSettings) {
    const _self = this; // Preserve context for internal methods

    // --- Core Framework Validation ---
    if (typeof jQuery === 'undefined') {
        console.error("EventHorizon: jQuery library is indispensable for this component. Please ensure it's properly loaded.");
        return; // Halt execution if jQuery is missing
    }

    // --- Configuration Integrity Checks ---
    if (!setupSettings || !setupSettings.chronologicalItems) {
        console.error("EventHorizon: The 'chronologicalItems' array is a mandatory part of the setup configuration. Aborting initialization.");
        return;
    }
    if (!Array.isArray(setupSettings.chronologicalItems) || setupSettings.chronologicalItems.length === 0) {
        console.error("EventHorizon: 'chronologicalItems' must be a non-empty array of data objects. Aborting initialization.");
        return;
    }

    const chronologicalItems = setupSettings.chronologicalItems;

    if (!setupSettings.primaryViewSelector) {
        console.error("EventHorizon: The 'primaryViewSelector' for the main timeline display is required. Aborting initialization.");
        return;
    }

    const primaryContainer = jQuery(setupSettings.primaryViewSelector);
    if (primaryContainer.length === 0) {
        console.error(`EventHorizon: No DOM element found for the primary view selector: "${setupSettings.primaryViewSelector}". Initialization failed.`);
        return;
    }

    let miniMapContainer = null;
    if (setupSettings.miniMapSelector) {
        miniMapContainer = jQuery(setupSettings.miniMapSelector);
        if (miniMapContainer.length === 0) {
            console.warn(`EventHorizon: The minimap selector "${setupSettings.miniMapSelector}" did not match any elements. The minimap feature will be disabled.`);
            miniMapContainer = null; // Explicitly set to null if selector fails
        }
    }

    // --- Establish Default and Merged Configuration ---
    const baseConfiguration = {
        primaryRenderer: EventHorizon.defaultPrimaryRenderer,
        itemOffsetPixels: 2,
        pixelsPerAnnum: 200,
        dateToPixelPosition: EventHorizon.defaultDateToPixelPosition,
        pixelPositionToDate: EventHorizon.defaultPixelPositionToDate,
        calculatePixelsForYear: EventHorizon.defaultPixelsPerYearCalculator,
        miniMapRenderer: EventHorizon.defaultMiniMapRenderer,
        miniMapPadding: 3,
        overlayTimelineElements: true,
        scrollStepAmount: 800
    };

    const currentConfig = jQuery.extend({}, baseConfiguration, setupSettings);

    // --- Data Integrity Check for Chronological Items ---
    // Ensure each item has a valid 'moment' property.
    for (const item of chronologicalItems) {
        if (!item.moment || !(item.moment instanceof Date) || isNaN(item.moment.getTime())) {
            console.warn(`EventHorizon: Item data "${JSON.stringify(item)}" is missing a valid 'moment' (Date object). This item might be excluded or rendered incorrectly.`);
            // In a production scenario, one might filter out such items or assign a default date.
        }
    }

    // Sort items chronologically to accurately determine timeline bounds and render order.
    chronologicalItems.sort((a, b) => a.moment.getTime() - b.moment.getTime());

    // Determine the temporal span of the data.
    const earliestYear = chronologicalItems[0].moment.getFullYear();
    const latestYear = chronologicalItems[chronologicalItems.length - 1].moment.getFullYear();

    // --- Primary Timeline DOM Construction and Rendering ---

    // Create the main rendering surface within the primary container.
    const primaryCanvas = jQuery(`<div class='eh-primary-canvas' style='height:${primaryContainer.height()}px; position: relative;'></div>`)
        .appendTo(primaryContainer);

    // Render year labels and background time blocks for the primary timeline.
    let currentRenderOffset = 0;
    // Iterate from the earliest year to one year beyond the latest, ensuring full visibility of the final year.
    for (let yearCounter = earliestYear; yearCounter <= latestYear + 1; yearCounter++) {
        const calculatedYearWidth = currentConfig.calculatePixelsForYear(currentConfig, yearCounter);

        // Append the year label.
        const yearLabelElement = jQuery(`<div class='eh-year-label' style='width:${calculatedYearWidth}px;left:${currentRenderOffset}px;'>${yearCounter}</div>`)
            .appendTo(primaryCanvas);

        // Append the background time block.
        const blockDisplayHeight = primaryContainer.height() - (currentConfig.overlayTimelineElements ? 0 : yearLabelElement.outerHeight(true));
        primaryCanvas.append(`<div class='eh-time-block' style='width:${calculatedYearWidth}px;left:${currentRenderOffset}px;height:${blockDisplayHeight}px;'></div>`);

        currentRenderOffset += calculatedYearWidth;
    }

    // Render each chronological item onto the primary timeline.
    const placedItemBoundariesPrimary = []; // Stores boundary info for overlap detection.
    for (const chronicleEntry of chronologicalItems) {
        const itemHorizontalPosition = currentConfig.dateToPixelPosition(currentConfig, earliestYear, chronicleEntry.moment) - currentConfig.itemOffsetPixels;

        const itemContentHtml = currentConfig.primaryRenderer(chronicleEntry);
        const newItemDOMElement = jQuery(`<div class='eh-event-item'>${itemContentHtml}</div>`)
            .appendTo(primaryCanvas);

        // Calculate and apply item dimensions and position.
        const effectiveItemWidth = newItemDOMElement.outerWidth(true) + 10; // Add a small buffer for spacing.
        newItemDOMElement.css({
            'min-width': `${effectiveItemWidth}px`,
            'left': `${itemHorizontalPosition}px`
        });

        // Attach click handler if defined in configuration.
        if (currentConfig.onItemClick) {
            newItemDOMElement.on('click', { itemData: chronicleEntry, handler: currentConfig.onItemClick },
                function(e) {
                    e.data.handler(e.data.itemData);
                }
            ).addClass('eh-clickable');
        }

        // Adjust vertical position to prevent visual overlaps with other items.
        const itemHeightVisual = newItemDOMElement.outerHeight(true);
        const itemCurrentBounds = { top: 0, left: itemHorizontalPosition, right: itemHorizontalPosition + effectiveItemWidth, bottom: itemHeightVisual };

        EventHorizon.adjustForOverlap(itemCurrentBounds, itemHeightVisual, placedItemBoundariesPrimary);
        if (itemCurrentBounds.top !== 0) {
            newItemDOMElement.css('top', `${itemCurrentBounds.top}px`);
        }
        placedItemBoundariesPrimary.push(itemCurrentBounds);
        placedItemBoundariesPrimary.sort((a, b) => a.top - b.top); // Maintain sorted order for efficient overlap checks.
    }

    // --- Primary Timeline Navigation Controls ---

    // Configure scroll button interactions.
    if (currentConfig.scrollLeftControl) {
        jQuery(currentConfig.scrollLeftControl).on('click', function() {
            primaryCanvas.stop(true, false).animate({ scrollLeft: `-=${currentConfig.scrollStepAmount}px` }, 800);
        }).addClass('eh-clickable');
    }
    if (currentConfig.scrollRightControl) {
        jQuery(currentConfig.scrollRightControl).on('click', function() {
            primaryCanvas.stop(true, false).animate({ scrollLeft: `+=${currentConfig.scrollStepAmount}px` }, 800);
        }).addClass('eh-clickable');
    }

    // --- Minimap Rendering (Conditional) ---
    if (miniMapContainer) {
        const miniMapCanvas = jQuery(`<div class='eh-minimap eh-clickable' style='height:${miniMapContainer.height()}px; position: relative;'></div>`)
            .appendTo(miniMapContainer);

        const totalYearSpan = (latestYear - earliestYear) + 1;
        let miniMapYearWidth = Math.ceil((miniMapContainer.outerWidth(true) - (15 + currentConfig.miniMapPadding)) / totalYearSpan);

        // Ensure minimap fully occupies its container width.
        if ((miniMapYearWidth * totalYearSpan) < miniMapContainer.outerWidth(true)) {
            miniMapYearWidth++;
        }

        // Internal helper to map a Date object to its pixel position on the minimap.
        const mapDateToMiniMapPixel = (dateObject) => {
            const dayRatio = EventHorizon.getDayOfYear(dateObject) / (dateObject.getFullYear() % 4 === 0 ? 366 : 365); // Account for leap years.
            return Math.ceil((dateObject.getFullYear() - earliestYear + dayRatio) * miniMapYearWidth);
        };

        // Create a visual indicator for the primary timeline's current viewport on the minimap.
        const viewportIndicator = jQuery("<div class='eh-viewport-indicator'></div>")
            .appendTo(miniMapCanvas);

        // Update the viewport indicator's position and width when the primary timeline scrolls.
        primaryCanvas.on('scroll', function() {
            const currentScrollLeft = primaryCanvas.scrollLeft();
            const primaryViewWidth = primaryContainer.width();

            const dateAtLeftEdge = currentConfig.pixelPositionToDate(currentConfig, earliestYear, currentScrollLeft);
            const dateAtRightEdge = currentConfig.pixelPositionToDate(currentConfig, earliestYear, currentScrollLeft + primaryViewWidth);

            const miniMapX1 = mapDateToMiniMapPixel(dateAtLeftEdge);
            const miniMapX2 = mapDateToMiniMapPixel(dateAtRightEdge);

            viewportIndicator.css({
                'left': `${miniMapX1}px`,
                'width': `${miniMapX2 - miniMapX1}px`
            });
        });
        primaryCanvas.trigger('scroll'); // Initial update of the viewport indicator.

        // Render year markers and background blocks for the minimap.
        for (let y = earliestYear; y <= latestYear + 1; y++) {
            const blockLeftPosition = currentConfig.miniMapPadding + ((y - earliestYear) * miniMapYearWidth);
            miniMapCanvas.append(`<div class='eh-minimap-block' style='width:${miniMapYearWidth}px;left:${blockLeftPosition}px;'></div>`);
            miniMapCanvas.append(`<div class='eh-minimap-label' style='width:${miniMapYearWidth}px;left:${blockLeftPosition}px;'>${y}</div>`);
        }

        // Render each chronological item onto the minimap.
        const placedItemBoundariesMiniMap = [];
        for (const chronicleEntry of chronologicalItems) {
            const itemDate = chronicleEntry.moment;
            const itemLeftPosition = currentConfig.miniMapPadding + mapDateToMiniMapPixel(itemDate);
            const itemContentMiniMap = currentConfig.miniMapRenderer(chronicleEntry);
            const newItemMiniMapElement = jQuery(`<div class='eh-minimap-item' style='left:${itemLeftPosition}px;'>${itemContentMiniMap}</div>`)
                .appendTo(miniMapCanvas);

            const itemWidthMiniMap = newItemMiniMapElement.outerWidth(true);
            newItemMiniMapElement.css({
                'min-width': `${itemWidthMiniMap}px`,
                'left': `${itemLeftPosition}px`
            });

            if (currentConfig.onItemClick) {
                newItemMiniMapElement.on('click', { itemData: chronicleEntry, handler: currentConfig.onItemClick },
                    function(e) {
                        e.data.handler(e.data.itemData);
                    }
                ).addClass('eh-clickable');
            }

            // Apply overlap adjustment for minimap items.
            const itemHeightMiniMap = newItemMiniMapElement.outerHeight(true);
            const itemBoundsMiniMap = { top: 0, left: itemLeftPosition, right: itemLeftPosition + itemWidthMiniMap, bottom: itemHeightMiniMap };

            EventHorizon.adjustForOverlap(itemBoundsMiniMap, itemHeightMiniMap, placedItemBoundariesMiniMap);
            if (itemBoundsMiniMap.top !== 0) {
                newItemMiniMapElement.css('top', `${itemBoundsMiniMap.top}px`);
            }
            placedItemBoundariesMiniMap.push(itemBoundsMiniMap);
            placedItemBoundariesMiniMap.sort((a, b) => a.top - b.top);
        }

        // Implement click-to-scroll functionality for the minimap.
        miniMapCanvas.on('click', function(e) {
            const clickXRelativeToMinimap = e.pageX - miniMapCanvas.offset().left;
            const fractionalYearsFromStart = (clickXRelativeToMinimap - currentConfig.miniMapPadding) / miniMapYearWidth;

            // Approximate the date corresponding to the click.
            const clickedMoment = new Date(earliestYear + fractionalYearsFromStart, 0, 1);

            // Convert this approximate date to a pixel position on the primary timeline.
            let targetScrollPosition = currentConfig.dateToPixelPosition(currentConfig, earliestYear, clickedMoment);

            // Adjust to center the clicked point within the primary view.
            targetScrollPosition -= primaryContainer.width() / 2;

            // Ensure the scroll position does not go below the timeline's start.
            targetScrollPosition = Math.max(0, targetScrollPosition);

            primaryCanvas.stop(true, false).animate({ scrollLeft: targetScrollPosition }, 800);
        });
    }

    // --- Interactive Scrolling (Drag and Mouse Wheel) for Primary Timeline ---
    // This functionality is adapted from classic jQuery overflow examples.

    primaryCanvas.on('mousedown.ehScroll', function(e) {
        // Store initial state for drag scrolling.
        jQuery(this)
            .data('eh-down', true) // Flag indicating mouse button is held down.
            .data('eh-startX', e.clientX) // Initial X-coordinate of the mouse cursor.
            .data('eh-scrollStart', this.scrollLeft); // Initial scroll position of the canvas.

        return false; // Prevent unwanted text selection or default browser drag behaviors.
    });

    primaryCanvas.on('mouseup.ehScroll mouseleave.ehScroll', function() {
        // Reset the drag flag when the mouse button is released or leaves the canvas.
        jQuery(this).data('eh-down', false);
    });

    primaryCanvas.on('mousemove.ehScroll', function(e) {
        // If the mouse is currently held down, perform drag scrolling.
        if (jQuery(this).data('eh-down')) {
            const newScrollPosition = jQuery(this).data('eh-scrollStart') + jQuery(this).data('eh-startX') - e.clientX;
            this.scrollLeft = newScrollPosition;
        }
    });

    // Mouse wheel scrolling integration (requires jQuery Mousewheel plugin).
    if (jQuery.fn.mousewheel) {
        primaryCanvas.on('mousewheel.ehScroll', function(e, delta) {
            this.scrollLeft -= (delta * 40); // Adjust scroll speed based on 'delta'.
            e.preventDefault(); // Prevent the browser's default page scrolling behavior.
        }).css({
            'overflow': 'hidden', // Hide the native scrollbar for custom scrolling.
            'cursor': 'grab' // Provide a visual cue for interactive dragging.
        });
    } else {
        primaryCanvas.css({ 'overflow': 'auto', 'cursor': 'auto' }); // Fallback if plugin is absent.
        console.warn("EventHorizon: The jQuery Mousewheel plugin was not detected. Mouse wheel scrolling for the primary view is consequently disabled.");
    }

    // Global mouseout handler to prevent "stuck" drag states if the mouse leaves the browser window.
    jQuery(window).on('mouseout.ehScroll', function(e) {
        if (primaryCanvas.data('eh-down')) {
            // Check if the mouse cursor has truly exited the document area.
            if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML' || e.relatedTarget.nodeName === 'BODY') {
                primaryCanvas.data('eh-down', false);
            }
        }
    });

    // --- Public Interface Methods ---
    _self.refresh = function() {
        console.log("EventHorizon: The 'refresh' method is a placeholder in this version. For a complete timeline update, please re-instantiate EventHorizon with new data.");
        // A robust refresh would involve clearing all generated DOM, re-sorting data, and re-running the rendering logic.
    };
}

/**
 * A utility method designed to adjust the vertical position of a chronological item
 * to prevent it from overlapping with other items already placed on the timeline.
 * If an overlap is detected, the item's 'top' and 'bottom' boundaries are shifted downwards.
 *
 * @param {object} currentItemBounds - An object representing the bounding box of the item
 *                                     currently being positioned. It must contain `top`, `left`,
 *                                     `right`, and `bottom` pixel coordinates.
 * @param {number} itemHeight - The precise height of the current item in pixels.
 * @param {Array<object>} placedItemBounds - An array of bounding box objects for all
 *                                           items that have already been successfully
 *                                           positioned on the timeline.
 */
EventHorizon.adjustForOverlap = function(currentItemBounds, itemHeight, placedItemBounds) {
    for (const previouslyPlacedItem of placedItemBounds) {
        // First, check for horizontal overlap between the current item and a previously placed one.
        const horizontalOverlap =
            // Current item starts within or ends within the placed item.
            ((previouslyPlacedItem.left <= currentItemBounds.left && currentItemBounds.left < previouslyPlacedItem.right) ||
             (previouslyPlacedItem.left < currentItemBounds.right && currentItemBounds.right <= previouslyPlacedItem.right)) ||
            // Placed item is entirely contained within the current item's horizontal span.
            ((currentItemBounds.left <= previouslyPlacedItem.left) && (previouslyPlacedItem.right <= currentItemBounds.right));

        if (horizontalOverlap) {
            // If there's horizontal overlap, now check for vertical overlap.
            const verticalOverlap =
                // Current item's top or bottom edge is within the placed item's vertical span.
                ((previouslyPlacedItem.top <= currentItemBounds.top && currentItemBounds.top < previouslyPlacedItem.bottom) ||
                 (previouslyPlacedItem.top < currentItemBounds.bottom && currentItemBounds.bottom <= previouslyPlacedItem.bottom)) ||
                // Placed item is entirely contained within the current item's vertical span.
                ((currentItemBounds.top <= previouslyPlacedItem.top) && (previouslyPlacedItem.bottom <= currentItemBounds.bottom));

            if (verticalOverlap) {
                // If both horizontal and vertical overlap exist, push the current item down.
                currentItemBounds.top = Math.max(currentItemBounds.top, previouslyPlacedItem.bottom);
                currentItemBounds.bottom = currentItemBounds.top + itemHeight;
            }
        }
    }
};

/**
 * The default rendering function for chronological items displayed on the primary timeline.
 * This renderer expects the item's data object to include a 'descriptor' property,
 * which should contain the HTML content to be displayed within the item's box.
 *
 * @param {object} itemData - The data object for the specific chronological item.
 * @returns {string} An HTML string that visually represents the item on the timeline.
 */
EventHorizon.defaultPrimaryRenderer = function(itemData) {
    if (!itemData.descriptor) {
        console.warn(`EventHorizon: Item "${JSON.stringify(itemData)}" lacks a 'descriptor' property. Default content will be used.`);
        return `<div><img class='eh-default-icon' src='assets/icons/default-event.png'><span>No description provided</span></div>`;
    }
    return `<div><img class='eh-default-icon' src='assets/icons/default-event.png'>${itemData.descriptor}</div>`;
};

/**
 * The default rendering function for chronological items on the minimap overview.
 * This renderer provides a simple, compact visual representation suitable for a minimap.
 *
 * @param {object} itemData - The data object for the chronological item.
 * @returns {string} An HTML string representing the item on the minimap, typically a small icon or dot.
 */
EventHorizon.defaultMiniMapRenderer = function(itemData) {
    return `<div><img src='assets/icons/minimap-point.png'></div>`;
};

/**
 * Calculates the horizontal pixel position from the left edge of the primary timeline
 * corresponding to a given Date object. This function considers the timeline's
 * starting year and the configured pixels per annum.
 *
 * @param {object} config - The current EventHorizon configuration object.
 * @param {number} earliestYear - The full year number (e.g., 1990) of the first year displayed on the timeline.
 * @param {Date} dateObj - The Date object for which to calculate the pixel position.
 * @returns {number} The calculated pixel position from the left of the timeline.
 */
EventHorizon.defaultDateToPixelPosition = function(config, earliestYear, dateObj) {
    const yearsElapsed = dateObj.getFullYear() - earliestYear;
    const daysInYear = (dateObj.getFullYear() % 4 === 0) ? 366 : 365; // Account for leap years.
    const dayRatio = EventHorizon.getDayOfYear(dateObj) / daysInYear;
    return Math.ceil((yearsElapsed + dayRatio) * config.pixelsPerAnnum);
};

/**
 * Converts a horizontal pixel position on the primary timeline back into a Date object.
 * This is the inverse operation of `defaultDateToPixelPosition`.
 *
 * @param {object} config - The current EventHorizon configuration object.
 * @param {number} earliestYear - The full year number of the first year displayed on the timeline.
 * @param {number} pixelsOffset - The number of pixels from the left edge of the timeline.
 * @returns {Date} A Date object approximating the chronological point at the given pixel offset.
 */
EventHorizon.defaultPixelPositionToDate = function(config, earliestYear, pixelsOffset) {
    const totalFractionalYears = pixelsOffset / config.pixelsPerAnnum;
    const targetYearFloat = earliestYear + totalFractionalYears;

    const yearPart = Math.floor(targetYearFloat);
    const fractionalYear = targetYearFloat - yearPart;

    const daysInTargetYear = (yearPart % 4 === 0) ? 366 : 365;
    const targetDay = Math.round(fractionalYear * daysInTargetYear);

    const resultingDate = new Date(yearPart, 0, 1); // Start of the approximated year.
    resultingDate.setDate(targetDay); // Add the calculated days to get closer to the precise date.

    return resultingDate;
};

/**
 * Calculates the pixel width to be allocated for a specific year on the primary timeline.
 * The default implementation simply returns the base `pixelsPerAnnum` value from the configuration.
 * This function can be overridden in the configuration to implement variable year widths.
 *
 * @param {object} config - The current EventHorizon configuration object.
 * @param {number} year - The full year number for which to determine the width.
 * @returns {number} The pixel width designated for the specified year.
 */
EventHorizon.defaultPixelsPerYearCalculator = function(config, year) {
    // This method could be extended to return different widths based on 'year'
    // or other factors (e.g., zoom levels, importance of certain periods).
    return config.pixelsPerAnnum;
};

/**
 * A utility method to calculate the day of the year for a given Date object.
 * This function avoids extending the global `Date.prototype` to maintain
 * better compatibility and encapsulation practices.
 *
 * @param {Date} dateObj - The Date object for which to calculate the day of the year.
 * @returns {number} The day number within the year (1 for January 1st, up to 365 or 366).
 */
EventHorizon.getDayOfYear = function(dateObj) {
    const startOfCurrentYear = new Date(dateObj.getFullYear(), 0, 1);
    const timeDifferenceMs = dateObj.getTime() - startOfCurrentYear.getTime();
    return Math.ceil(timeDifferenceMs / (1000 * 60 * 60 * 24)); // Convert milliseconds to days.
};