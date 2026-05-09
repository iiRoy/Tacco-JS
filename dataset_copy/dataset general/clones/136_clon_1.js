/*
 * This file defines the ResponsiveTable module.
 * It is responsible for initializing and managing a responsive data table
 * using Tabletop.js for data fetching and Tablesaw for UI.
 */
var ResponsiveTable;

/*
 * Anonymous self-executing function to encapsulate the module logic
 * and avoid polluting the global scope.
 */
( function () {

  // Alias jQuery for internal use, ensuring no conflicts
  var $ = jQuery;

  /**
   * Constructor for the ResponsiveTable object.
   * @param {string} spreadsheetKey - The Google Spreadsheet key to fetch data from.
   * @param {Array<Array<string>>} columns - An array defining the table columns.
   *                                       Each inner array should contain [data_key, display_name].
   */
  ResponsiveTable = function ( spreadsheetKey, columns ) {
    // Store a reference to 'this' for use in nested functions
    var self = this;

    // Initialize the columns property
    self.columns = columns;

    /**
     * Initializes the table by setting up Pym.js and Tabletop.js.
     * @param {string} dataSpreadsheet - The key for the data source spreadsheet.
     */
    self.init = function ( dataSpreadsheet ) {
      // Initialize Pym.js for responsive embedding
      self.pym = new pym.Child( {
                                  polling : 500 // Poll every 500ms for parent communication
                                }
      );
      // Initialize Tabletop.js to fetch data from Google Sheets
      self.ttop = Tabletop.init( {
                                   key         : dataSpreadsheet, // The spreadsheet key
                                   callback    : self.writeTable,   // Function to call after data is loaded
                                   simpleSheet : true,            // Use simple sheet format
                                   debug       : false              // Disable debug messages
                                 }
      );
    };

    /**
     * Sorts the data source based on the first column.
     * @param {Array<Object>} dataSource - The array of data objects to be sorted.
     * @returns {Array<Object>} The sorted data source.
     */
    self.sortData = function ( dataSource ) {
      // Sort the array in place
      dataSource.sort( function ( a, b ) {
        // Get values from the first column for comparison
        var one = a[ self.columns[ 0 ][ 0 ] ],
            two = b[ self.columns[ 0 ][ 0 ] ];

        // Attempt to convert values to numbers if they are numeric strings
        if ( !isNaN( Number( one ) ) ) {
          one = Number( one );
        }
        if ( !isNaN( Number( two ) ) ) {
          two = Number( two );
        }

        // Perform comparison
        if ( one < two ) {
          return -1; // 'one' comes before 'two'
        }
        if ( one > two ) {
          return 1;  // 'one' comes after 'two'
        }
        return 0;    // Values are equal
      } );
      // Return the sorted data
      return dataSource;
    };

    /**
     * Writes the processed data into the HTML table.
     * @param {Array<Object>} dataSource - The data fetched from the spreadsheet.
     */
    self.writeTable = function ( dataSource ) {
      // Sort the data before writing
      dataSource = self.sortData( dataSource );

      // Clear existing content and create a new table element (hidden initially)
      $( '#data' ).html( '<table style="display:none;" class="tablesaw" id="data-table-container" data-sortable></table>' );

      // Create table headers
      self.createTableColumns( '#data table' );

      // Populate table rows with data
      self.populateTable( dataSource, '#data table' );

      // Initialize Tablesaw and fade in the table
      $( '#data table' ).table().fadeIn();

      // Send height to parent using Pym.js
      self.pym.sendHeightToParent();
    };

    /**
     * Creates the table header (<thead>) based on the defined columns.
     * @param {string} table - A jQuery selector for the target table.
     */
    self.createTableColumns = function ( table ) {
      // Create the table header and a row
      var thead = $( '<thead><tr></tr></thead>' );

      // Iterate through the defined columns
      $.each( self.columns, function ( i, v ) {
        // Add a 'data-sortable-default-col' attribute to the first column for default sorting
        if ( i == 0 ) {
          thead.find( 'tr' ).append( '<th data-sortable-col data-sortable-default-col>' + v[ 1 ] + '</th>' );
        } else {
          // For other columns, just add 'data-sortable-col'
          thead.find( 'tr' ).append( '<th data-sortable-col>' + v[ 1 ] + '</th>' );
        }
      } );

      // Store column definitions as data on the table element
      $( table ).data( 'columns', self.columns );
      // Append the created header to the table
      $( table ).append( thead );
    };

    /**
     * Populates the table body with data rows.
     * @param {Array<Object>} dataSource - The data to populate the table with.
     * @param {string} table - A jQuery selector for the target table.
     */
    self.populateTable = function ( dataSource, table ) {
      var tab = $( table ),
          // Extract column keys from the column definitions
          columns = $.map( $( table ).data( 'columns' ), function ( d ) { return d[ 0 ]; } );

      // Append an empty tbody element
      tab.append( '<tbody></tbody>' );

      // Iterate over each data row
      $.each( dataSource, function ( idx, data ) {
        var row = $( '<tr></tr>' ); // Create a new table row

        // Iterate over each key-value pair in the current data row
        $.each( data, function ( key, val ) {
          // Check if the current key is one of the defined columns
          if ( columns.indexOf( key ) >= 0 ) {
            // Create a table cell with a class matching the column key
            var cell = $( '<td class="' + key + '"></td>' );

            // Set data-priority for Tablesaw responsiveness
            if ( columns.indexOf( key ) == 0 ) {
              cell.data( 'priority', 'persist' ); // First column always visible
            } else {
              cell.data( 'priority', columns.indexOf( key ) ); // Other columns based on index
            }

            // Check if the value contains a URL and convert it to an anchor tag
            if ( val.match ) {
              // Regex to find URLs
              var matches = val.match( /(https?:\/\/)([\dA-Za-z\.-]+)\.([A-Za-z\.]{2,6})([\/\w \.-]*)*\/?(\?.*)?(\#.*)?/g );
              if ( matches ) {
                // Create a replacement anchor tag
                var replacement = '<a target="_blank" class="ellipsis-link" href="' + matches[ 0 ] + '">' + matches[ 0 ] + '</a>';
                // Replace the URL string with the anchor tag
                val = val.replace( matches[ 0 ], replacement );
              }
            }

            // Set the HTML content of the cell
            cell.html( val );
            // Append the cell to the current row
            row.append( cell );
          }
        } );
        // Append the completed row to the table body
        tab.find( 'tbody' ).append( row );
      } );
    };

    // Initialize the table when the document is ready
    // Use .bind() to ensure 'self' is correctly scoped in the init function
    $( document ).ready( self.init.bind( self, spreadsheetKey ) );
  };

} )();