(function (moduleFactory) {
    if (typeof define === 'function' && define.amd) {
        // AMD module registration
        define(['jquery'], moduleFactory);
    } else if (typeof exports === 'object' && typeof module === 'object') {
        // CommonJS module support
        module.exports = moduleFactory(require('jquery'));
    } else {
        // Browser global exposure
        moduleFactory(window.jQuery);
    }
}(function ($) {

  // Unique identifier for the plugin instance data and CSS classes.
  const interactionIdentifier = 'areaPicker';

  /**
   * Base configuration settings. These can be adjusted via plugin initialization
   * or subsequent calls to the 'option' method.
   */
  const baseConfig = {
    // Minimum pixel displacement before a selection gesture is recognized.
    dragActivationDistance: 0,

    // Controls the active state of the selection functionality.
    isDisabled: false,

    // CSS selector for elements that, when clicked, prevent selection initiation.
    exclusionSelector: ':input, option, button, textarea, a',

    // CSS selector to identify child elements eligible for selection.
    itemSelector: '.selectable-item',

    // Pixel distance from the viewport edge to trigger automatic scrolling.
    scrollEdgeThreshold: 75,

    // Multiplier for adjusting the automatic scroll speed.
    scrollVelocityFactor: 1.2,

    // Optional custom scrolling module. If not provided, a default implementation is used.
    // The custom module should return an object conforming to the scroller interface.
    customScroller: null,

    // Optional custom position resolver for selectable elements.
    // If null, a default offset-based resolver is employed.
    // The custom resolver should accept an element and return an object
    // with 'coordTop', 'coordLeft', 'elemWidth', and 'elemHeight' properties.
    customPositioner: null
  };

  /**
   * Scroller implementation for handling native document (browser window) scrolling.
   * Activated when the selection box nears the browser window boundaries.
   *
   * @param {!Element} hostElement The primary container element where the plugin is applied.
   */
  const pageAreaScroller = function(hostElement) {

    // Retrieve cached dimensions of the host container.
    const targetAreaDims = $(hostElement).data(interactionIdentifier).hostAreaDimensions;

    // Determine current browser viewport dimensions.
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    /**
     * @return {!Element} The DOM element that is scrolled by this module.
     *                    Typically, this is the document's root element.
     */
    function getScrollableTarget() {
      return document.documentElement;
    }

    /**
     * Provides the current coordinates of the viewport edges that define
     * the scrollable boundaries.
     *
     * @return {!Object.<string, number>} An object with 'top', 'right', 'bottom', 'left'
     *                                    representing document-relative edge positions.
     */
    function getViewScrollBorders() {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const currentScrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      return {
          top: currentScrollTop,
          right: currentScrollLeft + viewportWidth,
          bottom: currentScrollTop + viewportHeight,
          left: currentScrollLeft
      };
    }

    /**
     * Calculates the remaining scrollable distance in each direction before
     * hitting the host container's edges. This prevents scrolling past the
     * container's visible area.
     *
     * @return {!Object.<string, number>} An object with 'top', 'right', 'bottom', 'left'
     *                                    indicating available scroll distances (in pixels).
     */
    function getAvailableScrollSpace() {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const currentScrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      const spaceAbove = currentScrollTop - targetAreaDims.offsetTop;
      const spaceRight = (targetAreaDims.offsetLeft + targetAreaDims.width) - (currentScrollLeft + viewportWidth);
      const spaceBelow = (targetAreaDims.offsetTop + targetAreaDims.height) - (currentScrollTop + viewportHeight);
      const spaceLeft = currentScrollLeft - targetAreaDims.offsetLeft;

      return {
          top: Math.max(0, spaceAbove),
          right: Math.max(0, spaceRight),
          bottom: Math.max(0, spaceBelow),
          left: Math.max(0, spaceLeft)
      };
    }

    /**
     * Executes the scroll action for the browser window.
     *
     * @param {string} axis The scrolling direction: 'vertical' or 'horizontal'.
     * @param {number} delta The amount to scroll, in pixels. Positive for down/right, negative for up/left.
     */
    function performScroll(axis, delta) {
      if (axis === 'vertical') {
        window.scrollBy(0, delta);
      } else { // 'horizontal'
        window.scrollBy(delta, 0);
      }
    }

    /**
     * Returns any offset to apply to selectable element positions due to scrolling.
     * For native browser scrolling, this is typically zero.
     *
     * @return {!Object.<string, number>} An object with 'top' and 'left' offsets.
     */
    function getScrollOffsetAdjustment() {
      return { top: 0, left: 0 };
    }

    return {
      getScrollableTarget: getScrollableTarget,
      getViewScrollBorders: getViewScrollBorders,
      getAvailableScrollSpace: getAvailableScrollSpace,
      performScroll: performScroll,
      getScrollOffsetAdjustment: getScrollOffsetAdjustment,

      // This scroller is chained to the container scroller, enabling a fallback
      // to container-level scrolling once document scrolling limits are reached.
      nextScroller: containerViewMover(hostElement)
    };
  };

  /**
   * Scroller implementation for managing scrolling within the host container itself.
   * This is used when the container has its own scrollbars and the selection box
   * approaches its internal viewport edges.
   *
   * @param {!Element} hostElement The primary container element where the plugin is applied.
   */
  const containerViewMover = function(hostElement) {

    const targetAreaDims = $(hostElement).data(interactionIdentifier).hostAreaDimensions;

    /**
     * Calculates the scrollable distance remaining within the host container's
     * viewport in each direction.
     *
     * @return {!Object.<string, number>} An object with 'top', 'right', 'bottom', 'left'
     *                                    indicating available scroll distances (in pixels).
     */
    function getAvailableScrollSpace() {
      const currentElementScrollTop = hostElement.scrollTop;
      const currentElementScrollLeft = hostElement.scrollLeft;

      const spaceAbove = currentElementScrollTop;
      const spaceRight = hostElement.scrollWidth - currentElementScrollLeft - targetAreaDims.width;
      const spaceBelow = hostElement.scrollHeight - currentElementScrollTop - targetAreaDims.height;
      const spaceLeft = currentElementScrollLeft;

      return {
          top: spaceAbove,
          right: spaceRight,
          bottom: spaceBelow,
          left: spaceLeft
      };
    }

    /**
     * Executes the scroll action for the host container's viewport.
     *
     * @param {string} axis The scrolling direction: 'vertical' or 'horizontal'.
     * @param {number} delta The amount to scroll, in pixels. Positive for down/right, negative for up/left.
     */
    function performScroll(axis, delta) {
      const scrollProperty = (axis === 'vertical') ? 'scrollTop' : 'scrollLeft';
      hostElement[scrollProperty] += delta;
    }

    /**
     * Returns any offset to apply to selectable element positions due to scrolling.
     * For native browser scrolling, this is typically zero.
     *
     * @return {!Object.<string, number>} An object with 'top' and 'left' offsets.
     */
    function getScrollOffsetAdjustment() {
      return { top: 0, left: 0 };
    }

    return {
      getAvailableScrollSpace: getAvailableScrollSpace,
      performScroll: performScroll,
      getScrollOffsetAdjustment: getScrollOffsetAdjustment
    };
  };

  /**
   * Provides a default scrollable target element if a custom scroller
   * does not specify one.
   *
   * @return {!Element} The host element itself.
   */
  const retrieveDefaultScrollableTarget = function() {
    return this;
  };

  /**
   * Provides default scrollable border positions if a custom scroller
   * does not specify them. These are based on the host container's dimensions.
   *
   * @return {!Object.<string, number>} An object with 'top', 'right', 'bottom', 'left'
   *                                    representing document-relative edge positions.
   */
  const retrieveDefaultScrollBoundaries = function() {
    const containerData = $(this).data(interactionIdentifier).hostAreaDimensions;
    return {
        top: containerData.offsetTop,
        right: containerData.offsetLeft + containerData.width,
        bottom: containerData.offsetTop + containerData.height,
        left: containerData.offsetLeft
    };
  };

  /**
   * Default position resolver for selectable elements.
   * It determines an element's position and size relative to its offset parent.
   *
   * @param {!Element} targetElement The selectable DOM element.
   * @return {!Object.<string, number>} An object with 'coordTop', 'coordLeft',
   *                                    'elemWidth', and 'elemHeight' properties.
   */
  const standardElementLocator = function(targetElement) {
    return {
      coordTop: targetElement.offsetTop,
      coordLeft: targetElement.offsetLeft,
      elemWidth: targetElement.offsetWidth,
      elemHeight: targetElement.offsetHeight
    };
  };

  /**
   * Determines the sign (positive, negative, or zero) of a given number.
   *
   * @param {number} value The number to check.
   * @return {number} Returns 1 for positive, -1 for negative, and 0 for zero.
   */
  const getDirectionalSign = (value) => {
    if (value === 0) return 0;
    return value > 0 ? 1 : -1;
  };

  /**
   * Sets up the visual components for selection: a transparent overlay and
   * the visible selection rectangle.
   *
   * @param {jQuery} currentElement The jQuery object representing the host container.
   * @param {Object} instanceData The data object associated with the current plugin instance.
   */
  const initializeSelectionFrame = function(currentElement, instanceData) {
    // Remove any existing selection elements to prevent duplicates.
    if (instanceData.selectionOverlay) {
        instanceData.selectionOverlay.remove();
    }
    if (instanceData.selectionFrame) {
        instanceData.selectionFrame.remove();
    }

    instanceData.selectionOverlay = $('<div />', { 'class': `${interactionIdentifier}-blocker` })
        .css({
            position: 'absolute',
            top: 0,
            left: 0,
            height: currentElement.prop('scrollHeight'),
            width: currentElement.prop('scrollWidth'),
            overflow: 'hidden',
            zIndex: 9999 // Ensure it's above other content
        })
        .appendTo(currentElement);

    instanceData.selectionFrame = $('<div />', { 'class': `${interactionIdentifier}-frame` })
        .css({
            position: 'absolute',
            backgroundColor: 'rgba(52, 152, 219, 0.2)', // Light blue semi-transparent
            border: '1px solid #3498db', // Blue border
            boxSizing: 'border-box' // Include padding and border in the element's total width and height
        })
        .appendTo(instanceData.selectionOverlay);
  };

  /**
   * Prepares all eligible selectable elements for the gesture. This involves
   * caching their positions and clearing any previous selection states.
   *
   * @param {jQuery} hostElement The jQuery object representing the host container.
   * @param {Object} instanceData The data object associated with the current plugin instance.
   */
  const resetAndCacheElements = function(hostElement, instanceData) {
    let selectableCollection = [];
    const itemFilter = instanceData.settings.itemSelector;

    // Remove previously applied selected class from all potential items.
    hostElement.find(`.${interactionIdentifier}-selected-item`).removeClass(`${interactionIdentifier}-selected-item`);

    // Iterate through filtered elements and store their position data.
    hostElement.find(itemFilter).each(function() {
      const itemElement = this;
      const positionResolver = instanceData.settings.customPositioner || standardElementLocator;
      const itemPositionData = positionResolver.call(hostElement[0], itemElement);

      // Basic validation for position data.
      if (!itemPositionData || typeof itemPositionData.coordTop === 'undefined' || typeof itemPositionData.elemWidth === 'undefined') {
          console.warn(`AreaPicker: Invalid position data for selectable item. Skipping.`, itemElement);
          return;
      }

      selectableCollection.push({
        elementRef: itemElement,
        positionInfo: itemPositionData,
        isSelected: false // Initial state for the current gesture
      });
    });
    instanceData.selectableItems = selectableCollection;
  };

  /**
   * Updates the visual dimensions and position of the selection rectangle
   * based on the current mouse position relative to the initial click.
   *
   * @param {jQuery} hostElement The jQuery object representing the host container.
   * @param {Object} instanceData The data object associated with the current plugin instance.
   * @param {jQuery.Event} eventObject The current mousemove event.
   */
  const recalculateSelectionBounds = function(hostElement, instanceData, eventObject) {
    const startY = instanceData.initialClickPosition.pageY;
    const startX = instanceData.initialClickPosition.pageX;
    const currentY = eventObject.pageY;
    const currentX = eventObject.pageX;

    const topCoord = Math.min(startY, currentY);
    const leftCoord = Math.min(startX, currentX);
    const boxHeight = Math.abs(startY - currentY);
    const boxWidth = Math.abs(startX - currentX);

    // Adjust for the host container's document offset and current scroll position.
    const containerRelativeTop = topCoord - instanceData.hostAreaDimensions.offsetTop + hostElement.scrollTop();
    const containerRelativeLeft = leftCoord - instanceData.hostAreaDimensions.offsetLeft + hostElement.scrollLeft();

    instanceData.currentSelectionBounds = {
      top: containerRelativeTop,
      left: containerRelativeLeft,
      height: boxHeight,
      width: boxWidth
    };
    instanceData.selectionFrame.css(instanceData.currentSelectionBounds);
  };

  /**
   * Manages automatic scrolling of the viewport (either document or container)
   * if the selection box approaches its edges.
   *
   * @param {jQuery} hostElement The jQuery object representing the host container.
   * @param {Object} instanceData The data object associated with the current plugin instance.
   * @param {jQuery.Event} latestMouseEvent The most recent mousemove event.
   * @param {number} lastScrollTimestamp The timestamp of the previous scroll operation.
   */
  const handleBoundaryScroll = function(hostElement, instanceData, latestMouseEvent, lastScrollTimestamp) {
    const currentTimestamp = Date.now();
    // Throttle scrolling to prevent excessive CPU usage.
    if (lastScrollTimestamp && (currentTimestamp - lastScrollTimestamp < 50)) {
        return;
    }

    const currentScroller = instanceData.activeScroller;
    if (!currentScroller) return; // No scroller active.

    const scrollThreshold = instanceData.settings.scrollEdgeThreshold;
    const scrollVelocity = instanceData.settings.scrollVelocityFactor;

    // Determine the scrollable borders for the current scroller.
    const borders = (currentScroller.getViewScrollBorders || retrieveDefaultScrollBoundaries).call(hostElement[0]);

    // Current mouse position relative to the document.
    const mouseX = latestMouseEvent.pageX;
    const mouseY = latestMouseEvent.pageY;

    let scrollDirection = { x: 0, y: 0 };
    let scrollAmountX = 0;
    let scrollAmountY = 0;

    // Evaluate vertical scrolling needs.
    if (mouseY < borders.top + scrollThreshold) {
      scrollDirection.y = -1; // Scroll up
      scrollAmountY = Math.max(1, Math.floor((borders.top + scrollThreshold - mouseY) / 5)) * scrollVelocity;
    } else if (mouseY > borders.bottom - scrollThreshold) {
      scrollDirection.y = 1; // Scroll down
      scrollAmountY = Math.max(1, Math.floor((mouseY - (borders.bottom - scrollThreshold)) / 5)) * scrollVelocity;
    }

    // Evaluate horizontal scrolling needs.
    if (mouseX < borders.left + scrollThreshold) {
      scrollDirection.x = -1; // Scroll left
      scrollAmountX = Math.max(1, Math.floor((borders.left + scrollThreshold - mouseX) / 5)) * scrollVelocity;
    } else if (mouseX > borders.right - scrollThreshold) {
      scrollDirection.x = 1; // Scroll right
      scrollAmountX = Math.max(1, Math.floor((mouseX - (borders.right - scrollThreshold)) / 5)) * scrollVelocity;
    }

    // Apply scroll if needed.
    if (scrollDirection.y !== 0 || scrollDirection.x !== 0) {
      const availableSpace = currentScroller.getAvailableScrollSpace();
      let didScroll = false;

      if (scrollDirection.y === -1 && availableSpace.top > 0) {
        const actualScroll = Math.min(scrollAmountY, availableSpace.top);
        currentScroller.performScroll('vertical', -actualScroll);
        didScroll = true;
      } else if (scrollDirection.y === 1 && availableSpace.bottom > 0) {
        const actualScroll = Math.min(scrollAmountY, availableSpace.bottom);
        currentScroller.performScroll('vertical', actualScroll);
        didScroll = true;
      }

      if (scrollDirection.x === -1 && availableSpace.left > 0) {
        const actualScroll = Math.min(scrollAmountX, availableSpace.left);
        currentScroller.performScroll('horizontal', -actualScroll);
        didScroll = true;
      } else if (scrollDirection.x === 1 && availableSpace.right > 0) {
        const actualScroll = Math.min(scrollAmountX, availableSpace.right);
        currentScroller.performScroll('horizontal', actualScroll);
        didScroll = true;
      }

      if (didScroll) {
        instanceData.lastScrollTimestamp = currentTimestamp;
      }

      // If current scroller hit its limits and a nextScroller is available,
      // switch to it for continued scrolling.
      if (!didScroll && currentScroller.nextScroller) {
          instanceData.activeScroller = currentScroller.nextScroller;
          // Re-evaluate with the new scroller immediately.
          handleBoundaryScroll(hostElement, instanceData, latestMouseEvent, currentTimestamp);
      }
    } else {
        // Reset scroller chain if not near any borders.
        instanceData.activeScroller = instanceData.scrollerChain;
    }
  };

  /**
   * Determines which selectable elements intersect with the current selection box
   * and updates their visual state accordingly.
   *
   * @param {jQuery} hostElement The jQuery object representing the host container.
   * @param {Object} instanceData The data object associated with the current plugin instance.
   */
  const evaluateSelectionIntersection = function(hostElement, instanceData) {
    const currentBox = instanceData.currentSelectionBounds;
    if (!currentBox) return;

    const selectedClass = `${interactionIdentifier}-selected-item`;
    const scrollOffset = instanceData.activeScroller ? instanceData.activeScroller.getScrollOffsetAdjustment() : { top: 0, left: 0 };

    instanceData.selectableItems.forEach(item => {
      const itemCoords = item.positionInfo;
      const itemRight = itemCoords.coordLeft + itemCoords.elemWidth;
      const itemBottom = itemCoords.coordTop + itemCoords.elemHeight;

      // Adjust item coordinates by any scroll offset from the active scroller (if applicable).
      const adjustedItemTop = itemCoords.coordTop + scrollOffset.top;
      const adjustedItemLeft = itemCoords.coordLeft + scrollOffset.left;
      const adjustedItemRight = itemRight + scrollOffset.left;
      const adjustedItemBottom = itemBottom + scrollOffset.top;

      const boxRight = currentBox.left + currentBox.width;
      const boxBottom = currentBox.top + currentBox.height;

      // Check for overlap (Axis-Aligned Bounding Box intersection).
      const horizontalOverlap = (currentBox.left < adjustedItemRight) && (boxRight > adjustedItemLeft);
      const verticalOverlap = (currentBox.top < adjustedItemBottom) && (boxBottom > adjustedItemTop);

      const intersects = horizontalOverlap && verticalOverlap;

      if (intersects && !item.isSelected) {
        $(item.elementRef).addClass(selectedClass);
        item.isSelected = true;
      } else if (!intersects && item.isSelected) {
        $(item.elementRef).removeClass(selectedClass);
        item.isSelected = false;
      }
    });
  };

  /**
   * Cleans up all temporary selection components and data.
   *
   * @param {jQuery} hostElement The jQuery object representing the host container.
   * @param {Object} instanceData The data object associated with the current plugin instance.
   */
  const teardownSelectionComponents = function(hostElement, instanceData) {
    if (instanceData.selectionOverlay) {
      instanceData.selectionOverlay.remove();
      instanceData.selectionOverlay = null;
    }
    instanceData.selectionFrame = null;
    instanceData.currentSelectionBounds = null;
    instanceData.selectableItems = [];
    instanceData.isSelecting = false;
    instanceData.initialClickPosition = null;
    instanceData.lastScrollTimestamp = null;
    instanceData.activeScroller = instanceData.scrollerChain; // Reset scroller chain
  };

  /**
   * Private method to dispatch custom events from the plugin.
   *
   * @param {jQuery} hostElement The jQuery object representing the host container.
   * @param {string} eventType The name of the event to trigger (e.g., 'selectionstart').
   * @param {Array} data Optional array of arguments to pass to the event handlers.
   */
  const _emit = function(hostElement, eventType, data = []) {
    hostElement.trigger(`${eventType}.${interactionIdentifier}`, data);
  };

  /**
   * Manages the binding of all necessary interaction events (mousedown, mousemove, mouseup).
   * @param {jQuery} hostElement The jQuery object representing the host container.
   * @param {Object} instanceData The data object associated with the current plugin instance.
   */
  const _bindInteractionEvents = function(hostElement, instanceData) {
    hostElement.on(`mousedown.${interactionIdentifier}Gesture`, function(e) {
      handleInteractionStart.call(this, e, hostElement, instanceData);
    });

    // Mousemove and mouseup need to be bound to the document to capture events
    // even if the mouse leaves the original element.
    $(document).on(`mousemove.${interactionIdentifier}Gesture`, function(e) {
      handleInteractionDrag.call(hostElement[0], e, hostElement, instanceData);
    });
    $(document).on(`mouseup.${interactionIdentifier}Gesture`, function(e) {
      handleInteractionStop.call(hostElement[0], e, hostElement, instanceData);
    });
  };

  /**
   * Manages the unbinding of all interaction events.
   * @param {jQuery} hostElement The jQuery object representing the host container.
   */
  const _unbindInteractionEvents = function(hostElement) {
    hostElement.off(`.${interactionIdentifier}Gesture`);
    $(document).off(`.${interactionIdentifier}Gesture`);
  };

  /**
   * Event handler for the mouse down event, initiating the selection gesture.
   *
   * @param {jQuery.Event} eventObject The mousedown event.
   * @param {jQuery} hostElement The jQuery object representing the host container.
   * @param {Object} instanceData The data object associated with the current plugin instance.
   */
  const handleInteractionStart = function(eventObject, hostElement, instanceData) {
    // Prevent selection if disabled, right-click, or started on an excluded element.
    if (instanceData.settings.isDisabled || eventObject.which === 3 || $(eventObject.target).is(instanceData.settings.exclusionSelector)) {
      return;
    }

    // Cache initial click position and container dimensions.
    instanceData.initialClickPosition = {
      pageX: eventObject.pageX,
      pageY: eventObject.pageY,
      containerScrollTop: hostElement.scrollTop(),
      containerScrollLeft: hostElement.scrollLeft()
    };
    instanceData.hostAreaDimensions = {
      offsetTop: hostElement.offset().top,
      offsetLeft: hostElement.offset().left,
      width: hostElement.outerWidth(),
      height: hostElement.outerHeight()
    };

    // Prevent default text selection behavior.
    eventObject.preventDefault();

    // Prepare for selection, but don't start drawing until drag threshold is met.
    instanceData.isPendingSelection = true;
    _emit(hostElement, 'selectioninit');
  };

  /**
   * Event handler for mouse move events during a potential selection gesture.
   *
   * @param {jQuery.Event} eventObject The mousemove event.
   * @param {jQuery} hostElement The jQuery object representing the host container.
   * @param {Object} instanceData The data object associated with the current plugin instance.
   */
  const handleInteractionDrag = function(eventObject, hostElement, instanceData) {
    if (!instanceData.isPendingSelection && !instanceData.isSelecting) {
      return; // Not in a selection state.
    }

    const { initialClickPosition, settings } = instanceData;
    if (!initialClickPosition) return; // Should not happen if isPendingSelection is true.

    const currentX = eventObject.pageX;
    const currentY = eventObject.pageY;

    // Check if drag threshold has been met to officially start selection.
    if (instanceData.isPendingSelection) {
      const deltaX = Math.abs(currentX - initialClickPosition.pageX);
      const deltaY = Math.abs(currentY - initialClickPosition.pageY);
      if (deltaX < settings.dragActivationDistance && deltaY < settings.dragActivationDistance) {
        return; // Drag threshold not met yet.
      }
      instanceData.isPendingSelection = false;
      instanceData.isSelecting = true;
      initializeSelectionFrame(hostElement, instanceData);
      resetAndCacheElements(hostElement, instanceData);
      _emit(hostElement, 'selectionstart');
    }

    if (instanceData.isSelecting) {
      recalculateSelectionBounds(hostElement, instanceData, eventObject);
      evaluateSelectionIntersection(hostElement, instanceData);
      handleBoundaryScroll(hostElement, instanceData, eventObject, instanceData.lastScrollTimestamp);
      _emit(hostElement, 'selectionprogress');
    }
  };

  /**
   * Event handler for the mouse up event, concluding the selection gesture.
   *
   * @param {jQuery.Event} eventObject The mouseup event.
   * @param {jQuery} hostElement The jQuery object representing the host container.
   * @param {Object} instanceData The data object associated with the current plugin instance.
   */
  const handleInteractionStop = function(eventObject, hostElement, instanceData) {
    if (!instanceData.isPendingSelection && !instanceData.isSelecting) {
      return; // No active selection or pending selection.
    }

    // If a selection was pending but never started (drag threshold not met),
    // we still need to reset the state.
    if (instanceData.isPendingSelection) {
        instanceData.isPendingSelection = false;
        _emit(hostElement, 'selectioncancel');
    }

    if (instanceData.isSelecting) {
      const selectedItems = instanceData.selectableItems.filter(item => item.isSelected).map(item => item.elementRef);
      const unselectedItems = instanceData.selectableItems.filter(item => !item.isSelected).map(item => item.elementRef);

      _emit(hostElement, 'selectioncomplete', [selectedItems, unselectedItems]);
      _emit(hostElement, 'selected', [selectedItems]);
      _emit(hostElement, 'unselected', [unselectedItems]);
    }

    teardownSelectionComponents(hostElement, instanceData);
  };

  /**
   * Core logic for the AreaPicker plugin.
   * @param {Element} element The DOM element to attach the plugin to.
   * @param {Object} options Configuration options.
   */
  function AreaPicker(element, options) {
    this.hostElement = $(element);
    this.instanceData = {
      settings: $.extend({}, baseConfig, options),
      isSelecting: false,
      isPendingSelection: false,
      initialClickPosition: null,
      hostAreaDimensions: null,
      selectionOverlay: null,
      selectionFrame: null,
      currentSelectionBounds: null,
      selectableItems: [],
      scrollerChain: null,
      activeScroller: null,
      lastScrollTimestamp: null
    };

    // Store instance data on the element.
    this.hostElement.data(interactionIdentifier, this.instanceData);

    this._initialize();
  }

  AreaPicker.prototype = {
    /**
     * Initializes the plugin instance.
     * Sets up scrollers and event listeners.
     * @private
     */
    _initialize: function() {
      const { hostElement, instanceData } = this;

      // Setup scroller chain.
      instanceData.scrollerChain = instanceData.settings.customScroller ?
        instanceData.settings.customScroller.call(hostElement[0]) :
        pageAreaScroller(hostElement[0]);
      instanceData.activeScroller = instanceData.scrollerChain;

      // Bind events unless explicitly disabled.
      if (!instanceData.settings.isDisabled) {
        _bindInteractionEvents(hostElement, instanceData);
        hostElement.removeClass(`${interactionIdentifier}-disabled`);
      } else {
        hostElement.addClass(`${interactionIdentifier}-disabled`);
      }

      _emit(hostElement, 'create');
    },

    /**
     * Retrieves the value of a specific setting.
     * @param {string} key The name of the setting.
     * @return {*} The value of the setting.
     * @private
     */
    _fetchSetting: function(key) {
      return this.instanceData.settings[key];
    },

    /**
     * Updates a single setting and applies any associated logic.
     * @param {string} settingKey The name of the setting to update.
     * @param {*} newValue The new value for the setting.
     * @private
     */
    _updateSetting: function(settingKey, newValue) {
      const { hostElement, instanceData } = this;
      if (instanceData.settings[settingKey] !== newValue) {
        instanceData.settings[settingKey] = newValue;

        if (settingKey === 'isDisabled') {
          if (newValue) {
            hostElement.addClass(`${interactionIdentifier}-disabled`);
            _unbindInteractionEvents(hostElement);
          } else {
            hostElement.removeClass(`${interactionIdentifier}-disabled`);
            _bindInteractionEvents(hostElement, instanceData);
          }
        }
        // Additional handling for other specific settings can go here.
        // E.g., if itemSelector changes, need to re-evaluate selectable elements on next gesture.
      }
    },

    /**
     * Public method to retrieve an option.
     * @param {string} key The name of the option.
     * @return {*} The current value of the option.
     */
    option: function(key) {
      if (typeof key === 'string') {
        return this._fetchSetting(key);
      }
      return $.extend({}, this.instanceData.settings); // Return a clone to prevent direct modification.
    },

    /**
     * Public method to set options.
     * @param {string|Object} keyOrObject Either the name of an option or an object of key-value pairs.
     * @param {*} [value] The value if `keyOrObject` is a string.
     */
    setOption: function(keyOrObject, value) {
      if (typeof keyOrObject === 'object') {
        for (const k in keyOrObject) {
          if (Object.prototype.hasOwnProperty.call(keyOrObject, k)) {
            this._updateSetting(k, keyOrObject[k]);
          }
        }
      } else if (typeof keyOrObject === 'string') {
        this._updateSetting(keyOrObject, value);
      }
    },

    /**
     * Disables the selection functionality.
     */
    disable: function() {
      this.setOption('isDisabled', true);
    },

    /**
     * Enables the selection functionality.
     */
    enable: function() {
      this.setOption('isDisabled', false);
    },

    /**
     * Destroys the plugin instance, removing all event listeners and DOM elements.
     */
    destroy: function() {
      const { hostElement, instanceData } = this;

      // Ensure any active selection is cleared.
      teardownSelectionComponents(hostElement, instanceData);

      // Unbind all events associated with this plugin instance.
      _unbindInteractionEvents(hostElement);

      // Remove any lingering classes.
      hostElement.removeClass(`${interactionIdentifier}-disabled`);

      // Clear the data associated with the element.
      hostElement.removeData(interactionIdentifier);

      _emit(hostElement, 'destroy');
      // Nullify references to aid garbage collection.
      this.hostElement = null;
      this.instanceData = null;
    }
  };

  // jQuery plugin definition.
  $.fn.areaPicker = function(methodOrOptions) {
    const args = Array.prototype.slice.call(arguments, 1);

    return this.each(function() {
      let instance = $(this).data(interactionIdentifier);

      // If no instance, create a new one.
      if (!instance) {
        if (typeof methodOrOptions === 'object' || !methodOrOptions) {
          instance = new AreaPicker(this, methodOrOptions);
        } else {
          $.error(`Method ${methodOrOptions} cannot be called on an element before initializing areaPicker.`);
          return;
        }
      }

      // If method is called.
      if (typeof methodOrOptions === 'string') {
        if (typeof instance[methodOrOptions] === 'function' && methodOrOptions.charAt(0) !== '_') {
          instance[methodOrOptions].apply(instance, args);
        } else {
          $.error(`Method ${methodOrOptions} does not exist on jQuery.areaPicker.`);
        }
      }
    });
  };

}));