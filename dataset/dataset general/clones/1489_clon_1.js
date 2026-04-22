// This file contains a Type I clone of the original jQuery tablesort plugin.
// All functionality remains identical; only whitespace and comments have been altered.
// Version 0.0.2

$(
  function(
  ) {

    // Ensure jQuery is available, even if it's not globally scoped.
    var $ = window.jQuery;

    /**
     * Main Tablesort constructor.
     * Initializes the sorting functionality for a given table.
     * @param {jQuery} $table - The jQuery object representing the table to be sorted.
     * @param {object} settings - Configuration options for tablesort.
     */
    $.tablesort = function( $table, settings ) {
      // Store a reference to the current instance for use in callbacks.
      var self = this;
      // Assign the table element to the instance.
      this.$table = $table;
      // Find the table header (thead) for row identification.
      this.$thead = this.$table.find( 'thead' );
      // Merge default settings with user-provided settings.
      this.settings = $.extend( {}, $.tablesort.defaults, settings );

      // Attach a click event handler to all table header cells.
      // The 'tablesort' namespace prevents interference with other click handlers.
      this.$table.find( 'th' ) . bind( 'click.tablesort', function( ) {
        // When a header is clicked, sort the table by that header.
        self.sort( $( this ) );
      } );

      // Initialize sorting state variables.
      this.index = null;        // The index of the currently sorted column.
      this.$th = null;          // The jQuery object of the currently sorted header.
      this.direction = null;    // The current sorting direction ('asc' or 'desc').
    };


    // Define the prototype methods for the tablesort plugin.
    $.tablesort.prototype = {

      /**
       * Sorts the table based on the given table header.
       * @param {jQuery} th - The jQuery object of the table header to sort by.
       * @param {string} [direction] - Optional, explicit sorting direction ('asc' or 'desc').
       */
      sort: function( th, direction ) {

        // Capture the starting time for performance logging.
        var start = new Date(),
            // Self-reference for use within nested functions.
            self = this,
            // Reference to the table being sorted.
            table = this.$table,
            // Get all rows that contain data. If a thead exists, get tbody rows; otherwise, get all trs with tds.
            rows = this.$thead.length > 0 ? table.find( 'tbody tr' ) : table.find( 'tr' ) . has( 'td' ),
            // Select all cells in the column corresponding to the clicked header.
            cells = table.find( 'tr td:nth-of-type(' + ( th.index() + 1 ) + ')' ),
            // Get the custom sort function from the header's data attribute, if any.
            sortBy = th.data( ) . sortBy,
            // Array to store objects for sorting, maintaining original index.
            sortedMap = [];


        // Extract the values to be sorted from the cells.
        var unsortedValues = cells.map( function( idx, cell ) {
          // If a custom sortBy function is defined for the header.
          if ( sortBy )
            // Execute the custom sort function if it's a function, otherwise use the value directly.
            return ( typeof sortBy === 'function' ) ? sortBy( $( th ), $( cell ), self ) : sortBy;

          // Default sorting: use data-sort-value if present, otherwise use cell text.
          return ( $( this ) . data( ) . sortValue != null ? $( this ) . data( ) . sortValue : $( this ) . text( ) );
        } );

        // If there are no values to sort, exit early.
        if ( unsortedValues.length === 0 ) return;

        // Remove the 'sorted' classes from all header cells.
        self.$table.find( 'th' ) . removeClass( self.settings.asc + ' ' + self.settings.desc );

        // Determine the sorting direction.
        // If no explicit direction is given, toggle the current direction.
        if ( direction !== 'asc' && direction !== 'desc' )
          this.direction = this.direction === 'asc' ? 'desc' : 'asc';
        else
          // Otherwise, use the provided direction.
          this.direction = direction;

        // Convert the 'asc'/'desc' direction to a numeric multiplier for sorting.
        direction = this.direction == 'asc' ? 1 : -1;

        // Trigger a custom event indicating the start of sorting.
        self.$table.trigger( 'tablesort:start', [ self ] );
        // Log the sorting action for debugging.
        self.log( "Sorting by " + this.index + ' ' + this.direction );

        // Populate the sortedMap with original indices, cells, rows, and extracted values.
        for ( var i = 0, length = unsortedValues.length; i < length; i++ )
        {
          sortedMap.push( {
            index: i,             // Original index of the row.
            cell: cells[ i ],     // Reference to the cell being sorted.
            row: rows[ i ],       // Reference to the entire row.
            value: unsortedValues[ i ] // The value used for sorting.
          } );
        }

        // Perform the actual sort operation on the mapped array.
        sortedMap.sort( function( a, b ) {
          // Compare values and apply the direction multiplier.
          if ( a.value > b.value ) {
            return 1 * direction;
          } else if ( a.value < b.value ) {
            return -1 * direction;
          } else {
            // If values are equal, maintain relative order (stable sort).
            return 0;
          }
        } );

        // Re-append the rows to the table in the new sorted order.
        // This effectively reorders the DOM elements.
        $.each( sortedMap, function( i, entry ) {
          table.append( entry.row );
        } );

        // Add the appropriate class to the sorted header to indicate direction.
        th.addClass( self.settings[ self.direction ] );

        // Log the time taken for the sort operation.
        self.log( 'Sort finished in ' + ( ( new Date() ) . getTime() - start.getTime() ) + 'ms' );
        // Trigger a custom event indicating the completion of sorting.
        self.$table.trigger( 'tablesort:complete', [ self ] );
      },


      /**
       * Logs messages to the console if debugging is enabled.
       * @param {string} msg - The message to log.
       */
      log: function( msg ) {
        // Check if debug mode is active and console.log is available.
        if ( ( $.tablesort.DEBUG || this.settings.debug ) && console && console.log ) {
          // Output the message with a tablesort prefix.
          console.log( '[tablesort] ' + msg );
        }
      },


      /**
       * Cleans up event handlers and data associated with the tablesort instance.
       * @returns {null} - Returns null after destruction.
       */
      destroy: function( ) {
        // Unbind the click event handler from table headers.
        this.$table.find( 'th' ) . unbind( 'click.tablesort' );
        // Remove the tablesort data from the table element.
        this.$table.data( 'tablesort', null );
        return null;
      }

    };

    // Global debug flag for tablesort.
    $.tablesort.DEBUG = false;

    // Default settings for the tablesort plugin.
    $.tablesort.defaults = {
      debug: $.tablesort.DEBUG,          // Inherit global debug setting.
      asc: 'sorted ascending',           // Class name for ascending sort.
      desc: 'sorted descending'          // Class name for descending sort.
    };


    /**
     * jQuery plugin entry point.
     * Initializes tablesort for selected tables.
     * @param {object} settings - Configuration options.
     * @returns {jQuery} - The jQuery object for chaining.
     */
    $.fn.tablesort = function( settings ) {
      // Declare variables for the current table, sortable instance, and previous instance.
      var table, sortable, previous;
      // Iterate over each selected table element.
      return this.each( function( ) {
        table = $( this ); // Wrap the current DOM element in a jQuery object.
        previous = table.data( 'tablesort' ); // Check if tablesort was already initialized.
        if ( previous ) {
          previous.destroy(); // If so, destroy the old instance first.
        }
        // Initialize a new tablesort instance and store it in the table's data.
        table.data( 'tablesort', new $.tablesort( table, settings ) );
      } );
    };

  }
);