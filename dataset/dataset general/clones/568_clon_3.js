/*
 * dynamic-grid-layout
 * https://wlog.cn/waterfall/ (original source inspiration)
 *
 * Copyright (c) 2013 bingdian (original author)
 * Rewritten and modified by AI, 2024
 * Licensed under the MIT license.
 */
/*global Handlebars: false, console: false */
;(function( jQueryInstance, globalScope, domDocument, undefinedAlias ) {

    'use strict';

    // Default configuration for the dynamic grid system
    const defaultConfiguration = {
        brickClass: 'grid-item',  // CSS class for individual grid elements (bricks)
        componentPrefix: 'dynamic-grid', // Prefix for generated CSS classes and IDs
        adjustToParentWidth: true, // Whether to adapt grid width to its parent container
        columnWidthPixels: 240,  // Fixed width for each column in pixels
        horizontalGapPixels: 10, // Horizontal spacing between grid items
        verticalGapPixels: 10, // Vertical spacing between grid items
        layoutAlignment: 'center', // Alignment of the grid: 'center', 'left', 'right'
        minimumColumns: 1,  // Minimum number of columns allowed
        maximumColumns: undefinedAlias, // Maximum columns; undefined for unlimited
        maxPagesToLoad: undefinedAlias, // Maximum pages to fetch; undefined for infinite
        scrollTriggerOffset: -50, // Scroll position offset (pixels) to trigger new data load
        wrapperStyles: { // Default styles for the grid container
            position: 'relative'
        },
        enableResizeLayout: true, // Recalculate layout when browser window resizes
        fadeInOnLoad: false, // Apply fade-in effect to newly loaded items
        animateLayoutChanges: false, // Animate item positions during layout adjustments
        layoutAnimationOptions: { // Options for layout animations (e.g., duration)
        },
        autoLoadInitial: true,  // Load data until the document height exceeds window height
        awaitImageLoad: true, // Wait for images within new items to load before positioning
        dataSourceUrlGenerator: undefinedAlias, // Function or array for generating data source URL
                                                // e.g., ["/api/data?page=", "&limit=10"] or (page) => `/api/data/${page}`
        dataInputType: 'json', // Expected data format: 'json', 'jsonp', 'html'
        requestParameters: {}, // Additional parameters for AJAX requests
        requestHeaders: {}, // Custom headers for AJAX requests

        loadIndicatorHtml: '<div style="text-align:center;padding:12px 0; color:#888; font-size:14px;"><img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///zMzM+Li4tra2u7u7jk5OTMzM1hYWJubm4CAgMjIyE9PT29vb6KiooODg8vLy1JSUjc3N3Jycuvr6+Dg4Pb29mBgYOPj4/X19cXFxbOzs9XV1fHx8TMzMzMzMzMzMyH5BAkLAAAAIf4aQ3JlYXRlZCB3dGggYWphenNsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAsAAAAABAACwAABSRgYGAFYJ6ocRyHkb7A2sKp7NOp43n7L3ru1gLKidgWBPEYkYAgAh+QQJCwAsAAAAABAACwAABTYgII6LYSjjglgCSJhoMY6IoyRvPsI3rMjLAS4PAgr1b8chLEYHNydu4E06ZwlULKilknCEAAh+QQJCwAsAAAAABAACwAABTUgII6kCEURVAKN4zRiJEnR6jyPE891eeccmg2nA8iEPmKwh/oVj8yRczkEGnmr1ou6KpdUIQAh+QQJCwAsAAAAABAACwAABTIgIInmRpvtiyWOZEUZhO4SNJiUlVUXybRd4jpe7ZbbAWbDn1HoIwGNyObIBWOeSqnV9RoCAAh+QQJCwAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAsAAAAABAALAAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAAh+QQJCwAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7" alt="Loading..." /><br />Loading more items...</div>', // HTML for loading message

        // Internal state variables for the component
        internalState: {
            isFetchingData: false, // True if an AJAX request is in progress
            isProcessingLayout: false, // True if layout calculation is active
            isWindowResizing: false, // True if window resize event is being handled
            isPaused: false, // True if data loading is suspended
            currentPageNum: 1, // Current page number for data fetching
            isBeyondMaxPages: false // True if max_pages_to_load has been reached
        },

        // Callback functions for various events
        eventHandlers: {
            /**
             * Triggered when data loading begins.
             * @param {Object} $loadIndicatorElement - The jQuery object for the loading indicator.
             */
            onLoadBegin: function($loadIndicatorElement) {
                $loadIndicatorElement.show();
                // console.log('Loading initiated.');
            },

            /**
             * Triggered when data loading completes.
             * @param {Object} $loadIndicatorElement - The jQuery object for the loading indicator.
             * @param {Boolean} hasReachedPageLimit - True if the maximum page limit has been hit.
             */
            onLoadComplete: function($loadIndicatorElement, hasReachedPageLimit) {
                if ( !hasReachedPageLimit ) {
                    $loadIndicatorElement.fadeOut(200);
                    // console.log('Loading finished.');
                } else {
                    // console.log('Maximum pages reached, removing indicator.');
                    $loadIndicatorElement.remove();
                }
            },

            /**
             * Triggered if an error occurs during data loading.
             * @param {Object} $statusMessageElement - The jQuery object for the status message area.
             * @param {Object} ajaxXHR - The XHR object from the failed AJAX request.
             */
            onLoadFailure: function($statusMessageElement, ajaxXHR) {
                $statusMessageElement.html('Failed to retrieve data. Please try again or check your connection.');
                // Optionally log the full XHR for debugging
                // console.error('Data fetch error:', ajaxXHR);
            },

            /**
             * Renders fetched data into HTML content.
             * @param {Object|String} fetchedData - The raw data returned from the server.
             * @param {String} contentType - The type of data ('json', 'jsonp', 'html').
             * @returns {String} HTML string ready to be appended to the grid.
             */
            dataRenderer: function (fetchedData, contentType) {
                let templateSource, compiledTemplate;

                if ( contentType === 'json' ||  contentType === 'jsonp'  ) { // JSON format
                    // Assumes a Handlebars template with ID 'dynamic-grid-template' exists
                    templateSource = jQueryInstance('#dynamic-grid-template').html();
                    if (typeof Handlebars !== 'undefined' && Handlebars.compile) {
                        compiledTemplate = Handlebars.compile(templateSource);
                        return compiledTemplate(fetchedData);
                    } else {
                        console.warn("Handlebars is not available for JSON rendering. Returning empty string.");
                        return '';
                    }
                } else { // HTML format
                    return fetchedData;
                }
            }
        },

        loggingLevel: 'none' // Set to 'info', 'warn', 'error' for debugging output
    };

    /**
     * Represents a DynamicGrid instance.
     * Manages the layout and infinite scrolling behavior of grid items.
     * @param {HTMLElement} targetElement - The DOM element to transform into a dynamic grid.
     * @param {Object} configOptions - User-provided configuration options.
     */
    function DynamicGrid(targetElement, configOptions) {
        this.$mainContainer = jQueryInstance(targetElement);
        // Merge default and user options deeply
        this.settings = jQueryInstance.extend(true, {}, defaultConfiguration, configOptions);
        this.columnHeights = []; // Tracks the current height of each column
        this.pendingStyles = []; // Queue for applying styles to elements
        this.activeColumnCount = 0; // The number of columns currently in use
        this.isInitialized = false; // Flag to ensure initialization runs once

        // Validate target element
        if (!this.$mainContainer.length) {
            this._logMessage('error', 'Target element not found for DynamicGrid initialization.');
            return;
        }

        this._initializeGrid();
    }

    // Prototype methods for the DynamicGrid
    DynamicGrid.prototype = {
        constructor: DynamicGrid,

        /**
         * Internal logging utility based on configured loggingLevel.
         * @param {String} level - 'info', 'warn', 'error'.
         * @param {...any} messages - Messages to log.
         */
        _logMessage: function (level, ...messages) {
            const currentLevel = this.settings.loggingLevel;
            const levels = { 'none': 0, 'error': 1, 'warn': 2, 'info': 3 };

            if (levels[currentLevel] >= levels[level] && typeof console !== 'undefined' && console[level]) {
                console[level](`[DynamicGrid - ${level.toUpperCase()}]:`, ...messages);
            }
        },

        /**
         * Initializes the grid layout and event handlers.
         * This method sets up the initial grid structure and binds necessary events.
         */
        _initializeGrid: function() {
            if (this.isInitialized) {
                this._logMessage('info', 'Grid already initialized. Skipping re-initialization.');
                return;
            }

            const currentSettings = this.settings;

            this._determineColumnConfiguration();
            this._prepareDOMStructure();
            this._clearColumnTracking();
            this.performLayoutRecalculation(); // Initial layout

            if ( !currentSettings.dataSourceUrlGenerator ) {
                this._logMessage('warn', 'No data source path provided. Infinite scrolling will not function.');
            } else {
                // Auto-load initial data if enabled
                if ( currentSettings.autoLoadInitial ) {
                    this._attemptInitialDataLoad();
                }

                // Bind event handlers
                this._setupEventHandlers();
            }

            this.isInitialized = true;
            this._logMessage('info', 'DynamicGrid initialized successfully.');
        },

        /**
         * Prepares the main container and inserts loading/status elements.
         */
        _prepareDOMStructure: function() {
            const { componentPrefix, loadIndicatorHtml, wrapperStyles } = this.settings;

            // Apply container styles and add base class
            this.$mainContainer.css(wrapperStyles).addClass(`${componentPrefix}-container`);

            // Create a dedicated area for loading and status messages
            const $utilityArea = jQueryInstance('<div>')
                .attr('id', `${componentPrefix}-utility-area`)
                .css({ 'text-align': 'center', 'padding': '10px 0' });

            // Append loading indicator
            this.$loadIndicator = jQueryInstance('<div>')
                .attr('id', `${componentPrefix}-loading-indicator`)
                .html(loadIndicatorHtml)
                .appendTo($utilityArea)
                .hide(); // Hide initially

            // Append status message area
            this.$statusMessage = jQueryInstance('<div>')
                .attr('id', `${componentPrefix}-status-message`)
                .css({ 'text-align': 'center', 'color': '#999', 'font-size': '13px', 'margin-top': '5px' })
                .appendTo($utilityArea);

            this.$mainContainer.after($utilityArea); // Place utility area after the main container
        },

        /**
         * Calculates the optimal number of columns based on container width and settings.
         * Updates `this.activeColumnCount`.
         */
        _calculateColumnCounts: function() {
            const { adjustToParentWidth, columnWidthPixels, horizontalGapPixels, minimumColumns, maximumColumns } = this.settings;
            const $targetContainer = adjustToParentWidth ? this.$mainContainer.parent() : this.$mainContainer;

            // Account for browser scrollbar if the parent is the body
            let availableWidth = $targetContainer[0].tagName === 'BODY' ? $targetContainer.width() - 20 : $targetContainer.width();
            availableWidth = Math.max(availableWidth, columnWidthPixels); // Ensure minimum width

            const effectiveItemWidth = columnWidthPixels + horizontalGapPixels;
            let calculatedCols = Math.floor(availableWidth / effectiveItemWidth);

            // Apply min/max column constraints
            let finalCols = Math.max(calculatedCols, minimumColumns);
            if (maximumColumns !== undefinedAlias && finalCols > maximumColumns) {
                finalCols = maximumColumns;
            }

            this.activeColumnCount = finalCols;
            this._logMessage('info', `Calculated columns: ${this.activeColumnCount} for available width: ${availableWidth}px`);
        },

        /**
         * Updates `this.activeColumnCount` by calling `_calculateColumnCounts`.
         */
        _determineColumnConfiguration: function() {
            this._calculateColumnCounts();
        },

        /**
         * Filters the provided content for grid items and prepares them for layout.
         * @param {jQuery} $content - jQuery object containing new elements.
         * @returns {jQuery} Filtered grid items, positioned absolutely.
         */
        _extractGridItems: function( $content ) {
            if (!$content || $content.length === 0) {
                return jQueryInstance(); // Return an empty jQuery object if no content
            }
            const $items = $content.filter(`.${this.settings.brickClass}`).css({
                'position': 'absolute'
            });
            return $items;
        },

        /**
         * Resets the column height tracking array.
         */
        _clearColumnTracking: function() {
            this.columnHeights = Array(this.activeColumnCount).fill(0);
            this._logMessage('info', `Column heights reset for ${this.activeColumnCount} columns.`);
        },

        /**
         * Performs the actual layout of grid elements within the container.
         * @param {jQuery} $elementsToArrange - jQuery object of elements to lay out.
         * @param {Function} [callback] - Optional callback to execute after layout.
         */
        arrangeGridElements: function($elementsToArrange, callback) {
            const { settings } = this;
            if (!$elementsToArrange || $elementsToArrange.length === 0) {
                this._logMessage('info', 'No elements to arrange.');
                settings.internalState.isProcessingLayout = false;
                if (callback) { callback.call(this); }
                return;
            }

            // Determine if animation should be used
            const applyStyleMethod = (settings.animateLayoutChanges && settings.internalState.isWindowResizing) ? 'animate' : 'css';
            const layoutAnimationOpts = settings.layoutAnimationOptions;
            const { columnWidthPixels, horizontalGapPixels, layoutAlignment, fadeInOnLoad, brickClass } = settings;
            const numColumns = this.columnHeights.length; // Use current column heights array length

            // If fadeInOnLoad is true, set opacity to 0 and animate
            const $finalItems = fadeInOnLoad
                ? $elementsToArrange.css({ opacity: 0 }).animate({ opacity: 1 }, layoutAnimationOpts)
                : $elementsToArrange;

            // Append new items to the main container
            this.$mainContainer.append($finalItems);

            // Calculate horizontal offset based on alignment
            let offsetX = 0;
            const totalGridWidth = columnWidthPixels * numColumns + horizontalGapPixels * (numColumns - 1);

            if ( layoutAlignment === 'center' ) {
                offsetX = (this.$mainContainer.width() - totalGridWidth) / 2;
                offsetX = Math.max(offsetX, 0); // Ensure offset is not negative
            } else if ( layoutAlignment === 'right' ) {
                offsetX = this.$mainContainer.width() - totalGridWidth;
            }
            // If 'left', offsetX remains 0

            // Position each element
            $finalItems.each((idx, element) => {
                this._positionSingleElement(element, offsetX);
            });

            // Apply collected styles
            this.pendingStyles.forEach(obj => {
                obj.$el[ applyStyleMethod ]( obj.styles, layoutAnimationOpts );
            });

            // Update main container height
            this.$mainContainer.height(Math.max(...this.columnHeights));

            // Clear the style queue for the next layout
            this.pendingStyles = [];

            // Reset state flags
            settings.internalState.isWindowResizing = false;
            settings.internalState.isProcessingLayout = false;

            // Execute callback if provided
            if ( callback ) {
                callback.call( $finalItems );
            }
            this._logMessage('info', `Layout performed for ${$finalItems.length} elements.`);
        },


        /**
         * Recalculates the layout for all existing grid items.
         * @param {Function} [callback] - Optional callback to execute after layout.
         */
        performLayoutRecalculation: function( callback ) {
            const $currentItems = this.$mainContainer.find(`.${this.settings.brickClass}`);
            this._determineColumnConfiguration(); // Re-evaluate column count
            this._clearColumnTracking(); // Reset column heights
            this.arrangeGridElements($currentItems , callback );
            this._logMessage('info', 'Full layout recalculation completed.');
        },

        /**
         * Determines the optimal position for a single grid item.
         * @param {HTMLElement} currentElement - The DOM element to position.
         * @param {Number} horizontalOffset - Global horizontal offset for the grid.
         */
        _positionSingleElement: function( currentElement, horizontalOffset ) {
            const $currentElement = jQueryInstance(currentElement);
            const { columnWidthPixels, horizontalGapPixels, verticalGapPixels, componentPrefix } = this.settings;
            const columnHeights = this.columnHeights;
            const numColumns = columnHeights.length;

            let targetColumnIndex;

            // Handle fixed position items (e.g., header/footer in a column)
            if ( $currentElement.hasClass(`${componentPrefix}-item-fixed-left`)) {
                targetColumnIndex = 0;
            } else if ( $currentElement.hasClass(`${componentPrefix}-item-fixed-right`) ) {
                targetColumnIndex = ( numColumns > 1 ) ? ( numColumns - 1) : 0;
            } else {
                // Find the shortest column for regular items
                const shortestColumnHeight = Math.min(...columnHeights);
                targetColumnIndex = columnHeights.indexOf(shortestColumnHeight);
            }

            // Calculate top and left positions
            const calculatedPosition = {
                left: (columnWidthPixels + horizontalGapPixels) * targetColumnIndex  + horizontalOffset,
                top: columnHeights[targetColumnIndex]
            };

            // Add to style queue for batch application
            this.pendingStyles.push({ $el: $currentElement, styles: calculatedPosition });

            // Update the height of the target column
            columnHeights[targetColumnIndex] += $currentElement.outerHeight(true) + verticalGapPixels;
        },

        /**
         * Adds new grid items to the beginning of the grid.
         * @param {jQuery} $newContent - jQuery object of elements to add.
         * @param {Function} [callback] - Optional callback.
         */
        addElementsToFront: function($newContent, callback) {
            this.$mainContainer.prepend($newContent);
            this.performLayoutRecalculation(callback);
            this._logMessage('info', `Prepended ${$newContent.length} elements.`);
        },

        /**
         * Adds new grid items to the end of the grid.
         * @param {jQuery} $newContent - jQuery object of elements to add.
         * @param {Function} [callback] - Optional callback.
         */
        addElementsToEnd: function($newContent, callback) {
            const self = this;
            const { awaitImageLoad } = this.settings;

            // Extract only the actual brick items from the content
            const $newBrickItems = this._extractGridItems($newContent);

            if ($newBrickItems.length === 0) {
                this._logMessage('warn', 'Attempted to append, but no valid brick items found in content.');
                if (callback) { callback(); }
                return;
            }

            const layoutAndFinish = () => {
                self.arrangeGridElements($newBrickItems, callback);
                self.settings.eventHandlers.onLoadComplete(self.$loadIndicator, self.settings.internalState.isBeyondMaxPages);
                self._logMessage('info', `Appended ${$newBrickItems.length} elements.`);
            };

            if (awaitImageLoad) {
                // Wait for all images within the new items to load
                $newBrickItems.find('img').imagesLoaded((instance) => {
                    this._logMessage('info', `All images loaded in ${instance.images.length} new items.`);
                    layoutAndFinish();
                });
            } else {
                layoutAndFinish();
            }
        },

        /**
         * Removes specified grid items from the layout.
         * @param {jQuery} $itemsToRemove - jQuery object of elements to remove.
         * @param {Function} [callback] - Optional callback.
         */
        removeSelectedElements:function($itemsToRemove, callback ) {
            this.$mainContainer.find($itemsToRemove).remove();
            this.performLayoutRecalculation(callback);
            this._logMessage('info', `Removed ${$itemsToRemove.length} elements.`);
        },

        /**
         * Updates the grid's configuration options.
         * @param {Object} updatedOptions - New options to merge.
         * @param {Function} [callback] - Optional callback.
         */
        updateConfiguration: function( updatedOptions, callback ){
            if ( jQueryInstance.isPlainObject( updatedOptions ) ){
                this.settings = jQueryInstance.extend(true, this.settings, updatedOptions);

                if ( typeof callback === 'function' ) {
                    callback();
                }

                // Re-initialize to apply new settings, but only if essential settings changed
                // For simplicity, we re-init fully here, but a more complex version might check specific keys.
                this._logMessage('info', 'Configuration updated. Re-initializing grid.');
                this.isInitialized = false; // Force re-initialization
                this._initializeGrid();
            }
        },

        /**
         * Suspends automatic data loading.
         * @param {Function} [callback] - Optional callback.
         */
        suspendLoading: function(callback) {
            this.settings.internalState.isPaused = true;
            this._logMessage('info', 'Data loading suspended.');
            if ( typeof callback === 'function' ) {
                callback();
            }
        },

        /**
         * Resumes automatic data loading.
         * @param {Function} [callback] - Optional callback.
         */
        resumeLoading: function(callback) {
            this.settings.internalState.isPaused = false;
            this._logMessage('info', 'Data loading resumed. Checking for prefill/scroll trigger.');
            // After resuming, immediately check if prefill or scroll trigger is met
            this._attemptInitialDataLoad();
            this._checkScrollPosition();

            if ( typeof callback === 'function' ) {
                callback();
            }
        },

        /**
         * Attempts to load initial data until the document is taller than the window.
         * This is part of the `autoLoadInitial` feature.
         */
        _attemptInitialDataLoad: function() {
            if (!this.settings.autoLoadInitial || this.settings.internalState.isPaused || this.settings.internalState.isFetchingData) {
                return;
            }

            // Check if document height is less than window height
            const $win = jQueryInstance(globalScope);
            const docHeight = jQueryInstance(domDocument).height();
            const winHeight = $win.height();

            if (docHeight < winHeight) {
                this._logMessage('info', 'Document height less than window height. Attempting initial data load.');
                this._initiateDataFetch(() => {
                    // After data is fetched and laid out, check again recursively
                    this._attemptInitialDataLoad();
                });
            } else {
                this._logMessage('info', 'Initial data load complete (document height >= window height).');
            }
        },

        /**
         * Initiates an AJAX request to fetch more data.
         * @param {Function} [fetchCompletionCallback] - Callback to execute on successful data handling.
         */
        _initiateDataFetch: function(fetchCompletionCallback) {
            const self = this;
            const settings = this.settings;
            const { internalState, maxPagesToLoad, dataSourceUrlGenerator, dataInputType, requestParameters, requestHeaders, eventHandlers } = settings;

            if (internalState.isFetchingData || internalState.isPaused || internalState.isBeyondMaxPages) {
                this._logMessage('info', 'Data fetch prevented due to current state (fetching, paused, or page limit).');
                return;
            }

            let currentPageNum = internalState.currentPageNum++; // Increment page for next request

            if ( maxPagesToLoad !== undefinedAlias && currentPageNum > maxPagesToLoad ){
                internalState.isBeyondMaxPages = true;
                eventHandlers.onLoadComplete(this.$loadIndicator, internalState.isBeyondMaxPages);
                this._logMessage('info', `Max pages (${maxPagesToLoad}) reached. No more data will be fetched.`);
                return;
            }

            // Generate the URL for the current page
            let fetchUrl;
            if (typeof dataSourceUrlGenerator === 'function') {
                fetchUrl = dataSourceUrlGenerator(currentPageNum);
            } else if (Array.isArray(dataSourceUrlGenerator) && dataSourceUrlGenerator.length === 2) {
                fetchUrl = dataSourceUrlGenerator[0] + currentPageNum + dataSourceUrlGenerator[1];
            } else {
                this._logMessage('error', 'Invalid dataSourceUrlGenerator configuration.');
                return;
            }

            this._logMessage('info', `Initiating data fetch for page ${currentPageNum} from: ${fetchUrl}`);

            // Trigger loading start callback
            eventHandlers.onLoadBegin(this.$loadIndicator);

            // Update internal state
            internalState.isFetchingData = true;
            internalState.isProcessingLayout = true; // Assume layout will be processed after fetch

            // Perform AJAX request
            jQueryInstance.ajax({
                url: fetchUrl,
                data: requestParameters,
                headers: requestHeaders,
                dataType: dataInputType,
                success: function(responsePayload) {
                    self._processFetchedContent(responsePayload, fetchCompletionCallback);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    self._handleFetchError(jqXHR, textStatus, errorThrown);
                },
                complete: function() {
                    internalState.isFetchingData = false; // Reset fetching flag regardless of success/failure
                }
            });
        },

        /**
         * Processes the data received from the AJAX request.
         * @param {Object|String} responseData - The raw data returned.
         * @param {Function} [completionCallback] - Callback to execute after processing.
         */
        _processFetchedContent: function(responseData, completionCallback) {
            const self = this;
            const settings = this.settings;
            const { dataInputType, eventHandlers } = settings;

            const renderedContentHtml = jQueryInstance.trim(eventHandlers.dataRenderer(responseData, dataInputType));

            if (!renderedContentHtml) {
                this._logMessage('warn', 'Data renderer returned empty content. No new items to append.');
                settings.internalState.isProcessingLayout = false;
                eventHandlers.onLoadComplete(this.$loadIndicator, settings.internalState.isBeyondMaxPages);
                if (completionCallback) { completionCallback(); }
                return;
            }

            const $newElements = jQueryInstance(renderedContentHtml);

            // Append new elements and trigger layout
            this.addElementsToEnd($newElements, () => {
                if (completionCallback) {
                    completionCallback();
                }
            });
        },

        /**
         * Handles errors during data fetching.
         * @param {Object} jqXHR - The jQuery XHR object.
         * @param {String} textStatus - The status of the request ('error', 'timeout', etc.).
         * @param {String} errorThrown - The error message.
         */
        _handleFetchError: function(jqXHR, textStatus, errorThrown) {
            this._logMessage('error', `AJAX Error: ${textStatus} - ${errorThrown}`, jqXHR);
            this.settings.eventHandlers.onLoadFailure(this.$statusMessage, jqXHR);
            this.settings.internalState.isProcessingLayout = false; // Ensure layout flag is reset
            this.settings.eventHandlers.onLoadComplete(this.$loadIndicator, this.settings.internalState.isBeyondMaxPages);
        },

        /**
         * Attaches event handlers for window resize and scroll events.
         */
        _setupEventHandlers: function() {
            const self = this;
            const $win = jQueryInstance(globalScope);
            const { enableResizeLayout } = this.settings;

            // Debounced resize handler
            const debouncedResize = this._debounce(() => {
                if (!enableResizeLayout) return;
                self._logMessage('info', 'Window resized. Recalculating layout.');
                self.settings.internalState.isWindowResizing = true;
                self.performLayoutRecalculation();
            }, 150); // Debounce by 150ms

            // Debounced scroll handler
            const debouncedScroll = this._debounce(() => {
                self._checkScrollPosition();
            }, 100); // Debounce by 100ms

            $win.on('resize.dynamicGrid', debouncedResize);
            $win.on('scroll.dynamicGrid', debouncedScroll);
            this._logMessage('info', 'Event handlers for resize and scroll attached.');
        },

        /**
         * Checks the scroll position to determine if new data should be loaded.
         */
        _checkScrollPosition: function() {
            const { internalState, scrollTriggerOffset } = this.settings;
            if (internalState.isFetchingData || internalState.isPaused || internalState.isBeyondMaxPages) {
                return;
            }

            const $win = jQueryInstance(globalScope);
            const $doc = jQueryInstance(domDocument);

            const scrollTop = $win.scrollTop();
            const windowHeight = $win.height();
            const documentHeight = $doc.height();

            // Check if scroll position is near the bottom of the document
            if (scrollTop + windowHeight >= documentHeight + scrollTriggerOffset) {
                this._logMessage('info', 'Scroll position near bottom. Triggering data fetch.');
                this._initiateDataFetch();
            }
        },

        /**
         * Utility function to debounce another function.
         * @param {Function} func - The function to debounce.
         * @param {Number} delay - The delay in milliseconds.
         * @returns {Function} The debounced function.
         */
        _debounce: function(func, delay) {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), delay);
            };
        },

        /**
         * Destroys the DynamicGrid instance, removing event handlers and elements.
         */
        _destroy: function() {
            const { componentPrefix } = this.settings;
            jQueryInstance(globalScope).off('.dynamicGrid'); // Remove namespaced event handlers
            this.$mainContainer.removeClass(`${componentPrefix}-container`).css('height', ''); // Clean container styles
            jQueryInstance(`#${componentPrefix}-utility-area`).remove(); // Remove utility elements

            // Remove inline styles from items if desired (optional)
            this.$mainContainer.find(`.${this.settings.brickClass}`).each((_, el) => {
                jQueryInstance(el).attr('style', ''); // Clear inline styles
            });

            this._logMessage('info', 'DynamicGrid instance destroyed.');
            this.$mainContainer.data('dynamicGrid', null); // Clear data reference
        }
    };

    // jQuery plugin definition
    jQueryInstance.fn.dynamicGrid = function( configurationOptions ) {
        return this.each(function() {
            let instance = jQueryInstance.data(this, 'dynamicGrid');

            if ( !instance ) {
                // Initialize a new instance
                instance = new DynamicGrid( this, configurationOptions );
                jQueryInstance.data( this, 'dynamicGrid', instance );
            } else if ( typeof configurationOptions === 'string' ) {
                // Call a method on the existing instance
                const methodName = configurationOptions;
                const args = Array.prototype.slice.call( arguments, 1 );

                if ( typeof instance[ methodName ] === 'function' && methodName.charAt(0) !== '_' ) {
                    instance[ methodName ].apply( instance, args );
                } else {
                    instance._logMessage('warn', `Method "${methodName}" does not exist or is private.`);
                }
            } else if ( typeof configurationOptions === 'object' ) {
                // Update configuration on existing instance
                instance.updateConfiguration(configurationOptions);
            }
        });
    };

    // Make the DynamicGrid constructor accessible for advanced usage (optional)
    // jQueryInstance.DynamicGrid = DynamicGrid;

})( jQuery, window, document );