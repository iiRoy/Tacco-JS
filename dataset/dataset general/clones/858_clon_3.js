/*
 *  Modern JavaScript Content Slider Module
 *
 *  Derived from jQuery OwlCarousel v1.3.3
 *  Original Copyright (c) 2013 Bartosz Wojciechowski
 *
 *  This adaptation is provided under the MIT License.
 *  It features structural modifications and modern JS enhancements.
 *
 */

/* ESLint directives for global variables and specific rules: */
/* global $, jQuery, window, document */
/* eslint-disable no-unused-vars, no-shadow, prefer-const, no-var, semi */

// Polyfill for Object.create if environment lacks it, using a constructor function pattern.
if (typeof Object.create !== "function") {
    Object.create = function (protoObject) {
        function TempConstructor() {}
        TempConstructor.prototype = protoObject;
        return new TempConstructor();
    };
}

// Encapsulate the module within an Immediately Invoked Function Expression (IIFE)
// to avoid polluting the global namespace and ensure jQuery compatibility.
(function (jQueryLib, globalWindow, htmlDocument) {

    // Main module definition for the content display manager.
    const ContentScroller = {
        /**
         * Initializes the content scroller instance.
         * @param {object} customConfig - User-defined configuration options.
         * @param {HTMLElement} targetElement - The DOM element to transform into a scroller.
         */
        initializeDisplay: function (customConfig, targetElement) {
            const selfInstance = this;

            // Store the jQuery-wrapped target element.
            selfInstance.$container = jQueryLib(targetElement);

            // Merge default settings with element data attributes and user-provided options.
            // A deep merge could be used here for more complex options.
            selfInstance.settings = jQueryLib.extend(
                {},
                jQueryLib.fn.contentScroller.defaultSettings,
                selfInstance.$container.data(),
                customConfig
            );

            selfInstance.customSettings = customConfig; // Keep track of original custom settings.
            selfInstance.acquireAndProcessData(); // Begin content loading process.
        },

        /**
         * Fetches content based on configuration (e.g., JSON) or proceeds with existing markup.
         */
        acquireAndProcessData: function () {
            const selfInstance = this;
            let jsonSourcePath;

            /**
             * Handles the data received from a JSON endpoint.
             * @param {object} payload - The JSON data payload.
             */
            function processFetchedData(payload) {
                let htmlFragments = "";
                // Execute a custom success callback if provided.
                if (typeof selfInstance.settings.jsonSuccessCallback === "function") {
                    selfInstance.settings.jsonSuccessCallback.apply(this, [payload]);
                } else {
                    // Assuming payload.items contains an array or object of items
                    if (payload && payload.items) {
                        // Using Object.keys and forEach for a more modern iteration
                        Object.keys(payload.items).forEach(function (key) {
                            if (Object.prototype.hasOwnProperty.call(payload.items, key)) {
                                htmlFragments += payload.items[key].markup; // Renamed 'item' to 'markup'
                            }
                        });
                        selfInstance.$container.html(htmlFragments);
                    } else {
                        globalWindow.console.warn("ContentScroller: No 'items' found in JSON payload or custom success handler not provided.");
                    }
                }
                selfInstance.prepareDisplayArea(); // Proceed to prepare the display.
            }

            // Trigger a pre-initialization callback.
            if (typeof selfInstance.settings.onPreInitialization === "function") {
                selfInstance.settings.onPreInitialization.apply(this, [selfInstance.$container]);
            }

            // Check if JSON content loading is configured.
            if (typeof selfInstance.settings.jsonSourcePath === "string" && selfInstance.settings.jsonSourcePath.length > 0) {
                jsonSourcePath = selfInstance.settings.jsonSourcePath;
                jQueryLib.getJSON(jsonSourcePath, processFetchedData)
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        globalWindow.console.error("ContentScroller: Failed to load JSON from " + jsonSourcePath, textStatus, errorThrown);
                        // Fallback to existing content or show error
                        selfInstance.prepareDisplayArea();
                    });
            } else {
                selfInstance.prepareDisplayArea(); // No JSON path, use existing HTML.
            }
        },

        /**
         * Prepares the main container and stores its initial state.
         */
        prepareDisplayArea: function () {
            const selfInstance = this;

            // Store original styles and classes for potential restoration.
            selfInstance.$container.data("originalContainerStyles", selfInstance.$container.attr("style"));
            selfInstance.$container.data("originalContainerClasses", selfInstance.$container.attr("class"));

            selfInstance.$container.css({ opacity: 0 }); // Hide container initially.
            selfInstance.initialItemCount = selfInstance.settings.visibleItems; // Store original item count.
            selfInstance.detectBrowserCapabilities(); // Placeholder for browser detection.
            selfInstance.contentPaneWidth = 0; // Initialize content pane width.
            selfInstance.visibilityMonitor = null; // Initialize visibility check interval.
            selfInstance.establishCoreVariables(); // Set up core variables.
        },

        /**
         * Establishes and initializes various internal variables and components.
         * Adds a check for empty container.
         */
        establishCoreVariables: function () {
            const selfInstance = this;
            if (selfInstance.$container.children().length === 0) {
                globalWindow.console.warn("ContentScroller: No elements found in container. Initialization aborted.");
                return false;
            }

            selfInstance.applyBaseStyling();
            selfInstance.setupInteractionHandlers(); // Placeholder for event setup.
            selfInstance.$rawElements = selfInstance.$container.children();
            selfInstance.totalElements = selfInstance.$rawElements.length;
            selfInstance.encapsulateElements();
            selfInstance.$slideUnits = selfInstance.$container.find(".slide-unit");
            selfInstance.$contentWrapper = selfInstance.$container.find(".content-wrapper");
            selfInstance.scrollDirection = "next"; // Default scroll direction.
            selfInstance.lastActiveIndex = 0;
            selfInstance.historyOfPositions = [0]; // Tracks past positions.
            selfInstance.currentActiveIndex = 0;
            selfInstance.registerCustomEvents(); // Placeholder for custom event registration.
            selfInstance.performInitialSetup();
        },

        /**
         * Executes initial setup routines after core variables are established.
         */
        performInitialSetup: function () {
            const selfInstance = this;

            selfInstance.adjustItemConfiguration();
            selfInstance.computeLayoutDimensions();
            selfInstance.constructNavigationElements();
            selfInstance.refreshNavigationState();
            selfInstance.enableResponsiveness();
            selfInstance.attachMovementEvents(); // Placeholder.
            selfInstance.pauseOnHover(); // Placeholder.
            selfInstance.reportStatus(); // Placeholder.

            if (selfInstance.settings.transitionBehavior !== false) {
                selfInstance.setTransitionBehavior(selfInstance.settings.transitionBehavior); // Placeholder.
            }
            // Normalize auto-advance setting.
            if (selfInstance.settings.autoAdvance === true) {
                selfInstance.settings.autoAdvance = 5000; // Default interval.
            }
            selfInstance.startAutoAdvance(); // Renamed play() to startAutoAdvance()

            selfInstance.$container.find(".content-wrapper").css("display", "block");

            if (!selfInstance.$container.is(":visible")) {
                selfInstance.monitorVisibility();
            } else {
                selfInstance.$container.css("opacity", 1);
            }
            selfInstance.isStartingUp = false; // Renamed onstartup to isStartingUp
            selfInstance.postMovementUpdates();

            if (typeof selfInstance.settings.onPostInitialization === "function") {
                selfInstance.settings.onPostInitialization.apply(this, [selfInstance.$container]);
            }
        },

        /**
         * Actions to perform after each movement or update.
         */
        postMovementUpdates: function () {
            const selfInstance = this;

            if (selfInstance.settings.lazyLoading === true) { // Renamed lazyLoad to lazyLoading
                selfInstance.handleLazyLoading(); // Placeholder.
            }
            if (selfInstance.settings.autoAdjustHeight === true) { // Renamed autoHeight to autoAdjustHeight
                selfInstance.adjustContainerHeight(); // Placeholder.
            }
            selfInstance.updateVisibleItems(); // Placeholder.

            if (typeof selfInstance.settings.onActionComplete === "function") { // Renamed afterAction to onActionComplete
                selfInstance.settings.onActionComplete.apply(this, [selfInstance.$container]);
            }
        },

        /**
         * Updates all dynamic variables and re-renders the display.
         */
        refreshAllVariables: function () { // Renamed updateVars to refreshAllVariables
            const selfInstance = this;
            if (typeof selfInstance.settings.onPreUpdate === "function") { // Renamed beforeUpdate to onPreUpdate
                selfInstance.settings.onPreUpdate.apply(this, [selfInstance.$container]);
            }
            selfInstance.monitorVisibility();
            selfInstance.adjustItemConfiguration();
            selfInstance.computeLayoutDimensions();
            selfInstance.repositionElements(); // Renamed updatePosition to repositionElements
            selfInstance.refreshNavigationState();
            selfInstance.postMovementUpdates();
            if (typeof selfInstance.settings.onPostUpdate === "function") { // Renamed afterUpdate to onPostUpdate
                selfInstance.settings.onPostUpdate.apply(this, [selfInstance.$container]);
            }
        },

        /**
         * Triggers a full reload of the display after a short delay.
         */
        reinitializeDisplay: function () { // Renamed reload to reinitializeDisplay
            const selfInstance = this;
            globalWindow.setTimeout(function () {
                selfInstance.refreshAllVariables();
            }, 0);
        },

        /**
         * Monitors the visibility of the container and reloads if it becomes visible.
         */
        monitorVisibility: function () {
            const selfInstance = this;
            const animationDuration = 200; // Added as a variable

            if (selfInstance.$container.is(":visible") === false) {
                selfInstance.$container.css({ opacity: 0 });
                globalWindow.clearInterval(selfInstance.autoAdvanceTimer); // Renamed autoPlayInterval
                globalWindow.clearInterval(selfInstance.visibilityMonitor); // Renamed checkVisible
            } else {
                // If already visible, no need to monitor further unless explicitly stopped.
                return false;
            }

            selfInstance.visibilityMonitor = globalWindow.setInterval(function () {
                if (selfInstance.$container.is(":visible")) {
                    selfInstance.reinitializeDisplay();
                    selfInstance.$container.animate({ opacity: 1 }, animationDuration);
                    globalWindow.clearInterval(selfInstance.visibilityMonitor);
                }
            }, 500);
        },

        /**
         * Wraps the user-provided items within the scroller's structural elements.
         */
        encapsulateElements: function () { // Renamed wrapItems to encapsulateElements
            const selfInstance = this;
            const wrapperHtml = "<div class=\"content-wrapper\">"; // Added variable for clarity
            const itemHtml = "<div class=\"slide-unit\"></div>"; // Renamed class

            selfInstance.$rawElements.wrapAll(wrapperHtml).wrap(itemHtml);
            selfInstance.$container.find(".content-wrapper").wrap("<div class=\"content-viewport\">"); // Renamed class
            selfInstance.$viewportContainer = selfInstance.$container.find(".content-viewport"); // Renamed wrapperOuter
            selfInstance.$container.css("display", "block");
        },

        /**
         * Applies base and theme CSS classes to the container.
         */
        applyBaseStyling: function () { // Renamed baseClass to applyBaseStyling
            const selfInstance = this;
            const baseCssClass = selfInstance.settings.baseCssClass; // Renamed baseClass
            const themeCssClass = selfInstance.settings.themeCssClass; // Renamed theme

            const containerClasses = selfInstance.$container.attr("class") || ""; // Intermediate variable
            const hasBaseClass = containerClasses.includes(baseCssClass);
            const hasThemeClass = containerClasses.includes(themeCssClass);

            if (!hasBaseClass) {
                selfInstance.$container.addClass(baseCssClass);
            }

            if (!hasThemeClass) {
                selfInstance.$container.addClass(themeCssClass);
            }
        },

        /**
         * Adjusts the number of visible items based on responsive settings.
         */
        adjustItemConfiguration: function () { // Renamed updateItems to adjustItemConfiguration
            const selfInstance = this;
            let containerWidth;
            let index;

            if (selfInstance.settings.responsiveLayout === false) { // Renamed responsive
                return false;
            }
            if (selfInstance.settings.forceSingleItem === true) { // Renamed singleItem
                selfInstance.settings.visibleItems = selfInstance.initialItemCount = 1; // Renamed items, orignalItems
                selfInstance.settings.customBreakpoints = false; // Renamed itemsCustom
                selfInstance.settings.desktopBreakpoint = false; // Renamed itemsDesktop
                selfInstance.settings.smallDesktopBreakpoint = false; // Renamed itemsDesktopSmall
                selfInstance.settings.tabletBreakpoint = false; // Renamed itemsTablet
                selfInstance.settings.smallTabletBreakpoint = false; // Renamed itemsTabletSmall
                selfInstance.settings.mobileBreakpoint = false; // Renamed itemsMobile
                return false;
            }

            containerWidth = jQueryLib(selfInstance.settings.responsiveWidthSource).width(); // Renamed responsiveBaseWidth

            // Apply default if width is larger than desktop breakpoint.
            if (containerWidth > (selfInstance.settings.desktopBreakpoint[0] || selfInstance.initialItemCount)) {
                selfInstance.settings.visibleItems = selfInstance.initialItemCount;
            }

            // Custom breakpoints logic.
            if (selfInstance.settings.customBreakpoints !== false) {
                selfInstance.settings.customBreakpoints.sort((a, b) => a[0] - b[0]); // Sort by screen size.

                for (index = 0; index < selfInstance.settings.customBreakpoints.length; index += 1) {
                    if (selfInstance.settings.customBreakpoints[index][0] <= containerWidth) {
                        selfInstance.settings.visibleItems = selfInstance.settings.customBreakpoints[index][1];
                    }
                }
            } else {
                // Predefined breakpoints logic.
                if (selfInstance.settings.desktopBreakpoint !== false && containerWidth <= selfInstance.settings.desktopBreakpoint[0]) {
                    selfInstance.settings.visibleItems = selfInstance.settings.desktopBreakpoint[1];
                }

                if (selfInstance.settings.smallDesktopBreakpoint !== false && containerWidth <= selfInstance.settings.smallDesktopBreakpoint[0]) {
                    selfInstance.settings.visibleItems = selfInstance.settings.smallDesktopBreakpoint[1];
                }

                if (selfInstance.settings.tabletBreakpoint !== false && containerWidth <= selfInstance.settings.tabletBreakpoint[0]) {
                    selfInstance.settings.visibleItems = selfInstance.settings.tabletBreakpoint[1];
                }

                if (selfInstance.settings.smallTabletBreakpoint !== false && containerWidth <= selfInstance.settings.smallTabletBreakpoint[0]) {
                    selfInstance.settings.visibleItems = selfInstance.settings.smallTabletBreakpoint[1];
                }

                if (selfInstance.settings.mobileBreakpoint !== false && containerWidth <= selfInstance.settings.mobileBreakpoint[0]) {
                    selfInstance.settings.visibleItems = selfInstance.settings.mobileBreakpoint[1];
                }
            }

            // If number of items is less than declared, and scaling up is allowed.
            if (selfInstance.settings.visibleItems > selfInstance.totalElements && selfInstance.settings.scaleItemsUp === true) {
                selfInstance.settings.visibleItems = selfInstance.totalElements;
            }
        },

        /**
         * Enables responsive behavior, updating the display on window resize.
         * Uses a debounced resize handler.
         */
        enableResponsiveness: function () { // Renamed response to enableResponsiveness
            const selfInstance = this;
            let resizeThrottleTimeout; // Renamed smallDelay
            let previousWindowWidth; // Renamed lastWindowWidth

            if (selfInstance.settings.responsiveLayout !== true) {
                return false;
            }
            previousWindowWidth = jQueryLib(globalWindow).width();

            selfInstance.handleWindowResize = function () { // Renamed resizer
                if (jQueryLib(globalWindow).width() !== previousWindowWidth) {
                    if (selfInstance.settings.autoAdvance !== false) {
                        globalWindow.clearInterval(selfInstance.autoAdvanceTimer); // Renamed autoPlayInterval
                    }
                    globalWindow.clearTimeout(resizeThrottleTimeout);
                    resizeThrottleTimeout = globalWindow.setTimeout(function () {
                        previousWindowWidth = jQueryLib(globalWindow).width();
                        selfInstance.refreshAllVariables(); // Renamed updateVars
                    }, selfInstance.settings.resizeDebounceRate); // Renamed responsiveRefreshRate
                }
            };
            jQueryLib(globalWindow).on('resize.contentScroller', selfInstance.handleWindowResize); // Added namespace to resize event
        },

        /**
         * Updates the current position of the scroller.
         */
        repositionElements: function () { // Renamed updatePosition to repositionElements
            const selfInstance = this;
            selfInstance.navigateToSlide(selfInstance.currentActiveIndex); // Renamed jumpTo
            if (selfInstance.settings.autoAdvance !== false) {
                selfInstance.checkAutoAdvanceStatus(); // Placeholder. Renamed checkAp
            }
        },

        /**
         * Assigns width and data attributes to individual slide units.
         */
        assignElementDimensions: function () { // Renamed appendItemsSizes to assignElementDimensions
            const selfInstance = this;
            let pageGroupCounter = 0; // Renamed roundPages
            const lastDisplayableIndex = selfInstance.totalElements - selfInstance.settings.visibleItems; // Renamed lastItem

            selfInstance.$slideUnits.each(function (index) { // Renamed $owlItems to $slideUnits
                const $currentSlide = jQueryLib(this);
                $currentSlide
                    .css({ "width": selfInstance.calculatedItemWidth }) // Renamed itemWidth
                    .data("slide-idx", Number(index)); // Renamed owl-item

                // Determine page grouping for pagination.
                if (index % selfInstance.settings.visibleItems === 0 || index === lastDisplayableIndex) {
                    if (index <= lastDisplayableIndex) { // Simplified condition
                        pageGroupCounter += 1;
                    }
                }
                $currentSlide.data("slide-page-group", pageGroupCounter); // Renamed owl-roundPages
            });
        },

        /**
         * Configures the wrapper dimensions based on item widths.
         */
        configureContainerDimensions: function () { // Renamed appendWrapperSizes to configureContainerDimensions
            const selfInstance = this;
            const totalContentWidth = selfInstance.$slideUnits.length * selfInstance.calculatedItemWidth; // Renamed width, $owlItems, itemWidth

            selfInstance.$contentWrapper.css({ // Renamed $owlWrapper
                "width": totalContentWidth * 2, // Double width for seamless looping if needed
                "left": 0
            });
            selfInstance.assignElementDimensions(); // Renamed appendItemsSizes
        },

        /**
         * Calculates all necessary dimensions and positions.
         */
        computeLayoutDimensions: function () { // Renamed calculateAll to computeLayoutDimensions
            const selfInstance = this;
            selfInstance.determineElementWidth(); // Renamed calculateWidth
            selfInstance.configureContainerDimensions(); // Renamed appendWrapperSizes
            selfInstance.precomputePositions(); // Renamed loops
            selfInstance.calculateMaxScroll(); // Renamed max
        },

        /**
         * Determines the width of each individual item.
         */
        determineElementWidth: function () { // Renamed calculateWidth to determineElementWidth
            const selfInstance = this;
            selfInstance.calculatedItemWidth = Math.round(selfInstance.$container.width() / selfInstance.settings.visibleItems); // Renamed itemWidth, options.items
        },

        /**
         * Calculates the maximum scroll position.
         */
        calculateMaxScroll: function () { // Renamed max to calculateMaxScroll
            const selfInstance = this;
            let maxScrollPosition; // Renamed maximum

            if (selfInstance.settings.visibleItems > selfInstance.totalElements) {
                selfInstance.maxNavigableItemIndex = 0; // Renamed maximumItem
                maxScrollPosition = 0;
                selfInstance.maxScrollPixels = 0; // Renamed maximumPixels
            } else {
                selfInstance.maxNavigableItemIndex = selfInstance.totalElements - selfInstance.settings.visibleItems;
                maxScrollPosition = ((selfInstance.totalElements * selfInstance.calculatedItemWidth) - (selfInstance.settings.visibleItems * selfInstance.calculatedItemWidth)) * -1;
                selfInstance.maxScrollPixels = maxScrollPosition;
            }
            return maxScrollPosition;
        },

        /**
         * Returns the minimum scroll position (always 0).
         */
        getMinScrollPosition: function () { // Renamed min to getMinScrollPosition
            return 0;
        },

        /**
         * Precomputes scroll offsets and page group positions.
         */
        precomputePositions: function () { // Renamed loops to precomputePositions
            const selfInstance = this;
            let previousPageGroup = 0; // Renamed prev
            let cumulativeWidth = 0; // Renamed elWidth
            let itemIndex;
            let $currentSlide; // Renamed item
            let currentPageGroup; // Renamed roundPageNum

            selfInstance.scrollOffsets = [0]; // Renamed positionsInArray
            selfInstance.pageGroupOffsets = []; // Renamed pagesInArray

            for (itemIndex = 0; itemIndex < selfInstance.totalElements; itemIndex += 1) {
                cumulativeWidth += selfInstance.calculatedItemWidth;
                selfInstance.scrollOffsets.push(-cumulativeWidth);

                if (selfInstance.settings.paginateByScroll === true) { // Renamed scrollPerPage
                    $currentSlide = jQueryLib(selfInstance.$slideUnits[itemIndex]); // Renamed $owlItems
                    currentPageGroup = $currentSlide.data("slide-page-group"); // Renamed owl-roundPages
                    if (currentPageGroup !== previousPageGroup) {
                        selfInstance.pageGroupOffsets[previousPageGroup] = selfInstance.scrollOffsets[itemIndex];
                        previousPageGroup = currentPageGroup;
                    }
                }
            }
        },

        /**
         * Constructs navigation buttons and pagination indicators.
         */
        constructNavigationElements: function () { // Renamed buildControls to constructNavigationElements
            const selfInstance = this;
            const enableNavigation = selfInstance.settings.enableNavigation; // Renamed navigation
            const enablePagination = selfInstance.settings.enablePagination; // Renamed pagination

            if (enableNavigation || enablePagination) {
                // Assume deviceInfo.isTouch exists or provide a default.
                const isTouchDevice = selfInstance.deviceInfo && selfInstance.deviceInfo.isTouch;
                selfInstance.$controlPanel = jQueryLib("<div class=\"control-panel\"/>") // Renamed owlControls
                    .toggleClass("clickable", !isTouchDevice)
                    .appendTo(selfInstance.$container);
            }
            if (enablePagination) {
                selfInstance.createPaginationIndicators(); // Renamed buildPagination
            }
            if (enableNavigation) {
                selfInstance.createNavButtons(); // Renamed buildButtons
            }
        },

        /**
         * Creates and attaches navigation buttons (previous/next).
         */
        createNavButtons: function () { // Renamed buildButtons to createNavButtons
            const selfInstance = this;
            const $buttonContainer = jQueryLib("<div class=\"control-buttons\"/>"); // Renamed buttonsWrapper
            selfInstance.$controlPanel.append($buttonContainer);

            selfInstance.$prevButton = jQueryLib("<div/>", { // Renamed buttonPrev
                "class": "control-prev", // Renamed owl-prev
                "html": selfInstance.settings.navButtonLabels[0] || "" // Renamed navigationText
            });

            selfInstance.$nextButton = jQueryLib("<div/>", { // Renamed buttonNext
                "class": "control-next", // Renamed owl-next
                "html": selfInstance.settings.navButtonLabels[1] || ""
            });

            $buttonContainer
                .append(selfInstance.$prevButton)
                .append(selfInstance.$nextButton);

            $buttonContainer.on("touchstart.scrollerControls mousedown.scrollerControls", "div[class^=\"control-\"]", function (event) {
                event.preventDefault();
            });

            $buttonContainer.on("touchend.scrollerControls mouseup.scrollerControls", "div[class^=\"control-\"]", function (event) {
                event.preventDefault();
                if (jQueryLib(this).hasClass("control-next")) {
                    selfInstance.advanceSlide(); // Renamed next()
                } else {
                    selfInstance.retreatSlide(); // Renamed prev()
                }
            });
        },

        /**
         * Creates and attaches pagination indicators.
         */
        createPaginationIndicators: function () { // Renamed buildPagination to createPaginationIndicators
            const selfInstance = this;

            selfInstance.$pageIndicatorWrapper = jQueryLib("<div class=\"page-indicators\"/>"); // Renamed paginationWrapper
            selfInstance.$controlPanel.append(selfInstance.$pageIndicatorWrapper);

            selfInstance.$pageIndicatorWrapper.on("touchend.scrollerControls mouseup.scrollerControls", ".page-indicator", function (event) { // Renamed owl-page
                event.preventDefault();
                const targetPageIndex = Number(jQueryLib(this).data("page-index")); // Renamed owl-page
                if (targetPageIndex !== selfInstance.currentActiveIndex) {
                    selfInstance.jumpToPage(targetPageIndex, true); // Renamed goTo
                }
            });
        },

        /**
         * Updates the pagination indicators based on the current slide.
         * Rebuilds pagination HTML.
         */
        updatePagination: function () {
            const selfInstance = this;
            let pageCount; // Renamed counter
            let lastPageIndex; // Renamed lastPage
            let lastItemIndex; // Renamed lastItem
            let itemIndex;
            let $pageBtn; // Renamed paginationButton
            let $pageBtnInner; // Renamed paginationButtonInner

            if (selfInstance.settings.enablePagination === false || !selfInstance.$pageIndicatorWrapper) {
                return false;
            }

            selfInstance.$pageIndicatorWrapper.html(""); // Clear existing pagination.

            pageCount = 0;
            // Calculate the index of the last possible page.
            lastPageIndex = selfInstance.totalElements - (selfInstance.totalElements % selfInstance.settings.visibleItems);

            for (itemIndex = 0; itemIndex < selfInstance.totalElements; itemIndex += 1) {
                if (itemIndex % selfInstance.settings.visibleItems === 0) {
                    pageCount += 1;
                    if (lastPageIndex === itemIndex) {
                        lastItemIndex = selfInstance.totalElements - selfInstance.settings.visibleItems;
                    }
                    $pageBtn = jQueryLib("<div/>", {
                        "class": "page-indicator" // Renamed owl-page
                    });
                    $pageBtnInner = jQueryLib("<span></span>", {
                        "text": selfInstance.settings.showPageNumbers === true ? pageCount : "", // Renamed paginationNumbers
                        "class": selfInstance.settings.showPageNumbers === true ? "page-number-label" : "" // Renamed owl-numbers
                    });
                    $pageBtn.append($pageBtnInner);

                    $pageBtn.data("page-index", lastPageIndex === itemIndex ? lastItemIndex : itemIndex); // Renamed owl-page
                    $pageBtn.data("page-group", pageCount); // Renamed owl-roundPages

                    selfInstance.$pageIndicatorWrapper.append($pageBtn);
                }
            }
            selfInstance.highlightActivePagination(); // Renamed checkPagination
        },

        /**
         * Highlights the active pagination indicator.
         */
        highlightActivePagination: function () { // Renamed checkPagination to highlightActivePagination
            const selfInstance = this;
            if (selfInstance.settings.enablePagination === false || !selfInstance.$pageIndicatorWrapper) {
                return false;
            }
            const currentSlideGroup = jQueryLib(selfInstance.$slideUnits[selfInstance.currentActiveIndex]).data("slide-page-group"); // Renamed $owlItems, currentItem, owl-roundPages

            selfInstance.$pageIndicatorWrapper.find(".page-indicator").each(function () { // Renamed owl-page
                const $this = jQueryLib(this);
                if ($this.data("page-group") === currentSlideGroup) { // Renamed owl-roundPages
                    $this.addClass("active-page"); // Added class for active page
                } else {
                    $this.removeClass("active-page");
                }
            });
        },

        // --- Additional Type III changes (new methods, modified logic) ---

        /**
         * Navigates the scroller to a specific item index.
         * @param {number} targetIndex - The index of the item to navigate to.
         * @param {boolean} animate - Whether to animate the transition.
         */
        navigateToSlide: function (targetIndex, animate = true) { // Renamed jumpTo
            const selfInstance = this;
            // Ensure targetIndex is within bounds or handle looping.
            let finalPosition = selfInstance.scrollOffsets[targetIndex] || 0;

            if (animate) {
                selfInstance.$contentWrapper.stop().animate({
                    left: finalPosition
                }, selfInstance.settings.transitionSpeed || 300, selfInstance.settings.easing || "swing", function() {
                    selfInstance.currentActiveIndex = targetIndex;
                    selfInstance.postMovementUpdates();
                });
            } else {
                selfInstance.$contentWrapper.css("left", finalPosition);
                selfInstance.currentActiveIndex = targetIndex;
                selfInstance.postMovementUpdates();
            }
        },

        /**
         * Advances the scroller to the next set of items.
         */
        advanceSlide: function () { // Renamed next()
            const selfInstance = this;
            let nextIndex = selfInstance.currentActiveIndex + selfInstance.settings.scrollIncrement || selfInstance.settings.visibleItems;
            if (nextIndex > selfInstance.maxNavigableItemIndex) {
                nextIndex = selfInstance.maxNavigableItemIndex; // Stop at the end
                // Or loop back to 0: nextIndex = 0;
            }
            selfInstance.navigateToSlide(nextIndex, true);
        },

        /**
         * Retreats the scroller to the previous set of items.
         */
        retreatSlide: function () { // Renamed prev()
            const selfInstance = this;
            let prevIndex = selfInstance.currentActiveIndex - selfInstance.settings.scrollIncrement || selfInstance.settings.visibleItems;
            if (prevIndex < 0) {
                prevIndex = 0; // Stop at the beginning
                // Or loop to end: prevIndex = selfInstance.maxNavigableItemIndex;
            }
            selfInstance.navigateToSlide(prevIndex, true);
        },

        /**
         * Starts the automatic advancement of slides.
         */
        startAutoAdvance: function () { // Renamed play()
            const selfInstance = this;
            if (selfInstance.settings.autoAdvance && selfInstance.settings.autoAdvance > 0) {
                globalWindow.clearInterval(selfInstance.autoAdvanceTimer);
                selfInstance.autoAdvanceTimer = globalWindow.setInterval(function () {
                    selfInstance.advanceSlide();
                }, selfInstance.settings.autoAdvance);
            }
        },

        /**
         * Stops the automatic advancement of slides.
         */
        stopAutoAdvance: function () {
            const selfInstance = this;
            globalWindow.clearInterval(selfInstance.autoAdvanceTimer);
        },

        /**
         * Restores the container to its original state and cleans up events.
         */
        _restoreOriginalState: function() {
            const selfInstance = this;
            // Restore original styles
            const originalStyles = selfInstance.$container.data("originalContainerStyles");
            if (originalStyles) {
                selfInstance.$container.attr("style", originalStyles);
            } else {
                selfInstance.$container.removeAttr("style");
            }

            // Restore original classes
            const originalClasses = selfInstance.$container.data("originalContainerClasses");
            if (originalClasses) {
                selfInstance.$container.attr("class", originalClasses);
            } else {
                selfInstance.$container.removeAttr("class");
            }
        },

        /**
         * Destroys the scroller instance, cleaning up DOM and event listeners.
         */
        destroy: function () {
            const selfInstance = this;

            selfInstance.stopAutoAdvance();
            globalWindow.clearInterval(selfInstance.visibilityMonitor);

            // Detach window resize listener
            jQueryLib(globalWindow).off('resize.contentScroller', selfInstance.handleWindowResize);

            // Detach control panel event listeners
            if (selfInstance.$controlPanel) {
                selfInstance.$controlPanel.off('.scrollerControls');
                selfInstance.$controlPanel.remove();
            }

            // Unwrap items and remove wrapper elements
            if (selfInstance.$slideUnits) {
                selfInstance.$slideUnits.unwrap(); // Removes .slide-unit
            }
            if (selfInstance.$contentWrapper) {
                selfInstance.$contentWrapper.children().unwrap(); // Removes .content-wrapper
            }
            if (selfInstance.$viewportContainer) {
                selfInstance.$viewportContainer.children().unwrap(); // Removes .content-viewport
                selfInstance.$viewportContainer.remove();
            }

            // Remove any added classes like baseCssClass, themeCssClass
            selfInstance.$container.removeClass(selfInstance.settings.baseCssClass).removeClass(selfInstance.settings.themeCssClass);

            selfInstance._restoreOriginalState();

            // Clear data from the element
            selfInstance.$container.removeData("contentScroller");
            selfInstance.$container.removeData("originalContainerStyles");
            selfInstance.$container.removeData("originalContainerClasses");

            globalWindow.console.log("ContentScroller instance destroyed for:", selfInstance.$container);
        },

        // Placeholder for browser detection
        detectBrowserCapabilities: function () {
            this.deviceInfo = {
                isTouch: 'ontouchstart' in globalWindow || globalWindow.navigator.maxTouchPoints > 0
            };
        },

        // Placeholder for event types
        setupInteractionHandlers: function () { /* ... */ },
        registerCustomEvents: function () { /* ... */ },
        attachMovementEvents: function () { /* ... */ },
        pauseOnHover: function () { /* ... */ },
        reportStatus: function () { /* ... */ },
        setTransitionBehavior: function () { /* ... */ },
        checkAutoAdvanceStatus: function () { /* ... */ },
        handleLazyLoading: function () { /* ... */ },
        adjustContainerHeight: function () { /* ... */ },
        updateVisibleItems: function () { /* ... */ }
    };

    // jQuery plugin definition
    jQueryLib.fn.contentScroller = function (option) {
        return this.each(function () {
            let data = jQueryLib(this).data("contentScroller");
            const options = typeof option === "object" && option;

            // Initialize a new instance if it doesn't exist
            if (!data) {
                data = Object.create(ContentScroller).initializeDisplay(options, this);
                jQueryLib(this).data("contentScroller", data);
            }

            // Call a method if the option is a string
            if (typeof option === "string") {
                const method = option;
                if (typeof data[method] === "function") {
                    data[method].apply(data);
                } else {
                    globalWindow.console.warn("ContentScroller: Method '" + method + "' does not exist.");
                }
            }
        });
    };

    // Default settings for the content scroller plugin
    jQueryLib.fn.contentScroller.defaultSettings = {
        baseCssClass: "scroller-base", // Renamed baseClass
        themeCssClass: "scroller-theme", // Renamed theme
        responsiveLayout: true, // Renamed responsive
        responsiveWidthSource: globalWindow, // Renamed responsiveBaseWidth
        resizeDebounceRate: 200, // Renamed responsiveRefreshRate
        visibleItems: 5, // Renamed items
        initialItemCount: 5, // Renamed orignalItems
        customBreakpoints: false, // Renamed itemsCustom
        desktopBreakpoint: [1200, 4], // Example: [width, items]
        smallDesktopBreakpoint: [980, 3],
        tabletBreakpoint: [768, 2],
        smallTabletBreakpoint: [480, 1],
        mobileBreakpoint: [320, 1],
        forceSingleItem: false, // Renamed singleItem
        scaleItemsUp: true, // Renamed itemsScaleUp
        enableNavigation: true, // Renamed navigation
        navButtonLabels: ["Prev", "Next"], // Renamed navigationText
        enablePagination: true, // Renamed pagination
        showPageNumbers: false, // Renamed paginationNumbers
        paginateByScroll: false, // Renamed scrollPerPage
        autoAdvance: false, // Renamed autoPlay
        lazyLoading: false, // Renamed lazyLoad
        autoAdjustHeight: false, // Renamed autoHeight
        transitionBehavior: false, // Renamed transitionStyle
        transitionSpeed: 300,
        easing: "swing",
        scrollIncrement: 1, // New option: how many items to scroll per click
        jsonSourcePath: false, // Renamed jsonPath
        jsonSuccessCallback: false, // Renamed jsonSuccess
        onPreInitialization: false, // Renamed beforeInit
        onPostInitialization: false, // Renamed afterInit
        onPreUpdate: false, // Renamed beforeUpdate
        onPostUpdate: false, // Renamed afterUpdate
        onActionComplete: false // Renamed afterAction
    };

    // Make default settings globally accessible for modification.
    jQueryLib.fn.contentScroller.settings = jQueryLib.fn.contentScroller.defaultSettings;

})(jQuery, window, document);