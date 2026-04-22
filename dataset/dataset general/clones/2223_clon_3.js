/*
 * Dynamic Grid Layout Utility v2.1
 *
 * Provides a responsive, gap-aware, multi-column grid arrangement for web elements.
 * Project details: https://example.com/grid-utility/
 * Developed by GridSolutions Team, inspired by community contributions.
 *
 * Licensed under the Apache 2.0 license.
 */

// Utility function for delaying execution, adapted from various sources
// Prevents functions from firing too frequently, improving performance on rapid events.

(function ($, eventNamespace) {
    /**
     * Creates a debounced version of a function.
     * The debounced function will only be invoked after a specified delay
     * has passed since the last time it was called.
     *
     * @param {Function} callbackFn - The function to debounce.
     * @param {number} [delayMillis=150] - The number of milliseconds to delay.
     * @param {boolean} [immediateCall=false] - If true, the function will be called immediately,
     *                                           but won't be called again until the delay has passed.
     * @returns {Function} The debounced function.
     */
    const throttleDelay = (callbackFn, delayMillis = 150, immediateCall = false) => {
        if (typeof callbackFn !== 'function') {
            console.error("throttleDelay expects a function as its first argument.");
            return () => {}; // Return a no-op function
        }

        let delayTimer;
        return function debouncedExecution() {
            const contextObj = this;
            const invocationArgs = arguments;

            const executeAfterDelay = () => {
                if (!immediateCall) {
                    callbackFn.apply(contextObj, invocationArgs);
                }
                delayTimer = null;
            };

            const shouldExecuteNow = immediateCall && !delayTimer;

            clearTimeout(delayTimer); // Reset the timer on each call
            delayTimer = setTimeout(executeAfterDelay, delayMillis);

            if (shouldExecuteNow) {
                callbackFn.apply(contextObj, invocationArgs);
            }
        };
    };

    // Extend jQuery's prototype to include a responsive layout trigger
    // This allows binding a debounced function to the 'resize' event.
    $.fn[eventNamespace] = function (handlerFunction) {
        if (handlerFunction) {
            return this.bind('resize', throttleDelay(handlerFunction));
        } else {
            // If no handler, trigger the event directly.
            return this.trigger(eventNamespace);
        }
    };

})(jQuery, 'responsiveLayoutTrigger');

// Polyfill for Object.keys for older browsers, if not natively supported.
// Ensures consistent behavior across different JavaScript environments.
if (!Object.keys) {
    Object.keys = function (inputObject) {
        const propertyNames = [];
        for (let propKey in inputObject) {
            // Ensure the property belongs to the object itself, not its prototype chain.
            if (Object.prototype.hasOwnProperty.call(inputObject, propKey)) {
                propertyNames.push(propKey);
            }
        }
        return propertyNames;
    };
}

// The core GridArranger component logic
(function ($) {

    /**
     * @class GridArranger
     * @param {object} customConfig - User-defined configuration options.
     * @param {HTMLElement} targetElement - The DOM element to manage.
     */
    $.GridArranger = function (customConfig, targetElement) {
        this.managedContainer = $(targetElement);
        this._initializeComponent(customConfig);
    };

    // Default configuration for the GridArranger
    $.GridArranger.defaultSettings = {
        itemSelector: '.grid-item', // Selector for individual grid elements
        baseItemWidth: 50,          // Minimum width for a single grid unit
        minimumColumns: 1,          // Guarantees at least this many columns
        columnGap: 1,               // Spacing between grid items
        centerLayout: false,        // If true, centers the entire grid horizontally
        adjustToFillGaps: true,     // Attempts to resize items to fill empty spaces
        fillGapOptions: {
            allowAnyResize: true    // If true, any block can be resized to fill a gap
        },
        enableTransitions: true,    // Enables animated positioning
        transitionOptions: {
            stepDelay: 20,          // Delay between animating each item (for queued animations)
            animationDuration: 100, // Duration of individual item animations
            queueAnimations: true,  // Animate items one by one
            onComplete: function () {} // Callback after all animations finish
        }
    };

    $.GridArranger.prototype = {

        /**
         * Initializes the GridArranger instance.
         * @param {object} initialOptions - Options passed during instantiation.
         * @private
         */
        _initializeComponent: function (initialOptions) {
            const selfRef = this; // Capture 'this' for use in callbacks
            if (!this.managedContainer.length) {
                console.warn("GridArranger: Managed container element not found.");
                return;
            }

            this.managedContainer.css('position', 'relative');
            this.configOptions = $.extend(true, {}, $.GridArranger.defaultSettings, initialOptions);

            this.placedItems = [];              // Array to hold data for arranged items
            this.isLayoutAdjusting = false;     // Flag to prevent re-entrant layout calculations
            this.needsRecalculation = true;     // Indicates if a full layout pass is needed
            this.gridOccupancyMap = {};         // Represents the grid's occupied cells

            // Bind the responsive layout trigger to the window resize event
            $(window).responsiveLayoutTrigger(() => {
                selfRef.recalculateLayout();
            });

            // Initial setup of grid items
            this._setupGridItems();
        },

        /**
         * Scans and prepares grid items for placement.
         * @param {jQuery} [itemCollection] - Specific items to process, defaults to all.
         * @param {string} [placementMethod='append'] - 'append' or 'prepend' for item order.
         * @private
         */
        _setupGridItems: function (itemCollection, placementMethod = 'append') {
            const instanceRef = this;

            this.processedItemCount = 0;
            this.currentMaxHeight = 0;
            this.currentMaxWidth = 0;
            this.allBlocks = this.managedContainer.find(this.configOptions.itemSelector);
            this.placementGrid = {}; // Resets the grid for new calculations

            if (!this.allBlocks.length) {
                // No items found, perhaps log or handle gracefully
                return;
            }

            const containerEffectiveWidth = this.configOptions.centerLayout ? $(window).width() : this.managedContainer.innerWidth();
            const unitSize = this.configOptions.baseItemWidth + this.configOptions.columnGap;

            // Calculate the number of columns based on container width and item size
            this.currentColumnCount = Math.max(
                this.configOptions.minimumColumns,
                Math.floor(containerEffectiveWidth / unitSize)
            );

            const blockBaseSize = this.configOptions.baseItemWidth;
            const spacingUnit = this.configOptions.columnGap;
            const itemDisplayMode = "block"; // Default display for grid items

            // If no specific collection is provided, use all detected blocks.
            itemCollection = itemCollection || this.allBlocks;

            itemCollection.each(function () {
                const $currentBlock = $(this);

                // Parse dimensions from a class, e.g., 'size21' -> 2x1
                // This regex extracts a two-digit number.
                const dimClassMatch = $currentBlock.attr('class').match(/size([0-9]{2})/);
                let xUnits = 1;
                let yUnits = 1;

                if (dimClassMatch && dimClassMatch[1]) {
                    const dimensions = dimClassMatch[1].split('');
                    xUnits = parseFloat(dimensions[0]) || 1;
                    yUnits = parseFloat(dimensions[1]) || 1;
                }

                const itemActualWidth = (blockBaseSize * xUnits) + (spacingUnit * (xUnits - 1));
                const itemActualHeight = (blockBaseSize * yUnits) + (spacingUnit * (yUnits - 1));

                // Apply initial styling and store custom data attributes
                $currentBlock.css({
                    'display': itemDisplayMode,
                    'position': 'absolute',
                    'width': itemActualWidth,
                    'height': itemActualHeight,
                    'top': $currentBlock.position().top, // Keep current position for smooth transitions
                    'left': $currentBlock.position().left
                }).removeClass('layout-adjusted'); // Remove any previous adjustment flag

                // Calculate and store item placement in the grid structure
                instanceRef._calculateItemPlacement($currentBlock, placementMethod, xUnits, yUnits);
            });

            // After all items are processed, finalize the layout
            if (instanceRef.processedItemCount === instanceRef.allBlocks.length) {
                // If gap filling is enabled, attempt to fill empty spaces
                if (instanceRef.configOptions.adjustToFillGaps) {
                    instanceRef.placedItems = instanceRef._optimizeLayoutGaps();
                }
                // Apply the calculated positions to the DOM elements
                instanceRef._applyLayoutPositions(instanceRef.placedItems);
                instanceRef.placedItems = []; // Reset for next calculation
            }
        },

        /**
         * Ensures a specific row exists in the grid occupancy map.
         * @param {number} verticalIndex - The y-coordinate (row index).
         * @private
         */
        _ensureGridRow: function (verticalIndex) {
            if (this.gridOccupancyMap[verticalIndex]) {
                return false; // Row already exists
            } else {
                this.gridOccupancyMap[verticalIndex] = {};
            }

            // Initialize all cells in the new row as unoccupied (0)
            for (let colIdx = 0; colIdx < this.currentColumnCount; colIdx++) {
                const horizontalOffset = colIdx * (this.configOptions.baseItemWidth + this.configOptions.columnGap);
                this.gridOccupancyMap[verticalIndex][horizontalOffset] = 0; // 0 for unoccupied
            }
        },

        /**
         * Marks grid cells as occupied based on an item's position and dimensions.
         * @param {object} blockInfo - Object containing item's x, y, width, height.
         * @private
         */
        _markOccupiedCells: function (blockInfo) {
            const topCoord = parseInt(blockInfo.y);
            const leftCoord = parseInt(blockInfo.x);
            const unitStep = this.configOptions.baseItemWidth + this.configOptions.columnGap;

            // Iterate through the cells covered by the block
            for (let hStep = 0; hStep < blockInfo.height; hStep += unitStep) {
                for (let wStep = 0; wStep < blockInfo.width; wStep += unitStep) {
                    const currentX = leftCoord + wStep;
                    const currentY = topCoord + hStep;

                    // Ensure the row exists before marking cells
                    if (!this.gridOccupancyMap[currentY]) {
                        this._ensureGridRow(currentY);
                    }
                    this.gridOccupancyMap[currentY][currentX] = 1; // 1 for occupied
                }
            }
        },

        /**
         * Gets the number of entries in an object/map.
         * @param {object} inputMap - The object to count entries for.
         * @returns {number} The count of enumerable own properties.
         * @private
         */
        _getMapEntryCount: function (inputMap) {
            return Object.keys(inputMap).length;
        },

        /**
         * Attempts to fill empty gaps in the layout by potentially resizing items.
         * @returns {Array<object>} The updated list of placed items.
         * @private
         */
        _optimizeLayoutGaps: function () {
            const arrangerInstance = this;
            const unitSize = this.configOptions.baseItemWidth + this.configOptions.columnGap;

            // Mark all currently placed items in the grid occupancy map
            this.placedItems.forEach(itemData => {
                arrangerInstance._markOccupiedCells(itemData);
            });

            // Sort items by their vertical position in descending order
            // This helps in identifying gaps from top-to-bottom.
            const sortedElements = [...this.placedItems].sort((a, b) => b.y - a.y);
            if (sortedElements.length === 0) {
                return []; // No elements to optimize
            }

            const highestYCoord = sortedElements[0].y; // Highest y-coordinate reached by an item

            let gapCandidate = {}; // Object to store potential gap dimensions
            let remainingRowsToScan = this._getMapEntryCount(this.gridOccupancyMap);

            // Iterate through the grid occupancy map to find empty cells
            Object.entries(this.gridOccupancyMap).forEach(([rowKey, columnData]) => {
                const currentScanY = parseInt(rowKey);
                remainingRowsToScan--;

                Object.entries(columnData).forEach(([colKey, cellStatus]) => {
                    // If a cell is unoccupied (0) and within the bounds of existing items
                    if (cellStatus === 0 && currentScanY < highestYCoord) {
                        if (!gapCandidate.y) gapCandidate.y = currentScanY;
                        if (!gapCandidate.x) gapCandidate.x = parseInt(colKey);
                        if (!gapCandidate.width) gapCandidate.width = 0;
                        if (!gapCandidate.height) gapCandidate.height = arrangerInstance.configOptions.baseItemWidth;

                        // Extend the width of the gap candidate
                        gapCandidate.width += (gapCandidate.width === 0) ? arrangerInstance.configOptions.baseItemWidth : unitSize;

                        let extendedHeight = 0;
                        // Check for vertical extension of the gap
                        for (let rowOffset = 1; rowOffset < remainingRowsToScan; rowOffset++) {
                            const nextRowKey = currentScanY + (rowOffset * unitSize);
                            if (arrangerInstance.gridOccupancyMap[nextRowKey] && arrangerInstance.gridOccupancyMap[nextRowKey][colKey] === 0) {
                                extendedHeight += unitSize;
                                arrangerInstance.gridOccupancyMap[nextRowKey][colKey] = 1; // Mark as temporarily occupied
                            } else {
                                break;
                            }
                        }
                        gapCandidate.height += extendedHeight;
                        gapCandidate.ready = true; // Gap candidate is fully defined at this point

                    } else if (gapCandidate.ready) {
                        // A gap has been identified, now try to fill it
                        sortedElements.some((itemData, index) => {
                            const canResize = arrangerInstance.configOptions.fillGapOptions.allowAnyResize ||
                                (gapCandidate.width <= itemData.width && gapCandidate.height <= itemData.height);

                            // If the gap can accommodate the item (potentially resized)
                            if (gapCandidate.y <= itemData.y && canResize) {
                                // Remove the original item and add a new one with adjusted dimensions
                                sortedElements.splice(index, 1);
                                $(itemData.$el).addClass('layout-adjusted'); // Mark as adjusted
                                arrangerInstance.placedItems.push({
                                    $el: itemData.$el,
                                    x: parseInt(gapCandidate.x),
                                    y: parseInt(gapCandidate.y),
                                    width: parseInt(gapCandidate.width),
                                    height: parseInt(gapCandidate.height)
                                });
                                return true; // Break out of `some` loop
                            }
                            return false;
                        });
                        gapCandidate = {}; // Reset for the next gap
                    }
                });
            });

            // The 'placedItems' now contains the original items plus any adjusted ones.
            return arrangerInstance.placedItems;
        },

        /**
         * Calculates the optimal position for a given item within the grid.
         * @param {jQuery} itemBlock - The jQuery object representing the item.
         * @param {string} placementMethod - 'append' or 'prepend'.
         * @param {number} xUnits - Number of horizontal grid units the item occupies.
         * @param {number} yUnits - Number of vertical grid units the item occupies.
         * @private
         */
        _calculateItemPlacement: function (itemBlock, placementMethod, xUnits, yUnits) {
            this.processedItemCount++;
            let gridRowIndex = 0; // Current row being considered for placement
            const unitSize = this.configOptions.baseItemWidth + this.configOptions.columnGap;

            const itemWidth = itemBlock.width();
            const itemHeight = itemBlock.height();

            // Calculate grid units occupied by the item
            const colsOccupied = Math.ceil(itemWidth / unitSize);
            const rowsOccupied = Math.ceil(itemHeight / unitSize);

            // Ensure minimum columns can accommodate the widest block
            if (colsOccupied > this.configOptions.minimumColumns) {
                this.configOptions.minimumColumns = colsOccupied;
            }

            // Loop to find the first available spot in the grid
            while (true) {
                // Expand grid vertically if needed to check for placement
                for (let y = colsOccupied; y >= 0; y--) {
                    if (this.placementGrid[gridRowIndex + y]) break;
                    this.placementGrid[gridRowIndex + y] = {};
                    for (let x = 0; x < this.currentColumnCount; x++) {
                        this.placementGrid[gridRowIndex + y][x] = false; // Mark as available
                    }
                }

                // Iterate through columns to find a suitable starting point
                for (let startColumn = 0; startColumn <= (this.currentColumnCount - colsOccupied); startColumn++) {

                    // Ensure the corresponding row exists in the matrix for occupancy tracking
                    const matrixRowOffset = gridRowIndex * unitSize;
                    this._ensureGridRow(matrixRowOffset);

                    let fitsInSpot = true;
                    // Check if the current item fits into this position
                    for (let y = 0; y < rowsOccupied; y++) {
                        for (let x = 0; x < colsOccupied; x++) {
                            // If row doesn't exist or cell is already occupied, it doesn't fit
                            if (!this.placementGrid[gridRowIndex + y] || this.placementGrid[gridRowIndex + y][startColumn + x]) {
                                fitsInSpot = false;
                                break;
                            }
                        }
                        if (!fitsInSpot) break;
                    }

                    // If a fit is found, mark cells as occupied and store item data
                    if (fitsInSpot) {
                        for (let y = 0; y < rowsOccupied; y++) {
                            for (let x = 0; x < colsOccupied; x++) {
                                if (this.placementGrid[gridRowIndex + y]) {
                                    this.placementGrid[gridRowIndex + y][startColumn + x] = true; // Mark as occupied
                                }
                            }
                        }

                        // Store the item's calculated position and dimensions
                        this._storePlacedItem(
                            itemBlock,
                            startColumn * unitSize, // X-coordinate
                            gridRowIndex * unitSize, // Y-coordinate
                            itemWidth,
                            itemHeight,
                            colsOccupied,
                            rowsOccupied,
                            placementMethod
                        );
                        return; // Item placed, exit function
                    }
                }
                gridRowIndex++; // Move to the next grid row to search for a spot
            }
        },

        /**
         * Adds item data to the internal placedItems array.
         * @param {jQuery} targetBlockElement - The jQuery object of the item.
         * @param {number} leftPos - Calculated left position.
         * @param {number} topPos - Calculated top position.
         * @param {number} itemActualWidth - Actual width of the item.
         * @param {number} itemActualHeight - Actual height of the item.
         * @param {number} gridCols - Number of grid columns occupied.
         * @param {number} gridRows - Number of grid rows occupied.
         * @param {string} insertionMethod - 'append' or 'prepend'.
         * @private
         */
        _storePlacedItem: function (targetBlockElement, leftPos, topPos, itemActualWidth, itemActualHeight, gridCols, gridRows, insertionMethod) {
            const itemData = {
                $el: targetBlockElement,
                x: leftPos,
                y: topPos,
                width: itemActualWidth,
                height: itemActualHeight,
                cols: gridCols,
                rows: gridRows
            };

            if (insertionMethod === "prepend") {
                this.placedItems.unshift(itemData);
            } else {
                this.placedItems.push(itemData);
            }
        },

        /**
         * Determines the necessary height for the container based on placed items.
         * @param {Array<object>} layoutElements - Array of item data.
         * @returns {number} The calculated maximum height.
         * @private
         */
        _computeContainerHeight: function (layoutElements) {
            let layoutRef = this;
            let currentMaxHeight = 0;
            if (!layoutElements || layoutElements.length === 0) {
                return currentMaxHeight;
            }
            layoutElements.forEach(elementData => {
                const bottomEdge = (elementData.y + elementData.height);
                if (bottomEdge > currentMaxHeight) {
                    currentMaxHeight = bottomEdge;
                }
            });
            return currentMaxHeight;
        },

        /**
         * Determines the necessary width for the container based on placed items.
         * @param {Array<object>} layoutElements - Array of item data.
         * @returns {number} The calculated maximum width.
         * @private
         */
        _computeContainerWidth: function (layoutElements) {
            let layoutRef = this;
            let currentMaxWidth = 0;
            if (!layoutElements || layoutElements.length === 0) {
                return currentMaxWidth;
            }
            layoutElements.forEach(elementData => {
                const rightEdge = (elementData.x + elementData.width);
                if (rightEdge > currentMaxWidth) {
                    currentMaxWidth = rightEdge;
                }
            });
            return currentMaxWidth;
        },

        /**
         * Applies the calculated positions to the actual DOM elements, with optional animations.
         * @param {Array<object>} elementsToPosition - Array of item data with final positions.
         * @private
         */
        _applyLayoutPositions: function (elementsToPosition) {
            const currentInstance = this;

            // Set the container's height and, if centered, its width and margins.
            this.managedContainer.css('height', this._computeContainerHeight(elementsToPosition));
            if (this.configOptions.centerLayout) {
                this.managedContainer.css({
                    'width': this._computeContainerWidth(elementsToPosition),
                    'margin-left': 'auto',
                    'margin-right': 'auto'
                });
            }

            // Reverse the array for animation sequencing if desired, or just process.
            // The original code reverses, so we'll maintain that for functional similarity.
            elementsToPosition.reverse();

            const animationSpeedMs = this.configOptions.transitionOptions.stepDelay;
            const animationDurationMs = this.configOptions.transitionOptions.animationDuration;
            const queueAnimations = this.configOptions.transitionOptions.queueAnimations;
            const enableAnimation = this.configOptions.enableTransitions;
            const onAnimationComplete = this.configOptions.transitionOptions.onComplete;

            let animationIndex = 0;      // Counter for queued animations
            let completedAnimations = 0; // Counter for finished animations

            if (!elementsToPosition || elementsToPosition.length === 0) {
                onAnimationComplete.call(this, elementsToPosition); // Call complete callback immediately
                return;
            }

            elementsToPosition.forEach(itemLayoutData => {
                const $itemElement = itemLayoutData.$el;
                const currentLeft = $itemElement.position().left;
                const currentTop = $itemElement.position().top;

                $itemElement.attr('data-final-y', itemLayoutData.y).attr('data-final-x', itemLayoutData.x);

                // Check if position actually needs to change to avoid unnecessary animation/CSS application
                const positionChanged = (currentLeft !== itemLayoutData.x || currentTop !== itemLayoutData.y);

                if (enableAnimation && positionChanged) {
                    const animationDelay = queueAnimations ? animationIndex * animationSpeedMs : 0;

                    setTimeout(() => {
                        $itemElement.css({
                            'display': 'block',
                            'width': itemLayoutData.width,
                            'height': itemLayoutData.height
                        }).animate({
                            'left': itemLayoutData.x,
                            'top': itemLayoutData.y
                        }, animationDurationMs, () => {
                            completedAnimations++;
                            // Check if all animations have completed
                            if (completedAnimations === elementsToPosition.length) {
                                onAnimationComplete.call(currentInstance, elementsToPosition);
                            }
                        });
                    }, animationDelay);
                    animationIndex++; // Increment for queued animations
                } else {
                    // No animation or position unchanged, apply CSS directly
                    $itemElement.css({
                        'display': 'block',
                        'width': itemLayoutData.width,
                        'height': itemLayoutData.height,
                        'left': itemLayoutData.x,
                        'top': itemLayoutData.y
                    });
                    completedAnimations++;
                    // Check if all items (animated or not) have been processed
                    if (completedAnimations === elementsToPosition.length) {
                        onAnimationComplete.call(this, elementsToPosition);
                    }
                }
            });
        },

        /**
         * Appends new elements to the grid.
         * @param {jQuery} newElements - jQuery collection of elements to add.
         */
        addItems: function (newElements) {
            this.isLayoutAdjusting = true;
            this._setupGridItems(newElements, 'append');
            this.isLayoutAdjusting = false;
        },

        /**
         * Prepends new elements to the grid.
         * @param {jQuery} newElements - jQuery collection of elements to add.
         */
        insertItems: function (newElements) {
            this.isLayoutAdjusting = true;
            this._setupGridItems(newElements, 'prepend');
            this.isLayoutAdjusting = false;
        },

        /**
         * Recalculates and re-applies the layout, typically on window resize.
         */
        recalculateLayout: function () {
            // Recalculate column count based on current container width
            const currentContainerWidth = this.configOptions.centerLayout ? $(window).width() : this.managedContainer.innerWidth();
            const unitSize = this.configOptions.baseItemWidth + this.configOptions.columnGap;
            const newColumnCount = Math.max(this.configOptions.minimumColumns, Math.floor(currentContainerWidth / unitSize));

            // Only trigger a full layout re-calculation if the number of columns has changed
            // or if a recalculation is explicitly needed.
            if (this.currentColumnCount !== newColumnCount || this.needsRecalculation) {
                this.isLayoutAdjusting = true;
                this.currentColumnCount = newColumnCount; // Update column count
                this._setupGridItems(this.managedContainer.find(this.configOptions.itemSelector));
                this.isLayoutAdjusting = false;
                this.needsRecalculation = false; // Reset flag
            }
        }
    };

})(jQuery);