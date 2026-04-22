/*global jQuery*/
(function ($) {
  'use strict';

  // This module enhances jQuery UI selectable functionality by incorporating auto-scrolling
  // when the selection rectangle extends near the edges of a designated scrollable container.
  // It ensures a smoother user experience for selecting items in large, scrollable areas.
  $.widget('ui.enhancedSelectable', $.ui.selectable, {
    options: {
      // Specifies the element responsible for scrolling. Defaults to the widget's host element.
      viewportElement: null,
      // Proximity to the horizontal edges (in pixels) that triggers auto-scrolling.
      edgeThresholdX: 6,
      // Proximity to the vertical edges (in pixels) that triggers auto-scrolling.
      edgeThresholdY: 6,
      // The increment (in pixels) by which the viewport scrolls during each auto-scroll step.
      scrollStepSize: 30,
      // The delay (in milliseconds) between consecutive auto-scroll steps.
      scrollDelayMs: 90
    },

    /**
     * Initializes the component, setting up internal states and DOM elements.
     * This extends the base selectable's creation process.
     */
    _initializeComponent: function () {
      if (!this.element.length) {
        console.warn("EnhancedSelectable: Host element not found. Initialization aborted.");
        return;
      }

      this.element.addClass('ui-selectable-active');
      this.lassoBoundaryClasses = ['out-of-bounds-top', 'out-of-bounds-right', 'out-of-bounds-bottom', 'out-of-bounds-left'];
      
      // Determine the actual element that will serve as the scrollable viewport.
      // Prioritizes the configured option, then falls back to the widget's main element.
      this.activeViewport = $(this.options.viewportElement || this.element);
      
      // Ensure the viewport is a valid jQuery object
      if (!this.activeViewport.length) {
        console.error("EnhancedSelectable: No valid viewport element found.");
        this.activeViewport = this.element; // Fallback
      }

      this.recalculateSelectionItems(); // Populate initial selectable items
      this._mouseInit(); // Initialize mouse event handling
      this.lassoHelper = $('<div class="ui-selectable-lasso-helper"></div>'); // Create the selection helper element
      this.isDraggingActive = false; // Flag to track if a drag operation is in progress
    },

    /**
     * Re-scans and caches all potential selectable child elements within the viewport.
     * This method should be called if the DOM structure of selectable items changes.
     */
    recalculateSelectionItems: function () {
      const viewportOffsetData = this.activeViewport.offset();
      const currentScrollLeftPos = this.activeViewport.prop('scrollLeft');
      const currentScrollTopPos = this.activeViewport.prop('scrollTop');

      this.selectableItemsCollection = $(this.options.filter, this.activeViewport[0]);
      this.selectableItemsCollection.addClass('ui-selectee-item');

      const selfReference = this; // Cache 'this' for use in the 'each' loop

      this.selectableItemsCollection.each(function () {
        const currentJqItem = $(this);
        const itemOffsetData = currentJqItem.offset();

        if (!itemOffsetData) { // Guard against detached elements or elements without offset
          return;
        }

        const itemWidth = currentJqItem.outerWidth();
        const itemHeight = currentJqItem.outerHeight();

        // Store comprehensive data for each selectable item
        $.data(this, 'selection-tracking-data', {
          refElement: this,
          jqElement: currentJqItem,
          // Absolute coordinates on the document
          xCoord: itemOffsetData.left,
          yCoord: itemOffsetData.top,
          rightEdge: itemOffsetData.left + itemWidth,
          bottomEdge: itemOffsetData.top + itemHeight,
          // Coordinates relative to the viewport's top-left corner, considering scroll position
          relativeCoords: {
            xCoord: itemOffsetData.left - viewportOffsetData.left + currentScrollLeftPos,
            yCoord: itemOffsetData.top - viewportOffsetData.top + currentScrollTopPos,
            rightEdge: itemOffsetData.left - viewportOffsetData.left + currentScrollLeftPos + itemWidth,
            bottomEdge: itemOffsetData.top - viewportOffsetData.top + currentScrollTopPos + itemHeight
          },
          initialSelectionState: false, // Tracks if item was selected at drag start
          selectedState: currentJqItem.hasClass('ui-selected'),
          selectingState: currentJqItem.hasClass('ui-selecting'),
          unselectingState: currentJqItem.hasClass('ui-unselecting')
        });
      });
    },

    /**
     * Initiates the mouse interaction for selection. Checks for valid starting conditions
     * and captures initial viewport metrics for subsequent drag operations.
     * @param {object} mouseEventData - The original mousedown event object.
     * @returns {boolean} The return value from the parent's _mouseStart method.
     */
    _beginInteraction: function (mouseEventData) {
      const viewportPosition = this.activeViewport.offset();
      const viewportClientWidth = this.activeViewport.prop('clientWidth');
      const viewportClientHeight = this.activeViewport.prop('clientHeight');

      // Prevent selection if click is outside the visible area of the viewport.
      // This is a guard to ensure selection only starts within the scrollable content.
      const clickX = mouseEventData.pageX;
      const clickY = mouseEventData.pageY;
      const viewportRightBound = viewportPosition.left + viewportClientWidth;
      const viewportBottomBound = viewportPosition.top + viewportClientHeight;

      if (clickX > viewportRightBound || clickY > viewportBottomBound ||
          clickX < viewportPosition.left || clickY < viewportPosition.top) {
        return false;
      }

      const baseReturnValue = $.ui.selectable.prototype._mouseStart.call(this, mouseEventData);
      this.lastRecordedMouseEvent = null; // Clear previous event data
      this.isDraggingActive = true;

      // Cache important viewport dimensions and scroll positions at the start of the drag
      this.viewportMetrics = {
        viewportScreenOffset: this.activeViewport.offset(),
        totalContentWidth: this.activeViewport.prop('scrollWidth'),
        totalContentHeight: this.activeViewport.prop('scrollHeight'),
        visibleWidth: viewportClientWidth,
        visibleHeight: viewportClientHeight
      };

      const currentScrollLeft = this.activeViewport.prop('scrollLeft');
      const currentScrollTop = this.activeViewport.prop('scrollTop');

      // Calculate the initial drag start position relative to the viewport's content (0,0)
      this.viewportMetrics.initialDragXRel = mouseEventData.pageX - this.viewportMetrics.viewportScreenOffset.left + currentScrollLeft;
      this.viewportMetrics.initialDragYRel = mouseEventData.pageY - this.viewportMetrics.viewportScreenOffset.top + currentScrollTop;

      this.autoScrollTimerId = null; // Initialize auto-scroll timer ID
      return baseReturnValue;
    },

    /**
     * Updates the visual representation of the selection lasso helper, ensuring it stays
     * within the bounds of the scrollable viewport.
     * @param {object} lassoBounds - Contains coordinates (x1, y1, x2, y2) and current scroll positions.
     */
    _adjustLassoDisplay: function (lassoBounds) {
      if (!this.lassoHelper.length) {
        return; // Guard against helper not existing
      }

      let displayX1, displayY1, displayX2, displayY2; // Screen coordinates for the lasso
      const boundaryHitClasses = [];
      const viewportOffset = this.viewportMetrics.viewportScreenOffset;
      const viewportWidth = this.viewportMetrics.visibleWidth;
      const viewportHeight = this.viewportMetrics.visibleHeight;

      // Determine the visible portion of the lasso helper
      // X1 coordinate adjustment
      if (lassoBounds.x1 - lassoBounds.currentScrollLeft < 0) {
        boundaryHitClasses.push('out-of-bounds-left');
        displayX1 = viewportOffset.left;
      } else {
        displayX1 = viewportOffset.left + lassoBounds.x1 - lassoBounds.currentScrollLeft;
      }

      // Y1 coordinate adjustment
      if (lassoBounds.y1 - lassoBounds.currentScrollTop < 0) {
        boundaryHitClasses.push('out-of-bounds-top');
        displayY1 = viewportOffset.top;
      } else {
        displayY1 = viewportOffset.top + lassoBounds.y1 - lassoBounds.currentScrollTop;
      }

      // X2 coordinate adjustment
      if (lassoBounds.x2 - lassoBounds.currentScrollLeft > viewportWidth) {
        boundaryHitClasses.push('out-of-bounds-right');
        displayX2 = viewportOffset.left + viewportWidth;
      } else {
        displayX2 = viewportOffset.left + lassoBounds.x2 - lassoBounds.currentScrollLeft;
      }

      // Y2 coordinate adjustment
      if (lassoBounds.y2 - lassoBounds.currentScrollTop > viewportHeight) {
        boundaryHitClasses.push('out-of-bounds-bottom');
        displayY2 = viewportOffset.top + viewportHeight;
      } else {
        displayY2 = viewportOffset.top + lassoBounds.y2 - lassoBounds.currentScrollTop;
      }

      // Add/remove boundary classes based on whether the lasso is clipped
      this.lassoBoundaryClasses.forEach(function (cssClass) {
        if ($.inArray(cssClass, boundaryHitClasses) !== -1) {
          this.lassoHelper.addClass(cssClass);
        } else {
          this.lassoHelper.removeClass(cssClass);
        }
      }, this); // Pass 'this' as context for forEach

      // Apply the calculated position and size to the helper
      this.lassoHelper.css({
        left: displayX1,
        top: displayY1,
        width: displayX2 - displayX1,
        height: displayY2 - displayY1
      });
    },

    /**
     * Determines if the viewport needs to scroll based on the mouse pointer's proximity to its edges,
     * and applies the scroll if necessary.
     * @returns {object} An object containing the new scroll positions and a flag indicating if scrolling occurred.
     */
    _evaluateAndApplyScrolling: function () {
      const scrollStep = this.options.scrollStepSize;
      let currentScrollPosLeft = this.activeViewport.prop('scrollLeft');
      let currentScrollPosTop = this.activeViewport.prop('scrollTop');
      let shouldContinueScrolling = false;

      const mouseX = this.lastRecordedMouseEvent.pageX;
      const mouseY = this.lastRecordedMouseEvent.pageY;
      const viewportOffset = this.viewportMetrics.viewportScreenOffset;
      const viewportWidth = this.viewportMetrics.visibleWidth;
      const viewportHeight = this.viewportMetrics.visibleHeight;
      const contentScrollWidth = this.viewportMetrics.totalContentWidth;
      const contentScrollHeight = this.viewportMetrics.totalContentHeight;
      const edgeX = this.options.edgeThresholdX;
      const edgeY = this.options.edgeThresholdY;

      // Calculate mouse position relative to the viewport's client area
      const mouseRelX = mouseX - viewportOffset.left;
      const mouseRelY = mouseY - viewportOffset.top;

      // Helper function to calculate new scroll position safely
      const calculateNewScroll = (current, step, maxScroll) => {
        return Math.max(0, Math.min(maxScroll, current + step));
      };

      // Scroll left (towards start)
      if (mouseRelX < edgeX && currentScrollPosLeft > 0) {
        currentScrollPosLeft = calculateNewScroll(currentScrollPosLeft, -scrollStep, contentScrollWidth - viewportWidth);
        this.activeViewport.prop('scrollLeft', currentScrollPosLeft);
        shouldContinueScrolling = true;
      }
      // Scroll up (towards top)
      if (mouseRelY < edgeY && currentScrollPosTop > 0) {
        currentScrollPosTop = calculateNewScroll(currentScrollPosTop, -scrollStep, contentScrollHeight - viewportHeight);
        this.activeViewport.prop('scrollTop', currentScrollPosTop);
        shouldContinueScrolling = true;
      }
      // Scroll right (towards end)
      if (mouseRelX > viewportWidth - edgeX && currentScrollPosLeft < contentScrollWidth - viewportWidth) {
        currentScrollPosLeft = calculateNewScroll(currentScrollPosLeft, scrollStep, contentScrollWidth - viewportWidth);
        this.activeViewport.prop('scrollLeft', currentScrollPosLeft);
        shouldContinueScrolling = true;
      }
      // Scroll down (towards bottom)
      if (mouseRelY > viewportHeight - edgeY && currentScrollPosTop < contentScrollHeight - viewportHeight) {
        currentScrollPosTop = calculateNewScroll(currentScrollPosTop, scrollStep, contentScrollHeight - viewportHeight);
        this.activeViewport.prop('scrollTop', currentScrollPosTop);
        shouldContinueScrolling = true;
      }

      return {
        currentScrollLeft: currentScrollPosLeft,
        currentScrollTop: currentScrollPosTop,
        didScroll: shouldContinueScrolling
      };
    },

    /**
     * Computes the mouse cursor's coordinates relative to the scrollable content area (0,0).
     * @param {object} absoluteMouseCoords - Contains the absolute X and Y positions of the mouse.
     * @param {number} currentScrollLeft - The current horizontal scroll position.
     * @param {number} currentScrollTop - The current vertical scroll position.
     * @returns {object} An object with relative x and y coordinates.
     */
    _computeRelativeCoords: function (absoluteMouseCoords, currentScrollLeft, currentScrollTop) {
      const relativeXCoordinate = absoluteMouseCoords.x - this.viewportMetrics.viewportScreenOffset.left + currentScrollLeft;
      const relativeYCoordinate = absoluteMouseCoords.y - this.viewportMetrics.viewportScreenOffset.top + currentScrollTop;
      return {
        x: relativeXCoordinate,
        y: relativeYCoordinate
      };
    },

    /**
     * Calculates the bounding box of the selection area based on the initial drag point
     * and the current mouse position (both relative to the viewport's content).
     * @param {object} currentRelativePoint - Contains the current relative X and Y positions.
     * @returns {object} An object containing the calculated selection area coordinates (x1, y1, x2, y2).
     */
    _determineSelectionArea: function (currentRelativePoint) {
      const startX = this.viewportMetrics.initialDragXRel;
      const startY = this.viewportMetrics.initialDragYRel;
      const currentX = currentRelativePoint.x;
      const currentY = currentRelativePoint.y;

      const areaX1 = Math.min(startX, currentX);
      const areaY1 = Math.min(startY, currentY);
      const areaX2 = Math.max(startX, currentX);
      const areaY2 = Math.max(startY, currentY);

      return {
        x1: areaX1,
        y1: areaY1,
        x2: areaX2,
        y2: areaY2
      };
    },

    /**
     * Iterates through all selectable items and updates their selection state
     * based on their intersection with the current selection lasso.
     * @param {object} currentSelectionBounds - The calculated bounding box of the selection lasso.
     */
    _manageSelectionStates: function (currentSelectionBounds) {
      const selfReference = this;
      const selectionTolerance = this.options.tolerance;
      const lastEvent = this.lastRecordedMouseEvent;
      const modifierKeyPressed = lastEvent && (lastEvent.metaKey || lastEvent.ctrlKey);

      this.selectableItemsCollection.each(function () {
        const itemData = $.data(this, 'selection-tracking-data');
        if (!itemData || itemData.refElement === selfReference.element[0]) {
          return; // Skip if no data or if it's the host element itself
        }

        const itemJqElement = itemData.jqElement;
        const itemRelative = itemData.relativeCoords;
        let isIntersecting = false;

        // Check for intersection based on the configured tolerance
        if (selectionTolerance === 'touch') {
          // 'touch' means any overlap
          isIntersecting = !(itemRelative.xCoord > currentSelectionBounds.x2 ||
                             itemRelative.rightEdge < currentSelectionBounds.x1 ||
                             itemRelative.yCoord > currentSelectionBounds.y2 ||
                             itemRelative.bottomEdge < currentSelectionBounds.y1);
        } else if (selectionTolerance === 'fit') {
          // 'fit' means the item must be entirely contained within the selection
          isIntersecting = (itemRelative.xCoord >= currentSelectionBounds.x1 &&
                            itemRelative.rightEdge <= currentSelectionBounds.x2 &&
                            itemRelative.yCoord >= currentSelectionBounds.y1 &&
                            itemRelative.bottomEdge <= currentSelectionBounds.y2);
        }

        if (isIntersecting) {
          // Item is within the selection area
          if (itemData.selectedState) {
            itemJqElement.removeClass('ui-selected');
            itemData.selectedState = false;
          }
          if (itemData.unselectingState) {
            itemJqElement.removeClass('ui-unselecting');
            itemData.unselectingState = false;
          }
          if (!itemData.selectingState) {
            itemJqElement.addClass('ui-selecting');
            itemData.selectingState = true;
            // Trigger the 'selecting' event for this item
            selfReference._trigger('selecting', lastEvent, {
              selecting: itemData.refElement
            });
          }
        } else {
          // Item is outside the selection area
          if (itemData.selectingState) {
            if (modifierKeyPressed && itemData.initialSelectionState) {
              // If modifier key held and was initially selected, revert to selected
              itemJqElement.removeClass('ui-selecting');
              itemData.selectingState = false;
              itemJqElement.addClass('ui-selected');
              itemData.selectedState = true;
            } else {
              // Otherwise, remove 'selecting' state, potentially move to 'unselecting'
              itemJqElement.removeClass('ui-selecting');
              itemData.selectingState = false;
              if (itemData.initialSelectionState) {
                itemJqElement.addClass('ui-unselecting');
                itemData.unselectingState = true;
              }
              // Trigger the 'unselecting' event
              selfReference._trigger('unselecting', lastEvent, {
                unselecting: itemData.refElement
              });
            }
          }
          if (itemData.selectedState) {
            if (!modifierKeyPressed && !itemData.initialSelectionState) {
              // If not modifier key and not initially selected, then unselect
              itemJqElement.removeClass('ui-selected');
              itemData.selectedState = false;
              itemJqElement.addClass('ui-unselecting');
              itemData.unselectingState = true;
              // Trigger the 'unselecting' event
              selfReference._trigger('unselecting', lastEvent, {
                unselecting: itemData.refElement
              });
            }
          }
        }
      });
    },

    /**
     * Overrides the base _mouseDrag method to incorporate auto-scrolling logic.
     * @param {object} dragEventDetails - The original mousemove event object.
     * @returns {boolean} Always returns false to prevent default browser actions.
     */
    _handleMouseMovement: function (dragEventDetails) {
      if (this.options.disabled || !this.isDraggingActive) {
        return false; // Early exit if component is disabled or not dragging
      }
      this.lastRecordedMouseEvent = dragEventDetails;

      const scrollEffectResult = this._evaluateAndApplyScrolling();
      this._manageAutoScrollTimer({
        keepScrolling: scrollEffectResult.didScroll
      });
      this._processInteractionUpdates({
        shouldRefreshLassoDisplay: true,
        currentScrollLeft: scrollEffectResult.currentScrollLeft,
        currentScrollTop: scrollEffectResult.currentScrollTop
      });

      return false;
    },

    /**
     * Orchestrates the calculation and updating of selection states and the lasso display.
     * This method can be called repeatedly during auto-scrolling.
     * @param {object} updateFlags - Options indicating which parts of the UI to update.
     */
    _processInteractionUpdates: function (updateFlags) {
      // Re-evaluate scrolling in case the mouse moved (or during interval)
      const scrollingActionOutcome = this._evaluateAndApplyScrolling();

      const currentRelativePoint = this._computeRelativeCoords(
        { x: this.lastRecordedMouseEvent.pageX, y: this.lastRecordedMouseEvent.pageY },
        scrollingActionOutcome.currentScrollLeft,
        scrollingActionOutcome.currentScrollTop
      );

      const calculatedSelectionArea = this._determineSelectionArea({
        x: currentRelativePoint.x,
        y: currentRelativePoint.y
      });

      if (updateFlags.shouldRefreshLassoDisplay) {
        this._adjustLassoDisplay({
          currentScrollLeft: scrollingActionOutcome.currentScrollLeft,
          currentScrollTop: scrollingActionOutcome.currentScrollTop,
          x1: calculatedSelectionArea.x1,
          y1: calculatedSelectionArea.y1,
          x2: calculatedSelectionArea.x2,
          y2: calculatedSelectionArea.y2
        });
      }
      this._manageSelectionStates({
        x1: calculatedSelectionArea.x1,
        y1: calculatedSelectionArea.y1,
        x2: calculatedSelectionArea.x2,
        y2: calculatedSelectionArea.y2
      });
    },

    /**
     * Manages the auto-scroll interval timer, starting it when scrolling is needed
     * and stopping it when no longer required.
     * @param {object} scrollControl - Contains a flag `keepScrolling` to indicate if scrolling should continue.
     */
    _manageAutoScrollTimer: function (scrollControl) {
      const componentInstance = this; // Cache 'this' for the setInterval callback

      if (scrollControl.keepScrolling && !this.autoScrollTimerId) {
        // Start the interval if scrolling is needed and not already active
        this.autoScrollTimerId = setInterval(function () {
          // Only update the UI without refreshing the lasso helper (it's handled by mousemove)
          componentInstance._processInteractionUpdates({
            shouldRefreshLassoDisplay: false
          });
        }, this.options.scrollDelayMs);
      } else if (!scrollControl.keepScrolling && this.autoScrollTimerId) {
        // Stop the interval if scrolling is no longer needed but the timer is active
        this._stopAutoScrolling();
      }
    },

    /**
     * Clears the auto-scroll interval, effectively stopping continuous scrolling.
     */
    _stopAutoScrolling: function () {
      if (this.autoScrollTimerId) {
        clearInterval(this.autoScrollTimerId);
        this.autoScrollTimerId = null;
      }
    },

    /**
     * Extends the base _mouseStop method to ensure auto-scrolling is halted
     * when the mouse interaction ends.
     * @param {object} terminationEvent - The original mouseup event object.
     * @returns {boolean} The return value from the parent's _mouseStop method.
     */
    _finalizeInteraction: function (terminationEvent) {
      this._stopAutoScrolling(); // Ensure any active auto-scroll is stopped
      this.isDraggingActive = false; // Reset dragging flag
      const baseMethodResult = $.ui.selectable.prototype._mouseStop.call(this, terminationEvent);
      return baseMethodResult;
    }
  });
})(jQuery);