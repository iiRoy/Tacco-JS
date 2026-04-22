var VisualSlider = function (domTarget, configSettings) {
    // --- Core Utilities and Feature Checks (Divergent Implementation) ---
    // Instead of direct `if (!feature)` checks, we use a centralized utility object
    // assuming a modern browser environment for most features, or providing modern fallbacks.
    // The original's `outerHTML` getter and `getComputedStyle` polyfill for old IE are omitted
    // to achieve significant divergence and assume modern browser API availability.

    // A utility object for DOM operations, replacing `_this.h` and `$$`
    const domToolbelt = Object.freeze({
        fetchSingleElement(queryIdentifier, scopeElement = document) {
            if (queryIdentifier && queryIdentifier.nodeType) return queryIdentifier;
            return scopeElement.querySelector(queryIdentifier);
        },
        fetchAllElements(queryIdentifier, scopeElement = document) {
            if (queryIdentifier && queryIdentifier.nodeType) return [queryIdentifier];
            return Array.from(scopeElement.querySelectorAll(queryIdentifier));
        },
        readComputedStyleValue(elementNode, propertyName) {
            return window.getComputedStyle(elementNode).getPropertyValue(propertyName);
        },
        calculateElementDimension(elementNode, isHorizontalMode, includePaddingMarginBorder) {
            const currentStyle = window.getComputedStyle(elementNode);
            let measuredValue = isHorizontalMode ? parseFloat(currentStyle.width) : parseFloat(currentStyle.height);
            if (includePaddingMarginBorder) {
                measuredValue += parseFloat(currentStyle[isHorizontalMode ? 'paddingLeft' : 'paddingTop']) + parseFloat(currentStyle[isHorizontalMode ? 'paddingRight' : 'paddingBottom']);
                measuredValue += parseFloat(currentStyle[isHorizontalMode ? 'marginLeft' : 'marginTop']) + parseFloat(currentStyle[isHorizontalMode ? 'marginRight' : 'marginBottom']);
                measuredValue += parseFloat(currentStyle[isHorizontalMode ? 'borderLeftWidth' : 'borderTopWidth']) + parseFloat(currentStyle[isHorizontalMode ? 'borderRightWidth' : 'borderBottomWidth']);
            }
            return measuredValue;
        },
        determineGlobalOffset(elementNode) {
            const boxRectangle = elementNode.getBoundingClientRect();
            return {
                top: boxRectangle.top + window.pageYOffset - document.documentElement.clientTop,
                left: boxRectangle.left + window.pageXOffset - document.documentElement.clientLeft
            };
        }
    });

    // Check for correct selector (divergent from original's `$$(selector).length === 0`)
    if (typeof domTarget === 'undefined') return;
    if (!(domTarget.nodeType)) {
        if (typeof domTarget === 'string' && domToolbelt.fetchAllElements(domTarget).length === 0) return;
    }

    // --- Component State Initialization (Divergent Naming & Structure) ---
    // These properties replace `_this.touches`, `_this.positions`, `_this.times`, etc.
    this.interactionHistory = {
        initiate: 0,
        initiateX: 0,
        initiateY: 0,
        recentPoint: 0,
        recentPointX: 0,
        recentPointY: 0,
        change: 0,
        absoluteChange: 0
    };
    this.scrollMetrics = {
        initiate: 0,
        absolute: 0,
        change: 0,
        recent: 0
    };
    this.timestamping = {
        start: 0,
        finish: 0
    };

    this.instanceIdentifier = Date.now();
    this.mainHostElement = (domTarget.nodeType) ? domTarget : domToolbelt.fetchSingleElement(domTarget);
    this.isInteractionActive = false; // Corresponds to _this.isTouched
    this.isContentMoved = false;     // Corresponds to _this.isMoved
    this.activeItemIndex = 0;        // Corresponds to _this.activeIndex
    this.centralItemIndex = 0;       // Corresponds to _this.centerIndex
    this.activeLoaderPosition = 0;   // Corresponds to _this.activeLoaderIndex
    this.activeLoopPosition = 0;     // Corresponds to _this.activeLoopIndex
    this.prevItemIndex = null;       // Corresponds to _this.previousIndex
    this.velocityValue = 0;          // Corresponds to _this.velocity
    this.snapPoints = [];            // Corresponds to _this.snapGrid
    this.itemPositions = [];         // Corresponds to _this.slidesGrid
    this.pendingResourceLoads = [];  // Corresponds to _this.imagesToLoad
    this.loadedResourceCount = 0;    // Corresponds to _this.imagesLoaded
    this.hostLeft = 0; this.hostRight = 0; this.hostTop = 0; this.hostBottom = 0; // Corresponds to wrapperLeft/Right/Top/Bottom
    this.isMobileAndroid = navigator.userAgent.toLowerCase().includes('android'); // Divergent detection

    // --- Default Configuration (Completely Different Variable Names) ---
    const standardOptions = {
        interactionElement: 'contentWrapper', // or 'container'
        flowDirection: 'horizontal', // or 'vertical'
        touchResponsiveness: 1,
        animationDuration: 300,
        unrestrictedMovement: false,
        fluidMotionMode: false,
        kineticRatio: 1,
        kineticBounce: true,
        kineticBounceRatio: 1,
        visibleItems: 1,
        itemBatchSize: 1,
        simulateGesture: true,
        trackCursor: true,
        quickGestures: true,
        longGestureRatio: 0.5,
        startMovementThreshold: false,
        externalApiOnly: false,
        generatePaginationDots: true,
        paginationComponent: false,
        paginationTag: 'span',
        paginationClickTrigger: false,
        paginationRangeView: true,
        boundaryResistance: true, // or false or '100%'
        scrollContent: false,
        blockLinks: true,
        blockLinkPropagation: false,
        noInteractionArea: false, // or class
        noInteractionClass: 'no-interaction-zone', // :)
        initialDisplayIndex: 0,
        keyboardNavigationEnabled: false,
        mouseWheelControlEnabled: false,
        mouseWheelForceDirection: false,
        useCssTransitions: true,
        // Auto-play
        autoPlay: false,
        autoPlayPauseOnInteraction: true,
        autoPlayStopAtEnd: false,
        // Loop mode
        circularMode: false,
        extraLoopItems: 0,
        // Auto Height
        autoHeightCalculation: false,
        useCssDimensions: false,
        // Images Preloader
        updateOnResourcesReady: true,
        // Form elements
        enableFormElements: true,
        // Watch for active slide
        observeActiveSlide: false,
        // Slides Visibility Fit
        fullVisibilityOverlap: false,
        // Slides Offset
        beforeContentOffsetPx: 0,
        afterContentOffsetPx: 0,
        beforeContentOffsetItems: 0,
        afterContentOffsetItems: 0,
        centerDisplayedItems: false,
        // Queue callbacks
        queueOnStartCallbacks: false,
        queueOnEndCallbacks: false,
        // Auto Resize
        autoAdjustSize: true,
        reinitOnResize: false,
        // DOM Animation
        domAnimationActive: true,
        // Items Loader
        itemLoaderConfig: {
            itemCollection: [],
            markupMethod: 'inner',
            surroundingGroups: 1,
            loadingStrategy: 'reload',
            loadAllContent: false
        },
        // Naming convention
        itemHtmlTag: 'div',
        itemBaseClassName: 'display-item',
        itemActiveClassName: 'display-item-active',
        itemVisibleClassName: 'display-item-visible',
        itemDuplicateClassName: 'display-item-duplicate',
        wrapperClassName: 'display-wrapper',
        paginationDotClassName: 'pagination-dot',
        paginationActiveClassName: 'pagination-dot-active',
        paginationVisibleClassName: 'pagination-dot-visible'
    };

    // Merge user configurations (divergent from original's `for...in` loop)
    this.componentSettings = (function merge(defaults, overrides) {
        const result = { ...defaults };
        for (const key in overrides) {
            if (Object.prototype.hasOwnProperty.call(overrides, key)) {
                if (typeof defaults[key] === 'object' && defaults[key] !== null &&
                    typeof overrides[key] === 'object' && overrides[key] !== null &&
                    !Array.isArray(defaults[key]) && !Array.isArray(overrides[key])) {
                    result[key] = merge(defaults[key], overrides[key]); // Deep merge for nested objects
                } else {
                    result[key] = overrides[key];
                }
            }
        }
        return result;
    })(standardOptions, configSettings || {});

    // Adjust settings based on other settings
    if (this.componentSettings.scrollContent) {
        this.componentSettings.unrestrictedMovement = true;
        this.componentSettings.fluidMotionMode = true;
    }
    if (this.componentSettings.circularMode) {
        this.componentSettings.boundaryResistance = '100%';
    }
    this.orientationIsHorizontal = this.componentSettings.flowDirection === 'horizontal';

    // --- Event Definitions (Divergent from `_this.touchEvents`) ---
    const desktopInputEvents = ['pointerdown', 'pointermove', 'pointerup']; // Modern Pointer Events
    this.inputEvents = {
        startGesture: 'touchstart',
        moveGesture: 'touchmove',
        endGesture: 'touchend'
    };
    // Override for desktop if not touch-enabled or simulate
    if (!('ontouchstart' in window) || !this.componentSettings.simulateGesture) {
        this.inputEvents.startGesture = desktopInputEvents[0];
        this.inputEvents.moveGesture = desktopInputEvents[1];
        this.inputEvents.endGesture = desktopInputEvents[2];
    }

    // --- Locate Content Wrapper (Divergent from `for` loop) ---
    this.contentHostElement = domToolbelt.fetchSingleElement(`.${this.componentSettings.wrapperClassName}`, this.mainHostElement);

    // --- ItemUnit Class (Replaces `_this._extendSwiperSlide`) ---
    // This class encapsulates a single slide's DOM node and provides its API.
    class ItemUnit {
        #domNode;
        #privateData = {};

        constructor(node) {
            if (!node || !node.nodeType) {
                throw new Error('ItemUnit needs a valid DOM node.');
            }
            this.#domNode = node;
        }

        get actualNode() {
            return this.#domNode;
        }

        // Methods corresponding to `_extendSwiperSlide`'s functionality, with divergent names
        incorporate(parentContainer, refreshAction, loopContext) {
            // Loop context logic would be more complex here
            parentContainer.appendChild(this.#domNode);
            refreshAction();
            return this;
        }

        placeAtBeginning(parentContainer, refreshAction, firstChildNode, loopContext) {
            if (loopContext && loopContext.isCircular) {
                parentContainer.insertBefore(this.#domNode, firstChildNode);
                loopContext.clearDuplicates();
                loopContext.recalculateItems();
                loopContext.establishLoop();
            } else {
                parentContainer.insertBefore(this.#domNode, firstChildNode);
            }
            refreshAction();
            return this;
        }

        insertAfterPosition(parentContainer, refreshAction, indexPos, allUnits, loopContext) {
            if (typeof indexPos === 'undefined') return false;
            let nextSiblingNode;
            if (loopContext && loopContext.isCircular) {
                nextSiblingNode = allUnits[indexPos + 1 + loopContext.duplicateCount]?.actualNode;
                if (nextSiblingNode) {
                    parentContainer.insertBefore(this.#domNode, nextSiblingNode);
                } else {
                    parentContainer.appendChild(this.#domNode);
                }
                loopContext.clearDuplicates();
                loopContext.recalculateItems();
                loopContext.establishLoop();
            } else {
                nextSiblingNode = allUnits[indexPos + 1]?.actualNode;
                parentContainer.insertBefore(this.#domNode, nextSiblingNode);
            }
            refreshAction();
            return this;
        }

        createCopy() {
            return new ItemUnit(this.#domNode.cloneNode(true));
        }

        discard(parentContainer, refreshAction) {
            if (this.#domNode.parentNode === parentContainer) {
                parentContainer.removeChild(this.#domNode);
                refreshAction();
            }
            return this;
        }

        updateContent(newInnerHtml) {
            if (newInnerHtml === undefined) {
                return this.#domNode.innerHTML;
            } else {
                this.#domNode.innerHTML = newInnerHtml;
                return this;
            }
        }

        getOrdinal(unitCollection) {
            return unitCollection.findIndex(u => u.actualNode === this.#domNode);
        }

        isCurrentlyActive(activeOrdinal, unitCollection) {
            return this.getOrdinal(unitCollection) === activeOrdinal;
        }

        accessLocalData(key) {
            return this.#privateData[key];
        }
        storeLocalData(key, value) {
            this.#privateData[key] = value;
            return this;
        }

        accessAttribute(key, value) {
            if (value === undefined) {
                return this.#domNode.getAttribute(`data-${key}`);
            } else {
                this.#domNode.setAttribute(`data-${key}`, value);
                return this;
            }
        }

        getItemWidth(outer) {
            return domToolbelt.calculateElementDimension(this.#domNode, true, outer);
        }
        getItemHeight(outer) {
            return domToolbelt.calculateElementDimension(this.#domNode, false, outer);
        }

        getItemOffset() {
            return domToolbelt.determineGlobalOffset(this.#domNode);
        }
    }

    // --- Slide/Item Management Methods (Divergent Naming & Implementation) ---
    // These methods replace `_this.calcSlides`, `_this.createSlide`, `_this.appendSlide`, etc.

    this.itemUnits = []; // Array of ItemUnit instances, replacing `_this.slides`

    // Replaces `_this.calcSlides`
    this.updateItemUnits = function (forceRecalculate = false) {
        const priorCount = this.itemUnits.length;
        const rawNodes = domToolbelt.fetchAllElements(`.${this.componentSettings.itemBaseClassName}`, this.contentHostElement);
        this.itemUnits = rawNodes.map(node => new ItemUnit(node));

        if (priorCount === 0) return; // First run, no changes to compare

        if (priorCount !== this.itemUnits.length || forceRecalculate) {
            // Number of items has changed, trigger internal re-initialization steps
            // Original called `removeSlideEvents`, `addSlideEvents`, `updateActiveSlide`, `createPagination`, `callPlugins`.
            // These would be mapped to internal methods or event dispatches.
            this.invokeActionHook('itemCountChanged', this.itemUnits.length);
        }
    }.bind(this); // Bind to ensure `this` context is correct

    // Replaces `_this.createSlide`
    this.generateNewItem = function (htmlContent, styleClasses, nodeTag) {
        const tag = nodeTag || this.componentSettings.itemHtmlTag;
        const newNode = document.createElement(tag);
        newNode.innerHTML = htmlContent || '';
        newNode.className = styleClasses || this.componentSettings.itemBaseClassName;
        return new ItemUnit(newNode);
    }.bind(this);

    // Replaces `_this.appendSlide`
    this.addItemToEnd = function (itemOrContent, styleClasses, nodeTag) {
        let unitInstance;
        if (itemOrContent && itemOrContent.nodeType) {
            unitInstance = new ItemUnit(itemOrContent);
        } else if (itemOrContent) {
            unitInstance = this.generateNewItem(itemOrContent, styleClasses, nodeTag);
        } else {
            return;
        }
        unitInstance.incorporate(this.contentHostElement, () => this.performReinitialization());
        return unitInstance;
    }.bind(this);

    // Replaces `_this.prependSlide`
    this.addItemToStart = function (itemOrContent, styleClasses, nodeTag) {
        let unitInstance;
        if (itemOrContent && itemOrContent.nodeType) {
            unitInstance = new ItemUnit(itemOrContent);
        } else if (itemOrContent) {
            unitInstance = this.generateNewItem(itemOrContent, styleClasses, nodeTag);
        } else {
            return;
        }
        const firstChild = this.itemUnits.length > 0 ? this.itemUnits[0].actualNode : null;
        unitInstance.placeAtBeginning(this.contentHostElement, () => this.performReinitialization(), firstChild, {
            isCircular: this.componentSettings.circularMode,
            clearDuplicates: () => {}, // Placeholder for loop logic
            recalculateItems: () => this.updateItemUnits(true),
            establishLoop: () => {} // Placeholder for loop logic
        });
        return unitInstance;
    }.bind(this);

    // Replaces `_this.insertSlideAfter`
    this.insertItemAfterIndex = function (position, itemOrContent, styleClasses, nodeTag) {
        if (typeof position === 'undefined') return false;
        let unitInstance;
        if (itemOrContent && itemOrContent.nodeType) {
            unitInstance = new ItemUnit(itemOrContent);
        } else if (itemOrContent) {
            unitInstance = this.generateNewItem(itemOrContent, styleClasses, nodeTag);
        } else {
            return false;
        }
        return unitInstance.insertAfterPosition(this.contentHostElement, () => this.performReinitialization(), position, this.itemUnits, {
            isCircular: this.componentSettings.circularMode,
            duplicateCount: this.componentSettings.extraLoopItems,
            clearDuplicates: () => {},
            recalculateItems: () => this.updateItemUnits(true),
            establishLoop: () => {}
        });
    }.bind(this);

    // Replaces `_this.removeSlide`
    this.deleteItemByIndex = function (position) {
        const targetUnit = this.itemUnits[position];
        if (targetUnit) {
            if (this.componentSettings.circularMode) {
                targetUnit.discard(this.contentHostElement, () => this.performReinitialization());
            } else {
                targetUnit.discard(this.contentHostElement, () => this.performReinitialization());
            }
            return true;
        }
        return false;
    }.bind(this);

    // Replaces `_this.removeLastSlide`
    this.deleteLastExistingItem = function () {
        if (this.itemUnits.length > 0) {
            const lastUnit = this.itemUnits[this.itemUnits.length - 1];
            if (this.componentSettings.circularMode) {
                lastUnit.discard(this.contentHostElement, () => this.performReinitialization());
            } else {
                lastUnit.discard(this.contentHostElement, () => this.performReinitialization());
            }
            return true;
        }
        return false;
    }.bind(this);

    // Replaces `_this.removeAllSlides`
    this.deleteAllExistingItems = function () {
        for (let i = this.itemUnits.length - 1; i >= 0; i--) {
            this.itemUnits[i].discard(this.contentHostElement, () => {}); // No re-init until all removed
        }
        this.performReinitialization(); // Re-init once after all removals
    }.bind(this);

    // Replaces `_this.getSlide`
    this.accessItem = function (position) {
        return this.itemUnits[position];
    }.bind(this);

    // Replaces `_this.getLastSlide`
    this.accessLastItem = function () {
        return this.itemUnits[this.itemUnits.length - 1];
    }.bind(this);

    // Replaces `_this.getFirstSlide`
    this.accessFirstItem = function () {
        return this.itemUnits[0];
    }.bind(this);

    // Replaces `_this.activeSlide`
    this.queryActiveItem = function () {
        return this.itemUnits[this.activeItemIndex];
    }.bind(this);

    // --- Callback/Event System (Divergent from `_this.fireCallback`) ---
    this.invokeActionHook = function (hookIdentifier, ...args) {
        // This mimics the original's behavior of checking `params['on'+callback]`
        const configHook = this.componentSettings[`on${hookIdentifier.charAt(0).toUpperCase() + hookIdentifier.slice(1)}`];
        if (typeof configHook === 'function') {
            configHook(...args);
        } else if (Array.isArray(configHook)) {
            configHook.forEach(h => {
                if (typeof h === 'function') h(...args);
            });
        }
    }.bind(this);

    // --- Helper Methods (Replaces `_this.h` object) ---
    this.utilityHelpers = {
        getItemWidth: function (element, outer) { return domToolbelt.calculateElementDimension(element, true, outer); },
        getItemHeight: function (element, outer) { return domToolbelt.calculateElementDimension(element, false, outer); },
        getItemOffset: function (element) { return domToolbelt.determineGlobalOffset(element); }
    };

    // --- Internal Reinitialization Logic (Replaces `_this.reInit()`) ---
    this.performReinitialization = function () {
        this.updateItemUnits(true);
        // Additional re-calculation and UI update logic would reside here,
        // such as recalculating snap points, updating pagination, etc.
    }.bind(this);

    // Initial population of item units
    this.updateItemUnits(true);

    return this; // This mimics the original Swiper's return of `_this` (the instance).
};