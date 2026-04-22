(function(jq, glob, undefined) {
    //
    // Calculates the effective display width of the viewport.
    // This function accounts for potential browser inconsistencies.
    //
    function retrieveEffectiveViewportWidth(componentConfig) {
        let actualWidth = window.innerWidth ||
                          (document.documentElement ? document.documentElement.clientWidth : 0) ||
                          (document.body ? document.body.offsetWidth : 0);

        // If a test breakpoint is specified in the configuration,
        // and the current width is greater than that breakpoint,
        // cap the width at the test breakpoint's value.
        if (componentConfig && componentConfig.mockBreakpointId &&
            componentConfig.breakPoints &&
            componentConfig.breakPoints[componentConfig.mockBreakpointId] !== undefined &&
            componentConfig.breakPoints[componentConfig.mockBreakpointId] < actualWidth) {
            actualWidth = componentConfig.breakPoints[componentConfig.mockBreakpointId];
        }
        return actualWidth;
    }

    //
    // Iterates through all initialized responsive tables and adjusts their layout.
    // This is typically called on window resize events.
    //
    function refreshAllResponsiveGrids() {
        jq('table.responsive-grid-initialized').each(function() {
            const currentGrid = jq(this);
            const needsExpander = reconfigureGridColumns(currentGrid);
            updateDetailRowIndicator(currentGrid, needsExpander);
        });
    }

    //
    // Re-calculates and applies column visibility based on the current
    // viewport size for a specific table element.
    //
    function reconfigureGridColumns(targetGridElement) {
        let detailsToggleRequired = false;
        const gridBody = targetGridElement.find('tbody:first');
        const gridConfig = targetGridElement.data('responsiveGrid');

        // Ensure configuration exists before proceeding.
        if (!gridConfig) {
            console.warn("ResponsiveGrid: Configuration not found for table:", targetGridElement.attr('id'));
            return false;
        }

        //
        // Determine the pivotal breakpoint for column visibility.
        // Columns associated with breakpoints smaller than the current viewport
        // will be shown, others hidden.
        //
        const currentDisplayWidth = retrieveEffectiveViewportWidth(gridConfig);
        const columnsToHideByCriteria = ['always_hidden', 'initial_hidden'];
        const columnsToShowByCriteria = [];

        // Categorize breakpoints based on current viewport width.
        if (Array.isArray(gridConfig.responsiveBreakpoints)) {
            gridConfig.responsiveBreakpoints.forEach(bp => {
                if (bp.value >= currentDisplayWidth) {
                    columnsToHideByCriteria.push(bp.name);
                } else {
                    columnsToShowByCriteria.push(bp.name);
                }
            });
        }

        //
        // Temporarily close any open detail rows to prevent layout issues
        // during column re-arrangement. Store them for potential re-opening.
        //
        const previouslyExpandedRows = targetGridElement.find('>tbody:first>tr.' + gridConfig.styleClasses.expandedRow);
        if (previouslyExpandedRows.length > 0) {
            previouslyExpandedRows.trigger('click.responsiveGridDetails');
        }

        //
        // Show columns that should now be visible based on the determined criteria.
        //
        for (const criterion of columnsToShowByCriteria) {
            const headerSelector = `>thead:first>tr:last-child>th[data-hide-at*='${criterion}'],` +
                                   `>thead:first>tr:last-child>td[data-hide-at*='${criterion}']`;
            targetGridElement.find(headerSelector).each(function() {
                const currentHeaderCell = jq(this);
                const columnMeta = gridConfig.columnDataMap[currentHeaderCell.index()];

                if (columnMeta && columnMeta.spanDefinition) {
                    const [startCol, endCol] = Array.isArray(columnMeta.spanDefinition) ?
                                               [columnMeta.spanDefinition[0], columnMeta.spanDefinition[1] + 1] :
                                               [columnMeta.spanDefinition, columnMeta.spanDefinition + 1];

                    currentHeaderCell.css('display', ''); // Show header
                    gridBody.children('tr').each(function() {
                        jq(this).children('td').slice(startCol, endCol).css('display', ''); // Show corresponding cells
                    });
                }
            });
        }

        //
        // Hide columns that should not be visible based on the determined criteria.
        //
        for (const criterion of columnsToHideByCriteria) {
            const headerSelector = `>thead:first>tr:last-child>th[data-hide-at*='${criterion}'],` +
                                   `>thead:first>tr:last-child>td[data-hide-at*='${criterion}']`;
            targetGridElement.find(headerSelector).each(function() {
                const currentHeaderCell = jq(this);
                const columnMeta = gridConfig.columnDataMap[currentHeaderCell.index()];

                if (criterion !== 'always_hidden') {
                    detailsToggleRequired = true; // If any non-always hidden column is hidden, expander is needed.
                }

                if (columnMeta && columnMeta.spanDefinition) {
                    const [startCol, endCol] = Array.isArray(columnMeta.spanDefinition) ?
                                               [columnMeta.spanDefinition[0], columnMeta.spanDefinition[1] + 1] :
                                               [columnMeta.spanDefinition, columnMeta.spanDefinition + 1];

                    currentHeaderCell.css('display', 'none'); // Hide header
                    gridBody.children('tr').each(function() {
                        jq(this).children('td').slice(startCol, endCol).css('display', 'none'); // Hide corresponding cells
                    });
                }
            });
        }

        //
        // If some columns are now hidden and there were previously expanded
        // detail rows, re-trigger their expansion.
        //
        if (detailsToggleRequired && previouslyExpandedRows.length > 0) {
            previouslyExpandedRows.trigger('click.responsiveGridDetails');
        }

        //
        // Adjust the overall table width if a test breakpoint is active,
        // otherwise restore its original width.
        //
        if (gridConfig.mockBreakpointId) {
            targetGridElement.width(currentDisplayWidth);
        } else {
            targetGridElement.width(gridConfig.initialTableWidth);
        }

        return detailsToggleRequired;
    }

    //
    // Manages the visibility of the detail row expander indicator (e.g., a plus/minus icon).
    //
    function updateDetailRowIndicator(gridElem, shouldShow) {
        const gridOptions = gridElem.data('responsiveGrid');

        // All detail rows are assumed to be collapsed at this point due to resize logic.
        if (shouldShow) {
            // Add the collapsed class to the expander column cells in non-detail rows.
            gridElem.find('>tbody:first>tr:not(.responsive-grid-details-row)>td:nth-child(' + gridOptions.detailColumnIndex + ')')
                    .addClass(gridOptions.styleClasses.collapsedIndicator);
        } else {
            // Remove the collapsed class from all expander column cells.
            gridElem.find('>tbody:first>tr>td:nth-child(' + gridOptions.detailColumnIndex + ')')
                    .removeClass(gridOptions.styleClasses.collapsedIndicator);
        }

        gridOptions.expanderVisible = shouldShow;
    }

    //
    // Initializes a responsive grid table with the specified options.
    // This method is typically called on a jQuery object representing the table.
    //
    function initializeResponsiveGrid(globalWindowRef, initialSettings) {
        const finalSettings = initialSettings || {};

        return this.each(function() {
            const currentTable = jq(this);
            let gridSettings;

            // Retrieve existing settings or initialize with defaults.
            if (currentTable.data('responsiveGrid')) {
                gridSettings = jq.extend(true, {}, currentTable.data('responsiveGrid'), finalSettings);
            } else {
                gridSettings = jq.extend(true, {}, globalWindowRef.responsiveGrid.defaultOptions, finalSettings);
            }
            currentTable.data('responsiveGrid', gridSettings);

            //
            // Clear and re-populate breakpoint and column data.
            //
            gridSettings.responsiveBreakpoints.length = 0;
            gridSettings.columnDataMap = []; // Re-initialize as an array
            gridSettings.columnHeaderIndexMap = []; // Re-initialize as an array

            //
            // Process and sort breakpoints.
            //
            if (gridSettings.definedBreakpoints) {
                Object.entries(gridSettings.definedBreakpoints).forEach(([key, value]) => {
                    gridSettings.responsiveBreakpoints.push({ name: key, value: value });
                });
                gridSettings.responsiveBreakpoints.sort((a, b) => a.value - b.value);
            }

            //
            // Collect column metadata from the table header.
            //
            let currentColumnLogicalIndex = 0;
            currentTable.find('>thead:first>tr:last-child>th,>thead:first>tr:last-child>td').each(function() {
                const headerCell = jq(this);
                const colSpanVal = parseInt(headerCell.attr('colspan') || '1', 10);
                const originalCellIndex = headerCell.index();

                // If 'always_hidden' is present, it takes precedence.
                let hideBehavior = headerCell.data('hide-at');
                if (hideBehavior && String(hideBehavior).includes('always_hidden')) {
                    headerCell.data('hide-at', 'always_hidden');
                    hideBehavior = 'always_hidden';
                }

                // Identify the expander column.
                if (headerCell.data('expander-col')) {
                    gridSettings.detailColumnIndex = currentColumnLogicalIndex + 1;
                }

                const columnDetail = {
                    originalIndex: originalCellIndex,
                    nameId: headerCell.data('column-id') || jq.trim(headerCell.text()),
                    displayText: jq.trim(headerCell.text()),
                    hideBehavior: hideBehavior,
                    spanDefinition: null
                };

                // Store column span information for hiding/showing.
                if (colSpanVal > 1) {
                    columnDetail.spanDefinition = [currentColumnLogicalIndex, currentColumnLogicalIndex + colSpanVal - 1];
                } else {
                    columnDetail.spanDefinition = currentColumnLogicalIndex;
                }

                gridSettings.columnDataMap[originalCellIndex] = columnDetail;
                // Map logical column indices to original header cell indices.
                for (let i = 0; i < colSpanVal; i++) {
                    gridSettings.columnHeaderIndexMap[currentColumnLogicalIndex + i] = originalCellIndex;
                }
                currentColumnLogicalIndex += colSpanVal;
            });

            //
            // Perform an initial layout adjustment and set the expander state.
            //
            const initialNeedsExpander = reconfigureGridColumns(currentTable);
            updateDetailRowIndicator(currentTable, initialNeedsExpander);

            //
            // Attach event handler for detail row toggling.
            //
            currentTable.off('click.responsiveGrid').on('click.responsiveGrid',
                                                          '>tbody:first>tr:not(.responsive-grid-details-row)',
                                                          handleDetailToggle);

            //
            // Mark the table as initialized.
            //
            currentTable.addClass('responsive-grid-initialized');

            //
            // Allow registered plugins to perform their initialization.
            //
            if (globalWindowRef.responsiveGrid && globalWindowRef.responsiveGrid.pluginHooks &&
                typeof globalWindowRef.responsiveGrid.pluginHooks.initialize === 'function') {
                globalWindowRef.responsiveGrid.pluginHooks.initialize(globalWindowRef, currentTable);
            }

            //
            // Set up the window resize handler with a debounce mechanism.
            //
            jq(globalWindowRef).off('resize.responsiveGrid').on('resize.responsiveGrid',
                                                                 function() {
                                                                     clearTimeout(gridSettings.resizeTimer);
                                                                     gridSettings.resizeTimer = setTimeout(refreshAllResponsiveGrids, gridSettings.resizeDelayMs);
                                                                 });
        });
    }

    //
    // Renders the default HTML content for a detail panel.
    // This is used when no custom `showDetails` callback is provided.
    //
    function renderDefaultDetailsPanel(gridOptions, visibleCellGroups, hiddenCellGroups, targetContainer) {
        let detailHtml = '';
        if (!Array.isArray(hiddenCellGroups) || hiddenCellGroups.length === 0) {
            return; // Nothing to show.
        }

        for (const cellGroup of hiddenCellGroups) {
            detailHtml += "<div><span class='responsive-grid-detail-label' style='font-weight:bold;text-decoration:underline'>" + cellGroup.columnMeta.displayText + "</span><br>";
            for (const element of cellGroup.elements) {
                const cellElement = jq(element);
                const cellValue = cellElement.text();
                detailHtml += "<span class='responsive-grid-detail-value' style='margin-left:10px'>" + cellValue + "</span><br>";
            }
            detailHtml += "</div>";
        }
        jq(targetContainer).html(detailHtml);
    }

    //
    // Handles the click event for a main table row, toggling the visibility
    // of its associated detail row.
    //
    function handleDetailToggle(event) {
        const triggerRow = jq(this);
        const gridOptions = triggerRow.closest('table').data('responsiveGrid');

        // If no expander is visible, there are no hidden columns to show.
        if (!gridOptions || !gridOptions.expanderVisible) {
            return;
        }

        let removedClass, addedClass;
        let visibleCellGroups = [];
        let hiddenCellGroups = [];

        // Identify visible and hidden cells in the current row.
        const hiddenCellsInRow = triggerRow.children('td:hidden');
        const visibleCellsInRow = triggerRow.children('td:visible');
        const visibleSiblingCount = visibleCellsInRow.length;

        //
        // Process visible cells to group them by their original column definition.
        //
        let visibleCellIdx = 0;
        while (visibleCellIdx < visibleCellsInRow.length) {
            const currentCell = jq(visibleCellsInRow[visibleCellIdx]);
            const originalColIndex = gridOptions.columnHeaderIndexMap[currentCell.index()];
            const colDefinition = gridOptions.columnDataMap[originalColIndex];

            if (colDefinition) {
                const numCellsInGroup = Array.isArray(colDefinition.spanDefinition) ?
                                        (colDefinition.spanDefinition[1] - colDefinition.spanDefinition[0]) + 1 : 1;
                visibleCellGroups.push({
                    columnMeta: colDefinition,
                    elements: visibleCellsInRow.slice(visibleCellIdx, visibleCellIdx + numCellsInGroup)
                });
                visibleCellIdx += numCellsInGroup;
            } else {
                visibleCellIdx++; // Advance even if column definition is missing.
            }
        }

        //
        // Process hidden cells to group them by their original column definition.
        // Only include cells from columns that are not 'always_hidden'.
        //
        let hiddenCellIdx = 0;
        while (hiddenCellIdx < hiddenCellsInRow.length) {
            const currentCell = jq(hiddenCellsInRow[hiddenCellIdx]);
            const originalColIndex = gridOptions.columnHeaderIndexMap[currentCell.index()];
            const colDefinition = gridOptions.columnDataMap[originalColIndex];

            if (colDefinition && colDefinition.hideBehavior !== 'always_hidden') {
                const numCellsInGroup = Array.isArray(colDefinition.spanDefinition) ?
                                        (colDefinition.spanDefinition[1] - colDefinition.spanDefinition[0]) + 1 : 1;
                hiddenCellGroups.push({
                    columnMeta: colDefinition,
                    elements: hiddenCellsInRow.slice(hiddenCellIdx, hiddenCellIdx + numCellsInGroup)
                });
                hiddenCellIdx += numCellsInGroup;
            } else {
                hiddenCellIdx++; // Advance even if column definition is missing or always hidden.
            }
        }

        let nextRowElement = triggerRow.next();
        let containerElement;

        if (triggerRow.hasClass(gridOptions.styleClasses.expandedRow)) {
            // Row is currently expanded, so collapse it.
            if (gridOptions.customHideDetailsCallback && typeof gridOptions.customHideDetailsCallback === 'function') {
                containerElement = nextRowElement.children('td:first');
                gridOptions.customHideDetailsCallback(gridOptions, visibleCellGroups, hiddenCellGroups, containerElement);
            }
            nextRowElement.hide();
            removedClass = gridOptions.styleClasses.expandedRow;
            addedClass = gridOptions.styleClasses.collapsedRow;
        } else {
            // Row is currently collapsed, so expand it.
            if (!nextRowElement || !nextRowElement.hasClass('responsive-grid-details-row')) {
                // If detail row doesn't exist or is not the correct type, create it.
                nextRowElement = jq('<tr class="responsive-grid-details-row"><td colspan="' + visibleSiblingCount + '"></td></tr>');
                triggerRow.after(nextRowElement);
            } else {
                // Adjust colspan if necessary.
                nextRowElement.find('td:first').attr('colspan', visibleSiblingCount);
            }
            containerElement = nextRowElement.children('td:first').empty();

            if (gridOptions.customShowDetailsCallback && typeof gridOptions.customShowDetailsCallback === 'function') {
                gridOptions.customShowDetailsCallback(gridOptions, visibleCellGroups, hiddenCellGroups, containerElement);
            } else {
                renderDefaultDetailsPanel(gridOptions, visibleCellGroups, hiddenCellGroups, containerElement);
            }

            nextRowElement.show();
            removedClass = gridOptions.styleClasses.collapsedRow;
            addedClass = gridOptions.styleClasses.expandedRow;
        }
        triggerRow.removeClass(removedClass).addClass(addedClass);
        triggerRow.find(':nth-child(' + gridOptions.detailColumnIndex + ')').removeClass(removedClass).addClass(addedClass);
    }

    //
    // Applies column hiding logic and expander indicators to a set of rows.
    // Useful when adding new rows to an already initialized table.
    //
    function applyRowVisibilityAdjustments(gridConfiguration, parentGrid, targetRows) {
        const currentDisplayWidth = retrieveEffectiveViewportWidth(gridConfiguration);
        const hiddenColumnsList = ['always_hidden'];
        let needsExpanderIndicator = false;

        // Determine which columns to hide based on current viewport.
        if (Array.isArray(gridConfiguration.responsiveBreakpoints)) {
            gridConfiguration.responsiveBreakpoints.forEach(bp => {
                if (bp.value >= currentDisplayWidth) {
                    hiddenColumnsList.push(bp.name);
                }
            });
        }

        // Iterate through columns to be hidden and apply `display: none`.
        for (const columnName of hiddenColumnsList) {
            const headerSelector = `>thead:first>tr:last-child>th[data-hide-at*='${columnName}'],` +
                                   `>thead:first>tr:last-child>td[data-hide-at*='${columnName}']`;
            parentGrid.find(headerSelector).each(function() {
                const currentHeader = jq(this);
                const columnMeta = gridConfiguration.columnDataMap[currentHeader.index()];

                if (columnName !== 'always_hidden') {
                    needsExpanderIndicator = true;
                }

                if (columnMeta && columnMeta.spanDefinition) {
                    const [startColIdx, endColIdx] = Array.isArray(columnMeta.spanDefinition) ?
                                                     [columnMeta.spanDefinition[0], columnMeta.spanDefinition[1] + 1] :
                                                     [columnMeta.spanDefinition, columnMeta.spanDefinition + 1];

                    targetRows.each(function() {
                        jq(this).children('td').slice(startColIdx, endColIdx).css('display', 'none');
                    });
                }
            });
        }

        // If no expander is configured or needed, exit.
        if (!gridConfiguration.expanderVisible || !needsExpanderIndicator) {
            return;
        }

        // Add the expander class to the appropriate cell in each row.
        targetRows.find('>td:nth-child(' + gridConfiguration.detailColumnIndex + ')')
                  .addClass(gridConfiguration.styleClasses.collapsedIndicator);
    }

    /************************************************************************
     *
     * Public API methods for the Responsive Grid plugin.
     *
     ************************************************************************/

    //
    // Retrieves the current configuration options for the initialized table.
    //
    function retrieveGridSettings() {
        return jq(this).data('responsiveGrid');
    }

    //
    // Returns version information for the core plugin and any registered child plugins.
    //
    function fetchVersionInfo() {
        const gridOptions = jq(this).data('responsiveGrid');
        const registeredPlugins = glob.responsiveGrid.pluginHooks.registered || [];

        // If no child plugins, return only the core version.
        if (registeredPlugins.length === 0) {
            return gridOptions ? gridOptions.pluginVersion : null;
        }

        // Construct an object with core and child plugin versions.
        const versionDetails = [{ name: "ResponsiveGrid Core", version: gridOptions.pluginVersion }];
        for (const plugin of registeredPlugins) {
            versionDetails.push({ name: plugin.pluginName, version: plugin.pluginVersion });
        }
        return versionDetails;
    }

    //
    // Counts the number of primary data rows in the table,
    // excluding any dynamically added detail rows.
    //
    function countDataRows() {
        const currentGridElement = jq(this);
        // Direct DOM access for efficiency.
        const totalRows = currentGridElement.get(0).tBodies[0].rows.length;
        const detailRows = currentGridElement.find('tr.responsive-grid-details-row').length;

        return totalRows - detailRows;
    }

    //
    // Replaces, inserts, or deletes rows within the responsive grid.
    //
    // updateGridRows(newRowHtmlOrElements)
    //   Replaces all existing rows with the new ones. If newRowHtmlOrElements is null,
    //   all rows are simply deleted.
    //
    // This implementation focuses on the simple "replace all" functionality
    // as suggested by the original code's `arguments.length < 2` block.
    //
    function updateGridRows(...args) {
        let newRowElements = null;
        const targetGrid = jq(this);
        const gridConfiguration = targetGrid.data('responsiveGrid');

        if (!gridConfiguration) {
            console.warn("ResponsiveGrid: Configuration missing for table during row update.");
            return;
        }

        if (args.length > 0) {
            const potentialNewRows = args[args.length - 1];
            // Check if it's already a jQuery object or requires wrapping.
            newRowElements = (typeof potentialNewRows === 'object' && potentialNewRows.jquery) ? potentialNewRows : jq(potentialNewRows);
        }

        //
        // This block handles the case where all rows are replaced or deleted.
        // The original code only implemented the `arguments.length < 2` case.
        //
        // Close any currently expanded detail rows.
        if (gridConfiguration.customHideDetailsCallback) {
            targetGrid.find('>tbody:first>tr.' + gridConfiguration.styleClasses.expandedRow)
                      .trigger('click.responsiveGridRowUpdate');
        }

        // Delete all existing data rows (excluding potential header/footer rows if not in tbody).
        // Ensure detail rows are also cleared if they were not explicitly closed.
        targetGrid.find('>tbody:first>tr').remove();

        // Insert the new rows if provided.
        if (newRowElements && newRowElements.length > 0) {
            applyRowVisibilityAdjustments(gridConfiguration, targetGrid, newRowElements);
            targetGrid.find('>tbody:first').append(newRowElements);
        }

        targetGrid.trigger('responsiveGrid.rows.modified');
    }

    //
    // Expose the plugin on jQuery and the global window object.
    //
    jq.fn.extend({
        responsiveGrid: initializeResponsiveGrid,
        getResponsiveGridSettings: retrieveGridSettings,
        getResponsiveGridVersion: fetchVersionInfo,
        getResponsiveGridRowCount: countDataRows,
        updateResponsiveGridRows: updateGridRows
    });

    glob.responsiveGrid = glob.responsiveGrid || {};
    jq.extend(true, glob.responsiveGrid, {
        defaultOptions: {
            pluginVersion: '1.0.1',
            breakpoints: {
                phone: 480,
                tablet: 768,
                desktop: 1024
            },
            responsiveBreakpoints: [], // Populated dynamically
            columnDataMap: [], // Populated dynamically
            columnHeaderIndexMap: [], // Populated dynamically
            detailColumnIndex: 0,
            initialTableWidth: '100%', // Default width
            expanderVisible: false,
            resizeTimer: null,
            resizeDelayMs: 200, // Debounce delay for resize events
            mockBreakpointId: null, // For testing specific breakpoints
            classes: {
                expandedRow: 'responsive-grid-row-expanded',
                collapsedRow: 'responsive-grid-row-collapsed',
                collapsedIndicator: 'responsive-grid-expander-collapsed'
            },
            customShowDetailsCallback: null,
            customHideDetailsCallback: null
        },
        pluginHooks: {
            registered: [],
            initialize: function(gw, tableElem) {
                this.registered.forEach(plugin => {
                    if (typeof plugin.init === 'function') {
                        plugin.init(gw, tableElem);
                    }
                });
            }
        }
    });

})(jQuery, window);