/*
 * FlowGrid v1.03
 *
 * Provides an adaptable, multi-column, grid-based layout.
 * https://some.other.url/apps/flowgrid/
 * By Anders Pettersson with contributions from Johanna Karlsson
 *
 * Distributed under the BSD-2-Clause license.
 */

// Function for rate-limiting calls, inspired by David Walsh
// https://davidwalsh.name/javascript-debounce-function
// Adapted from a common pattern for event handling

(function ($, smartResizeKey) {
    var delayExecution = function (operation, pauseDuration, runImmediately) {
        var timerId;
        return function debouncedAction() {
            var thisArg = this,
                inputParams = arguments;

            function deferredCallback() {
                if (!runImmediately) operation.apply(thisArg, inputParams);
                timerId = null;
            };
            if (timerId) clearTimeout(timerId);
            else if (runImmediately) operation.apply(thisArg, inputParams);

            timerId = setTimeout(deferredCallback, pauseDuration || 150);
        };
    };
    jQuery.fn[smartResizeKey] = function (handler) {
        return handler ? this.bind('resize', delayExecution(handler)) : this.trigger(smartResizeKey);
    };

})(jQuery, 'smartLayoutAdjust');

// Polyfill for Object.keys if not available

if (!Object.keys) {
    Object.keys = function (targetObject) {
        var propertyNames = [],
            propertyName;
        for (propertyName in targetObject) {
            if (Object.prototype.hasOwnProperty.call(targetObject, propertyName)) {
                propertyNames.push(propertyName);
            }
        }
        return propertyNames;
    };
}

// The core FlowGrid functionality

(function ($) {

    $.FlowGrid = function (config, containerElement) {
        this.containerElement = $(containerElement);
        this._initialize(config);
    };

    $.FlowGrid.defaultSettings = {
        itemSelector: '.grid-item',
        blockBaseDimension: 50,
        minimumColumns: 1,
        spacing: 1,
        centerLayout: false,
        adjustToFillGaps: true, // will resize blocks to fit into available spaces
        adjustmentOptions: {
            resizeAnyBlock: true // allows resizing any block to fill a gap
        },
        shouldAnimate: true,
        animationConfig: {
            animationSpeedMs: 20,
            animationDurationMs: 100,
            useAnimationQueue: true,
            onAnimationComplete: function () {}
        }
    };

    $.FlowGrid.prototype = {

        _initialize: function (config) {
            var layoutInstance = this;
            this.layoutContainer = this.containerElement;
            $(this.layoutContainer).css('position', 'relative');
            this.settings = $.extend(true, {}, $.FlowGrid.defaultSettings, config);
            this.queuedItems = [];
            this._isAdjustingSize = false;
            this._needsRefresh = true;
            this.highestCoordinates = new Array();

            // Attach layout adjustment to window resize
            $(window).smartLayoutAdjust(function () {
                layoutInstance.adjustLayout();
            });

            // Set up initial item dimensions
            this._arrangeBlocks();
        },

        _arrangeBlocks: function (itemElements, placementMethod) {
            var self = this;
            this.blockIdCounter = 0;
            this.processedCount = 0;
            this.animationTracker = 0;
            this.overallHeight = 0;
            this.currentTotalWidth = 0;
            this.allBlocks = this.layoutContainer.find(this.settings.itemSelector);
            this.positionMatrix = {};
            this.layoutGrid = new Object;

            var effectiveWidth = !this.settings.centerLayout ? this.layoutContainer.innerWidth() : $(window).width();

            this.numColumns = Math.max(this.settings.minimumColumns, parseInt(effectiveWidth / (this.settings.blockBaseDimension + this.settings.spacing)) + 1);

            // Determine block styles
            var blockBaseDimension = this.settings.blockBaseDimension;
            var spacing = this.settings.spacing;
            var displayStyle = "block";

            itemElements = this.layoutContainer.find(this.settings.itemSelector);

            $.each(itemElements, function () {

                var sizeDescriptor = parseInt($(this).attr('class').replace(/^.*size([0-9]+).*$/, '$1')).toString().split('');
                var widthMultiplier = (sizeDescriptor[0] == "N") ? 1 : parseFloat(sizeDescriptor[0]);
                var heightMultiplier = (sizeDescriptor[1] == "a") ? 1 : parseFloat(sizeDescriptor[1]);

                var itemCalculatedWidth = blockBaseDimension * widthMultiplier + spacing * (widthMultiplier - 1);
                var itemCalculatedHeight = blockBaseDimension * heightMultiplier + spacing * (heightMultiplier - 1);

                $(this).css({
                    'display': displayStyle,
                    'position': 'absolute',
                    'width': itemCalculatedWidth,
                    'height': itemCalculatedHeight,
                    'top': $(this).position().top,
                    'left': $(this).position().left
                }).removeClass('flowgrid-moved').attr('data-grid-item-id', self.blockIdCounter).attr('data-item-width', itemCalculatedWidth);

                self.blockIdCounter++;

                // Place item in grid
                self._placeInGrid($(this), placementMethod);

            });

            // After processing all items, position them
            if (self.processedCount == self.allBlocks.length) {

                // If gap filling is enabled
                if (self.settings.adjustToFillGaps) {
                    self.queuedItems = self._optimizeLayout();
                }
                self._animateAndPosition(self.queuedItems);
                // Clear the item queue
                self.queuedItems = [];
            }
        },

        _createMatrixRow: function (yCoord) {
            if (this.positionMatrix[yCoord]) {
                return false;
            } else this.positionMatrix[yCoord] = {};

            for (var c = 0; c < (this.numColumns - 1); c++) {
                var xCoord = c * (this.settings.blockBaseDimension + this.settings.spacing);
                this.positionMatrix[yCoord][xCoord] = 'false';
            }
        },

        _markOccupiedCells: function (itemData) {
            var itemTop = parseInt(itemData['y']);
            var itemLeft = parseInt(itemData['x']);
            for (var h = 0; h < itemData['height']; h += (this.settings.blockBaseDimension + this.settings.spacing)) {
                for (var w = 0; w < itemData['width']; w += (this.settings.blockBaseDimension + this.settings.spacing)) {
                    var currentX = itemLeft + w;
                    var currentY = itemTop + h;
                    if (!this.positionMatrix[currentY]) {
                        this._createMatrixRow(currentY);
                    }
                    this.positionMatrix[currentY][currentX] = 'true';
                }
            }
        },

        _getOwnPropertyCount: function (targetObj) { // Helper to get the number of own properties
            var count = 0;
            $.each(targetObj, function (prop, val) {
                count++;
            });
            return count;
        },


        _optimizeLayout: function () {
            var self = this;
            var gapBox = {};

            $.each(this.queuedItems, function (idx, itemData) {
                self._markOccupiedCells(itemData);
            });

            var sortedItems = this.queuedItems;
            sortedItems.sort(function (a, b) {
                return a.y - b.y;
            });
            sortedItems.reverse();

            // Keep track of the highest Y coordinate encountered
            var highestYCoordinate = sortedItems[0]['y'];

            // Current Y position with any offset
            var currentAbsoluteY = 0;

            // Number of rows remaining in the matrix
            var remainingMatrixRows = this._getOwnPropertyCount(this.positionMatrix);

            $.each(this.positionMatrix, function (yCoord, rowData) {
                remainingMatrixRows--;
                currentAbsoluteY = parseInt(yCoord);
                $.each(rowData, function (xCoord, cellStatus) {

                    if (cellStatus === 'false' && currentAbsoluteY < highestYCoordinate) {
                        if (!gapBox.y) gapBox.y = yCoord;
                        if (!gapBox.x) gapBox.x = xCoord;
                        if (!gapBox.gapWidth) gapBox.gapWidth = 0;
                        if (!gapBox.gapHeight) gapBox.gapHeight = self.settings.blockBaseDimension;
                        gapBox.gapWidth += (gapBox.gapWidth) ? (self.settings.blockBaseDimension + self.settings.spacing) : self.settings.blockBaseDimension;

                        var additionalHeight = 0;
                        for (var r = 1; r < remainingMatrixRows; r++) {
                            var checkY = parseInt(yCoord) + parseInt(r * (self.settings.blockBaseDimension + self.settings.spacing));
                            if (self.positionMatrix[checkY] && self.positionMatrix[checkY][xCoord] == 'false') {
                                additionalHeight += (self.settings.blockBaseDimension + self.settings.spacing);
                                self.positionMatrix[checkY][xCoord] = 'true';
                            } else break;
                        }

                        gapBox.gapHeight + (parseInt(additionalHeight) / (self.settings.blockBaseDimension + self.settings.spacing) == remainingMatrixRows) ? 0 : parseInt(additionalHeight);
                        gapBox.isReadyForPlacement = true;

                    } else if (gapBox.isReadyForPlacement) {

                        $.each(sortedItems, function (idx, itemData) {
                            if (gapBox.y <= sortedItems[idx]['y'] && (self.settings.adjustmentOptions.resizeAnyBlock || gapBox.gapWidth <= sortedItems[idx]['width'] && gapBox.gapHeight <= sortedItems[idx]['height'])) {
                                sortedItems.splice(idx, 1);
                                $(itemData['$el']).addClass('flowgrid-moved');
                                self.queuedItems.push({
                                    $el: $(itemData['$el']),
                                    x: parseInt(gapBox.x),
                                    y: parseInt(gapBox.y),
                                    itemIndex: idx,
                                    width: parseInt(gapBox.gapWidth),
                                    height: parseInt(gapBox.gapHeight)
                                });

                                return false;
                            }
                        });
                        gapBox = {};
                    }
                });

            });

            self.queuedItems = sortedItems;
            return self.queuedItems;

        },

        _placeInGrid: function ($itemElement, placementMethod) {

            this.processedCount++;
            var yPosition, gridY = yPosition = 0;
            var totalProcessed = 0;
            var direction = !placementMethod ? "append" : "prepend";

            // Get item dimensions
            var itemRenderWidth = $itemElement.width();
            var itemRenderHeight = $itemElement.height();

            // Calculate grid rows and columns needed for this item
            var colsNeeded = Math.ceil(itemRenderWidth / (this.settings.blockBaseDimension + this.settings.spacing));
            var rowsNeeded = Math.ceil(itemRenderHeight / (this.settings.blockBaseDimension + this.settings.spacing));

            // Adjust minimum columns if this item is wider
            if (colsNeeded > this.settings.minimumColumns) {
                this.settings.minimumColumns = colsNeeded;
            }

            while (true) {

                for (var y = colsNeeded; y >= 0; y--) {
                    if (this.layoutGrid[gridY + y]) break;
                    this.layoutGrid[gridY + y] = new Object;
                    for (var x = 0; x < this.numColumns; x++) {
                        this.layoutGrid[gridY + y][x] = false;
                    }
                }

                for (var currentColumnIndex = 0; currentColumnIndex < (this.numColumns - colsNeeded); currentColumnIndex++) {

                    // Add a default empty matrix row for calculation
                    var matrixYCoordinate = gridY * (this.settings.blockBaseDimension + this.settings.spacing);
                    this._createMatrixRow(matrixYCoordinate);

                    var canFit = true;

                    for (var r = 0; r < rowsNeeded; r++) {
                        for (var c = 0; c < colsNeeded; c++) {

                            if (!this.layoutGrid[gridY + r]) {
                                break;
                            }

                            if (this.layoutGrid[gridY + r][currentColumnIndex + c]) {
                                canFit = false;
                                break;
                            }
                        }
                        if (!canFit) {
                            break;
                        }
                    }
                    if (canFit) {
                        // Mark grid cells as occupied
                        for (var r = 0; r < rowsNeeded; r++) {
                            for (var c = 0; c < colsNeeded; c++) {

                                if (!this.layoutGrid[gridY + r]) {
                                    break;
                                }
                                this.layoutGrid[gridY + r][currentColumnIndex + c] = true;
                            }
                        }

                        // Add item to the rendering queue
                        this._addItemToQueue($itemElement, currentColumnIndex * (this.settings.blockBaseDimension + this.settings.spacing), gridY * (this.settings.blockBaseDimension + this.settings.spacing), itemRenderWidth, itemRenderHeight, colsNeeded, rowsNeeded, direction);
                        return;
                    }
                }
                gridY++;
            }
        },

        _addItemToQueue: function ($element, xPos, yPos, itemW, itemH, itemCols, itemRows, addMethod) {

            if (addMethod == "prepend") {
                this.queuedItems.unshift({
                    $el: $element,
                    x: xPos,
                    y: yPos,
                    width: itemW,
                    height: itemH,
                    cols: itemCols,
                    rows: itemRows
                });
            } else {
                this.queuedItems.push({
                    $el: $element,
                    x: xPos,
                    y: yPos,
                    width: itemW,
                    height: itemH,
                    cols: itemCols,
                    rows: itemRows
                });
            }
        },

        _calculateContainerHeight: function (itemLayoutData) {
            var self = this;
            $.each(itemLayoutData, function (idx, dataEntry) {
                // Determine overall height
                var itemBottom = (dataEntry['y'] + dataEntry['height']);
                if (itemBottom > self.overallHeight) {
                    self.overallHeight = itemBottom;
                }
            });
            return self.overallHeight;
        },

        _calculateContainerWidth: function (itemLayoutData) {
            var self = this;
            $.each(itemLayoutData, function (idx, dataEntry) {
                // Determine overall width
                var itemRight = (dataEntry['x'] + dataEntry['width']);
                if (itemRight > self.currentTotalWidth) {
                    self.currentTotalWidth = itemRight;
                }
            });
            return self.currentTotalWidth;
        },

        _animateAndPosition: function (itemLayoutData) {
            var self = this;

            // Set container dimensions
            this.layoutContainer.css('height', this._calculateContainerHeight(itemLayoutData));
            if (this.settings.centerLayout) {
                this.layoutContainer.css({'width' : this._calculateContainerWidth(itemLayoutData), 'margin-left' : 'auto', 'margin-right' : 'auto'});
            }

            itemLayoutData.reverse();
            var animationSpeedMs = this.settings.animationConfig.animationSpeedMs;
            var animationEffectType = this.settings.animationConfig.animationEffectType; // Not used in original, but kept for extensibility
            var animationDurationMs = this.settings.animationConfig.animationDurationMs;
            var useAnimationQueue = this.settings.animationConfig.useAnimationQueue;
            var shouldAnimate = this.settings.shouldAnimate;
            var onAnimationComplete = this.settings.animationConfig.onAnimationComplete;
            var currentLayoutItem = this;
            var animationIndex = 0;
            var completedAnimations = 0;

            $.each(itemLayoutData, function (idx, value) {

                var currentLeftPos = $(value['$el']).position().left;
                var currentTopPos = $(value['$el']).position().top;
                var currentBlockWidth = $(value['$el']).width();
                var currentBlockHeight = $(value['$el']).width();

                value['$el'].attr('data-initial-y', currentTopPos).attr('data-initial-x', currentLeftPos);
                
                // If animation is enabled and queued
                if (shouldAnimate && useAnimationQueue && (currentLeftPos != value['x'] || currentTopPos != value['y'])) {
                    setTimeout(function () {
                        value['$el'].css({
                            'display': 'block',
                            'width': value['width'],
                            'height': value['height']
                        }).animate({
                            'left': value['x'],
                            'top': value['y']
                        }, animationDurationMs);
                        completedAnimations++;
                        if (completedAnimations == animationIndex) {
                            onAnimationComplete.call(undefined, itemLayoutData)
                        }
                    }, animationIndex * animationSpeedMs);
                    animationIndex++;
                }

                // If animation is enabled but not queued
                if (shouldAnimate && !useAnimationQueue && (currentLeftPos != value['x'] || currentTopPos != value['y'])) {
                    setTimeout(function () {
                        value['$el'].css({
                            'display': 'block',
                            'width': value['width'],
                            'height': value['height']
                        }).animate({
                            'left': value['x'],
                            'top': value['y']
                        }, animationDurationMs);
                        completedAnimations++;
                        if (completedAnimations == animationIndex) {
                            onAnimationComplete.call(undefined, itemLayoutData)
                        }
                    }, animationIndex);
                    animationIndex++;
                }

                // If no animation is desired
                if (!shouldAnimate && (currentLeftPos != value['x'] || currentTopPos != value['y'])) {
                    value['$el'].css({
                        'display': 'block',
                        'width': value['width'],
                        'height': value['height'],
                        'left': value['x'],
                        'top': value['y']
                    });
                    completedAnimations++;
                    if (completedAnimations == animationIndex) {
                        onAnimationComplete.call(undefined, itemLayoutData)
                    }
                }
            });
            if (animationIndex == 0) {
                onAnimationComplete.call(undefined, itemLayoutData)
            }
        },

        addItemsToEnd: function (newElements) {
            this._isAdjustingSize = true;
            this._arrangeBlocks(newElements, 'append');
            this._isAdjustingSize = false;
        },

        addItemsToBeginning: function (newElements) {
            this._isAdjustingSize = true;
            this._arrangeBlocks(newElements, 'prepend');
            this._isAdjustingSize = false;
        },

        adjustLayout: function (elementsToAdjust) {
            if (Object.keys(this.positionMatrix[0]).length % parseInt(this.containerElement.width() / (this.settings.blockBaseDimension + this.settings.spacing)) > 0) {
                this._isAdjustingSize = true;
                this._arrangeBlocks(this.layoutContainer.find(this.settings.itemSelector));
            }