/**
 * GridArranger v1.0.0 - A utility class designed to organize content blocks
 * of varying dimensions within a container, optimizing for minimal whitespace.
 * Developed by a dedicated engineer in 2023.
 *
 * This implementation aims to provide a robust and flexible layout solution.
 *
 * @class
 * @param {string|HTMLElement} containerRef The ID string or direct HTMLElement
 *     of the DOM element where content blocks will be rendered.
 * @param {number} baseCellDim The fundamental unit of measure (in pixels) for
 *     both width and height. All content block dimensions (e.g., 2x3 units)
 *     are multiples of this base dimension.
 * @param {number} spacingPx The uniform spacing (in pixels) to be applied
 *     between adjacent content blocks.
 * @param {Array<Object>} itemSpecs An array of objects, each describing a
 *     content block. Each object must have `width` (in base units), `height`
 *     (in base units), and `content` (HTML string or HTMLElement).
 * @param {number} [fadeDurationMs] Optional. The duration (in milliseconds)
 *     for each content block to fade in sequentially during initial render.
 */
class GridArranger {
  // Define constants for grid cell states
  static GRID_CELL_EMPTY = 0;
  static GRID_CELL_OCCUPIED = 1;
  static DEFAULT_FADE_DURATION_MS = 50; // A reasonable default if not provided

  constructor(containerRef, baseCellDim, spacingPx, itemSpecs, fadeDurationMs) {
    // Input validation and initialization
    if (!containerRef) {
      console.error('GridArranger: A target container reference is required.');
      return; // Or throw an error
    }

    this.containerElement = typeof containerRef === 'string' ?
      document.getElementById(containerRef) : containerRef;

    if (!this.containerElement) {
      console.error('GridArranger: Provided container reference could not be resolved to a DOM element.');
      return; // Or throw an error
    }

    // Ensure numeric values are valid
    this.baseCellDimension = Math.max(1, baseCellDim || 100); // Minimum 1px
    this.elementSpacing = Math.max(0, spacingPx || 0); // Minimum 0px
    this.layoutItems = Array.isArray(itemSpecs) ? itemSpecs : [];
    this.fadeInDelayMs = fadeDurationMs !== undefined ? fadeDurationMs : GridArranger.DEFAULT_FADE_DURATION_MS;

    // Internal state variables for layout management
    this.totalGridRows = 1; // Tracks the current effective height of the grid in units
    this.isRenderedInitially = false; // Flag to indicate first render vs. subsequent updates
    this.maxItemWidthUnits = 1; // Stores the largest width of any item in grid units

    // Variables for animation sequence
    this.currentFadeIndex = 0;
    this.cachedElements = []; // Stores references to rendered DOM elements
    this.gridColumns = 0; // Number of columns in the grid
    this.isLayoutInProgress = false; // Guard to prevent re-entrant layout calls
    this.resizeTimeout = null; // For debouncing resize events
    this.boundResizeHandler = null; // Store bound handler for removal

    // Perform initial setup
    this.assessItemDimensions_();
    this.calculateOptimalColumns_();

    // Attach a debounced resize handler
    this.boundResizeHandler = this.createDebouncedResizeHandler_();
    this.attachDomEvent_(window, 'resize', this.boundResizeHandler);

    // Initiate the first render cycle
    this.layoutAndDisplayElements_();
  }

  /**
   * @private
   * Creates and returns a debounced resize event handler.
   * @returns {Function} The debounced resize handler.
   */
  createDebouncedResizeHandler_() {
    return () => {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout(() => {
        if (this.layoutItems.length > 0) {
          const currentContainerWidth = this.containerElement.offsetWidth;
          const potentialNewColumns = Math.max(
            Math.floor(currentContainerWidth / (this.baseCellDimension + this.elementSpacing)),
            this.maxItemWidthUnits
          );

          // Only re-render if column count has changed significantly
          if (potentialNewColumns !== this.gridColumns) {
            this.totalGridRows = 1; // Reset row count for new layout
            this.gridColumns = potentialNewColumns;
            this.layoutAndDisplayElements_();
          }
        }
      }, 150); // Debounce time
    };
  }

  /**
   * @private
   * Determines the maximum width (in grid units) among all provided layout items.
   * This helps in setting a sensible minimum column count.
   */
  assessItemDimensions_() {
    this.maxItemWidthUnits = 1; // Reset before recalculating
    for (let i = 0; i < this.layoutItems.length; i++) {
      const item = this.layoutItems[i];
      if (item && typeof item.width === 'number' && item.width > this.maxItemWidthUnits) {
        this.maxItemWidthUnits = item.width;
      }
    }
  }

  /**
   * @private
   * Calculates the optimal number of columns for the grid based on the
   * container's current width, base cell dimension, and element spacing.
   */
  calculateOptimalColumns_() {
    const availableWidth = this.containerElement.offsetWidth;
    const effectiveUnitWidth = this.baseCellDimension + this.elementSpacing;
    this.gridColumns = Math.max(
      Math.floor(availableWidth / effectiveUnitWidth),
      this.maxItemWidthUnits
    );
    // Ensure at least one column, even if container is tiny
    if (this.gridColumns < 1) {
      this.gridColumns = 1;
    }
  }

  /**
   * @private
   * Creates a 2D array (matrix) representing the grid layout, initialized
   * with a specified value (e.g., GRID_CELL_EMPTY).
   * @param {number} numRows The number of rows for the matrix.
   * @param {number} numCols The number of columns for the matrix.
   * @param {number} initialValue The value to initialize each cell with.
   * @returns {Array<Array<number>>} The initialized grid matrix.
   */
  initializeGridMatrix_(numRows, numCols, initialValue) {
    const matrix = [];
    for (let r = 0; r < numRows; r++) {
      matrix.push(new Array(numCols).fill(initialValue));
    }
    return matrix;
  }

  /**
   * @private
   * Expands an existing grid matrix by adding more rows.
   * This is used when a suitable position cannot be found within the current
   * grid dimensions, requiring the layout space to grow.
   * @param {Array<Array<number>>} currentMatrix The matrix to expand.
   * @param {number} additionalRows The number of rows to add.
   * @param {number} initialValue The value to initialize new cells with.
   * @returns {Array<Array<number>>} The expanded grid matrix.
   */
  expandGridMatrix_(currentMatrix, additionalRows, initialValue) {
    const currentCols = this.gridColumns;
    for (let r = 0; r < additionalRows; r++) {
      currentMatrix.push(new Array(currentCols).fill(initialValue));
    }
    return currentMatrix;
  }

  /**
   * @private
   * Attaches an event listener to a DOM element, providing cross-browser
   * compatibility for older browsers.
   * @param {EventTarget} element The DOM element to attach the event to.
   * @param {string} eventName The name of the event (e.g., 'resize', 'click').
   * @param {Function} handler The event handler function.
   */
  attachDomEvent_(element, eventName, handler) {
    if (element.addEventListener) {
      element.addEventListener(eventName, handler, false);
    } else if (element.attachEvent) { // IE < 9
      element.attachEvent('on' + eventName, handler);
    }
  }

  /**
   * @private
   * Attempts to find an available top-left position (x, y coordinates in grid units)
   * for a content block of a given width and height within the layout matrix.
   * If no space is found, the matrix is expanded and the search is retried.
   * @param {Array<Array<number>>} layoutGrid The current grid matrix.
   * @param {number} itemWidthUnits The width of the item in grid units.
   * @param {number} itemHeightUnits The height of the item in grid units.
   * @param {number} [recursionDepth=0] Internal counter to prevent infinite recursion.
   * @returns {{x: number, y: number}|null} The found grid coordinates, or null if placement fails.
   */
  findOptimalPosition_(layoutGrid, itemWidthUnits, itemHeightUnits, recursionDepth = 0) {
    const currentRows = layoutGrid.length;
    const currentCols = layoutGrid[0].length;

    // Guard against excessively large items that can never fit
    if (itemWidthUnits > currentCols) {
      console.warn(`GridArranger: Item width (${itemWidthUnits}) exceeds max columns (${currentCols}). Cannot place item.`);
      return null;
    }
    if (itemHeightUnits > currentRows && recursionDepth > 5) { // Heuristic limit
        console.warn(`GridArranger: Item height (${itemHeightUnits}) requires excessive grid expansion. Placement might be impossible.`);
        return null;
    }


    for (let y = 0; y < currentRows; y++) {
      for (let x = 0; x < currentCols; x++) {
        // Check if the current cell is empty and can accommodate the item
        if (layoutGrid[y][x] === GridArranger.GRID_CELL_EMPTY) {
          let canFit = true;

          // Check boundaries first
          if ((x + itemWidthUnits) > currentCols || (y + itemHeightUnits) > currentRows) {
            canFit = false;
          }

          // If within bounds, check all cells required by the item
          if (canFit) {
            for (let k = 0; k < itemHeightUnits; k++) {
              for (let j = 0; j < itemWidthUnits; j++) {
                if (layoutGrid[y + k][x + j] !== GridArranger.GRID_CELL_EMPTY) {
                  canFit = false;
                  break;
                }
              }
              if (!canFit) {
                break;
              }
            }
          }

          if (canFit) {
            // Found a spot! Mark the cells as occupied.
            for (let k = 0; k < itemHeightUnits; k++) {
              for (let j = 0; j < itemWidthUnits; j++) {
                layoutGrid[y + k][x + j] = GridArranger.GRID_CELL_OCCUPIED;
              }
            }

            // Update the total number of rows used by the grid if this item extends it
            this.totalGridRows = Math.max(this.totalGridRows, y + itemHeightUnits);

            return { x, y }; // Return grid coordinates
          }
        }
      }
    }

    // If no spot found in current matrix, expand and retry (with a recursion limit)
    if (recursionDepth < 10) { // Limit recursion to prevent stack overflow on pathological cases
      this.expandGridMatrix_(layoutGrid, Math.ceil(currentRows / 2) + 1, GridArranger.GRID_CELL_EMPTY); // Grow by ~50% + 1 row
      return this.findOptimalPosition_(layoutGrid, itemWidthUnits, itemHeightUnits, recursionDepth + 1);
    }

    console.warn('GridArranger: Failed to find a position after multiple grid expansions for an item.', { itemWidthUnits, itemHeightUnits });
    return null; // Could not place the item
  }

  /**
   * @private
   * Resets internal state related to layout and rendering, typically called
   * before a full re-render (e.g., when data changes).
   */
  _resetLayoutState() {
    this.totalGridRows = 1;
    this.isRenderedInitially = false;
    this.currentFadeIndex = 0;
    this.cachedElements = [];
    this.containerElement.innerHTML = ''; // Clear existing content
  }

  /**
   * @private
   * Calculates the pixel height of the container based on the total grid rows
   * and current spacing/cell dimensions.
   * @returns {number} The calculated height in pixels.
   */
  _calculateContainerHeight_() {
    // Correctly calculate height considering `totalGridRows` is a count of units.
    // If totalGridRows is 1, there are 0 margins between rows.
    // If totalGridRows is N, there are N-1 margins between rows.
    const heightPx = (this.totalGridRows * this.baseCellDimension) +
                     (Math.max(0, this.totalGridRows - 1) * this.elementSpacing);
    return heightPx;
  }

  /**
   * @private
   * Manages the sequential fading in of elements.
   */
  _sequentialFadeIn_() {
    if (this.currentFadeIndex < this.cachedElements.length) {
      const element = this.cachedElements[this.currentFadeIndex];
      // Ensure element exists and has the 'grid-item-hidden' class before revealing
      if (element && element.classList.contains('grid-item-hidden')) {
        element.classList.remove('grid-item-hidden');
        element.classList.add('grid-item-visible'); // Add a class for visibility
      }
      this.currentFadeIndex++;
      // Use requestAnimationFrame for smoother animation scheduling
      // or setTimeout if a fixed delay is strictly needed.
      // For sequential fade, setTimeout is more appropriate given the delay.
      setTimeout(() => this._sequentialFadeIn_(), this.fadeInDelayMs);
    }
  }


  /**
   * @private
   * Performs the main layout calculation and renders/updates the DOM elements.
   * This method handles both initial rendering and subsequent updates (e.g., on resize).
   */
  layoutAndDisplayElements_() {
    if (this.isLayoutInProgress) {
      console.warn('GridArranger: Layout already in progress. Skipping re-entrant call.');
      return;
    }
    this.isLayoutInProgress = true;

    // Initialize grid matrix for current layout cycle
    // Note: totalGridRows might increase during findOptimalPosition_
    const currentLayoutGrid = this.initializeGridMatrix_(this.totalGridRows, this.gridColumns, GridArranger.GRID_CELL_EMPTY);

    if (!this.isRenderedInitially) {
      // First render: create elements and append them
      const itemsFragment = document.createDocumentFragment();
      this.cachedElements = []; // Clear cache before populating

      this.layoutItems.forEach((item, index) => {
        const gridPos = this.findOptimalPosition_(currentLayoutGrid, item.width, item.height);

        if (!gridPos) {
          console.error(`GridArranger: Could not place item at index ${index}. Skipping.`);
          return; // Skip this item
        }

        const itemElement = document.createElement('div');
        itemElement.className = 'grid-item'; // Base class
        if (this.fadeInDelayMs > 0) {
          itemElement.classList.add('grid-item-hidden', 'grid-item-transition'); // For fade-in effect
        }

        const widthPx = (item.width * this.baseCellDimension) + ((item.width - 1) * this.elementSpacing);
        const heightPx = (item.height * this.baseCellDimension) + ((item.height - 1) * this.elementSpacing);
        const leftPx = (gridPos.x * (this.baseCellDimension + this.elementSpacing));
        const topPx = (gridPos.y * (this.baseCellDimension + this.elementSpacing));

        Object.assign(itemElement.style, {
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          top: `${topPx}px`,
          left: `${leftPx}px`,
          position: 'absolute' // Ensure items are absolutely positioned within the container
        });

        // Handle different content types
        if (typeof item.content === 'string') {
          itemElement.innerHTML = item.content;
        } else if (item.content instanceof HTMLElement) {
          itemElement.appendChild(item.content);
        } else {
          console.warn(`GridArranger: Item content for index ${index} is not a string or HTMLElement.`);
        }

        itemsFragment.appendChild(itemElement);
        this.cachedElements.push(itemElement);
      });

      // Create main layout container
      const layoutWrapper = document.createElement('div');
      layoutWrapper.className = 'grid-arranger-wrapper';
      layoutWrapper.style.position = 'relative'; // Crucial for absolute positioning of children
      layoutWrapper.style.height = `${this._calculateContainerHeight_()}px`;
      layoutWrapper.style.minWidth = `${(this.baseCellDimension + this.elementSpacing) * this.maxItemWidthUnits}px`;

      layoutWrapper.appendChild(itemsFragment);
      this.containerElement.appendChild(layoutWrapper);

      // Apply styling to the main container
      this.containerElement.style.overflow = 'hidden'; // Prevent scrollbars
      this.containerElement.style.position = 'relative'; // If not already set by user
      this.containerElement.style.height = `${this._calculateContainerHeight_()}px`; // Adjust container height

      // Trigger sequential fade-in if delay is set
      if (this.fadeInDelayMs > 0 && this.cachedElements.length > 0) {
        this.currentFadeIndex = 0;
        setTimeout(() => this._sequentialFadeIn_(), 5); // Small initial delay
      }
      this.isRenderedInitially = true;

    } else {
      // Subsequent renders: update positions and dimensions of existing elements
      this.layoutItems.forEach((item, index) => {
        const itemElement = this.cachedElements[index];
        if (!itemElement) {
          console.warn(`GridArranger: Element for item at index ${index} not found in cache during update.`);
          return;
        }

        const gridPos = this.findOptimalPosition_(currentLayoutGrid, item.width, item.height);

        if (!gridPos) {
          console.error(`GridArranger: Could not re-place item at index ${index}. Keeping old position.`);
          return;
        }

        const widthPx = (item.width * this.baseCellDimension) + ((item.width - 1) * this.elementSpacing);
        const heightPx = (item.height * this.baseCellDimension) + ((item.height - 1) * this.elementSpacing);
        const leftPx = (gridPos.x * (this.baseCellDimension + this.elementSpacing));
        const topPx = (gridPos.y * (this.baseCellDimension + this.elementSpacing));

        Object.assign(itemElement.style, {
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          top: `${topPx}px`,
          left: `${leftPx}px`
        });
      });

      // Update height of the main container and its wrapper
      const newHeightPx = this._calculateContainerHeight_();
      this.containerElement.style.height = `${newHeightPx}px`;
      const wrapper = this.containerElement.querySelector('.grid-arranger-wrapper');
      if (wrapper) {
        wrapper.style.height = `${newHeightPx}px`;
      }
    }
    this.isLayoutInProgress = false;
  }

  // --- Public API Methods for Configuration and Data Management ---

  /**
   * Updates the spacing between elements and triggers a re-layout.
   * @param {number} newSpacingPx The new margin size in pixels.
   */
  setElementSpacing(newSpacingPx) {
    this.elementSpacing = Math.max(0, newSpacingPx || 0);
    this.calculateOptimalColumns_(); // Columns might change with new spacing
    this.layoutAndDisplayElements_();
  }

  /**
   * Updates the base unit dimension and triggers a re-layout.
   * @param {number} newBaseDim The new base unit size in pixels.
   */
  setBaseUnitDimension(newBaseDim) {
    this.baseCellDimension = Math.max(1, newBaseDim || 1);
    this.calculateOptimalColumns_(); // Columns might change with new unit size
    this.layoutAndDisplayElements_();
  }

  /**
   * Replaces all existing layout data with a new set of item specifications.
   * This will clear the current layout and re-render everything.
   * @param {Array<Object>} newItemSpecs An array of new item specification objects.
   */
  updateAllItems(newItemSpecs) {
    this.layoutItems = Array.isArray(newItemSpecs) ? newItemSpecs : [];
    this._resetLayoutState(); // Clear DOM and reset internal state
    this.assessItemDimensions_();
    this.calculateOptimalColumns_();
    this.layoutAndDisplayElements_();
  }

  /**
   * Appends new item specifications to the existing layout data.
   * This will trigger a full re-render to incorporate new items.
   * @param {Array<Object>} itemsToAdd An array of item specification objects to add.
   */
  addMoreItems(itemsToAdd) {
    if (!Array.isArray(itemsToAdd) || itemsToAdd.length === 0) {
      console.warn('GridArranger: No valid items provided to add.');
      return;
    }
    this.layoutItems = this.layoutItems.concat(itemsToAdd);
    this._resetLayoutState(); // Clear DOM and reset internal state
    this.assessItemDimensions_(); // Re-assess max width with new items
    this.calculateOptimalColumns_();
    this.layoutAndDisplayElements_();
  }

  /**
   * Sets a new duration for the sequential fade-in effect.
   * @param {number} durationMs The new fade-in duration in milliseconds. Use 0 to disable.
   */
  setFadeInDuration(durationMs) {
    this.fadeInDelayMs = Math.max(0, durationMs);
    // Note: This does not trigger a re-render automatically,
    // as it only affects future initial renders or calls to updateAllItems/addMoreItems.
  }

  /**
   * Destroys the GridArranger instance, removing its DOM elements and event listeners.
   */
  destroy() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    if (this.boundResizeHandler) {
      // Remove event listener using the stored bound handler
      if (window && window.removeEventListener) {
        window.removeEventListener('resize', this.boundResizeHandler);
      }
    }

    // Remove all children from the container
    if (this.containerElement) {
      this.containerElement.innerHTML = '';
      // Reset any inline styles applied by the arranger
      this.containerElement.style.height = '';
      this.containerElement.style.minWidth = '';
      this.containerElement.style.overflow = '';
      this.containerElement.style.position = '';
    }

    // Clear references to aid garbage collection
    this.containerElement = null;
    this.layoutItems = [];
    this.cachedElements = [];
    this.boundResizeHandler = null;
    this.resizeTimeout = null;
    // ... clear other references as needed
  }
}