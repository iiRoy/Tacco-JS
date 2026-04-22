/*
 * CarouselFlow 1.0.0
 * A flexible, touch-enabled content display component
 *
 * https://www.example.com/carousel/
 *
 * Copyright 2023-2024, AlphaDev Labs
 *
 * Licensed under Apache 2.0 & MIT
 *
 * Initial Release: October 26, 2024
*/
var CarouselFlow = function (targetElement, configOptions) {
    // Basic environment setup and compatibility fixes for legacy browsers.
    // This section ensures essential DOM and Array features are available.

    // A small patch for older Internet Explorer/Firefox versions lacking outerHTML getter.
    if (document.body && document.body.__defineGetter__) {
        if (typeof HTMLElement !== 'undefined') {
            var domPrototype = HTMLElement.prototype;
            if (domPrototype.__defineGetter__) {
                domPrototype.__defineGetter__("outerHTML", function () {
                    let tempSerializer = new XMLSerializer();
                    return tempSerializer.serializeToString(this);
                });
            }
        }
    }

    // Polyfill for window.getComputedStyle in older browsers.
    if (!window.getComputedStyle) {
        window.getComputedStyle = function (elemReference, pseudoElem) {
            let currentElement = elemReference;
            let styleRetriever = {
                getPropertyValue: function (propName) {
                    const kebabToCamelRegex = /(\-([a-z]){1})/g;
                    let processedProp = propName;
                    if (processedProp === 'float') {
                        processedProp = 'styleFloat'; // IE specific for float
                    }
                    if (kebabToCamelRegex.test(processedProp)) {
                        processedProp = processedProp.replace(kebabToCamelRegex, function (match, p1, p2) {
                            return p2.toUpperCase();
                        });
                    }
                    return currentElement.currentStyle && currentElement.currentStyle[processedProp] ? currentElement.currentStyle[processedProp] : null;
                }
            };
            return styleRetriever;
        };
    }

    // Array.prototype.indexOf polyfill for older JavaScript environments.
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchItem, fromIndex) {
            let startPos = fromIndex || 0;
            let currentLength = this.length;
            if (startPos >= currentLength) {
                return -1;
            }
            for (let k = startPos; k < currentLength; k++) {
                if (this[k] === searchItem) {
                    return k;
                }
            }
            return -1;
        };
    }

    // Fallback for document.querySelectorAll if not supported, relies on jQuery.
    if (typeof document.querySelectorAll === 'undefined') {
        if (typeof window.jQuery === 'undefined') {
            // Cannot proceed without a selector engine.
            console.error("CarouselFlow: document.querySelectorAll is not supported, and jQuery is not found. Aborting initialization.");
            return;
        }
    }

    // Internal utility for selecting DOM elements.
    function queryElements(selectorString, contextNode) {
        if (document.querySelectorAll) {
            return (contextNode || document).querySelectorAll(selectorString);
        } else {
            // Fallback to jQuery for element selection.
            return jQuery(selectorString, contextNode);
        }
    }

    // --- Core Initialization Guard Clauses ---
    if(typeof targetElement === 'undefined' || targetElement === null) {
        console.warn("CarouselFlow: No target element provided. Initialization aborted.");
        return;
    }

    let initialNodes = [];
    if(!(targetElement.nodeType)){
        initialNodes = queryElements(targetElement);
        if (initialNodes.length === 0) {
            console.warn("CarouselFlow: Target element selector did not match any elements. Initialization aborted.");
            return;
        }
    }

    // --- Instance Context & State Variables ---
    let selfRef = this; // Renamed _this to selfRef for clarity.

    // Touch interaction state.
    selfRef.touchState = {
        initialPosition: 0,
        initialX: 0,
        initialY: 0,
        currentPosition: 0,
        currentX: 0,
        currentY: 0,
        deltaValue: 0,
        absoluteDelta: 0
    };
    // Position tracking.
    selfRef.positionData = {
        startCoord: 0,
        absoluteCoord: 0,
        displacement: 0,
        currentCoord: 0
    };
    // Timing information for gestures.
    selfRef.timingInfo = {
        gestureStart: 0,
        gestureEnd: 0
    };

    selfRef.instanceId = (new Date()).getTime();
    selfRef.mainContainer = (targetElement.nodeType) ? targetElement : initialNodes[0];
    selfRef.isInteracting = false;
    selfRef.hasMoved = false;
    selfRef.currentSlideIndex = 0;
    selfRef.centralSlideIndex = 0;
    selfRef.activeResourceIndex = 0;
    selfRef.activeLoopingIndex = 0;
    selfRef.previousActiveIndex = null;
    selfRef.motionVelocity = 0;
    selfRef.alignmentPoints = [];
    selfRef.contentLayout = [];
    selfRef.pendingImages = [];
    selfRef.loadedImageCount = 0;
    selfRef.leftBoundary = 0;
    selfRef.rightBoundary = 0;
    selfRef.topBoundary = 0;
    selfRef.bottomBoundary = 0;
    selfRef.isAndroidDevice = navigator.userAgent.toLowerCase().includes('android');

    // These variables will be set during layout calculation.
    let contentWrapper, itemDimension, wrapperDimension, navigationDirection, isScrollActive, containerDimension;

    // --- Default Configuration Settings ---
    const standardConfig = {
        interactionTarget: 'contentWrapper', // or 'mainContainer'
        orientation : 'horizontal', // or 'vertical'
        touchSensitivity : 1,
        transitionDuration : 300, // ms
        freeScrollMode : false,
        fluidFreeScroll : false,
        momentumFactor: 1,
        momentumRebound: true,
        momentumReboundRatio: 1,
        visibleItems : 1,
        itemsPerGroup : 1,
        simulateTouchInput : true,
        trackFingerMovement : true,
        quickSwipes : true,
        longSwipeThreshold: 0.5,
        movementStartThreshold: false, // pixels, or false for default
        externalControlOnly : false,
        generatePaging : true,
        pagingElement : false, // Selector for custom pagination wrapper
        pagingItemTag: 'span',
        pagingClickable: false,
        pagingAsRange: true,
        resistanceEffect : true, // or false or '100%'
        scrollableContainer : false,
        preventHyperlinkClicks : true,
        stopLinkPropagation: false,
        noGestureZone : false, // or class name
        noGestureClass : 'carousel-no-swipe',
        initialDisplaySlide: 0,
        keyboardNavigation: false,
        mouseWheelNavigation : false,
        mouseWheelAxisLock : false,
        useModernTransforms : true,
        // Autoplay settings
        autoAdvance: false,
        disableAutoAdvanceOnInteraction: true,
        stopAutoAdvanceAtEnd: false,
        // Looping mode
        loopContent: false,
        loopExtraSlides: 0,
        // Dynamic Height
        autoCalculateHeight: false,
        cssWidthHeightHandling: false,
        // Image Preloader
        refreshOnImagesReady : true,
        // Form Elements
        releaseFormElementsInteraction : true,
        // Active slide monitoring
        monitorActiveSlide: false,
        // Visibility Fit
        fullVisibilityFit : false,
        // Content Offsets
        offsetPixelsBefore : 0,
        offsetPixelsAfter : 0,
        offsetSlidesPreceding : 0,
        offsetSlidesFollowing : 0,
        centerActiveSlide: false,
        // Callback Queues
        queueStartHooks : false,
        queueEndHooks : false,
        // Responsive Behavior
        autoResizeLayout : true,
        reinitializeOnResize : false,
        // DOM Animation (legacy)
        domAnimationsEnabled : true,
        // Content Loader (for dynamic content)
        contentLoader: {
            itemSources:[], // Array of content data
            itemMarkupType:'inner', // or 'outer'
            surroundingGroups: 1, // Number of groups to keep loaded around view
            loadStrategy: 'reload', // or 'change'
            loadAllItems: false
        },
        // CSS Class Management
        itemTag : 'div',
        itemClass : 'carousel-item',
        activeItemClass : 'carousel-item-active',
        visibleItemClass : 'carousel-item-visible',
        duplicateItemClass: 'carousel-item-duplicate',
        wrapperClass : 'carousel-wrapper',
        pagingButtonClass: 'carousel-paging-button',
        activePagingClass : 'carousel-paging-active',
        visiblePagingClass : 'carousel-paging-visible'
    };

    // Merge user options with default configuration.
    configOptions = configOptions || {};
    for (let currentProp in standardConfig) {
        if (currentProp in configOptions && typeof configOptions[currentProp]==='object' && !Array.isArray(configOptions[currentProp])) {
            // Deep merge for nested objects like `contentLoader`.
            for (let subProp in standardConfig[currentProp]) {
                if (! (subProp in configOptions[currentProp])) {
                    configOptions[currentProp][subProp] = standardConfig[currentProp][subProp];
                }
            }
        }
        else if (! (currentProp in configOptions)) {
            configOptions[currentProp] = standardConfig[currentProp];
        }
    }
    selfRef.options = configOptions;

    // Adjust options based on other settings.
    if (selfRef.options.scrollableContainer) {
        selfRef.options.freeScrollMode = true;
        selfRef.options.fluidFreeScroll = true;
    }
    if (selfRef.options.loopContent) {
        selfRef.options.resistanceEffect = '100%'; // Full resistance for looping.
    }

    const isHorizontalLayout = selfRef.options.orientation === 'horizontal';
    navigationDirection = isHorizontalLayout ? 'horizontal' : 'vertical'; // Initialize navigationDirection

    // --- Define Touch Event Names ---
    let pointerEvents = ['mousedown','mousemove', 'mouseup'];
    // Check for specific IE versions for pointer events.
    if (selfRef.browser && selfRef.browser.ie10) { // Assuming selfRef.browser exists from original Swiper.
        pointerEvents = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp'];
    }
    if (selfRef.browser && selfRef.browser.ie11) { // Assuming selfRef.browser exists from original Swiper.
        pointerEvents = ['pointerdown', 'pointermove', 'pointerup'];
    }

    selfRef.interactionEvents = {
        startEvent : (selfRef.support && selfRef.support.touch) || !selfRef.options.simulateTouchInput  ? 'touchstart' : pointerEvents[0],
        moveEvent : (selfRef.support && selfRef.support.touch) || !selfRef.options.simulateTouchInput ? 'touchmove' : pointerEvents[1],
        endEvent : (selfRef.support && selfRef.support.touch) || !selfRef.options.simulateTouchInput ? 'touchend' : pointerEvents[2]
    };

    // --- Locate the Content Wrapper ---
    let foundWrapper = null;
    const childNodes = selfRef.mainContainer.childNodes;
    for (let k = childNodes.length - 1; k >= 0; k--) {
        const childNode = childNodes[k];
        if (childNode.nodeType === 1 && childNode.className) { // Ensure it's an element node
            let currentClasses = childNode.className.split(' ');
            for (let l = 0; l < currentClasses.length; l++) {
                if (currentClasses[l] === selfRef.options.wrapperClass) {
                    foundWrapper = childNode;
                    break;
                }
            }
            if (foundWrapper) break;
        }
    }
    // If no wrapper is found, create one. This is an addition.
    if (!foundWrapper) {
        foundWrapper = document.createElement('div');
        foundWrapper.className = selfRef.options.wrapperClass;
        // Move existing children into the new wrapper
        while (selfRef.mainContainer.firstChild) {
            foundWrapper.appendChild(selfRef.mainContainer.firstChild);
        }
        selfRef.mainContainer.appendChild(foundWrapper);
        console.warn("CarouselFlow: No wrapper element found, created a new one inside the container.");
    }
    selfRef.contentWrapper = foundWrapper;

    // --- Item Element API Augmentation ---
    // This function extends raw DOM elements to behave as carousel items.
    selfRef.augmentCarouselItem = function  (rawElement) {
        // Ensure the element is valid before proceeding.
        if (!rawElement || rawElement.nodeType !== 1) {
            console.error("CarouselFlow: Attempted to augment an invalid element.");
            return null;
        }

        rawElement.appendItem = function () {
            if (selfRef.options.loopContent) {
                // For looping, append before the last set of duplicated slides.
                rawElement.insertAfterItem(selfRef.items.length - selfRef.loopedItemCount -1);
            } else {
                selfRef.contentWrapper.appendChild(rawElement);
                selfRef.reinitializeComponent();
            }
            return rawElement;
        };

        rawElement.prependItem = function () {
            if (selfRef.options.loopContent) {
                selfRef.contentWrapper.insertBefore(rawElement, selfRef.items[selfRef.loopedItemCount]);
                selfRef.removeLoopDuplicates();
                selfRef.calculateItems();
                selfRef.createLoopingStructure();
            } else {
                selfRef.contentWrapper.insertBefore(rawElement, selfRef.contentWrapper.firstChild);
            }
            selfRef.reinitializeComponent();
            return rawElement;
        };

        rawElement.insertAfterItem = function (targetIndex) {
            if(typeof targetIndex === 'undefined' || targetIndex === null || targetIndex < 0) {
                console.warn("CarouselFlow: Invalid index for insertAfterItem. Appending instead.");
                return rawElement.appendItem(); // Fallback to append if index is bad.
            }
            let itemToInsertBefore;

            if (selfRef.options.loopContent) {
                itemToInsertBefore = selfRef.items[targetIndex + 1 + selfRef.loopedItemCount];
                if (itemToInsertBefore) {
                    selfRef.contentWrapper.insertBefore(rawElement, itemToInsertBefore);
                } else {
                    selfRef.contentWrapper.appendChild(rawElement);
                }
                selfRef.removeLoopDuplicates();
                selfRef.calculateItems();
                selfRef.createLoopingStructure();
            } else {
                itemToInsertBefore = selfRef.items[targetIndex + 1];
                if (itemToInsertBefore) {
                    selfRef.contentWrapper.insertBefore(rawElement, itemToInsertBefore);
                } else {
                    selfRef.contentWrapper.appendChild(rawElement); // Append if index is last.
                }
            }
            selfRef.reinitializeComponent();
            return rawElement;
        };

        rawElement.cloneItem = function () {
            return selfRef.augmentCarouselItem(rawElement.cloneNode(true));
        };

        rawElement.removeItem = function () {
            if (rawElement.parentNode === selfRef.contentWrapper) { // Guard against removing already detached elements
                selfRef.contentWrapper.removeChild(rawElement);
                selfRef.reinitializeComponent();
            }
        };

        rawElement.setItemContent = function (newHtml) {
            if (typeof newHtml === 'undefined') {
                return rawElement.innerHTML;
            } else {
                rawElement.innerHTML = newHtml;
                return rawElement;
            }
        };

        rawElement.getItemIndex = function () {
            let foundIndex = -1;
            // Iterate through the actual items array to find the index.
            for (let i = 0; i < selfRef.items.length; i++) {
                if(rawElement === selfRef.items[i]) {
                    foundIndex = i;
                    break;
                }
            }
            return foundIndex;
        };

        rawElement.isCurrentlyActive = function () {
            return rawElement.getItemIndex() === selfRef.currentSlideIndex;
        };

        // Custom data storage for item-specific information.
        if (!rawElement.carouselItemDataStore) {
            rawElement.carouselItemDataStore = {};
        }

        rawElement.getStoredData = function (keyName) {
            return rawElement.carouselItemDataStore[keyName];
        };

        rawElement.setStoredData = function (keyName, val) {
            rawElement.carouselItemDataStore[keyName] = val;
            return rawElement;
        };

        rawElement.retrieveAttribute = function (attrName, attrValue) {
            if (typeof attrValue === 'undefined') {
                return rawElement.getAttribute('data-' + attrName);
            } else {
                rawElement.setAttribute('data-' + attrName, attrValue);
                return rawElement;
            }
        };

        // Assuming selfRef.h (helpers) exists from original Swiper.
        rawElement.getCalculatedWidth = function (includeMargins) {
            return selfRef.h.getWidth(rawElement, includeMargins);
        };
        rawElement.getCalculatedHeight = function (includeMargins) {
            return selfRef.h.getHeight(rawElement, includeMargins);
        };
        rawElement.getAbsoluteOffset = function() {
            return selfRef.h.getOffset(rawElement);
        };

        return rawElement;
    };

    // --- Item Calculation and Management ---
    selfRef.calculateItems = function (forceRecalculation) {
        let previousItemCount = selfRef.items ? selfRef.items.length : 0;
        selfRef.items = [];
        selfRef.visibleItemsList = [];

        // Collect all potential carousel items.
        const allChildren = selfRef.contentWrapper.children; // Using .children for element nodes only.
        for (let i = 0; i < allChildren.length; i++) {
            const childNode = allChildren[i];
            if (childNode.classList && childNode.classList.contains(selfRef.options.itemClass)) {
                selfRef.items.push(childNode);
            }
        }

        // Augment each found item with the API methods.
        for (let i = selfRef.items.length - 1; i >= 0; i--) {
            selfRef.augmentCarouselItem(selfRef.items[i]);
        }

        // Only trigger re-init if item count has changed or forced.
        if(previousItemCount === 0 || previousItemCount !== selfRef.items.length || forceRecalculation) {
            // Re-bind events, update pagination, etc.
            // These functions would be defined elsewhere in the full Swiper code.
            // For now, these are placeholders for the original `removeSlideEvents`, `addSlideEvents`, `updateActiveSlide`.
            // selfRef.unbindItemEvents();
            // selfRef.bindItemEvents();
            // selfRef.refreshActiveItemState();

            if (selfRef.options.generatePaging) {
                selfRef.createPaginationControls();
            }
            selfRef.triggerPluginHook('itemCountChanged');
        }
    };

    // --- Item Creation and Manipulation ---
    selfRef.createSingleItem = function (itemHtml, customClassList, elementType) {
        let itemClasses = customClassList || selfRef.options.itemClass;
        let itemTag = elementType || selfRef.options.itemTag;
        let newItem = document.createElement(itemTag);
        newItem.innerHTML = itemHtml || '';
        newItem.className = itemClasses;
        return selfRef.augmentCarouselItem(newItem);
    };

    selfRef.addItem = function (itemContent, classOverride, elementTag) {
        if (!itemContent) {
            console.warn("CarouselFlow: No content provided for addItem.");
            return null;
        }
        if (itemContent.nodeType) {
            return selfRef.augmentCarouselItem(itemContent).appendItem();
        } else {
            return selfRef.createSingleItem(itemContent, classOverride, elementTag).appendItem();
        }
    };

    selfRef.insertItemAtBeginning = function (itemContent, classOverride, elementTag) {
        if (!itemContent) {
            console.warn("CarouselFlow: No content provided for insertItemAtBeginning.");
            return null;
        }
        if (itemContent.nodeType) {
            return selfRef.augmentCarouselItem(itemContent).prependItem();
        } else {
            return selfRef.createSingleItem(itemContent, classOverride, elementTag).prependItem();
        }
    };

    selfRef.insertItemAtIndex = function (targetIdx, itemContent, classOverride, elementTag) {
        if (typeof targetIdx === 'undefined' || targetIdx === null) {
            console.warn("CarouselFlow: Index not provided for insertItemAtIndex. Aborting.");
            return false;
        }
        if (itemContent.nodeType) {
            return selfRef.augmentCarouselItem(itemContent).insertAfterItem(targetIdx);
        } else {
            return selfRef.createSingleItem(itemContent, classOverride, elementTag).insertAfterItem(targetIdx);
        }
    };

    selfRef.deleteItem = function (itemIndex) {
        if (!selfRef.items[itemIndex]) {
            console.warn("CarouselFlow: Attempted to delete non-existent item at index " + itemIndex + ".");
            return false;
        }
        let itemToRemove = selfRef.items[itemIndex];
        if (selfRef.options.loopContent) {
            // Need to adjust index for looped items.
            let realIndex = itemIndex + selfRef.loopedItemCount;
            if (!selfRef.items[realIndex]) {
                console.warn("CarouselFlow: Looped item not found for deletion at index " + itemIndex + ".");
                return false;
            }
            selfRef.items[realIndex].removeItem();
            selfRef.removeLoopDuplicates(); // Recreate loop after removal.
            selfRef.calculateItems();
            selfRef.createLoopingStructure();
        } else {
            itemToRemove.removeItem();
        }
        return true;
    };

    selfRef.deleteLastItem = function () {
        if (selfRef.items.length === 0) {
            console.warn("CarouselFlow: No items to delete.");
            return false;
        }
        let targetItemIndex = selfRef.items.length - 1;
        // If looping, adjust index to target a non-duplicate item.
        if (selfRef.options.loopContent) {
            targetItemIndex -= selfRef.loopedItemCount; // Target the last *original* item.
            if (targetItemIndex < 0) { // Safety check if only loop duplicates remain.
                console.warn("CarouselFlow: No original items left to delete.");
                return false;
            }
            selfRef.deleteItem(targetItemIndex); // Call deleteItem which handles loop recreation.
        } else {
            selfRef.items[targetItemIndex].removeItem();
            selfRef.reinitializeComponent(); // Re-init after non-loop removal.
        }
        return true;
    };

    selfRef.clearAllItems = function () {
        // Iterate backward to avoid issues with collection length changing.
        for (let i = selfRef.items.length - 1; i >= 0; i--) {
            selfRef.items[i].removeItem();
        }
        selfRef.items = []; // Ensure the array is empty after removal.
        selfRef.reinitializeComponent(); // Re-init after mass removal.
    };

    selfRef.retrieveItem = function (idx) {
        return selfRef.items[idx];
    };

    selfRef.retrieveLastItem = function () {
        return selfRef.items[selfRef.items.length - 1];
    };

    selfRef.retrieveFirstItem = function () {
        return selfRef.items[0];
    };

    // --- Get Currently Active Item ---
    selfRef.getActiveItem = function () {
        return selfRef.items[selfRef.currentSlideIndex];
    };

    // --- Callback Management ---
    selfRef.triggerCallback = function() {
        let callbackFunction = arguments[0];
        // Convert arguments object to a real array, excluding the first element (the callback itself).
        let callbackArgs = Array.prototype.slice.call(arguments, 1);

        if (Object.prototype.toString.call( callbackFunction ) === '[object Array]' ) {
            // If it's an array of functions, iterate and call each.
            for (let i = 0; i < callbackFunction.length; i++) {
                let currentFn = callbackFunction[i];
                if (typeof currentFn === 'function') {
                    currentFn.apply(selfRef, callbackArgs); // Apply context and arguments.
                } else {
                    console.warn("CarouselFlow: Non-function found in callback array:", currentFn);
                }
            }
        } else if (Object.prototype.toString.call( callbackFunction ) === '[object String]') {
            // If it's a string, look for a corresponding function in options.
            let eventKey = 'on' + callbackFunction.charAt(0).toUpperCase() + callbackFunction.slice(1);
            if (selfRef.options[eventKey]) {
                selfRef.triggerCallback.apply(selfRef, [selfRef.options[eventKey]].concat(callbackArgs));
            }
        } else if (typeof callbackFunction === 'function') {
            // If it's a single function, call it directly.
            callbackFunction.apply(selfRef, callbackArgs);
        } else {
            console.warn("CarouselFlow: Invalid callback type provided:", typeof callbackFunction);
        }
    };
};