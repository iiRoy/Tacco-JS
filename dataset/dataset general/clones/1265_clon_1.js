// This is a Type I clone of the original TableSorter JavaScript code.
// No functional changes have been made; only whitespace and comments have been altered.

/*
 *
 * This file contains the core logic for the TableSorter plugin, version 2.0.3.
 * It is designed to work with jQuery v1.2.3 or later.
 *
 * Original Copyright (c) 2007 Christian Bach.
 * For examples, documentation, and further details, please visit: http://tablesorter.com
 * This software is dual licensed under the MIT and GPL licenses.
 * You can find the license texts at:
 *   - MIT License: http://www.opensource.org/licenses/mit-license.php
 *   - GPL License: http://www.gnu.org/licenses/gpl.html
 *
 */

/**
 *
 * @description This jQuery plugin transforms a standard HTML table into a sortable table,
 *              supporting multi-column sorting capabilities.
 *
 * @example
 *   // Basic usage: Initialize tablesorter on all tables.
 *   $('table').tablesorter();
 *
 * @desc Create a simple tablesorter interface on a table element.
 *
 * @example
 *   // Advanced usage: Sort by the first column ascending, then the second column ascending.
 *   $('table').tablesorter({ sortList:[[0,0],[1,0]] });
 *
 * @desc Create a tablesorter interface and apply an initial sort order
 *       to the first and second columns, both in ascending order.
 *
 * @example
 *   // Configuration: Disable sorting for specific columns.
 *   $('table').tablesorter({ headers: { 0: { sorter: false}, 1: {sorter: false} } });
 *
 * @desc Create a tablesorter interface and explicitly disable sorting
 *       for the first (index 0) and second (index 1) column headers.
 *
 * @example
 *   // Custom parsers: Apply specific parsers to columns.
 *   $('table').tablesorter({ headers: { 0: {sorter:"integer"}, 1: {sorter:"currency"} } });
 *
 * @desc Create a tablesorter interface and assign custom column parsers
 *       ("integer" for the first column, "currency" for the second).
 *
 *
 * @param Object settings An object literal which may contain various key/value pairs
 *                        to customize the optional settings of the tablesorter.
 *
 * @option String cssHeader (optional)
 *   A string representing the class name to be appended to sortable `<th>` elements
 *   within the `<thead>` section of the table.
 *   Default value: "header"
 *
 * @option String cssAsc (optional)
 *   A string representing the class name to be appended to sortable `<th>` elements
 *   when the column is sorted in ascending order.
 *   Default value: "headerSortUp"
 *
 * @option String cssDesc (optional)
 *   A string representing the class name to be appended to sortable `<th>` elements
 *   when the column is sorted in descending order.
 *   Default value: "headerSortDown"
 *
 * @option String sortInitialOrder (optional)
 *   A string specifying the initial sorting order. Accepted values are "asc" for ascending
 *   or "desc" for descending.
 *   Default value: "asc"
 *
 * @option String sortMultisortKey (optional)
 *   A string specifying the keyboard key that, when held down, enables multi-column sorting.
 *   Default value: "shiftKey" (i.e., the Shift key)
 *
 * @option String textExtraction (optional)
 *   A string indicating the method to use for extracting text from table cells for sorting.
 *   Use "simple" for basic text, or "complex" for more intricate HTML structures within `<td>` cells.
 *   Note: The "complex" option can be slower on large tables.
 *   Default value: "simple"
 *
 * @option Object headers (optional)
 *   An object literal where keys are column indices and values are objects specifying
 *   sorting rules or parsers for those columns. For example, `{ 0: { sorter: false } }`
 *   to disable sorting for the first column.
 *   Default value: null
 *
 * @option Array sortList (optional)
 *   An array of arrays, where each inner array specifies a column and its sort order.
 *   e.g., `[[0,0],[1,1]]` means sort column 0 ascending, then column 1 descending.
 *   Default value: null
 *
 * @option Array sortForce (optional)
 *   An array containing forced sorting rules. These rules are prepended to any
 *   user-selected sorting rules.
 *   Default value: null
 *
 * @option Array sortAppend (optional)
 *   An array containing forced sorting rules. These rules are appended to any
 *   user-selected sorting rules.
 *   Default value: null
 *
 * @option Boolean widthFixed (optional)
 *   A boolean flag indicating whether tablesorter should attempt to apply fixed widths
 *   to the table columns. This is particularly useful when integrating with the pager
 *   companion plugin. This option also requires the jQuery dimensions plugin.
 *   Default value: false
 *
 * @option Boolean cancelSelection (optional)
 *   A boolean flag indicating whether tablesorter should prevent text selection
 *   on the table headers.
 *   Default value: true
 *
 * @option Boolean debug (optional)
 *   A boolean flag that, when true, causes tablesorter to output debugging information
 *   to the console (or via alert) during development.
 *   Default value: false
 *
 * @type jQuery
 *
 * @name tablesorter
 *
 * @cat Plugins/Tablesorter
 *
 * @author Christian Bach / christian.bach@polyester.se
 */

( function( $ ) {

	// Extend jQuery's namespace with the tablesorter plugin.
	$.extend({

		// Define the tablesorter plugin as a new anonymous function constructor.
		tablesorter: new function() {

			// Private arrays to store registered parsers and widgets.
			var parsers = [],
				widgets = [];

			// Default configuration options for the tablesorter plugin.
			this.defaults = {
				cssHeader:            "header",           // Class for sortable headers.
				cssAsc:               "headerSortUp",     // Class for ascending sort.
				cssDesc:              "headerSortDown",   // Class for descending sort.
				sortInitialOrder:     "asc",              // Initial sort order ('asc' or 'desc').
				sortMultiSortKey:     "shiftKey",         // Key to hold for multi-column sort.
				sortForce:            null,               // Forced sorting rules (prepended).
				sortAppend:           null,               // Forced sorting rules (appended).
				textExtraction:       "simple",           // Method for extracting cell text.
				parsers:              {},                 // Custom parsers for columns.
				widgets:              [],                 // Active widgets.
				widgetZebra:          {css: ["even","odd"]}, // Zebra widget CSS classes.
				headers:              {},                 // Specific header configurations.
				widthFixed:           false,              // Fix column widths.
				cancelSelection:      true,               // Prevent header text selection.
				sortList:             [],                 // Initial sort list.
				headerList:           [],                 // Internal list of header elements.
				dateFormat:           "us",               // Date format ('us' or 'uk').
				decimal:              '.',                // Decimal separator.
				debug:                false,              // Enable debug logging.
				customMap:            []                  // Custom column mapping for complex headers.
			};


			/* --- Debugging Utility Functions --- */

			/**
			 * Records and logs the time elapsed for a given operation.
			 * @param {string} s - Description of the operation.
			 * @param {Date} d - Start time of the operation.
			 */
			function benchmark( s, d ) {
				// Output the benchmark result to the console or as an alert.
				log( s + ": " + ( new Date().getTime() - d.getTime() ) + "ms" );
			}

			// Expose the benchmark function on the tablesorter instance.
			this.benchmark = benchmark;

			/**
			 * Logs a message to the console if available, otherwise uses alert.
			 * @param {string} s - The message to log.
			 */
			function log( s ) {
				// Check if the browser's console object and its debug method are available.
				if ( console !== undefined && console.debug !== undefined ) {
					console.log( s ); // Use console.log for standard logging.
				} else {
					alert( s ); // Fallback to alert if console is not available.
				}
			}

			/**
			 * Finds a value in a custom map structure, typically used for column remapping.
			 * @param {Array<Array<any>>} map - The custom map array.
			 * @param {number} index - The index to search for.
			 * @param {boolean} reverse - If true, searches in the second element of the inner array.
			 * @returns {Array<any>} An array of mapped values or the original index if not found.
			 */
			function findInMap( map, index, reverse ) {

				var output = []; // Initialize an empty array for results.

				// Iterate through the map to find a match.
				for ( var i = 0; i < map.length; ++i ) {

					// Check if the current map entry matches the index.
					if ( map[i][ reverse ? 1 : 0 ] == index ) {

						var tmp = map[i][ reverse ? 1 : 0 ]; // Get the mapped value.

						// If the mapped value is an array, push its elements individually.
						if ( $.isArray( tmp ) ) {
							for ( kk = 0; kk < tmp.length; ++kk ) {
								output.push( tmp[kk] );
							}
						} else {
							output.push( tmp ); // Otherwise, push the value directly.
						}

						break; // Stop searching once a match is found.
					}
				}

				// If no output was generated, return the original index as a fallback.
				if ( ! output.length ) {
					output.push( index );
				}
				return output; // Return the collected mapped values.
			}

			/* --- Fix for colspan issue in table headers --- */

			/**
			 * Detects and creates a mapping for columns, especially when colspans are present in the header.
			 * This helps in correctly associating header cells with data columns.
			 * @param {HTMLTableElement} table - The table element.
			 * @returns {Array<Array<any>>} A map of header cell indices to data column indices.
			 */
			function detectColspan( table ) {

				// Determine the number of data columns from the first row of the tbody.
				var ncolsdata = table.tBodies[0].children[0].children.length;
				var iscolumndone = []; // Track which data columns have been mapped.

				// Initialize all data columns as unmapped.
				for ( var k = 0; k < ncolsdata; k++ ) {
					iscolumndone[k] = 0;
				}

				var nrows = table.children[0].children.length; // Number of header rows.
				var map = []; // The resulting column map.
				var cosa; // Unused variable, probably a leftover.

				var jcolheadindex = 0; // Current header column index.

				// Iterate through each header row.
				for ( i = 0; i < nrows; i++ ) {

					var tr = table.children[0].children[i]; // Current header row.
					var ncolshead = tr.children.length; // Number of header cells in this row.
					jcoldata = 0; // Current data column index.

					// Iterate through each header cell in the current row.
					for ( j = 0; j < ncolshead; j++ ) {

						// Find the next available data column index.
						// This line `$.inArray(jcoldata, iscolumndone)` seems incorrect and
						// will always return -1 if jcoldata is not 0 or 1.
						// It should likely be a search for the next `0` in `iscolumndone`.
						// Keeping it as is for Type I clone.
						jcoldata = $.inArray( jcoldata, iscolumndone );


						var colspan = parseInt( tr.children[j].getAttribute( "colspan" ) ); // Get colspan attribute.
						if ( ! colspan ) {
							colspan = 1; // Default to 1 if colspan is not specified or invalid.
						}

						if ( colspan == 1 ) {
							map.push( [ jcolheadindex, jcoldata ] ); // Map header cell to a single data column.
							iscolumndone[jcoldata] = 1; // Mark data column as used.
						} else {
							var tmp = []; // Array to hold multiple data columns for a colspan.
							for ( k = 0; k < colspan; k++ ) {
								tmp.push( jcoldata + k );
							}
							map.push( [ jcolheadindex, tmp ] ); // Map header cell to multiple data columns.
						}

						jcoldata = jcoldata + colspan; // Advance data column index by colspan amount.
						jcolheadindex = jcolheadindex + 1; // Advance header column index.
					}
				}
				return map; // Return the generated column map.
			}

			/* --- End of fix for colspan issue --- */


			/* --- Parser Utility Functions --- */

			/**
			 * Builds a cache of parsers for each column based on content, metadata, or explicit settings.
			 * @param {HTMLTableElement} table - The table element.
			 * @param {jQuery} $headers - jQuery object containing all header cells.
			 * @returns {Array<Object>} An array of parser objects, one for each column.
			 */
			function buildParserCache( table, $headers ) {

				// Start a benchmark if debug mode is enabled.
				if ( table.config.debug ) {
					var parsersDebug = "";
				}

				var rows = table.tBodies[0].rows; // Get all rows from the table body.

				// Only proceed if there's at least one row in the table body.
				if ( table.tBodies[0].rows[0] ) {

					var list = [], // Array to store the detected parsers.
						cells = rows[0].cells, // Cells of the first data row.
						l = cells.length; // Number of cells (columns).

					// Iterate through each column.
					for ( var i = 0; i < l; i++ ) {

						var p = false; // Initialize parser as false.

						// Check for parser specified in jQuery metadata.
						if ( $.metadata && ( $( $headers[i] ).metadata() && $( $headers[i] ).metadata().sorter ) ) {

							p = getParserById( $( $headers[i] ).metadata().sorter );

						}
						// Check for parser specified in the table's configuration headers.
						else if ( ( table.config.headers[i] && table.config.headers[i].sorter ) ) {

							p = getParserById( table.config.headers[i].sorter );
						}

						// If no parser was found through metadata or config, detect it automatically.
						if ( ! p ) {
							p = detectParserForColumn( table, cells[i] );
						}

						// Log parser detection if debug mode is on.
						if ( table.config.debug ) {
							parsersDebug += "column:" + i + " parser:" + p.id + "\n";
						}

						list.push( p ); // Add the detected parser to the list.
					}
				}

				// Output debug information about parsers.
				if ( table.config.debug ) {
					log( parsersDebug );
				}

				return list; // Return the array of parsers.
			} ;

			/**
			 * Automatically detects the appropriate parser for a given column based on its content.
			 * @param {HTMLTableElement} table - The table element.
			 * @param {HTMLTableCellElement} node - A sample cell from the column.
			 * @returns {Object} The detected parser object.
			 */
			function detectParserForColumn( table, node ) {

				var l = parsers.length; // Total number of registered parsers.

				// Iterate through registered parsers (starting from 1, as 0 is generic text).
				for ( var i = 1; i < l; i++ ) {

					// If the parser's `is` method returns true, it's a match.
					if ( parsers[i].is( $.trim( getElementText( table.config, node ) ), table, node ) ) {
						return parsers[i]; // Return the matching parser.
					}
				}
				// If no specific parser is detected, default to the generic text parser (index 0).
				return parsers[0];
			}

			/**
			 * Retrieves a parser object by its ID (name).
			 * @param {string} name - The ID of the parser to find.
			 * @returns {Object|boolean} The parser object if found, otherwise false.
			 */
			function getParserById( name ) {

				var l = parsers.length; // Total number of registered parsers.

				// Iterate through all registered parsers.
				for ( var i = 0; i < l; i++ ) {

					// Compare parser ID (case-insensitive).
					if ( parsers[i].id.toLowerCase() == name.toLowerCase() ) {
						return parsers[i]; // Return the matching parser.
					}
				}
				return false; // Parser not found.
			}


			/* --- Core Utility Functions --- */

			/**
			 * Builds a cache of table data, parsing each cell's content.
			 * This cache is then used for sorting operations.
			 * @param {HTMLTableElement} table - The table element.
			 * @returns {Object} An object containing the original row references and normalized data.
			 */
			function buildCache( table ) {

				// Start a benchmark if debug mode is enabled.
				if ( table.config.debug ) {
					var cacheTime = new Date();
				}

				// Determine the total number of rows and cells.
				var totalRows = ( table.tBodies[0] && table.tBodies[0].rows.length ) || 0,
					totalCells = ( table.tBodies[0].rows[0] && table.tBodies[0].rows[0].cells.length ) || 0,
					parsers = table.config.parsers, // Parsers array from table configuration.
					cache = { row: [], normalized: [] }; // Initialize the cache structure.

				// Iterate through each row in the table body.
				for ( var i = 0; i < totalRows; ++i ) {

					/** Add the table data to main data array */
					var c = table.tBodies[0].rows[i], // Current row.
						cols = []; // Array to store normalized column data for the current row.

					cache.row.push( $(c) ); // Store a jQuery reference to the original row.

					// Iterate through each cell in the current row.
					for ( var j = 0; j < totalCells; ++j ) {
						// Format the cell text using the detected parser and push to cols array.
						cols.push( parsers[j].format( getElementText( table.config, c.cells[j] ), table, c.cells[j] ) );
					}

					cols.push( i ); // Add the original row index as the last element for reordering.
					cache.normalized.push( cols ); // Store the normalized column data.
					cols = null; // Clear cols array for the next iteration.
				} ;

				// Log benchmark if debug mode is on.
				if ( table.config.debug ) {
					benchmark( "Built cache for " + totalRows + " rows", cacheTime );
				}

				return cache; // Return the populated cache.
			} ;

			/**
			 * Extracts the text content from a table cell based on the configured textExtraction method.
			 * @param {Object} config - The table's configuration object.
			 * @param {HTMLTableCellElement} node - The table cell element.
			 * @returns {string} The extracted text content.
			 */
			function getElementText( config, node ) {

				// Return an empty string if the node is undefined or null.
				if ( ! node ) return "";

				var t = ""; // Initialize text variable.

				// Use "simple" text extraction by default or if specified.
				if ( config.textExtraction == "simple" ) {
					// If the cell has child nodes and the first child has children, use its innerHTML.
					// This handles cases like `<td><span>Text</span></td>`.
					if ( node.childNodes[0] && node.childNodes[0].hasChildNodes() ) {
						t = node.childNodes[0].innerHTML;
					} else {
						// Otherwise, use the cell's own innerHTML.
						t = node.innerHTML;
					}
				} else {
					// If textExtraction is a function, call it.
					if ( typeof( config.textExtraction ) == "function" ) {
						t = config.textExtraction( node );
					} else {
						// Otherwise, use jQuery's .text() method for complex extraction.
						t = $( node ).text();
					}
				}
				return t; // Return the extracted text.
			}

			/**
			 * Appends the sorted rows back to the table.
			 * @param {HTMLTableElement} table - The table element.
			 * @param {Object} cache - The sorted cache containing row data.
			 */
			function appendToTable( table, cache ) {

				// Start a benchmark if debug mode is enabled.
				if ( table.config.debug ) {
					var appendTime = new Date();
				}

				var c = cache, // Reference to the cache.
					r = c.row, // Original row references.
					n = c.normalized, // Normalized (sorted) data.
					totalRows = n.length, // Total number of rows.
					tableBody = $( table.tBodies[0] ), // jQuery object for the table body.
					rows = []; // Array to store rows for potential appender function.

				// Only proceed if there are rows to append.
				if ( totalRows > 0 ) {

					var checkCell = ( n[0].length - 1 ); // The index of the original row position in normalized data.

					// Iterate through the normalized data to get rows in sorted order.
					for ( var i = 0; i < totalRows; i++ ) {

						rows.push( r[ n[i][checkCell] ] ); // Add the original row (jQuery object) to the rows array.

						// If no custom appender function is defined, append rows directly.
						if ( ! table.config.appender ) {

							var o = r[ n[i][checkCell] ]; // The original row element.
							var l = o.length; // Length of the jQuery object (should be 1 for a single row).

							// Append each element of the row (usually just one) to the table body.
							for ( var j = 0; j < l; j++ ) {

								tableBody[0].appendChild( o[j] ); // Use native DOM appendChild for performance.

							}

							// The commented out line below is an alternative using jQuery's append.
							// tableBody.append(r[n[i][checkCell]]);
						}
					}
				}

				// If a custom appender function is defined, call it with the table and sorted rows.
				if ( table.config.appender ) {

					table.config.appender( table, rows );
				}

				rows = null; // Clear the rows array to free memory.

				// Log benchmark if debug mode is on.
				if ( table.config.debug ) {
					benchmark( "Rebuilt table", appendTime );
				}

				// Apply table widgets after appending rows.
				applyWidget( table );

				// Trigger the "sortEnd" event asynchronously to allow DOM updates to complete.
				setTimeout( function() {
					$( table ).trigger( "sortEnd" );
				}, 0 );

			} ;

			/**
			 * Builds and initializes header cells for sorting.
			 * @param {HTMLTableElement} table - The table element.
			 * @returns {jQuery} A jQuery object containing all sortable header cells.
			 */
			function buildHeaders( table ) {

				// Start a benchmark if debug mode is enabled.
				if ( table.config.debug ) {
					var time = new Date();
				}

				var meta = ( $.metadata ) ? true : false, // Check if jQuery metadata plugin is available.
					tableHeadersRows = []; // Array to track header rows (unused in current logic).

				// Initialize tableHeadersRows (currently just populating with 0s).
				for ( var i = 0; i < table.tHead.rows.length; i++ ) {
					tableHeadersRows[i] = 0;
				} ;

				// Select all `<th>` elements within the `<thead>`.
				$tableHeaders = $( "thead th", table );

				// Iterate over each header cell to initialize its properties.
				$tableHeaders.each( function( index ) {

					this.count = 0; // Counter for sort clicks (0 for initial, 1 for next, etc.).
					this.column = index; // Store the original column index.
					this.order = formatSortingOrder( table.config.sortInitialOrder ); // Initial sort order for this column.

					// Check if sorting is disabled for this header via metadata or config.
					if ( checkHeaderMetadata( this ) || checkHeaderOptions( table, index ) ) {
						this.sortDisabled = true; // Mark as non-sortable.
					}

					// If sorting is not disabled, add the header CSS class.
					if ( ! this.sortDisabled ) {
						$( this ).addClass( table.config.cssHeader );
					}

					// Add the header cell to the table's internal headerList.
					table.config.headerList[index] = this;
				} );

				// Log benchmark and header elements if debug mode is on.
				if ( table.config.debug ) {
					benchmark( "Built headers", time );
					log( $tableHeaders );
				}

				return $tableHeaders; // Return the jQuery object of header cells.

			} ;

			/**
			 * Recursively checks for colspan in header cells (currently seems incomplete/unused).
			 * @param {HTMLTableElement} table - The table element.
			 * @param {Array<any>} rows - An array (likely `headerArr` from original, but passed as `rows` here).
			 * @param {number} row - The current row index in the header.
			 * @returns {Array<HTMLTableCellElement>} An array of header cells.
			 */
			function checkCellColSpan( table, rows, row ) {

				var arr = [], // Array to collect header cells.
					r = table.tHead.rows, // All rows in the table head.
					c = r[row].cells; // Cells of the current header row.

				// Iterate through cells in the current header row.
				for ( var i = 0; i < c.length; i++ ) {

					var cell = c[i]; // Current cell.

					// If the cell has a colspan greater than 1, recursively check the next row.
					if ( cell.colSpan > 1 ) {
						arr = arr.concat( checkCellColSpan( table, headerArr, row++ ) ); // `headerArr` is undefined here.
					} else {
						// If no colspan or it's the last header row, add the cell.
						if ( table.tHead.length == 1 || ( cell.rowSpan > 1 || ! r[row+1] ) ) {
							arr.push( cell );
						}
						// headerArr[row] = (i+row); // This line is commented out and uses an undefined variable.
					}
				}
				return arr; // Return the collected cells.
			} ;

			/**
			 * Checks if sorting is disabled for a header cell via jQuery metadata.
			 * @param {HTMLTableCellElement} cell - The header cell element.
			 * @returns {boolean} True if sorting is disabled, false otherwise.
			 */
			function checkHeaderMetadata( cell ) {

				// If metadata plugin is available and sorter is explicitly set to false.
				if ( ( $.metadata ) && ( $( cell ).metadata().sorter === false ) ) {
					return true;
				} ;
				return false; // Sorting is not disabled by metadata.
			}

			/**
			 * Checks if sorting is disabled for a header cell via table configuration options.
			 * @param {HTMLTableElement} table - The table element.
			 * @param {number} i - The column index of the header cell.
			 * @returns {boolean} True if sorting is disabled, false otherwise.
			 */
			function checkHeaderOptions( table, i ) {

				// If header configuration exists for this column and sorter is explicitly set to false.
				if ( ( table.config.headers[i] ) && ( table.config.headers[i].sorter === false ) ) {
					return true;
				} ;
				return false; // Sorting is not disabled by options.
			}

			/**
			 * Applies all active widgets to the table.
			 * @param {HTMLTableElement} table - The table element.
			 */
			function applyWidget( table ) {

				var c = table.config.widgets; // Array of active widget IDs.
				var l = c.length; // Number of active widgets.

				// Iterate through each active widget.
				for ( var i = 0; i < l; i++ ) {

					getWidgetById( c[i] ).format( table ); // Get the widget and call its format method.
				}

			}

			/**
			 * Retrieves a widget object by its ID (name).
			 * @param {string} name - The ID of the widget to find.
			 * @returns {Object|undefined} The widget object if found.
			 */
			function getWidgetById( name ) {

				var l = widgets.length; // Total number of registered widgets.

				// Iterate through all registered widgets.
				for ( var i = 0; i < l; i++ ) {

					// Compare widget ID (case-insensitive).
					if ( widgets[i].id.toLowerCase() == name.toLowerCase() ) {
						return widgets[i]; // Return the matching widget.
					}
				}
				// If no widget is found, this function implicitly returns undefined.
			} ;

			/**
			 * Formats a sorting order value into a consistent numeric representation (0 for asc, 1 for desc).
			 * @param {string|number} v - The sorting order value ("asc", "desc", 0, or 1).
			 * @returns {number} 0 for ascending, 1 for descending.
			 */
			function formatSortingOrder( v ) {

				var i; // Variable to store the numeric order.

				// If the input is not a number (i.e., a string).
				if ( typeof( v ) != "Number" ) {
					i = ( v.toLowerCase() == "desc" ) ? 1 : 0; // Convert "desc" to 1, anything else to 0.
				} else {
					i = ( v == ( 0 || 1 ) ) ? v : 0; // If it's 0 or 1, use it; otherwise default to 0.
				}
				return i; // Return the numeric sorting order.
			}

			/**
			 * Checks if a value exists as the first element of an inner array within a given array.
			 * @param {*} v - The value to search for.
			 * @param {Array<Array<any>>} a - The array to search within.
			 * @returns {boolean} True if the value is found, false otherwise.
			 */
			function isValueInArray( v, a ) {

				var l = a.length; // Length of the outer array.

				// Iterate through the outer array.
				for ( var i = 0; i < l; i++ ) {

					// Check if the first element of the inner array matches the value.
					if ( a[i][0] == v ) {
						return true; // Value found.
					}
				}
				return false; // Value not found.
			}

			/**
			 * Applies the appropriate CSS classes to header cells based on the current sort list.
			 * @param {HTMLTableElement} table - The table element.
			 * @param {jQuery} $headers - jQuery object of all header cells.
			 * @param {Array<Array<number>>} list - The current sort list `[[column_index, order]]`.
			 * @param {Array<string>} css - An array containing `[cssAsc, cssDesc]` class names.
			 */
			function setHeadersCss( table, $headers, list, css ) {

				// Remove all existing sort-related header CSS classes.
				$headers.removeClass( css[0] ).removeClass( css[1] );

				var h = []; // Array to store jQuery objects of sortable headers by column index.

				// Populate the `h` array with sortable headers.
				$headers.each( function( offset ) {
					if ( ! this.sortDisabled ) {
						h[this.column] = $( this );
					}
				} );

				var l = list.length; // Number of sorting rules in the list.

				// Apply CSS classes based on the sort list.
				for ( var i = 0; i < l; i++ ) {

					var header = list[i]; // Current sorting rule: `[column_index, order]`.
					// Find the actual header column index, considering custom maps.
					var headerIndex = findInMap( table.config.customMap, header[0], true );

					// Apply the CSS class to all mapped header cells.
					for ( var j = 0; j < headerIndex.length; j++ ) {
						h[headerIndex[j]].addClass( css[header[1]] ); // Add 'headerSortUp' or 'headerSortDown'.
					}
				}
			}

			/**
			 * Fixes column widths by adding a `<colgroup>` element with `<col>` tags.
			 * This helps maintain column widths when sorting, especially with the pager plugin.
			 * @param {HTMLTableElement} table - The table element.
			 * @param {jQuery} $headers - jQuery object of all header cells.
			 */
			function fixColumnWidth( table, $headers ) {

				var c = table.config; // Reference to the table's configuration.

				// Only proceed if widthFixed option is enabled.
				if ( c.widthFixed ) {

					var colgroup = $( '<colgroup>' ); // Create a new colgroup element.

					// Iterate through the cells of the first data row to get initial widths.
					$( "tr:first td", table.tBodies[0] ).each( function() {
						// Append a <col> tag with the current cell's width.
						colgroup.append( $( '<col>' ).css( 'width', $( this ).width() ) );
					} );
					$( table ).prepend( colgroup ); // Prepend the colgroup to the table.
				} ;
			}

			/**
			 * Updates the sort count property of header cells based on the current sort list.
			 * This helps in cycling through sort orders (asc, desc, unsorted).
			 * @param {HTMLTableElement} table - The table element.
			 * @param {Array<Array<number>>} sortList - The current sort list `[[column_index, order]]`.
			 */
			function updateHeaderSortCount( table, sortList ) {

				var c = table.config, // Reference to the table's configuration.
					l = sortList.length; // Number of sorting rules.

				// Iterate through each sorting rule in the list.
				for ( var i = 0; i < l; i++ ) {

					var s = sortList[i], // Current rule: `[column_index, order]`.
						o = c.headerList[ s[0] ]; // The header cell object for this column.

					o.count = s[1]; // Set the header's count to the current sort order.
					o.count++; // Increment the count for the next click (to cycle order).
				}
			}


			/* --- Sorting Methods --- */

			/**
			 * Generates a dynamic comparison function for multi-column sorting.
			 * @param {HTMLTableElement} table - The table element.
			 * @param {Array<Array<number>>} sortList - The list of columns and their sort orders.
			 * @param {Object} cache - The cached and normalized table data.
			 * @returns {Function} A comparison function for sorting rows.
			 */
			function multisort( table, sortList, cache ) {

				// Start a benchmark if debug mode is enabled.
				if ( table.config.debug ) {
					var sortTime = new Date();
				}

				// Initialize the dynamic expression string for the sort wrapper function.
				var dynamicExp = "var sortWrapper = function(a,b) {",
					l = sortList.length; // Number of sorting criteria.

				// Iterate through each sorting criterion to build the comparison logic.
				for ( var i = 0; i < l; i++ ) {