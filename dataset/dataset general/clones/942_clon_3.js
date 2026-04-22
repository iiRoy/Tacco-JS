(function(jq){

	// This jQuery plugin facilitates dynamic content filtering for HTML tables.
	// It allows users to search within table rows based on input from a text field.
	jq.fn.data_table_searcher = function (customSettings) {

		// Establish default configuration options for the search functionality.
		var pluginConfig = jq.extend({
			
			'reverseFiltering': false,       // If true, rows that DO NOT match the filter are shown.
			'multiTermSearch': false,        // If true, space acts as a delimiter for multiple search terms.
			'dataTableSelector': '',         // Selector for the HTML table to be filtered (e.g., '#myTable').
			'dataCellIdentifier': 'td',      // Selector for the cells within each row to search (e.g., 'td', '.searchable-cell').
			'emptyResultMessage': '',        // Message to display when no rows match the filter.
			'emptyResultContainer': '',      // Selector for the element to display the 'no results' message (e.g., '#noResultsDiv').
			'debounceDelayMs': 200           // Milliseconds to wait before processing keyup events.

		}, customSettings);

		// Iterate over each selected input element to attach the search behavior.
		// Returning 'this' ensures jQuery method chaining remains intact.
		return this.each(function () {
			var $searchInputField = jq(this);
			var searchTimer = null; // Timer for debouncing the keyup event.

			// Attach an event listener for keyup events on the input field.
			// The event is debounced to improve performance.
			$searchInputField.on("keyup.tableSearch", function () { 
				// Clear any previous timer to reset the debounce countdown.
				clearTimeout(searchTimer);

				// Set a new timer to execute the filtering logic after the debounce delay.
				searchTimer = setTimeout(function() {
					performTableFiltering($searchInputField, pluginConfig);
				}, pluginConfig.debounceDelayMs);
			});
		});

	};

	/**
	 * Executes the actual table filtering logic based on the input field's value.
	 * @param {jQuery} $inputField - The jQuery object representing the search input field.
	 * @param {object} cfg - The plugin's configuration options.
	 */
	function performTableFiltering($inputField, cfg) {
		// Retrieve and normalize the current search query from the input field.
		var currentSearchQuery = $inputField.val().toLowerCase().trim();

		// Cache the target table jQuery object.
		var $targetTable = jq(cfg.dataTableSelector);

		// Guard clause: If the target table cannot be found, abort filtering.
		if ($targetTable.length === 0) {
			console.warn("data_table_searcher: Target table not found using selector '" + cfg.dataTableSelector + "'. Filtering aborted.");
			return;
		}

		// Early exit: If the search query is empty, reveal all rows and hide any 'no results' message.
		if (currentSearchQuery === "") {
			$targetTable.find("tr").removeClass('is-filtered-out');
			handleEmptyResultsDisplay(0, cfg); // 0 visible rows, effectively hiding message
			return;
		}
		
		// Select all data rows (excluding header rows) within the target table.
		var $allDataRows = $targetTable.find("tr:not(:has('th'))");
		var totalVisibleRows = 0; // Counter for rows that remain visible after filtering.

		// Iterate through each data row to determine its visibility.
		$allDataRows.each(function () {
			var $currentRow = jq(this);
			var rowMatchesCriteria = false; // Flag to indicate if the current row matches the search query.
			var $cellsInRow = $currentRow.find(cfg.dataCellIdentifier);
			var queryMatchCount = 0; // Count of matching search terms within the row.

			// Iterate through each searchable cell within the current row.
			$cellsInRow.each(function () {
				var cellContentLower = jq.trim(jq(this).text()).toLowerCase();
				
				// Determine how to check for matches based on the multiTermSearch setting.
				if (cfg.multiTermSearch) {
					// Split the search query into individual terms using space as a delimiter.
					var searchTerms = currentSearchQuery.split(" ");
					
					// Check if any of the search terms are present in the cell's content.
					jq.each(searchTerms, function (index, term) {
						if (term && cellContentLower.indexOf(term) !== -1) { // Ensure term is not empty
							queryMatchCount++;
						}
					});
				} else {
					// Perform a simple direct substring search.
					if (cellContentLower.indexOf(currentSearchQuery) !== -1) {
						queryMatchCount++;
					} 
				}
			});

			// Determine if the row should be visible based on matches and reverseFiltering logic.
			rowMatchesCriteria = (queryMatchCount > 0);
			var shouldRowBeVisible = cfg.reverseFiltering ? !rowMatchesCriteria : rowMatchesCriteria;

			// Toggle a CSS class to control row visibility.
			// The 'is-filtered-out' class should have 'display: none !important;' in CSS.
			$currentRow.toggleClass('is-filtered-out', !shouldRowBeVisible);

			// Increment totalVisibleRows if the current row is visible.
			if (shouldRowBeVisible) {
				totalVisibleRows++;
			}
		});

		// Update the 'no results' display based on the number of visible rows.
		handleEmptyResultsDisplay(totalVisibleRows, cfg);
	}

	/**
	 * Manages the display of the 'no results' message element.
	 * @param {number} visibleRowsCount - The number of data rows currently visible.
	 * @param {object} cfg - The plugin's configuration options.
	 */
	function handleEmptyResultsDisplay(visibleRowsCount, cfg) {
		var $noMatchElement = jq(cfg.emptyResultContainer);

		// Guard clause: Ensure the 'no results' display element exists and message is provided.
		if ($noMatchElement.length === 0 || !cfg.emptyResultMessage) {
			return;
		}

		// Show the 'no results' message if no rows are visible and a message is configured.
		if (visibleRowsCount === 0) {
			$noMatchElement.text(cfg.emptyResultMessage).removeClass('is-hidden-message');
		} else {
			// Otherwise, hide the 'no results' message.
			$noMatchElement.addClass('is-hidden-message');
		}
	}

})(jQuery);

/*
CSS for 'is-filtered-out' and 'is-hidden-message' classes:
.is-filtered-out {
    display: none !important;
}
.is-hidden-message {
    display: none !important;
}
*/