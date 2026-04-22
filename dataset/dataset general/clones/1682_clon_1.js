/*
 * This file defines the Ext.ux.TouchGridPanel class.
 * It's a custom grid panel component for ExtJS, specifically designed
 * to handle touch interactions and display data in a tabular format.
 * The original implementation faced limitations with WebKit's CSS3 column layout,
 * leading to a decision to utilize HTML tables for rendering.
 * This ensures broader compatibility and consistent display across devices.
 * Version 1.0.1 - Refactored for clarity and strict Type I clone adherence.
 */

Ext.ns("Ext.ux"); // Ensure the Ext.ux namespace is properly defined for our custom components.


Ext.ux.TouchGridPanel = Ext.extend(Ext.Panel, {
	layout        : "fit", // The layout for this panel will be 'fit', making its single child fill the entire area.

	multiSelect   : false, // By default, multiple selection is disabled in the grid.
	scroll        : "vertical", // The grid content will scroll vertically if it overflows.


	initComponent : function() {
		var me = this; // Capture a reference to 'this' for use within nested functions.

		// Build the DataView component and assign it as both the panel's items and its dataview property.
		me.items = me.dataview = me.buildDataView();

		// Check if 'dockedItems' array exists, if not, initialize it to prevent errors.
		if (!Ext.isArray(me.dockedItems)) {
			me.dockedItems = [];
		}

		// Create the grid header component using the buildHeader method.
		me.header = new Ext.Component(me.buildHeader());
		me.dockedItems.push(me.header); // Add the newly created header to the panel's docked items.

		// Call the superclass's initComponent method to ensure proper inheritance chain initialization.
		Ext.ux.TouchGridPanel.superclass.initComponent.call(me);

		var store = me.store; // Get a reference to the data store associated with this grid.

		// Attach an event listener to the store's 'update' event to handle data changes.
		store.on("update", me.dispatchDataChanged, me);
	}, // End of initComponent function.


	dispatchDataChanged: function(store, rec, operation) {
		var me = this; // Reference to the current instance.

		// Fire a custom event named 'storeupdate' to notify any listeners about the store's data change.
		me.fireEvent("storeupdate", store, rec, operation);
	}, // End of dispatchDataChanged function.


	buildHeader   : function() {
		var me        = this,
			colModel  = me.colModel, // The column model definition for the grid.
			colNum    = me.getColNum(false), // Get the number of visible columns.
			cellWidth = 100/colNum, // Calculate the percentage width for each cell based on column count.
			colTpl    = '<table class="x-grid-header">'; // Start building the HTML template for the header.

		colTpl += '    <tr>'; // Open the table row for header cells.
		for (var i = 0; i < colModel.length; i++) { // Iterate through each column defined in the column model.
			var col  = colModel[i], // Current column configuration.
				flex = col.flex || 1, // Determine column flexibility, defaulting to 1.
				cls  = ""; // Initialize CSS class string for the cell.

			var width = flex * cellWidth; // Calculate the final width for the column.

			if (col.hidden) { // If the column is marked as hidden.
				cls += "x-grid-col-hidden"; // Add the hidden class.
			}

			// Append the HTML for the header cell, including width, classes, mapping, and header text.
			colTpl += '<td width="' + width + '%" class="x-grid-cell x-grid-hd-cell x-grid-col-' + col.mapping + ' ' + cls + '" mapping="' + col.mapping + '">' + col.header + '</td>';
		}
		colTpl += '    </tr>'; // Close the table row.
		colTpl += '</table>'; // Close the header table.

		return { // Return a configuration object for the header component.
			dock      : "top", // Position the header at the top of the panel.
			html      : colTpl, // The generated HTML content for the header.
			listeners : { // Event listeners for the header component.
				scope       : me, // Set the scope of the listener functions to the current grid instance.
				afterrender : me.initHeaderEvents // Call initHeaderEvents after the header component is rendered.
			}
		};
	}, // End of buildHeader function.


	initHeaderEvents: function(cmp) {
		var me = this, // Reference to the grid instance.
			el = cmp.getEl(); // Get the DOM element of the header component.

		el.on("click", me.handleHeaderClick, me); // Attach a click event listener to the header element.
	}, // End of initHeaderEvents function.


	handleHeaderClick: function(e, t) {
		e.stopEvent(); // Prevent the default action of the click event.

		var me      = this, // Reference to the grid instance.
			el      = Ext.get(t), // Wrap the clicked target element with Ext.Element.
			mapping = el.getAttribute("mapping"); // Get the 'mapping' attribute, which identifies the column.

		if (typeof mapping === "string") { // Ensure a valid mapping was found.
			me.store.sort(mapping); // Sort the grid's store by the clicked column.
			el.set({ // Update the clicked header cell's 'sort' attribute.
				sort : me.store.sortToggle[mapping] // Set sort direction indicator.
			});
		}
	}, // End of handleHeaderClick function.


	buildDataView : function() {
		var me        = this,
			colModel  = me.colModel, // Column model definition.
			colNum    = me.getColNum(false), // Number of visible columns.
			colTpl    = '<tr class="x-grid-row {isDirty:this.isRowDirty(parent)}">', // Template for a single grid row.
			cellWidth = 100/colNum; // Calculated width for cells.

		for (var i = 0; i < colModel.length; i++) { // Loop through each column to build its cell template.
			var col   = colModel[i], // Current column configuration.
				flex  = col.flex || 1, // Column flex value, defaults to 1.
				width = flex * cellWidth, // Calculated column width.
				style = (i === colModel.length - 1) ? "padding-right: 10px;" : "", // Add right padding to the last column.
				cls   = col.cls || ""; // Custom CSS class for the column.

			style += col.style || ""; // Append any additional custom styles for the column.

			if (col.hidden) { // If the column is configured as hidden.
				cls += "x-grid-col-hidden"; // Add the 'x-grid-col-hidden' class.
			}

			// Construct the HTML for a data cell within a row, including data binding, styles, and classes.
			colTpl += '<td width="' + width + '%" class="x-grid-cell x-grid-col-' + col.mapping + ' ' + cls + ' {isDirty:this.isCellDirty(parent)}" style="' + style + '" mapping="' + col.mapping + '" rowIndex="{rowIndex}">{' + col.mapping + '}</td>';
		}
		colTpl += '</tr>'; // Close the table row template.

		return new Ext.DataView({ // Return a new Ext.DataView instance.
			store        : me.store, // The data store to be used by the DataView.
			itemSelector : "tr.x-grid-row", // CSS selector to identify individual items (rows) in the DataView.
			simpleSelect : me.multiSelect, // Configure simple selection based on the panel's multiSelect property.
			scroll       : me.scroll, // Configure scrolling behavior.
			tpl          : new Ext.XTemplate( // Define the XTemplate for rendering the DataView items.
				'<table style="width: 100%;">', // Outer table wrapper for the grid body.
					'<tpl for=".">', // Loop through each record in the store.
						colTpl, // Insert the pre-built column template for each row.
					'</tpl>',
				'</table>', // Close the outer table.
				{ // XTemplate helper functions for conditional CSS classes.
					isRowDirty: function(dirty, data) { // Helper to determine if a row should have a 'dirty' class.
						return dirty ? "x-grid-row-dirty" : "";
					},
					isCellDirty: function(dirty, data) { // Helper to determine if a cell should have a 'dirty' class.
						return dirty ? "x-grid-cell-dirty" : "";
					}
				}
			),
			prepareData  : function(data, index, record) { // Function to prepare data before it's rendered by the XTemplate.
				var column,
					i  = 0,
					ln = colModel.length; // Declare variables for loop.
				var prepare_data = {}; // Initialize an object to hold the prepared data.
				prepare_data.dirtyFields = {}; // Placeholder for dirty fields.
				for (; i < ln; i++) { // Iterate through each column.

					column = colModel[i]; // Current column definition.
					if (typeof column.renderer === "function") { // If a custom renderer function is defined for the column.
						// Apply the renderer to the data value.
						prepare_data[column.mapping] = column.renderer.apply(me, [data[column.mapping],column, record, index]);
					} else {
						prepare_data[column.mapping] = data[column.mapping]; // Otherwise, use the raw data value.
					}
				}

				prepare_data.isDirty = record.dirty; // Add a property indicating if the record itself is dirty.

				prepare_data.rowIndex = index; // Store the current row's index.
				return prepare_data; // Return the prepared data object.
			},
			bubbleEvents : [ // List of events that should bubble up from the DataView to the parent grid.
				"beforeselect",
				"containertap",
				"itemdoubletap",
				"itemswipe",
				"itemtap",
				"selectionchange"
			]
		}); // End of Ext.DataView configuration.
	}, // End of buildDataView function.


	// Helper method to calculate the number of columns, optionally including hidden ones.
	// hidden = true to count all columns, false (default) to count only visible ones.
	getColNum     : function(hidden) {
		var me       = this,
			colModel = me.colModel, // The grid's column model.
			colNum   = 0; // Initialize column count.

		for (var i = 0; i < colModel.length; i++) { // Iterate through all columns.
			var col = colModel[i]; // Current column.
			// Skip columns that don't have a header string if we're only counting visible ones.
			if (!hidden && typeof col.header !== "string") { continue; }
			// If the column is not hidden, or if we're counting all columns regardless of visibility.
			if (!col.hidden) {
				colNum += col.flex || 1; // Add its flex value (or 1 if not specified) to the total.
			}
		}

		return colNum; // Return the final count of columns.
	}, // End of getColNum function.


	// Creates a mapping object from column 'mapping' strings to their respective indices in the colModel.
	getMappings: function() {
		var me       = this,
			mappings = {}, // Initialize an empty object to store mappings.
			colModel = me.colModel; // The grid's column model.

		for (var i = 0; i < colModel.length; i++) { // Loop through each column.
			mappings[colModel[i].mapping] = i; // Map the column's 'mapping' property to its index.
		}

		return mappings; // Return the generated mappings object.
	}, // End of getMappings function.


	// Toggles the visibility of a specific column based on its index or mapping string.
	toggleColumn: function(index) {
		var me = this; // Reference to the grid instance.

		if (typeof index === "string") { // If the index provided is a string (column mapping).
			var mappings = me.getMappings(); // Get the column mappings.
			index = mappings[index]; // Convert the mapping string to its numerical index.
		}
		var el      = me.getEl(), // Get the grid's main DOM element.
			mapping = me.colModel[index].mapping, // Get the column's data mapping string.
			cells   = el.query("td.x-grid-col-"+mapping); // Find all cells belonging to this column.

		for (var c = 0; c < cells.length; c++) { // Iterate through all found cells.
			var cellEl = Ext.get(cells[c]); // Wrap the current cell DOM element with Ext.Element.
			if (cellEl.hasCls("x-grid-col-hidden")) { // If the cell currently has the hidden class.
				cellEl.removeCls("x-grid-col-hidden"); // Remove the hidden class to make it visible.
				this.colModel[index].hidden = false; // Update the column model's hidden state.
			} else { // If the cell is currently visible.
				cellEl.addCls("x-grid-col-hidden"); // Add the hidden class to conceal it.
				this.colModel[index].hidden = true; // Update the column model's hidden state.
			}
		}

		me.updateWidths(); // After toggling visibility, recalculate and apply new column widths.
	}, // End of toggleColumn function.


	// Recalculates and updates the widths of all visible columns in the grid.
	updateWidths: function() {
		var me          = this,
			el          = me.getEl(), // The grid's main DOM element.
			headerWidth = me.header.getEl().getWidth(), // The total width of the grid header.
			colModel    = me.colModel, // The grid's column model.
			cells       = el.query("td.x-grid-cell"), // All data cells in the grid.
			colNum      = me.getColNum(false), // Number of currently visible columns.
			cellWidth   = 100/colNum, // Base percentage width per column.
			mappings    = me.getMappings(); // Column mapping to index.

		for (var c = 0; c < cells.length; c++) { // Iterate through each data cell.
			var cellEl  = Ext.get(cells[c]), // Wrap the current cell DOM element.
				mapping = cellEl.getAttribute("mapping"), // Get the column mapping for this cell.
				col     = colModel[mappings[mapping]], // Get the column configuration from the colModel.
				flex    = col.flex || 1, // Column flex value.
				width   = flex * cellWidth / 100 * headerWidth; // Calculate the final pixel width.

			cellEl.setWidth(width); // Apply the calculated width to the cell.
		}
	}, // End of updateWidths function.


	// Scrolls the grid's DataView to a specific row based on its index.
	scrollToRow: function(index) {
		var me       = this,
			el       = me.getEl(), // The grid's main DOM element.
			rows     = el.query("tr.x-grid-row"), // All data rows in the grid.
			rowEl    = Ext.get(rows[index]), // The target row element.
			scroller = me.dataview.scroller; // The scroller instance of the DataView.

		var pos = { // Define the target scroll position.
			x: 0, // Scroll to the far left horizontally.
			y: rowEl.dom.offsetTop // Scroll vertically to the top of the target row.
		};

		scroller.scrollTo(pos, true); // Perform the scroll, with animation (true).
	}, // End of scrollToRow function.


	// Returns the internal Ext.DataView component used by the grid.
	getView: function() {
		var me = this; // Reference to the grid instance.

		return me.dataview; // Simply return the DataView.
	}, // End of getView function.


	// Binds a new data store to the grid's DataView.
	bindStore: function(store) {
		var me   = this, // Reference to the grid instance.
			view = me.getView(); // Get the internal DataView.

		view.bindStore(store); // Delegate the store binding operation to the DataView.
	}, // End of bindStore function.


	// Retrieves the currently bound data store from the grid's DataView.
	getStore: function() {
		var me   = this, // Reference to the grid instance.
			view = me.getView(); // Get the internal DataView.

		return view.getStore(); // Delegate the store retrieval operation to the DataView.
	}, // End of getStore function.


	// Retrieves a specific HTML row element from the grid by its index or a record object.
	getRow: function(index) {
		var me = this; // Reference to the grid instance.
		// If 'index' is an object (presumably a record), find its index within the store.
		if (typeof index === "object") {
			var store = me.getStore(), // Get the grid's store.
				index = store.indexOf(index); // Find the index of the provided record.
		}

		var el   = me.getEl(), // The grid's main DOM element.
			rows = el.query("tr"); // Query for all table row elements.

		// Return the row element. Note: +1 accounts for the header row which is also a 'tr' but not a data row.
		return rows[index+1];
	} // End of getRow function.
}); // End of Ext.extend definition for Ext.ux.TouchGridPanel.

Ext.reg("touchgridpanel", Ext.ux.TouchGridPanel); // Register the Ext.ux.TouchGridPanel component with the xtype "touchgridpanel".