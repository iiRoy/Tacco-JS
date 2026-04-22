;((jq) => {

    // FolioFlip - A modern jQuery-based interactive page display component.
    // Copyright (c) 2023 FolioGen Technologies.
    // Licensed under the MIT license (https://opensource.org/licenses/MIT).
    // Version: 2.0.0 (Type III Clone - Extensive Refactor)

    // The core plugin method, accessible via jq.fn.folioflip.
    // It orchestrates initialization, API method calls, and direct page navigation.
    jq.fn.folioflip = function (actionCommand, paramA, paramB) {

        let activeFolioInstance;
        const collectedResults = []; // Stores return values from API calls.
        let requestedMethodName;
        let invocationArgs;

        // Early exit if no elements are matched by the selector.
        if (!this.length) {
            console.warn("FolioFlip: No DOM elements found for the current selector. Operation aborted.");
            return this;
        }

        // --- Handle API method calls by string (e.g., $(...).folioflip('advancePage')) ---
        if (typeof actionCommand === 'string') {
            this.each(function () {
                activeFolioInstance = jq(this).data('folioEngineInstance'); // Retrieve existing engine instance.

                // If no engine is initialized, log an error and skip.
                if (!activeFolioInstance) {
                    console.error(`FolioFlip: Engine not initialized on this element. Cannot execute method "${actionCommand}".`);
                    return; // Continue to the next element in the collection.
                }

                requestedMethodName = actionCommand;
                invocationArgs = [];

                // Accumulate optional parameters.
                if (paramA !== undefined) {
                    invocationArgs.push(paramA);
                }
                if (paramB !== undefined) {
                    invocationArgs.push(paramB);
                }

                // Execute the requested method if it exists on the instance.
                if (typeof activeFolioInstance[requestedMethodName] === 'function') {
                    const methodOutput = activeFolioInstance[requestedMethodName].apply(activeFolioInstance, invocationArgs);
                    // Collect non-null/non-undefined results.
                    if (methodOutput !== undefined && methodOutput !== null) {
                        collectedResults.push(methodOutput);
                    }
                } else {
                    console.error(`FolioFlip: Method "${requestedMethodName}" is not a recognized function on the FolioFlip engine.`);
                }
            });

            // Return results based on the number of elements processed.
            if (collectedResults.length === 1) {
                return collectedResults[0];
            } else if (collectedResults.length > 1) {
                return collectedResults;
            } else {
                return this; // Maintain jQuery chainability if no specific results.
            }
        }
        // --- Handle direct page navigation by number (e.g., $(...).folioflip(3)) ---
        else if (typeof actionCommand === 'number') {
            this.each(function () {
                activeFolioInstance = jq(this).data('folioEngineInstance');

                if (activeFolioInstance) {
                    const targetPageIdentifier = actionCommand;
                    // Validate page index before attempting navigation.
                    if (targetPageIdentifier >= 0 && targetPageIdentifier < activeFolioInstance.getTotalPages()) {
                        activeFolioInstance.jumpToPage(targetPageIdentifier); // Renamed from navigateToPage
                    } else {
                        console.warn(`FolioFlip: Invalid page index ${targetPageIdentifier}. Page navigation request ignored.`);
                    }
                } else {
                    console.error('FolioFlip: Engine not initialized for this element. Page navigation failed.');
                }
            });
            return this; // Maintain jQuery chainability.
        }
        // --- Handle engine initialization with options (e.g., $(...).folioflip({ ...settings... })) ---
        else if (typeof actionCommand === 'object' || actionCommand === undefined) { // Covers both `{}` and `undefined` for new instance.
            return this.each(function () {
                const currentDomElement = jq(this);
                // Merge default settings with provided options, deep cloning to prevent reference issues.
                const finalConfiguration = jq.extend(true, {}, jq.fn.folioflip.defaultSettings, actionCommand);

                activeFolioInstance = currentDomElement.data('folioEngineInstance');

                // If an existing instance is present, clean it up before creating a new one.
                if (activeFolioInstance) {
                    console.info("FolioFlip: Detected an existing engine instance. Deactivating it before fresh initialization.");
                    activeFolioInstance.deactivateEngine(); // Renamed from decommissionEngine
                }

                // Instantiate and initialize the new Folio engine.
                const newFolioEngine = new FolioEngineCore(currentDomElement, finalConfiguration);
                newFolioEngine.startEngine(); // Renamed from initializeEngine

                currentDomElement.data('folioEngineInstance', newFolioEngine); // Store for future API access.

                return this; // Preserve jQuery chainability.
            });
        } else {
            console.error(`FolioFlip: Unrecognized command type for plugin invocation. Type received: ${typeof actionCommand}.`);
            return this;
        }
    };

    // Default configuration settings for FolioFlip instances.
    jq.fn.folioflip.defaultSettings = {
        viewportWidth: null, // Dynamic or fixed width.
        viewportHeight: null, // Dynamic or fixed height.
        initialPageIndex: 0,
        readingDirection: 'LTR', // 'LTR' or 'RTL'.
        isClosedBook: false,
        showCovers: true,
        autoAdjustCenter: true,
        displayPageNumbers: true,
        enableShadows: true,
        animationSpeed: 800, // Milliseconds for page turns.
        bookTitle: '', // Sets document title.
        closedFrontCoverTitle: '',
        closedFrontCoverChapter: '',
        closedBackCoverTitle: '',
        closedBackCoverChapter: '',
        shadowFrontFoldWidth: 100, // Renamed from shadowTopFwdWidth
        shadowBackFoldWidth: 100, // Renamed from shadowTopBackWidth
        enableOverlays: true, // For navigation overlays.
        onEngineCreated: null,
        onTransitionStart: null,
        onTransitionEnd: null,
        onPageAdded: null,
        onPageRemoved: null,
        debugMode: false // New addition: enable detailed console logging.
    };

    /**
     * @class FolioEngineCore
     * @description Encapsulates the complete logic for a single FolioFlip instance,
     *              managing page layout, transitions, and state.
     * @param {jQuery} containerElement - The primary DOM element hosting the folio.
     * @param {object} engineSettings - The merged configuration options for this instance.
     */
    function FolioEngineCore(containerElement, engineSettings) {
        // Private internal references.
        let mainHostElement = containerElement;
        let currentOptions = engineSettings;

        // Engine's operational state flags.
        const engineCurrentState = {
            isInitialized: false,
            isTransitioning: false,
            isAutoPlaying: false,
            hoveringRightRegion: false,
            hoveringLeftRegion: false,
            isEngineDisabled: false
        };

        // Predefined HTML fragments for internal use.
        const htmlFragments = {
            blankFiller: '<div class="f-page-filler" data-role="blank-filler" title=""></div>', // Transparent spacer.
            emptyContentPage: '<div class="f-page-blank-content" data-role="empty-content" title=""></div>', // Empty page with no user content.
            frontPageShadow: '<div class="f-shadow-front-page"></div>',
            backPageShadow: '<div class="f-shadow-back-page"></div>'
        };

        // Constants for reading direction.
        const pageFlowDirections = {
            leftToRight: 'LTR',
            rightToLeft: 'RTL'
        };

        // Dynamically computed CSS properties and animation parameters.
        let computedStyles = {};
        let computedAnimations = {};

        // Dimension and calculation caches.
        let calculatedShadowWidth;
        let calculatedFullWidth;
        let calculatedCurlWidth;

        let internalPageRegister = []; // Array of PageModel instances.

        // Navigation and page numbering.
        let currentHashPath = '';
        const defaultHashPrefix = '/bookpage/';
        let initialChildElementCount; // Count of original user-provided content elements.
        let displayedPageNumberCounter; // Incremental/decremental counter for page display.

        // Cached jQuery selectors for frequently accessed page elements.
        let prevPrevPage, prevPage, currentPageLeft, currentPageRight, nextPage, nextNextPage;
        let prevPrevPageWrap, prevPageWrap, currentPageLeftWrap, currentPageRightWrap, nextPageWrap, nextNextPageWrap;
        let allPageWrappers;
        let frontShadowDom, backShadowDom;

        // References to control elements (simplified/generalized).
        let rightDragHandle, leftDragHandle;
        let globalControlsContainer, overlayElements, nextOverlayArea, previousOverlayArea,
            tabNavigationContainer, nextTabButton, previousTabButton,
            arrowNavigationContainer, nextArrowButton, previousArrowButton,
            customNextControl, customPrevControl,
            combinedNextNavGroup, combinedPrevNavGroup,
            bookMenuDropdown, pausePlaybackButton, startPlaybackButton;

        let pageSelectorPanel, pageSelectorListItems, pageNumberDisplayComponents, pageTitleDisplayComponents,
            singlePageSelectorItem, pageSelectorPanelHeightValue;

        let chapterSelectorPanel, chapterSelectorListItems, chapterListItemComponent, chapterSelectorPanelHeightValue;

        // Flags for dynamic dimension handling.
        let isWidthPercentage, initialWidthString, isHeightPercentage, initialHeightString;

        // Core page dimensions.
        let halfPageWidth, negativeHalfPageWidth, quarterPageSectionWidth;
        let totalPageHeight, halfAnimationDuration;

        // Custom event names.
        const customEvents = {
            onCreated: 'folioflip:created',
            onStart: 'folioflip:transitionStart',
            onChange: 'folioflip:pageChange',
            onAdd: 'folioflip:pageAdded',
            onRemove: 'folioflip:pageRemoved'
        };

        // Data payload for event callbacks.
        let eventPayload;

        // --- Utility functions (new fragment: _helpers object for internal use) ---
        const _helpers = {
            // Conditional logging for debugging.
            log: (message, level = 'info') => {
                if (currentOptions.debugMode) {
                    console[level](`FolioFlip Debug [${new Date().toLocaleTimeString()}]: ${message}`);
                }
            },
            // Calculates pixel dimensions from percentage strings or fixed values.
            resolveDimension: (dimensionValue, parentReferenceDimension) => {
                if (typeof dimensionValue === 'string' && dimensionValue.endsWith('%')) {
                    const percentage = parseFloat(dimensionValue) / 100;
                    return percentage * parentReferenceDimension;
                }
                return parseFloat(dimensionValue);
            },
            // Safely removes specific data key from a jQuery element.
            removeJqData: (element, key) => {
                if (element && element.data(key)) {
                    element.removeData(key);
                }
            },
            // Sets a specific CSS filter property, handling vendor prefixes if needed.
            setCssFilter: (element, filterValue) => {
                element.css({
                    'filter': filterValue,
                    '-webkit-filter': filterValue, // For older browsers
                    '-moz-filter': filterValue
                });
            }
        };

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // INTERNAL PAGE DATA MODEL (Type III: class for better encapsulation)
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * @class PageModel
         * @description Represents a single logical page within the folio, managing its content and basic structure.
         * @param {jQuery} contentJqNode - The jQuery object containing the raw page content.
         * @param {number} pageIdx - The 0-based index of this page in the internal register.
         * @param {object} configObj - The current configuration settings.
         */
        class PageModel {
            constructor(contentJqNode, pageIdx, configObj) {
                this.index = pageIdx;
                this.rawContentNode = contentJqNode[0]; // Store the native DOM element.
                this.associatedChapter = contentJqNode.attr('rel') || '';
                this.displayTitle = contentJqNode.attr('title') || '';
                this.folioPageNode = null; // Will store the jQuery object of the `f-page` wrapper.

                this._applyWrappers(contentJqNode, pageIdx, configObj);
                this._insertPageNumber(contentJqNode, pageIdx, configObj);
            }

            _applyWrappers(contentElement, idx, settings) {
                let primaryWrapperClass = 'f-page-wrap'; // Base wrapper class.

                // Determine specific wrapper classes based on page type and configuration.
                if (contentElement.hasClass('f-page-blank-content')) {
                    // No additional classes for generic empty content pages.
                } else if (settings.isClosedBook && settings.showCovers && (idx === 1 || idx === settings.pageTotal - 2)) {
                    primaryWrapperClass += ' f-page-cover-wrapper'; // Special class for book covers.
                } else if (idx % 2 !== 0) {
                    primaryWrapperClass += ' f-page-wrap-right'; // Right-hand page in a spread.
                } else {
                    primaryWrapperClass += ' f-page-wrap-left'; // Left-hand page in a spread.
                }

                // Wrap the content within the folio's page structure.
                contentElement.wrap(`<div class="f-page-container"><div class="${primaryWrapperClass}"></div></div>`);
                this.folioPageNode = contentElement.parents('.f-page-container').addClass(`f-page-idx-${idx}`);
            }

            _insertPageNumber(contentElement, idx, settings) {
                // Only add numbers if enabled, not an empty page, and not a cover in closed book mode.
                const shouldDisplayNumber = settings.displayPageNumbers &&
                                            !contentElement.hasClass('f-page-blank-content') &&
                                            (!settings.isClosedBook || !settings.showCovers || (idx !== 1 && idx !== settings.pageTotal - 2));

                if (shouldDisplayNumber) {
                    // Adjust the displayed page number based on reading direction.
                    if (settings.readingDirection === pageFlowDirections.leftToRight) {
                        displayedPageNumberCounter++;
                    }
                    contentElement.parent().append(`<div class="f-page-num-counter">${displayedPageNumberCounter}</div>`);
                    if (settings.readingDirection === pageFlowDirections.rightToLeft) {
                        displayedPageNumberCounter--;
                    }
                }
            }
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // CORE ENGINE LIFECYCLE FUNCTIONS
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Initializes the FolioFlip engine: sets up DOM, applies styles, and registers event handlers.
         */
        const startEngine = () => {
            _helpers.log('Initiating FolioFlip engine setup...');

            // Remove compatibility wrappers from older versions (if any).
            mainHostElement.find('.f-legacy-loader').children().unwrap();

            // Add base class to the main container for styling.
            mainHostElement.addClass('folioflip-main-viewport');

            // Store this engine instance on the host element's data for API access.
            _helpers.removeJqData(mainHostElement, 'folioEngineInstance'); // Clear any stale data.
            mainHostElement.data('folioEngineInstance', this);

            initialChildElementCount = mainHostElement.children().length;
            currentOptions.initialPageIndex = 0; // Reset index on fresh start.

            _preparePageStructure();     // Build and organize the page elements.
            _updateEngineConfiguration();   // Apply and re-calculate all settings.
            _refreshVisualLayout();    // Update page visibility and CSS.

            _updateControlVisibility(); // Placeholder for UI control logic.
            _updateNavigationMenu();    // Placeholder for menu/selector updates.

            engineCurrentState.isInitialized = true;
            engineCurrentState.isEngineDisabled = false;

            // Prepare the event payload for callbacks.
            eventPayload = {
                currentSettings: jq.extend(true, {}, currentOptions), // Deep clone settings for event.
                activePageIndex: currentOptions.initialPageIndex,
                visiblePages: [internalPageRegister[currentOptions.initialPageIndex].rawContentNode, internalPageRegister[currentOptions.initialPageIndex + 1].rawContentNode]
            };

            // Trigger the custom 'created' event.
            if (currentOptions.onEngineCreated) {
                mainHostElement.off(`${customEvents.onCreated}.folioflip`).on(`${customEvents.onCreated}.folioflip`, currentOptions.onEngineCreated);
            }
            mainHostElement.trigger(customEvents.onCreated, eventPayload);

            _helpers.log('FolioFlip engine successfully initialized.');
        };

        /**
         * Enables interaction with the engine.
         */
        const activateEngine = () => {
            engineCurrentState.isEngineDisabled = false;
            _helpers.log('FolioFlip engine activated.');
        };

        /**
         * Disables interaction with the engine.
         */
        const deactivateEngine = () => {
            engineCurrentState.isEngineDisabled = true;
            _helpers.log('FolioFlip engine deactivated.');
        };

        /**
         * Decommissions the FolioFlip engine: reverts DOM changes and removes all associated data.
         */
        const deactivateEngine = () => {
            _helpers.log('Deactivating FolioFlip engine and cleaning up...');

            _cleanupControlElements(); // Remove any dynamically created controls.
            _revertPageStructure();    // Undo page wrapping and element additions.

            mainHostElement.removeClass('folioflip-main-viewport');
            _helpers.removeJqData(mainHostElement, 'folioEngineInstance'); // Remove stored instance data.

            engineCurrentState.isInitialized = false;
            _helpers.log('FolioFlip engine decommissioned.');
        };

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // PAGE STRUCTURE AND LAYOUT FUNCTIONS
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Prepares the initial page structure, adding blank/empty pages as required for book layout.
         */
        const _preparePageStructure = () => {
            internalPageRegister = []; // Ensure a clean slate.

            // Adjust child count to always be even for a two-page spread layout.
            if ((mainHostElement.children().length % 2) !== 0) {
                // Insert a blank filler page.
                if (currentOptions.isClosedBook && currentOptions.showCovers) {
                    mainHostElement.children().last().before(htmlFragments.blankFiller);
                } else {
                    mainHostElement.children().last().after(htmlFragments.blankFiller);
                }
            }

            // For closed books, add specific front/back cover pages.
            if (currentOptions.isClosedBook) {
                jq(htmlFragments.emptyContentPage)
                    .attr({ 'title': currentOptions.closedFrontCoverTitle || '', 'rel': currentOptions.closedFrontCoverChapter || '' })
                    .prependTo(mainHostElement);

                // Update attributes of the actual last content page to be the back cover.
                const lastContentChild = mainHostElement.children().last();
                if (!lastContentChild.hasClass('f-page-blank-content')) { // Only if it's not already an empty filler.
                    lastContentChild.attr({ 'title': currentOptions.closedBackCoverTitle || '', 'rel': currentOptions.closedBackCoverChapter || '' });
                }
                jq(htmlFragments.emptyContentPage).appendTo(mainHostElement); // Add an empty page at the very end.
            }

            currentOptions.pageTotal = mainHostElement.children().length; // Update the total page count.

            // Reset the page number display counter.
            displayedPageNumberCounter = 0;

            // Handle Right-to-Left (RTL) reading direction by reversing DOM order.
            if (currentOptions.readingDirection === pageFlowDirections.rightToLeft) {
                // Adjust initial page number counter for RTL.
                displayedPageNumberCounter = currentOptions.pageTotal;
                if (currentOptions.isClosedBook) {
                    displayedPageNumberCounter -= 2; // Account for empty front/back pages.
                }
                if (currentOptions.showCovers) {
                    displayedPageNumberCounter -= 2; // Account for actual cover pages.
                }
                // Reverse the order of child elements in the DOM.
                jq(mainHostElement.children().get().reverse()).each(function () {
                    jq(this).appendTo(mainHostElement);
                });
            }

            // Set the initial current index if the engine hasn't been initialized before.
            if (!engineCurrentState.isInitialized) {
                if (currentOptions.readingDirection === pageFlowDirections.leftToRight) {
                    currentOptions.initialPageIndex = 0;
                } else if (currentOptions.readingDirection === pageFlowDirections.rightToLeft) {
                    currentOptions.initialPageIndex = currentOptions.pageTotal - 2; // Start on the last visible spread.
                }

                // Override with a user-specified starting page, ensuring it's an even index.
                if (!isNaN(currentOptions.initialPageIndex) && currentOptions.initialPageIndex >= 0 && currentOptions.initialPageIndex < currentOptions.pageTotal) {
                    if ((currentOptions.initialPageIndex % 2) !== 0) {
                        currentOptions.initialPageIndex--; // Adjust to the preceding even page for a left-page spread.
                    }
                    currentOptions.initialPageIndex = currentOptions.initialPageIndex;
                }
            }

            // Create PageModel objects for each child element and register them.
            mainHostElement.children().each(function (idx) {
                const newPageInstance = new PageModel(jq(this), idx, currentOptions);
                internalPageRegister.push(newPageInstance);
            });
        };

        /**
         * Coordinates updates to page class assignments, CSS, and interactive controls.
         */
        const _refreshVisualLayout = () => {
            _assignPageClasses();
            _applyDynamicStyles();
            _updateManualControls(); // Placeholder for updating manual page interaction areas.
        };

        /**
         * Assigns specific CSS classes to pages based on their positional role in the current spread.
         */
        const _assignPageClasses = () => {
            // Remove all dynamic position classes and hide all pages initially.
            mainHostElement.find('.f-page-container').removeClass('f-prev-prev f-prev f-current-left f-current-right f-next f-next-next').hide();

            const currentIdx = currentOptions.initialPageIndex;
            const totalPages = currentOptions.pageTotal;

            // Assign classes to visible and adjacent pages.
            // f-prev-prev: Page index - 2
            if (currentIdx - 2 >= 0) {
                mainHostElement.find(`.f-page-idx-${currentIdx - 2}`).addClass('f-prev-prev').show();
            }
            // f-prev: Page index - 1
            if (currentIdx - 1 >= 0) {
                mainHostElement.find(`.f-page-idx-${currentIdx - 1}`).addClass('f-prev').show();
            }
            // f-current-left: Page index (the left page of the current spread)
            mainHostElement.find(`.f-page-idx-${currentIdx}`).addClass('f-current-left').show();
            // f-current-right: Page index + 1 (the right page of the current spread)
            mainHostElement.find(`.f-page-idx-${currentIdx + 1}`).addClass('f-current-right').show();
            // f-next: Page index + 2
            if (currentIdx + 2 < totalPages) {
                mainHostElement.find(`.f-page-idx-${currentIdx + 2}`).addClass('f-next').show();
            }
            // f-next-next: Page index + 3
            if (currentIdx + 3 < totalPages) {
                mainHostElement.find(`.f-page-idx-${currentIdx + 3}`).addClass('f-next-next').show();
            }

            // Cache references to the newly classed elements for performance.
            prevPrevPage = mainHostElement.find('.f-prev-prev');
            prevPage = mainHostElement.find('.f-prev');
            currentPageLeft = mainHostElement.find('.f-current-left');
            currentPageRight = mainHostElement.find('.f-current-right');
            nextPage = mainHostElement.find('.f-next');
            nextNextPage = mainHostElement.find('.f-next-next');

            prevPrevPageWrap = mainHostElement.find('.f-prev-prev .f-page-wrap');
            prevPageWrap = mainHostElement.find('.f-prev .f-page-wrap');
            currentPageLeftWrap = mainHostElement.find('.f-current-left .f-page-wrap');
            currentPageRightWrap = mainHostElement.find('.f-current-right .f-page-wrap');
            nextPageWrap = mainHostElement.find('.f-next .f-page-wrap');
            nextNextPageWrap = mainHostElement.find('.f-next-next .f-page-wrap');
            allPageWrappers = mainHostElement.find('.f-page-wrap');

            // Insert shadows if enabled in configuration.
            if (currentOptions.enableShadows) {
                mainHostElement.find('.f-shadow-front-page, .f-shadow-back-page').remove(); // Remove old shadows first.
                frontShadowDom = jq(htmlFragments.frontPageShadow).css(computedStyles.frontShadow).appendTo(nextPage);
                backShadowDom = jq(htmlFragments.backPageShadow).appendTo(prevPage).css(computedStyles.backShadow);
            }
        };

        /**
         * Applies dynamic CSS styles to page elements based on the current configuration and layout.
         */
        const _applyDynamicStyles = () => {
            // Clear any previously applied inline styles or IE filters.
            mainHostElement.find('.f-shadow-front-page, .f-shadow-back-page, .f-prev, .f-next').css({ 'filter': '', 'zoom': '' });
            mainHostElement.find('.f-page-container').removeAttr('style');
            allPageWrappers.removeAttr('style');

            // Apply base wrapper styles.
            allPageWrappers.css(computedStyles.pageWrap);
            prevPageWrap.css(computedStyles.prevPageWrap);

            // Apply specific styles for each page position.
            currentPageLeft.css(computedStyles.currentPageLeft);
            currentPageRight.css(computedStyles.currentPageRight);
            prevPrevPage.css(computedStyles.prevPrevPage);
            prevPage.css(computedStyles.prevPage);
            nextPage.stop(true, true).css(computedStyles.nextPage); // Stop any ongoing animation on next page.
            nextNextPage.css(computedStyles.nextNextPage);

            // Special handling for closed book and auto-centering scenarios.
            if (currentOptions.isClosedBook && currentOptions.autoAdjustCenter) {
                if (currentOptions.initialPageIndex === 0) { // First page spread (front cover).
                    prevPrevPage.css({ 'left': 0 });
                    currentPageLeft.css({ 'left': negativeHalfPageWidth });
                    currentPageRight.css({ 'left': 0 });
                    nextPage.css({ 'left': halfPageWidth });
                    nextNextPage.css({ 'left': 0 });
                } else if (currentOptions.initialPageIndex >= currentOptions.pageTotal - 2) { // Last page spread (back cover).
                    currentPageRight.hide(); // Hide the right page to properly display the back cover.
                }
            }

            // Adjust the main container's width based on closed book state and auto-centering.
            if (currentOptions.isClosedBook && currentOptions.autoAdjustCenter && (currentOptions.initialPageIndex === 0 || currentOptions.initialPageIndex >= currentOptions.pageTotal - 2)) {
                if (currentOptions.enableOverlays) {
                    // overlayElements.width('100%'); // If overlays exist, adjust their width.
                }
                mainHostElement.width(halfPageWidth);
            } else {
                if (currentOptions.enableOverlays) {
                    // overlayElements.width('50%');
                }
                mainHostElement.width(currentOptions.viewportWidth);
            }

            // Re-apply IE filter clearing after all styles are set.
            mainHostElement.find('.f-page-container').css({ 'filter': '', 'zoom': '' });
        };

        /**
         * Reverts all DOM modifications made by the FolioFlip engine.
         */
        const _revertPageStructure = () => {
            // Unwrap all content from FolioFlip specific wrappers.
            mainHostElement.find(".f-page-wrap").children().unwrap(); // Content -> f-page-wrap -> f-page-container
            mainHostElement.find(".f-page-wrap").unwrap(); // f-page-wrap -> f-page-container

            // Remove all dynamically generated elements.
            mainHostElement.find(".f-page-num-counter, .f-page-filler, .f-page-blank-content, .f-shadow-front-page, .f-shadow-back-page").remove();

            // Revert page order to original if it was reversed for RTL reading.
            if (currentOptions.readingDirection === pageFlowDirections.rightToLeft) {
                jq(mainHostElement.children().get().reverse()).each(function () {
                    jq(this).appendTo(mainHostElement);
                });
            }
        };

        /**
         * Placeholder for cleaning up any dynamically created control elements (buttons, menus, etc.).
         */
        const _cleanupControlElements = () => {
            // Example: Remove any dynamically added controls.
            // if (globalControlsContainer) globalControlsContainer.remove();
            // if (bookMenuDropdown) bookMenuDropdown.remove();
            _helpers.log('Control elements cleanup executed (placeholder).');
        };

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // CONFIGURATION MANAGEMENT AND DYNAMIC STYLING
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /**
         * Updates the current engine configuration with new options and recalculates all dependent values.
         * @param {object} [newOptions] - Optional object containing new settings to merge.
         */
        const _updateEngineConfiguration = (newOptions = {}) => {
            let configChanged = false;

            // If new options are provided, trigger a partial re-initialization.
            if (Object.keys(newOptions).length > 0) {
                _helpers.log('Updating FolioFlip configuration with new settings...');
                _revertPageStructure();
                _cleanupControlElements(); // Ensure controls are also cleaned up if config changes.

                currentOptions = jq.extend(true, {}, currentOptions, newOptions); // Deep merge new options.
                configChanged = true;

                _preparePageStructure(); // Re-prepare pages based on the new configuration.
            }

            // Calculate and set viewport dimensions.
            currentOptions.viewportWidth = _helpers.resolveDimension(currentOptions.viewportWidth || mainHostElement.width(), mainHostElement.parent().width());
            currentOptions.viewportHeight = _helpers.resolveDimension(currentOptions.viewportHeight || mainHostElement.height(), mainHostElement.parent().height());

            mainHostElement.width(currentOptions.viewportWidth);
            mainHostElement.height(currentOptions.viewportHeight);

            // Store calculated page-specific dimensions.
            halfPageWidth = currentOptions.viewportWidth / 2;
            negativeHalfPageWidth = '-' + halfPageWidth + 'px'; // Used for CSS 'left' property.
            quarterPageSectionWidth = halfPageWidth / 2;
            totalPageHeight = currentOptions.viewportHeight;
            halfAnimationDuration = currentOptions.animationSpeed / 2;

            // Adjust main container width for closed books at start/end pages.
            if (currentOptions.isClosedBook && currentOptions.autoAdjustCenter) {
                if (currentOptions.initialPageIndex === 0 || currentOptions.initialPageIndex >= currentOptions.pageTotal - 2) {
                    mainHostElement.width(halfPageWidth);
                }
            }

            // Pre-calculate shadow widths for animation.
            if (currentOptions.enableShadows) {
                currentOptions.shadowFrontFoldWidth = '-' + currentOptions.shadowFrontFoldWidth + 'px';
                currentOptions.shadowBackFoldWidth = '-' + currentOptions.shadowBackFoldWidth + 'px';
            }

            // Update total page count (might have changed if pages were added/removed dynamically).
            currentOptions.pageTotal = mainHostElement.children('.f-page-container').length;

            // Manage the document title based on 'bookTitle' option.
            if (currentOptions.bookTitle) {
                document.title = currentOptions.bookTitle;
            } else if (!currentOptions.bookTitle && mainHostElement.data('original-doc-title') === undefined) {
                // Store original title if not already done, and no new title is provided.
                mainHostElement.data('original-doc-title', document.title);
            } else if (!currentOptions.bookTitle && mainHostElement.data('original-doc-title')) {
                // Restore original title if 'bookTitle' is cleared.
                document.title = mainHostElement.data('original-doc-title');
            }

            // Recalculate all CSS and animation properties based on new dimensions/options.
            _recalculateStylesAndAnimations();

            // If configuration was updated, refresh the visual display of pages.
            if (configChanged && engineCurrentState.isInitialized) {
                _refreshVisualLayout();
            }
            _helpers.log('FolioFlip configuration update complete.');
        };

        /**
         * Recalculates all dynamic CSS properties and animation values.
         */
        const _recalculateStylesAndAnimations = () => {
            // Clear existing computed styles.
            computedStyles = {};
            computedAnimations = {};

            // Styles for the main page wrapper elements.
            computedStyles.pageWrap = {
                'width': halfPageWidth,
                'height': totalPageHeight
            };

            // Styles for specific page positions.
            computedStyles.prevPageWrap = { 'left': -halfPageWidth }; // Previous page wrap is positioned off-screen left.

            computedStyles.currentPageLeft = { 'left': 0 }; // Left page of the active spread.
            computedStyles.currentPageRight = { 'left': halfPageWidth }; // Right page of the active spread.

            // Adjust based on closed book and auto-centering logic.
            if (currentOptions.isClosedBook && currentOptions.autoAdjustCenter) {
                if (currentOptions.initialPageIndex === 0) {
                    computedStyles.currentPageLeft.left = 0; // Front cover starts at 0.
                    computedStyles.currentPageRight.left = halfPageWidth; // First content page to the right.
                } else if (currentOptions.initialPageIndex >= currentOptions.pageTotal - 2) {
                    computedStyles.currentPageLeft.left = 0; // Last content page.
                    computedStyles.currentPageRight.left = halfPageWidth; // Back cover.
                }
            }

            computedStyles.prevPrevPage = { 'left': 0 }; // Previous-previous page (off-screen left).
            computedStyles.prevPage = { 'left': 0 }; // Previous page (off-screen left).
            computedStyles.nextPage = { 'left': halfPageWidth }; // Next page (off-screen right).
            computedStyles.nextNextPage = { 'left': halfPageWidth }; // Next-next page (off-screen right).

            // Shadow styles based on configuration.
            if (currentOptions.enableShadows) {
                computedStyles.frontShadow = {
                    'left': currentOptions.shadowFrontFoldWidth, // Use pre-calculated negative value.
                    'width': currentOptions.shadowFrontFoldWidth.replace('-', '') // Width should be positive.
                };
                computedStyles.backShadow = {
                    'left': currentOptions.shadowBackFoldWidth,
                    'width': currentOptions.shadowBackFoldWidth.replace('-', '')
                };
            }

            // Animation properties for page turning effects.
            computedAnimations.rightTurn = {
                'left': halfPageWidth,
                'width': 0
            };
            computedAnimations.leftTurn = {
                'left': 0,
                'width': halfPageWidth
            };

            _helpers.log('Dynamic styles and animation properties recalculated.');
        };

        /**
         * Placeholder for updating the visibility of navigation controls (arrows, tabs, etc.).
         * (This function was called in the original but not defined; here it's a stub for Type III.)
         */
        const _updateControlVisibility = () => {
            // Logic to show/hide next/prev buttons based on current page index, total pages, and configuration.
            _helpers.log('Control visibility updated (placeholder function).');
        };

        /**
         * Placeholder for updating any navigation menu or page selector UI.
         * (This function was called in the original but not defined; here it's a stub for Type III.)
         */
        const _updateNavigationMenu = () => {
            // Logic to highlight the current page in a menu, update page number displays, etc.
            _helpers.log('Navigation menu updated (placeholder function).');
        };

        /**
         * Placeholder for updating manual drag/hover page interaction areas.
         * (This function was called in the original but not defined; here it's a stub for Type III.)
         */
        const _updateManualControls = () => {
            // Logic for setting up drag handles or hover zones for manual page turning.
            _helpers.log('Manual controls updated (placeholder function).');
        };

        // --- Public API methods for the FolioEngineCore instance ---

        /**
         * Navigates the folio to a specified page index.
         * @param {number} pageTargetIndex - The 0-based index of the page to jump to.
         * @returns {FolioEngineCore} - The current engine instance for method chaining.
         */
        const jumpToPage = (pageTargetIndex) => {
            if (engineCurrentState.isEngineDisabled || engineCurrentState.isTransitioning) {
                _helpers.log('Page navigation blocked: engine is disabled or a transition is already in progress.', 'warn');
                return this;
            }

            // Validate and normalize the target page index.
            const validatedTargetIndex = Math.max(0, Math.min(pageTargetIndex, currentOptions.pageTotal - 1));
            if (validatedTargetIndex === currentOptions.initialPageIndex) {
                _helpers.log(`Already viewing page index ${validatedTargetIndex}. No navigation required.`);
                return this;
            }

            _helpers.log(`Initiating jump to page index: ${validatedTargetIndex}`);
            currentOptions.initialPageIndex = validatedTargetIndex;
            _refreshVisualLayout(); // Update the visual display to the new page.

            // Trigger the custom 'transition complete' event (simplified for this clone).
            eventPayload.activePageIndex = currentOptions.initialPageIndex;
            eventPayload.visiblePages = [internalPageRegister[currentOptions.initialPageIndex].rawContentNode, internalPageRegister[currentOptions.initialPageIndex + 1].rawContentNode];
            if (currentOptions.onTransitionEnd) {
                mainHostElement.trigger(customEvents.onChange, eventPayload);
            }

            return this;
        };

        /**
         * Retrieves the total number of pages currently in the folio.
         * @returns {number}
         */
        const getTotalPages = () => {
            return currentOptions.pageTotal;
        };

        /**
         * Retrieves the 0-based index of the currently active left-hand page.
         * @returns {number}
         */
        const getCurrentActivePageIndex = () => {
            return currentOptions.initialPageIndex;
        };

        // Expose public methods of the FolioEngineCore instance.
        return {
            startEngine: startEngine,
            deactivateEngine: deactivateEngine,
            activateEngine: activateEngine,
            disableEngine: deactivateEngine, // Alias for disable
            jumpToPage: jumpToPage,
            getTotalPages: getTotalPages,
            getCurrentActivePageIndex: getCurrentActivePageIndex,
            updateSettings: _updateEngineConfiguration // Public method to update configuration dynamically.
        };
    }

})(jQuery); // Pass jQuery object as 'jq' alias to the IIFE.