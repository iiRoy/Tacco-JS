(function() { // Anonymous function wrapper for scope isolation

	// Establish a local alias for jQuery to avoid conflicts and improve minification.
	var jqHandle = window.jQuery;

	/**
	 * @class GridDataSorter
	 * @description Core constructor for the table sorting functionality.
	 * @param {jQuery} targetTableElement - The jQuery object representing the table to be made sortable.
	 * @param {object} customOptions - User-defined options to override defaults.
	 */
	jqHandle.tableSorter = function (targetTableElement, customOptions) {
		// Store a reference to this instance for use in callbacks.
		var pluginRef = this;

		// Validate the input element is indeed a table.
		if (!targetTableElement || !targetTableElement.is('table')) {
			console.error("GridDataSorter: Provided element is not a valid table.", targetTableElement);
			return; // Exit if not a table.
		}

		this.boundTable = targetTableElement;
		// Attempt to find the table's header section. If not present, sorting might be less robust.
		this.tableHeaderGroup = this.boundTable.find('thead');

		// Merge default options with user-provided settings.
		this.configuration = jqHandle.extend({}, jqHandle.tableSorter.defaultOptions, customOptions);

		// Attach a click event handler to all header cells (<th>) within the table.
		// The '.gridSort' namespace ensures we can unbind only our specific handler later.
		this.boundTable.find('th').on('click.gridSort', function() {
			pluginRef.performSort(jqHandle(this)); // Trigger the sorting method.
		});

		// Initialize internal state variables.
		this.currentColumnIndex = null; // Index of the currently sorted column.
		this.activeHeaderCell = null; // Reference to the currently active header cell.
		this.sortDirection = null; // Current sorting order ('asc' or 'desc').
	};

	/**
	 * @description Prototype methods for the GridDataSorter plugin.
	 */
	jqHandle.tableSorter.prototype = {

		/**
		 * Executes the sorting operation on the table.
		 * @param {jQuery} headerElement - The jQuery object of the header cell that was clicked.
		 * @param {string} [preferredOrder] - Optional, explicit sort order ('asc' or 'desc').
		 */
		performSort: function(headerElement, preferredOrder) {
			const processStartTime = new Date(); // Record start time for performance measurement.
			const instanceRef = this;
			const targetTable = this.boundTable;

			// Determine the target column index.
			const columnIndex = headerElement.index();

			// Select relevant rows from the table body. Prefer tbody, otherwise look for tr with td.
			const bodyRows = this.tableHeaderGroup.length > 0 ? targetTable.find('tbody > tr') : targetTable.find('tr:has(td)');
			// Select all cells in the target column across all rows.
			const columnCells = targetTable.find(`tr td:nth-of-type(${columnIndex + 1})`);

			// Retrieve a custom sort key function or value from the header's data attributes.
			const customSortKeyFn = headerElement.data().customSortKey;

			// Helper to get the actual value for sorting from a cell.
			const getCellValue = (cellElement) => {
				if (customSortKeyFn) {
					// If customSortKeyFn is a function, call it; otherwise, use its value directly.
					return (typeof customSortKeyFn === 'function') ? customSortKeyFn(headerElement, cellElement, instanceRef) : customSortKeyFn;
				}
				// Default: use 'data-sort-value' if present, otherwise fall back to cell text.
				return (cellElement.data().sortValue !== undefined && cellElement.data().sortValue !== null) ? cellElement.data().sortValue : cellElement.text();
			};

			// Extract all values from the target column cells.
			const extractedValues = columnCells.map((itemIndex, currentCell) => getCellValue(jqHandle(currentCell))).get();

			// If no values are found, there's nothing to sort.
			if (!extractedValues.length) {
				instanceRef.outputDebugMessage(`No sortable values found in column ${columnIndex}.`);
				return;
			}

			// Clear previous sorting indicators from all header cells.
			this.boundTable.find('th').removeClass(`${this.configuration.sortAscendingClass} ${this.configuration.sortDescendingClass}`);

			// Determine the new sort direction.
			if (preferredOrder !== 'asc' && preferredOrder !== 'desc') {
				// If no explicit order, toggle the current direction.
				this.sortDirection = (this.sortDirection === 'asc') ? 'desc' : 'asc';
			} else {
				// Use the explicit order provided.
				this.sortDirection = preferredOrder;
			}

			// Set the multiplier for the comparison function based on the sort direction.
			const sortMultiplier = (this.sortDirection === 'asc') ? 1 : -1;

			// Announce the start of the sorting process.
			this.boundTable.trigger('gridSort:processing', [instanceRef]);
			this.outputDebugMessage(`Initiating sort for column ${columnIndex} in ${this.sortDirection} order.`);

			// Create an array of objects, each linking an original row/cell to its extracted value.
			const sortableEntriesCollection = bodyRows.map((index, row) => ({
				originalIndex: index,
				cellRef: columnCells[index],
				rowRef: row,
				sortableValue: extractedValues[index]
			})).get(); // .get() converts jQuery object to a plain array.

			// Define a comparison function for sorting.
			const compareSortableValues = (entryA, entryB) => {
				const valA = entryA.sortableValue;
				const valB = entryB.sortableValue;

				if (valA > valB) {
					return 1 * sortMultiplier;
				} else if (valA < valB) {
					return -1 * sortMultiplier;
				} else {
					return 0; // Values are equal.
				}
			};

			// Perform the actual sort on the collection of entries.
			sortableEntriesCollection.sort(compareSortableValues);

			// Re-append rows to the table in the new sorted order.
			// This implicitly removes them from their old position and adds them to the end.
			sortableEntriesCollection.forEach(entry => {
				targetTable.append(entry.rowRef);
			});

			// Apply the appropriate class to the sorted header cell.
			if (headerElement) { // Ensure headerElement is still valid
				headerElement.addClass(this.configuration[this.sortDirection === 'asc' ? 'sortAscendingClass' : 'sortDescendingClass']);
			}

			// Log the duration and announce the completion of sorting.
			this.outputDebugMessage(`Sort operation completed in ${((new Date()).getTime() - processStartTime.getTime())}ms.`);
			this.boundTable.trigger('gridSort:finished', [instanceRef]);
		},

		/**
		 * Outputs a debug message to the console if debugging is enabled.
		 * @param {string} debugMessage - The message to log.
		 */
		outputDebugMessage: function(debugMessage) {
			// Check if global debug flag or instance-specific debug mode is active and console exists.
			if ((jqHandle.tableSorter.GLOBAL_DEBUG_FLAG || this.configuration.debugMode) && typeof console !== 'undefined' && console.log) {
				console.log(`[GridSorter] ${debugMessage}`);
			}
		},

		/**
		 * Cleans up the plugin instance by unbinding events and removing data.
		 */
		decommission: function() {
			// Remove our specific click handler from header cells.
			this.boundTable.find('th').off('click.gridSort');
			// Remove the plugin instance reference from the table's data.
			this.boundTable.removeData('tableSorterInstance');
			// Explicitly release references to aid garbage collection.
			this.boundTable = null;
			this.tableHeaderGroup = null;
			this.configuration = null;
			return undefined; // Indicate no meaningful return value.
		}
	};

	// Global debug switch for all tableSorter instances.
	jqHandle.tableSorter.GLOBAL_DEBUG_FLAG = false;

	// Default configuration options for the plugin.
	jqHandle.tableSorter.defaultOptions = {
		debugMode: jqHandle.tableSorter.GLOBAL_DEBUG_FLAG, // Inherit from global flag by default.
		sortAscendingClass: 'sorted-up', // CSS class for ascending sort.
		sortDescendingClass: 'sorted-down' // CSS class for descending sort.
	};

	/**
	 * @description jQuery plugin entry point. Makes selected tables sortable.
	 * @param {object} userSettings - Optional settings object.
	 * @returns {jQuery} The jQuery object for chaining.
	 */
	jqHandle.fn.makeSortable = function(userSettings) {
		const pluginDataKey = 'tableSorterInstance'; // Key for storing plugin instance in data.

		// Iterate over each selected element to apply the plugin.
		return this.each(function() {
			const currentTableElement = jqHandle(this);

			// Ensure the element is actually a table before proceeding.
			if (!currentTableElement.is('table')) {
				console.warn("makeSortable: Skipping non-table element:", currentTableElement);
				return;
			}

			// Check if a sorter instance already exists for this table.
			let existingInstance = currentTableElement.data(pluginDataKey);

			if (existingInstance) {
				// If an instance exists, decommission it first to prevent multiple bindings.
				existingInstance.decommission();
				existingInstance = null; // Clear reference.
			}

			// Create a new instance of the GridDataSorter and store it in the table's data.
			const sorterInstance = new jqHandle.tableSorter(currentTableElement, userSettings);
			currentTableElement.data(pluginDataKey, sorterInstance);
		});
	};

})(); // End of the anonymous function wrapper.