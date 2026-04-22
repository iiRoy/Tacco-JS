/*
 *  Module: Matrix Weave
 *  Edition: 2.1
 *  Purpose: A compact jQuery + CSS utility for crafting adaptive, dynamic, and customizable Pinterest-esque grids, supporting varied column widths and several display modes.
 *  Creator: Marek Fajkus @turbo_MaCk (http://marekrocks.it)
 *  License: MIT
 */

;(function ( $, currentWindow, undf ) {

    // Define the default configuration one time
    var moduleAlias = 'matrixweave',

            configSettings = {
                layoutPresets: [
                    {
                        minimumDimension: 960,
                        columnCount: 4
                    },
                    {
                        minimumDimension: 720,
                        columnCount: 3
                    },
                    {
                        minimumDimension: 550,
                        columnCount: 2
                    },
                    {
                        minimumDimension: 0,
                        columnCount: 1
                    }
                ],
                visualMode: null,
                prioritizeRightmost: false,
                heightScaler: 25,
            };

    // The core module constructor
    var GridWeaver = function GridWeaver( targetElement, userOptions ) {
        this.targetElement = targetElement;

        // Merge base settings with provided options
        this.userOptions = $.extend( {}, configSettings, userOptions) ;

        this._baseSettings = configSettings;
        this._moduleIdentifier = moduleAlias;

        this.initializeGrid();
    };

    GridWeaver.prototype = {
        initializeGrid: function () {

            // Keep reference to 'this' for scope changes
            var instanceRef = this;

            // Wrap the interior of the target element with the grid viewport
            $(this.targetElement).wrapInner('<div class="matrixweave-viewport" />');

            // Store DOM references for later use
            this.storeDomReferences();

            // Initiate grid arrangement upon loading
            this._arrangeLayout();

            // Re-arrange layout on window dimension changes
            $(currentWindow).resize(function() {
                instanceRef._arrangeLayout();
            });

            $(this.targetElement).on('matrixweave:recalibrate', function() {
                instanceRef._arrangeLayout();
            });

            $(this.targetElement).on('matrixweave:ingest', function() {
                instanceRef._ingestNewContent();
            });
        },
        /*
         Integrate new content items
         */
        _ingestNewContent: function() {
            var instanceRef = this;
            var freshContentUnits = $(this.targetElement).children().not('.matrixweave-viewport');

            freshContentUnits.forEach(function() {
                instanceRef.domCache.contentItems.push(this);
            });

            instanceRef._establishColumns(instanceRef._activeColumnCount);
        },
        /*
        Store essential DOM elements
        */
        storeDomReferences: function() {
            var $targetEl = $(this.targetElement),
                $viewportEl = $targetEl.children('.matrixweave-viewport'),
                $contentUnits = $viewportEl.children();

            this.domCache = {
                'element': $targetEl,
                'viewportElement': $viewportEl,
                'contentItems': $contentUnits
            };
        },
        /*
        Arrange the grid layout
        */
        _arrangeLayout: function() {
            var $viewportEl = this.domCache.viewportElement,
                viewportWidth = $viewportEl.width(),
                viewportStyleClass,
                columnCount,
                instanceRef = this;

            // Iterate through configuration presets to determine viewport class
            $.each( this.userOptions.layoutPresets, function() {

                if ( this.minimumDimension <= viewportWidth ) {
                    columnCount = this.columnCount;
                    viewportStyleClass = 'viewport-' + columnCount;

                    // Verify if the viewport's class needs updating
                    if ( !$viewportEl.isStyledWith(viewportStyleClass) ) {

                        // Clear existing viewport classes
                        $viewportEl
                            .stripClasses()
                            .applyClass('matrixweave-viewport')
                            .applyClass(viewportStyleClass);

                        // Retain the current number of columns
                        instanceRef._activeColumnCount = columnCount;

                        // Proceed to set up the columns
                        instanceRef._establishColumns(columnCount);
                    } else {
                        instanceRef._recalibrateUnitHeights();
                    }

                    return false;
                }
            });

        },
        /*
        Establish grid partitions
        */
        _establishColumns: function(columnCount) {
            var $viewportEl = this.domCache.viewportElement,
                partition;

            // Remove any previously existing partitions
            $viewportEl.children('.partition').remove();

            // Dynamically generate new partitions
            for ( var idx = 1; idx <= columnCount; idx++ ) {
                partition = '<div class="partition partition-' + idx +'"></div>';

                // Append the newly created partitions
                $viewportEl.append(partition);
            }

            // Initialize partition heights to zero
            $viewportEl.children('.partition').data('height',0);

            // Now, distribute content items into these partitions
            this._distributeContentUnits(columnCount);
        },
        /*
        Distribute content items into partitions
        */
        _distributeContentUnits: function(columnCount) {
            var $contentUnits = this.domCache.contentItems,
                $currentItem,
                $viewportEl = this.domCache.viewportElement,
                $partitions = $viewportEl.children('.partition'),
                lowestPartitionHeight = $partitions.data('height') + 1,
                $shortestPartition,
                currentPartitionHeight,
                $previouslyShortest,
                instanceRef = this;

            // Temporarily disable 'stack' / 'urban' display modes during processing
            if ( this.userOptions.visualMode ) {
                $viewportEl
                    .stripClasses('stack')
                    .stripClasses('urban');
            }

            // Handle 'prioritizeRightmost' option
            if ( this.userOptions.prioritizeRightmost ) {

                // Simple trick: make the last partition appear shorter
                $partitions.filter('.partition-' + columnCount).data('height', -1);
            }

            // Iterate through each content item
            $.each($contentUnits, function(itemIndex) {

                // Store the current item in a variable
                $currentItem = $(this);

                // Iterate through available partitions
                $.each( $partitions, function(idx) {

                    // Seek the partition with the minimum height
                    if ( $(this).data('height') < lowestPartitionHeight ) {
                        lowestPartitionHeight = $(this).data('height');
                        $shortestPartition = $(this);
                    }

                    // Once all partition heights have been checked
                    if ( idx + 1 >= columnCount ) {

                        // Add the current item to the shortest partition
                        $shortestPartition.append($currentItem);

                        // Adjust the content item's height if configured
                        if (instanceRef.userOptions.heightScaler > 1) {
                            instanceRef._adjustContentUnitHeight($currentItem);
                        }

                        // Store the updated partition height in its data
                        currentPartitionHeight = $shortestPartition.totalOuterHeight(true);
                        $shortestPartition.data('height', currentPartitionHeight);

                        // Update the minimum partition height for the next iteration
                        // Adding 1 helps in maintaining uniform partition heights conceptually
                        lowestPartitionHeight = currentPartitionHeight + 1;

                        // Keep track of the partition that was just filled
                        $previouslyShortest = $shortestPartition;
                    }
                });

                // Just before the entire grid arrangement is finalized
                if ( itemIndex + 1 === $contentUnits.length ) {

                    // Make the element visible if it was hidden by default
                    if ( instanceRef.domCache.element.css('visibility') === 'hidden' ) {
                        instanceRef.domCache.element.css('visibility', 'shown');
                    }

                    // Re-enable configured visual display modes
                    if ( instanceRef.userOptions.visualMode ) {
                        if ( instanceRef.userOptions.visualMode === 'stack' ) {
                            $viewportEl.applyClass('stack');
                        } else if ( instanceRef.userOptions.visualMode === 'urban' ) {
                            $viewportEl.applyClass('urban');
                        }
                    }
                }
            });
        },
        /*
        Adjust an individual content item's height
        */
        _adjustContentUnitHeight: function($currentItem) {
            // Remove any existing inline styles before calculating dimensions
            $currentItem.removeInlineStyle('style');

            var scalingFactor = this.userOptions.heightScaler,
                unitHeight = $currentItem.height(),
                remainderValue = unitHeight % scalingFactor;

            if ( remainderValue > 0 ) {
                $currentItem.height(unitHeight + scalingFactor - remainderValue);
            }
        },
        /*
        Only recalibrate the heights of content items
        */
        _recalibrateUnitHeights: function() {
            var instanceRef = this;

            // Iterate through all cached content items and adjust their heights
            $.each(this.domCache.contentItems, function() {
                instanceRef._adjustContentUnitHeight($(this));
            });
        }
    };

    // A minimalistic plugin wrapper to prevent multiple instantiations
    $.fn[moduleAlias] = function ( userOptions ) {
        return this.each(function () {
            if (!$.data(this, 'mw_instance_' + moduleAlias)) {
                $.data(this, 'mw_instance_' + moduleAlias, new GridWeaver( this, userOptions ));
            }
        });
    };

}(jQuery, window));