(function(jq) {

  // This jQuery UI widget, named 'itemScroller', provides a dynamic carousel-like
  // component that visually adjusts the scale, opacity, and position of child elements
  // based on their distance from a centrally active item.
  jq.widget("ui.itemScroller", {

    // Component configuration settings. These can be overridden during initialization.
    cfg: {
      targetItemSelector: "> *",      // CSS selector to identify individual items within the scroller.
      activeItemIndex: 1,             // The 1-based index of the item that should be initially active.
      visualScaleFactor: 10,          // Controls how aggressively items scale down as they move away from the center.
      spacingMultiplier: 3            // Multiplier for the horizontal margin, influencing item spacing.
    },

    // Private method: Executed once when the widget instance is created.
    // It sets up initial state, calculates base dimensions, and attaches event handlers.
    _initComponent: function() {
      // Initialize internal state variables for the widget instance.
      this.activeItemIndex = this.cfg.activeItemIndex;
      this.isContentFlipped = false; // Flag to track if the active item's content is visually flipped.

      // Cache a reference to the main widget element for efficient DOM access.
      const componentElement = this.element;

      // Construct the selector for the initial active item to get its base dimensions.
      const initialTargetSelector = this.cfg.targetItemSelector + ":nth-child(" + this.activeItemIndex + ")";
      const initialTarget = componentElement.find(initialTargetSelector);

      // Store the base dimensions (width and height) of an item.
      // Uses outerWidth/outerHeight for more accurate box model measurements.
      // Provides fallback values if the initial target item is not found.
      this.baseDimensions = {
        elemWidth: initialTarget.length ? initialTarget.outerWidth() : 100,
        elemHeight: initialTarget.length ? initialTarget.outerHeight() : 100
      };

      // Proceed to bind all necessary user interaction and custom event handlers.
      this._attachComponentEvents();
      // Select the item specified by activeItemIndex to establish initial layout.
      this._selectItemByIndex(this.activeItemIndex);

      // Log a debug message indicating successful component initialization.
      console.debug("itemScroller: Component initialized. Base item dimensions:", this.baseDimensions);
    },

    // Private method: Iterates through all items and triggers a visual update for each.
    _repositionAllItems: function() {
      const selfRef = this; // Capture 'this' context for use within the 'each' loop.

      // Find all items within the component and iterate over them.
      selfRef.element.find(selfRef.cfg.targetItemSelector).each(function(itemIdx) {
        // 'itemIdx' provided by jQuery's .each() is 0-based; convert to 1-based for internal logic.
        // Pass the raw DOM element to _updateSingleItemVisuals for direct manipulation.
        selfRef._updateSingleItemVisuals(itemIdx + 1, this);
      });
    },

    // Private method: Adjusts the visual properties (scale, position, opacity) of a single item.
    // 'itemIdx' is the 1-based index of the item.
    // 'itemDomElement' is the native DOM element to be updated.
    _updateSingleItemVisuals: function(itemIdx, itemDomElement) {
      // Guard clause: Ensure the DOM element exists before attempting to update it.
      if (!itemDomElement) {
        console.warn("itemScroller: Attempted to update visuals for a non-existent item at index", itemIdx);
        return;
      }

      const selfRef = this;
      const componentElement = selfRef.element;
      const itemElement = jq(itemDomElement); // Wrap the native DOM element with jQuery for manipulation.

      // Calculate the absolute difference in index from the currently active item.
      const indexDifference = Math.abs(selfRef.activeItemIndex - itemIdx);
      // Determine a scaled difference, which influences how much the item visually changes.
      const scaledIndexDiff = indexDifference / selfRef.cfg.visualScaleFactor;

      // Calculate the current visual scale (e.g., 1 for active, less for others).
      const currentVisualScale = 1 - scaledIndexDiff;
      // Ensure the effective scale does not drop below zero, preventing inversion.
      const effectiveVisualScale = Math.max(0, currentVisualScale);

      // Calculate the new width and height based on the effective visual scale.
      const calculatedSize = selfRef.baseDimensions.elemWidth * effectiveVisualScale;
      // Calculate a dynamic top margin, creating a subtle depth effect.
      const dynamicMarginTop = selfRef.baseDimensions.elemWidth * (indexDifference / (selfRef.cfg.visualScaleFactor * 2));

      // This complex factor determines the horizontal spread of items. It's a "magic" formula
      // that creates the characteristic curved, fanning-out arrangement.
      const positionCalcFactor = 0.5 * indexDifference * (2 * effectiveVisualScale + (indexDifference - 1) / selfRef.cfg.visualScaleFactor);
      const itemHorizontalOffset = selfRef.baseDimensions.elemWidth * positionCalcFactor;

      // Determine the horizontal center point of the scroller container.
      const centerPoint = (componentElement.width() - selfRef.baseDimensions.elemWidth) * 0.5;

      let finalLeftPosition;
      let adjustedMarginLeft;

      // Adjust the final horizontal position and left margin based on whether the item
      // is positioned to the left or right of the active item.
      if (itemIdx < selfRef.activeItemIndex) {
        finalLeftPosition = centerPoint - itemHorizontalOffset;
        adjustedMarginLeft = dynamicMarginTop; // Positive margin for items on the left side.
      } else {
        finalLeftPosition = centerPoint + itemHorizontalOffset;
        adjustedMarginLeft = -dynamicMarginTop; // Negative margin for items on the right side.
      }

      // Apply the calculated styles with an animation.
      // 'stop(true, false)' stops any current animation, clears the animation queue, and jumps to end.
      itemElement
        .css("z-index", 100 - indexDifference) // Items further away have a lower z-index (appear behind).
        .stop(true, false)
        .animate({
          "left": finalLeftPosition,
          "width": calculatedSize,
          "height": calculatedSize,
          "margin-top": dynamicMarginTop,
          "margin-left": adjustedMarginLeft * selfRef.cfg.spacingMultiplier,
          "opacity": effectiveVisualScale
        }, 300); // Animation duration is set to 300 milliseconds.
    },

    // Private method: Responsible for attaching all event listeners to the component and document.
    _attachComponentEvents: function() {
      const selfRef = this; // Capture 'this' for consistent context within event handlers.
      const componentElement = selfRef.element; // Cache the component's main element.

      // Attach a delegated click event handler to items that are not currently active.
      // Using jQuery's 'on' method for modern event delegation.
      componentElement.on("click", selfRef.cfg.targetItemSelector + ":not(.itemScroller-active)", function(eventObject) {
        // Calculate the 1-based index of the clicked item relative to its siblings.
        const clickedIndex = componentElement.find(selfRef.cfg.targetItemSelector).index(eventObject.currentTarget) + 1;
        selfRef._selectItemByIndex(clickedIndex); // Select the clicked item.
        eventObject.preventDefault();    // Prevent the browser's default action (e.g., following a link).
        eventObject.stopPropagation();   // Stop the event from bubbling up the DOM tree.
      });

      // Bind custom events that can be triggered programmatically to control the scroller.
      componentElement.on("itemScroller:flipContent", function(eventObject) {
        selfRef._toggleItemFlip(!selfRef.isContentFlipped); // Toggle the flip state.
        eventObject.preventDefault();
      });
      componentElement.on("itemScroller:itemSelected", function(eventObject, targetIndex) {
        // Validate that the provided targetIndex is a valid number and positive.
        if (typeof targetIndex === 'number' && targetIndex > 0) {
          selfRef._selectItemByIndex(targetIndex);
        } else {
          console.warn("itemScroller: Invalid index provided for 'itemScroller:itemSelected' event. Index must be a positive number.");
        }
        eventObject.preventDefault();
      });
      componentElement.on("itemScroller:navigatePrev", function(eventObject) {
        selfRef._retreatToPrevious(); // Navigate to the previous item.
        eventObject.preventDefault();
      });
      componentElement.on("itemScroller:navigateNext", function(eventObject) {
        selfRef._advanceToNext(); // Navigate to the next item.
        eventObject.preventDefault();
      });

      // Bind the 'wheel' event for mouse wheel navigation (horizontal scrolling).
      // 'wheel' is the modern standard; 'mousewheel' might be needed for older browsers/plugins.
      componentElement.on("wheel", function(eventObject) {
        const originalEvent = eventObject.originalEvent; // Access the native DOM event.
        const scrollDirectionX = originalEvent.deltaX; // Get the horizontal scroll delta.

        // Only react if there's significant horizontal scrolling.
        if (scrollDirectionX === 0) {
          return;
        }

        // Navigate based on the direction of horizontal scroll.
        if (scrollDirectionX > 0) {
          selfRef._advanceToNext();
        } else {
          selfRef._retreatToPrevious();
        }
        eventObject.preventDefault(); // Prevent default browser scroll behavior.
      });

      // Bind keyboard navigation (left and right arrow keys) to the document.
      jq(document).on("keyup", function(eventObject) { // Using 'keyup' for consistency.
        const keyCodeVal = eventObject.which || eventObject.keyCode; // Get the key code.

        // Define a mapping of key codes to widget navigation actions.
        const keyActions = {
          37: selfRef._retreatToPrevious, // Left arrow key
          39: selfRef._advanceToNext     // Right arrow key
        };

        const actionFunction = keyActions[keyCodeVal];
        // If a corresponding action is found, execute it in the context of the widget.
        if (actionFunction) {
          actionFunction.call(selfRef);
          eventObject.preventDefault(); // Prevent default browser actions (e.g., page scrolling).
        }
      });
    },

    // Private method: Toggles a "flipped" CSS class on the active item's direct child.
    _toggleItemFlip: function(flipState) {
      // Select the direct child of the currently active item.
      const activeItemContent = this.element.find(this.cfg.targetItemSelector + ".itemScroller-active > *");

      // Guard clause: Ensure an active item is present before attempting to flip.
      if (activeItemContent.length) {
        activeItemContent.toggleClass("itemScroller-flipped", flipState);
        this.isContentFlipped = flipState; // Update the internal flip state.
        console.debug("itemScroller: Active item content flipped state set to:", flipState);
      } else {
        console.warn("itemScroller: No active item content found to toggle flip state.");
      }
    },

    // Private method: Sets a specific item as active by its 1-based index and updates the UI.
    _selectItemByIndex: function(targetIndex) {
      const componentElement = this.element;
      const allItems = componentElement.find(this.cfg.targetItemSelector);
      const totalItems = allItems.length;

      // Guard clause: Validate that the target index is within the valid range of items.
      if (targetIndex < 1 || targetIndex > totalItems) {
        console.warn(`itemScroller: Attempted to select item index ${targetIndex}, which is out of bounds (1-${totalItems}).`);
        return;
      }

      // Before changing the active item, ensure the content of the *old* active item is not flipped.
      this._toggleItemFlip(false);

      // Remove the 'itemScroller-active' class from any currently active items.
      componentElement.find(".itemScroller-active").removeClass("itemScroller-active");

      // Add the 'itemScroller-active' class to the newly selected item.
      // jQuery's .eq() method uses 0-based indexing, so subtract 1 from targetIndex.
      const newlySelectedItem = allItems.eq(targetIndex - 1);
      if (newlySelectedItem.length) {
        newlySelectedItem.addClass("itemScroller-active");
        this.activeItemIndex = targetIndex; // Update the widget's internal active item index.
      } else {
        console.error("itemScroller: Failed to find item at the specified index for selection:", targetIndex);
        return; // Exit if the item couldn't be found.
      }

      // Trigger a full re-render to visually adjust all items based on the new active item.
      this._repositionAllItems();

      // Emit a custom event to notify other parts of the application that an item has been selected.
      componentElement.emitEvent("itemScroller:itemSelected", [targetIndex]);
      console.log("itemScroller: Item selected with index:", targetIndex);
    },

    // Private method: Navigates to the next item in the sequence.
    _advanceToNext: function() {
      const allItems = this.element.find(this.cfg.targetItemSelector);
      const totalItems = allItems.length;

      // Only proceed if the current item is not the last one in the sequence.
      if (this.activeItemIndex < totalItems) {
        this._selectItemByIndex(this.activeItemIndex + 1);
      } else {
        console.info("itemScroller: Already at the last item in the sequence.");
      }
    },

    // Private method: Navigates to the previous item in the sequence.
    _retreatToPrevious: function() {
      // Only proceed if the current item is not the first one in the sequence.
      if (this.activeItemIndex > 1) {
        this._selectItemByIndex(this.activeItemIndex - 1);
      } else {
        console.info("itemScroller: Already at the first item in the sequence.");
      }
    }
  });

  // Extend the jQuery prototype with a utility function for emitting custom events.
  // This provides a consistent and clear way to dispatch events from the widget.
  if (!jq.fn.emitEvent) {
    jq.fn.emitEvent = function(eventName, data) {
      return this.trigger(eventName, data);
    };
  }

})(jQuery);