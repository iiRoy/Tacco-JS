/**
 * GridComposer v1.0 - A utility for arranging visual components
 * of varying dimensions to optimize space utilization.
 * Developed by J. Mayes in 2014. A contribution to the developer community.
 * www.jasonmayes.com
 * Please retain this attribution if you use this code. Thank you. :-)
 * For questions or feedback, reach out here:
 * https://plus.google.com/u/0/+JasonMayes/posts
 * Updates will be published on:
 * http://www.jasonmayes.com/projects/contentPlacer/
 * Or visit the project's repository:
 * https://github.com/jasonmayes/Smart-Content-Placer
 * @constructor
 * @param {string|HTMLElement} displayArea The DOM element ID or actual HTMLElement
 *     where the arranged items will be shown.
 * @param {number} baseUnit The base measurement for both width and height
 *     of the smallest grid cell. All other items are integer multiples of this base.
 *     For instance, if your smallest item is 100x100 pixels, other items might be
 *     200x300 pixels (2x3 units).
 * @param {number} spacing The gap (in pixels) that will separate each item.
 * @param {Array<LayoutItemDetails>} itemDetails An array of objects
 *     (e.g., LayoutItemDetails) describing the content to be laid out.
 * @param {number} [fadeInInterval] Optional delay in milliseconds for each item's fade-in animation.
 */
var GridComposer = function(displayArea, baseUnit, spacing, itemDetails, fadeInInterval) {
  // Determine the display target, whether it's a string ID or an element reference.
  (typeof displayArea === 'string') ?
      this.displayArea = document.getElementById(displayArea) : this.displayArea = displayArea;
  this.baseUnit = baseUnit;
  this.spacing = spacing;
  this.items = itemDetails;
  this.totalRows = 1; // Initial row count for the grid.
  this.initialized = false; // Flag to track if the initial layout has occurred.
  this.widestBlock = 1; // Stores the widest single item to determine minimum column count.

  // Properties related to visual presentation and animation.
  this.fadeInInterval = fadeInInterval;
  this.animationStep = 0; // Current step in the fade-in sequence.
  this.cachedElements = []; // Stores references to created DOM elements.

  // Pre-calculate grid dimensions based on initial conditions.
  this.determineWidestBlock_(); // Find the largest item's width.
  this.computeGridColumns_(); // Calculate the initial number of columns.

  // Define a function to handle window resizing events.
  var resizeObserver = function() {
    // Only re-layout if there are items to arrange.
    if (this.items.length > 0) {
      // Calculate new column count based on current container width.
      var updatedCols = Math.max(Math.floor(this.displayArea.offsetWidth / (this.baseUnit +
          this.spacing)), this.widestBlock);
      // If column count has changed, reset rows and redraw.
      if (updatedCols !== this.gridColumns) {
        this.totalRows = 1; // Reset row count for a fresh layout.
        this.gridColumns = updatedCols;
        this.drawLayout_(); // Re-render the entire layout.
      }
    }
  };
  // Bind the observer to the current instance to maintain context.
  var boundObserver = resizeObserver.bind(this);
  // Attach the resize event listener to the window.
  this.attachEventListener_(window, 'resize', boundObserver);
  // Perform the initial drawing of the layout.
  this.drawLayout_();
};


/**
 * @private
 * Calculates the appropriate number of columns for the grid based on
 * the display area's width and the base unit size.
 */
GridComposer.prototype.computeGridColumns_ = function() {
  this.gridColumns = Math.max(Math.floor(this.displayArea.offsetWidth / (this.baseUnit +
      this.spacing)), this.widestBlock);
};


/**
 * @private
 * Iterates through the provided item data to find the maximum width
 * of any individual item, expressed in base units.
 */
GridComposer.prototype.determineWidestBlock_ = function() {
  var idx = this.items.length;
  while (idx--) {
    // Update widestBlock if the current item is wider.
    if (this.items[idx].width > this.widestBlock) {
      this.widestBlock = this.items[idx].width;
    }
  }
};


/**
 * @private
 * Generates a 2D array (matrix) initialized with a specific value.
 * This matrix represents the grid layout where items will be placed.
 * @param {number} rowCount The number of rows for the matrix.
 * @param {number} colCount The number of columns for the matrix.
 * @param {*} initialValue The value to initialize each cell of the matrix with.
 * @returns {Array<Array<*>>} The newly created matrix.
 */
GridComposer.prototype.createGridMatrix_ = function(rowCount, colCount, initialValue) {
  var gridArray = [];
  for (var currRow = 0; currRow < rowCount; currRow++) {
    var columnData = [];
    for (var currCol = 0; currCol < colCount; currCol++) {
      columnData.push(initialValue);
    }
    gridArray.push(columnData);
  }
  return gridArray;
};


/**
 * @private
 * Expands an existing grid matrix by adding more rows, initialized with a given value.
 * This is used when the current grid is too small to place an item.
 * @param {Array<Array<*>>} existingGrid The grid matrix to expand.
 * @param {number} additionalRows The number of new rows to add.
 * @param {*} initialValue The value to initialize the new cells with.
 * @returns {Array<Array<*>>} The expanded grid matrix.
 */
GridComposer.prototype.expandGridMatrix_ = function(existingGrid, additionalRows, initialValue) {
  for (var currRow = 0; currRow < additionalRows; currRow++) {
    var columnData = [];
    for (var currCol = 0; currCol < this.gridColumns; currCol++) {
      columnData.push(initialValue);
    }
    existingGrid.push(columnData);
  }
  return existingGrid;
};


/**
 * Attaches an event listener to a DOM element in a cross-browser compatible manner.
 * @param {HTMLElement|Window} targetElement The element to attach the listener to.
 * @param {string} eventKind The type of event (e.g., 'resize', 'click').
 * @param {function} callbackFn The function to execute when the event fires.
 */
GridComposer.prototype.attachEventListener_ = function(targetElement, eventKind, callbackFn) {
  if (targetElement.addEventListener) {
    targetElement.addEventListener(eventKind, callbackFn, false);
  } else if (targetElement.attachEvent) {
    targetElement.attachEvent('on' + eventKind, callbackFn);
  }
};


/**
 * @private
 * Determines the optimal top and left coordinates for placing a new item
 * within the layout grid, considering its dimensions.
 * @param {Array<Array<number>>} layoutGrid The current state of the grid matrix (0 for empty, 1 for occupied).
 * @param {number} blockWidth The width of the item (in base units).
 * @param {number} blockHeight The height of the item (in base units).
 * @returns {Object|null} An object with 'top' and 'left' pixel coordinates, or null if no space found.
 */
GridComposer.prototype.calculatePlacementCoordinates_ = function(layoutGrid, blockWidth,
    blockHeight) {
  var coordY = 0;
  var coordX = 0;
  var currCol = 0;
  var currRow = 0;
  var gridCols = layoutGrid[currCol].length;
  var gridRows = layoutGrid.length;
  var positionFound = false;

  // Debugging helper: prints the current state of the grid.
  function debugPrintGrid(gridArr) {
    var gridString = '';
    var numGridCols = gridArr[0].length;
    var numGridRows = gridArr.length;
    var innerIdx = 0;
    while (innerIdx < numGridRows) {
      var outerIdx = 0;
      while (outerIdx < numGridCols) {
        gridString += gridArr[innerIdx][outerIdx];
        outerIdx++;
      }
      gridString += '\n';
      innerIdx++;
    }
    console.log(gridString);
  }

  // Update the stored widest block if the current item is larger.
  if (blockWidth > this.widestBlock) {
    this.widestBlock = blockWidth;
  }

  // Iterate through the grid to find an empty spot.
  while (currRow < gridRows) {
    currCol = 0;
    while (currCol < gridCols) {
      // Check if the current cell is empty.
      if (layoutGrid[currRow][currCol] === 0) {
        // Assume space is available until proven otherwise.
        var spaceAvailable = true;
        // First, check if the item fits within grid boundaries.
        if ((currCol + blockWidth - 1) >= gridCols) {
          spaceAvailable = false;
        }
        if ((currRow + blockHeight - 1) >= gridRows) {
          spaceAvailable = false;
        }
        // If within bounds, check if all required cells are free.
        if (spaceAvailable) {
          var outerIdx = 0;
          while (outerIdx < blockWidth) {
            var innerIdx = 0;
            while (innerIdx < blockHeight) {
              if (layoutGrid[currRow + innerIdx][currCol + outerIdx] !== 0) {
                spaceAvailable = false; // Found an occupied cell.
                break;
              }
              innerIdx++;
            }
            if (!spaceAvailable) {
              break; // No need to check further columns if a block is found.
            }
            outerIdx++;
          }
        }
        // If a suitable empty space is found.
        if (spaceAvailable) {
          positionFound = true;
          coordX = (currCol * (this.baseUnit + this.spacing));
          coordY = (currRow * (this.baseUnit + this.spacing));
          // Update the total number of rows if this item extends further down.
          if ((currRow + blockHeight) > this.totalRows) {
            this.totalRows = currRow + blockHeight;
          }
          // Mark the occupied cells in the grid.
          var outerIdx = 0;
          while (outerIdx < blockWidth) {
            var innerIdx = 0;
            while (innerIdx < blockHeight) {
              layoutGrid[currRow + innerIdx][currCol + outerIdx] = 1;
              innerIdx++;
            }
            outerIdx++;
          }
          // Debug: Uncomment to visualize grid state changes.
          // debugPrintGrid(layoutGrid);
          break; // Exit inner loop, position found.
        }
      }
      currCol++;
    }
    if (positionFound) {
      break; // Exit outer loop, position found.
    }
    currRow++;
  }
  if (positionFound) {
    return {"top": coordY, "left": coordX};
  } else {
    // If no space was found, expand the grid and try again.
    // We expand by half the current row count to ensure progress.
    this.expandGridMatrix_(layoutGrid, Math.ceil(layoutGrid.length / 2), 0);
    return this.calculatePlacementCoordinates_(layoutGrid, blockWidth, blockHeight);
  }
};


/**
 * @private
 * Renders or re-renders all items within the display area.
 * This method handles both initial creation and subsequent repositioning.
 */
GridComposer.prototype.drawLayout_ = function() {
  var itemData = this.items;
  // Initialize a fresh grid matrix for layout calculation.
  var layoutGrid = this.createGridMatrix_(this.totalRows, this.gridColumns, 0);
  var blockDimension = this.baseUnit;

  // This block handles the initial creation of elements.
  if (!this.initialized) {
    var documentFragment = document.createDocumentFragment();

    // Helper function for staggered fade-in animation.
    function animatedDisplayStep() {
      if (this.fadeInInterval !== undefined) {
        // Add transition class for smooth animation.
        this.cachedElements[this.animationStep].setAttribute('class',
          'layoutItem transitionEffect');
      } else {
        // No transition if no delay is specified.
        this.cachedElements[this.animationStep].setAttribute('class',
          'layoutItem');
      }
      this.animationStep++; // Move to the next item.
      if (this.animationStep < this.cachedElements.length) {
        // Schedule the next item's animation.
        setTimeout(animatedDisplayStep.bind(this), this.fadeInInterval);
      }
    }

    var itemIndex = 0;
    while (itemIndex < itemData.length) {
      // Calculate the position for the current item.
      var itemPosition = this.calculatePlacementCoordinates_(layoutGrid, itemData[itemIndex].width,
          itemData[itemIndex].height);

      // Create and style the new item's DIV element.
      var itemDiv = document.createElement('div');
      itemDiv.className = 'layoutItem';
      if (this.fadeInInterval !== undefined) {
        itemDiv.className += ' hiddenItem transitionEffect';
      }
      itemDiv.style.width = ((itemData[itemIndex].width * blockDimension) + ((itemData[itemIndex].width - 1) *
          this.spacing)) + 'px';
      itemDiv.style.height = ((itemData[itemIndex].height * blockDimension) + ((itemData[itemIndex].height - 1) *
          this.spacing)) + 'px';
      itemDiv.style.top = itemPosition.top + 'px';
      itemDiv.style.left = itemPosition.left + 'px';
      itemDiv.innerHTML = itemData[itemIndex].content; // Insert actual content.
      documentFragment.appendChild(itemDiv); // Add to fragment for performance.
      itemIndex++;
    }

    // Calculate the final height of the layout based on placed items.
    var finalHeight = ((this.totalRows * blockDimension) + ((this.totalRows - 1) *
        this.spacing));

    // Create a container for all items and append the fragment.
    var layoutContainer = document.createElement('div');
    layoutContainer.className = 'layoutWrapper';
    layoutContainer.style.height = finalHeight + 'px';
    layoutContainer.appendChild(documentFragment);

    // Append the main container to the display area.
    this.displayArea.appendChild(layoutContainer);

    // Adjust the display area's dimensions.
    this.displayArea.style.height = finalHeight + 'px';
    this.displayArea.style.minWidth = ((blockDimension + this.spacing) *
        this.widestBlock) + 'px';

    // Cache all the newly created item elements.
    this.cachedElements = document.getElementsByClassName('layoutItem');

    // If an animation delay is set, initiate the fade-in sequence.
    if (this.fadeInInterval !== undefined) {
      this.animationStep = 0; // Reset animation counter.
      setTimeout(animatedDisplayStep.bind(this), 5); // Start animation shortly after DOM update.
    }
    this.initialized = true; // Mark as initialized.
  } else {
    // This block handles repositioning of existing elements during a re-layout.
    var itemIndex = 0;
    while (itemIndex < itemData.length) {
      var itemPosition = this.calculatePlacementCoordinates_(layoutGrid, itemData[itemIndex].width,
          itemData[itemIndex].height);
      // Update element styles directly.
      this.cachedElements[itemIndex].style.top = itemPosition.top + 'px';
      this.cachedElements[itemIndex].style.left = itemPosition.left + 'px';
      this.cachedElements[itemIndex].style.width = ((itemData[itemIndex].width * blockDimension) +
          ((itemData[itemIndex].width - 1) * this.spacing)) + 'px';
      this.cachedElements[itemIndex].style.height = ((itemData[itemIndex].height * blockDimension) +
          ((itemData[itemIndex].height - 1) * this.spacing)) + 'px';
      itemIndex++;
    }

    // Update the height of the main containers.
    var finalHeight = ((this.totalRows * blockDimension) + ((this.totalRows - 1) *
        this.spacing));
    this.displayArea.style.height = finalHeight + 'px';
    this.displayArea.children.item(0).style.height = finalHeight + 'px';
  }
};

// --- Public API methods to modify the layout after instantiation ---

/**
 * Updates the spacing between items and triggers a re-layout.
 * @param {number} newSpacingPx The new margin size in pixels.
 */
GridComposer.prototype.adjustSpacing = function(newSpacingPx) {
  this.spacing = newSpacingPx;
  // Recalculate columns due to spacing change.
  this.gridColumns = Math.max(Math.floor(this.displayArea.offsetWidth / (this.baseUnit +
      this.spacing)), this.widestBlock);
  this.drawLayout_(); // Redraw with new spacing.
};


/**
 * Sets a new base unit size for all items and re-renders the layout.
 * @param {number} newBaseDimension The new base unit size in pixels.
 */
GridComposer.prototype.setBaseDimension = function(newBaseDimension) {
  this.baseUnit = newBaseDimension;
  // Recalculate columns due to unit size change.
  this.gridColumns = Math.max(Math.floor(this.displayArea.offsetWidth / (this.baseUnit +
      this.spacing)), this.widestBlock);
  this.drawLayout_(); // Redraw with new base dimension.
};


/**
 * Replaces the current set of layout items with a completely new array of data.
 * @param {Array<object>} newDataArray An array of objects describing the new content.
 */
GridComposer.prototype.assignNewData = function(newDataArray) {
  this.items = newDataArray;
  this.determineWidestBlock_(); // Re-evaluate widest block.
  this.computeGridColumns_(); // Re-compute columns.
  this.displayArea.innerHTML = ''; // Clear existing content.
  this.initialized = false; // Reset initialization status.
  this.drawLayout_(); // Perform a full re-render.
};


/**
 * Adds new items to the existing layout data. The new items are appended.
 * @param {Array<object>} additionalDataArray An array of objects describing content to add.
 */
GridComposer.prototype.appendMoreData = function(additionalDataArray) {
  this.items = this.items.concat(additionalDataArray); // Combine data arrays.
  this.determineWidestBlock_(); // Re-evaluate widest block.
  this.computeGridColumns_(); // Re-compute columns.
  this.displayArea.innerHTML = ''; // Clear existing content.
  this.initialized = false; // Reset initialization status.
  this.drawLayout_(); // Perform a full re-render.
};


/**
 * Adjusts the delay for item fade-in animations.
 * @param {number} newDelayMs The new delay in milliseconds.
 */
GridComposer.prototype.setAnimationDelay = function(newDelayMs) {
  this.fadeInInterval = newDelayMs;
};