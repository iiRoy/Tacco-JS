// This file contains the implementation for jQuery Resizable Columns plugin.
// Version: 0.1.0
// Project URL: http://dobtco.github.io/jquery-resizable-columns/
// License: MIT
// Built on: Thu Mar 12 2015 15:14:55
// This is a Type I clone, preserving all functional logic and identifiers.

var __bind = function (fn, me) {
  return function () {
    return fn.apply(me, arguments);
  };
};

var __slice = [].slice; // Helper for array slicing

( function ($, window) {

  // Declare core variables for the plugin's scope
  var ResizableColumns, parseWidth, pointerX, setWidth;

  /**
   * Parses the width from a DOM node's style.
   * Assumes width is in percentage and removes the '%' sign.
   * @param {HTMLElement} node The DOM element.
   * @returns {number} The parsed width as a float.
   */
  parseWidth = function (node) {
    return parseFloat( node.style.width.replace( '%', '' ) );
  };

  /**
   * Sets the width of a DOM node's style.
   * Ensures width is formatted as a percentage with two decimal places.
   * @param {HTMLElement} node The DOM element.
   * @param {number} width The desired width.
   */
  setWidth = function (node, width) {
    // Round width to two decimal places
    width = width.toFixed( 2 );
    // Ensure width is not negative
    width = width > 0 ? width : 0;
    // Apply width to element style
    return node.style.width = "" + width + "%";
  };

  /**
   * Retrieves the X-coordinate of a pointer event (mouse or touch).
   * @param {Event} e The event object.
   * @returns {number} The pageX coordinate.
   */
  pointerX = function (e) {
    // Check if it's a touch event
    if ( e.type.indexOf( 'touch' ) === 0 ) {
      // Return pageX from the first touch point
      return ( e.originalEvent.touches[0] || e.originalEvent.changedTouches[0] ).pageX;
    }
    // Otherwise, return pageX from mouse event
    return e.pageX;
  };

  ResizableColumns = (function () {

    // Define default options for the plugin
    ResizableColumns.prototype.defaults = {
      selector: 'tr th:visible', // Selector for table headers
      store: window.store,      // Storage mechanism for widths
      syncHandlers: true,       // Whether to sync handle widths on resize
      resizeFromBody: true,     // Whether handle height should match table body or just head
      maxWidth: null,           // Maximum allowed column width (percentage)
      minWidth: null            // Minimum allowed column width (percentage)
    };

    function ResizableColumns( $table, options ) {
      // Bind instance methods to the current context
      this.pointerdown = __bind( this.pointerdown, this );
      this.constrainWidth = __bind( this.constrainWidth, this );

      // Merge default options with user-provided options
      this.options = $.extend( {}, this.defaults, options );
      // Store the jQuery table object
      this.$table = $table;

      // Initialize headers and handles
      this.setHeaders();
      // Attempt to restore column widths from storage
      this.restoreColumnWidths();
      // Synchronize the position and size of resize handles
      this.syncHandleWidths();

      // Attach a resize event listener to the window
      $(window).on( 'resize.rc', ( ( function ( _this ) {
        return function () {
          return _this.syncHandleWidths(); // Re-sync handles on window resize
        };
      } )( this ) ) );

      // Bind custom event handlers if provided in options
      if ( this.options.start ) {
        this.$table.bind( 'column:resize:start.rc', this.options.start );
      }
      if ( this.options.resize ) {
        this.$table.bind( 'column:resize.rc', this.options.resize );
      }
      if ( this.options.stop ) {
        this.$table.bind( 'column:resize:stop.rc', this.options.stop );
      }
    }

    ResizableColumns.prototype.triggerEvent = function ( type, args, original ) {
      var event; // Declare event variable
      event = $.Event( type );
      event.originalEvent = $.extend( {}, original ); // Clone original event
      // Trigger the custom event on the table, passing arguments
      return this.$table.trigger( event, [ this ].concat( args || [] ) );
    };

    ResizableColumns.prototype.getColumnId = function ( $el ) {
      // Construct a unique ID for the column, combining table ID and column ID
      return this.$table.data( 'resizable-columns-id' ) + '-' + $el.data( 'resizable-column-id' );
    };

    ResizableColumns.prototype.setHeaders = function () {
      // Find all header elements based on the configured selector
      this.$tableHeaders = this.$table.find( this.options.selector );
      // Assign initial percentage widths to headers
      this.assignPercentageWidths();
      // Create the resize handles
      return this.createHandles();
    };

    ResizableColumns.prototype.destroy = function () {
      var $table; // Temporary variable to hold reference to the table

      // Detach all event handlers with the '.rc' namespace from the document
      $( this.$table.attr( 'ownerDocument' ) ).off( '.rc' );

      // Iterate over each handle to clean up its data and events
      this.$handleContainer.find( '.rc-handle' ).each( ( function ( _this ) {
        return function ( _, el ) {
          var $handle;
          $handle = $( el );
          $handle.removeData( 'th' ); // Remove stored header reference
          return $handle.off( 'mousedown touchstart' ); // Detach pointer events
        };
      } )( this ) );

      // Remove the handle container from the DOM
      this.$handleContainer.remove();
      this.$handleContainer = null; // Clear reference

      // Remove the plugin instance data from the table element
      this.$table.removeData( 'resizableColumns' );

      // Detach all '.rc' namespaced events from the table and window
      this.$table.add( window ).off( '.rc' );

      this.$tableHeaders = null; // Clear header references
      $table = this.$table;     // Store table reference before nulling
      this.$table = null;       // Clear table reference
      return $table;            // Return the original table element
    };

    ResizableColumns.prototype.assignPercentageWidths = function () {
      // Iterate over each table header to calculate and assign percentage widths
      return this.$tableHeaders.each( ( function ( _this ) {
        return function ( _, el ) {
          var $el; // jQuery wrapped element
          $el = $( el );
          // Calculate percentage width: (element's outer width / table's total width) * 100
          return setWidth( $el[0], $el.outerWidth() / _this.$table.width() * 100 );
        };
      } )( this ) );
    };

    ResizableColumns.prototype.createHandles = function () {
      var _ref; // Reference for existing handle container

      // If a handle container already exists, remove it first
      if ( ( _ref = this.$handleContainer ) != null ) {
        _ref.remove();
      }

      // Create a new handle container and insert it before the table
      this.$table.before( ( this.$handleContainer = $( "<div class='rc-handle-container' />" ) ) );

      // Iterate through headers to create individual resize handles
      this.$tableHeaders.each( ( function ( _this ) {
        return function ( i, el ) {
          var $handle; // jQuery handle element

          // Skip creating a handle if it's the last column or if either current/next column has 'data-noresize'
          if ( _this.$tableHeaders.eq( i + 1 ).length === 0 || ( _this.$tableHeaders.eq( i ).attr( 'data-noresize' ) != null ) || ( _this.$tableHeaders.eq( i + 1 ).attr( 'data-noresize' ) != null ) ) {
            return; // Do not create handle for this column
          }

          $handle = $( "<div class='rc-handle' />" );
          $handle.data( 'th', $( el ) ); // Store a reference to the associated table header
          return $handle.appendTo( _this.$handleContainer ); // Add handle to the container
        };
      } )( this ) );

      // Attach pointerdown event listener to handles within the container
      return this.$handleContainer.on( 'mousedown touchstart', '.rc-handle', this.pointerdown );
    };

    ResizableColumns.prototype.syncHandleWidths = function () {
      // Set the width of the handle container to match the table's width
      // Then, find all handles and iterate to synchronize their positions and heights
      return this.$handleContainer.width( this.$table.width() ).find( '.rc-handle' ).each( ( function ( _this ) {
        return function ( _, el ) {
          var $el; // Current handle element
          $el = $( el );

          // Apply CSS properties to position and size the handle
          return $el.css( {
            left: $el.data( 'th' ).outerWidth() + ( $el.data( 'th' ).offset().left - _this.$handleContainer.offset().left ),
            height: _this.options.resizeFromBody ? _this.$table.height() : _this.$table.find( 'thead' ).height()
          } );
        };
      } )( this ) );
    };

    ResizableColumns.prototype.saveColumnWidths = function () {
      // Iterate over each table header to save its current width
      return this.$tableHeaders.each( ( function ( _this ) {
        return function ( _, el ) {
          var $el; // Current header element
          $el = $( el );

          // Only save width if the column is not marked as 'data-noresize'
          if ( $el.attr( 'data-noresize' ) == null ) {
            // Ensure a storage mechanism is available
            if ( _this.options.store != null ) {
              // Use the store to save the column's parsed width
              return _this.options.store.set( _this.getColumnId( $el ), parseWidth( $el[0] ) );
            }
          }
        };
      } )( this ) );
    };

    ResizableColumns.prototype.restoreColumnWidths = function () {
      // Iterate through each table header to attempt restoring its width from storage
      return this.$tableHeaders.each( ( function ( _this ) {
        return function ( _, el ) {
          var $el, width; // Current header element and its retrieved width
          $el = $( el );

          // Check if a store is available and if a width is stored for the current column
          if ( ( _this.options.store != null ) && ( width = _this.options.store.get( _this.getColumnId( $el ) ) ) ) {
            // If a width is found, apply it to the column
            return setWidth( $el[0], width );
          }
        };
      } )( this ) );
    };

    ResizableColumns.prototype.totalColumnWidths = function () {
      var total; // Variable to accumulate total width
      total = 0;

      // Sum up the widths of all table headers
      this.$tableHeaders.each( ( function ( _this ) {
        return function ( _, el ) {
          // Parse the width of each element and add to total
          return total += parseFloat( $( el )[0].style.width.replace( '%', '' ) );
        };
      } )( this ) );

      return total; // Return the calculated total width
    };

    ResizableColumns.prototype.constrainWidth = function ( width ) {
      // Apply minimum width constraint if defined
      if ( this.options.minWidth != null ) {
        width = Math.max( this.options.minWidth, width );
      }
      // Apply maximum width constraint if defined
      if ( this.options.maxWidth != null ) {
        width = Math.min( this.options.maxWidth, width );
      }
      return width; // Return the constrained width
    };

    ResizableColumns.prototype.pointerdown = function ( e ) {
      // Declare variables for the resizing operation
      var $currentGrip, $leftColumn, $ownerDocument, $rightColumn, newWidths, startPosition, widths;

      e.preventDefault(); // Prevent default browser behavior (e.g., text selection)

      $ownerDocument = $( e.currentTarget.ownerDocument ); // Get the document where the event originated
      startPosition = pointerX( e );                     // Record the initial pointer X position
      $currentGrip = $( e.currentTarget );               // The handle being dragged
      $leftColumn = $currentGrip.data( 'th' );           // The column to the left of the grip
      $rightColumn = this.$tableHeaders.eq( this.$tableHeaders.index( $leftColumn ) + 1 ); // The column to the right

      // Store initial widths of the affected columns
      widths = {
        left: parseWidth( $leftColumn[0] ),
        right: parseWidth( $rightColumn[0] )
      };
      // Initialize newWidths with current widths
      newWidths = {
        left: widths.left,
        right: widths.right
      };

      // Add resizing classes to table and handle container for visual feedback
      this.$handleContainer.add( this.$table ).addClass( 'rc-table-resizing' );
      $leftColumn.add( $rightColumn ).add( $currentGrip ).addClass( 'rc-column-resizing' );

      // Trigger custom 'start' event
      this.triggerEvent( 'column:resize:start', [ $leftColumn, $rightColumn, newWidths.left, newWidths.right ], e );

      // Attach mousemove/touchmove handlers to the document for dragging behavior
      $ownerDocument.on( 'mousemove.rc touchmove.rc', ( function ( _this ) {
        return function ( e ) {
          var difference; // Calculate the difference in pointer position

          // Calculate the percentage difference based on table width
          difference = ( pointerX( e ) - startPosition ) / _this.$table.width() * 100;

          // Set new widths for left and right columns, applying constraints
          setWidth( $leftColumn[0], newWidths.left = _this.constrainWidth( widths.left + difference ) );
          setWidth( $rightColumn[0], newWidths.right = _this.constrainWidth( widths.right - difference ) );

          // If syncHandlers option is enabled, update handle positions
          if ( _this.options.syncHandlers != null ) {
            _this.syncHandleWidths();
          }
          // Trigger custom 'resize' event during dragging
          return _this.triggerEvent( 'column:resize', [ $leftColumn, $rightColumn, newWidths.left, newWidths.right ], e );
        };
      } )( this ) );

      // Attach a one-time mouseup/touchend handler to the document to stop resizing
      return $ownerDocument.one( 'mouseup.rc touchend.rc', ( function ( _this ) {
        return function () {
          $ownerDocument.off( 'mousemove.rc touchmove.rc' ); // Detach move events

          // Remove resizing classes
          _this.$handleContainer.add( _this.$table ).removeClass( 'rc-table-resizing' );
          $leftColumn.add( $rightColumn ).add( $currentGrip ).removeClass( 'rc-column-resizing' );

          _this.syncHandleWidths(); // Final sync of handle positions
          _this.saveColumnWidths(); // Save the new column widths

          // Trigger custom 'stop' event
          return _this.triggerEvent( 'column:resize:stop', [ $leftColumn, $rightColumn, newWidths.left, newWidths.right ], e );
        };
      } )( this ) );
    };

    return ResizableColumns; // Expose the constructor

  })(); // End of ResizableColumns IIFE

  // Extend jQuery's prototype to add the resizableColumns plugin
  return $.fn.extend( {
    resizableColumns: function () {
      var args, option; // Variables to hold plugin options and arguments

      // Extract options and additional arguments from the function call
      option = arguments[0], args = 2 <= arguments.length ? __slice.call( arguments, 1 ) : [];

      // Iterate over each selected table element
      return this.each( function () {
        var $table, data; // Current table element and plugin instance data

        $table = $( this ); // Wrap the current DOM element in jQuery
        data = $table.data( 'resizableColumns' ); // Attempt to retrieve existing plugin instance

        // If no instance exists, create a new one and store it
        if ( !data ) {
          $table.data( 'resizableColumns', ( data = new ResizableColumns( $table, option ) ) );
        }

        // If 'option' is a string, it means a method call (e.g., 'destroy')
        if ( typeof option === 'string' ) {
          // Call the specified method on the plugin instance with provided arguments
          return data[ option ].apply( data, args );
        }
      }); // End of .each()
    }
  }); // End of $.fn.extend()

})( window.jQuery, window ); // End of the main IIFE, passing jQuery and window objects