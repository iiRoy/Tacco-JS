/*!
 *
 * jquery.fixedHeaderTable. The jQuery fixedHeaderTable plugin
 *
 * Copyright (c) 2013 Mark Malek
 * http://fixedheadertable.com
 *
 * Licensed under MIT. For more information, see:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * For jQuery plugin authoring guidelines, refer to:
 * http://docs.jquery.com/Plugins/Authoring
 *
 * Launch Date  : October 2009
 * Current Version : 1.3
 * Last Released: May 9th, 2011
 *
 *
 * Note: All CSS sizing (width, height) in this plugin is handled using pixel (px) units.
 * This ensures consistent layout across different browsers and environments.
 */

( function ( $ ) {


  // Extend jQuery's prototype with the fixedHeaderTable function.
  $.fn.fixedHeaderTable = function ( method ) {

    // These are the plugin's default configuration options.
    var defaults = {
      width:           '100%',     // Default width of the table wrapper
      height:          '100%',     // Default height of the table wrapper
      themeClass:      'fht-default', // CSS class for the table theme
      borderCollapse:  true,       // Whether to apply border-collapse styling
      fixedColumns:    0,          // Number of columns to fix on the left (0 for none)
      fixedColumn:     false,      // For backward-compatibility; equivalent to fixedColumns = 1 if true
      sortable:        false,      // Placeholder for future sorting functionality
      autoShow:        true,       // If false, table will be hidden after creation, requiring manual show()
      footer:          false,      // Flag to indicate if a footer should be used
      cloneHeadToFoot: false,      // If true, the header will be cloned and used as a footer
      autoResize:      false,      // Not yet implemented: resize table if its parent wrapper changes size
      create:          null        // Callback function executed after the plugin completes initialization
    };


    // This object will hold the merged settings (defaults + user options).
    var settings = {};


    // Public methods that can be called on the plugin.
    var methods = {

      /**
       * Initializes the fixedHeaderTable plugin on the selected elements.
       * Merges default options with user-provided options.
       *
       * @param {Object} options - User-defined options to override defaults.
       * @returns {jQuery} - The jQuery object for chaining.
       */
      init: function ( options ) {

        // Merge default settings with any user-provided options.
        settings = $.extend( {}, defaults, options );

        // Iterate through each DOM element selected by the jQuery object.
        return this.each( function () {

          // Create a jQuery reference to the current DOM element.
          var $self = $( this );

          // Validate if the current element is a valid table for the plugin.
          if ( helpers._isTable( $self ) ) {

            // If valid, proceed with setting up the table structure.
            methods.setup.apply( this, Array.prototype.slice.call( arguments, 1 ) );

            // If a 'create' callback function is provided, execute it.
            $.isFunction( settings.create ) && settings.create.call( this );

          } else {

            // If the table markup is invalid, throw an error.
            $.error( 'Invalid table mark-up' );

          }

        } ); // End of `each` iteration.
      },


      /**
       * Sets up the core table structure, including fixed headers and an optional footer.
       * This method handles wrapping, cloning, and initial styling.
       *
       * @returns {HTMLElement} - The raw DOM element the plugin was called on.
       */
      setup: function () {

        var $self             = $( this ), // jQuery object of the original table.
            self              = this,      // Raw DOM element of the original table.
            $thead            = $self.find( 'thead' ), // The table's original thead.
            $tfoot            = $self.find( 'tfoot' ), // The table's original tfoot.
            tfootHeight       = 0,         // Stores the calculated height of the footer.
            $wrapper,                      // Reference to the main plugin wrapper div.
            $divHead,                      // Reference to the div holding the cloned header.
            $divBody,                      // Reference to the div holding the original table body.
            $fixedBody,                    // Reference to the div wrapping the main table when fixed columns are used.
            widthMinusScrollbar;           // Calculated width adjusted for scrollbar.

        // Store a clone of the original table for reference.
        settings.originalTable = $( this ).clone();
        // Determine if padding should be included in width calculations.
        settings.includePadding = helpers._isPaddingIncludedWithWidth();
        // Get the width of the scrollbar for layout adjustments.
        settings.scrollbarOffset = helpers._getScrollbarWidth();
        // Store the theme class name.
        settings.themeClassName = settings.themeClass;

        // Calculate the width, accounting for the scrollbar.
        // If width is a percentage, base it on the parent's width.
        if ( settings.width.search( '%' ) > -1 ) {
            widthMinusScrollbar = $self.parent().width() - settings.scrollbarOffset;
        } else {
            // Otherwise, use the specified pixel width.
            widthMinusScrollbar = settings.width - settings.scrollbarOffset;
        }

        // Apply the calculated width to the original table.
        $self.css( {
          width: widthMinusScrollbar
        } );


        // Check if the table is already wrapped by the plugin.
        if ( ! $self.closest( '.fht-table-wrapper' ).length ) {
          // If not, add the base class and wrap it in the main plugin wrapper.
          $self.addClass( 'fht-table' );
          $self.wrap( '<div class="fht-table-wrapper"></div>' );
        }

        // Get a reference to the newly created (or existing) wrapper.
        $wrapper = $self.closest( '.fht-table-wrapper' );

        // Handle backward-compatibility for the 'fixedColumn' setting.
        if ( settings.fixedColumn === true && settings.fixedColumns <= 0 ) {
          settings.fixedColumns = 1;
        }

        // If fixed columns are enabled and not already set up.
        if ( settings.fixedColumns > 0 && $wrapper.find( '.fht-fixed-column' ).length === 0 ) {
          // Wrap the main table in a 'fixed-body' div.
          $self.wrap( '<div class="fht-fixed-body"></div>' );

          // Prepend the fixed column container.
          $( '<div class="fht-fixed-column"></div>' ).prependTo( $wrapper );

          // Get a reference to the fixed body wrapper.
          $fixedBody = $wrapper.find( '.fht-fixed-body' );
        }

        // Apply overall dimensions and theme class to the main wrapper.
        $wrapper.css( {
          width:  settings.width,
          height: settings.height
        } )
          .addClass( settings.themeClassName ); // Add the theme class.

        // If the table hasn't been initialized yet.
        if ( ! $self.hasClass( 'fht-table-init' ) ) {
          // Wrap the table body in its own scrollable div.
          $self.wrap( '<div class="fht-tbody"></div>' );
        }

        // Get a reference to the tbody wrapper div.
        $divBody = $self.closest( '.fht-tbody' );

        // Get table properties like borders and padding.
        var tableProps = helpers._getTableProps( $self );

        // Setup the clone for the main body wrapper.
        helpers._setupClone( $divBody, tableProps.tbody );

        // If the table hasn't been initialized for fixed headers.
        if ( ! $self.hasClass( 'fht-table-init' ) ) {
          // Create the header div based on whether fixed columns are used.
          if ( settings.fixedColumns > 0 ) {
            $divHead = $( '<div class="fht-thead"><table class="fht-table"></table></div>' ).prependTo( $fixedBody );
          } else {
            $divHead = $( '<div class="fht-thead"><table class="fht-table"></table></div>' ).prependTo( $wrapper );
          }

          // Copy original table classes and styles to the cloned header table.
          $divHead.find( 'table.fht-table' )
            .addClass( settings.originalTable.attr( 'class' ) )
            .attr( 'style', settings.originalTable.attr( 'style' ) );

          // Clone the original thead and append it to the header div's table.
          $thead.clone().appendTo( $divHead.find( 'table' ) );
        } else {
          // If already initialized, just get a reference to the existing header div.
          $divHead = $wrapper.find( 'div.fht-thead' );
        }

        // Setup the clone for the header wrapper.
        helpers._setupClone( $divHead, tableProps.thead );

        // Adjust the original table's top margin to hide its header,
        // as the cloned header is now visible.
        $self.css( {
          'margin-top': - $divHead.outerHeight( true )
        } );

        /*
         * Check for footer presence and set it up if required.
         */
        if ( settings.footer === true ) {
          // Call helper to set up the table footer.
          helpers._setupTableFooter( $self, self, tableProps );

          // If the original tfoot was moved/cloned, get its new reference.
          if ( ! $tfoot.length ) {
            $tfoot = $wrapper.find( 'div.fht-tfoot table' );
          }

          // Calculate the total height of the footer.
          tfootHeight = $tfoot.outerHeight( true );
        }

        // Calculate the height for the scrollable table body.
        // It's wrapper height minus header height, footer height, and table border.
        var tbodyHeight = $wrapper.height() - $thead.outerHeight( true ) - tfootHeight - tableProps.border;

        // Apply the calculated height to the table body wrapper.
        $divBody.css( {
          'height': tbodyHeight
        } );

        // Mark the original table as initialized.
        $self.addClass( 'fht-table-init' );

        // If an alternate class for rows is defined, apply it.
        if ( typeof ( settings.altClass ) !== 'undefined' ) {
          methods.altRows.apply( self );
        }

        // If fixed columns are enabled, proceed with their setup.
        if ( settings.fixedColumns > 0 ) {
          helpers._setupFixedColumn( $self, self, tableProps );
        }

        // If autoShow is false, hide the wrapper after setup.
        if ( ! settings.autoShow ) {
          $wrapper.hide();
        }

        // Bind scroll events to synchronize header and footer.
        helpers._bindScroll( $divBody, tableProps );

        // Return the raw DOM element for potential chaining or direct use.
        return self;
      },


      /**
       * Placeholder for table resizing functionality.
       * Not yet fully implemented.
       *
       * @returns {HTMLElement} - The raw DOM element.
       */
      resize: function () {
        var self = this;
        // Current implementation simply returns the element.
        return self;
      },


      /**
       * Applies an alternating CSS class to table rows for visual distinction.
       *
       * @param {string} [arg1] - Optional: The CSS class name to apply.
       *                          If not provided, uses `settings.altClass`.
       */
      altRows: function ( arg1 ) {
        var $self = $( this ),
            // Determine the altClass to use, either from argument or settings.
            altClass = ( typeof ( arg1 ) !== 'undefined' ) ? arg1 : settings.altClass;

        // Find odd rows within the tbody (excluding hidden ones) and add the altClass.
        $self.closest( '.fht-table-wrapper' )
          .find( 'tbody tr:odd:not(:hidden)' )
          .addClass( altClass );
      },


      /**
       * Displays a hidden fixedHeaderTable.
       * Supports various jQuery show() arguments.
       *
       * @param {number|string|function} [arg1] - Duration, effect name, or callback.
       * @param {number|function}        [arg2] - Duration or callback.
       * @param {function}               [arg3] - Callback function.
       * @returns {HTMLElement} - The raw DOM element.
       */
      show: function ( arg1, arg2, arg3 ) {
        var $self    = $( this ),
            self     = this,
            $wrapper = $self.closest( '.fht-table-wrapper' );

        // Case 1: User provided show duration without a specific effect.
        if ( typeof ( arg1 ) !== 'undefined' && typeof ( arg1 ) === 'number' ) {
          $wrapper.show( arg1, function () {
            $.isFunction( arg2 ) && arg2.call( this ); // Execute callback if it's a function.
          } );

          return self;

        }
        // Case 2: User provided show duration with an effect.
        else if ( typeof ( arg1 ) !== 'undefined' && typeof ( arg1 ) === 'string' &&
                  typeof ( arg2 ) !== 'undefined' && typeof ( arg2 ) === 'number' ) {

          $wrapper.show( arg1, arg2, function () {
            $.isFunction( arg3 ) && arg3.call( this ); // Execute callback if it's a function.
          } );

          return self;

        }

        // Default case: Simply show the wrapper without animation.
        $self.closest( '.fht-table-wrapper' )
          .show();
        $.isFunction( arg1 ) && arg1.call( this ); // Execute callback if arg1 was a function.

        return self;
      },


      /**
       * Hides a fixedHeaderTable.
       * Supports various jQuery hide() arguments.
       *
       * @param {number|string|function} [arg1] - Duration, effect name, or callback.
       * @param {number|function}        [arg2] - Duration or callback.
       * @param {function}               [arg3] - Callback function.
       * @returns {HTMLElement} - The raw DOM element.
       */
      hide: function ( arg1, arg2, arg3 ) {
        var $self    = $( this ),
            self     = this,
            $wrapper = $self.closest( '.fht-table-wrapper' );

        // Case 1: User provided hide duration without a specific effect.
        if ( typeof ( arg1 ) !== 'undefined' && typeof ( arg1 ) === 'number' ) {
          $wrapper.hide( arg1, function () {
            $.isFunction( arg3 ) && arg3.call( this ); // Execute callback if it's a function.
          } );

          return self;
        }
        // Case 2: User provided hide duration with an effect.
        else if ( typeof ( arg1 ) !== 'undefined' && typeof ( arg1 ) === 'string' &&
                  typeof ( arg2 ) !== 'undefined' && typeof ( arg2 ) === 'number' ) {

          $wrapper.hide( arg1, arg2, function () {
            $.isFunction( arg3 ) && arg3.call( this ); // Execute callback if it's a function.
          } );

          return self;
        }

        // Default case: Simply hide the wrapper without animation.
        $self.closest( '.fht-table-wrapper' )
          .hide();

        $.isFunction( arg3 ) && arg3.call( this ); // Execute callback if arg3 was a function.

        return self;
      },


      /**
       * Destroys the fixedHeaderTable instance, reverting the table to its original state.
       * Removes all added wrappers and plugin-specific classes/styles.
       *
       * @returns {HTMLElement} - The raw DOM element.
       */
      destroy: function () {
        var $self    = $( this ),
            self     = this,
            $wrapper = $self.closest( '.fht-table-wrapper' );

        // Insert the original table before its wrapper, effectively unwrapping it.
        $self.insertBefore( $wrapper )
          .removeAttr( 'style' )                               // Remove inline styles added by the plugin.
          .append( $wrapper.find( 'tfoot' ) )                   // Re-append the original tfoot if it was moved.
          .removeClass( 'fht-table fht-table-init' )         // Remove plugin-specific classes.
          .find( '.fht-cell' )
          .remove(); // Remove any helper cells.

        // Remove the plugin's main wrapper div.
        $wrapper.remove();

        return self;
      }

    }; // End of `methods` object.


    // Private helper methods used internally by the plugin.
    var helpers = {

      /**
       * Checks if the given jQuery object is a valid HTML table with a thead and tbody.
       *
       * @param {jQuery} $obj - The jQuery object to check.
       * @returns {boolean} - True if it's a valid table structure, false otherwise.
       */
      _isTable: function ( $obj ) {
        var $self      = $obj,
            hasTable   = $self.is( 'table' ),            // Is it a <table> element?
            hasThead   = $self.find( 'thead' ).length > 0, // Does it contain a <thead>?
            hasTbody   = $self.find( 'tbody' ).length > 0; // Does it contain a <tbody>?

        // A valid table for this plugin must be a table element with both a thead and tbody.
        if ( hasTable && hasThead && hasTbody ) {
          return true;
        }

        return false;

      },


      /**
       * Binds scroll event handlers to the table body to synchronize header/footer scrolling.
       *
       * @param {jQuery} $obj - The jQuery object representing the scrollable table body div.
       */
      _bindScroll: function ( $obj ) {
        var $self    = $obj,
            $wrapper = $self.closest( '.fht-table-wrapper' ), // Main plugin wrapper.
            $thead   = $self.siblings( '.fht-thead' ),        // Cloned header div.
            $tfoot   = $self.siblings( '.fht-tfoot' );        // Cloned footer div.

        // Attach a scroll event listener to the table body.
        $self.bind( 'scroll', function () {

          // If fixed columns are enabled, adjust their vertical position.
          if ( settings.fixedColumns > 0 ) {
            var $fixedColumns = $wrapper.find( '.fht-fixed-column' );

            $fixedColumns.find( '.fht-tbody table' )
              .css( {
                  'margin-top': - $self.scrollTop() // Move fixed column content up/down.
              } );
          }

          // Synchronize the cloned header's horizontal scroll.
          $thead.find( 'table' )
            .css( {
              'margin-left': - this.scrollLeft // Move header content left/right.
            } );

          // If footer is enabled or cloned from head, synchronize its horizontal scroll.
          if ( settings.footer || settings.cloneHeadToFoot ) {
            $tfoot.find( 'table' )
              .css( {
                'margin-left': - this.scrollLeft // Move footer content left/right.
              } );
          }
        } );
      },


      /**
       * Adjusts the height of a jQuery object, optionally including table border.
       *
       * @param {jQuery} $obj       - The jQuery object whose height needs adjustment.
       * @param {Object} tableProps - Object containing table properties, including border.
       */
      _fixHeightWithCss: function ( $obj, tableProps ) {
        // If padding is included in width/height calculations.
        if ( settings.includePadding ) {
          $obj.css( {
            'height': $obj.height() + tableProps.border // Add border to current height.
          } );
        } else {
          // If padding is not included, adjust based on parent's height.
          $obj.css( {
            'height': $obj.parent().height() + tableProps.border
          } );
        }
      },


      /**
       * Adjusts the width of a jQuery object (or a collection of objects),
       * optionally including table border.
       *
       * @param {jQuery} $obj       - The jQuery object(s) whose width needs adjustment.
       * @param {Object} tableProps - Object containing table properties, including border.
       * @param {number} [width]    - Optional: Specific width to set. If undefined, uses current width.
       */
      _fixWidthWithCss: function ( $obj, tableProps, width ) {
        // Iterate over each selected element to apply width adjustment.
        $obj.each( function () {
          var currentWidth;
          // Determine the width to use: explicit `width` or current element's width.
          if ( width === undefined ) {
            currentWidth = $( this ).width();
          } else {
            currentWidth = width;
          }

          // If padding is included in width calculations.
          if ( settings.includePadding ) {
            $( this ).css( {
              'width': currentWidth + tableProps.border // Add border to width.
            } );
          } else {
            // If padding is not included, adjust based on parent's width.
            $( this ).css( {
              'width': currentWidth + tableProps.border
            } );
          }
        } );
      },


      /**
       * Sets up the fixed column structure, cloning and styling cells.
       *
       * @param {jQuery} $obj       - The original table jQuery object.
       * @param {HTMLElement} obj   - The original table DOM element.
       * @param {Object} tableProps - Object containing table properties.
       */
      _setupFixedColumn: function ( $obj, obj, tableProps ) {
        var $self             = $obj,
            $wrapper          = $self.closest( '.fht-table-wrapper' ),
            $fixedBody        = $wrapper.find( '.fht-fixed-body' ),
            $fixedColumn      = $wrapper.find( '.fht-fixed-column' ),
            // Create cloned header, body, and footer structures for the fixed column.
            $thead            = $( '<div class="fht-thead"><table class="fht-table"><thead><tr></tr></thead></table></div>' ),
            $tbody            = $( '<div class="fht-tbody"><table class="fht-table"><tbody></tbody></table></div>' ),
            $tfoot            = $( '<div class="fht-tfoot"><table class="fht-table"><tfoot><tr></tr></tfoot></table></div>' ),
            fixedBodyWidth    = $wrapper.width(),
            fixedBodyHeight   = $fixedBody.find( '.fht-tbody' ).height() - settings.scrollbarOffset,
            $firstThChildren,
            $firstTdChildren,
            fixedColumnWidth,
            $newRow,
            firstTdChildrenSelector;

        // Apply original table classes to the fixed column's cloned tables.
        $thead.find( 'table.fht-table' ).addClass( settings.originalTable.attr( 'class' ) );
        $tbody.find( 'table.fht-table' ).addClass( settings.originalTable.attr( 'class' ) );
        $tfoot.find( 'table.fht-table' ).addClass( settings.originalTable.attr( 'class' ) );

        // Select the header cells for the fixed columns.
        $firstThChildren = $fixedBody.find( '.fht-thead thead tr > *:lt(' + settings.fixedColumns + ')' );
        fixedColumnWidth = settings.fixedColumns * tableProps.border; // Start width with border contributions.
        $firstThChildren.each( function () {
          fixedColumnWidth += $( this ).outerWidth( true ); // Add outer width of each header cell.
        } );

        // Fix heights and widths of the cloned header cells.
        helpers._fixHeightWithCss( $firstThChildren, tableProps );
        helpers._fixWidthWithCss( $firstThChildren, tableProps );

        // Store widths of the fixed header cells to apply to body cells.
        var tdWidths = [];
        $firstThChildren.each( function () {
          tdWidths.push( $( this ).width() );
        } );

        // Select the body cells for the fixed columns.
        firstTdChildrenSelector = 'tbody tr > *:not(:nth-child(n+' + ( settings.fixedColumns + 1 ) + '))';
        $firstTdChildren = $fixedBody.find( firstTdChildrenSelector )
          .each( function ( index ) {
            // Fix heights and widths of the cloned body cells, using stored header widths.
            helpers._fixHeightWithCss( $( this ), tableProps );
            helpers._fixWidthWithCss( $( this ), tableProps, tdWidths[ index % settings.fixedColumns ] );
          } );

        // Clone header cells and append to the fixed column's header.
        $thead.appendTo( $fixedColumn )
          .find( 'tr' )
          .append( $firstThChildren.clone() );

        // Append the fixed column's body wrapper.
        $tbody.appendTo( $fixedColumn )
          .css( {
            'margin-top': -1, // Adjust margin.
            'height': fixedBodyHeight + tableProps.border // Set height.
          } );

        // Clone fixed body cells into the fixed column's body.
        $firstTdChildren.each( function ( index ) {
          // Create a new row for every `settings.fixedColumns` cells.
          if ( index % settings.fixedColumns === 0 ) {
            $newRow = $( '<tr></tr>' ).appendTo( $tbody.find( 'tbody' ) );

            // Copy altClass if present.
            if ( settings.altClass && $( this ).parent().hasClass( settings.altClass ) ) {
              $newRow.addClass( settings.altClass );
            }
          }

          $( this ).clone()
            .appendTo( $newRow ); // Append cloned cell to the new row.
        } );

        // Set the calculated width for the fixed column wrapper.
        $fixedColumn.css( {
          'height': 0, // Height is managed by its children.
          'width': fixedColumnWidth
        } );


        // Bind mousewheel events to the fixed column body for synchronized scrolling.
        var maxTop = $fixedColumn.find( '.fht-tbody .fht-table' ).height() - $fixedColumn.find( '.fht-tbody' ).height();
        $fixedColumn.find( '.fht-tbody .fht-table' ).bind( 'mousewheel', function ( event, delta, deltaX, deltaY ) {
          // Only react to vertical scroll.
          if ( deltaY === 0 ) {
            return;
          }
          var top = parseInt( $( this ).css( 'marginTop' ), 10 ) + ( deltaY > 0 ? 120 : -120 ); // Calculate new top margin.
          if ( top > 0 ) {
            top = 0; // Don't scroll past the top.
          }
          if ( top < - maxTop ) {
            top = - maxTop; // Don't scroll past the bottom.
          }
          $( this ).css( 'marginTop', top ); // Apply new margin.
          $fixedBody.find( '.fht-tbody' ).scrollTop( - top ).scroll(); // Synchronize main body scroll.
          return false; // Prevent default mousewheel action.
        } );


        // Set the width of the main body table wrapper.
        $fixedBody.css( {
          'width': fixedBodyWidth
        } );

        // Setup clone footer with fixed column if footer is enabled.
        if ( settings.footer === true || settings.cloneHeadToFoot === true ) {
          var $firstTdFootChild = $fixedBody.find( '.fht-tfoot tr > *:lt(' + settings.fixedColumns + ')' ),
              footwidth; // This variable is declared but not used in the provided snippet.

          // Fix height of fixed footer cells.
          helpers._fixHeightWithCss( $firstTdFootChild, tableProps );
          $tfoot.appendTo( $fixedColumn )
            .find( 'tr' )
            .append( $firstTdFootChild.clone() );
          // Set (view width) of $tfoot div to width of table (this accounts for footers with a colspan)
        }
      },


      /**
       * Gets various properties of the table, such as border widths.
       *
       * @param {jQuery} $obj - The jQuery object of the table.
       * @returns {Object} - An object containing table properties.
       */
      _getTableProps: function ( $obj ) {
        var tableProps = {
          border: 0,
          tbody: {
            'border-left-width':  0,
            'border-right-width': 0,
            'border-top-width':   0,
            'border-bottom-width': 0
          },
          thead: {
            'border-left-width':  0,
            'border-right-width': 0,
            'border-top-width':   0,
            'border-bottom-width': 0
          },
          tfoot: {
            'border-left-width':  0,
            'border-right-width': 0,
            'border-top-width':   0,
            'border-bottom-width': 0
          }
        };

        // If border-collapse is not enabled, calculate individual border widths.
        if ( settings.borderCollapse === false ) {
          tableProps.border = parseInt( $obj.find( 'thead' ).css( 'border-left-width' ), 10 ) +
                              parseInt( $obj.find( 'thead' ).css( 'border-right-width' ), 10 ) +
                              parseInt( $obj.find( 'thead' ).css( 'border-top-width' ), 10 ) +
                              parseInt( $obj.find( 'thead' ).css( 'border-bottom-width' ), 10 );

          tableProps.tbody = {
            'border-left-width':  parseInt( $obj.find( 'tbody' ).css( 'border-left-width' ), 10 ),
            'border-right-width': parseInt( $obj.find( 'tbody' ).css( 'border-right-width' ), 10 ),
            'border-top-width':   parseInt( $obj.find( 'tbody' ).css( 'border-top-width' ), 10 ),
            'border-bottom-width': parseInt( $obj.find( 'tbody' ).css( 'border-bottom-width' ), 10 )
          };
          tableProps.thead = {
            'border-left-width':  parseInt( $obj.find( 'thead' ).css( 'border-left-width' ), 10 ),
            'border-right-width': parseInt( $obj.find( 'thead' ).css( 'border-right-width' ), 10 ),
            'border-top-width':   parseInt( $obj.find( 'thead' ).css( 'border-top-width' ), 10 ),
            'border-bottom-width': parseInt( $obj.find( 'thead' ).css( 'border-bottom-width' ), 10 )
          };
          tableProps.tfoot = {
            'border-left-width':  parseInt( $obj.find( 'tfoot' ).css( 'border-left-width' ), 10 ),
            'border-right-width': parseInt( $obj.find( 'tfoot' ).css( 'border-right-width' ), 10 ),
            'border-top-width':   parseInt( $obj.find( 'tfoot' ).css( 'border-top-width' ), 10 ),
            'border-bottom-width': parseInt( $obj.find( 'tfoot' ).css( 'border-bottom-width' ), 10 )
          };
        }

        return tableProps;
      },


      /**
       * Sets up a cloned element, copying classes, styles, and dimensions from the original.
       *
       * @param {jQuery} $clone       - The jQuery object of the cloned element.
       * @param {Object} props        - Object containing CSS properties to apply.
       */
      _setupClone: function ( $clone, props ) {
        $clone.find( 'table.fht-table' )
          .attr( 'class', settings.originalTable.attr( 'class' ) ) // Copy original classes.
          .attr( 'style', settings.originalTable.attr( 'style' ) ); // Copy original inline styles.

        $clone.css( {
          'overflow': 'hidden',
          'height':   $clone.height() + props['border-top-width'] + props['border-bottom-width']
        } );
      },


      /**
       * Sets up the table footer, either by cloning the existing tfoot or the thead.
       *
       * @param {jQuery} $obj       - The original table jQuery object.
       * @param {HTMLElement} self  - The original table DOM element.
       * @param {Object} tableProps - Object containing table properties.
       */
      _setupTableFooter: function ( $obj, self, tableProps ) {
        var $self      = $obj,
            $wrapper   = $self.closest( '.fht-table-wrapper' ),
            $tfoot     = $self.find( 'tfoot' ),
            $divFoot,
            $fixedBody = $wrapper.find( '.fht-fixed-body' );

        // If fixed columns are enabled, append footer to fixed body.
        if ( settings.fixedColumns > 0 ) {
          $divFoot = $( '<div class="fht-tfoot"><table class="fht-table"></table></div>' ).appendTo( $fixedBody );
        } else {
          // Otherwise, append to the main wrapper.
          $divFoot = $( '<div class="fht-tfoot"><table class="fht-table"></table></div>' ).appendTo( $wrapper );
        }

        // Copy original table classes and styles to the cloned footer table.
        $divFoot.find( 'table.fht-table' )
          .addClass( settings.originalTable.attr( 'class' ) )
          .attr( 'style', settings.originalTable.attr( 'style' ) );

        // If 'cloneHeadToFoot' is true, clone the header for the footer.
        if ( settings.cloneHeadToFoot === true ) {
          $self.find( 'thead' ).clone().appendTo( $divFoot.find( 'table' ) );
        }
        // Otherwise, if an original tfoot exists, clone it.
        else if ( $tfoot.length > 0 ) {
          $tfoot.clone().appendTo( $divFoot.find( 'table' ) );
        }

        // Setup the clone for the footer wrapper.
        helpers._setupClone( $divFoot, tableProps.tfoot );
      },


      /**
       * Determines if padding is included in width calculations based on browser.
       *
       * @returns {boolean} - True if padding is included, false otherwise.
       */
      _isPaddingIncludedWithWidth: function () {
        var p = $( '<p style="width:1px;padding:1px;"></p>' ),
            div = $( '<div style="width:0;overflow:hidden;"></div>' );

        div.append( p );
        $( 'body' ).append( div );
        var w = p.width();
        div.remove();
        return ( w === 3 ); // If width is 3 (1px content + 1px left padding + 1px right padding), padding is included.
      },


      /**
       * Calculates the width of the browser's scrollbar.
       *
       * @returns {number} - The scrollbar width in pixels.
       */
      _getScrollbarWidth: function () {
        // Create a temporary div to measure scrollbar width.
        var scr = document.createElement( 'div' );
        scr.style.position = 'absolute';
        scr.style.top = '-1000px';
        scr.style.left = '-1000px';
        scr.style.width = '100px';
        scr.style.height = '50px';
        scr.style.overflow = 'scroll';
        document.body.appendChild( scr );
        var sw = scr.offsetWidth - scr.clientWidth; // Offset width includes scrollbar, client width doesn't.
        document.body.removeChild( scr );
        return sw;
      }

    }; // End of `helpers` object.


    // If a method name is passed, check if it exists and call it.
    if ( methods[ method ] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
    }
    // If no method or 'init' is passed, initialize the plugin.
    else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    }
    // If an invalid method is called, throw an error.
    else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.fixedHeaderTable' );
    }

  }; // End of `$.fn.fixedHeaderTable` function.

} )( jQuery ); // End of IIFE, passing jQuery as $ to prevent conflicts.