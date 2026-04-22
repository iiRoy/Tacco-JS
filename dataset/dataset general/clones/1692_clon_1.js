( function ( $, w, undefined ) {

  /*
   * This function is responsible for determining the current
   * width of the browser's viewport.
   */
  function viewportWidth ( opts ) {
    // Retrieve the inner width of the window, or fallback to document body's offsetWidth.
    var wd = window.innerWidth || ( document.body ? document.body.offsetWidth : 0 );

    // If a specific test breakpoint is set and the current width exceeds it,
    // then the width is capped at that breakpoint for testing purposes.
    if ( opts.testBreakpoint != null && opts.breakpoints[ opts.testBreakpoint ] < wd ) {
      wd = opts.breakpoints[ opts.testBreakpoint ];
    }

    return wd;
  }

  /*
   * When the viewport dimensions change, this function ensures that all
   * tables managed by Horton are properly resized and adjusted.
   */
  function resizeAll () {
    // Iterate over each table that has been 'hortonified'.
    $( 'table.hortonified' ).each( function () {
      // Toggle the expander visibility based on the result of resizing the table.
      toggleExpander( $( this ), resizeHorton( $( this ) ) );
    } );
  }

  /**
   * Recalculates which columns should be displayed or hidden when the
   * window's size changes. This is the core logic for responsive table behavior.
   *
   * @param {jQuery} $table - The jQuery object representing the table to resize.
   * @returns {boolean} - True if an expander is needed, false otherwise.
   */
  function resizeHorton ( $table ) {
    var i, s, e, needExpander = false;
    var $tbody = $table.find( 'tbody:first' );
    var opts = $table.data( 'horton' );

    // Store the table's ID (though not used directly here, it's part of the original).
    var id = $table.attr( 'id' );
    // Clear any existing timer for resize events.
    opts.timer = null;

    // Determine the pivotal breakpoint based on the current viewport width.
    var vwd = viewportWidth( opts );
    var hide = [ 'always', 'initial' ]; // Columns always hidden or hidden initially.
    var show = []; // Columns to be shown.

    // Categorize columns based on breakpoints and current viewport width.
    $.each( opts.bkpt, function ( k, v ) {
      if ( v.width >= vwd ) {
        hide.push( v.name );
      } else {
        show.push( v.name );
      }
    } );

    // Collect any currently expanded detail rows and trigger a click to collapse them.
    var reopen = $table.find( '>tbody:first>tr.' + opts.classes.expanded ).trigger( 'click.horton' );

    // Process and display columns that should be visible.
    for ( i = 0; i < show.length; i++ ) {
      var expr = ">thead:first>tr:last-child>th[data-hide*='" + show[ i ] + "'],>thead:first>tr:last-child>td[data-hide*='" + show[ i ] + "']";
      $table.find( expr ).each( function () {
        var s, e;
        var $th = $( this );
        var span = opts.columnData[ $th.index() ].span;

        // Determine the start and end indices for the column span.
        if ( typeof ( span ) === 'object' ) {
          s = span[ 0 ];
          e = span[ 1 ] + 1;
        } else {
          s = span;
          e = s + 1;
        }

        // Show the header and corresponding cells in the table body.
        $th.show();
        $tbody.children( 'tr' ).each( function () {
          $( this ).children( 'td' ).slice( s, e ).show();
        } );
      } );
    }

    // Process and hide columns that should not be visible.
    for ( i = 0; i < hide.length; i++ ) {
      var expr = ">thead:first>tr:last-child>th[data-hide*='" + hide[ i ] + "'],>thead:first>tr:last-child>td[data-hide*='" + hide[ i ] + "']";
      $table.find( expr ).each( function () {
        var s, e;
        var $th = $( this );
        var span = opts.columnData[ $th.index() ].span;

        // If a column is hidden but not 'always' hidden, an expander will be needed.
        if ( hide[ i ] != 'always' ) {
          needExpander = true;
        }

        // Determine the start and end indices for the column span.
        if ( typeof ( span ) === 'object' ) {
          s = span[ 0 ];
          e = span[ 1 ] + 1;
        } else {
          s = span;
          e = s + 1;
        }

        // Hide the header and corresponding cells in the table body.
        $th.hide();
        $tbody.children( 'tr' ).each( function () {
          $( this ).children( 'td' ).slice( s, e ).hide();
        } );
      } );
    }

    // If an expander is needed and there were previously expanded rows,
    // re-trigger their click event to display details again.
    if ( needExpander && reopen ) {
      $( reopen ).trigger( 'click.horton' );
    }

    // Adjust the table's width if a test breakpoint is active,
    // otherwise restore its original width.
    if ( opts.testBreakpoint ) {
      /*
       * TODO: This section needs an update.
       * The current implementation sets the table width to the viewport width.
       * It should be enhanced to properly handle tables that are not positioned
       * at the left margin, taking into account their actual position and width
       * to fit within the specified test viewport.
       */
      $table.width( vwd );
    } else {
      $table.width( opts.tableWidth );
    }

    // Return whether an expander is required for this table.
    return needExpander;
  }

  /**
   * Toggles the visual indicator (expander icon) for rows that have
   * hidden cells which can be revealed.
   *
   * @param {jQuery} $table - The jQuery object representing the table.
   * @param {boolean} on - True to show expanders, false to hide them.
   */
  function toggleExpander ( $table, on ) {
    var opts = $table.data( 'horton' );

    // All detail rows are assumed to be collapsed at this point.
    if ( on ) {
      // Add the 'collapsed' class to the expander column cells for non-detail rows.
      $table.find( '>tbody:first>tr:not(.horton-details)>td:nth-child(' + opts.expanderColumn + ')' ).addClass( opts.classes.collapsed );
    } else {
      // Remove the 'collapsed' class from all expander column cells.
      $table.find( '>tbody:first>tr>td:nth-child(' + opts.expanderColumn + ')' ).removeClass( opts.classes.collapsed );
    }

    // Update the expander state in the options.
    opts.expander = on;
  }

  /**
   * Initializes one or more tables with Horton's responsive features.
   * This function is typically called on a jQuery selection of tables.
   *
   * @param {Window} w - The window object.
   * @param {Object} options - Configuration options for Horton.
   * @returns {jQuery} - The jQuery object, for chaining.
   */
  function hortonInit ( w, options ) {
    options = options || {}; // Ensure options object exists.

    return this.each( function () {
      var $table = $( this ); // Current table being initialized.
      var opts;

      // Retrieve existing options or initialize new ones, merging with provided options.
      if ( $table.data( 'horton' ) ) {
        opts = $.extend( true, $table.data( 'horton' ), options );
      } else {
        opts = $.extend( true, {}, w.horton.options, options );
      }
      $table.data( 'horton', opts ); // Store the merged options back on the table.

      // Clear the arrays that will hold breakpoint and column data.
      opts.bkpt.length = 0;
      opts.columnData.length = 0;

      // Create and sort an array of breakpoint objects for easier processing.
      $.each( opts.breakpoints, function ( k, v ) {
        opts.bkpt.push( { name: k, width: v } );
      } );
      opts.bkpt.sort( function ( a, b ) {
        return a[ 'width' ] - b[ 'width' ];
      } );

      // Collect column data from the table's header.
      var cidx = 0; // Current column index for span calculation.
      $table.find( '>thead:first>tr:last-child>th,>thead:first>tr:last-child>td' ).each( function () {
        var $th = $( this );
        var colspan = $th.attr( 'colspan' ) ? parseInt( $th.attr( 'colspan' ) ) : 1;

        // If 'data-hide' attribute contains 'always', it takes precedence.
        if ( /always/.test( $th.data( 'hide' ) ) ) {
          $th.data( 'hide', 'always' );
        }

        // Record the position of the expander column if specified.
        if ( $th.data( 'expander' ) ) {
          opts.expanderColumn = cidx + 1;
        }

        // Prepare the column data object.
        var data = {
          'index': $th.index(),
          'name': $th.data( 'name' ) || $.trim( $th.text() ),
          'text': $.trim( $th.text() ),
          'hide': $th.data( 'hide' ),
          'span': null // Will be set below.
        };

        // Add span information, useful for hiding/showing columns.
        if ( colspan > 1 ) {
          data.span = [ cidx, cidx + colspan - 1 ];
        } else {
          data.span = cidx;
        }

        // Store the column data.
        opts.columnData[ data.index ] = data;

        // Update the mapping from cell index to column data index, considering colspans.
        for ( var i = 0; i < colspan; i++, cidx++ ) {
          opts.toColumnData[ cidx ] = data.index;
        }
      } );

      // Perform an initial resize and set up expander images.
      toggleExpander( $table, resizeHorton( $table ) );

      // Bind the click event handler for managing details rows.
      $table.off( 'click.horton' ).on( 'click.horton', '>tbody:first>tr:not(.horton-details)', manageDetails );

      // Add a class to indicate the table has been initialized by Horton.
      // This is used for identifying tables during global resize events.
      $table.addClass( 'hortonified' );

      // Allow registered plugins to perform their own initialization on the table.
      w.horton.plugins.init( w, $table );

      // Add the window resize handler, debounced by a timer.
      $( w ).unbind( 'resize.horton' ).bind( 'resize.horton', function () {
        clearTimeout( opts.timer ); // Clear any pending resize timer.
        opts.timer = setTimeout( resizeAll(), opts.delay ); // Set a new timer.
      } );
    } );
  }

  /**
   * Constructs a default HTML string to display hidden details within a container.
   * This function is used when no custom `showDetails` callback is provided.
   *
   * @param {Object} opts - The Horton options for the table.
   * @param {Array} visible - An array of visible column data.
   * @param {Array} hidden - An array of hidden column data to display.
   * @param {jQuery} container - The jQuery object representing the container for the details.
   */
  function showDetails ( opts, visible, hidden, container ) {
    var h = ''; // HTML string accumulator.

    for ( var i = 0; i < hidden.length; i++ ) {
      // Add a header for the hidden column.
      h += "<div><span class='horton' style='font-weight:bold;text-decoration:underline'>" + hidden[ i ].columnData.text + "</span><br>";
      // Add each element (cell content) for the hidden column.
      for ( var j = 0; j < hidden[ i ].elements.length; j++ ) {
        var $e = $( hidden[ i ].elements[ j ] );
        var v = $e.text();
        h += "<span class='horton' style='margin-left:10px'>" + v + "</span><br>";
      }
      h += "</div>"; // Close the column detail div.
    }
    $( container ).html( h ); // Insert the generated HTML into the container.
  }

  /**
   * The default function responsible for showing or hiding the detailed
   * information associated with a table row. Triggered by clicking a row.
   *
   * @param {Event} event - The click event object.
   */
  function manageDetails ( event ) {
    var $row = $( this ); // The clicked table row.
    var opts = $row.parents( 'table:first' ).data( 'horton' ); // Horton options for the parent table.

    // If no expander is needed (all columns are visible), do nothing.
    if ( !opts.expander ) {
      return;
    }

    var rcl, acl, cd, nvis, nhid;
    var hid = $row.children( 'td:hidden' ); // Hidden cells in the row.
    var vis = $row.children( 'td:visible' ); // Visible cells in the row.
    var vsibs = $( vis ).size(); // Number of visible cells for colspan.
    var hidden = null; // Array to store hidden column data.
    var visible = null; // Array to store visible column data.

    // Create a list of the visible cells with their associated column data.
    var i = 0;
    while ( i < vis.length ) {
      cd = opts.columnData[ opts.toColumnData[ $( vis[ i ] ).index() ] ];
      nvis = ( typeof ( cd.span ) === 'object' ) ? ( cd.span[ 1 ] - cd.span[ 0 ] ) + 1 : 1;
      var vdata = {
        columnData: cd,
        elements: $( vis ).slice( i, i + nvis )
      };
      if ( visible == null ) {
        visible = [ vdata ];
      } else {
        visible.push( vdata );
      }
      i += nvis;
    }

    // Create a list of the hidden cells that are not 'always' hidden.
    i = 0;
    while ( i < hid.length ) {
      // Get the column data for the current hidden cell.
      var cd = opts.columnData[ opts.toColumnData[ $( hid[ i ] ).index() ] ];
      nhid = ( typeof ( cd.span ) === 'object' ) ? ( cd.span[ 1 ] - cd.span[ 0 ] ) + 1 : 1;

      // Only include details for columns that are not 'always' hidden.
      if ( cd.hide != 'always' ) {
        var ddata = {
          columnData: cd,
          elements: $( hid ).slice( i, i + nhid )
        };
        if ( hidden == null ) {
          hidden = [ ddata ];
        } else {
          hidden.push( ddata );
        }
      }
      i += nhid;
    }

    var $next = $row.next(); // The next sibling row.
    var container;

    // Check if the row is currently expanded.
    if ( $row.hasClass( opts.classes.expanded ) ) {
      // If a custom 'hideDetails' callback is provided, use it.
      if ( opts.hideDetails ) {
        container = $next.children( 'td:first' );
        opts.hideDetails( opts, visible, hidden, container );
      }
      $next.hide(); // Hide the detail row.
      rcl = opts.classes.expanded; // Class to remove.
      acl = opts.classes.collapsed; // Class to add.
    } else {
      // If the next row is not a detail row, create one.
      if ( !$next || !$next.hasClass( 'horton-details' ) ) {
        $next = $( "<tr class='horton-details'><td colspan='" + vsibs + "'></td></tr>" );
        $row.after( $next );
      } else {
        // If it is a detail row, update its colspan in case it changed.
        $next.find( 'td:first' ).attr( 'colspan', vsibs );
      }
      container = $next.children( 'td:first' ).empty(); // Get and clear the container cell.

      // If a custom 'showDetails' callback is provided, use it.
      if ( opts.showDetails ) {
        opts.showDetails( opts, visible, hidden, container );
      } else {
        // Otherwise, use the default details display function.
        showDetails( opts, visible, hidden, container );
      }

      $next.show(); // Show the detail row.
      rcl = opts.classes.collapsed; // Class to remove.
      acl = opts.classes.expanded; // Class to add.
    }

    // Toggle the expanded/collapsed classes on the row and its expander cell.
    $row.removeClass( rcl ).addClass( acl );
    $row.find( ':nth-child(' + opts.expanderColumn + ')' ).removeClass( rcl ).addClass( acl );
  }

  /**
   * Given a set of rows, this function hides the columns that need to be
   * hidden based on the current viewport width and adds the expander
   * class to the appropriate column if necessary.
   *
   * @param {Object} opts - The Horton options for the table.
   * @param {jQuery} $table - The jQuery object representing the table.
   * @param {jQuery} $rows - The jQuery object representing the rows to process.
   */
  function fiddleRows ( opts, $table, $rows ) {
    var vwd = viewportWidth( opts );
    var hide = [ 'always' ]; // Columns that should be hidden.

    // Determine which breakpoint-defined columns to hide.
    $.each( opts.bkpt, function ( k, v ) {
      if ( v.width >= vwd ) {
        hide.push( v.name );
      }
    } );

    // Iterate through columns to hide.
    for ( var i = 0; i < hide.length; i++ ) {
      var expr = ">thead:first>tr:last-child>th[data-hide*='" + hide[ i ] + "'],>thead:first>tr:last-child>td[data-hide*='" + hide[ i ] + "']";
      $table.find( expr ).each( function () {
        var s, e;
        var $th = $( this );
        var span = opts.columnData[ $th.index() ].span;

        // If the column is hidden but not 'always' hidden, an expander is needed.
        if ( hide[ i ] != 'always' ) {
          // Note: 'needExpander' is not declared in this scope, it refers to the one in resizeHorton or would be a global.
          // In original code, this was inside resizeHorton, here it's a separate function.
          // This might be a subtle logical difference if 'needExpander' was meant to be local to resizeHorton.
          // For Type I, I'll keep the expression as is, assuming 'needExpander' is accessible or its effect is implicitly handled elsewhere.
          needExpander = true;
        }

        // Determine the column span.
        if ( typeof ( span ) === 'object' ) {
          s = span[ 0 ];
          e = span[ 1 ] + 1;
        } else {
          s = span;
          e = s + 1;
        }

        // Hide the corresponding cells in the provided rows.
        $rows.each( function () {
          $( this ).children( 'td' ).slice( s, e ).hide();
        } );
      } );
    }

    // If no expander is needed, exit early.
    if ( !opts.expander ) {
      return;
    }

    // Add the expander class to the appropriate cell in each row.
    $rows.find( '>td:nth-child(' + opts.expanderColumn + ')' ).addClass( opts.classes.collapsed );
  }

  /************************************************************************
   *
   * Public Interface for Horton Plugin.
   * These functions are exposed via the jQuery plugin mechanism.
   *
   ************************************************************************/

  /**
   * Retrieves the Horton options object associated with the selected table.
   *
   * @returns {Object} - The Horton options object.
   */
  function getOptions () {
    return $( this ).data( 'horton' );
  }

  /**
   * Returns the version of Horton and its registered plugins.
   *
   * @returns {Array|string} - An array of objects with name and version for Horton and its plugins,
   *                           or just the Horton version string if no plugins are registered.
   */
  function getVersion () {
    var vers;
    var opts = $( this ).data( 'horton' );
    var reg = w.horton.plugins.registered;

    // If no child plugins are registered, simply return the Horton version.
    if ( reg.length == 0 ) {
      return opts.version;
    }

    // Construct an array containing Horton's version and the versions of its plugins.
    vers = [ { name: "Horton", version: opts.version } ];
    for ( var i = 0; i < reg.length; i++ ) {
      vers.push( { name: reg[ i ].name, version: reg[ i ].version } );
    }
    return vers;
  }

  /**
   * Calculates the number of data rows in the table, excluding any Horton-specific
   * detail rows.
   *
   * @returns {number} - The count of actual data rows.
   */
  function numRows () {
    var $table = this;
    var opts = $table.data( 'horton' );

    // Subtract the number of detail rows from the total number of rows in the first tbody.
    return $table.get( 0 ).tBodies[ 0 ].rows.length - $table.find( 'tr.horton-details' ).size();
  }

  /**
   * Replaces or inserts rows into the table, with various modes of operation:
   * - `replaceRows(newRows)`: Replaces all existing rows with `newRows`. If `newRows` is null, all rows are deleted.
   * - `replaceRows(insertPoint, newRows)`: Inserts `newRows` before `insertPoint`. If `newRows` is null, nothing happens. (This signature not fully implemented in the provided code, but implied by arguments.length check)
   * - `replaceRows(from, to, newRows)`: Deletes rows from `from` to `to-1` and inserts `newRows`. If `newRows` is null, it's a simple delete operation. (This signature not fully implemented in the provided code, but implied by arguments.length check)
   *
   * `newRows` can be an HTML string or a set of DOM row elements.
   */
  function replaceRows () {
    var $nr = null; // New rows to be inserted.
    var from = -1; // Start index for deletion (not fully used in this specific implementation).
    var to = -1; // End index for deletion (not fully used in this specific implementation).
    var $table = $( this ); // The table being modified.
    var opts = $table.data( 'horton' ); // Horton options.

    // Determine the new rows from the arguments.
    if ( arguments.length > 0 ) {
      var o = arguments[ arguments.length - 1 ];
      $nr = ( typeof ( o ) === 'object' ) ? o : $( o );
    }

    // Handle the case of replacing all rows or deleting all rows.
    if ( arguments.length < 2 ) {
      // If a custom 'hideDetails' callback exists, trigger it for any expanded rows.
      if ( opts.hideDetails ) {
        $table.find( '>tbody:first>tr.' + opts.classes.expanded ).trigger( 'click.horton' );
      }
      // Delete all existing rows in the first tbody.
      $table.find( '>tbody:first>tr' ).remove();

      // If new rows are provided, process them and append to the table.
      if ( $nr ) {
        fiddleRows( opts, $table, $nr ); // Hide columns in new rows as needed.
        $table.find( '>tbody:first' ).append( $nr ); // Append the new rows.
      }
      // Trigger a custom event to indicate that rows have been modified.
      $table.trigger( 'horton.rows.modified' );
      return; // Exit the function.
    }

    // The provided code snippet only handles the 'arguments.length < 2' case.
    // The other `replaceRows` signatures (insertPoint, from/to) are not implemented here.
  }

} )( jQuery, window, undefined ); // Pass jQuery and window, `undefined` is passed explicitly for robustness.