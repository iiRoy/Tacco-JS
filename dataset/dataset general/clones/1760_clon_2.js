(function (_jq) {
    // Default configuration settings for the plugin
    var baseOptions = {
        displayRowCount: 10
    };

    // Global constant for scrollbar thickness, and a placeholder for static panel width
    var barThickness = 15, staticPanelWidth;

    /**
     * Attaches scrollable header/footer functionality to a table.
     * @param {Object} pluginConfig - User-defined settings to override defaults.
     */
    _jq.fn.enableFixedHeaderScrolling = function(pluginConfig) {
        // Merge user settings with base configuration
        pluginConfig = _jq.extend(baseOptions, pluginConfig);

        // Reference to the main table element
        var targetGrid = this;

        // Prepare the grid structure by wrapping it with necessary elements
        setupGridLayout(targetGrid, pluginConfig);

        // Adjust column widths to align header, body, and footer
        adjustColumnWidths(targetGrid);

        // Define a function to handle responsive adjustments on window resize
        var dynamicResizer = function () { handleResizeAdjustments(targetGrid); };
        // Check if Lodash and its debounce function are available
        var isDebounceAvailable = typeof _ == 'function' && typeof _.debounce == 'function';
        // If debounce is available, use it to optimize resize events
        if (isDebounceAvailable) {
            dynamicResizer = _.debounce(dynamicResizer, 150);
        }
        // Attach the (potentially debounced) resize handler to the window
        _jq(window).on('resize', dynamicResizer);
    };

    /**
     * Wraps the target table with necessary header, footer, and scrollable container elements.
     * @param {Object} targetGrid - The jQuery object representing the target table.
     * @param {Object} layoutConfig - Configuration options for layout.
     */
    function setupGridLayout(targetGrid, layoutConfig) {
        // Retrieve existing CSS classes and bottom margin from the original table
        var initialClasses = targetGrid.attr('class');
        var initialBottomMargin = targetGrid.css('margin-bottom');
        // Temporarily set the original table's bottom margin to zero
        targetGrid.css('margin-bottom', 0);

        // Calculate the height required for the scrollable body
        var singleRowHeight = targetGrid.find('tbody tr:first').outerHeight();
        var totalVisibleHeight = singleRowHeight * layoutConfig.displayRowCount;

        // Construct HTML for fixed header, footer, and scrollable body wrapper
        var topPanelElement = _jq('<table style="table-layout:fixed;width:auto;margin-bottom:0;" class="fixed-top-grid ' + initialClasses + '"><thead><tr><td></td></tr></thead></table>');
        var bottomPanelElement = _jq('<table style="table-layout:fixed;width:auto;margin-bottom:' + initialBottomMargin + ';" class="fixed-bottom-grid ' + initialClasses + '"><tfoot><tr><td></td></tr></tfoot></table>');
        var scrollContainerHtml = '<div class="scrollable-body-wrapper" style="height:' + totalVisibleHeight + 'px;overflow-y:auto"></div>';

        // Insert the new elements around the original table
        targetGrid.before(topPanelElement).before(scrollContainerHtml).after(bottomPanelElement);
    }

    /**
     * Aligns columns across the fixed header, scrollable body, and fixed footer.
     * @param {Object} sourceGrid - The jQuery object representing the original table.
     */
    function adjustColumnWidths(sourceGrid) {
        sourceGrid.each(function (itemIndex) {
            // Retrieve relevant elements for the current table
            var _jqDataSource = _jq(this);
            var _jqHeaderPanel = _jq('table.fixed-top-grid').eq(itemIndex);
            var _jqFooterPanel = _jq('table.fixed-bottom-grid').eq(itemIndex);

            // Move the main table's data into its scrollable wrapper
            var _jqScrollWrapper = _jq('div.scrollable-body-wrapper').eq(itemIndex);
            _jqScrollWrapper.prepend(_jqDataSource);
            var scrollElementDom = _jqScrollWrapper[0];

            // Determine if horizontal scrolling is necessary
            var needsHorizontalScroll = scrollElementDom.clientWidth < scrollElementDom.scrollWidth;
            _jqScrollWrapper.outerWidth(staticPanelWidth + barThickness + 2); // Adjust wrapper width

            if (needsHorizontalScroll) {
                // If horizontal scroll is present, adjust widths for fixed elements
                var sourceGridWidth = _jqDataSource.outerWidth();
                _jqHeaderPanel.width(sourceGridWidth);
                _jqFooterPanel.width(sourceGridWidth);
                _jqScrollWrapper.outerWidth(scrollElementDom.clientWidth);
                var wrapperWidth = _jqScrollWrapper.outerWidth();

                var innerContentWidth = wrapperWidth - barThickness;

                // Create and wrap fixed header with its own scroll container
                var _jqHeaderScroller = _jq('<div style="overflow:hidden;width:' + innerContentWidth + 'px" class="header-viewport-container"></div>');
                _jqHeaderPanel.wrap(_jqHeaderScroller);

                // Create and wrap fixed footer with its own scroll container
                var _jqFooterScroller = _jq('<div style="overflow:hidden;width:' + innerContentWidth + 'px" class="footer-viewport-container"></div>');
                _jqFooterPanel.wrap(_jqFooterScroller);

                // Synchronize horizontal scrolling between the body and fixed elements
                _jqScrollWrapper.on('scroll', function() {
                    _jq('div.header-viewport-container').scrollLeft(_jq(this).scrollLeft());
                    _jq('div.footer-viewport-container').scrollLeft(_jq(this).scrollLeft());
                });
            }

            // Explicitly set column widths for the main data table
            _jqDataSource.find('thead tr:first th, tbody tr:first td').each(function () {
                _jq(this).outerWidth(_jq(this).outerWidth());
            });

            // Clone and insert header data into the fixed header table
            _jqHeaderPanel.find('thead').replaceWith(_jqDataSource.children('caption, thead').clone());

            // Explicitly set column widths for the main data table's footer
            _jqDataSource.find('tfoot tr:first td').each(function () {
                _jq(this).outerWidth(_jq(this).outerWidth());
            });

            // Clone and insert footer data into the fixed footer table
            _jqFooterPanel.find('tfoot').replaceWith(_jqDataSource.children('tfoot').clone());

            // Hide the original table's caption, header, and footer to prevent duplication
            _jqDataSource.children('caption, thead, tfoot').hide();
        });
    }

    /**
     * Adjusts column widths on window resize to maintain alignment.
     * @param {Object} mainGrid - The jQuery object representing the main table.
     */
    function handleResizeAdjustments(mainGrid) {
        mainGrid.each(function (gridPosition) {
            var _jqMainDataGrid = _jq(this);
            var _jqTopFixedGrid = _jq('table.fixed-top-grid').eq(gridPosition);
            var _jqBottomFixedGrid = _jq('table.fixed-bottom-grid').eq(gridPosition);

            // Temporarily reveal the inner table's header and footer for accurate width calculation
            _jqMainDataGrid.children('thead, tfoot').show();

            var scrollingViewport = _jq('div.scrollable-body-wrapper')[0];
            var horizontalOverflowPresent = scrollingViewport.clientWidth < scrollingViewport.scrollWidth;
            if (horizontalOverflowPresent) {
                // Adjust scroll container widths if horizontal overflow is present
                var viewportWidth = _jq('div.scrollable-body-wrapper').outerWidth();
                _jq('div.header-viewport-container').outerWidth(viewportWidth - barThickness);
                _jq('div.footer-viewport-container').outerWidth(viewportWidth - barThickness);
            }

            // Force column widths for header cells based on the main table's header
            var _jqHeaderCells = _jqTopFixedGrid.find('thead tr:first th');
            _jqMainDataGrid.find('thead tr:first th').each(function (columnIndex) {
                _jqHeaderCells.eq(columnIndex).outerWidth(_jq(this).outerWidth());
            });

            // Force column widths for footer cells based on the main table's footer
            var _jqFooterCells = _jqBottomFixedGrid.find('tfoot tr:first td');
            _jqMainDataGrid.find('tfoot tr:first td').each(function (columnIndex) {
                _jqFooterCells.eq(columnIndex).outerWidth(_jq(this).outerWidth());
            });

            // Re-hide the inner table's header and footer after adjustments
            _jqMainDataGrid.children('thead, tfoot').hide();
        });
    }
})(jQuery);