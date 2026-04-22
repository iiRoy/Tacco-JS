// This ExtJS component, named MobileDataGrid, offers a robust and flexible solution for displaying tabular data,
// specifically optimized for touch-enabled interfaces. It leverages HTML table structures to ensure consistent
// rendering across various mobile browser environments, addressing known limitations of CSS3 column layouts
// in certain WebKit implementations. The component provides core grid functionalities such as data binding,
// column sorting, and dynamic column visibility management.

Ext.ns("Ext.custom"); // Establish a custom namespace for our extended ExtJS components.

Ext.custom.MobileDataGrid = Ext.extend(Ext.Panel, {
    // Configuration property: Defines the layout strategy for this panel. 'fit' ensures it fills its container.
    displayMode: "fit",

    // Configuration property: Controls whether multiple rows can be selected simultaneously.
    allowMultiSelection: false,

    // Configuration property: Specifies the direction of scrolling for the data content.
    scrollDirection: "vertical",

    // Configuration property (new): Enables or disables interactive resizing of columns by the user.
    // Note: Full implementation of column resizing is not included in this version.
    enableColumnResizing: false,

    // Internal property: Stores a reference to the Ext.DataView component responsible for rendering data rows.
    _dataDisplayView: null,

    // --- Component Lifecycle Methods ---

    /**
     * Initializes the MobileDataGrid component. This method is automatically invoked
     * during the component's construction process. It sets up the internal structure,
     * creates sub-components, and establishes necessary event bindings.
     */
    initializeComponent: function() {
        const inst = this; // Create a consistent alias for the component instance.

        // Pre-check: Ensure `columnDefinitions` array is present. If not, initialize it and log a warning.
        if (!Ext.isArray(inst.columnDefinitions)) {
            console.warn("MobileDataGrid: No columnDefinitions array found. The grid will render empty.");
            inst.columnDefinitions = [];
        }

        // Step 1: Create the primary data rendering component (Ext.DataView).
        inst._dataDisplayView = inst.createDataItemContainer();
        inst.items = inst._dataDisplayView; // Assign the DataView as the panel's primary item.

        // Step 2: Initialize or ensure the `dockedItems` array exists for adding docked components.
        if (!Ext.isArray(inst.dockedItems)) {
            inst.dockedItems = [];
        }

        // Step 3: Construct the grid's header component and add it to the docked items.
        inst.gridHeader = new Ext.Component(inst.constructGridHeader());
        inst.dockedItems.unshift(inst.gridHeader); // Add the header to the beginning of the docked items array.

        // Step 4: Call the parent class's initialization method to ensure proper ExtJS component setup.
        Ext.custom.MobileDataGrid.superclass.initializeComponent.call(inst);

        // Step 5: Retrieve the data source from the component's configuration.
        const dataSource = inst.dataSource;

        // Step 6: Bind event listeners to the data source for updates and general data changes.
        if (dataSource) {
            dataSource.on("update", inst.relayDataUpdate, inst);
            dataSource.on("datachanged", inst.handleDataRefresh, inst); // New listener for general data changes.
        } else {
            console.error("MobileDataGrid: No dataSource configured. Data will not be displayed.");
        }
    },

    /**
     * Relays data update events from the underlying data store as a custom component event.
     * This provides a consistent entry point for external components to react to data modifications.
     * @param {Ext.data.Store} dataStoreRef - The store instance that triggered the update.
     * @param {Ext.data.Record} recordInstance - The specific data record that was updated.
     * @param {String} actionType - The type of operation that occurred (e.g., 'edit', 'add', 'remove').
     */
    relayDataUpdate: function(dataStoreRef, recordInstance, actionType) {
        const inst = this; // Reference to the component instance.

        // Basic validation: Check if a valid record instance was provided.
        if (!recordInstance || !recordInstance.id) {
            console.warn("MobileDataGrid: Received a store update with an invalid or incomplete record instance.");
            return;
        }
        // Fire a custom event to notify listeners about the data store's update activity.
        inst.fireEvent("dataStoreUpdateEvent", dataStoreRef, recordInstance, actionType);
    },

    /**
     * A supplementary handler for general data refresh events from the store.
     * This method can be extended to trigger a full view refresh or other actions.
     * @param {Ext.data.Store} dataStoreRef - The store instance that reported a general data change.
     */
    handleDataRefresh: function(dataStoreRef) {
        const inst = this;
        // For now, simply log the event. A view refresh could be triggered here if needed.
        console.log("MobileDataGrid: Data store has indicated a general refresh.", dataStoreRef);
    },

    /**
     * Constructs the configuration object for the grid's header component.
     * This method generates the HTML markup for the header row and defines
     * the event listeners necessary for header interactions (e.g., sorting).
     * @returns {Object} An Ext.Component configuration object for the header.
     */
    constructGridHeader: function() {
        const inst = this; // Component instance alias.
        const columnDefinitions = inst.columnDefinitions; // Retrieve column configurations.

        // Guard clause: If no columns are defined, return a simple empty header.
        if (!columnDefinitions || columnDefinitions.length === 0) {
            return {
                dock: "top",
                html: '<div class="x-grid-empty-header">No columns configured for this grid.</div>',
                listeners: {
                    scope: inst,
                    afterrender: function() { console.info("Header rendered with no columns configured."); }
                }
            };
        }

        const visibleColumnCount = inst.calculateVisibleColumnCount(false); // Determine the number of visible columns.
        let baseCellWidthPercentage = 0;
        if (visibleColumnCount > 0) {
            baseCellWidthPercentage = (100 / visibleColumnCount).toFixed(2); // Calculate base width as a percentage.
        }

        let headerMarkup = '<table class="x-grid-header x-grid-table-container" style="width:100%;"><thead><tr>'; // Start header table.

        // Iterate through each column definition to generate its header cell HTML.
        for (let idx = 0; idx < columnDefinitions.length; idx++) {
            const currentColumn = columnDefinitions[idx];
            const flexFactor = currentColumn.flex || 1; // Default flex factor is 1 if not specified.
            let cssClasses = currentColumn.headerCls || ""; // Custom CSS classes for the header cell.

            // Calculate the width for the current header cell based on its flex factor.
            const calculatedWidth = (flexFactor * baseCellWidthPercentage).toFixed(2);

            // Determine if the column is marked as hidden.
            const isColumnHidden = currentColumn.hidden === true;

            if (isColumnHidden) {
                cssClasses += " x-grid-col-hidden"; // Add hidden class if applicable.
            }

            // Append the header cell (<th>) HTML, including data attributes for identification.
            headerMarkup += `<th style="width:${calculatedWidth}%;" class="x-grid-cell x-grid-hd-cell x-grid-col-${currentColumn.mapping} ${cssClasses}" data-column-id="${currentColumn.mapping}" data-column-type="${currentColumn.type || 'text'}">`;
            headerMarkup += currentColumn.header || '&nbsp;'; // Display header text, or a non-breaking space if empty.
            headerMarkup += '</th>';
        }
        headerMarkup += '</tr></thead></table>'; // Close header table.

        return {
            dock: "top", // Dock the header component at the top of the panel.
            html: headerMarkup, // The generated HTML for the grid header.
            cls: "x-grid-header-wrap", // A wrapper class for additional styling.
            listeners: {
                scope: inst,
                // Attach event listeners to the header element after it has been rendered.
                afterrender: inst.attachHeaderListeners
            }
        };
    },

    /**
     * Attaches necessary event listeners to the rendered header component's DOM element.
     * This method is typically called after the header component has completed its rendering.
     * @param {Ext.Component} componentRef - A reference to the header component instance.
     */
    attachHeaderListeners: function(componentRef) {
        const inst = this; // Component instance alias.
        const elementRef = componentRef.getEl(); // Get the underlying DOM element of the header component.

        // Guard clause: Ensure the header element exists before attempting to attach listeners.
        if (!elementRef) {
            console.warn("MobileDataGrid: Header DOM element not found for event attachment.");
            return;
        }

        // Attach a 'click' event listener to the header element, delegating to `onHeaderInteraction`.
        elementRef.on("click", inst.onHeaderInteraction, inst);
        console.info("MobileDataGrid: Header click listener successfully attached.");
    },

    /**
     * Handles click events that occur on the grid's header cells.
     * This method is primarily responsible for triggering column sorting.
     * @param {Ext.EventObject} eventObject - The ExtJS event object.
     * @param {HTMLElement} targetElement - The DOM element that was clicked.
     */
    onHeaderInteraction: function(eventObject, targetElement) {
        // Prevent default browser behaviors (e.g., text selection) when clicking on headers.
        eventObject.stopEvent();

        const inst = this; // Component instance alias.
        const clickedEl = Ext.get(targetElement); // Wrap the raw DOM element with Ext.Element for easier manipulation.
        const columnIdentifier = clickedEl.getAttribute("data-column-id"); // Retrieve the column's unique identifier.

        // Validation: Check if a valid column identifier was found.
        if (Ext.isString(columnIdentifier) && columnIdentifier.length > 0) {
            const dataSource = inst.dataSource; // Get the bound data store.
            if (!dataSource) {
                console.error("MobileDataGrid: Cannot perform sort operation; data source is not available.");
                return;
            }

            // Perform sorting on the data store using the identified column.
            dataSource.sort(columnIdentifier);

            // Update a custom data attribute on the header cell to reflect the new sort state.
            // This can be used by CSS to display sort indicators (e.g., up/down arrows).
            clickedEl.set({
                'data-sort-state': dataSource.sortToggle[columnIdentifier] || 'ASC' // Default to 'ASC' if not set.
            });

            // Fire a custom event to notify external listeners that a column has been sorted.
            inst.fireEvent('columnsort', inst, columnIdentifier, dataSource.sortToggle[columnIdentifier]);
            console.log(`MobileDataGrid: Data sorted by column "${columnIdentifier}" in ${dataSource.sortToggle[columnIdentifier]} order.`);
        } else {
            console.info("MobileDataGrid: Clicked element within header does not possess a valid data-column-id attribute.");
        }
    },

    /**
     * Creates and configures the Ext.DataView component, which is responsible for
     * rendering the actual data rows within the grid. This includes defining the
     * XTemplate for row rendering and data preparation logic.
     * @returns {Ext.DataView} The fully configured DataView instance.
     */
    createDataItemContainer: function() {
        const inst = this; // Component instance alias.
        const columnDefinitions = inst.columnDefinitions; // Retrieve column configurations.

        // Guard clause: If no column definitions, return a basic DataView with an empty message.
        if (!columnDefinitions || columnDefinitions.length === 0) {
            console.warn("MobileDataGrid: No columnDefinitions found for data view. Returning a placeholder DataView.");
            return new Ext.DataView({
                store: inst.dataSource,
                itemSelector: "tr.x-grid-row",
                tpl: '<div class="x-grid-empty-message">No data to display, as no columns are defined.</div>'
            });
        }

        const visibleColumnCount = inst.calculateVisibleColumnCount(false); // Count visible columns for width calculation.
        let baseCellWidthPercentage = 0;
        if (visibleColumnCount > 0) {
            baseCellWidthPercentage = (100 / visibleColumnCount).toFixed(2); // Calculate base width, rounded to two decimal places.
        }

        let rowTemplateMarkup = '<tr class="x-grid-row {isRowDirtyClass:this.getDirtyRowClass(parent)} {isNewRecord:this.getNewRecordClass(parent)}">';

        // Loop through each column definition to construct the HTML for data cells within a row.
        for (let idx = 0; idx < columnDefinitions.length; idx++) {
            const currentColumn = columnDefinitions[idx];
            const flexFactor = currentColumn.flex || 1;
            const calculatedWidth = (flexFactor * baseCellWidthPercentage).toFixed(2);

            let inlineStyle = currentColumn.style || ""; // Custom inline CSS styles for the cell.
            let cssClasses = currentColumn.cls || ""; // Custom CSS classes for the cell.

            // Add right padding to the last column for improved visual spacing.
            if (idx === columnDefinitions.length - 1) {
                inlineStyle += "padding-right: 10px;";
            }

            // Check if the column is marked as hidden.
            const isColumnHidden = currentColumn.hidden === true;
            if (isColumnHidden) {
                cssClasses += " x-grid-col-hidden"; // Add the hidden class.
            }

            // Append the data cell (<td>) HTML, using XTemplate placeholders for data binding.
            rowTemplateMarkup += `<td style="width:${calculatedWidth}%; ${inlineStyle}" class="x-grid-cell x-grid-col-${currentColumn.mapping} ${cssClasses} {isCellDirtyClass:this.getDirtyCellClass(parent)} {${currentColumn.mapping}:this.isEditable('${currentColumn.mapping}')}" data-column-id="${currentColumn.mapping}" data-row-idx="{rowIndex}">`;
            rowTemplateMarkup += `{${currentColumn.mapping}}`; // XTemplate placeholder for the column's data.
            rowTemplateMarkup += '</td>';
        }
        rowTemplateMarkup += '</tr>'; // Close the row HTML.

        return new Ext.DataView({
            store: inst.dataSource, // The data source for this view.
            itemSelector: "tr.x-grid-row", // CSS selector to identify individual data rows within the template.
            simpleSelect: inst.allowMultiSelection, // Configures single or multi-selection behavior.
            scroll: inst.scrollDirection, // Specifies the scrolling direction.
            cls: 'x-grid-body-dataview', // Custom CSS class for the DataView's main element.
            tpl: new Ext.XTemplate(
                '<div class="x-grid-table-scroll-container">', // Added a container for scrollable table.
                    '<table class="x-grid-data-table" style="width: 100%;">',
                        '<tpl for=".">', // Loop through each data record in the store.
                            rowTemplateMarkup, // Insert the generated row template.
                        '</tpl>',
                    '</table>',
                '</div>',
                {
                    // XTemplate helper function: Returns a CSS class if the row is dirty.
                    getDirtyRowClass: function(isDirtyFlag) {
                        return isDirtyFlag ? "x-grid-row-dirty" : "";
                    },
                    // XTemplate helper function: Returns a CSS class if a cell's data is dirty.
                    getDirtyCellClass: function(isDirtyFlag) {
                        return isDirtyFlag ? "x-grid-cell-dirty" : "";
                    },
                    // New XTemplate helper: Returns a class if the record is a new (phantom) record.
                    getNewRecordClass: function(isNewRecordFlag) {
                        return isNewRecordFlag ? "x-grid-row-new" : "";
                    },
                    // New XTemplate helper: Dynamically adds a class based on column editability.
                    isEditable: function(colId) {
                        const col = columnDefinitions.find(c => c.mapping === colId);
                        return col && col.editable ? 'x-grid-cell-editable' : '';
                    }
                }
            ),
            /**
             * Prepares raw data from the store record for rendering in the XTemplate.
             * This function is called for every record before it's passed to the template.
             * It applies column renderers and adds additional useful properties like dirty state.
             * @param {Object} rawData - The raw data object extracted from the record.
             * @param {Number} rowIndex - The zero-based index of the current row.
             * @param {Ext.data.Record} dataRecord - The full Ext.data.Record object.
             * @returns {Object} A processed data object ready for template consumption.
             */
            prepareData: function(rawData, rowIndex, dataRecord) {
                const processedRowData = {}; // Object to hold the prepared data.
                processedRowData.dirtyFields = {}; // Placeholder for dirty fields.

                // Iterate through each column definition to process its corresponding data value.
                for (let colIndex = 0; colIndex < columnDefinitions.length; colIndex++) {
                    const colDef = columnDefinitions[colIndex];

                    // Guard: Ensure the column definition has a 'mapping' property.
                    if (!colDef.mapping) {
                        console.warn("MobileDataGrid: Column definition missing 'mapping' property at index", colIndex);
                        continue;
                    }

                    // Apply a custom renderer function if one is defined for the column.
                    if (typeof colDef.renderer === "function") {
                        processedRowData[colDef.mapping] = colDef.renderer.apply(inst, [rawData[colDef.mapping], colDef, dataRecord, rowIndex]);
                    } else {
                        // Otherwise, use the raw data value directly.
                        processedRowData[colDef.mapping] = rawData[colDef.mapping];
                    }
                }

                // Add properties indicating the record's dirty state and its row index.
                processedRowData.isRowDirtyClass = dataRecord.dirty; // Aligned with XTemplate helper name.
                processedRowData.rowIndex = rowIndex;
                processedRowData.isNewRecord = dataRecord.phantom; // New property: true if record is new (phantom).

                return processedRowData;
            },
            // List of events that should bubble up from the DataView to its parent component.
            bubbleEvents: [
                "beforeselect",
                "containertap",
                "itemdoubletap",
                "itemswipe",
                "itemtap",
                "selectionchange",
                "itemlongpress" // Added new event: 'itemlongpress'.
            ]
        });
    },

    /**
     * Calculates the total sum of "flex" values for all currently visible columns.
     * This sum is used to determine the proportional widths of columns within the grid.
     * @param {boolean} includeHidden - If true, all columns are counted regardless of their 'hidden' state.
     * @returns {number} The aggregated flex sum of the relevant columns. Returns 0 if no columns are defined.
     */
    calculateVisibleColumnCount: function(includeHidden) {
        const inst = this; // Component instance alias.
        const columnDefinitions = inst.columnDefinitions; // Column configuration array.
        let totalFlexSum = 0; // Accumulator for flex factors.

        // Guard clause: If no columns are defined, return 0 immediately.
        if (!columnDefinitions || columnDefinitions.length === 0) {
            return 0;
        }

        // Iterate through each column definition using a modern Array.forEach loop.
        columnDefinitions.forEach(currentColumn => {
            // Skip columns that are explicitly hidden, unless `includeHidden` is true.
            if (!includeHidden && currentColumn.hidden === true) {
                return; // Continue to the next iteration in the loop.
            }
            // Only consider columns that have a defined header text (i.e., displayable columns).
            if (typeof currentColumn.header === "string" && currentColumn.header.length > 0) {
                totalFlexSum += currentColumn.flex || 1; // Add the column's flex factor, defaulting to 1.
            }
        });

        // Return the accumulated flex sum, ensuring it's at least 1 if there are displayable columns
        // to prevent division by zero in width calculations later.
        return totalFlexSum > 0 ? totalFlexSum : (columnDefinitions.length > 0 ? 1 : 0);
    },

    /**
     * Generates a mapping object where column 'mapping' identifiers are keys
     * and their corresponding zero-based indices in the `columnDefinitions` array are values.
     * This allows for quick lookup of a column's index by its identifier.
     * @returns {Object} An object mapping column identifiers to their array indices.
     */
    retrieveColumnMap: function() {
        const inst = this; // Component instance alias.
        const columnDefinitions = inst.columnDefinitions; // Column configuration array.
        const columnMappingCache = {}; // Initialize an empty object to store the mapping.

        // Guard clause: If no columns are defined, return an empty mapping.
        if (!columnDefinitions || columnDefinitions.length === 0) {
            return columnMappingCache;
        }

        // Populate the mapping cache by iterating through column definitions.
        for (let idx = 0; idx < columnDefinitions.length; idx++) {
            const colDef = columnDefinitions[idx];
            if (colDef.mapping) { // Only add to map if a 'mapping' property exists.
                columnMappingCache[colDef.mapping] = idx;
            }
        }
        return columnMappingCache;
    },

    /**
     * Toggles the visibility state of a specific column within the grid.
     * This affects both the header cell and all data cells for that column.
     * @param {Number|String} columnRef - The zero-based index of the column, or its 'mapping' identifier.
     */
    toggleColumnVisibility: function(columnRef) {
        const inst = this; // Component instance alias.
        let targetColumnIndex = columnRef; // Initialize the target index with the provided reference.

        // If a string (mapping identifier) is provided, resolve it to an array index.
        if (Ext.isString(columnRef)) {
            const columnMappingCache = inst.retrieveColumnMap();
            targetColumnIndex = columnMappingCache[columnRef];
        }

        // Validate the resolved column index.
        if (typeof targetColumnIndex !== 'number' || targetColumnIndex < 0 || targetColumnIndex >= inst.columnDefinitions.length) {
            console.warn("MobileDataGrid: Invalid column reference or index provided for toggleColumnVisibility:", columnRef);
            return;
        }

        const columnToToggle = inst.columnDefinitions[targetColumnIndex];
        const columnIdentifier = columnToToggle.mapping;
        const mainElement = inst.getEl(); // Get the main DOM element of the grid component.

        // Select all header (<th>) and data (<td>) cells that belong to the target column.
        const affectedCellElements = mainElement.query(`[data-column-id="${columnIdentifier}"]`);

        // Iterate through all identified cells and toggle their 'x-grid-col-hidden' CSS class.
        affectedCellElements.forEach(cellDomElement => {
            const currentCellElement = Ext.get(cellDomElement); // Wrap with Ext.Element.
            const isCurrentlyHidden = currentCellElement.hasCls("x-grid-col-hidden");

            if (isCurrentlyHidden) {
                currentCellElement.removeCls("x-grid-col-hidden");
                columnToToggle.hidden = false; // Update the column definition's hidden state.
            } else {
                currentCellElement.addCls("x-grid-col-hidden");
                columnToToggle.hidden = true; // Update the column definition's hidden state.
            }
        });

        // After changing column visibility, recalculate and re-apply new widths to ensure correct layout.
        inst.recalculateColumnDimensions();
        // Fire a new custom event to signal that a column's visibility has changed.
        inst.fireEvent('columnvisibilitychanged', inst, columnIdentifier, !columnToToggle.hidden);
    },

    /**
     * Recalculates and applies the appropriate widths to all visible grid cells
     * (both header and data cells). This method is essential for maintaining
     * correct column alignment after changes in column visibility or grid resizing.
     */
    recalculateColumnDimensions: function() {
        const inst = this; // Component instance alias.
        const mainElement = inst.getEl(); // Get the main DOM element of the grid.

        // Guard against missing essential DOM elements.
        if (!mainElement || !inst.gridHeader || !inst.gridHeader.getEl()) {
            console.warn("MobileDataGrid: Cannot recalculate dimensions; required DOM elements or header component are missing.");
            return;
        }

        const panelHeaderWidth = inst.gridHeader.getEl().getWidth(); // Get the current pixel width of the grid header.
        const columnDefinitions = inst.columnDefinitions; // Column configurations.
        const cellElements = mainElement.query("th.x-grid-cell, td.x-grid-cell"); // Select all header and data cells.
        const visibleColumnCount = inst.calculateVisibleColumnCount(false); // Count currently visible columns.

        let baseCellWidthPercentage = 0;
        if (visibleColumnCount > 0) {
            baseCellWidthPercentage = 100 / visibleColumnCount;
        }

        const columnMappingCache = inst.retrieveColumnMap(); // Get the column mapping for efficient lookup.

        // Iterate through all identified cell elements to apply new widths.
        cellElements.forEach(cellDomElement => {
            const currentCellElement = Ext.get(cellDomElement);
            const columnIdentifier = currentCellElement.getAttribute("data-column-id");

            // Skip if no valid column identifier is found for the cell.
            if (!columnIdentifier) {
                return;
            }

            const colIndex = columnMappingCache[columnIdentifier];
            // Skip if the column definition cannot be found for this identifier.
            if (typeof colIndex === 'undefined') {
                console.warn(`MobileDataGrid: Column definition not found in cache for identifier: ${columnIdentifier}`);
                return;
            }

            const currentColumn = columnDefinitions[colIndex];
            const flexFactor = currentColumn.flex || 1;

            // Calculate the new pixel width for the cell based on its flex factor and the header's total width.
            const newCellWidthPx = (flexFactor * baseCellWidthPercentage / 100) * panelHeaderWidth;

            // Apply the calculated width to the cell element.
            currentCellElement.setWidth(newCellWidthPx);
        });
        console.info("MobileDataGrid: Column dimensions successfully recalculated and applied.");
    },

    /**
     * Scrolls a specific data row into the visible viewport of the grid.
     * @param {Number} rowIndexValue - The zero-based index of the data row to scroll to.
     */
    scrollItemIntoView: function(rowIndexValue) {
        const inst = this; // Component instance alias.

        // Validate the provided row index value.
        if (typeof rowIndexValue !== 'number' || rowIndexValue < 0) {
            console.warn("MobileDataGrid: Invalid row index provided for scrollItemIntoView. Must be a non-negative number.");
            return;
        }

        const mainElement = inst.getEl(); // Get the main DOM element of the grid.
        // Query for actual data rows within the data table (excluding header rows).
        const rowElements = mainElement.query(".x-grid-data-table tr.x-grid-row");

        // Check if the target row index is within the bounds of existing rows.
        if (rowIndexValue >= rowElements.length) {
            console.warn(`MobileDataGrid: Row at index ${rowIndexValue} does not exist in the rendered view.`);
            return;
        }

        const targetRowElement = Ext.get(rowElements[rowIndexValue]); // Get the specific Ext.Element for the target row.
        const scrollManager = inst._dataDisplayView.scroller; // Access the DataView's internal scroller.

        // Guard against missing scroller or target element.
        if (!scrollManager || !targetRowElement || !targetRowElement.dom) {
            console.error("MobileDataGrid: Scroller or target row DOM element not found for scrolling operation.");
            return;
        }

        // Define the target scroll position (only vertical scrolling is considered here).
        const scrollPosition = {
            x: 0, // No horizontal scrolling.
            y: targetRowElement.dom.offsetTop // Scroll to the top of the target row element.
        };

        // Execute the scroll operation, potentially with animation (true).
        scrollManager.scrollTo(scrollPosition, true);
        console.log(`MobileDataGrid: Successfully scrolled to row index ${rowIndexValue}.`);
    },

    /**
     * Retrieves the internal Ext.DataView component instance used for displaying data.
     * @returns {Ext.DataView} The DataView component.
     */
    getDataContainer: function() {
        const inst = this; // Component instance alias.
        return inst._dataDisplayView;
    },

    /**
     * Binds a new Ext.data.Store instance to the grid's data display view.
     * This effectively changes the data source that the grid renders.
     * @param {Ext.data.Store} newDataStore - The new data store to be bound.
     */
    linkDataStore: function(newDataStore) {
        const inst = this; // Component instance alias.
        const dataViewInstance = inst.getDataContainer(); // Get the internal DataView component.

        // Guard against missing data store or data view.
        if (!newDataStore || !dataViewInstance) {
            console.error("MobileDataGrid: Cannot link data store. Either the new store or the DataView is missing.");
            return;
        }

        dataViewInstance.bindStore(newDataStore); // Delegate the binding operation to the DataView.
        inst.dataSource = newDataStore; // Update the component's internal reference to the data source.
        console.info("MobileDataGrid: New data store linked successfully.");
    },

    /**
     * Retrieves the Ext.data.Store instance currently bound to the grid.
     * @returns {Ext.data.Store|null} The bound data store, or null if no DataView is found.
     */
    fetchDataStore: function() {
        const inst = this; // Component instance alias.
        const dataViewInstance = inst.getDataContainer(); // Get the internal DataView component.

        if (!dataViewInstance) {
            console.warn("MobileDataGrid: DataView instance not found. Unable to fetch the bound store.");
            return null;
        }

        return dataViewInstance.getStore(); // Delegate to the DataView's method to get its store.
    },

    /**
     * Retrieves the DOM element for a specific data row in the grid.
     * The row can be identified either by its zero-based index or by an Ext.data.Record object.
     * @param {Number|Ext.data.Record} rowIndexVal - The index of the row, or the data record itself.
     * @returns {HTMLElement|null} The raw DOM element of the row, or null if the row is not found.
     */
    getGridRowElement: function(rowIndexVal) {
        const inst = this; // Component instance alias.
        let actualRowIndex = rowIndexVal; // Initialize the working index.

        // If an Ext.data.Record object is provided, determine its index in the store.
        if (Ext.isObject(rowIndexVal) && rowIndexVal.isModel) { // Check if it's an Ext.data.Model instance.
            const dataSource = inst.fetchDataStore();
            if (!dataSource) {
                console.warn("MobileDataGrid: Cannot locate row for record; data source is missing.");
                return null;
            }
            actualRowIndex = dataSource.indexOf(rowIndexVal); // Get the index of the record in the store.
        }

        // Validate the resolved row index.
        if (typeof actualRowIndex !== 'number' || actualRowIndex < 0) {
            console.warn("MobileDataGrid: Invalid row index or record provided for getGridRowElement.");
            return null;
        }

        const mainElement = inst.getEl(); // Get the main DOM element of the grid.
        // Query for actual data row elements within the .x-grid-data-table.
        const rowElements = mainElement.query(".x-grid-data-table tr.x-grid-row");

        // Return the DOM element at the calculated index if it exists.
        if (actualRowIndex < rowElements.length) {
            return rowElements[actualRowIndex];
        } else {
            console.warn(`MobileDataGrid: Data row at index ${actualRowIndex} not found in the rendered DOM.`);
            return null;
        }
    }
});

// Register the new component with ExtJS, allowing it to be instantiated using its xtype.
// The xtype "mobiledatagrid" can now be used in component configurations.
Ext.reg("mobiledatagrid", Ext.custom.MobileDataGrid);