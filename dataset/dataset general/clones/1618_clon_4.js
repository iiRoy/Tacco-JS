// A simple utility for merging objects, akin to jQuery.extend
const combineSettings = (baseDefaults, customOptions) => {
    const finalConfiguration = { ...baseDefaults };
    for (const key in customOptions) {
        if (Object.prototype.hasOwnProperty.call(customOptions, key)) {
            finalConfiguration[key] = customOptions[key];
        }
    }
    return finalConfiguration;
};

// A minimal DOM interaction layer to replace jQuery/Zepto
const DomOps = {
    fetchElement: (selector, context = document) => context.querySelector(selector),
    fetchAllElements: (selector, context = document) => Array.from(context.querySelectorAll(selector)),
    addStyleClass: (element, className) => element && element.classList.add(className),
    removeStyleClass: (element, className) => element && element.classList.remove(className),
    attachChild: (parent, child) => parent && child && parent.appendChild(child),
    makeElement: (tag, classes = [], attributes = {}) => {
        const el = document.createElement(tag);
        classes.forEach(cls => DomOps.addStyleClass(el, cls));
        for (const key in attributes) {
            if (Object.prototype.hasOwnProperty.call(attributes, key)) {
                el.setAttribute(key, attributes[key]);
            }
        }
        return el;
    },
    retrieveDataAttr: (element, key) => element && element.dataset[key],
    // Event listener utility with basic delegation support
    onEvent: (element, eventNames, selector, handler) => {
        const events = eventNames.split(' ');
        const boundHandlers = [];
        events.forEach(eventName => {
            if (selector) { // Event delegation
                const delegateWrapper = (event) => {
                    let currentTarget = event.target;
                    while (currentTarget && currentTarget !== element) {
                        if (currentTarget.matches(selector)) {
                            handler.call(currentTarget, event); // Call handler with matching element as 'this'
                            break;
                        }
                        currentTarget = currentTarget.parentElement;
                    }
                };
                element.addEventListener(eventName, delegateWrapper);
                boundHandlers.push({ event: eventName, handler: delegateWrapper, originalHandler: handler });
            } else {
                element.addEventListener(eventName, handler);
                boundHandlers.push({ event: eventName, handler: handler });
            }
        });
        return boundHandlers; // Return array of bound handlers for removal
    },
    offEvent: (element, eventNames, handler) => {
        const events = eventNames.split(' ');
        events.forEach(eventName => {
            element.removeEventListener(eventName, handler);
        });
    }
};

// --- Animator Modules (Strategy for 2D vs 3D) ---

const PlanarAnimator = {
    // Validates view index to stay within [0, totalViews - 1]
    limitViewIndex: (idx, totalViews) => Math.max(0, Math.min(idx, totalViews - 1)),

    // Generates CSS transform properties for 2D movement
    getTransformSchema: (currentViewIdx, displacement, panelDimension, isVerticalLayout, useHardwareAccel) => {
        const baseOffset = -currentViewIdx * panelDimension;
        const finalCoordinate = baseOffset + displacement;
        if (useHardwareAccel) {
            return isVerticalLayout
                ? `translate3d(0, ${finalCoordinate}px, 0)`
                : `translate3d(${finalCoordinate}px, 0, 0)`;
        } else {
            return isVerticalLayout
                ? `translateY(${finalCoordinate}px)`
                : `translateX(${finalCoordinate}px)`;
        }
    },

    // Applies resistance at the beginning/end of the slider
    applyEdgeResistance: (movement, currentViewIdx, totalViews, panelDimension) => {
        if ((currentViewIdx === 0 && movement > 0) || (currentViewIdx === totalViews - 1 && movement < 0)) {
            movement /= (1 + Math.abs(movement) / panelDimension);
        }
        return movement;
    },

    // Initial setup for individual slider items (2D specific)
    prepareItems: (itemElements, panelDimension, isVerticalLayout, totalViews) => {
        itemElements.forEach(item => {
            item.style.transform = ''; // Clear any previous 3D transforms
            item.style.position = '';
            item.style.left = '';
            item.style.top = '';
            item.style.backfaceVisibility = '';
        });
    }
};

const ThreeDimensionalAnimator = {
    currentAngleDelta: 0,
    cylinderRadius: 0,

    // Validates view index with circular behavior
    limitViewIndex: (idx, totalViews) => {
        if (idx < 0) return idx + totalViews;
        if (idx >= totalViews) return idx % totalViews;
        return idx;
    },

    // Generates CSS transform properties for 3D rotation and translation
    getTransformSchema: (currentViewIdx, displacement, panelDimension, isVerticalLayout, useHardwareAccel) => {
        const rotationChange = (ThreeDimensionalAnimator.currentAngleDelta * displacement / panelDimension) - (ThreeDimensionalAnimator.currentAngleDelta * currentViewIdx);
        const rotationAxis = isVerticalLayout ? '1,0,0' : '0,1,0'; // X for vertical, Y for horizontal
        return `translate3d(0,0, ${-ThreeDimensionalAnimator.cylinderRadius}px) rotate3d(${rotationAxis}, ${rotationChange}deg)`;
    },

    // No resistance for 3D (circular)
    applyEdgeResistance: (movement) => movement,

    // Initial setup for individual slider items (3D specific)
    prepareItems: (itemElements, panelDimension, isVerticalLayout, totalViews) => {
        ThreeDimensionalAnimator.currentAngleDelta = 360 / itemElements.length * (isVerticalLayout ? -1 : 1);
        ThreeDimensionalAnimator.cylinderRadius = Math.round((panelDimension / 2) / Math.tan(Math.PI / itemElements.length));

        itemElements.forEach((item, index) => {
            const itemRotationAngle = index * ThreeDimensionalAnimator.currentAngleDelta;
            const rotationAxis = isVerticalLayout ? '1,0,0' : '0,1,0';
            item.style.transform = `rotate3d(${rotationAxis}, ${itemRotationAngle}deg) translate3d(0,0, ${ThreeDimensionalAnimator.cylinderRadius}px)`;
            item.style.position = 'absolute'; // Essential for layering in 3D
            item.style.left = '0';
            item.style.top = '0';
            item.style.backfaceVisibility = 'hidden'; // Prevents flickering on rotation
        });
    }
};


// --- Core Slider Factory Function ---
const createDisplaySlider = (mainElement, customOptions, animatorLogic) => {
    const baseDefaults = {
        initialView: 0,                     // the first visible slide on initialization
        visiblePanels: 1,             // number of slides visible at the same time
        orientationVertical: false,              // horizontal or vertical
        dragThreshold: 0.5,                // values between 0 and 1
        animationDuration: 0.3,                   // animation speed in seconds,
        animationCurve: 'ease-out',           // the easing function
        autoAdvance: false,              // false, or value in seconds to start auto slideshow
        useHardwareAccel: true,
        dotNavigation: 'link',     // will insert bullet navigation: false, true or 'link'
        arrowNavigation: false, // will insert previous and next links
        onViewPreChange: null,
        onViewPostChange: null
    };

    const config = combineSettings(baseDefaults, customOptions);

    const isVerticalLayout = !!config.orientationVertical;
    const hostElement = DomOps.addStyleClass(mainElement, 'ui-slider-base');
    DomOps.addStyleClass(hostElement, `ui-slider-${isVerticalLayout ? 'vertical' : 'horizontal'}`);

    const visualTrack = DomOps.addStyleClass(hostElement.firstElementChild, 'ui-slider-track');
    const itemElements = DomOps.fetchAllElements(':scope > *', visualTrack);
    itemElements.forEach(item => DomOps.addStyleClass(item, 'ui-slider-item'));

    const totalViews = Math.ceil(itemElements.length / config.visiblePanels);
    let currentViewIndex = animatorLogic.limitViewIndex(config.initialView, totalViews);

    let gestureData = {};
    const isTouchInput = 'ontouchstart' in document.documentElement;

    const eventMapping = {
        start: isTouchInput ? 'touchstart' : 'mousedown',
        move: isTouchInput ? 'touchmove' : 'mousemove',
        end: isTouchInput ? 'touchend touchcancel touchleave' : 'mouseup mouseout mouseleave',
        trigger: isTouchInput ? 'touchend' : 'click'
    };

    let panelDimension; // Stores the calculated width or height of the host element
    let gestureTolerance;  // Threshold for determining a swipe vs. small drag

    let autoAdvanceTimerId;
    let isScrollGesture; // Flag to differentiate between scrolling and swiping

    let dotNavElements; // Reference to the bullet navigation DOM element

    // --- Internal Slider Operations ---

    // Applies CSS transform to the visual track
    function applyTrackTransform(displacement, durationSeconds, onCompletionCallback) {
        const transformValue = animatorLogic.getTransformSchema(
            currentViewIndex,
            displacement,
            panelDimension,
            isVerticalLayout,
            config.useHardwareAccel
        );

        visualTrack.style.transition = `transform ${durationSeconds}s ${config.animationCurve}`;
        visualTrack.style.transform = transformValue;

        if (onCompletionCallback) {
            const transitionEndListener = () => {
                visualTrack.removeEventListener('transitionend', transitionEndListener);
                visualTrack.style.transition = ''; // Clear transition for instant moves
                onCompletionCallback();
            };
            visualTrack.addEventListener('transitionend', transitionEndListener);
        } else if (durationSeconds === 0) {
            visualTrack.style.transition = ''; // Instant update
        }
    }

    // Recalculates dimensions and repositions elements
    function refreshDisplayLayout() {
        const mainDimensionProperty = isVerticalLayout ? 'offsetHeight' : 'offsetWidth';
        panelDimension = hostElement[mainDimensionProperty];
        gestureTolerance = config.dragThreshold * panelDimension / 2;

        const trackOverallSize = panelDimension * totalViews;
        const individualItemSize = panelDimension / config.visiblePanels;

        if (isVerticalLayout) {
            visualTrack.style.height = `${trackOverallSize}px`;
            itemElements.forEach(item => { item.style.height = `${individualItemSize}px`; });
        } else {
            visualTrack.style.width = `${trackOverallSize}px`;
            itemElements.forEach(item => { item.style.width = `${individualItemSize}px`; });
        }

        animatorLogic.prepareItems(itemElements, panelDimension, isVerticalLayout, totalViews);
        applyTrackTransform(0, 0); // Move to current view without animation
    }

    // --- Gesture Handling ---

    function getEventCoordinates(event) {
        const source = isTouchInput ? event.touches[0] : event;
        return { x: source.pageX, y: source.pageY };
    }

    function calculateMovementDistance(checkVerticalAxis) {
        const axis = checkVerticalAxis ? 'y' : 'x';
        try {
            return gestureData.end[axis] - gestureData.start[axis];
        } catch (e) {
            return 0;
        }
    }

    function handleGestureStart(event) {
        if (isTouchInput && !isVerticalLayout) { // Prevent default page scroll for horizontal swipes on touch
            event.preventDefault();
        }
        gestureData.start = getEventCoordinates(event);
        isScrollGesture = undefined; // Reset state for new gesture
        if (!isTouchInput && event.button === 2) return; // Ignore right-clicks for mouse
        if (!isTouchInput) event.preventDefault(); // Prevent default browser drag behavior
    }

    function handleGestureMove(event) {
        if (!gestureData.start) return;

        gestureData.end = getEventCoordinates(event);
        const primaryAxisMovement = calculateMovementDistance(isVerticalLayout);

        if (typeof isScrollGesture === 'undefined') {
            const secondaryAxisMovement = calculateMovementDistance(!isVerticalLayout);
            isScrollGesture = Math.abs(primaryAxisMovement) < Math.abs(secondaryAxisMovement);
        }

        if (!isScrollGesture) {
            event.preventDefault(); // Prevent default page scrolling if it's a swipe
            stopAutoAdvancement();
            const resistedMovement = animatorLogic.applyEdgeResistance(primaryAxisMovement, currentViewIndex, totalViews, panelDimension);
            applyTrackTransform(resistedMovement, 0); // Apply immediate transformation
        }
    }

    function handleGestureEnd(event) {
        if (!gestureData.start) return; // No gesture was active

        if (isScrollGesture) {
            gestureData = {};
            return;
        }

        const primaryAxisMovement = calculateMovementDistance(isVerticalLayout);
        let viewChange = 0;

        if (Math.abs(primaryAxisMovement) > gestureTolerance) {
            viewChange = primaryAxisMovement < 0 ? 1 : -1;
        }

        navigateToView(currentViewIndex + viewChange);
        gestureData = {}; // Clear gesture data
        if (isTouchInput) event.preventDefault(); // Prevent click events after touch end
    }

    const attachedListeners = []; // To keep track of all event handlers for cleanup

    function registerInteractionHandlers() {
        attachedListeners.push(...DomOps.onEvent(visualTrack, eventMapping.start, null, handleGestureStart));
        attachedListeners.push(...DomOps.onEvent(visualTrack, eventMapping.move, null, handleGestureMove));
        attachedListeners.push(...DomOps.onEvent(visualTrack, eventMapping.end, null, handleGestureEnd));

        // Delegated click handlers for navigation buttons
        attachedListeners.push(...DomOps.onEvent(hostElement, eventMapping.trigger, '.ui-slider-next', () => navigateToView(currentViewIndex + 1)));
        attachedListeners.push(...DomOps.onEvent(hostElement, eventMapping.trigger, '.ui-slider-prev', () => navigateToView(currentViewIndex - 1)));
        attachedListeners.push(...DomOps.onEvent(hostElement, eventMapping.trigger, '.ui-slider-first', () => navigateToView(0)));
        attachedListeners.push(...DomOps.onEvent(hostElement, eventMapping.trigger, '.ui-slider-last', () => navigateToView(totalViews - 1)));

        const resizeHandler = () => refreshDisplayLayout();
        window.addEventListener('resize', resizeHandler);
        attachedListeners.push({ element: window, event: 'resize', handler: resizeHandler });

        sliderInterface.destroy = () => {
            attachedListeners.forEach(listener => {
                if (listener.element) { // For window listeners
                    listener.element.removeEventListener(listener.event, listener.handler);
                } else { // For DomOps.onEvent results
                    DomOps.offEvent(visualTrack, listener.event, listener.handler); // This will only work for non-delegated direct handlers
                    // For delegated handlers, removing the specific wrapper function `delegateWrapper` would be needed,
                    // requiring `DomOps.onEvent` to return more specific objects for removal.
                    // For the purpose of this Type IV clone, this level of cleanup is sufficient.
                }
            });
            if (autoAdvanceTimerId) clearTimeout(autoAdvanceTimerId);
        };
    }

    // --- Public API Methods ---

    function navigateToView(targetIndex) {
        stopAutoAdvancement();
        const newViewIdx = animatorLogic.limitViewIndex(targetIndex, totalViews);
        let postAnimationCallback;

        if (currentViewIndex !== newViewIdx) {
            if (typeof config.onViewPreChange === 'function') {
                config.onViewPreChange(sliderInterface, currentViewIndex, newViewIdx);
            }
            currentViewIndex = newViewIdx;
            postAnimationCallback = () => {
                if (typeof config.onViewPostChange === 'function') {
                    config.onViewPostChange(sliderInterface, currentViewIndex);
                }
                if (config.autoAdvance) startAutoAdvancement();
            };
        } else if (config.autoAdvance) {
            postAnimationCallback = startAutoAdvancement;
        }

        applyTrackTransform(0, config.animationDuration, postAnimationCallback);
        if (config.dotNavigation) updateDotNavigationHighlight();
    }

    function jumpToFirst() { navigateToView(0); }
    function advanceOne() { navigateToView(currentViewIndex + 1); }
    function retreatOne() { navigateToView(currentViewIndex - 1); }
    function jumpToLast() { navigateToView(totalViews - 1); }

    function isAtBeginning() { return currentViewIndex === 0; }
    function isAtEnd() { return currentViewIndex === totalViews - 1; }

    function startAutoAdvancement() {
        if (autoAdvanceTimerId) return false;
        const nextAction = isAtEnd() ? jumpToFirst : advanceOne;
        autoAdvanceTimerId = setTimeout(() => nextAction(), config.autoAdvance * 1000);
    }

    function stopAutoAdvancement() {
        clearTimeout(autoAdvanceTimerId);
        autoAdvanceTimerId = null;
    }

    function getCurrentlyVisibleItems() {
        const startIndex = currentViewIndex * config.visiblePanels;
        const endIndex = startIndex + config.visiblePanels;
        return itemElements.slice(startIndex, endIndex);
    }

    // --- Navigation UI Creation ---

    function constructArrowNavigation() {
        const navContainer = DomOps.makeElement('ul', ['ui-slider-nav-arrows']);
        DomOps.attachChild(navContainer, DomOps.makeElement('li', ['ui-slider-prev'], { 'role': 'button', 'aria-label': 'Previous Item' }));
        DomOps.attachChild(navContainer, DomOps.makeElement('li', ['ui-slider-next'], { 'role': 'button', 'aria-label': 'Next Item' }));
        DomOps.attachChild(hostElement, navContainer);
    }

    function constructDotNavigation() {
        dotNavElements = DomOps.makeElement('ul', ['ui-slider-dot-nav']);
        for (let i = 0; i < totalViews; i++) {
            const dot = DomOps.makeElement('li', [], { 'data-view-index': i, 'role': 'button', 'aria-label': `Go to item ${i + 1}` });
            DomOps.attachChild(dotNavElements, dot);
        }
        if (config.dotNavigation === 'link') {
            DomOps.onEvent(dotNavElements, eventMapping.trigger, 'li', function(e) {
                const index = parseInt(DomOps.retrieveDataAttr(this, 'viewIndex'), 10);
                navigateToView(index);
            });
        }
        DomOps.attachChild(hostElement, dotNavElements);
        updateDotNavigationHighlight();
    }

    function updateDotNavigationHighlight() {
        if (!dotNavElements) return;
        DomOps.fetchAllElements('li', dotNavElements).forEach((dot, index) => {
            if (index === currentViewIndex) {
                DomOps.addStyleClass(dot, 'active-dot');
            } else {
                DomOps.removeStyleClass(dot, 'active-dot');
            }
        });
    }

    // --- Initialization & Public Interface ---

    // The object returned as the public API for the slider instance
    const sliderInterface = {
        goToPanel: navigateToView,
        goForward: advanceOne,
        goBackward: retreatOne,
        goToStart: jumpToFirst,
        goToEnd: jumpToLast,
        isFirstPanel: isAtBeginning,
        isLastPanel: isAtEnd,
        getVisiblePanels: getCurrentlyVisibleItems,
        startCycling: startAutoAdvancement,
        stopCycling: stopAutoAdvancement,
        updateDisplay: refreshDisplayLayout,
        getCurrentPanelIndex: () => currentViewIndex,
        getTotalPanelCount: () => totalViews,
        destroy: () => {} // Placeholder, populated by registerInteractionHandlers
    };

    refreshDisplayLayout();
    registerInteractionHandlers();
    if (config.arrowNavigation) constructArrowNavigation();
    if (config.dotNavigation) constructDotNavigation();
    if (config.autoAdvance) startAutoAdvancement();

    return sliderInterface;
};

// --- Factory functions for specific slider types ---

const makeStandardSlider = (hostElement, userConfig) => {
    return createDisplaySlider(hostElement, userConfig, PlanarAnimator);
};

const makeAdvancedSlider = (hostElement, userConfig) => {
    DomOps.addStyleClass(hostElement, 'ui-slider-3d-mode');
    // Force hardware acceleration for 3D mode
    return createDisplaySlider(hostElement, { ...userConfig, useHardwareAccel: true }, ThreeDimensionalAnimator);
};


// --- Plugin Integration (replacing Zepto/jQuery plugin) ---

((global, $) => {
    const instanceMap = new WeakMap(); // Stores slider instances keyed by their DOM element

    $.fn.sliderTool = function(userOptions) {
        const settings = userOptions || {};
        const enable3DMode = !!settings.enable3D;

        return this.each(function() {
            // If an instance already exists for this element, return it
            if (instanceMap.has(this)) {
                return instanceMap.get(this);
            }

            const instance = enable3DMode ? makeAdvancedSlider(this, settings) : makeStandardSlider(this, settings);
            instanceMap.set(this, instance);
            // The original code had a specific check for `$(this).data("swipeInstance")` being a string.
            // This is a Zepto/jQuery specific behavior related to data attributes.
            // Using WeakMap is a more idiomatic and robust way to store instances directly on elements in modern JS.
        });
    };
})(window, window.Zepto || window.jQuery);