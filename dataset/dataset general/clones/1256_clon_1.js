/*
 * ContentPlacer v10.0 - This is a small, versatile JavaScript utility class
 * designed to intelligently arrange various content blocks (of different
 * widths and heights) within a specified container. Its primary goal is
 * to minimize unsightly whitespace, thereby creating a more compact
 * and aesthetically pleasing layout.
 *
 * This code was meticulously crafted by Jason Mayes in 2014, offered as
 * a gift to the global developer community.
 *
 * For more of Jason's work, please visit: www.jasonmayes.com
 *
 * IMPORTANT NOTE: If you integrate this code into your projects,
 * kindly retain this introductory disclaimer. Your understanding
 * and cooperation are greatly appreciated! Thank you. :-)
 *
 * For any questions, feedback, or general discussions regarding this
 * ContentPlacer, please reach out via:
 * https://plus.google.com/u/0/+JasonMayes/posts
 *
 * Future updates and enhancements to this tool will be published on:
 * http://www.jasonmayes.com/projects/contentPlacer/
 *
 * Alternatively, you can explore the project's source code and contribute
 * on GitHub:
 * https://github.com/jasonmayes/Smart-Content-Placer
 *
 * @constructor
 * @param {String|HTMLElement} target The DOM element ID (as a string) or
 *     the direct HTMLElement object itself, into which we intend to render
 *     the content. This is the main container.
 * @param {Number} unitSize This crucial parameter defines the base
 *     measurement for both the width and height of the smallest possible
 *     content unit (conceptually, a square). All other content elements
 *     are expected to be precise whole number multiples of this `unitSize`.
 *     For instance, if `unitSize` is 100px (meaning 100x100px is the smallest
 *     block), then other elements should adhere to dimensions like 200px x 300px
 *     (which translates to 2 units wide by 3 units high).
 * @param {Number} margin The consistent margin (in pixels) that will be
 *     applied around each individual content element. This creates visual
 *     separation.
 * @param {Array<ContentPlacerData>} dataArray An array containing a collection
 *     of `ContentPlacerData` objects. Each object in this array represents
 *     a piece of content that the system will attempt to arrange.
 * @param {Number} renderDelay Optional parameter. If provided, it specifies
 *     a delay (in milliseconds) for a staggered fade-in effect for each
 *     content item as it is rendered. If omitted, items appear instantly.
 */
var ContentPlacer = function(target, unitSize, margin, dataArray, renderDelay) {

  // Determine the target element, accepting either a string ID or a direct HTMLElement.
  (typeof target === 'string')
    ? this.target = document.getElementById(target)
    : this.target = target;

  this.unitSize = unitSize; // Store the base unit size for calculations.
  this.margin = margin; // Store the margin value.
  this.data = dataArray; // Store the array of content data.
  this.rowsTot = 1; // Initial total number of rows. Will expand as needed.
  this.initiated = false; // Flag to track if initial rendering has occurred.
  this.largestElement = 1; // Keeps track of the widest element in terms of units.

  // Variables specifically related to animation and rendering effects.
  this.renderDelay = renderDelay; // Delay for fade-in, if specified.
  this.itteration = 0; // Counter for staggered rendering.
  this.elemCache = []; // Cache for DOM elements once they are created.

  // --- Initial setup and calculations ---
  // First, identify the largest content element to ensure minimum column count.
  this.findLargestNode_();
  // Then, calculate the initial number of columns based on target width and largest element.
  this.calculateColumns_();

  // Define the resize event handler function.
  var handler = function() {
    // Only proceed if there is data to render.
    if (this.data.length > 0) {
      // Calculate new column count based on current container width.
      var newCols = Math.max(
        Math.floor(this.target.offsetWidth / (this.unitSize + this.margin)),
        this.largestElement
      );

      // If the column count has changed due to resize, re-render.
      if (newCols != this.columns) {
        this.rowsTot = 1; // Reset row count, as layout will change.
        this.columns = newCols; // Update the column count.
        this.render_(); // Trigger a re-render of the layout.
      }
    }
  };

  // Bind the handler to the current instance of ContentPlacer.
  var boundHandler = handler.bind(this);
  // Attach the resize event listener to the window.
  this.addEventHandler_(window, 'resize', boundHandler);

  // Perform the initial rendering of the content.
  this.render_();
};


/**
 * Calculates the optimal number of columns for the layout.
 * This is a private helper method, indicated by the trailing underscore.
 *
 * @private
 */
ContentPlacer.prototype.calculateColumns_ = function() {
  // The number of columns is determined by dividing the target container's
  // width by the effective width of a single unit (unitSize + margin).
  // It's then capped at a minimum of the largest element's width to prevent
  // layout issues with wide items.
  this.columns = Math.max(
    Math.floor(this.target.offsetWidth / (this.unitSize + this.margin)),
    this.largestElement
  );
};


/**
 * Identifies the widest element among the provided data items.
 * This value is crucial for determining the minimum number of columns
 * required in the layout.
 *
 * @private
 */
ContentPlacer.prototype.findLargestNode_ = function() {
  var i = this.data.length; // Initialize loop counter with the total number of data items.

  // Iterate backwards through the data array for efficiency.
  while (i--) {
    // If the current element's width (in units) is greater than the
    // currently recorded largest element, update `largestElement`.
    if (this.data[i].width > this.largestElement) {
      this.largestElement = this.data[i].width;
    }
  }
};


/**
 * Creates a 2D matrix (array of arrays) of a specified size,
 * initialized with a given value. This matrix represents the layout grid.
 *
 * @private
 * @param {Number} numrows The desired number of rows for the matrix.
 * @param {Number} numcols The desired number of columns for the matrix.
 * @param {*} initial The initial value to populate each cell of the matrix with.
 * @returns {Array<Array<*>>} The newly created 2D matrix.
 */
ContentPlacer.prototype.matrix_ = function(numrows, numcols, initial) {
  var arr = []; // Initialize the main array (rows).

  // Loop to create each row.
  for (var y = 0; y < numrows; y++) {
    var columns = []; // Initialize the array for columns in the current row.

    // Loop to populate columns within the current row.
    for (var x = 0; x < numcols; x++) {
      columns.push(initial); // Add the initial value to the column.
    }
    arr.push(columns); // Add the completed row to the main array.
  }
  return arr; // Return the fully constructed matrix.
};


/**
 * Expands an existing 2D matrix by adding new rows.
 * Each new row will be populated with a specified initial value.
 * This is used when the layout needs more vertical space.
 *
 * @private
 * @param {Array<Array<*>>} arr The existing matrix to grow.
 * @param {Number} numrows The number of additional rows to append.
 * @param {*} initial The initial value to populate cells of the new rows with.
 * @returns {Array<Array<*>>} The expanded 2D matrix.
 */
ContentPlacer.prototype.growMatrix_ = function(arr, numrows, initial) {
  // Iterate for the specified number of new rows.
  for (var y = 0; y < numrows; y++) {
    var columns = []; // Create a new array for the columns of the current new row.

    // Populate the new row with columns, each initialized.
    for (var x = 0; x < this.columns; x++) {
      columns.push(initial);
    }
    arr.push(columns); // Add the newly created row to the matrix.
  }
  return arr; // Return the modified (grown) matrix.
};


/**
 * Attaches an event handler to a DOM element, ensuring cross-browser compatibility.
 * This is a utility function.
 *
 * @param {HTMLElement|Window} elem The DOM element or window object to attach the event to.
 * @param {String} eventType The type of event to listen for (e.g., 'click', 'resize').
 * @param {Function} handler The function to execute when the event occurs.
 */
ContentPlacer.prototype.addEventHandler_ = function(elem, eventType, handler) {
  // Modern browsers use addEventListener.
  if (elem.addEventListener) {
    elem.addEventListener(eventType, handler, false);
  }
  // Older Internet Explorer versions use attachEvent.
  else if (elem.attachEvent) {
    elem.attachEvent('on' + eventType, handler);
  }
};


/**
 * Generates the optimal top and left position for a given content item
 * within the layout grid. It attempts to find the first available
 * contiguous space that fits the item's dimensions. If no space is found,
 * it expands the matrix and tries again recursively.
 *
 * @private
 * @param {Array<Array<Number>>} dataMatrix The current layout grid matrix (0 for empty, 1 for occupied).
 * @param {Number} unitWidth The width of the content item in units.
 * @param {Number} unitHeight The height of the content item in units.
 * @returns {{top: Number, left: Number}} An object containing the calculated
 *     'top' and 'left' CSS values in pixels, or null if a spot couldn't be found
 *     (though recursion usually prevents this).
 */
ContentPlacer.prototype.generatePosition_ = function(dataMatrix, unitWidth, unitHeight) {

  var top = 0; // Initialize top position.
  var left = 0; // Initialize left position.
  var x = 0; // Current column index for scanning.
  var y = 0; // Current row index for scanning.
  var cols = dataMatrix[x].length; // Total number of columns in the matrix.
  var rows = dataMatrix.length; // Total number of rows in the matrix.
  var foundSpot = false; // Flag to indicate if a suitable spot has been located.

  /**
   * Helper function for debugging: Prints the current state of the dataMatrix
   * to the console, making it easier to visualize the layout.
   *
   * @param {Array<Array<Number>>} arr The matrix to print.
   */
  function printArray(arr) {
    var str = ''; // String accumulator for matrix representation.
    var cols = arr[0].length; // Number of columns.
    var rows = arr.length; // Number of rows.
    var k = 0; // Row iterator.
    while (k < rows) {
      var j = 0; // Column iterator.
      while (j < cols) {
        str += arr[k][j]; // Append cell value.
        j++;
      }
      str += '\n'; // Newline after each row.
      k++;
    }
    console.log(str); // Output the formatted matrix.
  }

  // Update the largestElement if the current item is wider.
  // This ensures the column calculation is always correct.
  if (unitWidth > this.largestElement) {
    this.largestElement = unitWidth;
  }

  // --- Main loop to find an available spot ---
  // Iterate through each row of the matrix.
  while (y < rows) {
    x = 0; // Reset column index for each new row.

    // Iterate through each column in the current row.
    while (x < cols) {
      // Check if the current cell (y, x) is empty (0).
      if (dataMatrix[y][x] === 0) {
        var allGood = true; // Assume the spot is suitable until proven otherwise.

        // --- Boundary checks first ---
        // Ensure the item's width doesn't exceed matrix boundaries.
        if ((x + unitWidth - 1) >= cols) {
          allGood = false;
        }
        // Ensure the item's height doesn't exceed matrix boundaries.
        if ((y + unitHeight - 1) >= rows) {
          allGood = false;
        }

        // If boundary checks pass, proceed to check individual cells.
        if (allGood) {
          var j = 0; // Column offset for item's width.
          while (j < unitWidth) {
            var k = 0; // Row offset for item's height.
            while (k < unitHeight) {
              // If any cell within the item's required space is already occupied (not 0),
              // then this spot is not suitable.
              if (dataMatrix[y + k][x + j] !== 0) {
                allGood = false; // Mark as not good.
                break; // Exit inner loop (k).
              }
              k++;
            }
            if (!allGood) {
              break; // If not good, exit outer loop (j).
            }
            j++;
          }
        }

        // If `allGood` is still true, a suitable empty spot has been found!
        if (allGood) {
          foundSpot = true; // Set flag.
          // Calculate the pixel positions based on unit size and margin.
          left = (x * (this.unitSize + this.margin));
          top = (y * (this.unitSize + this.margin));

          // Update the total number of rows if this item extends beyond current max.
          if ((y + unitHeight) > this.rowsTot) {
            this.rowsTot = y + unitHeight;
          }

          // --- Mark the occupied spaces in the dataMatrix ---
          var j = 0; // Column iterator.
          while (j < unitWidth) {
            var k = 0; // Row iterator.
            while (k < unitHeight) {
              dataMatrix[y + k][x + j] = 1; // Mark cell as occupied.
              k++;
            }
            j++;
          }
          // Debugging line (uncomment to see matrix evolution):
          // printArray(dataMatrix);
          break; // Exit inner loop (x) as spot is found and claimed.
        }
      }
      x++; // Move to the next column.
    }
    if (foundSpot) {
      break; // Exit outer loop (y) if a spot was found in this row.
    }
    y++; // Move to the next row.
  }

  // After scanning, if a spot was found, return its coordinates.
  if (foundSpot) {
    return {
      "top": top,
      "left": left
    };
  } else {
    // If no spot was found in the current matrix size, it means we need more rows.
    // Expand the matrix by roughly half its current height and try again.
    this.growMatrix_(dataMatrix, Math.ceil(dataMatrix.length / 2), 0);
    // Recursively call generatePosition_ with the expanded matrix.
    return this.generatePosition_(dataMatrix, unitWidth, unitHeight);
  }
};


/**
 * Renders or re-renders the content items within the target container.
 * This method handles both the initial placement and subsequent updates
 * due to resizing or data changes.
 *
 * @private
 */
ContentPlacer.prototype.render_ = function() {
  var data = this.data; // Get the content data array.
  // Initialize the layout matrix with current row/column counts, all cells empty (0).
  var dataMatrix = this.matrix_(this.rowsTot, this.columns, 0);
  var unitSize = this.unitSize; // Cache unit size for calculations.

  // --- Initial Rendering (first time only) ---
  if (!this.initiated) {
    var frag = document.createDocumentFragment(); // Use a document fragment for efficient DOM manipulation.

    /**
     * Inner helper function to handle staggered fade-in rendering.
     * This is called repeatedly with a delay if renderDelay is set.
     */
    function itterativeRender() {
      if (this.renderDelay !== undefined) {
        // If a delay is specified, apply 'transition' class to trigger CSS animation.
        this.elemCache[this.itteration].setAttribute('class',
          'contentPlacerElement transition');
      } else {
        // Otherwise, just apply the base class.
        this.elemCache[this.itteration].setAttribute('class',
          'contentPlacerElement');
      }
      this.itteration++; // Increment counter for the next element.
      // If there are more elements to animate, schedule the next call.
      if (this.itteration < this.elemCache.length) {
        setTimeout(itterativeRender.bind(this), this.renderDelay);
      }
    }

    var n = 0; // Iterator for the data array.
    while (n < data.length) {
      // Calculate the position for the current data item.
      var pos = this.generatePosition_(dataMatrix, data[n].width,
        data[n].height);

      var div = document.createElement('div'); // Create a new div element for the content.
      div.className = 'contentPlacerElement'; // Assign base class.

      // If renderDelay is active, add 'hidden' and 'transition' classes for initial state.
      if (this.renderDelay !== undefined) {
        div.className += ' hidden transition';
      }

      // Set the width and height of the div based on item dimensions, unit size, and margin.
      div.style.width = ((data[n].width * unitSize) + ((data[n].width - 1) *
        this.margin)) + 'px';
      div.style.height = ((data[n].height * unitSize) + ((data[n].height - 1) *
        this.margin)) + 'px';
      div.style.top = pos.top + 'px'; // Set calculated top position.
      div.style.left = pos.left + 'px'; // Set calculated left position.
      div.innerHTML = data[n].content; // Insert the content.

      frag.appendChild(div); // Add the div to the document fragment.
      n++; // Move to the next data item.
    }

    // Calculate the total required height for the container based on the final row count.
    var rHeight = ((this.rowsTot * unitSize) + ((this.rowsTot - 1) *
      this.margin));

    var container = document.createElement('div'); // Create an inner container div.
    container.className = 'contentPlacerContainer'; // Assign container class.
    container.style.height = rHeight + 'px'; // Set the container's height.
    container.appendChild(frag); // Append all content elements from the fragment to the container.

    this.target.appendChild(container); // Append the inner container to the main target element.

    // Adjust the target element's height and minimum width.
    this.target.style.height = rHeight + 'px';
    this.target.style.minWidth = ((unitSize + this.margin) *
      this.largestElement) + 'px';

    // Cache all content elements for future reference (e.g., updates, animations).
    this.elemCache = document.getElementsByClassName('contentPlacerElement');

    // If a render delay was specified, initiate the staggered fade-in animation.
    if (this.renderDelay !== undefined) {
      this.itteration = 0; // Reset animation counter.
      setTimeout(itterativeRender.bind(this), 5); // Start the first animation step with a small initial delay.
    }
    this.initiated = true; // Mark the initial rendering as complete.
  }
  // --- Subsequent Rendering (updates after resize or data changes) ---
  else {
    var n = 0; // Iterator for the data array.
    while (n < data.length) {
      // Recalculate position for each existing element.
      var pos = this.generatePosition_(dataMatrix, data[n].width,
        data[n].height);
      // Update the CSS positions of the cached DOM elements.
      this.elemCache[n].style.top = pos.top + 'px';
      this.elemCache[n].style.left = pos.left + 'px';
      // Also update width and height in case unitSize or margin changed
      this.elemCache[n].style.width = ((data[n].width * unitSize) +
        ((data[n].width - 1) * this.margin)) + 'px';
      this.elemCache[n].style.height = ((data[n].height * unitSize) +
        ((data[n].height - 1) * this.margin)) + 'px';
      n++; // Move to the next data item.
    }

    // Update the height of both the main target container and its immediate child (the contentPlacerContainer).
    var rHeight = ((this.rowsTot * unitSize) + ((this.rowsTot - 1) *
      this.margin));
    this.target.style.height = rHeight + 'px';
    this.target.children.item(0).style.height = rHeight + 'px';
  }
};

// --- Public functions to programmatically modify the ContentPlacer instance
//     after its initial creation and setup. ---

/**
 * Updates the margin size for all content elements and re-renders the layout.
 *
 * @param {Number} marginSizePx The new margin size in pixels.
 */
ContentPlacer.prototype.setMargin = function(marginSizePx) {
  this.margin = marginSizePx; // Update the internal margin property.
  // Recalculate columns based on the new margin.
  this.columns = Math.max(Math.floor(this.target.offsetWidth / (this.unitSize +
    this.margin)), this.largestElement);
  this.render_(); // Trigger a re-render to apply the changes.
};


/**
 * Updates the base unit size for all content elements and re-renders the layout.
 *
 * @param {Number} size The new unit size in pixels.
 */
ContentPlacer.prototype.setUnitSize = function(size) {
  this.unitSize = size; // Update the internal unit size property.
  // Recalculate columns based on the new unit size.
  this.columns = Math.max(Math.floor(this.target.offsetWidth / (this.unitSize +
    this.margin)), this.largestElement);
  this.render_(); // Trigger a re-render to apply the changes.
};


/**
 * Replaces the existing data set with a completely new array of content data.
 * This effectively clears the current layout and re-renders with the new data.
 *
 * @param {Array.<Object>} dataArr An array containing the new content data objects.
 */
ContentPlacer.prototype.setData = function(dataArr) {
  this.data = dataArr; // Assign the new data array.
  this.findLargestNode_(); // Recalculate largest element based on new data.
  this.calculateColumns_(); // Recalculate columns.
  this.target.innerHTML = ''; // Clear the existing DOM content in the target.
  this.initiated = false; // Reset initiated flag to force a full initial render.
  this.render_(); // Trigger a full re-render.
};


/**
 * Appends new content data to the existing data set.
 * The layout will then be re-rendered to include the new items.
 *
 * @param {Array.<Object>} dataArr An array containing content data objects to add.
 */
ContentPlacer.prototype.addData = function(dataArr) {
  this.data = this.data.concat(dataArr); // Concatenate new data with existing.
  this.findLargestNode_(); // Recalculate largest element (might have new larger items).
  this.calculateColumns_(); // Recalculate columns.
  this.target.innerHTML = ''; // Clear the existing DOM content.
  this.initiated = false; // Reset initiated flag for a full re-render.
  this.render_(); // Trigger a full re-render including new data.
};


/**
 * Sets a new transition delay for content items.
 * This change will affect subsequent renders or re-renders.
 *
 * @param {Number} delayMs The new delay in milliseconds for staggered item transitions.
 */
ContentPlacer.prototype.setDelay = function(delayMs) {
  this.renderDelay = delayMs; // Update the internal renderDelay property.
  // Note: This only takes effect on the next full render, not on already rendered items.
};