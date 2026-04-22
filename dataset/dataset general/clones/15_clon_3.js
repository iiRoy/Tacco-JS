(function (jQ, globObj, undefVal) {
    // Ensure the core data grid library is present before attempting to extend it.
    // If not, we log an error and prevent this module from loading.
    if (globObj.dataGrid === undefVal || globObj.dataGrid === null) {
        console.error('Core data grid library (dataGrid.js) not found. This sorting extension cannot initialize.');
        // Potentially throw, but for Type III, logging and returning is a softer approach.
        return;
    }

    // Default configuration settings for the sorting module.
    const baseSettings = {
        sortingEnabled: true, // Master switch for enabling/disabling sorting functionality
        sortAlgos: {
            lexicalSort: function (valA, valB) {
                // A standard lexicographical comparison function.
                if (valA === valB) return 0;
                if (valA < valB) return -1;
                return 1;
            },
            numericalSort: function (valA, valB) {
                // A simple numerical comparison, assumes values are numbers.
                return valA - valB;
            },
            // A common alias for the default textual sort
            defaultSort: function (valA, valB) {
                return baseSettings.sortAlgos.lexicalSort(valA, valB);
            }
        },
        cssClasses: {
            sort: {
                sortableHeader: 'grid-sortable-header',     // Class for sortable column headers
                sortedAsc: 'grid-sorted-asc',               // Class for ascending sorted column
                sortedDesc: 'grid-sorted-desc',             // Class for descending sorted column
                sortIndicatorIcon: 'grid-sort-indicator'    // Class for the sort direction icon
            }
        },
        eventHooks: {
            sort: {
                beforeSort: 'grid_sorting_commenced', // Event fired before sorting begins
                afterSort: 'grid_sorting_completed'   // Event fired after sorting finishes
            }
        },
        debugMode: false // Enable verbose console logging for development
    };

    /**
     * Represents the sorting extension for the data grid.
     * Manages column sorting, UI updates, and data reordering.
     */
    function GridSorterExtension() {
        const moduleInstance = this; // Self-reference for clarity
        moduleInstance.moduleName = 'DataGrid Sort Module'; // Name of this extension

        /**
         * Initializes the sorting module for a given grid instance.
         * Binds necessary event handlers and applies initial sorting if configured.
         * @param {object} gridInstance - The instance of the main data grid.
         */
        moduleInstance.initializeModule = function (gridInstance) {
            // Early exit if sorting is globally disabled for this grid.
            if (!gridInstance.config.sortingEnabled) {
                if (baseSettings.debugMode) {
                    console.log(`[${moduleInstance.moduleName}] Sorting disabled for grid:`, gridInstance.domTable);
                }
                return;
            }

            const jQTable = jQ(gridInstance.domTable); // Cache jQuery object for the table
            const sortingClassDefs = gridInstance.config.cssClasses.sort;
            const sortingEventHooks = gridInstance.config.eventHooks.sort;

            // Attach handlers for grid lifecycle events.
            jQTable.on({
                'grid_initialized_event': function (e) {
                    // This handler runs once the grid is fully set up.
                    const tableBodyRef = jQTable.find('> tbody');
                    const headerCellsSelector = '> thead > tr:last-child > th, > thead > tr:last-child > td';

                    // Iterate through all header cells to identify and mark sortable ones.
                    jQTable.find(headerCellsSelector).each(function () {
                        const currentHeaderCell = jQ(this);
                        const colIndex = currentHeaderCell.index();
                        const colDefinition = gridInstance.columns[colIndex];

                        // Check if this column should be ignored for sorting or already has the sortable class.
                        const sortConfig = colDefinition.sortingOptions || {};
                        if (sortConfig.ignoreColumn !== true && !currentHeaderCell.hasClass(sortingClassDefs.sortableHeader)) {
                            currentHeaderCell.addClass(sortingClassDefs.sortableHeader);
                            jQ('<span />').addClass(sortingClassDefs.sortIndicatorIcon).appendTo(currentHeaderCell);
                        }
                    });

                    // Attach click handler to sortable header cells.
                    jQTable.find(headerCellsSelector + '.' + sortingClassDefs.sortableHeader)
                        .off('click.gridSort') // Ensure no duplicate handlers
                        .on('click.gridSort', function (clickEvent) {
                            clickEvent.preventDefault();
                            clickEvent.stopImmediatePropagation(); // Prevent other handlers on the same element

                            const clickedHeader = jQ(this);
                            const clickedColIndex = clickedHeader.index();
                            const clickedColData = gridInstance.columns[clickedColIndex];

                            // Basic validation for column data.
                            if (!clickedColData || clickedColData.sortingOptions.ignoreColumn) {
                                if (baseSettings.debugMode) {
                                    console.warn(`[${moduleInstance.moduleName}] Clicked column ignored for sorting or data missing:`, clickedHeader);
                                }
                                return;
                            }

                            let isAscending = true; // Default sort direction
                            let shouldSortData = true; // Flag to determine if data reordering is needed

                            // Determine current sort state and desired next state.
                            if (clickedHeader.hasClass(sortingClassDefs.sortedAsc)) {
                                isAscending = false; // Currently ascending, next will be descending
                                shouldSortData = true; // Need to reverse data
                            } else if (clickedHeader.hasClass(sortingClassDefs.sortedDesc)) {
                                shouldSortData = false; // Currently descending, next will be default (ascending)
                                // If we want to cycle through no sort, ascending, descending, then this branch would reset.
                                // For now, it just flips the descending flag to ascending.
                                isAscending = true;
                            } else {
                                // Not sorted, so start with ascending.
                                isAscending = true;
                                shouldSortData = true;
                            }

                            // Raise a pre-sorting event, allowing external code to cancel.
                            const sortEventResult = gridInstance.triggerEvent(sortingEventHooks.beforeSort, {
                                column: clickedColData,
                                direction: isAscending ? 'ASC' : 'DESC'
                            });

                            if (sortEventResult && sortEventResult.isCanceled === true) {
                                if (baseSettings.debugMode) {
                                    console.log(`[${moduleInstance.moduleName}] Sorting cancelled by event handler.`);
                                }
                                return;
                            }

                            // Update internal state to remember the last sorted column.
                            jQTable.data('lastSortedColumnIndex', clickedColIndex);

                            // Clear sort classes from all other headers.
                            jQTable.find(headerCellsSelector).not(clickedHeader)
                                .removeClass(`${sortingClassDefs.sortedAsc} ${sortingClassDefs.sortedDesc}`);

                            // Apply new sort classes to the clicked header.
                            if (isAscending) {
                                clickedHeader.removeClass(sortingClassDefs.sortedDesc).addClass(sortingClassDefs.sortedAsc);
                            } else {
                                clickedHeader.removeClass(sortingClassDefs.sortedAsc).addClass(sortingClassDefs.sortedDesc);
                            }

                            // Perform the actual data reordering.
                            if (shouldSortData) {
                                if (isAscending) {
                                    moduleInstance.applySort(gridInstance, tableBodyRef, clickedColData);
                                } else {
                                    moduleInstance.reverseOrder(gridInstance, tableBodyRef);
                                }
                            }

                            // Rebind any necessary toggle selectors for responsive behavior.
                            gridInstance.rebindToggleHandlers();
                            // Raise a post-sorting event.
                            gridInstance.triggerEvent(sortingEventHooks.afterSort, {
                                column: clickedColData,
                                direction: isAscending ? 'ASC' : 'DESC'
                            });
                        });

                    // Check for any initial sorting configuration.
                    let initialSortPerformed = false;
                    for (const colKey in gridInstance.columns) {
                        const currentColumn = gridInstance.columns[colKey];
                        const initialSortDir = currentColumn.sortingOptions.initialDirection;

                        if (initialSortDir) {
                            if (baseSettings.debugMode) {
                                console.log(`[${moduleInstance.moduleName}] Applying initial sort for column ${colKey} (${initialSortDir}).`);
                            }
                            moduleInstance.applySort(gridInstance, tableBodyRef, currentColumn);
                            initialSortPerformed = true;

                            const initialHeaderCell = jQTable.find(`${headerCellsSelector}:eq(${colKey})`);

                            if (initialSortDir === 'descending') {
                                moduleInstance.reverseOrder(gridInstance, tableBodyRef);
                                initialHeaderCell.addClass(sortingClassDefs.sortedDesc);
                            } else { // Default to ascending
                                initialHeaderCell.addClass(sortingClassDefs.sortedAsc);
                            }
                            break; // Only apply the first initial sort found.
                        }
                    }

                    if (initialSortPerformed) {
                        gridInstance.rebindToggleHandlers();
                    }
                },
                // Handler for when column data is processed by the main grid.
                'column_data_processed': function (eventPayload) {
                    const currentHeaderCell = jQ(eventPayload.columnInfo.headerElement);
                    const columnConfig = eventPayload.columnInfo.extraData;

                    // Initialize sorting options if they don't exist.
                    columnConfig.sortConfig = columnConfig.sortConfig || {};

                    // Retrieve sorting configuration from data attributes.
                    columnConfig.sortConfig.initialDirection = currentHeaderCell.data('initial-sort-direction') || false;
                    columnConfig.sortConfig.ignoreColumn = currentHeaderCell.data('ignore-sort') || false;
                    columnConfig.sortConfig.valueSelector = currentHeaderCell.data('sort-value-selector') || null;

                    // Determine which cell match index to use for sorting value extraction.
                    let matchIndex = currentHeaderCell.data('sort-match-index') || 0;
                    if (matchIndex >= columnConfig.cellMatches.length) {
                        matchIndex = 0; // Fallback to the first match if index is out of bounds.
                    }
                    columnConfig.sortConfig.matchIndex = matchIndex;
                }
            });
        };

        /**
         * Extracts and prepares rows for sorting.
         * This includes detaching them from the DOM and extracting their sortable values.
         * @param {object} gridInstance - The grid instance.
         * @param {jQuery} tableBodyRef - jQuery object for the table body.
         * @param {object} [colDataObj] - The column definition object to extract sort values.
         * @returns {Array<object>} An array of row objects, each containing references to main row, detail row, and sortable value.
         */
        moduleInstance.extractRows = function (gridInstance, tableBodyRef, colDataObj) {
            if (!tableBodyRef || tableBodyRef.length === 0) {
                if (baseSettings.debugMode) {
                    console.warn(`[${moduleInstance.moduleName}] No table body found for row extraction.`);
                }
                return [];
            }

            const rowCollection = [];
            const detailRowClass = gridInstance.config.cssClasses.detailRow;

            // Iterate over all direct child rows in the tbody.
            // Using `jQ.each` with `detach()` for performance when reordering many rows.
            tableBodyRef.children('tr').each(function () {
                const currentRow = jQ(this);
                let nextDetailRow = null;

                // Skip detail rows as they are handled alongside their parent.
                if (currentRow.hasClass(detailRowClass)) {
                    return; // Continue to the next iteration
                }

                // Check if the next sibling is a detail row.
                const potentialDetailRow = currentRow.next();
                if (potentialDetailRow.hasClass(detailRowClass)) {
                    nextDetailRow = potentialDetailRow.get(0); // Get raw DOM element
                }

                const rowEntry = {
                    mainRowRef: currentRow,
                    detailRowRef: nextDetailRow,
                    sortableValue: undefVal // Will be populated if colDataObj is provided
                };

                // Extract the value used for sorting if a column is specified.
                if (colDataObj !== undefVal) {
                    const cellToParse = this.cells[colDataObj.sortingOptions.matchIndex];
                    if (cellToParse) {
                        rowEntry.sortableValue = gridInstance.parseCellValue(cellToParse, colDataObj);
                    } else {
                        if (baseSettings.debugMode) {
                            console.warn(`[${moduleInstance.moduleName}] Cell at index ${colDataObj.sortingOptions.matchIndex} not found for row:`, currentRow.get(0));
                        }
                        rowEntry.sortableValue = null; // Default to null if cell is missing
                    }
                }
                rowCollection.push(rowEntry);
            }).detach(); // Detach all rows from the DOM for efficient reordering.

            return rowCollection;
        };

        /**
         * Sorts the rows of the table body based on a specified column and re-appends them.
         * @param {object} gridInstance - The grid instance.
         * @param {jQuery} tableBodyRef - jQuery object for the table body.
         * @param {object} colDataObj - The column definition object to sort by.
         */
        moduleInstance.applySort = function (gridInstance, tableBodyRef, colDataObj) {
            if (!colDataObj) {
                if (baseSettings.debugMode) {
                    console.error(`[${moduleInstance.moduleName}] Cannot apply sort: Column data object is undefined.`);
                }
                return;
            }

            const allRows = moduleInstance.extractRows(gridInstance, tableBodyRef, colDataObj);
            const activeSorterFn = gridInstance.config.sortAlgos[colDataObj.dataType] || gridInstance.config.sortAlgos.defaultSort;

            // Perform the actual sort using the determined sorter function.
            allRows.sort(function (rowA, rowB) {
                return activeSorterFn(rowA.sortableValue, rowB.sortableValue);
            });

            // Re-append the sorted rows to the table body.
            allRows.forEach(function (rowEntry) {
                tableBodyRef.append(rowEntry.mainRowRef);
                if (rowEntry.detailRowRef !== null) {
                    tableBodyRef.append(rowEntry.detailRowRef);
                }
            });
        };

        /**
         * Reverses the current order of rows in the table body and re-appends them.
         * @param {object} gridInstance - The grid instance.
         * @param {jQuery} tableBodyRef - jQuery object for the table body.
         */
        moduleInstance.reverseOrder = function (gridInstance, tableBodyRef) {
            const allRows = moduleInstance.extractRows(gridInstance, tableBodyRef);

            if (allRows.length === 0) {
                if (baseSettings.debugMode) {
                    console.log(`[${moduleInstance.moduleName}] No rows to reverse.`);
                }
                return;
            }

            // Iterate backwards to append rows in reverse order.
            for (let k = allRows.length - 1; k >= 0; --k) {
                const rowEntry = allRows[k];
                tableBodyRef.append(rowEntry.mainRowRef);
                if (rowEntry.detailRowRef !== null) {
                    tableBodyRef.append(rowEntry.detailRowRef);
                }
            }
        };
    }

    // Register this sorting extension with the main data grid library.
    globObj.dataGrid.extensions.register(new GridSorterExtension(), baseSettings);

})(jQuery, window);