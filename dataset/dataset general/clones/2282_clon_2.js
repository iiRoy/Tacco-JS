(function(jq) {

    "use strict"; // Enforce strict JavaScript parsing rules for cleaner code.

    /**
     * Extends jQuery's prototype to add a new plugin.
     * This plugin manages responsive grid layouts, allowing them to
     * split into fixed and scrollable sections based on viewport width.
     */
    jq.fn.extend({

        miniGrids: function(config) {
            // Define standard configuration settings for the plugin.
            const standardSettings = {
                collapseWidth: 850, // Pixel width at which the grid should segment.
                gridBaseClass: 'mini-grids', // Base class applied to the main grid.
                gridContainerClass: 'mini-grids-wrap', // Wrapper for the entire grid system.
                scrollableAreaClass: 'mini-grids-scroll', // Class for the scrollable part of the grid.
                fixedColumnClass: 'mini-grids-fixed' // Class for the fixed (pinned) part of the grid.
            };

            // Merge user-provided configuration with the standard settings.
            config = jq.extend(standardSettings, config);

            // Iterate over each selected element to apply the plugin logic.
            return this.each(function() {
                // Cache the current grid element for efficiency.
                const sourceGrid = jq(this);

                // Apply the base class to the grid.
                sourceGrid.addClass(config.gridBaseClass);

                // Initialize the grid's state based on current window size.
                refreshGrids(sourceGrid);

                // Attach a resize event handler to dynamically adjust the grid.
                jq(window).on("resize", function() {
                    // Re-evaluate and update the grid's layout upon window resizing.
                    refreshGrids(sourceGrid);
                });
            });


            /**
             * Determines whether to segment or re-integrate the grid
             * based on the current window width.
             * @param {jQuery} sourceGrid - The jQuery object representing the grid.
             */
            function refreshGrids(sourceGrid) {
                // Check if the current window width is below the collapse threshold.
                if ((jq(window).width() < config.collapseWidth)) {
                    segmentGrid(sourceGrid); // Segment the grid into fixed and scrollable parts.
                }
                // Check if the current window width is above the collapse threshold.
                else if ((jq(window).width() > config.collapseWidth)) {
                    revertSegmentation(sourceGrid); // Undo the segmentation and restore the original grid.
                }
            }


            /**
             * Segments a grid into a fixed column and a scrollable main body
             * if it hasn't been segmented already.
             * @param {jQuery} sourceGrid - The jQuery object representing the grid to segment.
             */
            function segmentGrid(sourceGrid) {
                // Proceed only if the grid is not already segmented.
                if (!sourceGrid.parent().hasClass(config.scrollableAreaClass)) {
                    // Wrap the original grid in a main container.
                    sourceGrid.wrap('<div class="' + config.gridContainerClass + '" />');

                    // Create a clone of the original grid to serve as the fixed column.
                    const fixedGrid = sourceGrid.clone();

                    // Append the cloned grid (fixed column) to the main container.
                    sourceGrid.closest('.' + config.gridContainerClass).append(fixedGrid);

                    // Wrap the original grid in a scrollable area.
                    sourceGrid.wrap('<div class="' + config.scrollableAreaClass + '" />');

                    // Wrap the cloned grid in a fixed column container.
                    fixedGrid.wrap('<div class="' + config.fixedColumnClass + '" />');
                }
            }


            /**
             * Reverts the grid segmentation, restoring the grid to its original single-table state.
             * @param {jQuery} sourceGrid - The jQuery object representing the segmented grid.
             */
            function revertSegmentation(sourceGrid) {
                // Proceed only if the grid is currently segmented.
                if (sourceGrid.parent().hasClass(config.scrollableAreaClass)) {
                    // Remove the fixed column element.
                    jq('.' + config.fixedColumnClass).remove();

                    // Unwrap the scrollable container from the original grid.
                    sourceGrid.unwrap();

                    // Unwrap the main grid container from the original grid.
                    sourceGrid.unwrap();
                }
            }
        }
    });
})(jQuery);