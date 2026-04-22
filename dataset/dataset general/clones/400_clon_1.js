/*
 * Global variables declaration for JSHint/ESLint.
 * This ensures that '$' and 'jQuery' are recognized as global.
 */
/*global $:false, jQuery:false*/

/*
 * =============================================================================
 * Drag & Drop Table Columns Plugin
 * Version: 0.1.3
 * Author: Aleksandr Nikitin (a.nikitin@i.ua)
 * Project Repository: https://github.com/alexshnur/drag-n-drop-table-columns
 *
 * This plugin enables drag-and-drop functionality for table columns,
 * allowing users to reorder them dynamically.
 *
 * It's wrapped in an Immediately Invoked Function Expression (IIFE)
 * to create a private scope and prevent global variable pollution.
 * It also accepts jQuery and the window object as arguments.
 * =============================================================================
 */
( function ( $, window ) {

  // Module-level variables for storing column references,
  // currently dragged element, and the plugin instance.
  var cols,
      dragSrcEl      = null,          // Stores the source element being dragged.
      dragSrcEnter   = null,          // Stores the element the drag source is currently hovering over.
      dragableColumns,                // Reference to the main plugin constructor.
      _this;                          // Used to maintain context within event handlers.


  /**
   * Inserts a DOM element after a specified reference element.
   *
   * @param {HTMLElement} elem     - The element to insert.
   * @param {HTMLElement} refElem  - The reference element; 'elem' will be inserted after it.
   * @returns {HTMLElement} The inserted element.
   */
  function insertAfter ( elem, refElem ) {

    // Ensure both elements exist and refElem has a parent.
    if ( !elem || !refElem || !refElem.parentNode ) {

      return null;
    }

    // Perform the insertion using standard DOM methods.
    return refElem.parentNode.insertBefore( elem, refElem.nextSibling );
  }


  /**
   * Checks if the current browser is Internet Explorer and returns its version number.
   *
   * @returns {number|boolean} IE version (e.g., 9, 10) if IE, otherwise false.
   */
  function isIE () {

    var nav = navigator.userAgent.toLowerCase(); // Get user agent string.

    // Check for 'msie' substring.
    return ( nav.indexOf( 'msie' ) !== -1 )
             ? parseInt( nav.split( 'msie' )[1] ) // Parse version number if found.
             : false;                             // Not IE.
  }


  /**
   * Main plugin definition wrapped in an IIFE to encapsulate its internals.
   * This structure helps to define the `dragableColumns` constructor and its prototype methods.
   */
  dragableColumns = ( function () {

    var $table; // Private variable to hold the jQuery table object.

    /**
     * dragColumns Constructor function.
     * Initializes the drag-and-drop functionality for a given table.
     *
     * @param {jQuery} table    - The jQuery object representing the table.
     * @param {object} options  - Configuration options for the plugin instance.
     */
    function dragColumns ( table, options ) {

      _this = this; // Store the instance context for use in event handlers.

      $table = table; // Assign the table jQuery object to the private variable.

      // Merge default options with user-provided options.
      _this.options = $.extend( {}, _this.options, options );

      // Proceed only if the 'drag' option is enabled.
      if ( _this.options.drag ) {

        // Special handling for IE9, which requires anchor tags for draggable elements.
        if ( isIE() === 9 ) {

          $table.find( 'thead tr th' ).each( function () {

            // If the special IE drag handle is not already present, add it.
            if ( $( this ).find( '.drag-ie' ).length === 0 ) {

              $( this ).html( $( '<a>' ).html( $( this ).html() ).attr( 'href', '#' ).addClass( 'drag-ie' ) );
            }
          } );
        }

        // Select all header columns.
        cols = $table.find( 'thead tr th' );

        // Add 'dataTransfer' to jQuery's event properties for consistent access.
        jQuery.event.props.push( 'dataTransfer' );

        // Iterate over each column and attach drag-and-drop event listeners.
        [].forEach.call( cols, function ( col ) {

          col.setAttribute( 'draggable', true ); // Make the column draggable.

          // Attach all necessary drag event handlers using jQuery.
          $( col ).on( 'dragstart', _this.handleDragStart );
          $( col ).on( 'dragenter', _this.handleDragEnter );
          $( col ).on( 'dragover', _this.handleDragOver );
          $( col ).on( 'dragleave', _this.handleDragLeave );
          $( col ).on( 'drop', _this.handleDrop );
          $( col ).on( 'dragend', _this.handleDragEnd );
        } );
      }
    }


    /**
     * Prototype methods and properties for the dragColumns instances.
     * These methods define the behavior of the drag-and-drop actions.
     */
    dragColumns.prototype = {

      // Default options for the plugin.
      options: {
        drag                  : true,           // Enable/disable drag functionality.
        dragClass             : 'drag',         // CSS class applied to the dragged element.
        overClass             : 'over',         // CSS class applied to the element being hovered over.
        movedContainerSelector: '.dnd-moved'    // Selector for rows that contain draggable cells (e.g., tbody rows).
      },

      /**
       * Handler for the 'dragstart' event.
       * Initiates the drag operation.
       *
       * @param {Event} e - The dragstart event object.
       */
      handleDragStart: function ( e ) {

        $( this ).addClass( _this.options.dragClass ); // Add drag class to the source element.

        dragSrcEl = this; // Store reference to the element being dragged.

        e.dataTransfer.effectAllowed = 'copy'; // Specify the allowed drag effect.

        e.dataTransfer.setData( 'text/html', this.id ); // Set data to be transferred (e.g., element ID).
      },


      /**
       * Handler for the 'dragover' event.
       * Prevents default behavior to allow a drop.
       *
       * @param {Event} e - The dragover event object.
       * @returns {boolean} Always false to signify a successful dragover.
       */
      handleDragOver: function ( e ) {

        if ( e.preventDefault ) {

          e.preventDefault(); // Prevent default to allow drop.
        }

        e.dataTransfer.dropEffect = 'copy'; // Set the drop effect.

        return false; // Indicate that a drop is possible.
      },


      /**
       * Handler for the 'dragenter' event.
       * Highlights the target element when a draggable item enters its boundary.
       *
       * @param {Event} e - The dragenter event object.
       * @returns {boolean} Always false.
       */
      handleDragEnter: function ( e ) {

        dragSrcEnter = this; // Store reference to the element being entered.

        // Remove 'overClass' from all columns first.
        [].forEach.call( cols, function ( col ) {

          $( col ).removeClass( _this.options.overClass );
        } );

        $( this ).addClass( _this.options.overClass ); // Add 'overClass' to the current target.

        return false;
      },


      /**
       * Handler for the 'dragleave' event.
       * Removes highlighting when a draggable item leaves the target element.
       *
       * @param {Event} e - The dragleave event object.
       */
      handleDragLeave: function ( e ) {

        // Check if the element being left is different from the drag source.
        if ( dragSrcEnter !== e ) {

          // If the class removal is needed, uncomment the next line.
          // this.classList.remove(_this.options.overClass);
        }
      },


      /**
       * Handler for the 'drop' event.
       * Executes the column reordering logic.
       *
       * @param {Event} e - The drop event object.
       * @returns {boolean} Always false to stop propagation and prevent default.
       */
      handleDrop: function ( e ) {

        if ( e.stopPropagation ) {

          e.stopPropagation(); // Stop propagation to prevent browser default drop handling.
        }

        // Only perform reorder if the source and target are different.
        if ( dragSrcEl !== e ) {

          _this.moveColumns( $( dragSrcEl ).index(), $( this ).index() ); // Call the column moving function.
        }

        return false;
      },


      /**
       * Handler for the 'dragend' event.
       * Cleans up classes after the drag operation concludes.
       *
       * @param {Event} e - The dragend event object.
       * @returns {boolean} Always false.
       */
      handleDragEnd: function ( e ) {

        // Remove 'overClass' from all columns.
        [].forEach.call( cols, function ( col ) {

          $( col ).removeClass( _this.options.overClass );
        } );

        $( dragSrcEl ).removeClass( _this.options.dragClass ); // Remove 'dragClass' from the source element.

        return false;
      },


      /**
       * Reorders table columns based on the provided indices.
       * This method moves both the header column and corresponding cells in data rows.
       *
       * @param {number} fromIndex - The original index of the column being moved.
       * @param {number} toIndex   - The target index where the column should be moved.
       */
      moveColumns: function ( fromIndex, toIndex ) {

        // Select all rows that contain cells to be reordered (e.g., tbody rows).
        var rows = $table.find( _this.options.movedContainerSelector );

        // Iterate through each affected row.
        for ( var i = 0; i < rows.length; i++ ) {

          // Determine the direction of the move and use appropriate DOM insertion.
          if ( toIndex > fromIndex ) {

            // Moving right: insert the source cell after the target cell.
            insertAfter( rows[i].children[fromIndex], rows[i].children[toIndex] );

          } else if ( toIndex < $table.find( 'thead tr th' ).length - 1 ) {

            // Moving left: insert the source cell before the target cell.
            rows[i].insertBefore( rows[i].children[fromIndex], rows[i].children[toIndex] );
          }
        }
      }
    };


    // Return the constructor function, making it accessible to the outer scope.
    return dragColumns;

  } )();


  /**
   * jQuery plugin integration.
   * Extends jQuery's prototype to make `dragableColumns` available as a plugin.
   */
  return $.fn.extend( {

    /**
     * Initializes the dragableColumns plugin on a set of tables.
     *
     * @param {object} [option] - Optional configuration object.
     * @returns {jQuery} The jQuery object for chaining.
     */
    dragableColumns: function () {

      // Retrieve the first argument as options.
      var option = ( arguments[0] );

      // Iterate over each selected table element.
      return this.each( function () {

        var $table = $( this ); // Wrap the current DOM element in a jQuery object.

        // Create a new instance of dragableColumns for the current table.
        new dragableColumns( $table, option );
      } );
    }
  } );

} )( window.jQuery, window ); // Pass jQuery and window objects to the IIFE.