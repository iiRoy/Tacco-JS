(function (jq) {
  'use strict';
  jq.widget('ui.scrollableSelectionArea', jq.ui.selectable, {
    cfg: {
      // If an item is supplied here, utilize it for scrolling instead of the component's main item
      viewportElement: null,
      // When the selection is this close to the top/bottom boundaries, initiate scrolling
      scrollProximityX: 7,
      // When the selection is this close to the side boundaries, initiate scrolling
      scrollProximityY: 7,
      scrollIncrement: 30, // In pixels
      scrollDelayMs: 120 // In milliseconds
    },

    // This is a slightly altered version of the original _create function,
    // we simply include the item's positional data as well
    _initializeComponent: function () {
      this.element.addClass('comp-selectable');
      this.isDragging = false;
      this.guideClassNames = ['no-up', 'no-right-side', 'no-down', 'no-left-side'];
      this.viewportElement = this.cfg.viewportElement || this.element;
      this.updateItemData();
      this._mouseInit();
      this.selectionGuide = jq('<div class="comp-selection-guide"></div>');
    },

    // Refresh child items data based on a filter
    updateItemData: function () {
      var itemOffset = this.viewportElement.offset();
      var currentScrollLeft = this.viewportElement.prop('scrollLeft');
      var currentScrollTop = this.viewportElement.prop('scrollTop');
      this.targetItems = jq(this.cfg.filter, this.viewportElement[0]);
      this.targetItems.addClass('comp-selectee');
      this.targetItems.each(function () {
        var $targetItem = jq(this),
          itemPos = $targetItem.offset();
        jq.data(this, 'selection-data', {
          htmlItem: this,
          $htmlItem: $targetItem,
          coordLeft: itemPos.left,
          coordTop: itemPos.top,
          coordRight: itemPos.left + $targetItem.outerWidth(),
          coordBottom: itemPos.top + $targetItem.outerHeight(),
          // Positional data relative to the item's 0,0
          relativeCoords: {
            coordLeft: itemPos.left - itemOffset.left + currentScrollLeft,
            coordTop: itemPos.top - itemOffset.top + currentScrollTop,
            coordRight: itemPos.left - itemOffset.left + currentScrollLeft +
              $targetItem.outerWidth(),
            coordBottom: itemPos.top - itemOffset.top + currentScrollTop +
              $targetItem.outerHeight()
          },
          initiallyMarked: false,
          currentlyMarked: $targetItem.hasClass('comp-selected'),
          beingMarked: $targetItem.hasClass('comp-selecting'),
          beingUnmarked: $targetItem.hasClass('comp-unselecting')
        });
      });
    },

    // Upon starting the drag, compute the item's current scroll states,
    // relative to the item's 0,0 offset
    _beginInteraction: function (inputEvent) {
      var itemPosition = this.viewportElement.offset();
      if (
        (inputEvent.pageX > this.viewportElement.prop('clientWidth') + itemPosition.left) ||
        (inputEvent.pageY > this.viewportElement.prop('clientHeight') + itemPosition.top)
      ) {
        return false;
      }
      var resultValue = jq.ui.selectable.prototype._mouseStart.call(this,
        inputEvent);
      this.previousMouseEvent = null;
      this.scrollingMetrics = {
        // The item's 0,0 offset in relation to the document
        itemOffset: this.viewportElement.offset(),
        // The maximum scrollable width (visible width + scrollLeft)
        maxScrollWidth: this.viewportElement.prop('scrollWidth'),
        // The maximum scrollable height (visible height + scrollTop)
        maxScrollHeight: this.viewportElement.prop('scrollHeight'),
        // The visible width (excluding scrollbars)
        visibleWidth: this.viewportElement.prop('clientWidth'),
        // The visible height (excluding scrollbars)
        visibleHeight: this.viewportElement.prop('clientHeight')
      };
      // Relative to item's 0
      this.scrollingMetrics.dragStartCoordX = inputEvent.pageX - this.scrollingMetrics.itemOffset
        .left + this.viewportElement.prop('scrollLeft');
      // Relative to item's 0
      this.scrollingMetrics.dragStartCoordY = inputEvent.pageY - this.scrollingMetrics.itemOffset
        .top + this.viewportElement.prop('scrollTop');
      this.scrollIntervalHandle = null;
      return resultValue;
    },

    // Compute/redraw the selection lasso, keeping it within
    // the scrolled item
    _adjustVisualAid: function (inputOptions) {
      var xCoord1, yCoord1, xCoord2, yCoord2; // Absolute coordinates for the lasso
      var lassoClassList = [];
      if (inputOptions.x1 - inputOptions.currentScrollLeft < 0) {
        lassoClassList.push('no-left-side');
        xCoord1 = this.scrollingMetrics.itemOffset.left;
      } else {
        xCoord1 = this.scrollingMetrics.itemOffset.left + inputOptions.x1 - inputOptions.currentScrollLeft;
      }
      if (inputOptions.y1 - inputOptions.currentScrollTop < 0) {
        lassoClassList.push('no-up');
        yCoord1 = this.scrollingMetrics.itemOffset.top;
      } else {
        yCoord1 = this.scrollingMetrics.itemOffset.top + inputOptions.y1 - inputOptions.currentScrollTop;
      }
      if (inputOptions.x2 - inputOptions.currentScrollLeft > this.scrollingMetrics.visibleWidth) {
        lassoClassList.push('no-right-side');
        xCoord2 = this.scrollingMetrics.itemOffset.left + this.scrollingMetrics.visibleWidth;
      } else {
        xCoord2 = this.scrollingMetrics.itemOffset.left + inputOptions.x2 - inputOptions.currentScrollLeft;
      }
      if (inputOptions.y2 - inputOptions.currentScrollTop > this.scrollingMetrics.visibleHeight) {
        lassoClassList.push('no-down');
        yCoord2 = this.scrollingMetrics.itemOffset.top + this.scrollingMetrics.visibleHeight;
      } else {
        yCoord2 = this.scrollingMetrics.itemOffset.top + inputOptions.y2 - inputOptions.currentScrollTop;
      }
      for (var idx = 0; idx < this.guideClassNames.length; idx++) {
        var aClassName = this.guideClassNames[idx];
        if (jq.inArray(aClassName, lassoClassList) !== -1) {
          this.selectionGuide.addClass(aClassName);
        } else {
          this.selectionGuide.removeClass(aClassName);
        }
      }
      this.selectionGuide.css({
        left: xCoord1,
        top: yCoord1,
        width: xCoord2 - xCoord1,
        height: yCoord2 - yCoord1
      });
    },

    // If the mouse cursor is close to the item's borders, scroll
    _evaluateAutoScroll: function () {
      var currentScrollLeft = this.viewportElement.prop('scrollLeft');
      var currentScrollTop = this.viewportElement.prop('scrollTop');

      var shouldContinueScrolling = false;
      // Scroll if near edges or beyond them
      if (this.previousMouseEvent.pageX - this.scrollingMetrics.itemOffset.left <
        this.cfg.scrollProximityX && currentScrollLeft > 0) {
        currentScrollLeft = currentScrollLeft < this.cfg.scrollIncrement ? 0 :
          currentScrollLeft - this.cfg.scrollIncrement;
        this.viewportElement.prop('scrollLeft', currentScrollLeft);
        shouldContinueScrolling = true;
      }
      if (this.previousMouseEvent.pageY - this.scrollingMetrics.itemOffset.top <
        this.cfg.scrollProximityY && currentScrollTop > 0) {
        currentScrollTop = currentScrollTop < this.cfg.scrollIncrement ? 0 : currentScrollTop -
          this.cfg.scrollIncrement;
        this.viewportElement.prop('scrollTop', currentScrollTop);
        shouldContinueScrolling = true;
      }
      if (this.previousMouseEvent.pageX - this.scrollingMetrics.itemOffset.left >
        this.scrollingMetrics.visibleWidth - this.cfg.scrollProximityX && this.scrollingMetrics
        .maxScrollWidth > currentScrollLeft + this.scrollingMetrics.visibleWidth) {
        currentScrollLeft = currentScrollLeft + this.cfg.scrollIncrement > this.scrollingMetrics
          .maxScrollWidth - this.scrollingMetrics.visibleWidth ? this.scrollingMetrics.maxScrollWidth -
          this.scrollingMetrics.visibleWidth : currentScrollLeft + this.cfg.scrollIncrement;
        this.viewportElement.prop('scrollLeft', currentScrollLeft);
        shouldContinueScrolling = true;
      }
      if (this.previousMouseEvent.pageY - this.scrollingMetrics.itemOffset.top >
        this.scrollingMetrics.visibleHeight - this.cfg.scrollProximityY && this.scrollingMetrics
        .maxScrollHeight > currentScrollTop + this.scrollingMetrics.visibleHeight) {
        currentScrollTop = currentScrollTop + this.cfg.scrollIncrement > this.scrollingMetrics
          .maxScrollHeight - this.scrollingMetrics.visibleHeight ? this.scrollingMetrics
          .maxScrollHeight - this.scrollingMetrics.visibleHeight : currentScrollTop +
          this.cfg.scrollIncrement;
        this.viewportElement.prop('scrollTop', currentScrollTop);
        shouldContinueScrolling = true;
      }
      return {
        currentScrollLeft: currentScrollLeft,
        currentScrollTop: currentScrollTop,
        shouldContinueScrolling: shouldContinueScrolling
      };
    },

    // Compute a relative position to the item's 0,0 offset,
    // from the initial drag event's coordinates
    _determineRelativeCoords: function (coordOptions) {
      var relativeX = coordOptions.xCoord - this.scrollingMetrics.itemOffset.left +
        coordOptions.currentScrollLeft;
      var relativeY = coordOptions.yCoord - this.scrollingMetrics.itemOffset.top +
        coordOptions.currentScrollTop;
      return {
        xCoord: relativeX,
        yCoord: relativeY
      };
    },

    // Compute relative area positions relative to the offset item
    _computeBoundingBox: function (coordOptions) {
      var relXval1 = coordOptions.xPosition < this.scrollingMetrics.dragStartCoordX ? coordOptions.xPosition :
        this.scrollingMetrics.dragStartCoordX;
      var relYval1 = coordOptions.yPosition < this.scrollingMetrics.dragStartCoordY ? coordOptions.yPosition :
        this.scrollingMetrics.dragStartCoordY;
      var relXval2 = coordOptions.xPosition > this.scrollingMetrics.dragStartCoordX ? coordOptions.xPosition :
        this.scrollingMetrics.dragStartCoordX;
      var relYval2 = coordOptions.yPosition > this.scrollingMetrics.dragStartCoordY ? coordOptions.yPosition :
        this.scrollingMetrics.dragStartCoordY;
      return {
        x1: relXval1,
        y1: relYval1,
        x2: relXval2,
        y2: relYval2
      };
    },

    // Update the states of selected items
    _modifySelectionStates: function (areaOptions) {
      var selfRef = this;
      this.targetItems.each(function () {
        var itemData = jq.data(this, 'selection-data'),
          isHit = false;

        // Prevent guide from being selected if appendTo: selectable
        if (!itemData || itemData.htmlItem === selfRef.element[0]) {
          return;
        }

        if (selfRef.cfg.tolerance === 'touch') {
          isHit = (!(itemData.relativeCoords.coordLeft > areaOptions.x2 || itemData.relativeCoords
            .coordRight < areaOptions.x1 || itemData.relativeCoords.coordTop > areaOptions.y2 ||
            itemData.relativeCoords.coordBottom < areaOptions.y1));
        } else if (selfRef.cfg.tolerance === 'fit') {
          isHit = (itemData.relativeCoords.coordLeft > areaOptions.x1 && itemData.relativeCoords
            .coordRight < areaOptions.x2 && itemData.relativeCoords.coordTop > areaOptions.y1 &&
            itemData.relativeCoords.coordBottom < areaOptions.y2);
        }

        if (isHit) {
          // SELECT
          if (itemData.currentlyMarked) {
            itemData.$htmlItem.removeClass('comp-selected');
            itemData.currentlyMarked = false;
          }
          if (itemData.beingUnmarked) {
            itemData.$htmlItem.removeClass('comp-unselecting');
            itemData.beingUnmarked = false;
          }
          if (!itemData.beingMarked) {
            itemData.$htmlItem.addClass('comp-selecting');
            itemData.beingMarked = true;
            // selectable MARKING callback
            selfRef._trigger('marking', selfRef.previousMouseEvent, {
              marking: itemData.htmlItem
            });
          }
        } else {
          // UNSELECT
          if (itemData.beingMarked) {
            if ((selfRef.previousMouseEvent.metaKey || selfRef.previousMouseEvent.ctrlKey) &&
              itemData.initiallyMarked) {
              itemData.$htmlItem.removeClass('comp-selecting');
              itemData.beingMarked = false;
              itemData.$htmlItem.addClass('comp-selected');
              itemData.currentlyMarked = true;
            } else {
              itemData.$htmlItem.removeClass('comp-selecting');
              itemData.beingMarked = false;
              if (itemData.initiallyMarked) {
                itemData.$htmlItem.addClass('comp-unselecting');
                itemData.beingUnmarked = true;
              }
              // Selectable UNMARKING callback
              selfRef._trigger('unmarking', selfRef.previousMouseEvent, {
                unmarking: itemData.htmlItem
              });
            }
          }
          if (itemData.currentlyMarked) {
            if (!selfRef.previousMouseEvent.metaKey && !selfRef.previousMouseEvent.ctrlKey && !
              itemData.initiallyMarked) {
              itemData.$htmlItem.removeClass('comp-selected');
              itemData.currentlyMarked = false;

              itemData.$htmlItem.addClass('comp-unselecting');
              itemData.beingUnmarked = true;
              // Selectable UNMARKING callback
              selfRef._trigger('unmarking', selfRef.previousMouseEvent, {
                unmarking: itemData.htmlItem
              });
            }
          }
        }
      });
    },

    // The original _mouseDrag function overwritten by our implementation
    _handleMouseMovement: function (inputEvent) {
      this.isDragging = true;
      if (this.cfg.disabled) {
        return;
      }
      this.previousMouseEvent = inputEvent;

      var scrollResult = this._evaluateAutoScroll();

      this._manageScrollLoop({
        shouldContinueScrolling: scrollResult.shouldContinueScrolling
      });
      this._updateDisplayElements({
        performGuideUpdate: true
      });

      return false;
    },

    // Perform the actual calculations/updates for positions/elements
    _updateDisplayElements: function (displayOptions) {
      var scrollData = this._evaluateAutoScroll({
        pageX: this.previousMouseEvent.pageX,
        pageY: this.previousMouseEvent.pageY
      });
      var relativeCoordinates = this._determineRelativeCoords({
        xCoord: this.previousMouseEvent.pageX,
        yCoord: this.previousMouseEvent.pageY,
        currentScrollLeft: scrollData.currentScrollLeft,
        currentScrollTop: scrollData.currentScrollTop
      });
      var boundingBox = this._computeBoundingBox({
        xPosition: relativeCoordinates.xCoord,
        yPosition: relativeCoordinates.yCoord
      });
      if (displayOptions.performGuideUpdate) {
        this._adjustVisualAid({
          currentScrollLeft: scrollData.currentScrollLeft,
          currentScrollTop: scrollData.currentScrollTop,
          x1: boundingBox.x1,
          y1: boundingBox.y1,
          x2: boundingBox.x2,
          y2: boundingBox.y2
        });
      }
      this._modifySelectionStates({
        x1: boundingBox.x1,
        y1: boundingBox.y1,
        x2: boundingBox.x2,
        y2: boundingBox.y2
      });
    },

    // Start the automatic scrolling if necessary
    _manageScrollLoop: function (loopOptions) {
      var selfRef = this;
      if (loopOptions.shouldContinueScrolling && !this.scrollIntervalHandle) {
        this.scrollIntervalHandle = setInterval(function () {
          selfRef._updateDisplayElements({
            performGuideUpdate: false
          });
        }, this.cfg.scrollDelayMs);
      }
      if (!loopOptions.shouldContinueScrolling && this.scrollIntervalHandle)
        this._stopScrollLoop();
    },

    // Terminate the autoscroll interval
    _stopScrollLoop: function () {
      // Halt scrolling
      if (this.scrollIntervalHandle)
        clearInterval(this.scrollIntervalHandle);
      this.scrollIntervalHandle = null;
    },

    // The original _mouseStop event enhanced with the interval clearer
    _endInteraction: function (inputEvent) {
      this._stopScrollLoop();
      var stopResult = jq.ui.selectable.prototype._mouseStop.call(this,
        inputEvent);
      return stopResult;
    }
  });
})(jQuery);