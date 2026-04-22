let GridFlow = function GridFlow(scopeElement, incorporateRootFlag) {
    // Internal variables for processing
    let processingAid, gridElementsCollection, currentIdx, limitIdx, elementProcessor, currentJQueryScope, gridElementsArray;

    // Default to document if no specific scope is provided
    scopeElement = scopeElement || document;
    currentJQueryScope = jQuery(scopeElement);
    gridElementsCollection = GridFlow.findElementsBySelector('.grid-section', scopeElement);

    // Conditional inclusion of the root scope element itself
    if (incorporateRootFlag !== false && GridFlow.runtimeSettings.processRootElement === true) {
        gridElementsArray = []; // Initialize as an empty array

        // If the current jQuery scope element has the 'grid-section' class, add it to the array
        if (currentJQueryScope.hasClass('grid-section')) {
            gridElementsArray.push(scopeElement);
        }

        // Iterate through the collected grid elements and append them
        for (currentIdx = 0, limitIdx = gridElementsCollection.length; currentIdx < limitIdx; currentIdx++) {
            gridElementsArray.push(gridElementsCollection[currentIdx]);
        }

        // Replace the original collection with the new array including the root
        gridElementsCollection = gridElementsArray;
    }

    limitIdx = gridElementsCollection.length;
    elementProcessor = GridFlow.sectionHandler; // Alias for the main processing function

    // Process each grid element in the collection
    for (currentIdx = 0; currentIdx < limitIdx; currentIdx++) {
        elementProcessor(gridElementsCollection[currentIdx]);
    }

    // Execute registered utility functions
    for (processingAid in GridFlow.utilityFunctions) {
        // Ensure the property belongs to the object itself, not its prototype chain
        if (Object.prototype.hasOwnProperty.call(GridFlow.utilityFunctions, processingAid)) {
            GridFlow.utilityFunctions[processingAid](currentJQueryScope);
        }
    }
};

// Global constants and configuration for GridFlow
GridFlow.SCHEMA_VERSION = '2.1.1'; // Version identifier
GridFlow.ROW_STRUCTURE_PATTERN = /(^|\s+)per\-row\-(\d+)(\s+|$)/; // Regex for columns per row
GridFlow.ITEM_SPAN_PATTERN = /(^|\s+)span\-width\-(\d+)(\s+|$)/; // Regex for column span width
GridFlow.FIXED_ITEM_PATTERN = /(^|\s+)static\-width(\s+|$)/; // Regex for fixed-width columns
GridFlow.FLEX_ITEM_PATTERN = /(^|\s+)flexible(\s+|$)/; // Regex for flexible-width columns
GridFlow.ADAPTIVE_ITEM_PATTERN = /(^|\s+)responsive\-(\d+)\-(\d+)(\s+|$)/; // Regex for adaptive columns
GridFlow.LAST_ITEM_PATTERN = /(^|\s+)terminal(\s+|$)/; // Regex for the last column in a row
GridFlow.DISPLAY_MODE_PATTERN = /(^|\s+)layout\-mode\s+([\w\_\-\d]+)(\s+|$)/; // Regex for display layout mode

// Runtime settings object
GridFlow.runtimeSettings = {
    autoAdjustOnResize: true, // Automatically refresh layout on window resize
    processRootElement: true  // Include the initial context element in processing
};

/**
 * Main function to process a single grid section (equivalent to original columnsIterator).
 * Handles column layout, adaptive sizing, and row processing.
 * @param {HTMLElement} currentGridItem The DOM element representing a grid section.
 */
GridFlow.sectionHandler = function processGridSection(currentGridItem) {
    let loopCounter, loopLimit, containerElement, columnItemElements, finalColumnInSet,
        itemsPerLogicalRow, sectionOverallWidth, calculatedItemWidths,
        flexibleItemArray, currentRowItems, currentItemsInRow, nextItemsInRow,
        fixedItemsTotalWidth, activeColumnItem, staticItemWidth, minimumAllowedWidth, maximumAllowedWidth;

    // Locate the container, either a direct child or the grid item itself
    containerElement = GridFlow.findElementsBySelector('> .container-wrap', currentGridItem)[0] || currentGridItem;
    columnItemElements = GridFlow.findElementsBySelector('> .grid-item', containerElement);

    // If no column items are found, there's nothing to do
    if (columnItemElements.length === 0) {
        return;
    }

    finalColumnInSet = columnItemElements[columnItemElements.length - 1];
    itemsPerLogicalRow = GridFlow.determineRowColumnLayout(currentGridItem, columnItemElements);
    sectionOverallWidth = GridFlow.getEffectiveInnerWidth(containerElement);
    calculatedItemWidths = GridFlow.calculateDistributedWidths(sectionOverallWidth, itemsPerLogicalRow);

    // Handle adaptive column behavior if specified
    if (GridFlow.ADAPTIVE_ITEM_PATTERN.test(currentGridItem.className)) {
        minimumAllowedWidth = Number(RegExp.$2);
        maximumAllowedWidth = Number(RegExp.$3);

        // Adjust columns up if current width is too large
        if (calculatedItemWidths[0].width > maximumAllowedWidth) {
            while (calculatedItemWidths[0].width > maximumAllowedWidth) {
                itemsPerLogicalRow = itemsPerLogicalRow + 1;
                calculatedItemWidths = GridFlow.calculateDistributedWidths(sectionOverallWidth, itemsPerLogicalRow);
                if (calculatedItemWidths[0].width < minimumAllowedWidth) { // Prevent infinite loop if minimum is hit
                    break;
                }
            }
        }

        // Adjust columns down if current width is too small
        if (calculatedItemWidths[0].width < minimumAllowedWidth) {
            while (calculatedItemWidths[0].width < minimumAllowedWidth && itemsPerLogicalRow > 1) {
                itemsPerLogicalRow = itemsPerLogicalRow - 1;
                calculatedItemWidths = GridFlow.calculateDistributedWidths(sectionOverallWidth, itemsPerLogicalRow);
                if (calculatedItemWidths[0].width > maximumAllowedWidth) { // Prevent infinite loop if maximum is hit
                    break;
                }
            }
        }
    }

    flexibleItemArray = [];
    currentRowItems = [];
    currentItemsInRow = 0;
    nextItemsInRow = 0;
    fixedItemsTotalWidth = 0;

    // Iterate through all column items to determine their properties and group them into rows
    for (loopCounter = 0, loopLimit = columnItemElements.length; loopCounter < loopLimit; loopCounter++) {
        activeColumnItem = columnItemElements[loopCounter];

        // Reset item flags and clean up old class
        activeColumnItem.isFlexible = false;
        activeColumnItem.isStatic = false;
        activeColumnItem.isStandard = false;
        activeColumnItem.classList.remove('flexible-row-end'); // Using classList for cleaner manipulation

        // Determine item type based on class names
        if (GridFlow.FIXED_ITEM_PATTERN.test(activeColumnItem.className)) {
            staticItemWidth = GridFlow.getEffectiveOuterWidth(activeColumnItem);
            activeColumnItem.assignedWidth = staticItemWidth;
            activeColumnItem.isStatic = true;
            fixedItemsTotalWidth += staticItemWidth;
        } else if (GridFlow.FLEX_ITEM_PATTERN.test(activeColumnItem.className)) {
            activeColumnItem.isFlexible = true;
            flexibleItemArray.push(activeColumnItem);
        } else {
            activeColumnItem.isStandard = true; // Default type
        }

        // Check for 'terminal' (final) column in a logical row
        if (GridFlow.LAST_ITEM_PATTERN.test(activeColumnItem.className)) {
            activeColumnItem.isTerminal = true;
        }

        nextItemsInRow = currentItemsInRow + activeColumnItem.spanValue;

        // Condition for processing a row:
        // 1. If adding the current item exceeds the logical row capacity.
        // 2. If it's the very last item in the entire set.
        // 3. If it's explicitly marked as a terminal item.
        if (nextItemsInRow >= itemsPerLogicalRow || activeColumnItem === finalColumnInSet || activeColumnItem.isTerminal) {
            // Include the current item in the row if it fits or is a single oversized item
            if (nextItemsInRow <= itemsPerLogicalRow || activeColumnItem.spanValue >= itemsPerLogicalRow) {
                currentRowItems.push(activeColumnItem);
            }

            // Process the completed row
            GridFlow.handleRowProcessing(currentRowItems, sectionOverallWidth, fixedItemsTotalWidth, flexibleItemArray, calculatedItemWidths);

            // Reset for the next row or continue processing the current item if it started a new row
            if (nextItemsInRow > itemsPerLogicalRow) {
                fixedItemsTotalWidth = activeColumnItem.isStatic ? staticItemWidth : 0;
                currentItemsInRow = activeColumnItem.spanValue;
                nextItemsInRow = activeColumnItem.spanValue;
                flexibleItemArray = activeColumnItem.isFlexible ? [activeColumnItem] : [];
                currentRowItems = [activeColumnItem];

                // If this single item is also the last, process it as a row
                if (activeColumnItem === finalColumnInSet) {
                    GridFlow.handleRowProcessing(currentRowItems, sectionOverallWidth, fixedItemsTotalWidth, flexibleItemArray, calculatedItemWidths);
                }
            } else {
                // Reset for a fresh row
                fixedItemsTotalWidth = 0;
                currentItemsInRow = 0;
                nextItemsInRow = 0;
                flexibleItemArray = [];
                currentRowItems = [];
            }
            continue; // Move to the next column item
        }

        // If not completing a row, just add the item and update row count
        currentRowItems.push(activeColumnItem);
        currentItemsInRow += activeColumnItem.spanValue;
    }

    return this; // Allow method chaining
};

/**
 * Determines the number of columns per row for a given grid section.
 * Also assigns a 'spanValue' property to each column element.
 * @param {HTMLElement} gridSection The parent grid section element.
 * @param {Array<HTMLElement>} columnItems An array of column DOM elements.
 * @returns {number} The calculated number of columns per logical row.
 */
GridFlow.determineRowColumnLayout = function determineColumnCounts(gridSection, columnItems) {
    let itemIndex, totalItems, effectiveColumnsPerRow, fixedColumnSpanDefined;

    effectiveColumnsPerRow = columnItems.length; // Default to total items
    fixedColumnSpanDefined = false;

    // Check if a fixed number of columns per row is specified
    if (GridFlow.ROW_STRUCTURE_PATTERN.test(gridSection.className)) {
        effectiveColumnsPerRow = Number(RegExp.$2);
        fixedColumnSpanDefined = true;
    }

    // Iterate through column items to determine individual span values
    for (itemIndex = 0, totalItems = columnItems.length; itemIndex < totalItems; itemIndex++) {
        if (GridFlow.ITEM_SPAN_PATTERN.test(columnItems[itemIndex].className)) {
            columnItems[itemIndex].spanValue = Number(RegExp.$2);
            // If not fixed, adjust effectiveColumnsPerRow based on span values
            if (fixedColumnSpanDefined !== true) {
                effectiveColumnsPerRow += columnItems[itemIndex].spanValue - 1;
            }
        } else {
            columnItems[itemIndex].spanValue = 1; // Default span of 1
        }
    }

    return effectiveColumnsPerRow;
};

/**
 * Processes a single logical row of columns, calculating and applying their widths.
 * @param {Array<HTMLElement>} itemsInRow An array of column DOM elements in the current row.
 * @param {number} sectionTotalWidth The total available width of the parent section.
 * @param {number} staticItemsCombinedWidth The combined width of all fixed-width items in the row.
 * @param {Array<HTMLElement>} flexibleItems An array of flexible-width items in the row.
 * @param {Array<{width: number}>} distributedWidths Pre-calculated widths for standard columns.
 */
GridFlow.handleRowProcessing = function processLayoutRow(itemsInRow, sectionTotalWidth, staticItemsCombinedWidth, flexibleItems, distributedWidths) {
    let currentItem, calculatedItemWidth, currentColumnPosition, currentColumnsOverallWidth,
        lastItemInRow, i, j, lengthOfItems,
        flexibleItemCalculatedWidths, totalFlexibleWidth;

    // Guard clause: if fixed items already exceed container width, skip processing
    if (staticItemsCombinedWidth >= sectionTotalWidth) {
        return;
    }

    calculatedItemWidth = 0;
    currentColumnPosition = 0;
    currentColumnsOverallWidth = staticItemsCombinedWidth;
    lastItemInRow = itemsInRow[itemsInRow.length - 1];

    // Add a class to the last item in the row for styling purposes
    if (!lastItemInRow.classList.contains('flexible-row-end')) {
        lastItemInRow.classList.add('flexible-row-end');
    }

    // Process standard (non-fixed, non-flexible) items first
    for (i = 0, lengthOfItems = itemsInRow.length; i < lengthOfItems; i++) {
        currentItem = itemsInRow[i];
        if (currentItem.isStandard) {
            // If span is too large, assign full container width
            if (currentItem.spanValue >= distributedWidths.length) {
                currentItem.style.width = sectionTotalWidth + 'px';
                continue;
            }

            // Sum up widths for the spanned columns
            for (j = currentColumnPosition; j < (currentColumnPosition + currentItem.spanValue); j++) {
                calculatedItemWidth += distributedWidths[j].width;
            }

            currentColumnsOverallWidth += calculatedItemWidth;
            currentColumnPosition += currentItem.spanValue;
            currentItem.style.width = calculatedItemWidth + 'px';
            calculatedItemWidth = 0; // Reset for next item
        }
    }

    // If there are flexible items, calculate and apply their widths
    if (flexibleItems.length > 0) {
        totalFlexibleWidth = 0;
        // Distribute remaining width among flexible items
        flexibleItemCalculatedWidths = GridFlow.calculateDistributedWidths(sectionTotalWidth - currentColumnsOverallWidth, flexibleItems.length);

        for (i = 0, lengthOfItems = flexibleItems.length; i < lengthOfItems; i++) {
            totalFlexibleWidth += flexibleItemCalculatedWidths[i].width;
            flexibleItems[i].style.width = flexibleItemCalculatedWidths[i].width + 'px';
        }
    }

    // If the last item is a 'terminal' item, apply a right margin to fill remaining space
    if (lastItemInRow.isTerminal) {
        const remainingSpace = sectionTotalWidth - currentColumnsOverallWidth - (totalFlexibleWidth || 0);
        if (remainingSpace > 0) { // Only apply if there's positive space
            lastItemInRow.style.marginRight = remainingSpace + 'px';
        }
    }
};

/**
 * Implements a rounding algorithm to distribute width evenly among columns,
 * handling fractional differences by adjusting individual column widths by 1 pixel.
 * @param {number} totalAvailableWidth The total width to be distributed.
 * @param {number} numberOfColumns The number of columns to distribute the width among.
 * @returns {Array<{width: number}>} An array of objects, each containing the calculated width for a column.
 */
GridFlow.calculateDistributedWidths = function widthDistributionAlgorithm(totalAvailableWidth, numberOfColumns) {
    const memoizationTable = GridFlow.calcDistributor.memo; // Access the cache

    // Check cache first
    if (memoizationTable[totalAvailableWidth] && memoizationTable[totalAvailableWidth][numberOfColumns]) {
        return memoizationTable[totalAvailableWidth][numberOfColumns];
    }

    const columnBasePercentage = 100 / numberOfColumns;
    const individualColumnData = [];
    const baseColumnWidth = Math.round(totalAvailableWidth * (columnBasePercentage / 100));
    let currentTotalWidth = baseColumnWidth * numberOfColumns;

    // Initialize all columns with the base width
    for (let i = 0; i < numberOfColumns; i++) {
        individualColumnData.push({ width: baseColumnWidth });
    }

    const widthDifference = totalAvailableWidth - currentTotalWidth;
    const absoluteDifference = Math.abs(widthDifference);

    // Distribute the difference (if any) by adjusting individual column widths by 1 pixel
    if (widthDifference !== 0) {
        const incrementValue = (widthDifference > 0) ? 1 : -1; // Determine if we need to add or subtract 1
        const adjustmentOrder = []; // To store indices for adjustment

        // Create an alternating pattern for distribution to spread the adjustments
        for (let i = 0; i < absoluteDifference; i++) {
            // This pattern distributes adjustments from both ends towards the middle
            const indexFromStart = Math.floor(i / 2);
            const indexFromEnd = numberOfColumns - 1 - Math.floor(i / 2);
            if (i % 2 === 0) { // Even iterations from start
                adjustmentOrder.push(indexFromStart);
            } else { // Odd iterations from end
                adjustmentOrder.push(indexFromEnd);
            }
        }

        // Apply adjustments
        for (let i = 0; i < absoluteDifference; i++) {
            const columnIndex = adjustmentOrder[i % adjustmentOrder.length]; // Cycle through the adjustment order
            if (individualColumnData[columnIndex]) { // Ensure index is valid
                individualColumnData[columnIndex].width += incrementValue;
            }
        }
    }

    // Store in cache
    if (!memoizationTable[totalAvailableWidth]) {
        memoizationTable[totalAvailableWidth] = {};
    }
    memoizationTable[totalAvailableWidth][numberOfColumns] = individualColumnData;

    return individualColumnData;
};

// Cache for the width distribution algorithm
GridFlow.calcDistributor = {
    memo: {}
};

// --- Helper Functions (renamed and potentially rewritten to use vanilla JS or different jQuery methods) ---

/**
 * Custom querySelectorAll wrapper, mimicking Elastic.querySelectorAll behavior.
 * @param {string} selector CSS selector string.
 * @param {HTMLElement} context The DOM element to search within.
 * @returns {Array<HTMLElement>} An array of matching DOM elements.
 */
GridFlow.findElementsBySelector = function(selector, context) {
    if (!context || typeof context.querySelectorAll !== 'function') {
        context = document;
    }
    return Array.from(context.querySelectorAll(selector));
};

/**
 * Gets the inner width of an element (content area only).
 * @param {HTMLElement} element The DOM element.
 * @returns {number} The inner width in pixels.
 */
GridFlow.getEffectiveInnerWidth = function(element) {
    // Use clientWidth for content-box model or jQuery.width() for cross-browser
    return jQuery(element).width();
};

/**
 * Gets the outer width of an element (including padding, border, and optionally margin).
 * @param {HTMLElement} element The DOM element.
 * @returns {number} The outer width in pixels.
 */
GridFlow.getEffectiveOuterWidth = function(element) {
    // Use outerWidth(true) to include margins
    return jQuery(element).outerWidth(true);
};

// --- Utility Functions (formerly helpers) ---
GridFlow.utilityFunctions = {
    'fill-parent-width': function adaptToParentWidth(currentScopeJQuery) {
        let loopIndex, itemReference, elementsToProcess, totalItems, processedItemsArray;

        elementsToProcess = currentScopeJQuery.find('.fill-parent-width');

        // Replicate the includeContext logic for helper functions
        processedItemsArray = [];
        if (GridFlow.runtimeSettings.processRootElement && currentScopeJQuery.hasClass('fill-parent-width')) {
            processedItemsArray.push(currentScopeJQuery[0]);
        }
        elementsToProcess.each(function() {
            processedItemsArray.push(this);
        });

        totalItems = processedItemsArray.length;

        for (loopIndex = 0; loopIndex < totalItems; loopIndex++) {
            itemReference = jQuery(processedItemsArray[loopIndex]);
            // Calculate width: parent's content width minus current element's horizontal padding/border/margin
            const parentWidth = itemReference.parent().width();
            const horizontalOffset = itemReference.outerWidth(true) - itemReference.width();
            itemReference.width(parentWidth - horizontalOffset);
        }

        return this;
    },
    'equal-sibling-height': function normalizeSiblingHeights(currentScopeJQuery) {
        let loopIndex, innerLoopIndex, currentItemHeight, maximumHeightFound,
            childColumnElements, childColumnsLength, elementsToProcess, totalElements, processedElementsArray;

        elementsToProcess = currentScopeJQuery.find('.equal-sibling-height');

        processedElementsArray = [];
        if (GridFlow.runtimeSettings.processRootElement && currentScopeJQuery.hasClass('equal-sibling-height')) {
            processedElementsArray.push(currentScopeJQuery[0]);
        }
        elementsToProcess.each(function() {
            processedElementsArray.push(this);
        });

        totalElements = processedElementsArray.length;

        for (loopIndex = 0; loopIndex < totalElements; loopIndex++) {
            childColumnElements = jQuery(processedElementsArray[loopIndex]).find('> *');
            childColumnsLength = childColumnElements.length;
            maximumHeightFound = 0;

            // Find the maximum outer height among children
            for (innerLoopIndex = 0; innerLoopIndex < childColumnsLength; innerLoopIndex++) {
                currentItemHeight = jQuery(childColumnElements[innerLoopIndex]).outerHeight(true);
                maximumHeightFound = Math.max(maximumHeightFound, currentItemHeight);
            }

            // Apply the maximum height to all children
            for (innerLoopIndex = 0; innerLoopIndex < childColumnsLength; innerLoopIndex++) {
                jQuery(childColumnElements[innerLoopIndex]).css('height', maximumHeightFound + 'px');
            }
        }

        return this;
    },
    'equal-row-height': function normalizeRowHeights(currentScopeJQuery) {
        let i, j, k, currentHeightVal, maxRowHeight,
            rowChildren, rowChildrenCount, targetElements, targetElementsCount, processedTargets;

        targetElements = currentScopeJQuery.find('.equal-row-height');

        processedTargets = [];
        if (GridFlow.runtimeSettings.processRootElement && currentScopeJQuery.hasClass('equal-row-height')) {
            processedTargets.push(currentScopeJQuery[0]);
        }
        targetElements.each(function() {
            processedTargets.push(this);
        });

        targetElementsCount = processedTargets.length;

        for (i = 0; i < targetElementsCount; i++) {
            rowChildren = jQuery(processedTargets[i]).find('> *');
            rowChildrenCount = rowChildren.length;
            maxRowHeight = 0;
            let collectedRowItems = [];

            for (j = 0; j < rowChildrenCount; j++) {
                const currentChild = jQuery(rowChildren[j]);
                currentHeightVal = currentChild.outerHeight(true);
                maxRowHeight = Math.max(maxRowHeight, currentHeightVal);
                collectedRowItems.push(currentChild);

                // If this child marks the end of a logical row
                if (currentChild.hasClass('flexible-row-end')) {
                    for (k = 0; k < collectedRowItems.length; k++) {
                        collectedRowItems[k].css('height', maxRowHeight + 'px');
                    }
                    maxRowHeight = 0; // Reset for the next row
                    collectedRowItems = [];
                }
            }
            // Handle any remaining items in the last "row" if no 'flexible-row-end' was found for them
            if (collectedRowItems.length > 0) {
                for (k = 0; k < collectedRowItems.length; k++) {
                    collectedRowItems[k].css('height', maxRowHeight + 'px');
                }
            }
        }

        return this;
    },
    'equal-min-height': function normalizeMinHeights(currentScopeJQuery) {
        let i, j, currentItemHeight, maxHeightValue,
            childGridItems, childGridItemsLength, parentElements, parentElementsLength, processedParentElements;

        parentElements = currentScopeJQuery.find('.equal-min-height');

        processedParentElements = [];
        if (GridFlow.runtimeSettings.processRootElement && currentScopeJQuery.hasClass('equal-min-height')) {
            processedParentElements.push(currentScopeJQuery[0]);
        }
        parentElements.each(function() {
            processedParentElements.push(this);
        });

        parentElementsLength = processedParentElements.length;

        for (i = 0; i < parentElementsLength; i++) {
            childGridItems = jQuery(processedParentElements[i]).find('> *');
            childGridItemsLength = childGridItems.length;
            maxHeightValue = 0;

            for (j = 0; j < childGridItemsLength; j++) {
                currentItemHeight = jQuery(childGridItems[j]).outerHeight(true);
                maxHeightValue = Math.max(maxHeightValue, currentItemHeight);
            }

            for (j = 0; j < childGridItemsLength; j++) {
                jQuery(childGridItems[j]).css('min-height', maxHeightValue + 'px');
            }
        }

        return this;
    },
    'stretch-to-full-height': function stretchToFullHeight(currentScopeJQuery) {
        let i, itemRef, newCalculatedHeight, elementsToTarget, elementsCount;

        // Using vanilla JS `querySelectorAll` and then wrapping in jQuery for consistency
        elementsToTarget = GridFlow.findElementsBySelector('.stretch-to-full-height', currentScopeJQuery[0]);

        // Incorporate root element if specified in settings
        if (GridFlow.runtimeSettings.processRootElement && currentScopeJQuery[0] !== document && currentScopeJQuery.hasClass('stretch-to-full-height')) {
            elementsToTarget.unshift(currentScopeJQuery[0]); // Add to the beginning
        }

        elementsCount = elementsToTarget.length;

        for (i = 0; i < elementsCount; i++) {
            itemRef = jQuery(elementsToTarget[i]);
            const parentElement = itemRef.parent();

            // Guard against missing parent or zero height parent
            if (!parentElement || parentElement.length === 0 || parentElement.height() === 0) {
                continue;
            }

            newCalculatedHeight = parentElement.height() - (itemRef.outerHeight(true) - itemRef.height());

            // Validate the calculated height before applying
            if (newCalculatedHeight < 0 || !Number.isFinite(newCalculatedHeight)) {
                continue;
            }
            itemRef.css('height', newCalculatedHeight + 'px');
        }

        return this;
    },
    'stretch-to-min-height': function stretchToMinHeight(currentScopeJQuery) {
        let i, itemRef, newCalculatedMinHeight, elementsToTarget, elementsCount, processedTargets;

        elementsToTarget = currentScopeJQuery.find('.stretch-to-min-height');

        processedTargets = [];
        if (GridFlow.runtimeSettings.processRootElement && currentScopeJQuery.hasClass('stretch-to-min-height')) {
            processedTargets.push(currentScopeJQuery[0]);
        }
        elementsToTarget.each(function() {
            processedTargets.push(this);
        });

        elementsCount = processedTargets.length;

        for (i = 0; i < elementsCount; i++) {
            itemRef = jQuery(processedTargets[i]);
            const parentElement = itemRef.parent();

            // Guard against missing parent or zero height parent
            if (!parentElement || parentElement.length === 0 || parentElement.height() === 0) {
                continue;
            }

            newCalculatedMinHeight = parentElement.height() - (itemRef.outerHeight(true) - itemRef.height());

            // Validate the calculated height before applying
            if (newCalculatedMinHeight < 0 || !Number.isFinite(newCalculatedMinHeight)) {
                continue;
            }
            itemRef.css('min-height', newCalculatedMinHeight + 'px');
        }

        return this;
    }
};