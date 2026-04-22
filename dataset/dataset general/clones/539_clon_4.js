(function (windowRef) {
  "use strict";

  // Renamed constants and configuration
  const eventNamePrefix = 'viewObserve_';

  const eventType = {
    VISIBILITY_CHANGE: eventNamePrefix + 'visible',
    BOUNDARY_CHANGE: eventNamePrefix + 'boundary',
    TOP_REACHED: eventNamePrefix + 'top',
    BOTTOM_REACHED: eventNamePrefix + 'bottom',
  };

  // State mapping (different numbers, descriptive string keys)
  const PositionState = {
    OUT_OF_VIEW: 0,
    CLIPPED_BOTTOM: 1,
    FULLY_CONTAINED: 2,
    CLIPPED_TOP: 4,
    OVERLAPS_VIEWPORT: 7,
    ABOVE_VIEWPORT: -2,
    BELOW_VIEWPORT: -1,
  };

  const ScrollDirection = {
    DOWN: 1,
    UP: -1,
    NONE: 0,
  };

  const defaultOptions = {
    container: windowRef,
    margins: null, // Renamed from offset
    tickCallback: null, // Renamed from scrolltick
    onVisible: null, // Renamed from appear
    onHidden: null, // Renamed from disappear
    onBoundaryChange: null, // Renamed from positionchange
    onTopReached: null, // Renamed from topreached
    onBottomReached: null, // Renamed from bottomreached
  };

  const globalSettings = {
    updateInterval: 34, // ~30 fps
    PositionState: PositionState, // Expose states for external use
  };

  // --- Utility Functions (replacing jQuery and original helpers) ---

  const getCurrentTime = () => performance.now();

  const parseNumericValue = (val, fallback = 0) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? fallback : num;
  };

  const normalizeMargins = (input) => {
    let topMargin, bottomMargin;
    const type = typeof input;

    if (type === 'number') {
      topMargin = bottomMargin = input;
    } else if (type === 'string') {
      topMargin = bottomMargin = parseNumericValue(input);
    } else if (type === 'undefined' || input === null || type === 'function') {
      topMargin = bottomMargin = 0;
    } else if (type === 'boolean') {
      topMargin = bottomMargin = (input ? 1 : 0);
    } else {
      if (Array.isArray(input)) {
        topMargin = parseNumericValue(input[0]);
        bottomMargin = parseNumericValue(input[1]);
      } else { // Object
        topMargin = parseNumericValue(input.top);
        bottomMargin = parseNumericValue(input.bottom);
      }
    }
    return { top: topMargin, bottom: bottomMargin };
  };

  const measureItemBounds = (containerElement, itemElement, marginT, marginB) => {
    const itemRect = itemElement.getBoundingClientRect();
    let containerScrollTop = 0;
    let containerOffsetTop = 0;

    if (containerElement !== windowRef) {
      const containerRect = containerElement.getBoundingClientRect();
      containerOffsetTop = containerRect.top;
      containerScrollTop = containerElement.scrollTop;
    }

    const itemAbsoluteTop = itemRect.top + (containerElement === windowRef ? windowRef.pageYOffset : containerScrollTop + containerOffsetTop);
    const itemAdjustedTop = Math.round(itemAbsoluteTop - containerOffsetTop + marginT);
    const itemAdjustedBottom = itemAdjustedTop + Math.round(itemElement.offsetHeight + marginB);

    return { top: itemAdjustedTop, bottom: itemAdjustedBottom };
  };

  const determineRelativePosition = (containerElement, itemTop, itemBottom) => {
    let containerScrollTop, containerHeight;
    if (containerElement === windowRef) {
      containerScrollTop = windowRef.pageYOffset;
      containerHeight = windowRef.innerHeight;
    } else {
      containerScrollTop = containerElement.scrollTop;
      containerHeight = containerElement.clientHeight;
    }
    const containerBottom = containerScrollTop + containerHeight;

    if (itemBottom <= containerScrollTop) return PositionState.ABOVE_VIEWPORT;
    if (itemTop >= containerBottom) return PositionState.BELOW_VIEWPORT;

    const isItemTopExposed = (itemTop < containerScrollTop);
    const isItemBottomExposed = (itemBottom > containerBottom);

    if (isItemTopExposed && isItemBottomExposed) return PositionState.OVERLAPS_VIEWPORT;
    if (isItemTopExposed && !isItemBottomExposed) return PositionState.CLIPPED_TOP;
    if (!isItemTopExposed && isItemBottomExposed) return PositionState.CLIPPED_BOTTOM;
    if (!isItemTopExposed && !isItemBottomExposed) return PositionState.FULLY_CONTAINED;

    return PositionState.OUT_OF_VIEW; // Should theoretically not be reached
  };

  const triggerCustomEvent = (element, type, details) => {
    const event = new CustomEvent(type, { detail: details, bubbles: false, cancelable: true });
    element.dispatchEvent(event);
  };

  const evaluateStateTransition = (oldState, newState, scrollDirection) => {
    const events = {
      topReached: false,
      bottomReached: false,
      visibilityChanged: false,
      newVisibility: (newState > PositionState.OUT_OF_VIEW),
    };

    const oldInView = (oldState > PositionState.OUT_OF_VIEW);
    const newInView = (newState > PositionState.OUT_OF_VIEW);

    if (oldInView !== newInView) {
      events.visibilityChanged = true;
    }

    // State groups for topReached/bottomReached as derived from original logic
    const topExposedStates = [PositionState.ABOVE_VIEWPORT, PositionState.CLIPPED_TOP, PositionState.OVERLAPS_VIEWPORT];
    const bottomExposedStates = [PositionState.BELOW_VIEWPORT, PositionState.CLIPPED_BOTTOM, PositionState.OVERLAPS_VIEWPORT];
    const topContainedStates = [PositionState.BELOW_VIEWPORT, PositionState.CLIPPED_BOTTOM, PositionState.FULLY_CONTAINED];
    const bottomContainedStates = [PositionState.ABOVE_VIEWPORT, PositionState.CLIPPED_TOP, PositionState.FULLY_CONTAINED];

    if (scrollDirection === ScrollDirection.DOWN) {
      // Top reached (passing viewport top going down)
      if (topContainedStates.includes(oldState) && topExposedStates.includes(newState)) {
        events.topReached = true;
      }
      // Bottom reached (passing viewport bottom going down)
      if ([PositionState.FULLY_CONTAINED, PositionState.CLIPPED_TOP].includes(newState) && bottomExposedStates.includes(oldState)) {
        events.bottomReached = true;
      }
    } else if (scrollDirection === ScrollDirection.UP) {
      // Bottom reached (passing viewport bottom going up)
      if (bottomExposedStates.includes(oldState) && bottomContainedStates.includes(newState)) {
        events.bottomReached = true;
      }
      // Top reached (passing viewport top going up)
      const newTopReachedStates = [PositionState.ABOVE_VIEWPORT, PositionState.BELOW_VIEWPORT, PositionState.OUT_OF_VIEW, PositionState.OVERLAPS_VIEWPORT];
      if (newTopReachedStates.includes(newState) && topExposedStates.includes(oldState)) {
        events.topReached = true;
      }
    }

    return events;
  };


  // --- TrackedItem (replaces MovingTarget) ---
  const createTrackedItem = (parentMonitor, domElement, initialMargins) => {
    const itemData = {
      element: domElement,
      monitor: parentMonitor,
      currentMargins: normalizeMargins(initialMargins),
      currentTop: 0,
      currentBottom: 0,
      currentPositionState: PositionState.OUT_OF_VIEW,
      isVisible: false,
      attachedHandlers: new Map(),
    };

    const updateItemBoundaries = () => {
      const bounds = measureItemBounds(itemData.monitor.getContainerElement(), itemData.element, itemData.currentMargins.top, itemData.currentMargins.bottom);
      itemData.currentTop = bounds.top;
      itemData.currentBottom = bounds.bottom;
      itemData.currentPositionState = determineRelativePosition(itemData.monitor.getContainerElement(), itemData.currentTop, itemData.currentBottom);
      itemData.isVisible = (itemData.currentPositionState > PositionState.OUT_OF_VIEW);
    };

    const adjustItemMargins = (newMargins) => {
      itemData.currentMargins = normalizeMargins(newMargins);
      updateItemBoundaries();
      return publicAPI;
    };

    const stopObserving = () => {
      itemData.attachedHandlers.forEach((handler, type) => {
        itemData.element.removeEventListener(type, handler);
      });
      itemData.attachedHandlers.clear();
      itemData.monitor.removeItem(publicAPI);
      itemData.element = null;
      itemData.monitor = null;
    };

    const attachEventHandlers = (options) => {
      // Clear previous handlers to avoid duplicates if options change
      itemData.attachedHandlers.forEach((handler, type) => {
        itemData.element.removeEventListener(type, handler);
      });
      itemData.attachedHandlers.clear();

      const eventMap = {
        onVisible: eventType.VISIBILITY_CHANGE,
        onHidden: eventType.VISIBILITY_CHANGE,
        onBoundaryChange: eventType.BOUNDARY_CHANGE,
        onTopReached: eventType.TOP_REACHED,
        onBottomReached: eventType.BOTTOM_REACHED,
      };

      for (const optKey in eventMap) {
        if (typeof options[optKey] === 'function') {
          const customEventType = eventMap[optKey];
          const wrapper = (event) => {
            if (optKey === 'onVisible' && event.detail.newVisibility) {
              options[optKey].call(itemData.element, event);
            } else if (optKey === 'onHidden' && !event.detail.newVisibility) {
              options[optKey].call(itemData.element, event);
            } else if (optKey !== 'onVisible' && optKey !== 'onHidden') {
              options[optKey].call(itemData.element, event);
            }
          };
          itemData.element.addEventListener(customEventType, wrapper);
          itemData.attachedHandlers.set(customEventType, wrapper);
        }
      }
    };

    // Initial setup
    updateItemBoundaries();

    const publicAPI = {
      getElement: () => itemData.element,
      getMonitor: () => itemData.monitor,
      getCurrentPositionState: () => itemData.currentPositionState,
      getIsVisible: () => itemData.isVisible,
      getTop: () => itemData.currentTop,
      getBottom: () => itemData.currentBottom,
      refreshState: updateItemBoundaries,
      adjustMargins: adjustItemMargins,
      remove: stopObserving, // Renamed from destroy
      deactivate: stopObserving, // Renamed from stop
      _attachHandlers: attachEventHandlers, // Internal use
    };
    return publicAPI;
  };


  // --- ScrollMonitor (replaces Scroller) ---
  const monitorInstances = new WeakMap(); // Maps container elements to their ScrollMonitor instances

  const createScrollMonitor = (containerElement) => {
    if (monitorInstances.has(containerElement)) {
      return monitorInstances.get(containerElement);
    }

    const monitorState = {
      container: containerElement,
      trackedItems: new Set(), // Use Set for efficient add/delete
      lastScrollTime: getCurrentTime(),
      lastScrollTop: 0,
      pendingAnimationFrame: null,
      tickCallback: null,
      isListening: false,
    };

    if (containerElement === document) {
      throw new Error('Container should not be `document`. Choose `window` or another block element.');
    }

    const getContainerElement = () => monitorState.container;

    const processScroll = (event, isTrailing = false) => {
      let currentScrollTop;
      let currentScrollHeight;
      if (monitorState.container === windowRef) {
        currentScrollTop = windowRef.pageYOffset;
        currentScrollHeight = windowRef.innerHeight;
      } else {
        currentScrollTop = monitorState.container.scrollTop;
        currentScrollHeight = monitorState.container.clientHeight;
      }

      const scrollDelta = currentScrollTop - monitorState.lastScrollTop;
      if (isTrailing && scrollDelta === 0) {
        return;
      }

      const currentDirection = (scrollDelta >= 0) ? ScrollDirection.DOWN : ScrollDirection.UP;
      monitorState.lastScrollTop = currentScrollTop;

      const eventDetails = {
        direction: currentDirection,
        delta: scrollDelta,
        containerTop: currentScrollTop,
        containerBottom: currentScrollTop + currentScrollHeight,
      };

      if (monitorState.tickCallback) {
        monitorState.tickCallback(eventDetails);
      }

      monitorState.trackedItems.forEach(item => {
        const oldState = item.getCurrentPositionState();
        item.refreshState(); // Recalculate item's position and visibility
        const newState = item.getCurrentPositionState();

        if (oldState !== newState) {
          const transitionEvents = evaluateStateTransition(oldState, newState, currentDirection);

          const itemEventDetails = { ...eventDetails,
            itemPosition: newState,
            itemTop: item.getTop(),
            itemBottom: item.getBottom()
          };

          triggerCustomEvent(item.getElement(), eventType.BOUNDARY_CHANGE, { ...itemEventDetails,
            newVisibility: transitionEvents.newVisibility
          });

          if (transitionEvents.topReached) {
            triggerCustomEvent(item.getElement(), eventType.TOP_REACHED, itemEventDetails);
          }
          if (transitionEvents.bottomReached) {
            triggerCustomEvent(item.getElement(), eventType.BOTTOM_REACHED, itemEventDetails);
          }
          if (transitionEvents.visibilityChanged) {
            triggerCustomEvent(item.getElement(), eventType.VISIBILITY_CHANGE, { ...itemEventDetails,
              newVisibility: transitionEvents.newVisibility
            });
          }
        }
      });
    };

    // Debounced scroll handler using requestAnimationFrame
    const handleScroll = (event) => {
      const now = getCurrentTime();
      if (now - monitorState.lastScrollTime > globalSettings.updateInterval) {
        monitorState.lastScrollTime = now;
        processScroll(event);
        if (monitorState.pendingAnimationFrame) {
          cancelAnimationFrame(monitorState.pendingAnimationFrame);
          monitorState.pendingAnimationFrame = null;
        }
      } else if (!monitorState.pendingAnimationFrame) {
        monitorState.pendingAnimationFrame = requestAnimationFrame(() => {
          monitorState.pendingAnimationFrame = null;
          processScroll(event, true); // Mark as trailing update
        });
      }
    };

    const startListening = () => {
      if (monitorState.isListening) return;
      monitorState.container.addEventListener('scroll', handleScroll, { passive: true });
      monitorState.container.addEventListener('touchmove', handleScroll, { passive: true });
      monitorState.lastScrollTop = (monitorState.container === windowRef) ? windowRef.pageYOffset : monitorState.container.scrollTop;
      processScroll({}); // Initial check
      monitorState.isListening = true;
    };

    const stopListening = () => {
      if (!monitorState.isListening) return;
      monitorState.container.removeEventListener('scroll', handleScroll);
      monitorState.container.removeEventListener('touchmove', handleScroll);
      if (monitorState.pendingAnimationFrame) {
        cancelAnimationFrame(monitorState.pendingAnimationFrame);
        monitorState.pendingAnimationFrame = null;
      }
      monitorState.isListening = false;
    };

    const updateListeningStatus = () => {
      if (monitorState.trackedItems.size > 0 || monitorState.tickCallback) {
        startListening();
      } else {
        stopListening();
      }
    };

    const addItem = (domElement, itemOptions) => {
      const existingItem = Array.from(monitorState.trackedItems).find(item => item.getElement() === domElement);
      if (existingItem) {
        existingItem.adjustMargins(itemOptions.margins);
        existingItem.refreshState();
        existingItem._attachHandlers(itemOptions);
        return existingItem;
      }
      const newItem = createTrackedItem(publicAPI, domElement, itemOptions.margins);
      monitorState.trackedItems.add(newItem);
      newItem._attachHandlers(itemOptions);
      updateListeningStatus();
      return newItem;
    };

    const removeItem = (itemToRemove) => {
      monitorState.trackedItems.delete(itemToRemove);
      updateListeningStatus();
    };

    const setScrollTickHandler = (func) => {
      monitorState.tickCallback = func;
      updateListeningStatus();
    };

    const refreshAllItems = () => {
      monitorState.trackedItems.forEach(item => item.refreshState());
      processScroll({}); // Force a full update
    };

    // Initial state tracking (before any items are added)
    monitorState.lastScrollTop = (containerElement === windowRef) ? windowRef.pageYOffset : containerElement.scrollTop;

    const publicAPI = {
      getContainerElement: getContainerElement,
      addItem: addItem,
      removeItem: removeItem,
      setScrollTick: setScrollTickHandler,
      refresh: refreshAllItems,
    };

    monitorInstances.set(containerElement, publicAPI);
    return publicAPI;
  };


  // --- Public API (replaces $.fn.scrollbeacon) ---
  const elementMonitorMap = new WeakMap(); // Maps tracked DOM elements to their TrackedItem instances

  const initializeViewTracker = (elements, options) => {
    const settings = { ...defaultOptions, ...options };
    let containerElement = settings.container;

    if (containerElement === document) {
        containerElement = windowRef;
    } else if (containerElement instanceof NodeList || containerElement instanceof HTMLCollection || Array.isArray(containerElement)) {
        if (containerElement.length === 1) {
            containerElement = containerElement[0];
        } else {
            throw new Error('Provided container must be a window or a single HTML element.');
        }
    } else if (!(containerElement instanceof HTMLElement || containerElement === windowRef)) {
         throw new Error('Provided container must be a window or a single HTML element.');
    }

    const currentMonitor = createScrollMonitor(containerElement);
    currentMonitor.setScrollTick(settings.tickCallback);

    elements.forEach(element => {
      let trackedItem = elementMonitorMap.get(element);
      if (trackedItem) {
        trackedItem.adjustMargins(settings.margins);
        trackedItem.refreshState();
        trackedItem._attachHandlers(settings); // Re-attach with new options
      } else {
        trackedItem = currentMonitor.addItem(element, settings);
        elementMonitorMap.set(element, trackedItem);
      }
    });
  };

  const invokeViewTrackerMethod = (elements, methodName, options, ...args) => {
    if (!elements || elements.length === 0) return;

    elements.forEach(element => {
      const trackedItem = elementMonitorMap.get(element);
      if (!trackedItem) {
        if (methodName !== 'init') { // If it's not init and not tracked, do nothing, mimicking jQuery
          return;
        }
        initializeViewTracker([element], options); // If init, proceed
        return;
      }

      const settings = { ...defaultOptions, ...options };

      switch (methodName) {
        case 'refresh':
          trackedItem.adjustMargins(settings.margins); // Apply new offsets if provided
          trackedItem.refreshState();
          break;
        case 'remove': // Renamed from destroy
          trackedItem.remove();
          elementMonitorMap.delete(element);
          break;
        case 'deactivate': // Renamed from stop
          trackedItem.deactivate();
          break;
        default:
          // Unknown method, silently ignore mimicking jQuery
      }
    });
  };

  // Main entry point for the view tracker
  const viewTrackerEntry = (elements, ...args) => {
    const targetElements = Array.isArray(elements) ? elements :
                           (elements instanceof NodeList || elements instanceof HTMLCollection) ? Array.from(elements) :
                           (elements instanceof HTMLElement ? [elements] : []);

    if (targetElements.length === 0) {
      return []; // Return empty array if no valid elements, mimicking jQuery's $() behavior
    }
    
    // Filter out non-HTMLElements if they were part of a list, mimicking jQuery's behavior
    const validElements = targetElements.filter(el => el instanceof HTMLElement);
    if (validElements.length === 0) return [];
    
    // Use validElements for processing
    let processingElements = validElements;

    let method;
    let options;
    let methodArgs = [];

    if (typeof args[0] === 'string') {
      method = args[0];
      options = typeof args[1] === 'object' ? args[1] : {};
      methodArgs = args.slice(2);
    } else {
      method = 'init';
      options = typeof args[0] === 'object' ? args[0] : {};
      methodArgs = args.slice(1);
    }

    if (method === 'init') {
      initializeViewTracker(processingElements, options);
    } else {
      invokeViewTrackerMethod(processingElements, method, options, ...methodArgs);
    }

    return processingElements; // Return the elements for chaining if desired
  };

  // Expose the main function and global settings on the window object
  windowRef.unifiedViewMonitor = {
    configure: (settings) => Object.assign(globalSettings, settings),
    track: viewTrackerEntry,
    events: eventType,
    positions: PositionState,
  };

})(window);