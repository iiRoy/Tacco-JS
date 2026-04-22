/* Column Resizing Utility v1.0 | Enhanced for modern browsers | MIT License | Generated: 2023-10-27 */
(function(jQuery, globalWindow) {
  'use strict'; // Enforce strict mode for cleaner code

  // Helper functions for width manipulation
  const extractPercentageValue = function(element) {
    // Robustly extract the float value from an element's style.width property.
    // Returns 0 if the element or its style.width is invalid or not percentage-based.
    if (!element?.style?.width) {
      return 0;
    }
    const widthString = element.style.width;
    if (widthString.endsWith('%')) {
      const parsedValue = parseFloat(widthString);
      return isNaN(parsedValue) ? 0 : parsedValue;
    }
    return 0; 
  };

  const applyPercentageWidth = function(element, newWidthValue) {
    // Sets the width of an element, ensuring it's a valid non-negative percentage.
    let validatedWidth = parseFloat(newWidthValue);
    if (isNaN(validatedWidth)) {
      validatedWidth = 0; 
    }
    validatedWidth = Math.max(0, validatedWidth); // Width cannot be negative
    element.style.width = `${validatedWidth.toFixed(2)}%`;
  };

  // Unified pointer position retrieval for mouse and touch events
  const getEventCoordinateX = function(eventObject) {
    // Extracts the X coordinate from a mouse or touch event.
    // Handles jQuery's originalEvent for touch events.
    if (eventObject.type.startsWith('touch')) {
      const touchData = eventObject.originalEvent?.touches[0] || eventObject.originalEvent?.changedTouches[0];
      return touchData ? touchData.pageX : 0; 
    }
    return eventObject.pageX;
  };

  // Main class for managing table column resizing functionality
  const TableColumnResizer = (function() {
    // Default configuration settings for the resizer
    const defaultResizerSettings = {
      headerSelector: 'th:visible', // Selector for identifying resizeable header cells
      widthPersistenceManager: globalWindow.localStorage, // Default to localStorage for saving/loading widths
      syncHandlePositions: true, // Automatically update handle positions during resize operations
      extendHandleToTableBody: true, // If true, resize handles span the full table height; otherwise, only thead height
      maximumColumnWidth: null, // Optional maximum width (percentage) for any column
      minimumColumnWidth: 5 // Optional minimum width (percentage) for any column (default changed from null to 5)
    };

    /**
     * Constructs a new TableColumnResizer instance.
     * @param {jQuery} targetTableElement - The jQuery object representing the target table.
     * @param {object} customSettings - Optional custom configuration settings to override defaults.
     */
    function TableColumnResizer(targetTableElement, customSettings) {
      if (!(targetTableElement instanceof jQuery) || targetTableElement.length === 0) {
        throw new Error("TableColumnResizer: Invalid or empty jQuery object provided for targetTableElement.");
      }

      this.settings = { ...defaultResizerSettings, ...customSettings }; // Merge default and custom settings
      this.targetTableElement = targetTableElement;
      this.headerElements = null; // Stores jQuery collection of table headers
      this.resizeHandleContainer = null; // Stores jQuery object for the resize handle container

      // Pre-bind critical event handlers to the instance to maintain context
      this.handlePointerDown = this.handlePointerDown.bind(this);
      this.constrainColumnSize = this.constrainColumnSize.bind(this);
      this.updateHandlePositions = this.updateHandlePositions.bind(this); // Also bind this for window resize

      this.initializeResizer();
      this.setupEventBindings();
    }

    // --- Core Initialization & Lifecycle Methods ---

    TableColumnResizer.prototype.initializeResizer = function() {
      // Find and store the header elements based on the configured selector
      this.headerElements = this.targetTableElement.find(this.settings.headerSelector);
      
      // Assign unique identifiers to headers if they don't already have them
      this.headerElements.each((index, element) => {
        const $header = jQuery(element);
        if (!$header.data('column-identifier')) {
          $header.data('column-identifier', `cr-col-${index}`);
        }
      });

      this.normalizeHeaderWidthsToPercentages(); // Convert current pixel widths to percentages
      this.loadStoredColumnSizes(); // Attempt to restore widths from persistence manager
      this.generateResizeHandles(); // Create and append the visual resize handles
      this.updateHandlePositions(); // Position the handles correctly
    };

    TableColumnResizer.prototype.setupEventBindings = function() {
      // Bind to window resize to ensure handles are always correctly positioned
      jQuery(globalWindow).on('resize.colresizer', this.updateHandlePositions);

      // Bind custom event handlers if provided in settings
      if (typeof this.settings.start === 'function') {
        this.targetTableElement.on('column:resize:start.colresizer', this.settings.start);
      }
      if (typeof this.settings.resize === 'function') {
        this.targetTableElement.on('column:resize.colresizer', this.settings.resize);
      }
      if (typeof this.settings.stop === 'function') {
        this.targetTableElement.on('column:resize:stop.colresizer', this.settings.stop);
      }
    };

    TableColumnResizer.prototype.cleanupResizer = function() {
      // Removes all event listeners, DOM elements, and data associated with the resizer instance.
      if (!this.targetTableElement) return; 

      const ownerDocument = jQuery(this.targetTableElement[0].ownerDocument || document);
      ownerDocument.off('.colresizer'); // Remove document-level event listeners

      if (this.resizeHandleContainer) {
        this.resizeHandleContainer.find('.cr-handle').each((_, element) => {
          jQuery(element).removeData('associated-header').off('mousedown touchstart');
        });
        this.resizeHandleContainer.remove();
        this.resizeHandleContainer = null;
      }
      
      jQuery(globalWindow).off('resize.colresizer'); // Remove window resize listener
      this.targetTableElement.off('.colresizer'); // Remove table-level event listeners
      this.targetTableElement.removeData('tableColumnResizer'); // Clear instance data from table
      
      // Nullify references to aid garbage collection
      this.headerElements = null;
      this.targetTableElement = null; 
    };

    // --- Utility Methods ---

    /**
     * Dispatches a custom event on the target table element.
     * @param {string} eventName - The name of the custom event (e.g., 'column:resize:start').
     * @param {Array} eventArgs - An array of arguments to pass along with the event.
     * @param {Event} [originalEvent] - The original DOM event that triggered this dispatch.
     * @returns {jQuery.Event} The dispatched jQuery event object.
     */
    TableColumnResizer.prototype.dispatchCustomEvent = function(eventName, eventArgs, originalEvent) {
      const customEvent = jQuery.Event(eventName);
      if (originalEvent) {
        customEvent.originalEvent = jQuery.extend({}, originalEvent); // Create a clean copy of the original event
      }
      // Prepend 'this' instance to event arguments for easy access in handlers
      const fullArgs = [this, ...(Array.isArray(eventArgs) ? eventArgs : [])];
      return this.targetTableElement.trigger(customEvent, fullArgs);
    };

    /**
     * Generates a unique key for storing individual column widths in the persistence manager.
     * @param {jQuery} headerElement - The jQuery object of the header cell.
     * @returns {string} The unique storage key.
     */
    TableColumnResizer.prototype.retrieveColumnKey = function(headerElement) {
      // Use table ID, data attribute, or index as fallback for table identification
      const tableIdentifier = this.targetTableElement.data('resizer-table-id') || 
                            this.targetTableElement.attr('id') || 
                            `table-idx-${this.targetTableElement.index()}`; 
      const columnIdentifier = headerElement.data('column-identifier');
      return `colresizer-width-${tableIdentifier}-${columnIdentifier}`;
    };

    // --- Header & Handle Management ---

    TableColumnResizer.prototype.normalizeHeaderWidthsToPercentages = function() {
      const totalTableWidth = this.targetTableElement.width();
      if (totalTableWidth === 0) {
        console.warn("TableColumnResizer: Target table width is 0, cannot normalize header widths.");
        return;
      }

      this.headerElements.each((_, element) => {
        const $header = jQuery(element);
        const currentWidth = $header.outerWidth();
        applyPercentageWidth(element, (currentWidth / totalTableWidth) * 100);
      });
    };

    TableColumnResizer.prototype.generateResizeHandles = function() {
      // Remove any existing handles to prevent duplicates
      this.resizeHandleContainer?.remove(); // Optional chaining for cleaner check

      // Create and insert the container for all resize handles before the table
      this.resizeHandleContainer = jQuery("<div class='cr-handle-container' />");
      this.targetTableElement.before(this.resizeHandleContainer);

      // Loop through headers to create a handle for each resizable boundary
      for (let i = 0; i < this.headerElements.length; i++) {
        const currentHeader = this.headerElements.eq(i);
        const nextHeader = this.headerElements.eq(i + 1);

        // Skip if it's the last column or if either current/next column is marked as non-resizable
        const isNonResizable = currentHeader.is('[data-no-resize]') || nextHeader.is('[data-no-resize]');
        if (nextHeader.length === 0 || isNonResizable) {
          continue;
        }

        const handleElement = jQuery("<div class='cr-handle' />");
        handleElement.data('associated-header', currentHeader); // Link handle to its left-hand header
        this.resizeHandleContainer.append(handleElement);
      }

      // Attach delegated event listener for pointerdown on handles
      this.resizeHandleContainer.on('mousedown touchstart', '.cr-handle', this.handlePointerDown);
    };

    TableColumnResizer.prototype.updateHandlePositions = function() {
      if (!this.resizeHandleContainer || !this.targetTableElement || this.targetTableElement.length === 0) {
        return; // No handles or table to update
      }

      const tableWidth = this.targetTableElement.width();
      this.resizeHandleContainer.width(tableWidth);

      // Determine the height of the handles based on configuration
      const handleHeight = this.settings.extendHandleToTableBody ? 
                           this.targetTableElement.height() : 
                           this.targetTableElement.find('thead').height();

      this.resizeHandleContainer.find('.cr-handle').each((_, element) => {
        const $handle = jQuery(element);
        const $associatedHeader = $handle.data('associated-header');
        
        if ($associatedHeader && $associatedHeader.length > 0) {
          const headerOffsetLeft = $associatedHeader.offset().left;
          const containerOffsetLeft = this.resizeHandleContainer.offset().left;
          const headerWidth = $associatedHeader.outerWidth();

          $handle.css({
            left: headerOffsetLeft + headerWidth - containerOffsetLeft, // Position at the right edge of the left header
            height: handleHeight
          });
        }
      });
    };

    // --- Persistence Methods ---

    TableColumnResizer.prototype.persistColumnSizes = function() {
      // Saves the current column widths using the configured persistence manager.
      if (!this.settings.widthPersistenceManager || 
          typeof this.settings.widthPersistenceManager.setItem !== 'function') {
        return; // No valid persistence manager available
      }

      this.headerElements.each((_, element) => {
        const $header = jQuery(element);
        if (!$header.is('[data-no-resize]')) { // Only persist if not marked as non-resizable
          const columnKey = this.retrieveColumnKey($header);
          const currentWidth = extractPercentageValue(element);
          this.settings.widthPersistenceManager.setItem(columnKey, currentWidth.toString());
        }
      });
    };

    TableColumnResizer.prototype.loadStoredColumnSizes = function() {
      // Loads column widths from the persistence manager and applies them.
      if (!this.settings.widthPersistenceManager || 
          typeof this.settings.widthPersistenceManager.getItem !== 'function') {
        return; // No valid persistence manager available
      }

      this.headerElements.each((_, element) => {
        const $header = jQuery(element);
        const columnKey = this.retrieveColumnKey($header);
        const storedWidth = this.settings.widthPersistenceManager.getItem(columnKey);
        
        if (storedWidth !== null && !isNaN(parseFloat(storedWidth))) {
          applyPercentageWidth(element, parseFloat(storedWidth));
        }
      });
    };

    // --- Column Width Calculation & Constraints ---

    /**
     * Constrains a given width value (percentage) within the configured min/max limits.
     * @param {number} inputWidth - The width value to constrain.
     * @returns {number} The constrained width value.
     */
    TableColumnResizer.prototype.constrainColumnSize = function(inputWidth) {
      let constrained = inputWidth;

      if (typeof this.settings.minimumColumnWidth === 'number' && !isNaN(this.settings.minimumColumnWidth)) {
        constrained = Math.max(this.settings.minimumColumnWidth, constrained);
      }
      if (typeof this.settings.maximumColumnWidth === 'number' && !isNaN(this.settings.maximumColumnWidth)) {
        constrained = Math.min(this.settings.maximumColumnWidth, constrained);
      }
      return constrained;
    };

    // --- Event Handlers ---

    TableColumnResizer.prototype.handlePointerDown = function(event) {
      event.preventDefault(); // Prevent default browser actions (e.g., text selection)

      const targetDocument = jQuery(event.currentTarget[0].ownerDocument || document);
      const startClientX = getEventCoordinateX(event);
      const currentResizeHandle = jQuery(event.currentTarget);
      const leftHeader = currentResizeHandle.data('associated-header');
      
      if (!leftHeader || leftHeader.length === 0) {
        console.warn("TableColumnResizer: Associated header not found for resize handle.");
        return;
      }

      const leftHeaderIndex = this.headerElements.index(leftHeader);
      const rightHeader = this.headerElements.eq(leftHeaderIndex + 1);

      if (rightHeader.length === 0) {
        console.warn("TableColumnResizer: Right header not found for resize operation.");
        return;
      }

      // Capture initial widths of both columns involved in the resize
      const initialWidths = {
        left: extractPercentageValue(leftHeader[0]),
        right: extractPercentageValue(rightHeader[0])
      };
      
      // This object will hold the widths as they are updated during the drag
      const currentResizingWidths = { ...initialWidths };

      // Add CSS classes for visual feedback during resizing
      this.resizeHandleContainer.add(this.targetTableElement).addClass('cr-resizing-active');
      leftHeader.add(rightHeader).add(currentResizeHandle).addClass('cr-column-active');

      // Dispatch the 'start' event
      this.dispatchCustomEvent('column:resize:start', [leftHeader, rightHeader, currentResizingWidths.left, currentResizingWidths.right], event);

      // --- Nested Event Handlers for Drag Movement ---
      const handlePointerMove = (moveEvent) => {
        moveEvent.preventDefault(); 
        const currentClientX = getEventCoordinateX(moveEvent);
        const horizontalMovementPixels = currentClientX - startClientX;
        const percentageChange = (horizontalMovementPixels / this.targetTableElement.width()) * 100;

        // Calculate prospective widths, applying individual column constraints
        const prospectiveLeftWidth = this.constrainColumnSize(initialWidths.left + percentageChange);
        const prospectiveRightWidth = this.constrainColumnSize(initialWidths.right - percentageChange);

        // Adjust widths to ensure the total width of the two columns remains constant
        // This prevents 'gaps' or 'overlaps' if min/max constraints are hit
        const sumOfInitialWidths = initialWidths.left + initialWidths.right;
        const currentSumOfProspectiveWidths = prospectiveLeftWidth + prospectiveRightWidth;
        const adjustmentFactor = sumOfInitialWidths / currentSumOfProspectiveWidths;

        currentResizingWidths.left = this.constrainColumnSize(prospectiveLeftWidth * adjustmentFactor);
        currentResizingWidths.right = this.constrainColumnSize(prospectiveRightWidth * adjustmentFactor);

        applyPercentageWidth(leftHeader[0], currentResizingWidths.left);
        applyPercentageWidth(rightHeader[0], currentResizingWidths.right);

        // Synchronize handle positions if configured
        if (this.settings.syncHandlePositions) {
          this.updateHandlePositions();
        }

        // Dispatch the 'resize' event
        this.dispatchCustomEvent('column:resize', [leftHeader, rightHeader, currentResizingWidths.left, currentResizingWidths.right], moveEvent);
      };

      const handlePointerUp = () => {
        // Remove event listeners once the drag operation ends
        targetDocument.off('mousemove.colresizer touchmove.colresizer', handlePointerMove);
        targetDocument.off('mouseup.colresizer touchend.colresizer', handlePointerUp);

        // Remove resizing CSS classes
        this.resizeHandleContainer.add(this.targetTableElement).removeClass('cr-resizing-active');
        leftHeader.add(rightHeader).add(currentResizeHandle).removeClass('cr-column-active');

        this.updateHandlePositions(); // Final update of handle positions
        this.persistColumnSizes(); // Save the newly set column widths

        // Dispatch the 'stop' event
        this.dispatchCustomEvent('column:resize:stop', [leftHeader, rightHeader, currentResizingWidths.left, currentResizingWidths.right], event);
      };

      // Bind move and up events to the document for robust drag handling
      targetDocument.on('mousemove.colresizer touchmove.colresizer', handlePointerMove);
      targetDocument.one('mouseup.colresizer touchend.colresizer', handlePointerUp); // 'one' ensures it fires only once
    };

    return TableColumnResizer;
  })();

  // --- jQuery Plugin Definition ---

  jQuery.fn.extend({
    columnResizer: function(...args) {
      const [firstArgument, ...remainingArguments] = args;

      return this.each(function() {
        const currentTable = jQuery(this);
        let resizerInstance = currentTable.data('tableColumnResizer');

        if (!resizerInstance) {
          // If no instance exists, initialize a new one
          const config = (typeof firstArgument === 'object' && firstArgument !== null) ? firstArgument : {};
          resizerInstance = new TableColumnResizer(currentTable, config);
          currentTable.data('tableColumnResizer', resizerInstance);
        } else if (typeof firstArgument === 'string') {
          // If a string is passed, attempt to call a method on the existing instance
          const methodName = firstArgument;
          if (typeof resizerInstance[methodName] === 'function') {
            // Special handling for 'cleanupResizer' to remove the instance data
            if (methodName === 'cleanupResizer') { 
              resizerInstance[methodName].apply(resizerInstance, remainingArguments);
              currentTable.removeData('tableColumnResizer');
            } else {
              resizerInstance[methodName].apply(resizerInstance, remainingArguments);
            }
          } else {
            console.warn(`TableColumnResizer: Method "${methodName}" does not exist on the instance.`);
          }
        }
        // If an object is passed to an existing instance, it's ignored as per original library's behavior
        // To update settings, 'cleanupResizer' and then re-initialize would be required.
      });
    }
  });

})(window.jQuery, window);