"use strict";

(function (jQ) {
    /**
     * @typedef {object} FixedScrollTableSettings
     * @property {number} visibleRowsCount - Defines the maximum number of table body rows to display
     *                                      in the scrollable area before vertical scrolling is enabled.
     */

    /**
     * Default configuration settings for the Fixed Scroll Table Plugin.
     * These can be overridden by user-provided options during plugin initialization.
     * @type {FixedScrollTableSettings}
     */
    const pluginConfiguration = {
        visibleRowsCount: 10 // The standard number of rows to show in the scrolling region.
    };

    /**
     * Standard pixel dimension for a scrollbar, used in layout calculations.
     * This value is an approximation and may vary slightly across different browsers or operating systems.
     * @type {number}
     */
    const defaultScrollbarDimension = 15; // Common width/height of a scrollbar.

    // --- Core Helper Utilities ---

    /**
     * Populates the static header and footer tables with cloned content from the original data table.
     * This method ensures that the fixed parts accurately reflect the original table's structure.
     * @param {jQuery} baseDataTable - The original jQuery table object being transformed.
     * @param {jQuery} headerTargetElement - The jQuery object representing the fixed header container.
     * @param {jQuery} footerTargetElement - The jQuery object representing the fixed footer container.
     */
    function transferTableParts(baseDataTable, headerTargetElement, footerTargetElement) {
        // Clone and insert the caption and thead elements into the fixed header.
        // It's crucial to remove 'id' attributes from cloned elements to prevent DOM ID conflicts.
        const headerContentClone = baseDataTable.children('caption, thead').clone(true);
        headerContentClone.find('[id]').removeAttr('id'); // Remove IDs from cloned children
        headerTargetElement.find('thead').replaceWith(headerContentClone);

        // Clone and insert the tfoot element into the fixed footer.
        const footerContentClone = baseDataTable.children('tfoot').clone(true);
        footerContentClone.find('[id]').removeAttr('id'); // Remove IDs from cloned children
        footerTargetElement.find('tfoot').replaceWith(footerContentClone);

        // After cloning, hide the original table's header, caption, and footer to avoid visual duplication.
        baseDataTable.children('caption, thead, tfoot').css('display', 'none');
    }

    /**
     * Synchronizes the column widths across the original table, fixed header, and fixed footer.
     * This function is essential for maintaining perfect column alignment, especially during resizing
     * or initial rendering.
     * @param {jQuery} sourceTableElement - The original table providing the reference widths.
     * @param {jQuery} fixedHeaderElement - The fixed header table to update.
     * @param {jQuery} fixedFooterElement - The fixed footer table to update.
     * @param {boolean} [temporarilyShowOriginal=false] - If true, temporarily makes the original
     *                                                  header/footer visible to ensure accurate
     *                                                  width calculations before hiding them again.
     */
    function synchronizeColumnDimensions(sourceTableElement, fixedHeaderElement, fixedFooterElement, temporarilyShowOriginal = false) {
        // Basic validation for required elements.
        if (!sourceTableElement || !fixedHeaderElement || !fixedFooterElement || !sourceTableElement.length) {
            console.warn("FixedScrollTablePlugin: Missing essential table elements for column synchronization.");
            return;
        }

        if (temporarilyShowOriginal) {
            // Make original header/footer parts visible but keep them out of normal document flow
            // to get accurate computed widths without affecting current layout.
            sourceTableElement.children('thead, tfoot').css({
                'visibility': 'hidden',
                'display': '' // Revert to default display to calculate width correctly
            });
        }

        // Synchronize header column widths (TH elements)
        const originalHeaderCells = sourceTableElement.find('thead tr:first th');
        const targetHeaderCells = fixedHeaderElement.find('thead tr:first th');
        if (originalHeaderCells.length === targetHeaderCells.length) {
            originalHeaderCells.each(function (idx) {
                targetHeaderCells.eq(idx).outerWidth(jQ(this).outerWidth());
            });
        } else {
            console.warn("FixedScrollTablePlugin: Header cell count mismatch, alignment may be imperfect.", sourceTableElement);
            // Fallback for headers with mixed TH/TD or different structures.
            // Attempt to match TDs in header if THs are not found or mismatch.
            const originalHeaderTdCells = sourceTableElement.find('thead tr:first td');
            const targetHeaderTdCells = fixedHeaderElement.find('thead tr:first td');
            if (originalHeaderTdCells.length === targetHeaderTdCells.length) {
                originalHeaderTdCells.each(function (idx) {
                    targetHeaderTdCells.eq(idx).outerWidth(jQ(this).outerWidth());
                });
            }
        }


        // Synchronize footer column widths (TD elements)
        const originalFooterCells = sourceTableElement.find('tfoot tr:first td');
        const targetFooterCells = fixedFooterElement.find('tfoot tr:first td');
        if (originalFooterCells.length === targetFooterCells.length) {
            originalFooterCells.each(function (idx) {
                targetFooterCells.eq(idx).outerWidth(jQ(this).outerWidth());
            });
        } else {
            console.warn("FixedScrollTablePlugin: Footer cell count mismatch, alignment may be imperfect.", sourceTableElement);
        }

        if (temporarilyShowOriginal) {
            // Revert visibility and display state after calculations are complete.
            sourceTableElement.children('thead, tfoot').css({
                'visibility': '', // Clear visibility override
                'display': 'none' // Hide them again
            });
        }
    }

    /**
     * Manages the layout adjustments required when the main table body has horizontal scrolling.
     * This includes wrapping the fixed header/footer in their own scroll containers and
     * synchronizing their scroll positions with the main body's horizontal scroll.
     * @param {jQuery} currentTable - The original data table element.
     * @param {jQuery} scrollableBodyWrapper - The scrollable div containing the original table.
     * @param {jQuery} headerTableContainer - The fixed header table element.
     * @param {jQuery} footerTableContainer - The fixed footer table element.
     * @param {boolean} horizontalScrollRequired - True if horizontal scrolling is currently active/needed.
     */
    function manageHorizontalScrolling(currentTable, scrollableBodyWrapper, headerTableContainer, footerTableContainer, horizontalScrollRequired) {
        const scrollableDomElement = scrollableBodyWrapper[0];
        if (!scrollableDomElement) {
            console.warn("FixedScrollTablePlugin: Scrollable DOM element not found for horizontal scroll management.");
            return;
        }

        const actualTableContentWidth = currentTable.outerWidth();
        const wrapperDisplayWidth = scrollableBodyWrapper.outerWidth(); // The visible width of the scroll wrapper

        // Ensure fixed header/footer tables match the content width (which might be wider than wrapper)
        headerTableContainer.outerWidth(actualTableContentWidth);
        footerTableContainer.outerWidth(actualTableContentWidth);

        if (horizontalScrollRequired) {
            let headerScrollWrapper = scrollableBodyWrapper.data('headerScrollWrapper');
            let footerScrollWrapper = scrollableBodyWrapper.data('footerScrollWrapper');

            const innerViewportWidth = wrapperDisplayWidth - defaultScrollbarDimension;

            if (!headerScrollWrapper || !headerScrollWrapper.length) {
                // If scroll wrappers don't exist, create them for the fixed header/footer.
                headerScrollWrapper = jQ('<div>', {
                    'class': 'fixed-header-scroll-area',
                    'style': `overflow:hidden;width:${innerViewportWidth}px;`
                });
                headerTableContainer.wrap(headerScrollWrapper);
                scrollableBodyWrapper.data('headerScrollWrapper', headerTableContainer.parent());
            } else {
                // If they exist, just update their width.
                headerScrollWrapper.outerWidth(innerViewportWidth);
            }

            if (!footerScrollWrapper || !footerScrollWrapper.length) {
                footerScrollWrapper = jQ('<div>', {
                    'class': 'fixed-footer-scroll-area',
                    'style': `overflow:hidden;width:${innerViewportWidth}px;`
                });
                footerTableContainer.wrap(footerScrollWrapper);
                scrollableBodyWrapper.data('footerScrollWrapper', footerTableContainer.parent());
            } else {
                footerScrollWrapper.outerWidth(innerViewportWidth);
            }

            // Bind (or re-bind) the scroll event listener to synchronize horizontal scrolling.
            // Using a namespaced event to prevent multiple bindings.
            scrollableBodyWrapper.off('scroll.fixedTableSync').on('scroll.fixedTableSync', function() {
                const currentScrollLeft = jQ(this).scrollLeft();
                jQ(this).data('headerScrollWrapper').scrollLeft(currentScrollLeft);
                jQ(this).data('footerScrollWrapper').scrollLeft(currentScrollLeft);
            });
        } else {
            // If horizontal scrolling is no longer required, remove the scroll wrappers.
            const headerScrollWrapper = scrollableBodyWrapper.data('headerScrollWrapper');
            const footerScrollWrapper = scrollableBodyWrapper.data('footerScrollWrapper');

            if (headerScrollWrapper && headerScrollWrapper.length) {
                headerTableContainer.unwrap(); // Remove the wrapper div
                scrollableBodyWrapper.removeData('headerScrollWrapper');
            }
            if (footerScrollWrapper && footerScrollWrapper.length) {
                footerTableContainer.unwrap(); // Remove the wrapper div
                scrollableBodyWrapper.removeData('footerScrollWrapper');
            }
            scrollableBodyWrapper.off('scroll.fixedTableSync'); // Remove the event listener
        }
    }

    /**
     * Initializes the entire DOM structure for a fixed-header/footer scrollable table.
     * This involves creating new wrapper elements and moving the original table content.
     * References to all new elements are stored on the original table using jQuery's `.data()` method.
     * @param {jQuery} originalTableElement - The jQuery object representing the original HTML table.
     * @param {FixedScrollTableSettings} currentEffectiveSettings - The merged settings for this instance.
     */
    function setupTableStructure(originalTableElement, currentEffectiveSettings) {
        // Validation: Ensure the target is indeed a table.
        if (!originalTableElement.is('table')) {
            console.warn("FixedScrollTablePlugin: Skipping initialization, element is not a table:", originalTableElement);
            return;
        }

        const existingClasses = originalTableElement.attr('class') || '';
        const initialBottomMargin = originalTableElement.css('margin-bottom');
        originalTableElement.css('margin-bottom', '0px'); // Reset original table's margin for consistent layout.

        // Calculate the height for the scrollable table body.
        const firstRowInBody = originalTableElement.find('tbody tr:first');
        if (firstRowInBody.length === 0) {
            console.warn("FixedScrollTablePlugin: Table has no tbody rows. Cannot determine scrollable height.", originalTableElement);
            return;
        }
        const singleRowHeightPixels = firstRowInBody.outerHeight();
        const calculatedScrollAreaHeight = singleRowHeightPixels * currentEffectiveSettings.visibleRowsCount;

        // Construct the fixed header table.
        const fixedHeaderTable = jQ('<table>', {
            'class': `plugin-fixed-header-table ${existingClasses}`,
            'style': 'table-layout:fixed;width:auto;margin-bottom:0;',
            html: '<thead><tr><th></th></tr></thead>' // Initial placeholder for thead content.
        });

        // Construct the fixed footer table.
        const fixedFooterTable = jQ('<table>', {
            'class': `plugin-fixed-footer-table ${existingClasses}`,
            'style': `table-layout:fixed;width:auto;margin-bottom:${initialBottomMargin};`,
            html: '<tfoot><tr><td></td></tr></tfoot>' // Initial placeholder for tfoot content.
        });

        // Construct the scrollable wrapper div for the main table body.
        const scrollableBodyDiv = jQ('<div>', {
            'class': 'plugin-scrollable-body-wrapper',
            'style': `height:${calculatedScrollAreaHeight}px;overflow-y:auto;`
        });

        // Insert the new structural elements relative to the original table.
        fixedHeaderTable.insertBefore(originalTableElement);
        scrollableBodyDiv.insertBefore(originalTableElement);
        fixedFooterTable.insertAfter(originalTableElement);

        // Move the original table into its new scrollable container.
        scrollableBodyDiv.append(originalTableElement);

        // Store references to the newly created elements on the original table element.
        // This allows easy retrieval later without fragile DOM traversal.
        originalTableElement.data('fixedHeaderRef', fixedHeaderTable);
        originalTableElement.data('fixedFooterRef', fixedFooterTable);
        originalTableElement.data('scrollBodyRef', scrollableBodyDiv);

        // Transfer the actual header/footer content.
        transferTableParts(originalTableElement, fixedHeaderTable, fixedFooterTable);

        // Perform initial column width synchronization to align columns.
        synchronizeColumnDimensions(originalTableElement, fixedHeaderTable, fixedFooterTable, true);

        // Check and manage horizontal scrolling if present.
        const scrollElementNative = scrollableBodyDiv[0];
        const needsHorizontalScroll = scrollElementNative.scrollWidth > scrollElementNative.clientWidth;
        manageHorizontalScrolling(originalTableElement, scrollableBodyDiv, fixedHeaderTable, fixedFooterTable, needsHorizontalScroll);
    }

    /**
     * Global handler for window resize events. It iterates through all initialized tables
     * and re-adjusts their column widths and horizontal scroll wrappers.
     * This function is typically debounced to optimize performance during rapid resizing.
     * @param {jQuery} managedTableCollection - A jQuery collection of all tables
     *                                          that have been initialized by this plugin.
     */
    function handleGlobalWindowResize(managedTableCollection) {
        managedTableCollection.each(function () {
            const currentProcessedTable = jQ(this);
            const headerRef = currentProcessedTable.data('fixedHeaderRef');
            const footerRef = currentProcessedTable.data('fixedFooterRef');
            const scrollRef = currentProcessedTable.data('scrollBodyRef');

            // Defensive check: ensure all associated elements are present.
            if (!headerRef || !footerRef || !scrollRef || !scrollRef[0]) {
                console.warn("FixedScrollTablePlugin: Missing associated elements for table during resize handling. Skipping.", currentProcessedTable);
                return;
            }

            // Temporarily show original header/footer to get accurate widths for calculation.
            currentProcessedTable.children('thead, tfoot').css({
                'visibility': 'hidden',
                'display': '' // Ensure display is not 'none' for width calculation
            });

            // Re-evaluate horizontal scrolling state and adjust layout.
            const scrollDomElement = scrollRef[0];
            const requiresHorizontalScroll = scrollDomElement.scrollWidth > scrollDomElement.clientWidth;
            manageHorizontalScrolling(currentProcessedTable, scrollRef, headerRef, footerRef, requiresHorizontalScroll);

            // Re-synchronize column widths after potential layout changes.
            synchronizeColumnDimensions(currentProcessedTable, headerRef, footerRef, false); // Original parts already shown.

            // Hide original table parts again after calculations are complete.
            currentProcessedTable.children('thead, tfoot').css({
                'visibility': '', // Clear visibility override
                'display': 'none' // Hide them again
            });
        });
    }

    // --- jQuery Plugin Definition ---

    /**
     * jQuery plugin to transform standard HTML tables into scrollable tables
     * with fixed header and footer elements.
     * @param {FixedScrollTableSettings} [userOptions] - Optional object to override default settings.
     * @returns {jQuery} The original jQuery object for method chaining.
     */
    jQ.fn.scrollableTablePlugin = function (userOptions) {
        // Merge user-provided options with the default plugin configuration.
        // A deep merge ensures that nested objects (if any) are correctly combined.
        const finalSettings = jQ.extend(true, {}, pluginConfiguration, userOptions);

        // Process each table element in the current jQuery selection.
        // The .filter('table') ensures that the plugin only attempts to initialize on actual tables.
        this.filter('table').each(function () {
            const currentTableElement = jQ(this);

            // Prevent re-initialization on tables that have already been processed by the plugin.
            if (currentTableElement.data('scrollTableInitialized')) {
                console.info("FixedScrollTablePlugin: Table already initialized. Skipping:", currentTableElement);
                return;
            }

            // Perform the core setup for the table's structure.
            setupTableStructure(currentTableElement, finalSettings);

            // Mark the table as initialized to prevent future re-processing.
            currentTableElement.data('scrollTableInitialized', true);
        }); // End of table iteration

        // --- Global Resize Handler Setup ---
        // This section ensures that all tables managed by the plugin respond to window resize events.
        // It maintains a global collection of all initialized tables.

        // Initialize a static collection if it doesn't exist.
        if (!jQ.fn.scrollableTablePlugin._allManagedTables) {
            jQ.fn.scrollableTablePlugin._allManagedTables = jQ();
        }
        // Add the currently processed tables to the global collection.
        jQ.fn.scrollableTablePlugin._allManagedTables = jQ.fn.scrollableTablePlugin._allManagedTables.add(this.filter('table'));

        // Define the callback for the resize event, operating on the global collection.
        let resizeEventHandler = () => handleGlobalWindowResize(jQ.fn.scrollableTablePlugin._allManagedTables);

        // Check if Lodash's debounce function is available for performance optimization.
        const isDebounceUtilityAvailable = typeof _lod === 'function' && typeof _lod.debounce === 'function';
        if (isDebounceUtilityAvailable) {
            // Apply debounce to the resize handler to limit its execution frequency.
            resizeEventHandler = _lod.debounce(resizeEventHandler, 150);
        } else {
            console.info("FixedScrollTablePlugin: Lodash debounce not detected. Window resize events will be handled directly.");
        }

        // Bind the (potentially debounced) resize handler to the window.
        // Ensure this handler is bound only once globally for all plugin instances.
        if (!jQ.fn.scrollableTablePlugin._globalResizeBound) {
            jQ(window).on('resize.fixedTablePluginNamespace', resizeEventHandler);
            jQ.fn.scrollableTablePlugin._globalResizeBound = true;
        }

        return this; // Maintain jQuery chainability.
    };

})(jQuery); // Pass jQuery object as 'jQ' to avoid conflicts and shorten references.