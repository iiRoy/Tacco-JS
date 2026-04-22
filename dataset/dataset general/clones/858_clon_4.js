// Polyfill for Object.create, renamed F to ProdGen
if (typeof Object.create !== "function") {
    Object.create = function (blueprint) {
        function ProdGen() {}
        ProdGen.prototype = blueprint;
        return new ProdGen();
    };
}

(function ($, globalWindow, documentBody) { // Renamed parameters and global objects

    // Helper functions for vanilla DOM manipulation (replacing common jQuery patterns)
    function createDiv(className, htmlContent) {
        const div = documentBody.createElement('div');
        if (className) div.className = className;
        if (htmlContent) div.innerHTML = htmlContent;
        return div;
    }

    function createSpan(className, textContent) {
        const span = documentBody.createElement('span');
        if (className) span.className = className;
        if (textContent) span.textContent = textContent;
        return span;
    }

    function wrapElements(elements, wrapperClassName) {
        if (!elements || elements.length === 0) return null;
        const wrapper = createDiv(wrapperClassName);
        // Insert wrapper before the first element, then move all elements into the wrapper
        if (elements[0].parentNode) {
            elements[0].parentNode.insertBefore(wrapper, elements[0]);
        }
        Array.from(elements).forEach(el => wrapper.appendChild(el));
        return wrapper;
    }

    function addClass(element, className) {
        if (element && className) element.classList.add(className);
    }

    function removeClass(element, className) {
        if (element && className) element.classList.remove(className);
    }

    function hasClass(element, className) {
        return element && className && element.classList.contains(className);
    }

    function setStyle(element, styles) {
        if (!element || !styles) return;
        for (const prop in styles) {
            if (styles.hasOwnProperty(prop)) {
                element.style[prop] = styles[prop];
            }
        }
    }

    function getAttribute(element, attr) {
        return element ? element.getAttribute(attr) : null;
    }

    function setAttribute(element, attr, value) {
        if (element && attr && value !== undefined) element.setAttribute(attr, value);
    }

    function isElementVisible(element) {
        if (!element) return false;
        // Check for actual rendered visibility, not just display: none
        return element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0;
    }

    // Constructor function for the core logic (renamed from Carousel)
    var PagedContentSystem = function (containerElement, initialOptions) {
        var ctrl = this; // Renamed 'base' to 'ctrl'

        ctrl.mainContainer = $(containerElement); // Renamed '$elem' - keeping jQuery for initial element selection
        ctrl.systemConfiguration = $.extend({}, $.fn.pagedContent.defaultOptions, ctrl.mainContainer.data(), initialOptions); // Renamed 'options', 'owlCarousel.options', 'userOptions'

        ctrl.inputOptions = initialOptions; // Renamed 'userOptions'
        ctrl.fetchContent(); // Renamed 'loadContent'
    };

    PagedContentSystem.prototype = {
        constructor: PagedContentSystem, // Explicit constructor

        fetchContent: function () { // Renamed 'loadContent'
            var ctrl = this, dataResource; // Renamed 'base', 'url'

            const processFetchedData = (payload) => { // Renamed 'getData', 'data'
                let generatedHtml = ""; // Renamed 'content'
                if (typeof ctrl.systemConfiguration.jsonSuccessHandler === "function") { // Renamed 'jsonSuccess'
                    ctrl.systemConfiguration.jsonSuccessHandler.apply(this, [payload]);
                } else {
                    if (payload && payload.itemsArray) { // Assuming a different JSON structure for Type IV
                        payload.itemsArray.forEach(itemData => {
                            generatedHtml += itemData.contentBlock; // Renamed 'data.owl[i].item'
                        });
                    }
                    ctrl.mainContainer.html(generatedHtml); // Keeping jQuery for .html() for simplicity
                }
                ctrl.prepareForDisplay(); // Renamed 'logIn'
            };

            if (typeof ctrl.systemConfiguration.beforeSystemInit === "function") { // Renamed 'beforeInit'
                ctrl.systemConfiguration.beforeSystemInit.apply(this, [ctrl.mainContainer]);
            }

            if (typeof ctrl.systemConfiguration.jsonSourceUrl === "string") { // Renamed 'jsonPath'
                dataResource = ctrl.systemConfiguration.jsonSourceUrl;
                // Using fetch instead of $.getJSON
                fetch(dataResource)
                    .then(response => response.json())
                    .then(processFetchedData)
                    .catch(error => console.error("Data fetch error:", error)); // Add error handling
            } else {
                ctrl.prepareForDisplay();
            }
        },

        prepareForDisplay: function () { // Renamed 'logIn'
            var ctrl = this;

            ctrl.mainContainer.data("content-system-initial-styles", getAttribute(ctrl.mainContainer[0], "style")); // Renamed 'owl-originalStyles', .attr()
            ctrl.mainContainer.data("content-system-initial-classes", getAttribute(ctrl.mainContainer[0], "class")); // Renamed 'owl-originalClasses'

            setStyle(ctrl.mainContainer[0], {opacity: 0}); // .css()
            ctrl.initialVisibleItemCount = ctrl.systemConfiguration.displayItemCount; // Renamed 'orignalItems', 'items'
            ctrl.detectEnvironment(); // Renamed 'checkBrowser' - stub
            ctrl.computedWrapperWidth = 0; // Renamed 'wrapperWidth'
            ctrl.visibilityMonitor = null; // Renamed 'checkVisible'
            ctrl.initializeComponents(); // Renamed 'setVars'
        },

        initializeComponents: function () { // Renamed 'setVars'
            var ctrl = this;
            if (ctrl.mainContainer.children().length === 0) {return false; }
            ctrl.applyCoreClasses(); // Renamed 'baseClass'
            ctrl.registerInteractionTypes(); // Renamed 'eventTypes' - stub
            ctrl.sourceItems = Array.from(ctrl.mainContainer[0].children); // Renamed '$userItems', converting jQuery children to vanilla array
            ctrl.totalItemCount = ctrl.sourceItems.length; // Renamed 'itemsAmount'
            ctrl.structureContentElements(); // Renamed 'wrapItems'
            ctrl.displayItems = Array.from(ctrl.mainContainer[0].querySelectorAll(".content-system-item")); // Renamed '$owlItems', '.owl-item'
            ctrl.contentWrapper = ctrl.mainContainer[0].querySelector(".content-system-wrapper"); // Renamed '$owlWrapper', '.owl-wrapper'
            ctrl.currentScrollDirection = "forward"; // Renamed 'playDirection'
            ctrl.previousActiveItem = 0; // Renamed 'prevItem'
            ctrl.historyOfPreviousItems = [0]; // Renamed 'prevArr'
            ctrl.activeItemIndex = 0; // Renamed 'currentItem'
            ctrl.setupCustomTriggers(); // Renamed 'customEvents' - stub
            ctrl.startSystemOperations(); // Renamed 'onStartup'
        },

        startSystemOperations: function () { // Renamed 'onStartup'
            var ctrl = this;
            ctrl.updateVisibleItemsConfiguration(); // Renamed 'updateItems'
            ctrl.recalculateAllDimensions(); // Renamed 'calculateAll'
            ctrl.constructNavigationElements(); // Renamed 'buildControls'
            ctrl.refreshNavigationState(); // Renamed 'updateControls' - stub
            ctrl.handleViewportResizing(); // Renamed 'response'
            ctrl.attachMovementListeners(); // Renamed 'moveEvents' - stub
            ctrl.haltOnMouseOver(); // Renamed 'stopOnHover' - stub
            ctrl.reportSystemStatus(); // Renamed 'owlStatus' - stub

            if (ctrl.systemConfiguration.transitionEffect !== false) { // Renamed 'transitionStyle'
                ctrl.applyVisualTransition(ctrl.systemConfiguration.transitionEffect); // Renamed 'transitionTypes' - stub
            }
            if (ctrl.systemConfiguration.autoAdvanceSlides === true) { // Renamed 'autoPlay'
                ctrl.systemConfiguration.autoAdvanceSlides = 5000;
            }
            ctrl.initiateAutoAdvance(); // Renamed 'play' - stub

            setStyle(ctrl.mainContainer[0].querySelector(".content-system-wrapper"), {display: "block"}); // Renamed '.owl-wrapper'

            if (!isElementVisible(ctrl.mainContainer[0])) { // Using vanilla visibility check
                ctrl.monitorSystemVisibility(); // Renamed 'watchVisibility'
            } else {
                setStyle(ctrl.mainContainer[0], {opacity: 1}); // .css()
            }
            ctrl.isInitialLoadComplete = false; // Renamed 'onstartup'
            ctrl.executePostMoveUpdates(); // Renamed 'eachMoveUpdate'
            if (typeof ctrl.systemConfiguration.afterSystemInit === "function") { // Renamed 'afterInit'
                ctrl.systemConfiguration.afterSystemInit.apply(this, [ctrl.mainContainer]);
            }
        },

        executePostMoveUpdates: function () { // Renamed 'eachMoveUpdate'
            var ctrl = this;

            if (ctrl.systemConfiguration.lazyLoadContent === true) { // Renamed 'lazyLoad'
                ctrl.performLazyLoading(); // Renamed 'lazyLoad' - stub
            }
            if (ctrl.systemConfiguration.autoHeightAdjustment === true) { // Renamed 'autoHeight'
                ctrl.adjustContentHeight(); // Renamed 'autoHeight' - stub
            }
            ctrl.updateCurrentlyVisibleItems(); // Renamed 'onVisibleItems' - stub

            if (typeof ctrl.systemConfiguration.afterActionHook === "function") { // Renamed 'afterAction'
                ctrl.systemConfiguration.afterActionHook.apply(this, [ctrl.mainContainer]);
            }
        },

        reconfigureSystemState: function () { // Renamed 'updateVars'
            var ctrl = this;
            if (typeof ctrl.systemConfiguration.beforeUpdateHook === "function") { // Renamed 'beforeUpdate'
                ctrl.systemConfiguration.beforeUpdateHook.apply(this, [ctrl.mainContainer]);
            }
            ctrl.monitorSystemVisibility(); // Renamed 'watchVisibility'
            ctrl.updateVisibleItemsConfiguration(); // Renamed 'updateItems'
            ctrl.recalculateAllDimensions(); // Renamed 'calculateAll'
            ctrl.updateCurrentPosition(); // Renamed 'updatePosition'
            ctrl.refreshNavigationState(); // Renamed 'updateControls'
            ctrl.executePostMoveUpdates(); // Renamed 'eachMoveUpdate'
            if (typeof ctrl.systemConfiguration.afterUpdateHook === "function") { // Renamed 'afterUpdate'
                ctrl.systemConfiguration.afterUpdateHook.apply(this, [ctrl.mainContainer]);
            }
        },

        restartSystemLayout: function () { // Renamed 'reload'
            var ctrl = this;
            globalWindow.setTimeout(function () {
                ctrl.reconfigureSystemState();
            }, 0);
        },

        monitorSystemVisibility: function () { // Renamed 'watchVisibility'
            var ctrl = this;

            if (!isElementVisible(ctrl.mainContainer[0])) {
                setStyle(ctrl.mainContainer[0], {opacity: 0});
                globalWindow.clearInterval(ctrl.autoAdvanceTimerId); // Renamed 'autoPlayInterval'
                globalWindow.clearInterval(ctrl.visibilityMonitor); // Renamed 'checkVisible'
            } else {
                return false;
            }
            ctrl.visibilityMonitor = globalWindow.setInterval(function () {
                if (isElementVisible(ctrl.mainContainer[0])) {
                    ctrl.restartSystemLayout();
                    // Replacing jQuery .animate() with direct CSS for opacity
                    setStyle(ctrl.mainContainer[0], {opacity: 1, transition: 'opacity 0.2s ease-in-out'}); // Added transition for smooth effect
                    globalWindow.clearInterval(ctrl.visibilityMonitor);
                }
            }, 500);
        },

        structureContentElements: function () { // Renamed 'wrapItems'
            var ctrl = this;
            // Manual wrapping logic to replace jQuery .wrapAll() and .wrap()
            ctrl.sourceItems.forEach(item => addClass(item, 'content-system-item')); // Add inner class first
            const contentWrapper = wrapElements(ctrl.sourceItems, "content-system-wrapper"); // Wrap all original children
            if (contentWrapper) {
                const outerContainer = wrapElements([contentWrapper], "content-system-outer-wrapper"); // Wrap the wrapper
                ctrl.outerContainer = outerContainer; // Renamed 'wrapperOuter'
            }
            setStyle(ctrl.mainContainer[0], {display: "block"});
        },

        applyCoreClasses: function () { // Renamed 'baseClass'
            var ctrl = this,
                hasMainClass = hasClass(ctrl.mainContainer[0], ctrl.systemConfiguration.baseContainerClass), // Renamed 'hasBaseClass', 'options.baseClass'
                hasThemeClass = hasClass(ctrl.mainContainer[0], ctrl.systemConfiguration.visualThemeClass); // Renamed 'hasThemeClass', 'options.theme'

            if (!hasMainClass) {
                addClass(ctrl.mainContainer[0], ctrl.systemConfiguration.baseContainerClass);
            }

            if (!hasThemeClass) {
                addClass(ctrl.mainContainer[0], ctrl.systemConfiguration.visualThemeClass);
            }
        },

        updateVisibleItemsConfiguration: function () { // Renamed 'updateItems'
            var ctrl = this, currentViewportWidth; // Renamed 'base', 'width'

            if (ctrl.systemConfiguration.responsiveMode === false) { // Renamed 'responsive'
                return false;
            }
            if (ctrl.systemConfiguration.singleItemDisplay === true) { // Renamed 'singleItem'
                ctrl.systemConfiguration.displayItemCount = ctrl.initialVisibleItemCount = 1;
                ctrl.systemConfiguration.customBreakpoints = false; // Renamed 'itemsCustom'
                ctrl.systemConfiguration.desktopBreakpoint = false; // Renamed 'itemsDesktop'
                ctrl.systemConfiguration.smallDesktopBreakpoint = false; // Renamed 'itemsDesktopSmall'
                ctrl.systemConfiguration.tabletBreakpoint = false; // Renamed 'itemsTablet'
                ctrl.systemConfiguration.smallTabletBreakpoint = false; // Renamed 'itemsTabletSmall'
                ctrl.systemConfiguration.mobileBreakpoint = false; // Renamed 'itemsMobile'
                return false;
            }

            currentViewportWidth = $(ctrl.systemConfiguration.responsiveAnchorElement).width(); // Renamed 'responsiveBaseWidth'

            if (currentViewportWidth > (ctrl.systemConfiguration.desktopBreakpoint[0] || ctrl.initialVisibleItemCount)) {
                ctrl.systemConfiguration.displayItemCount = ctrl.initialVisibleItemCount;
            }
            if (ctrl.systemConfiguration.customBreakpoints !== false) {
                // Reorder array by screen size
                ctrl.systemConfiguration.customBreakpoints.sort((a, b) => a[0] - b[0]);

                for (let i = 0; i < ctrl.systemConfiguration.customBreakpoints.length; i += 1) {
                    if (ctrl.systemConfiguration.customBreakpoints[i][0] <= currentViewportWidth) {
                        ctrl.systemConfiguration.displayItemCount = ctrl.systemConfiguration.customBreakpoints[i][1];
                    }
                }

            } else {
                // Using a functional approach for breakpoint checks, different from original nested ifs
                const breakpoints = [
                    { width: ctrl.systemConfiguration.desktopBreakpoint[0], count: ctrl.systemConfiguration.desktopBreakpoint[1], active: ctrl.systemConfiguration.desktopBreakpoint !== false },
                    { width: ctrl.systemConfiguration.smallDesktopBreakpoint[0], count: ctrl.systemConfiguration.smallDesktopBreakpoint[1], active: ctrl.systemConfiguration.smallDesktopBreakpoint !== false },
                    { width: ctrl.systemConfiguration.tabletBreakpoint[0], count: ctrl.systemConfiguration.tabletBreakpoint[1], active: ctrl.systemConfiguration.tabletBreakpoint !== false },
                    { width: ctrl.systemConfiguration.smallTabletBreakpoint[0], count: ctrl.systemConfiguration.smallTabletBreakpoint[1], active: ctrl.systemConfiguration.smallTabletBreakpoint !== false },
                    { width: ctrl.systemConfiguration.mobileBreakpoint[0], count: ctrl.systemConfiguration.mobileBreakpoint[1], active: ctrl.systemConfiguration.mobileBreakpoint !== false }
                ].filter(bp => bp.active && currentViewportWidth <= bp.width)
                 .sort((a, b) => b.width - a.width); // Sort descending to pick smallest breakpoint first

                if (breakpoints.length > 0) {
                    ctrl.systemConfiguration.displayItemCount = breakpoints[0].count;
                }
            }

            // if number of items is less than declared
            if (ctrl.systemConfiguration.displayItemCount > ctrl.totalItemCount && ctrl.systemConfiguration.allowItemScaleUp === true) { // Renamed 'itemsScaleUp'
                ctrl.systemConfiguration.displayItemCount = ctrl.totalItemCount;
            }
        },

        handleViewportResizing: function () { // Renamed 'response'
            var ctrl = this,
                resizeTimeoutId, // Renamed 'smallDelay'
                lastWindowDimension; // Renamed 'lastWindowWidth'

            if (ctrl.systemConfiguration.responsiveMode !== true) { // Renamed 'responsive'
                return false;
            }
            lastWindowDimension = $(globalWindow).width();

            ctrl.viewportResizeHandler = () => { // Renamed 'resizer', using arrow function for 'this'
                if ($(globalWindow).width() !== lastWindowDimension) {
                    if (ctrl.systemConfiguration.autoAdvanceSlides !== false) { // Renamed 'autoPlay'
                        globalWindow.clearInterval(ctrl.autoAdvanceTimerId); // Renamed 'autoPlayInterval'
                    }
                    globalWindow.clearTimeout(resizeTimeoutId);
                    resizeTimeoutId = globalWindow.setTimeout(() => { // Using arrow function for 'this'
                        lastWindowDimension = $(globalWindow).width();
                        ctrl.reconfigureSystemState(); // Renamed 'updateVars'
                    }, ctrl.systemConfiguration.refreshRateOnResize); // Renamed 'responsiveRefreshRate'
                }
            };
            $(globalWindow).resize(ctrl.viewportResizeHandler); // Keeping jQuery for global event listener
        },

        updateCurrentPosition: function () { // Renamed 'updatePosition'
            var ctrl = this;
            ctrl.jumpToItem(ctrl.activeItemIndex); // Renamed 'jumpTo' - stub
            if (ctrl.systemConfiguration.autoAdvanceSlides !== false) { // Renamed 'autoPlay'
                ctrl.checkAutoAdvanceState(); // Renamed 'checkAp' - stub
            }
        },

        assignItemDimensions: function () { // Renamed 'appendItemsSizes'
            var ctrl = this,
                pageCounter = 0, // Renamed 'roundPages'
                endItemIndex = ctrl.totalItemCount - ctrl.systemConfiguration.displayItemCount; // Renamed 'lastItem'

            ctrl.displayItems.forEach((itemElement, index) => { // Renamed '$owlItems.each', '$this'
                setStyle(itemElement, {"width": ctrl.calculatedItemWidth + "px"}); // .css()
                setAttribute(itemElement, "data-content-item-id", String(index)); // .data("owl-item")

                if (index % ctrl.systemConfiguration.displayItemCount === 0 || index === endItemIndex) {
                    if (!(index > endItemIndex)) {
                        pageCounter += 1;
                    }
                }
                setAttribute(itemElement, "data-content-page-group", String(pageCounter)); // .data("owl-roundPages")
            });
        },

        positionContentWrapper: function () { // Renamed 'appendWrapperSizes'
            var ctrl = this,
                totalWrapperWidth = ctrl.displayItems.length * ctrl.calculatedItemWidth; // Renamed 'width'

            setStyle(ctrl.contentWrapper, { // .css()
                "width": totalWrapperWidth * 2 + "px",
                "left": "0px"
            });
            ctrl.assignItemDimensions(); // Renamed 'appendItemsSizes'
        },

        recalculateAllDimensions: function () { // Renamed 'calculateAll'
            var ctrl = this;
            ctrl.determineIndividualItemWidth(); // Renamed 'calculateWidth'
            ctrl.positionContentWrapper(); // Renamed 'appendWrapperSizes'
            ctrl.precomputeSlidePositions(); // Renamed 'loops'
            ctrl.getMaxScrollOffset(); // Renamed 'max'
        },

        determineIndividualItemWidth: function () { // Renamed 'calculateWidth'
            var ctrl = this;
            ctrl.calculatedItemWidth = Math.round(ctrl.mainContainer.width() / ctrl.systemConfiguration.displayItemCount); // Renamed 'itemWidth'
        },

        getMaxScrollOffset: function () { // Renamed 'max'
            var ctrl = this,
                maxOffset = ((ctrl.totalItemCount * ctrl.calculatedItemWidth) - ctrl.systemConfiguration.displayItemCount * ctrl.calculatedItemWidth) * -1; // Renamed 'maximum'
            if (ctrl.systemConfiguration.displayItemCount > ctrl.totalItemCount) {
                ctrl.maxScrollableIndex = 0; // Renamed 'maximumItem'
                maxOffset = 0;
                ctrl.maxPixelScroll = 0; // Renamed 'maximumPixels'
            } else {
                ctrl.maxScrollableIndex = ctrl.totalItemCount - ctrl.systemConfiguration.displayItemCount;
                ctrl.maxPixelScroll = maxOffset;
            }
            return maxOffset;
        },

        getMinScrollOffset: function () { // Renamed 'min'
            return 0;
        },

        precomputeSlidePositions: function () { // Renamed 'loops'
            var ctrl = this,
                prevPage = 0, // Renamed 'prev'
                currentWidthAccumulated = 0, // Renamed 'elWidth'
                itemElement, // Renamed 'item'
                pageGroupNumber; // Renamed 'roundPageNum'

            ctrl.positionOffsets = [0]; // Renamed 'positionsInArray'
            ctrl.pageOffsets = []; // Renamed 'pagesInArray'

            for (let i = 0; i < ctrl.totalItemCount; i += 1) {
                currentWidthAccumulated += ctrl.calculatedItemWidth;
                ctrl.positionOffsets.push(-currentWidthAccumulated);

                if (ctrl.systemConfiguration.scrollByPageOption === true) { // Renamed 'scrollPerPage'
                    itemElement = ctrl.displayItems[i]; // Get vanilla element
                    pageGroupNumber = parseInt(getAttribute(itemElement, "data-content-page-group"), 10); // .data("owl-roundPages")
                    if (pageGroupNumber !== prevPage) {
                        ctrl.pageOffsets[prevPage] = ctrl.positionOffsets[i];
                        prevPage = pageGroupNumber;
                    }
                }
            }
        },

        constructNavigationElements: function () { // Renamed 'buildControls'
            var ctrl = this;
            if (ctrl.systemConfiguration.enableSlideNavigation === true || ctrl.systemConfiguration.enablePageIndicators === true) { // Renamed 'navigation', 'pagination'
                ctrl.controlPanel = $(createDiv("content-system-controls")).toggleClass("interactive", !ctrl.browserFeatures.isTouch).appendTo(ctrl.mainContainer); // Renamed 'owlControls', 'clickable', assuming ctrl.browserFeatures exists
            }
            if (ctrl.systemConfiguration.enablePageIndicators === true) {
                ctrl.generatePagingIndicators(); // Renamed 'buildPagination'
            }
            if (ctrl.systemConfiguration.enableSlideNavigation === true) {
                ctrl.createControlButtons(); // Renamed 'buildButtons'
            }
        },

        createControlButtons: function () { // Renamed 'buildButtons'
            var ctrl = this,
                buttonsWrapper = $(createDiv("content-system-buttons")); // Renamed 'buttonsWrapper'
            ctrl.controlPanel.append(buttonsWrapper);

            ctrl.previousSlideButton = $(createDiv("content-system-prev", ctrl.systemConfiguration.navigationButtonText[0] || "")); // Renamed 'buttonPrev', 'navigationText'

            ctrl.nextSlideButton = $(createDiv("content-system-next", ctrl.systemConfiguration.navigationButtonText[1] || "")); // Renamed 'buttonNext'

            buttonsWrapper
                .append(ctrl.previousSlideButton)
                .append(ctrl.nextSlideButton);

            // Using vanilla JS event delegation
            buttonsWrapper[0].addEventListener("mousedown", (e) => e.preventDefault());
            buttonsWrapper[0].addEventListener("touchstart", (e) => e.preventDefault());

            buttonsWrapper[0].addEventListener("mouseup", (e) => {
                e.preventDefault();
                const target = e.target.closest("div[class^=\"content-system-\"]");
                if (target && hasClass(target, "content-system-next")) {
                    ctrl.moveForward(); // Renamed 'next' - stub
                } else if (target && hasClass(target, "content-system-prev")) {
                    ctrl.moveBackward(); // Renamed 'prev' - stub
                }
            });
            buttonsWrapper[0].addEventListener("touchend", (e) => {
                e.preventDefault();
                const target = e.target.closest("div[class^=\"content-system-\"]");
                if (target && hasClass(target, "content-system-next")) {
                    ctrl.moveForward();
                } else if (target && hasClass(target, "content-system-prev")) {
                    ctrl.moveBackward();
                }
            });
        },

        generatePagingIndicators: function () { // Renamed 'buildPagination'
            var ctrl = this;

            ctrl.pagingContainer = $(createDiv("content-system-pagination")); // Renamed 'paginationWrapper'
            ctrl.controlPanel.append(ctrl.pagingContainer);

            // Using vanilla JS event delegation
            ctrl.pagingContainer[0].addEventListener("mouseup", (e) => {
                e.preventDefault();
                const target = e.target.closest(".content-system-page");
                if (target) {
                    const pageIndex = parseInt(getAttribute(target, "data-content-page-id"), 10); // .data("owl-page")
                    if (pageIndex !== ctrl.activeItemIndex) {
                        ctrl.navigateToPage(pageIndex, true); // Renamed 'goTo' - stub
                    }
                }
            });
            ctrl.pagingContainer[0].addEventListener("touchend", (e) => {
                e.preventDefault();
                const target = e.target.closest(".content-system-page");
                if (target) {
                    const pageIndex = parseInt(getAttribute(target, "data-content-page-id"), 10);
                    if (pageIndex !== ctrl.activeItemIndex) {
                        ctrl.navigateToPage(pageIndex, true);
                    }
                }
            });
        },

        refreshPagingIndicators: function () { // Renamed 'updatePagination'
            var ctrl = this,
                indicatorCounter, // Renamed 'counter'
                lastPossiblePageStart, // Renamed 'lastPage'
                lastItemIdxForPage, // Renamed 'lastItem'
                pageButtonElement, // Renamed 'paginationButton'
                pageButtonNumberSpan; // Renamed 'paginationButtonInner'

            if (ctrl.systemConfiguration.enablePageIndicators === false) { // Renamed 'pagination'
                return false;
            }

            ctrl.pagingContainer.html(""); // .html()

            indicatorCounter = 0;
            lastPossiblePageStart = ctrl.totalItemCount - ctrl.totalItemCount % ctrl.systemConfiguration.displayItemCount;

            for (let i = 0; i < ctrl.totalItemCount; i += 1) {
                if (i % ctrl.systemConfiguration.displayItemCount === 0) {
                    indicatorCounter += 1;
                    if (lastPossiblePageStart === i) {
                        lastItemIdxForPage = ctrl.totalItemCount - ctrl.systemConfiguration.displayItemCount;
                    }
                    pageButtonElement = $(createDiv("content-system-page")); // Renamed 'owl-page'
                    pageButtonNumberSpan = $(createSpan(
                        ctrl.systemConfiguration.showPageNumbers ? "content-system-number-label" : "",
                        ctrl.systemConfiguration.showPageNumbers ? String(indicatorCounter) : ""
                    )); // Renamed 'paginationNumbers', 'owl-numbers'
                    pageButtonElement.append(pageButtonNumberSpan);

                    setAttribute(pageButtonElement[0], "data-content-page-id", String(lastPossiblePageStart === i ? lastItemIdxForPage : i)); // .data("owl-page")
                    setAttribute(pageButtonElement[0], "data-content-page-number", String(indicatorCounter)); // .data("owl-roundPages")

                    ctrl.pagingContainer.append(pageButtonElement);
                }
            }
            ctrl.highlightActivePageIndicator(); // Renamed 'checkPagination'
        },

        highlightActivePageIndicator: function () { // Renamed 'checkPagination'
            var ctrl = this;
            if (ctrl.systemConfiguration.enablePageIndicators === false) {
                return false;
            }
            // Remove active class from all first
            Array.from(ctrl.pagingContainer[0].querySelectorAll(".content-system-page")).forEach(btn => removeClass(btn, "active-page")); // Renamed 'owl-page'

            // Find the current page group number
            const currentPageGroup = parseInt(getAttribute(ctrl.displayItems[ctrl.activeItemIndex], "data-content-page-group"), 10); // Renamed 'owlItems', 'currentItem', 'owl-roundPages'

            // Add active class to the matching page indicator
            Array.from(ctrl.pagingContainer[0].querySelectorAll(".content-system-page")).forEach(btn => {
                if (parseInt(getAttribute(btn, "data-content-page-number"), 10) === currentPageGroup) { // Renamed 'owl-roundPages'
                    addClass(btn, "active-page");
                }
            });
        },

        // --- STUB METHODS (functions not provided in original snippet, but called) ---
        detectEnvironment: function() {
            this.browserFeatures = {
                isTouch: 'ontouchstart' in globalWindow || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
            };
        },
        registerInteractionTypes: function() { /* Placeholder for event types setup */ },
        setupCustomTriggers: function() { /* Placeholder for custom events */ },
        refreshNavigationState: function() { /* Placeholder for updateControls logic */ },
        attachMovementListeners: function() { /* Placeholder for moveEvents logic */ },
        haltOnMouseOver: function() { /* Placeholder for stopOnHover logic */ },
        reportSystemStatus: function() { /* Placeholder for owlStatus logic */ },
        applyVisualTransition: function(type) { /* Placeholder for transitionTypes logic */ },
        initiateAutoAdvance: function() { /* Placeholder for play logic */
            if (this.systemConfiguration.autoAdvanceSlides) {
                this.autoAdvanceTimerId = globalWindow.setInterval(() => {
                    this.moveForward(); // Or specific auto-advance logic
                }, this.systemConfiguration.autoAdvanceSlides);
            }
        },
        performLazyLoading: function() { /* Placeholder for lazyLoad logic */ },
        adjustContentHeight: function() { /* Placeholder for autoHeight logic */ },
        updateCurrentlyVisibleItems: function() { /* Placeholder for onVisibleItems logic */ },
        jumpToItem: function(index) { /* Placeholder for jumpTo logic */
            // Example: apply transform to contentWrapper
            const targetOffset = this.positionOffsets[index];
            if (this.contentWrapper) {
                setStyle(this.contentWrapper, {
                    transform: `translateX(${targetOffset}px)`,
                    transition: 'transform 0.3s ease-in-out' // Add transition for smooth movement
                });
            }
            this.activeItemIndex = index;
            this.highlightActivePageIndicator(); // Ensure pagination updates on jump
        },
        checkAutoAdvanceState: function() { /* Placeholder for checkAp logic */
            if (this.autoAdvanceTimerId) {
                globalWindow.clearInterval(this.autoAdvanceTimerId);
                this.initiateAutoAdvance(); // Restart timer
            }
        },
        moveForward: function() { /* Placeholder for next logic */
            let nextIndex = this.activeItemIndex + 1;
            if (nextIndex > this.maxScrollableIndex) { // Or loop logic
                nextIndex = 0; // Loop to start
            }
            this.jumpToItem(nextIndex);
        },
        moveBackward: function() { /* Placeholder for prev logic */
            let prevIndex = this.activeItemIndex - 1;
            if (prevIndex < 0) { // Or loop logic
                prevIndex = this.maxScrollableIndex; // Loop to end
            }
            this.jumpToItem(prevIndex);
        },
        navigateToPage: function(index, animate) { /* Placeholder for goTo logic */
            // This needs to map page index to item index.
            // For now, assuming index is an item index directly.
            this.jumpToItem(index);
        }
    };

    // jQuery plugin definition (renamed from owlCarousel)
    $.fn.pagedContent = function (methodOptions) {
        return this.each(function () {
            if (!$.data(this, "content-system")) { // Renamed 'owlCarousel'
                $.data(this, "content-system", new PagedContentSystem(this, methodOptions));
            }
        });
    };

    // Default options (renamed from owlCarousel.options)
    $.fn.pagedContent.defaultOptions = {
        baseContainerClass: "content-system-base", // Renamed 'baseClass'
        visualThemeClass: "content-system-theme", // Renamed 'theme'
        jsonSourceUrl: false, // Renamed 'jsonPath'
        jsonSuccessHandler: false, // Renamed 'jsonSuccess'
        beforeSystemInit: false, // Renamed 'beforeInit'
        afterSystemInit: false, // Renamed 'afterInit'
        beforeUpdateHook: false, // Renamed 'beforeUpdate'
        afterUpdateHook: false, // Renamed 'afterUpdate'
        afterActionHook: false, // Renamed 'afterAction'
        displayItemCount: 5, // Renamed 'items'
        responsiveMode: true, // Renamed 'responsive'
        singleItemDisplay: false, // Renamed 'singleItem'
        customBreakpoints: false, // Renamed 'itemsCustom'
        desktopBreakpoint: [1199, 4], // Renamed 'itemsDesktop'
        smallDesktopBreakpoint: [979, 3], // Renamed 'itemsDesktopSmall'
        tabletBreakpoint: [768, 2], // Renamed 'itemsTablet'
        smallTabletBreakpoint: [479, 1], // Renamed 'itemsTabletSmall'
        mobileBreakpoint: [0, 1], // Renamed 'itemsMobile'
        allowItemScaleUp: false, // Renamed 'itemsScaleUp'
        responsiveAnchorElement: globalWindow, // Renamed 'responsiveBaseWidth'
        refreshRateOnResize: 200, // Renamed 'responsiveRefreshRate'
        lazyLoadContent: false, // Renamed 'lazyLoad'
        autoHeightAdjustment: false, // Renamed 'autoHeight'
        transitionEffect: false, // Renamed 'transitionStyle'
        autoAdvanceSlides: false, // Renamed 'autoPlay'
        scrollByPageOption: false, // Renamed 'scrollPerPage'
        enableSlideNavigation: false, // Renamed 'navigation'
        navigationButtonText: ["prev", "next"], // Renamed 'navigationText'
        enablePageIndicators: false, // Renamed 'pagination'
        showPageNumbers: false // Renamed 'paginationNumbers'
        // ... other default options would go here
    };

})(jQuery, window, document);