(function (jq, glob, undef) {
    // Ensure the main gridMaster library is present before proceeding with this extension.
    if (glob.gridMaster === undef || glob.gridMaster === null)
        throw new glob.Issue('Please verify that gridMaster.js is properly loaded and initialized before attempting to use this plugin.');

    var configSettings = {
        // Enables or disables the ordering functionality.
        order: true,
        // Custom comparison functions for various data types.
        arrangers: {
            // Lexical (alphabetical) comparison.
            lexical: function (itemA, itemB) {
                if (itemA === itemB) return 0;
                if (itemA < itemB) return -1;
                return 1;
            },
            // Numerical comparison.
            numerical: function (itemA, itemB) {
                return itemA - itemB;
            }
        },
        // CSS class names used by the ordering feature.
        styleNames: {
            order: {
                arrangeable: 'gridmaster-arrangeable',
                arranged: 'gridmaster-arranged',
                downward: 'gridmaster-arranged-down',
                marker: 'gridmaster-order-marker'
            }
        },
        // Custom event names triggered by the ordering feature.
        occurrences: {
            order: {
                arranging: 'gridmaster_arranging',
                arranged: 'gridmaster_arranged'
            }
        }
    };

    function TableArranger() {
        var inst = this; // Reference to the current plugin instance.
        inst.moduleName = 'GridMaster Table Arranger'; // Descriptive name for this module.
        inst.initialize = function (flexGrid) {
            // Only proceed if ordering is enabled in the grid configuration.
            if (flexGrid.options.order === true) {
                // Bind to core grid events.
                jq(flexGrid.table).bind({
                    'gridmaster_initialized': function (evtObj) {
                        var styleObj = flexGrid.options.styleNames.order,
                            eventObj = flexGrid.options.occurrences.order,
                            colDef;

                        var jqTable = jq(flexGrid.table),
                            jqBody = jqTable.find('> tbody'),
                            jqHeaderCell;

                        // Skip if ordering is explicitly disabled on the table element.
                        if (jqTable.data('ordering') === false) return;

                        // Iterate through all header cells to apply sortable classes and indicators.
                        jqTable.find('> thead > tr:last-child > th, > thead > tr:last-child > td').each(function (idx) {
                            jqHeaderCell = jq(this);
                            colDef = flexGrid.columns[jqHeaderCell.index()];
                            // Add arrangeable class if not disregarded and not already present.
                            if (colDef.ordering.disregard !== true && !jqHeaderCell.hasClass(styleObj.arrangeable)) {
                                jqHeaderCell.addClass(styleObj.arrangeable);
                                // Append a visual marker for ordering.
                                jq('<span />').addClass(styleObj.marker).appendTo(jqHeaderCell);
                            }
                        });

                        // Attach click event handler to arrangeable header cells.
                        jqTable.find('> thead > tr:last-child > th.' + styleObj.arrangeable + ', > thead > tr:last-child > td.' + styleObj.arrangeable)
                            .unbind('click.gridmaster') // Prevent multiple bindings.
                            .bind('click.gridmaster', function (evtObj) {
                                evtObj.preventDefault(); // Stop default header click behavior.
							
                                jqHeaderCell = jq(this);
                                colDef = flexGrid.columns[jqHeaderCell.index()];
                                // If column is set to be disregarded, do nothing.
                                if (colDef.ordering.disregard === true) return true;
							
                                var shouldOrder = true; // Flag to determine if a full order operation is needed.
                                var isUpward = true; // Flag for ascending order.

                                // Check current order state of the header.
                                if (jqHeaderCell.hasClass(styleObj.arranged)) {
                                    shouldOrder = false; // Already ordered ascending, next click will be descending.
                                    isUpward = false;
                                } else if (jqHeaderCell.hasClass(styleObj.downward)) {
                                    shouldOrder = false; // Already ordered descending, next click will be ascending (or no order).
                                }							

                                // Trigger a pre-ordering event, allowing external cancellation.
                                var notification = flexGrid.raise(eventObj.arranging, { colDef: colDef, direction: isUpward ? 'UP' : 'DOWN' });
                                if (notification && notification.outcome === false) return;							
							
                                // Store the index of the newly ordered column.
                                jqTable.data('orderedColumn', colDef.index);

                                // Remove order classes from other header cells.
                                jqTable.find('> thead > tr:last-child > th, > thead > tr:last-child > td').not(jqHeaderCell)
                                    .removeClass(styleObj.arranged + ' ' + styleObj.downward);

                                // Apply appropriate order class to the clicked header.
                                if (isUpward) {
                                    jqHeaderCell.removeClass(styleObj.downward).addClass(styleObj.arranged);
                                } else {
                                    jqHeaderCell.removeClass(styleObj.arranged).addClass(styleObj.downward);
                                }

                                // Perform the actual ordering or reversal based on state.
                                if (shouldOrder) {
                                    inst.performOrder(flexGrid, jqBody, colDef);
                                } else {
                                    inst.invertOrder(flexGrid, jqBody);
                                }

                                // Re-bind toggle selectors as row order has changed.
                                flexGrid.bindToggleSelectors();
                                // Trigger a post-ordering event.
                                flexGrid.raise(eventObj.arranged, { colDef: colDef, direction: isUpward ? 'UP' : 'DOWN' });
                                return false; // Prevent default behavior and event bubbling.
                            });

                        var wasAnyArranged = false; // Flag to track if initial ordering occurred.
                        // Check for initial order configuration on columns.
                        for (var colIdx in flexGrid.columns) {
                            colDef = flexGrid.columns[colIdx];
                            if (colDef.ordering.initial) {
                                inst.performOrder(flexGrid, jqBody, colDef);
                                wasAnyArranged = true;
                                jqHeaderCell = jqTable.find('> thead > tr:last-child > th:eq(' + colIdx + '), > thead > tr:last-child > td:eq(' + colIdx + ')');

                                // Apply initial order direction class.
                                if (colDef.ordering.initial === 'downward') {
                                    inst.invertOrder(flexGrid, jqBody);
                                    jqHeaderCell.addClass(styleObj.downward);
                                } else {
                                    jqHeaderCell.addClass(styleObj.arranged);
                                }

                                break; // Only one initial order is supported.
                            }
                        }
                        // If initial ordering happened, re-bind toggle selectors.
                        if (wasAnyArranged) {
                            flexGrid.bindToggleSelectors();
                        }
                    },
                    // Handle column data initialization.
                    'gridmaster_column_data': function (evtObj) {
                        var jqHeaderCell = jq(evtObj.colDef.th);
                        evtObj.colDef.data.ordering = evtObj.colDef.data.ordering || {};
                        evtObj.colDef.data.ordering.initial = jqHeaderCell.data('order-start') || false;
                        evtObj.colDef.data.ordering.disregard = jqHeaderCell.data('order-disregard') || false;
                        evtObj.colDef.data.ordering.selector = jqHeaderCell.data('order-selector') || null;

                        var matchIndex = jqHeaderCell.data('order-match') || 0;
                        if (matchIndex >= evtObj.colDef.data.matches.length) matchIndex = 0;
                        evtObj.colDef.data.ordering.match = evtObj.colDef.data.matches[matchIndex];
                    }
                });
            }
        };

        // Gathers rows from the table body, optionally extracting a value for comparison.
        inst.fetchRows = function (flexGrid, bodyElem, colDef) {
            var rowList = [];
            bodyElem.find('> tr').each(function () {
                var jqRow = jq(this),
                    jqNextRow = null;
                // Skip sub-rows.
                if (jqRow.hasClass(flexGrid.options.styleNames.subRow)) return true;
                // Check if there's an associated sub-row.
                if (jqRow.next().hasClass(flexGrid.options.styleNames.subRow)) {
                    jqNextRow = jqRow.next().get(0);
                }
                var rowItem = { 'row': jqRow, 'subRow': jqNextRow };
                // If a column definition is provided, extract the comparison value.
                if (colDef !== undef) {
                    rowItem.valToCompare = flexGrid.extractValue(this.cells[colDef.ordering.match], colDef);
                }
                rowList.push(rowItem);
                return true; // Continue iteration.
            }).detach(); // Detach rows to improve performance during reordering.
            return rowList;
        };

        // Performs a full ordering operation on the table body.
        inst.performOrder = function (flexGrid, bodyElem, colDef) {
            var rowList = inst.fetchRows(flexGrid, bodyElem, colDef);
            // Determine which comparison function to use.
            var comparisonFunc = flexGrid.options.arrangers[colDef.type] || flexGrid.options.arrangers.lexical;
            // Order the collected rows.
            rowList.sort(function (itemA, itemB) {
                return comparisonFunc(itemA.valToCompare, itemB.valToCompare);
            });
            // Re-append ordered rows to the table body.
            for (var rowIndex = 0; rowIndex < rowList.length; rowIndex++) {
                bodyElem.append(rowList[rowIndex].row);
                if (rowList[rowIndex].subRow !== null) {
                    bodyElem.append(rowList[rowIndex].subRow);
                }
            }
        };

        // Reverses the current order of rows in the table body.
        inst.invertOrder = function (flexGrid, bodyElem) {
            var rowList = inst.fetchRows(flexGrid, bodyElem);
            // Append rows in reverse order.
            for (var revIndex = rowList.length - 1; revIndex >= 0; revIndex--) {
                bodyElem.append(rowList[revIndex].row);
                if (rowList[revIndex].subRow !== null) {
                    bodyElem.append(rowList[revIndex].subRow);
                }
            }
        };
    }

    // Register the TableArranger plugin with the main gridMaster library.
    glob.gridMaster.extensions.enroll(new TableArranger(), configSettings);

})(jQuery, window, undefined); // Pass jQuery, window, and undefined explicitly for scope optimization.