(function(domUtil) {
  // Ensure jQuery/domUtil is available before proceeding.
  if (typeof domUtil === 'undefined' || !domUtil.fn) {
    console.error('DOM utility library (jQuery) not found. Dynamic height adjustments cannot be initialized.');
    return;
  }

  'use strict';

  // A counter for distinct event identifiers, ensuring unique bindings for multiple instances.
  let heightSyncTracker = 0;

  /**
   * Adjusts the vertical dimensions of elements within a collection to match the tallest among them.
   * This is a foundational routine for achieving uniform heights.
   */
  domUtil.fn.matchTallest = function() {
    // If the collection is empty, there's nothing to size.
    if (this.length === 0) {
      return this;
    }

    const measuredDimensions = [];
    const dimensionUnit = 'px'; // Standard unit for CSS height.
    const borderBoxModel = 'border-box'; // CSS box-sizing property value.

    // Iterate through each element in the current jQuery collection.
    for (let currentMemberIndex = 0; currentMemberIndex < this.length; currentMemberIndex++) {
      const jQMember = domUtil(this[currentMemberIndex]);
      let memberDimension;

      // Determine if padding should be included in the height calculation based on box-sizing.
      const considersPadding = (jQMember.css('box-sizing') === borderBoxModel) || (jQMember.css('-moz-box-sizing') === borderBoxModel);

      if (considersPadding) {
        // innerHeight includes padding but not borders or margins.
        memberDimension = jQMember.innerHeight();
      } else {
        // height() returns the content height, excluding padding, border, and margin.
        memberDimension = jQMember.height();
      }
      measuredDimensions.push(memberDimension);
    }

    // Find the maximum height from the collected dimensions.
    const maximumDimension = Math.max.apply(null, measuredDimensions); // Using null for 'this' context as Math.max doesn't need it.

    // Apply the determined maximum height to all elements in the collection.
    // Ensure the height is a non-negative value.
    if (maximumDimension > 0) {
      this.css('height', maximumDimension + dimensionUnit);
    } else {
      // Fallback or reset if dimensions are zero or negative, though unlikely with innerHeight/height.
      this.css('height', 'auto');
    }

    return this; // Enable chaining.
  };

  /**
   * Organizes a collection of elements into conceptual rows based on a specified column count
   * and then applies uniform height to elements within each row.
   */
  domUtil.fn.alignRowHeights = function(numColumns) {
    const visibleComponents = this.filter(':visible');

    // Reset heights to 'auto' to ensure accurate recalculation, especially after content changes.
    visibleComponents.css('height', 'auto');

    // Validate the number of columns. Must be a positive integer.
    const effectiveColumns = parseInt(numColumns, 10);
    if (isNaN(effectiveColumns) || effectiveColumns <= 0) {
      console.warn('Invalid column count provided for alignRowHeights. Defaulting to 1.');
      numColumns = 1; // Default to a single column if invalid.
    }

    // Iterate through the visible components, processing them in groups corresponding to rows.
    for (let idx = 0; idx < visibleComponents.length; idx++) {
      // Check if the current element is the start of a new row.
      if (idx % effectiveColumns === 0) {
        let currentSegmentElements = []; // Array to hold elements for the current row.

        // Collect elements for the current row.
        for (let offsetIdx = 0; offsetIdx < effectiveColumns; offsetIdx++) {
          const tileIndex = idx + offsetIdx;
          // Ensure we don't go out of bounds of the collection.
          if (tileIndex < visibleComponents.length) {
            currentSegmentElements.push(visibleComponents[tileIndex]);
          }
        }

        // If elements were collected for the segment, apply uniform height.
        if (currentSegmentElements.length > 0) {
          domUtil(currentSegmentElements).matchTallest();
        }
      }
    }
    return this; // Enable chaining.
  };

  /**
   * Analyzes a collection of elements to infer the number of columns in their layout
   * by comparing their vertical top offsets.
   */
  domUtil.fn.determineLayoutStructure = function() {
    let initialVerticalPosition = null; // Stores the top offset of the first element in a row.
    let columnCount = 0; // Accumulator for the number of columns detected.
    const visibleElements = this.filter(':visible');

    // If there are no visible elements, there are no columns to detect.
    if (visibleElements.length === 0) {
      return 0;
    }

    // Process each visible element to determine its vertical alignment.
    for (let itemIndex = 0; itemIndex < visibleElements.length; itemIndex++) {
      const item = visibleElements[itemIndex];
      const itemVerticalPosition = domUtil(item).offset().top;

      // For the first element, or elements on the same vertical plane as the first element in the current row.
      if (initialVerticalPosition === null || itemVerticalPosition === initialVerticalPosition) {
        columnCount++;
        // Set the initial vertical position using the first element's offset in a row.
        if (initialVerticalPosition === null) {
          initialVerticalPosition = itemVerticalPosition;
        }
      } else {
        // If an element's vertical position differs, it signifies the start of a new row.
        // We stop counting columns for the first row as that's usually sufficient.
        break;
      }
    }
    return columnCount; // The number of columns observed in the first full row.
  };

  /**
   * Activates dynamic height synchronization for a collection of elements,
   * automatically re-adjusting heights on window resize and page load.
   */
  domUtil.fn.enableDynamicHeightSynchronization = function() {
    const instanceReference = this; // Cache the jQuery object for use within closures.

    // Generate a unique event identifier for this specific binding instance.
    const eventIdentifier = '.heightSync_' + heightSyncTracker++;
    instanceReference.data('sync-event-id', eventIdentifier);

    /**
     * Internal function to perform the height adjustments.
     * It detects the grid columns and then aligns the row heights.
     */
    const adjustDimensions = function() {
      // Retrieve the current column count based on the layout.
      const currentColumnCount = instanceReference.determineLayoutStructure();
      // Apply uniform heights based on the detected column structure.
      if (currentColumnCount > 0) {
        instanceReference.alignRowHeights(currentColumnCount);
      }
    };

    // Implement a basic debounce mechanism for resize events to improve performance.
    let resizeTimer;
    const debouncedAdjustDimensions = function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(adjustDimensions, 150); // Adjust after 150ms of no resizing.
    };

    // Bind the adjustment routine to window events.
    // Use 'on' for modern jQuery event handling.
    domUtil(window).on('resize' + eventIdentifier, debouncedAdjustDimensions);
    domUtil(window).on('load' + eventIdentifier, adjustDimensions);

    // Perform an initial adjustment immediately after binding.
    adjustDimensions();

    return this; // Enable chaining.
  };

  /**
   * Deactivates the dynamic height synchronization previously enabled by
   * `enableDynamicHeightSynchronization`, resetting heights and unbinding events.
   */
  domUtil.fn.disableDynamicHeightSynchronization = function() {
    const targetCollection = this;
    const storedEventId = targetCollection.data('sync-event-id');

    // Reset the height of the elements to 'auto', allowing them to resume natural sizing.
    targetCollection.css('height', 'auto');

    // If an event identifier was stored, unbind the associated events from the window.
    if (storedEventId) {
      domUtil(window).off(storedEventId);
      targetCollection.removeData('sync-event-id'); // Clean up the stored data.
    } else {
      console.warn('No active height synchronization found for this collection. No events to unbind.');
    }

    return this; // Enable chaining.
  };

})(window.jQuery); // Pass window.jQuery as domUtil alias.