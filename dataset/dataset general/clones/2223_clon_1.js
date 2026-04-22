/*
 *
 * jQuery Nested v1.03 - A flexible and responsive grid layout plugin.
 *
 * This version aims to provide a gap-free, multi-column grid layout solution.
 * Project homepage: http://suprb.com/apps/nested/
 * Authors: Andreas Pihlström (original concept) and Jonas Blomdin (additional contributions).
 *
 * This software is distributed under the terms of the MIT License.
 * Please see the accompanying LICENSE file for full license details.
 *
 */

/*
 * Utility function: Debouncing
 * Original source: John Hann - http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
 * Adopted from: Paul Irish's throttled/smartresize handler - http://paulirish.com/2009/throttled-smartresize-jquery-event-handler/
 */

( function ( $, sr )
{

    var debounce = function ( func, threshold, execAsap )
    {
        var timeout;

        return function debounced ()
        {
            var obj  = this,
                args = arguments;

            function delayed ()
            {
                if ( ! execAsap )
                {
                    func.apply( obj, args );
                }

                timeout = null;
            };


            if ( timeout )
            {
                clearTimeout( timeout );
            }
            else if ( execAsap )
            {
                func.apply( obj, args );
            }

            timeout = setTimeout( delayed, threshold || 150 );
        };
    };


    jQuery.fn[sr] = function ( fn )
    {
        return fn ? this.bind('resize', debounce( fn ) ) : this.trigger( sr );
    };

} ) ( jQuery, 'smartresize' );


// Ensure Object.keys compatibility for older browsers.
// This polyfill provides a way to retrieve an array of a given object's own enumerable property names.

if ( ! Object.keys )
{
    Object.keys = function ( obj )
    {
        var keys = [],
            k;

        for ( k in obj )
        {
            // Check if the property is an own property of the object (not inherited).
            if ( Object.prototype.hasOwnProperty.call( obj, k ) )
            {
                keys.push( k );
            }
        }

        return keys;
    };
}


/* The core "Nested" functionality starts here. */

( function ( $ )
{

    // Constructor function for the Nested plugin.
    $.Nested = function ( options, element )
    {
        this.element = $( element ); // Store the jQuery element.
        this._init( options );        // Initialize the plugin instance.
    };


    // Default settings for the Nested plugin.
    $.Nested.settings = {
        selector              : '.box',        // Selector for the items within the grid.
        minWidth              : 50,            // Minimum width of a grid column.
        minColumns            : 1,             // Minimum number of columns to display.
        gutter                : 1,             // Space between grid items.
        centered              : false,         // Center the grid within its parent.
        resizeToFit           : true,          /* Option to resize blocks to fit available gaps. */
        resizeToFitOptions    : {
            resizeAny : true                 /* If true, any block can be resized to fill a gap; otherwise, only blocks smaller than the gap. */
        },
        animate               : true,          // Enable/disable animation for positioning.
        animationOptions      : {
            speed    : 20,                   // Speed of individual item animation (delay between items).
            duration : 100,                  // Duration of the CSS animation.
            queue    : true,                 // Queue animations, making them sequential.
            complete : function () {}        // Callback function executed after all animations are complete.
        }
    };


    // Prototype methods for the Nested plugin.
    $.Nested.prototype = {

        /*
         * _init method: Initializes the Nested plugin instance.
         * @param {object} options - User-defined options to override defaults.
         */
        _init : function ( options )
        {
            var container = this; // Reference to the current Nested instance.

            this.box = this.element; // The main container element for the grid.

            // Ensure the container has relative positioning for absolute child positioning.
            $( this.box ).css( 'position', 'relative' );

            // Merge default settings with user-provided options.
            this.options = $.extend( true, {}, $.Nested.settings, options );

            this.elements      = [];         // Array to hold grid element data.
            this._isResizing   = false;      // Flag to indicate if a resize operation is in progress.
            this._update       = true;       // Flag to control updates (might be unused or for future features).
            this.maxy          = new Array(); // Array to store maximum Y positions (initially empty).


            // Attach the smartresize event handler to the window.
            $( window ).smartresize( function ()
            {
                // When the window resizes, trigger the plugin's resize method.
                container.resize();
            } );


            // Initial setup of box dimensions and positions.
            this._setBoxes();
        },


        /*
         * _setBoxes method: Determines the dimensions and initial positions of grid items.
         * @param {jQuery} $els   - Optional jQuery collection of elements to process.
         * @param {string} method - Optional method ('append' or 'prepend') indicating how elements are added.
         */
        _setBoxes : function ( $els, method )
        {
            var self = this; // Cache 'this' for use in inner functions.

            this.idCounter   = 0;     // Unique ID counter for each box.
            this.counter     = 0;     // General counter (e.g., for processed elements).
            this.t           = 0;     // Another counter, purpose might be specific to animation/rendering.
            this.maxHeight   = 0;     // Tracks the maximum height of the grid.
            this.currWidth   = 0;     // Tracks the current width of the grid.

            // Get all elements matching the selector within the container.
            this.total       = this.box.find( this.options.selector );

            this.matrix      = {};    // Grid matrix to track occupied spaces.
            this.gridrow     = new Object(); // Object to represent grid rows.


            // Calculate the available width for grid placement.
            // If centered, use window width; otherwise, use the container's inner width.
            var calcWidth = ! this.options.centered ? this.box.innerWidth() : $( window ).width();


            // Determine the number of columns based on minWidth and gutter.
            this.columns = Math.max( this.options.minColumns, parseInt( calcWidth / ( this.options.minWidth + this.options.gutter ) ) + 1 );


            // Retrieve various option values for convenience.
            var minWidth = this.options.minWidth;
            var gutter   = this.options.gutter;
            var display  = "block"; // Default display style for grid items.


            // If $els is not provided, find all elements matching the selector.
            $els = this.box.find( this.options.selector );


            // Iterate over each grid element.
            $.each( $els, function ()
            {

                // Extract dimensions (x, y) from the element's class attribute.
                // Expects classes like "sizeNxN" where N is a number.
                var dim = parseInt( $( this ).attr( 'class' ).replace( /^.*size([0-9]+).*$/, '$1' ) ).toString().split( '' );

                var x = ( dim[0] == "N" ) ? 1 : parseFloat( dim[0] ); // Width multiplier.
                var y = ( dim[1] == "a" ) ? 1 : parseFloat( dim[1] ); // Height multiplier.


                // Calculate the actual width and height of the box.
                var currWidth  = minWidth * x + gutter * ( x - 1 );
                var currHeight = minWidth * y + gutter * ( y - 1 );


                // Apply initial CSS styles to the element.
                $( this ).css( {
                    'display'  : display,
                    'position' : 'absolute',
                    'width'    : currWidth,
                    'height'   : currHeight,
                    'top'      : $( this ).position().top,  // Keep current top position initially.
                    'left'     : $( this ).position().left  // Keep current left position initially.
                } )
                .removeClass( 'nested-moved' ) // Remove a specific class if present.
                .attr( 'data-box', self.idCounter ) // Assign a unique data-box ID.
                .attr( 'data-width', currWidth );  // Store the calculated width as data attribute.


                self.idCounter++; // Increment the ID counter.


                // Render the grid for the current element.
                self._renderGrid( $( this ), method );

            } );


            // After processing all elements, position them.
            if ( self.counter == self.total.length )
            {

                // If the 'resizeToFit' option is enabled, fill any gaps.
                if ( self.options.resizeToFit )
                {
                    self.elements = self._fillGaps();
                }

                // Render the items with their final positions.
                self._renderItems( self.elements );

                // Reset the elements array for the next operation.
                self.elements = [];
            }
        },


        /*
         * _addMatrixRow method: Adds a new row to the grid matrix if it doesn't exist.
         * @param {number} y - The Y-coordinate (row index) for the new row.
         * @returns {boolean} - False if the row already exists, true otherwise.
         */
        _addMatrixRow : function ( y )
        {
            if ( this.matrix[y] )
            {
                return false; // Row already exists.
            }
            else
            {
                this.matrix[y] = {}; // Create a new empty object for the row.
            }


            // Initialize columns for the new row as 'false' (empty).
            for ( var c = 0; c < ( this.columns - 1 ); c++ )
            {
                var x = c * ( this.options.minWidth + this.options.gutter );
                this.matrix[y][x] = 'false';
            }

            return true; // Row successfully added.
        },


        /*
         * _updateMatrix method: Marks the area occupied by an element in the grid matrix.
         * @param {object} el - An object representing a grid element with x, y, width, and height properties.
         */
        _updateMatrix : function ( el )
        {
            var height = 0; // Local variable (seems unused, might be a remnant).

            var t = parseInt( el['y'] ); // Top position (y-coordinate).
            var l = parseInt( el['x'] ); // Left position (x-coordinate).


            // Iterate through the height of the element.
            for ( var h = 0; h < el['height']; h += ( this.options.minWidth + this.options.gutter ) )
            {
                // Iterate through the width of the element.
                for ( var w = 0; w < el['width']; w += ( this.options.minWidth + this.options.gutter ) )
                {
                    var x = l + w; // Current X position in the grid.
                    var y = t + h; // Current Y position in the grid.

                    // If the matrix row doesn't exist, create it.
                    if ( ! this.matrix[y] )
                    {
                        this._addMatrixRow( y );
                    }

                    // Mark the current grid cell as occupied.
                    this.matrix[y][x] = 'true';
                }
            }
        },


        /*
         * _getObjectSize method: Helper function to count properties in an object.
         * @param {object} obj - The object to count properties of.
         * @returns {number} - The number of enumerable properties in the object.
         */
        _getObjectSize : function ( obj )
        {
            var size = 0; // Initialize size counter.

            // Iterate over object properties and increment size.
            $.each( obj, function ( p, v )
            {
                size++;
            } );

            return size; // Return the total count.
        },


        /*
         * _fillGaps method: Identifies and fills empty spaces (gaps) in the grid.
         * This method is called if `resizeToFit` option is true.
         * @returns {Array} - The updated array of elements, including resized ones.
         */
        _fillGaps : function ()
        {
            var self = this; // Cache 'this'.
            var box  = {};   // Temporary object to define a potential gap-filling box.


            // First, update the grid matrix with all existing elements.
            $.each( this.elements, function ( index, el )
            {
                self._updateMatrix( el );
            } );


            var arr = this.elements; // Get the current array of elements.

            // Sort elements by their Y-position in descending order.
            arr.sort( function ( a, b )
            {
                return a.y - b.y;
            } );
            arr.reverse();


            // Find the highest Y-value among the elements.
            var topY = arr[0]['y'];


            var actualY = 0; // Variable for current Y with offset (seems unused after initialization).


            // Get the current number of rows in the matrix.
            var rowsLeft = this._getObjectSize( this.matrix );


            // Iterate through each row in the grid matrix.
            $.each( this.matrix, function ( y, row )
            {
                rowsLeft--; // Decrement the count of remaining rows.

                // Convert y to an integer.
                actualY = parseInt( y ); // + parseInt(self.box.offset().top); // Offset commented out.


                // Iterate through each column in the current row.
                $.each( row, function ( x, col )
                {

                    // If a gap is found ('false' in the matrix) and it's above the highest item's Y.
                    if ( col === 'false' && actualY < topY )
                    {
                        // Define the properties of the potential gap-filling box.
                        if ( ! box.y ) { box.y = y; }
                        if ( ! box.x ) { box.x = x; }

                        if ( ! box.w )
                        {
                            box.w = 0;
                        }
                        if ( ! box.h )
                        {
                            box.h = self.options.minWidth;
                        }

                        // Extend the width of the potential box.
                        box.w += ( box.w ) ? ( self.options.minWidth + self.options.gutter ) : self.options.minWidth;


                        var addonHeight = 0; // Variable to calculate additional height for the gap.

                        // Check for vertical gaps in subsequent rows.
                        for ( var row = 1; row < rowsLeft; row++ )
                        {
                            var z = parseInt( y ) + parseInt( row * ( self.options.minWidth + self.options.gutter ) );

                            // If there's a gap directly below in the same column.
                            if ( self.matrix[z] && self.matrix[z][x] == 'false' )
                            {
                                addonHeight += ( self.options.minWidth + self.options.gutter );
                                self.matrix[z][x] = 'true'; // Mark as occupied to prevent re-checking.
                            }
                            else
                            {
                                break; // Stop if the vertical gap is broken.
                            }
                        }

                        // Add the calculated additional height to the box's height.
                        // The condition (parseInt(addonHeight) / ... == rowsLeft) seems to be a check for full vertical fill, but the logic might need clarification.
                        box.h + ( ( parseInt( addonHeight ) / ( self.options.minWidth + self.options.gutter ) == rowsLeft ) ? 0 : parseInt( addonHeight ) );

                        box.ready = true; // Mark the box as ready to be processed.

                    }
                    else if ( box.ready ) // If a potential gap-filling box has been defined.
                    {

                        // Iterate through the existing elements to find a suitable one to resize.
                        $.each( arr, function ( i, el )
                        {
                            // Check if the current element can fit into the discovered gap.
                            // `resizeAny` allows any block to be resized; otherwise, it must be smaller.
                            if ( box.y <= arr[i]['y'] && ( self.options.resizeToFitOptions.resizeAny || ( box.w <= arr[i]['width'] && box.h <= arr[i]['height'] ) ) )
                            {
                                arr.splice( i, 1 ); // Remove the original element from the array.
                                $( el['$el'] ).addClass( 'nested-moved' ); // Add a class to indicate it was moved/resized.

                                // Add the resized element to the elements array with new dimensions and position.
                                self.elements.push( {
                                    $el    : $( el['$el'] ),
                                    x      : parseInt( box.x ),
                                    y      : parseInt( box.y ),
                                    col    : i, // Original column index (might be for debugging).
                                    width  : parseInt( box.w ),
                                    height : parseInt( box.h )
                                } );

                                return false; // Break out of this inner $.each loop.
                            }
                        } );

                        box = {}; // Reset the box object for the next gap.
                    }
                } );

            } );


            self.elements = arr; // Update the main elements array.

            return self.elements; // Return the modified elements array.

        },


        /*
         * _renderGrid method: Calculates the optimal position for a new grid item.
         * @param {jQuery} $box   - The jQuery object representing the grid item.
         * @param {string} method - 'append' or 'prepend' indicating how the item is added.
         */
        _renderGrid : function ( $box, method )
        {

            this.counter++; // Increment the element counter.

            var ypos, gridy = ypos = 0; // Initialize Y position variables.
            var tot     = 0; // Another counter, possibly for total items (seems unused).

            // Determine the direction for adding elements to the array.
            var direction = ! method ? "append" : "prepend";


            // Get the width and height of the current box.
            var width  = $box.width();
            var height = $box.height();


            // Calculate the number of grid columns and rows the box occupies.
            var col = Math.ceil( width / ( this.options.minWidth + this.options.gutter ) );
            var row = Math.ceil( height / ( this.options.minWidth + this.options.gutter ) );


            // Adjust minColumns if the current box is wider than the current minColumns setting.
            if ( col > this.options.minColumns )
            {
                this.options.minColumns = col;
            }


            // Loop until a suitable position is found for the box.
            while ( true )
            {

                // Ensure enough rows exist in gridrow for the current box's height.
                for ( var y = col; y >= 0; y-- )
                {
                    if ( this.gridrow[gridy + y] )
                    {
                        break; // Row already exists.
                    }

                    this.gridrow[gridy + y] = new Object(); // Create a new row object.

                    // Initialize all columns in the new row as 'false' (empty).
                    for ( var x = 0; x < this.columns; x++ )
                    {
                        this.gridrow[gridy + y][x] = false;
                    }
                }


                // Iterate through possible column positions for the box.
                for ( var column = 0; column < ( this.columns - col ); column++ )
                {

                    // Calculate the Y-coordinate for matrix update.
                    matrixY = gridy * ( this.options.minWidth + this.options.gutter );

                    // Add a default empty matrix row if it doesn't exist.
                    this._addMatrixRow( matrixY );


                    var fits = true; // Flag to check if the box fits at the current position.


                    // Check if the box fits vertically and horizontally.
                    for ( var y = 0; y < row; y++ )
                    {
                        for ( var x = 0; x < col; x++ )
                        {

                            if ( ! this.gridrow[gridy + y] )
                            {
                                break; // Row doesn't exist, cannot fit here.
                            }

                            // If any cell in the proposed area is already occupied.
                            if ( this.gridrow[gridy + y][column + x] )
                            {
                                fits = false; // It doesn't fit.
                                break;        // Exit inner loop.
                            }
                        }
                        if ( ! fits )
                        {
                            break; // Exit outer loop if it didn't fit.
                        }
                    }

                    if ( fits )
                    {
                        // If it fits, mark the area as taken in gridrow.
                        for ( var y = 0; y < row; y++ )
                        {
                            for ( var x = 0; x < col; x++ )
                            {

                                if ( ! this.gridrow[gridy + y] )
                                {
                                    break; // Defensive check.
                                }

                                this.gridrow[gridy + y][column + x] = true; // Mark as occupied.
                            }
                        }

                        // Push the item's calculated position and dimensions to the elements array.
                        this._pushItem( $box,
                            column * ( this.options.minWidth + this.options.gutter ),
                            gridy * ( this.options.minWidth + this.options.gutter ),
                            width, height, col, row, direction );
                        return; // Position found, exit the function.
                    }
                }
                gridy++; // Move to the next grid row if no position found in current row.
            }
        },


        /*
         * _pushItem method: Adds an element's data to the internal elements array.
         * @param {jQuery} $el    - The jQuery object of the element.
         * @param {number} x      - Calculated X position.
         * @param {number} y      - Calculated Y position.
         * @param {number} w      - Calculated width.
         * @param {number} h      - Calculated height.
         * @param {number} cols   - Number of grid columns the element spans.
         * @param {number} rows   - Number of grid rows the element spans.
         * @param {string} method - 'append' or 'prepend' for array manipulation.
         */
        _pushItem : function ( $el, x, y, w, h, cols, rows, method )
        {

            // Add the element data to the beginning or end of the array.
            if ( method == "prepend" )
            {
                this.elements.unshift( {
                    $el    : $el,
                    x      : x,
                    y      : y,
                    width  : w,
                    height : h,
                    cols   : cols,
                    rows   : rows
                } );
            }
            else
            {
                this.elements.push( {
                    $el    : $el,
                    x      : x,
                    y      : y,
                    width  : w,
                    height : h,
                    cols   : cols,
                    rows   : rows
                } );
            }
        },


        /*
         * _setHeight method: Calculates the overall height of the grid container.
         * @param {Array} $els - Array of elements with their positions and dimensions.
         * @returns {number} - The maximum height occupied by any element.
         */
        _setHeight : function ( $els )
        {
            var self = this; // Cache 'this'.

            // Iterate through elements to find the highest point.
            $.each( $els, function ( index, value )
            {
                // Calculate the bottom Y-coordinate of the current element.
                var colY = ( value['y'] + value['height'] );

                // Update maxHeight if current element extends lower.
                if ( colY > self.maxHeight )
                {
                    self.maxHeight = colY;
                }
            } );

            return self.maxHeight; // Return the overall grid height.
        },


        /*
         * _setWidth method: Calculates the overall width of the grid container.
         * @param {Array} $els - Array of elements with their positions and dimensions.
         * @returns {number} - The maximum width occupied by any element.
         */
        _setWidth : function ( $els )
        {
            var self = this; // Cache 'this'.

            // Iterate through elements to find the rightmost point.
            $.each( $els, function ( index, value )
            {
                // Calculate the rightmost X-coordinate of the current element.
                var colX = ( value['x'] + value['width'] );

                // Update currWidth if current element extends further right.
                if ( colX > self.currWidth )
                {
                    self.currWidth = colX;
                }
            } );

            return self.currWidth; // Return the overall grid width.
        },


        /*
         * _renderItems method: Applies the calculated positions and dimensions to the actual DOM elements.
         * Handles animation if enabled.
         * @param {Array} $els - Array of elements with their final positions and dimensions.
         */
        _renderItems : function ( $els )
        {
            var self = this; // Cache 'this'.


            // Set the container's height based on the calculated maximum height.
            this.box.css( 'height', this._setHeight( $els ) );

            // If centered option is true, set width and auto margins.
            if ( this.options.centered )
            {
                this.box.css( {
                    'width'       : this._setWidth( $els ),
                    'margin-left' : 'auto',
                    'margin-right': 'auto'
                } );
            }


            $els.reverse(); // Reverse the elements array (might be for animation order).

            // Retrieve animation options.
            var speed    = this.options.animationOptions.speed;
            var effect   = this.options.animationOptions.effect; // 'effect' is defined but not used.
            var duration = this.options.animationOptions.duration;
            var queue    = this.options.animationOptions.queue;
            var animate  = this.options.animate;
            var complete = this.options.animationOptions.complete;

            var item = this; // Another reference to 'this' (seems redundant with 'self').
            var i    = 0;     // Index counter for animation delays.
            var t    = 0;     // Counter for completed animations.


            // Iterate through each element to apply styles and potentially animate.
            $.each( $els, function ( index, value )
            {

                // Get current left, top, width, and height of the element.
                $currLeft   = $( value['$el'] ).position().left;
                $currTop    = $( value['$el'] ).position().top;
                $currWidth  = $( value['$el'] ).width();
                $currHeight = $( value['$el'] ).width(); // This seems like a typo, should probably be .height().

                // Store current positions as data attributes (for potential debugging or future use).
                value['$el'].attr( 'data-y', $currTop ).attr( 'data-x', $currLeft );


                // --- Animation Logic ---

                // If animation is enabled and queued, and position has changed.
                if ( animate && queue && ( $currLeft != value['x'] || $currTop != value['y'] ) )
                {
                    setTimeout( function ()
                    {
                        value['$el'].css( {
                            'display' : 'block',
                            'width'   : value['width'],
                            'height'  : value['height']
                        } ).animate( {
                            'left' : value['x'],
                            'top'  : value['y']
                        }, duration );

                        t++; // Increment completed animation counter.

                        // If all animations are done, call the complete callback.
                        if ( t == i )
                        {
                            complete.call( undefined, $els );
                        }
                    }, i * speed ); // Delay based on item index and speed.

                    i++; // Increment animation delay index.
                }

                // If animation is enabled but not queued, and position has changed.
                if ( animate && ! queue && ( $currLeft != value['x'] || $currTop != value['y'] ) )
                {
                    setTimeout( function ()
                    {
                        value['$el'].css( {
                            'display' : 'block',
                            'width'   : value['width'],
                            'height'  : value['height']
                        } ).animate( {
                            'left' : value['x'],
                            'top'  : value['y']
                        }, duration );

                        t++; // Increment completed animation counter.

                        // If all animations are done, call the complete callback.
                        if ( t == i )
                        {
                            complete.call( undefined, $els );
                        }
                    }, i ); // Delay by index (no speed multiplier).

                    i++; // Increment animation delay index.
                }

                // If no animation is enabled, and position has changed.
                if ( ! animate && ( $currLeft != value['x'] || $currTop != value['y'] ) )
                {
                    value['$el'].css( {
                        'display' : 'block',
                        'width'   : value['width'],
                        'height'  : value['height'],
                        'left'    : value['x'],
                        'top'     : value['y']
                    } );

                    t++; // Increment completed animation counter.

                    // If all elements have been processed, call the complete callback.
                    if ( t == i )
                    {
                        complete.call( undefined, $els );
                    }
                }
            } );

            // If no elements were animated (i.e., i remained 0), call the complete callback immediately.
            if ( i == 0 )
            {
                complete.call( undefined, $els );
            }
        },


        /*
         * append method: Adds new elements to the grid by appending them.
         * @param {jQuery} $els - The jQuery collection of elements to append.
         */
        append : function ( $els )
        {
            this._isResizing = true; // Set resizing flag.
            this._setBoxes( $els, 'append' ); // Process elements with 'append' method.
            this._isResizing = false; // Reset resizing flag.
        },


        /*
         * prepend method: Adds new elements to the grid by prepending them.
         * @param {jQuery} $els - The jQuery collection of elements to prepend.
         */
        prepend : function ( $els )
        {
            this._isResizing = true; // Set resizing flag.
            this._setBoxes( $els, 'prepend' ); // Process elements with 'prepend' method.
            this._isResizing = false; // Reset resizing flag.
        },


        /*
         * resize method: Recalculates and re-renders the grid, typically on window resize.
         * @param {jQuery} $els - Optional jQuery collection of elements (usually not passed for full resize).
         */
        resize : function ( $els )
        {
            // Check if column count changes based on container width.
            // This condition seems to implicitly trigger a full re-layout if a column is added/removed.
            if ( Object.keys( this.matrix[0] ).length % Math.floor( this.element.width() / ( this.options.minWidth + this.options.gutter ) ) > 0 )
            {
                this._isResizing = true; // Set resizing flag.

                // Recalculate all boxes.
                this._setBoxes( this.box.find( this.options.selector ) );
            }
        } // End of prototype methods.

    }; // End of $.Nested.prototype.

} ) ( jQuery ); // End of jQuery closure.