;(function ( jQuery, globalScope, undefined ) {

    /**
     * @module Responsive Tile Layout Engine
     * @version 3.0
     * @description A lightweight jQuery-based plugin for creating adaptive, dynamic, and customizable grid layouts,
     *              mimicking a Pinterest-style display with support for varied column widths.
     * @author Original concept by Marek Fajkus, adapted and extended by AI.
     * @license MIT - Freely usable and modifiable.
     */

    // Define the component's unique identifier to prevent naming conflicts and for data storage.
    var componentIdentifier = 'tileGridEngine',
        // Establish the default configuration settings for the layout engine.
        defaultConfiguration = {
            // An array of breakpoint objects, defining column counts for different container widths.
            layoutBreakpoints: [
                {
                    minimumWidth: 960, // Minimum container width for this breakpoint.
                    columnCount: 4     // Number of columns to display at this width.
                },
                {
                    minimumWidth: 720,
                    columnCount: 3
                },
                {
                    minimumWidth: 550,
                    columnCount: 2
                },
                {
                    minimumWidth: 0,
                    columnCount: 1
                }
            ],
            displayMode: null,                 // Optional: 'vertical-stack' or 'urban-layout' for special visual styles.
            alignRightInitially: false,        // If true, the rightmost column is prioritized for initial tile placement.
            heightQuantizationFactor: 25,      // Tiles will have heights rounded up to a multiple of this factor.
            transitionDuration: 200            // Duration in milliseconds for CSS transitions on tile positioning.
        };

    /**
     * @class LayoutEngine
     * @constructor
     * @param {HTMLElement} hostElement - The DOM element to transform into a grid container.
     * @param {Object} userOptions - User-provided settings to override the defaults.
     */
    var LayoutEngine = function LayoutEngine( hostElement, userOptions ) {
        // Essential check: ensure a valid host element is provided.
        if (!hostElement || !jQuery(hostElement).length) {
            console.error("LayoutEngine: Host element is invalid or not found. Initialization aborted.");
            return;
        }
        this.hostElement = hostElement;

        // Deep merge user settings with the default configuration.
        this.currentSettings = jQuery.extend( true, {}, defaultConfiguration, userOptions);

        // Store the component's unique ID for internal reference.
        this._componentId = componentIdentifier;

        // Initialize the layout process.
        this.initLayout();
    };

    /**
     * @public
     * @property {Object} LayoutEngine.prototype - Contains all methods for the LayoutEngine.
     */
    LayoutEngine.prototype = {
        /**
         * Initializes the grid layout by setting up the DOM structure, caching elements,
         * rendering the initial grid, and attaching event listeners.
         */
        initLayout: function () {
            // Cache 'this' for use in event handler contexts.
            var instanceRef = this;

            // Wrap the host element's direct children within a new grid container div.
            jQuery(this.hostElement).wrapInner('<div class="adaptive-grid-wrapper" />');

            // Populate internal references to key DOM elements.
            this.gatherDomElements();

            // Perform the initial render of the grid based on current conditions.
            this.orchestrateLayoutRender();

            // Attach a namespaced event listener to the window for responsiveness on resize.
            // Using a namespace allows for easier removal of specific event handlers later.
            jQuery(globalScope).on('resize.tileGridEngine', function() {
                // Throttle resize events if performance is a concern (Type III - potential future addition).
                instanceRef.orchestrateLayoutRender();
            });

            // Custom event for external triggers to force a layout recalculation.
            jQuery(this.hostElement).on('layout:recalculate.tileGridEngine', function() {
                instanceRef.orchestrateLayoutRender();
            });

            // Custom event for integrating new content items into the grid.
            jQuery(this.hostElement).on('content:newItems.tileGridEngine', function() {
                instanceRef.incorporateNewContent();
            });
            
            // Ensure the host element is visible if it was initially hidden by CSS.
            if (jQuery(this.hostElement).css('visibility') === 'hidden') {
                jQuery(this.hostElement).css('visibility', 'visible');
            }
        },

        /**
         * Incorporates new content items from the host element into the grid.
         * Identifies items not yet inside the grid wrapper, adds them to the cache,
         * and triggers a re-arrangement.
         */
        incorporateNewContent: function() {
            var instanceRef = this;
            // Find direct children of the host element that are not the grid wrapper.
            var incomingItems = jQuery(this.hostElement).children().not('.adaptive-grid-wrapper');

            // Add each new item to the cached list of content tiles.
            incomingItems.each(function() {
                instanceRef.domRefs.contentTiles.push(this);
            });

            // Re-establish grid structure using the last known column count,
            // which will also trigger item distribution.
            if (this._activeColumnCount) { // Guard for initial state
                instanceRef.establishGridStructure(instanceRef._activeColumnCount);
            } else {
                instanceRef.orchestrateLayoutRender(); // Fallback if activeColumnCount not set
            }
            
            // Detach the newly processed items from the host to prevent duplication,
            // as they have now been moved inside the grid wrapper.
            incomingItems.detach();
        },

        /**
         * Gathers and stores references to essential DOM elements for efficient access.
         * This prevents repeated jQuery selections.
         */
        gatherDomElements: function() {
            var $hostContainer = jQuery(this.hostElement),
                $gridWrapper = $hostContainer.children('.adaptive-grid-wrapper'),
                $contentTiles = $gridWrapper.children(); // Initial set of articles

            this.domRefs = {
                host: $hostContainer,
                wrapper: $gridWrapper,
                contentTiles: $contentTiles
            };
        },

        /**
         * Determines the appropriate grid configuration (column count) based on the
         * current container width and the defined breakpoint scheme. Then, it triggers
         * the grid structure establishment or tile resizing.
         */
        orchestrateLayoutRender: function() {
            var $gridWrapper = this.domRefs.wrapper,
                wrapperDimension = $gridWrapper.width(),
                layoutClassIdentifier,
                determinedColumnCount;

            // Iterate through the predefined breakpoints to find the most suitable column configuration.
            // Using a traditional for loop for slight variation from jQuery.each.
            for (let i = 0; i < this.currentSettings.layoutBreakpoints.length; i++) {
                let breakpoint = this.currentSettings.layoutBreakpoints[i];
                
                // If the current wrapper width meets or exceeds the breakpoint's minimum width.
                if ( breakpoint.minimumWidth <= wrapperDimension ) {
                    determinedColumnCount = breakpoint.columnCount;
                    layoutClassIdentifier = 'cols-' + determinedColumnCount;

                    // Check if the wrapper already has the correct column class.
                    if ( !$gridWrapper.hasClass(layoutClassIdentifier) ) {
                        // Remove any existing column-specific classes (e.g., 'cols-2', 'cols-3').
                        $gridWrapper
                            .removeClass(function(idx, currentClass) {
                                // Regex to find and remove classes starting with 'cols-'.
                                return (currentClass.match(/(^|\s)cols-\S+/g) || []).join(' ');
                            })
                            .addClass('adaptive-grid-wrapper') // Ensure the base wrapper class is present.
                            .addClass(layoutClassIdentifier); // Add the new column class.

                        // Update the internal record of the active column count.
                        this._activeColumnCount = determinedColumnCount;

                        // Rebuild the grid's column structure and redistribute content.
                        this.establishGridStructure(determinedColumnCount);
                    } else {
                        // If the column count hasn't changed, only re-adjust tile dimensions if needed.
                        this.adjustTileDimensions();
                    }

                    // Once a matching breakpoint is found, no need to check further.
                    break;
                }
            }
        },

        /**
         * Builds the physical column divs within the grid wrapper.
         * It first removes existing columns, then generates new ones based on the `layoutDivisions` count.
         * @param {number} layoutDivisions - The desired number of columns for the grid.
         */
        establishGridStructure: function(layoutDivisions) {
            var $gridWrapper = this.domRefs.wrapper;

            // Remove all previously generated column elements to start fresh.
            $gridWrapper.children('.grid-division').remove();

            // Generate and append new column divs to the wrapper.
            for ( var i = 1; i <= layoutDivisions; i++ ) {
                // Using template literals for cleaner string construction.
                let columnHtml = `<div class="grid-division grid-division-${i}"></div>`;
                $gridWrapper.append(columnHtml);
            }

            // Initialize a 'current-height' data attribute for each new column to track its occupancy.
            $gridWrapper.children('.grid-division').data('current-height', 0);

            // With the columns established, proceed to distribute the content tiles.
            this.distributeItemsIntoColumns(layoutDivisions);
        },

        /**
         * Distributes all cached content tiles into the columns, aiming for a balanced height
         * across all columns (Pinterest-like layout).
         * @param {number} totalColumns - The total number of columns currently in the grid.
         */
        distributeItemsIntoColumns: function(totalColumns) {
            var allContentTiles = this.domRefs.contentTiles,
                $processedTile,
                $gridWrapper = this.domRefs.wrapper,
                columnElements = $gridWrapper.children('.grid-division'),
                currentColumnHeight,
                instanceRef = this;

            // Temporarily remove special display mode classes during layout calculation
            // to avoid rendering glitches or incorrect measurements.
            if ( this.currentSettings.displayMode ) {
                $gridWrapper
                    .removeClass('vertical-stack')
                    .removeClass('urban-layout');
            }

            // If 'alignRightInitially' is enabled, artificially lower the last column's height
            // to make it the first target for tile placement.
            if ( this.currentSettings.alignRightInitially ) {
                columnElements.filter('.grid-division-' + totalColumns).data('current-height', -1);
            }

            // Create a mutable array to track current heights of all columns.
            // This simplifies finding the shortest column in each iteration.
            let columnHeightsTracker = Array.from(columnElements).map(col => jQuery(col).data('current-height') || 0);

            // Iterate through each content tile to determine its optimal placement.
            jQuery.each(allContentTiles, function(index) {
                $processedTile = jQuery(this);

                // Find the column with the minimum height from the tracker array.
                let minHeight = Infinity;
                let minHeightIndex = 0;
                for (let k = 0; k < columnHeightsTracker.length; k++) {
                    if (columnHeightsTracker[k] < minHeight) {
                        minHeight = columnHeightsTracker[k];
                        minHeightIndex = k;
                    }
                }
                // Select the actual DOM element for the target column.
                let $targetColumn = jQuery(columnElements[minHeightIndex]);

                // Append the current tile to the identified shortest column.
                $targetColumn.append($processedTile);

                // Apply height quantization if enabled.
                if (instanceRef.currentSettings.heightQuantizationFactor > 1) {
                    instanceRef.normalizeTileHeight($processedTile);
                }
                
                // If a transition duration is set, apply it to the tile for smooth visual updates.
                if (instanceRef.currentSettings.transitionDuration > 0) {
                    $processedTile.css('transition', `top ${instanceRef.currentSettings.transitionDuration}ms ease, left ${instanceRef.currentSettings.transitionDuration}ms ease`);
                }

                // Recalculate and update the stored height for the column that just received a tile.
                currentColumnHeight = $targetColumn.outerHeight(true);
                $targetColumn.data('current-height', currentColumnHeight);
                columnHeightsTracker[minHeightIndex] = currentColumnHeight; // Update the tracker array.

                // After all tiles have been processed and placed.
                if ( index + 1 === allContentTiles.length ) {
                    // Re-apply special display mode classes if configured.
                    if ( instanceRef.currentSettings.displayMode ) {
                        if ( instanceRef.currentSettings.displayMode === 'vertical-stack' ) {
                            $gridWrapper.addClass('vertical-stack');
                        } else if ( instanceRef.currentSettings.displayMode === 'urban-layout' ) {
                            $gridWrapper.addClass('urban-layout');
                        }
                    }
                }
            });
        },

        /**
         * Adjusts the height of a single content tile to be a multiple of the
         * `heightQuantizationFactor`. This helps create a more uniform grid appearance.
         * @param {jQuery} $tileElement - The jQuery object representing the content tile.
         */
        normalizeTileHeight: function($tileElement) {
            // Clear any previous inline height styles to get the natural height.
            $tileElement.css('height', '');

            var sizingFactor = this.currentSettings.heightQuantizationFactor;
            // Guard against invalid sizing factor.
            if (sizingFactor <= 0) {
                return;
            }

            var rawHeight = $tileElement.height(),
                heightDiscrepancy = rawHeight % sizingFactor;

            // If there's a remainder, adjust the height upwards to the next multiple.
            if ( heightDiscrepancy > 0 ) {
                $tileElement.height(rawHeight + sizingFactor - heightDiscrepancy);
            }
        },

        /**
         * Iterates through all cached content tiles and reapplies height normalization.
         * This is useful when only tile dimensions need to be updated without a full grid rebuild.
         */
        adjustTileDimensions: function() {
            var instanceRef = this;

            // Loop through each content tile and apply the height normalization.
            jQuery.each(this.domRefs.contentTiles, function() {
                instanceRef.normalizeTileHeight(jQuery(this));
            });
        },

        /**
         * Public method to clean up the grid instance.
         * Removes event listeners, unwraps the DOM, and clears associated data.
         */
        destroy: function() {
            // Remove all namespaced event listeners attached to the window.
            jQuery(globalScope).off('.tileGridEngine');
            // Remove all namespaced event listeners attached to the host element.
            jQuery(this.hostElement).off('.tileGridEngine');
            
            // Restore the original DOM structure by unwrapping the content from the grid wrapper.
            jQuery(this.hostElement).find('.adaptive-grid-wrapper').children().unwrap();
            
            // Remove the instance data associated with the host element.
            jQuery.removeData(this.hostElement, 'componentInstance_' + componentIdentifier);
            
            console.log(`TileGridEngine instance on ${this.hostElement.tagName} destroyed.`);
        }
    };

    /**
     * @global
     * @function jQuery.fn.tileGridEngine
     * @description A jQuery plugin wrapper that allows instantiation and method calls.
     *              Prevents multiple initializations on the same element.
     * @param {string|Object} operationOrOptions - A string for method calls (e.g., 'destroy')
     *                                             or an object for initialization options.
     * @param {...any} args - Additional arguments for method calls.
     * @returns {jQuery} The jQuery object for chaining.
     */
    jQuery.fn[componentIdentifier] = function ( operationOrOptions ) {
        // Capture additional arguments for method calls.
        var args = Array.prototype.slice.call( arguments, 1 );

        return this.each(function () {
            var instanceDataKey = 'componentInstance_' + componentIdentifier;
            var existingInstance = jQuery.data(this, instanceDataKey);

            if ( typeof operationOrOptions === 'string' ) {
                // If a string is passed, it's a method call.
                if ( existingInstance && typeof existingInstance[operationOrOptions] === 'function' ) {
                    // Call the method on the existing instance.
                    existingInstance[operationOrOptions].apply(existingInstance, args);
                } else if ( !existingInstance ) {
                    console.warn(`TileGridEngine: Cannot call method "${operationOrOptions}" on element without an initialized instance.`);
                } else {
                    console.warn(`TileGridEngine: Method "${operationOrOptions}" does not exist on this component instance.`);
                }
            } else if ( !existingInstance ) {
                // If no instance exists, create a new one and store it in jQuery's data cache.
                jQuery.data(this, instanceDataKey, new LayoutEngine( this, operationOrOptions ));
            }
            // If an instance already exists and options are passed (not a method call),
            // we intentionally do nothing to prevent re-initialization with new options.
            // A 'refresh' or 'update' method would be needed for dynamic option changes.
        });
    };

}(jQuery, window));