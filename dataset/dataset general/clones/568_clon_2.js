/*
 * gridStream - A dynamic grid layout for web content.
 * Project homepage: https://example.com/gridstream/
 *
 * Copyright (c) 2023 ExampleDev
 * Licensed under the permissive MIT license.
 */
/*global Handlebars: false, console: false */
;(function( jQueryInstance, browserWindow, documentElement, undefinedValue ) {

    'use strict';

    // Default configuration parameters for the GridStream module.
    var $browserViewport = jQueryInstance(browserWindow),
        moduleIdentifier = 'gridStream',
        standardOptions = {
            contentUnitClass: 'grid-item',  // The CSS class for individual content blocks
            namingConvention: 'gridStream', // Prefix for internal element IDs and classes
            adaptToContainer: true, // Whether the grid should expand to fill its parent
            unitWidth: 240,  // Fixed width of each grid column
            horizontalSpacing: 10, // Horizontal gap between items
            verticalSpacing: 10, // Vertical gap between items
            layoutAlignment: 'center', // How the grid is aligned: 'center', 'left', 'right'
            minimumColumns: 1,  // The smallest allowed number of columns
            maximumColumns: undefinedValue, // The largest allowed number of columns (undefined for no limit)
            pageUpperLimit: undefinedValue, // Maximum number of data pages to fetch (undefined for infinite)
            scrollTriggerOffset: -50, // Pixels before the bottom of the viewport to trigger content loading
            wrapperCSS: { // Custom CSS styles for the main grid container
                position: 'relative'
            },
            enableResizing: true, // Re-calculates layout when the browser window is resized
            applyFadeIn: false, // Applies a fade-in effect to newly loaded items
            animateLayoutChanges: false, // Uses animations for layout adjustments, e.g., on resize
            animationConfiguration: { // Custom options for jQuery animations
            },
            autoFillContent: true,  // Automatically loads more data if the page content is shorter than the window height
            waitForImagesToLoad: true, // Delays layout until all images within new content are loaded. (Set to false for faster rendering)
            dataEndpoint: undefinedValue, // The URL for fetching data, can be an array (e.g., ["/data/", "/page/"]) or a function(pageNumber)
            expectedDataType: 'json', // Expected data format from the server: 'json', 'jsonp', 'html'
            requestPayload: {}, // Additional parameters to send with the data request (e.g., {category: "news"})
            customHeaders: {}, // Custom HTTP headers for the AJAX request

            loadingHTMLTemplate: '<div style="text-align:center;padding:10px 0; color:#999;"><img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///zMzM+Li4tra2u7u7jk5OTMzM1hYWJubm4CAgMjIyE9PT29vb6KiooODg8vLy1JSUjc3N3Jycuvr6+Dg4Pb29mBgYOPj4/X19cXFxbOzs9XV1fHx8TMzMzMzMzMzMyH5BAkLAAAAIf9qQ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAsAAAAABAACwAABJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAsAAAAABAACwAABNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAsAAAAABAACwAABNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAsAAAAABAALAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAsAAAAABAALAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7" alt=""><br />Fetching data...</div>', // HTML for the loading message

            runtimeStatus: {
                ajaxCallActive: false,
                dataTransformationInProgress: false,
                windowAdjustmentActive: false,
                dataFetchingPaused: false,
                currentPageIndex: 1 // The currently loaded page number
            },

            // Custom callback functions for various events
            eventHooks: {
                /*
                 * Called when data retrieval starts.
                 * @param {Object} $loadingIndicator - jQuery object for the loading display.
                 */
                onDataRetrievalStart: function($loadingIndicator) {
                    $loadingIndicator.show();
                    //console.log('data fetch', 'initiated');
                },

                /*
                 * Called when data retrieval completes.
                 * @param {Object} $loadingIndicator - jQuery object for the loading display.
                 * @param {Boolean} isBeyondPageLimit - True if the maximum page count has been exceeded.
                 */
                onDataRetrievalComplete: function($loadingIndicator, isBeyondPageLimit) {
                    if ( !isBeyondPageLimit ) {
                        $loadingIndicator.fadeOut();
                        //console.log('data fetch finished');
                    } else {
                        //console.log('maximum page reached');
                        $loadingIndicator.remove();
                    }
                },

                /*
                 * Called if there's an error during data loading.
                 * @param {Object} $statusMessageArea - jQuery object for the message display.
                 * @param {String} ajaxRequestStatus - The status of the AJAX request (e.g., "error", "timeout").
                 */
                onDataRetrievalError: function($statusMessageArea, ajaxRequestStatus) {
                    $statusMessageArea.html('Content loading failed, please try again later.');
                },

                /*
                 * Processes raw data into HTML for display.
                 * @param {String} receivedData - The data received from the server.
                 * @param {String} formatIdentifier - The format of the received data ("json", "jsonp", "html").
                 * @returns {String} HTML string ready for injection.
                 */
                generateContentHTML: function (receivedData, formatIdentifier) {
                    var templateSource,
                        compiledTemplateFunction;

                    if ( formatIdentifier === 'json' ||  formatIdentifier === 'jsonp'  ) { // Handle JSON or JSONP
                        templateSource = jQueryInstance('#gridStream-template').html();
                        compiledTemplateFunction = Handlebars.compile(templateSource);

                        return compiledTemplateFunction(receivedData);
                    } else { // Handle raw HTML
                        return receivedData;
                    }
                }
            },

            enableVerboseLogging: false // Set to true to output debug messages to the console
        };

    /*
     * GridStream constructor function.
     * Manages the dynamic grid layout.
     * @param {HTMLElement} domElement - The DOM element to transform into a grid.
     * @param {Object} userConfiguration - User-defined settings to override defaults.
     */
    function GridStream(domElement, userConfiguration) {
        this.$mainContainer = jQueryInstance(domElement);
        this.currentSettings = jQueryInstance.extend(true, {}, standardOptions, userConfiguration);
        this.columnStacks = []; // Array to track the current height of each column
        this.pendingStyles = []; // Queue for applying styles in a batch

        this._setupInitialState();
    }


    GridStream.prototype = {
        constructor: GridStream,

        // A private method for logging messages to the console, controlled by `enableVerboseLogging`.
        _logToConsole: function () {
            if ( true !== this.currentSettings.enableVerboseLogging ) {
                return;
            }

            if (typeof console !== 'undefined' && typeof console.log === 'function') {
                // Modern browsers with `console.log`
                // Special handling for a single string argument for cleaner output
                if ((Array.prototype.slice.call(arguments)).length === 1 && typeof Array.prototype.slice.call(arguments)[0] === 'string') {
                    console.log( (Array.prototype.slice.call(arguments)).toString() );
                } else {
                    console.log( Array.prototype.slice.call(arguments) );
                }
            } else if (!Function.prototype.bind && typeof console !== 'undefined' && typeof console.log === 'object') {
                // Fallback for older browsers like IE8
                Function.prototype.call.call(console.log, console, Array.prototype.slice.call(arguments));
            }
        },


        /*
         * Initializes the grid component: sets up columns, container, and event handlers.
         * @param {Function} [initializationCallback] - Optional callback to run after initial setup.
         */
        _setupInitialState: function( initializationCallback ) {
            var currentSettings = this.currentSettings,
                dataEndpoint = currentSettings.dataEndpoint;

            this._determineColumnLayout();
            this._prepareDomContainer();
            this._resetColumnHeights();
            this.reorganizeLayout( initializationCallback );

            if ( !dataEndpoint ) {
                this._logToConsole('Invalid data endpoint specified');
                return;
            }

            // Automatically load content to fill the screen
            if ( currentSettings.autoFillContent ) {
                this._prefillGrid();
            }

            // Attach window resize listener if enabled
            if ( currentSettings.enableResizing ) {
                this._handleWindowResize();
            }

            // Attach scroll event listener for infinite loading
            this._handleScrollEvent();
        },

        /*
         * Prepares the main DOM container for the grid.
         * This includes applying base styles and adding loading/message elements.
         */
        _prepareDomContainer: function() {
            var currentSettings = this.currentSettings,
                namingConvention = currentSettings.namingConvention;

            // Adjust `body` overflow to prevent scrollbar issues with width calculations
            jQueryInstance('body').css({
                overflow: 'scroll'
            });


            this.$mainContainer.css(this.currentSettings.wrapperCSS).addClass(namingConvention + '-wrapper');
            this.$mainContainer.after('<div id="' + namingConvention + '-loader">' +currentSettings.loadingHTMLTemplate+ '</div><div id="' + namingConvention + '-feedback" style="text-align:center;color:#999;"></div>');

            this.$loadingIndicator = jQueryInstance('#' + namingConvention + '-loader');
            this.$statusMessageArea = jQueryInstance('#' + namingConvention + '-feedback');
        },


        /**
         * Calculates the appropriate number of columns based on container width and settings.
         * @returns {Number} The computed number of columns for the grid.
         */
        _calculateGridColumns : function() {
            var currentSettings = this.currentSettings,
                $parentSizingElement = currentSettings.adaptToContainer ?  this.$mainContainer.parent() : this.$mainContainer,
                availableWidth = $parentSizingElement[0].tagName === 'BODY' ? $parentSizingElement.width() - 20 : $parentSizingElement.width(),  // Account for browser scrollbar if body is the parent
                unitWidth = currentSettings.unitWidth,
                horizontalSpacing = currentSettings.horizontalSpacing,
                minimumColumns = currentSettings.minimumColumns,
                maximumColumns = currentSettings.maximumColumns,
                calculatedColumnsCount = Math.floor(availableWidth / (unitWidth + horizontalSpacing)),
                effectiveColumnCount = Math.max(calculatedColumnsCount, minimumColumns );

            /* If a maximum column limit is set, ensure it's respected. */
            return !maximumColumns ? effectiveColumnCount : (effectiveColumnCount > maximumColumns ? maximumColumns : effectiveColumnCount);
        },


        /**
         * Updates the internal column count property.
         */
        _determineColumnLayout: function() {
            this.effectiveColumnCount = this._calculateGridColumns();
        },


        /*
         * Extracts and prepares grid items from a given jQuery object of content.
         * @param {Object} $newContentElements - jQuery object containing new content.
         * @returns {Object} A jQuery object of the filtered and styled grid items.
         */
        _extractGridItems: function( $newContentElements ) {
            var $targetItems = $newContentElements.filter('.' + this.currentSettings.contentUnitClass).css({
                'position': 'absolute'
            });

            return $targetItems;
        },


        /*
         * Resets all column height tracking values to zero.
         */
        _resetColumnHeights: function() {
            var effectiveColumnCount = this.effectiveColumnCount,
                itemIdx;

            this.columnStacks.length = effectiveColumnCount;

            for (itemIdx = 0; itemIdx < effectiveColumnCount; itemIdx++) {
                this.columnStacks[itemIdx] = 0;
            }
        },

        /*
         * Arranges the provided grid elements into their correct positions.
         * @param {Object} $newContentElements - jQuery object of elements to arrange.
         * @param {Function} [layoutCompletionCallback] - Callback function to execute after arrangement.
         */
        arrangeGridElements: function($newContentElements, layoutCompletionCallback) {
            var currentSettings = this.currentSettings,
            $targetItems = this.currentSettings.applyFadeIn ? this._extractGridItems($newContentElements).css({ opacity: 0 }).animate({ opacity: 1 }) : this._extractGridItems($newContentElements),
                styleApplicationMethod = (this.currentSettings.animateLayoutChanges && this.currentSettings.runtimeStatus.windowAdjustmentActive) ? 'animate' : 'css',
                animationConfiguration = currentSettings.animationConfiguration,
                unitWidth = currentSettings.unitWidth,
                horizontalSpacing = currentSettings.horizontalSpacing,
                totalColumns = this.columnStacks.length,
                layoutAlignment = currentSettings.layoutAlignment,
                adjustedLeftPosition,
                styleObjectEntry,
                itemIdx, styleIdx, totalItemsCount, totalStylesToApply;

            // Append the extracted items to the main container
            this.$mainContainer.append($targetItems);

            // Calculate the left margin adjustment for alignment
            if ( layoutAlignment === 'center' ) {
                adjustedLeftPosition = (this.$mainContainer.width() - unitWidth * totalColumns  - horizontalSpacing * (totalColumns - 1) ) /2;
                adjustedLeftPosition = adjustedLeftPosition > 0 ? adjustedLeftPosition : 0;
            } else if ( layoutAlignment === 'left' ) {
                adjustedLeftPosition = 0;
            } else if ( layoutAlignment === 'right' ) {
                adjustedLeftPosition = this.$mainContainer.width() - unitWidth * totalColumns  - horizontalSpacing * (totalColumns - 1);
            }

            // Determine placement for each item
            for (itemIdx = 0, totalItemsCount = $targetItems.length; itemIdx < totalItemsCount; itemIdx++) {
                this._positionSingleElement( $targetItems[itemIdx], adjustedLeftPosition);
            }

            // Apply all queued styles (either immediately or animated)
            for (styleIdx = 0, totalStylesToApply = this.pendingStyles.length; styleIdx < totalStylesToApply; styleIdx++) {
                styleObjectEntry = this.pendingStyles[styleIdx];
                styleObjectEntry.$el[ styleApplicationMethod ]( styleObjectEntry.style, animationConfiguration );
            }

            // Update the main container's height to encompass all items
            this.$mainContainer.height(Math.max.apply({}, this.columnStacks));

            // Clear the style queue for future operations
            this.pendingStyles = [];

            // Reset internal status flags
            this.currentSettings.runtimeStatus.windowAdjustmentActive = false;
            this.currentSettings.runtimeStatus.dataTransformationInProgress = false;

            // Execute the provided callback if available
            if ( layoutCompletionCallback ) {
                layoutCompletionCallback.call( $targetItems );
            }
        },


        /*
         * Re-arranges all existing grid elements. Useful for window resizing or filter changes.
         * @param {Function} [layoutCallback] - Callback function to execute after re-layout.
         */
        reorganizeLayout: function( layoutCallback ) {
            var $allCurrentItems = this.$mainContainer.find('.' + this.currentSettings.contentUnitClass);

            this._resetColumnHeights();
            this.arrangeGridElements($allCurrentItems , layoutCallback );
        },

        /*
         * Places a single grid element into the shortest available column.
         * @param {HTMLElement} elementToPosition - The raw DOM element to place.
         * @param {Number} adjustedLeftPosition - The calculated horizontal offset for alignment.
         */
        _positionSingleElement: function( elementToPosition, adjustedLeftPosition ) {

            var $itemNode = jQueryInstance(elementToPosition),
                currentSettings = this.currentSettings,
                unitWidth = currentSettings.unitWidth,
                horizontalSpacing = currentSettings.horizontalSpacing,
                verticalSpacing = currentSettings.verticalSpacing,
                columnStacks = this.columnStacks,
                totalColumns = columnStacks.length,
                shortestStackHeight = Math.min.apply({}, columnStacks),
                shortestStackIndex = jQueryInstance.inArray(shortestStackHeight, columnStacks),
                assignedColumnIndex, // The index of the column where the item will be placed
                elementCoordinates;

            if ( $itemNode.hasClass(currentSettings.namingConvention + '-item-fixed-left')) {
                assignedColumnIndex = 0;
            } else if ( $itemNode.hasClass(currentSettings.namingConvention + '-item-fixed-right') ) {
                assignedColumnIndex = ( totalColumns > 1 ) ? ( totalColumns - 1) : 0;
            } else {
                assignedColumnIndex = shortestStackIndex;
            }

            elementCoordinates = {
                left: (unitWidth + horizontalSpacing) * assignedColumnIndex  + adjustedLeftPosition,
                top: columnStacks[assignedColumnIndex]
            };

            // Add the element and its calculated position to the pending styles queue
            this.pendingStyles.push({ $el: $itemNode, style: elementCoordinates });

            // Update the height of the column where the item was placed
            columnStacks[assignedColumnIndex] += $itemNode.outerHeight() + verticalSpacing;

            // Optionally, add a data attribute to the item indicating its column
            //$itemNode.attr('data-grid-column', assignedColumnIndex);
        },

        /*
         * Adds new content to the beginning of the grid.
         * @param {Object} $newElements - jQuery object of elements to insert.
         * @param {Function} [insertionCallback] - Callback after content is added and layout updated.
         */
        insertFront: function($newElements, insertionCallback) {
            this.$mainContainer.prepend($newElements);
            this.reorganizeLayout(insertionCallback);
        },

        /*
         * Adds new content to the end of the grid.
         * @param {Object} $newElements - jQuery object of elements to append.
         * @param {Function} [appendCallback] - Callback after content is added and layout updated.
         */
        addBack: function($newElements, appendCallback) {
            this.$mainContainer.append($newElements);
            this.reorganizeLayout(appendCallback);
        },

        /*
         * Removes specific elements from the grid.
         * @param {Object} $elementsToRemove - jQuery object of elements to be deleted.
         * @param {Function} [removalCallback] - Callback after elements are removed and layout updated.
         */
        deleteElements:function($elementsToRemove, removalCallback ) {
            this.$mainContainer.find($elementsToRemove).remove();
            this.reorganizeLayout(removalCallback);
        },

        /*
         * Updates the grid's configuration settings.
         * @param {Object} newConfiguration - An object containing new configuration properties.
         * @param {Function} [configUpdateCallback] - Callback to execute after settings are applied.
         */
        updateConfiguration: function( newConfiguration, configUpdateCallback ){
            if ( jQueryInstance.isPlainObject( newConfiguration ) ){
                this.currentSettings = jQueryInstance.extend(true, this.currentSettings, newConfiguration);

                if ( typeof configUpdateCallback === 'function' ) {
                    configUpdateCallback();
                }

                // Re-initialize the component to apply new settings
                this._setupInitialState();
            }
        },

        /*
         * Prevents further data fetching requests.
         * @param {Function} [pauseCompletionCallback] - Callback to execute after pausing.
         */
        haltRequests: function(pauseCompletionCallback) {
            this.currentSettings.runtimeStatus.dataFetchingPaused = true;

            if ( typeof pauseCompletionCallback === 'function' ) {
                pauseCompletionCallback();
            }
        },


        /*
         * Resumes data fetching requests if they were halted.
         * @param {Function} [resumeCompletionCallback] - Callback to execute after resuming.
         */
        unpauseRequests: function(resumeCompletionCallback) {
            this.currentSettings.runtimeStatus.dataFetchingPaused = false;

            if ( typeof resumeCompletionCallback === 'function' ) {
                resumeCompletionCallback();
            }
        },

        /**
         * Initiates an AJAX request to fetch more content data.
         * @param {Function} [dataFetchCallback] - Callback to execute upon successful data retrieval.
         */
        _initiateDataFetch: function(dataFetchCallback) {
            var _thisInstance = this,
                currentSettings = this.currentSettings,
                pageUpperLimit = currentSettings.pageUpperLimit,
                currentPageIndex = currentSettings.runtimeStatus.currentPageIndex++, // Increment current page for the next request
                dataEndpoint = currentSettings.dataEndpoint,
                formatIdentifier = currentSettings.expectedDataType,
                requestPayload = currentSettings.requestPayload,
                customHeaders = currentSettings.customHeaders,
                targetURL;

            if ( pageUpperLimit !== undefinedValue && currentPageIndex > pageUpperLimit ){
                currentSettings.runtimeStatus.isBeyondMaxPage = true; // Set flag indicating page limit reached
                currentSettings.eventHooks.onDataRetrievalComplete(this.$loadingIndicator, currentSettings.runtimeStatus.isBeyondMaxPage);
                return;
            }

            // Construct the final URL for the data request
            targetURL = (typeof dataEndpoint === 'function') ? dataEndpoint(currentPageIndex) : dataEndpoint.join(currentPageIndex);

            this._logToConsole('Beginning AJAX call to', targetURL + jQueryInstance.param(requestPayload));

            // Invoke the 'data retrieval start' event hook
            currentSettings.eventHooks.onDataRetrievalStart(this.$loadingIndicator);

            // Update internal runtime status flags
            currentSettings.runtimeStatus.ajaxCallActive = true;
            currentSettings.runtimeStatus.dataTransformationInProgress = true;

            // Execute the AJAX request
            jQueryInstance.ajax({
                url: targetURL,
                data: requestPayload,
                headers: customHeaders,
                dataType: formatIdentifier,
                success: function(receivedData) {
                    _thisInstance._processIncomingData(receivedData, dataFetchCallback);
                    _thisInstance.currentSettings.runtimeStatus.ajaxCallActive = false;
                },
                error: function(jQueryXHRobject) {
                    _thisInstance._dataRequestFailed('error'); // Assuming _dataRequestFailed is a method
                }
            });
        },


        /**
         * Handles the response received from the data fetching request.
         * @param {Object} receivedData - The data payload returned by the server.
         * @param {Function} [dataFetchCallback] - Callback to execute after data processing.
         */
        _processIncomingData: function(receivedData, dataFetchCallback) {
            var _thisInstance = this,
                currentSettings = this.currentSettings,
                processedContent = jQueryInstance.trim(currentSettings.eventHooks.generateContentHTML(receivedData, currentSettings.expectedDataType)),
                $newContentElements = jQueryInstance(processedContent),
                waitForImagesToLoad = currentSettings.waitForImagesToLoad;

            if ( !waitForImagesToLoad ) {
               _thisInstance.addBack($newContentElements, dataFetchCallback);
               _thisInstance.currentSettings.eventHooks.onDataRetrievalComplete(_thisInstance.$loadingIndicator, _thisInstance.currentSettings.runtimeStatus.isBeyondMaxPage);
            }
            // The original code snippet was truncated here. The remainder of the method would follow.
            // ... (rest of _processIncomingData method, including image loading logic, would be cloned similarly)