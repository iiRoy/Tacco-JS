/*
 * jQuery VGrid v0.1.11 - variable grid layout plugin
 *
 * Terms of Use - jQuery VGrid
 * under the MIT (http://www.opensource.org/licenses/mit-license.php) License.
 *
 * Copyright 2009-2013 xlune.com All rights reserved.
 * (http://blog.xlune.com/2009/09/jqueryvgrid.html)
 *
 * This is a Type I clone, meaning only whitespace and comments have been changed.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged from the original source.
 */

( function( $ ) {

    // Function to calculate and set positions for grid items
    function makePos( self ) {

        var _childs = self.data( "_vgchild" ); // Get the child elements
        var _width = self.width(); // Get the width of the container
        // Initialize the matrix with the container's full width at depth 0
        var _matrix = [ [ 0, _width, 0 ] ];
        var _hmax = 0, _c, _size, _point; // Initialize variables for height, current child, size, and attachment point

        // Iterate over each child element
        _childs.each( function( i ) {

            _c = $( this ); // Wrap the current child in a jQuery object

            // If the child is hidden, skip it
            if ( _c.css( "display" ) === "none" ) {
                return true; // Continue to the next iteration
            }

            _size = getSize( _c ); // Get the calculated size (width, height) of the child
            _point = getAttachPoint( _matrix, _size[ 0 ] ); // Find the best attachment point for the child
            _matrix = updateAttachArea( _matrix, _point, _size ); // Update the matrix of available space
            _hmax = Math.max( _hmax, _point[ 1 ] + _size[ 1 ] ); // Update the maximum height reached by any item

            // Store the calculated left and top positions in the child's data
            _c.data( "_vgleft", _point[ 0 ] );
            _c.data( "_vgtop", _point[ 1 ] );

        } );

        self.data( "_vgwrapheight", _hmax ); // Store the total calculated height of the grid
        heightTo( self ); // Adjust the container's height

    }

    // Function to find the best attachment point for a new item
    function getAttachPoint( mtx, width ) {

        // Create a copy of the matrix and sort it by depth (y-coordinate)
        var _mtx = mtx.concat().sort( matrixSortDepth );
        // Get the maximum depth (lowest point) in the current layout
        var _max = _mtx[ _mtx.length - 1 ][ 2 ];

        // Iterate through the sorted matrix to find an available spot
        for ( var i = 0, imax = _mtx.length; i < imax; i++ ) {

            // If we've reached a depth greater than or equal to the current max, no better spot exists
            if ( _mtx[ i ][ 2 ] >= _max ) {
                break;
            }

            // If the current available space is wide enough for the item
            if ( _mtx[ i ][ 1 ] - _mtx[ i ][ 0 ] >= width ) {
                return [ _mtx[ i ][ 0 ], _mtx[ i ][ 2 ] ]; // Return the x and y coordinates
            }

        }

        return [ 0, _max ]; // If no suitable spot is found, place it at the far left at the current max depth

    }

    // Function to update the attachment area matrix after placing an item
    function updateAttachArea( mtx, point, size ) {

        // Create a copy of the matrix and sort it by depth
        var _mtx = mtx.concat().sort( matrixSortDepth );
        // Define the new cell (item) bounds: [x_start, x_end, y_end]
        var _cell = [ point[ 0 ], point[ 0 ] + size[ 0 ], point[ 1 ] + size[ 1 ] ];

        // Iterate through the matrix to adjust existing available spaces
        for ( var i = 0, imax = _mtx.length; i < imax; i++ ) {

            // If an existing space is completely covered by the new cell, delete it
            if ( _cell[ 0 ] <= _mtx[ i ][ 0 ] && _mtx[ i ][ 1 ] <= _cell[ 1 ] ) {
                delete _mtx[ i ];
            } else {
                // Otherwise, trim the existing space if it overlaps with the new cell
                _mtx[ i ] = matrixTrimWidth( _mtx[ i ], _cell );
            }

        }

        // Join the modified matrix with the new cell to create updated available spaces
        return matrixJoin( _mtx, _cell );

    }

    // Comparison function for sorting matrix entries by depth (y-coordinate)
    function matrixSortDepth( a, b ) {

        if ( !a || !b ) {
            return 0; // Handle null/undefined entries
        }
        // Sort primarily by depth, then by x-coordinate if depths are equal
        return ( ( a[ 2 ] === b[ 2 ] && a[ 0 ] > b[ 0 ] ) || a[ 2 ] > b[ 2 ] ) ? 1 : -1;

    }

    // Comparison function for sorting matrix entries by x-coordinate
    function matrixSortX( a, b ) {

        if ( !a || !b ) {
            return 0; // Handle null/undefined entries
        }
        return ( a[ 0 ] > b[ 0 ] ) ? 1 : -1; // Sort by x-coordinate

    }

    // Function to join and consolidate adjacent available spaces in the matrix
    function matrixJoin( mtx, cell ) {

        // Add the new cell to the matrix, remove nulls, and sort by x-coordinate
        var _mtx = mtx.concat( [ cell ] ).filter( Boolean ).sort( matrixSortX );
        var _mtx_join = []; // Initialize array for joined matrix

        // Iterate through the sorted matrix
        for ( var i = 0, imax = _mtx.length; i < imax; i++ ) {

            if ( !_mtx[ i ] ) {
                continue; // Skip null entries
            }

            // If the current entry can be joined with the previous one (same depth, adjacent x)
            if ( _mtx_join.length > 0
                && _mtx_join[ _mtx_join.length - 1 ][ 1 ] === _mtx[ i ][ 0 ]
                && _mtx_join[ _mtx_join.length - 1 ][ 2 ] === _mtx[ i ][ 2 ] ) {
                _mtx_join[ _mtx_join.length - 1 ][ 1 ] = _mtx[ i ][ 1 ]; // Extend the previous entry's width
            } else {
                _mtx_join.push( _mtx[ i ] ); // Otherwise, add the current entry as a new one
            }

        }

        return _mtx_join;

    }

    // Function to trim an available space (`a`) based on an overlapping cell (`b`)
    function matrixTrimWidth( a, b ) {

        // Check if `a` overlaps with `b` horizontally
        if ( ( a[ 0 ] >= b[ 0 ] && a[ 0 ] < b[ 1 ] ) || ( a[ 1 ] > b[ 0 ] && a[ 1 ] <= b[ 1 ] ) ) {

            // If the start of `a` is within `b`
            if ( a[ 0 ] >= b[ 0 ] && a[ 0 ] < b[ 1 ] ) {
                a[ 0 ] = b[ 1 ]; // Shift `a`'s start to the end of `b`
            }
            // If the end of `a` is within `b`
            else {
                a[ 1 ] = b[ 0 ]; // Trim `a`'s end to the start of `b`
            }

        }

        return a; // Return the trimmed or original array

    }

    // Function to calculate the total width and height of a child element, including margins, padding, and borders
    function getSize( child ) {

        var _w = child.width(); // Get content width
        var _h = child.height(); // Get content height

        // Add horizontal box model properties
        _w += strToNum( child.css( "margin-left" ) )
            + strToNum( child.css( "padding-left" ) )
            + strToNum( child.css( "border-left-width" ) )
            + strToNum( child.css( "margin-right" ) )
            + strToNum( child.css( "padding-right" ) )
            + strToNum( child.css( "border-right-width" ) );

        // Add vertical box model properties
        _h += strToNum( child.css( "margin-top" ) )
            + strToNum( child.css( "padding-top" ) )
            + strToNum( child.css( "border-top-width" ) )
            + strToNum( child.css( "margin-bottom" ) )
            + strToNum( child.css( "padding-bottom" ) )
            + strToNum( child.css( "border-bottom-width" ) );

        return [ _w, _h ]; // Return calculated total width and height

    }

    // Helper function to convert a string to a number, returning 0 if NaN
    function strToNum( str ) {

        var num = parseInt( str, 10 ); // Parse the string as an integer
        if ( isNaN( num ) ) {
            return 0; // Return 0 if parsing fails
        }
        return num; // Return the parsed number

    }

    // Helper function to get a numeric value, with a default fallback
    function getNumValue( val, def ) {

        // Validate and set default if `def` is a finite number, otherwise 0
        def = typeof( def ) === "number" && isFinite( def ) ? def : 0;
        // Validate `val` and return it if it's a finite number, otherwise return `def`
        val = typeof( val ) === "number" && isFinite( val ) ? val : def;

        return val;

    }

    // Function to adjust the container's height based on calculated content
    function heightTo( self ) {

        var _self = self;
        // Get animation time from options, default to 500ms
        var _easeTime = getNumValue( _self.data( "_vgopt" ).time, 500 );
        // Calculate delay for height adjustment (based on child count and individual delays)
        var _delay = _self.data( "_vgchild" ).length
            * ( _self.data( "_vgopt" ).delay || 0 )
            + _easeTime;

        _self.stop( false, true ); // Stop any current animations on the container

        // If the current height is less than the required height, animate or set it directly
        if ( _self.height() < _self.data( "_vgwrapheight" ) ) {

            // If jQuery's animation support is limited (e.g., old IE)
            if ( !$.support.noCloneEvent ) {
                _self.height( _self.data( "_vgwrapheight" ) ); // Set height directly
            } else {
                // Animate the height smoothly
                _self.animate(
                    {
                        height: _self.data( "_vgwrapheight" ) + "px"
                    },
                    _easeTime,
                    "easeOutQuart" // Using an easing function
                );
            }

        } else {
            // If the current height is greater or equal, delay the height adjustment
            clearTimeout( _self.data( "_vgwraptimeout" ) ); // Clear any existing timeout
            _self.data( "_vgwraptimeout", setTimeout( function() {

                if ( !$.support.noCloneEvent ) {
                    _self.height( _self.data( "_vgwrapheight" ) );
                } else {
                    _self.animate(
                        {
                            height: _self.data( "_vgwrapheight" ) + "px"
                        },
                        _easeTime,
                        "easeOutQuart"
                    );
                }

            }, _delay ) ); // Execute after the calculated delay
        }

    }

    // Function to move child elements to their calculated positions instantly
    function moveTo( childs ) {

        var _c;

        childs.each( function( i ) {

            _c = $( this ); // Current child
            _c.css( "left", _c.data( "_vgleft" ) + "px" ); // Set left position
            _c.css( "top", _c.data( "_vgtop" ) + "px" ); // Set top position

        } );

    }

    // Function to animate child elements to their calculated positions
    function animateTo( childs, easing, time, delay ) {

        var _self = $( childs ).parent(); // Get the parent container
        var isMove = false; // Flag to check if any item needs to move
        var imax = childs.length;
        var i, _c, _pos;

        // First, check if any items are actually out of position
        for ( i = 0; i < imax; i++ ) {

            _c = $( childs[ i ] );
            _pos = _c.position(); // Get current position

            // Compare current position with target position
            if ( _pos.left != _c.data( "_vgleft" ) || _pos.top != _c.data( "_vgtop" ) ) {
                isMove = true; // Set flag if movement is needed
                break; // No need to check further
            }

        }

        if ( isMove ) {

            // If there's an onStart callback, execute it
            if ( typeof( _self.data( "_vgopt" ).onStart ) === "function" ) {
                _self.data( "_vgopt" ).onStart();
            }

            // Animate each child
            childs.each( function( i ) {

                var _c = $( this );
                var _opt = {
                    duration: time,
                    easing: easing
                };

                // If this is the last child, set the onFinish callback for the animation
                if ( childs.size() - 1 === i ) {
                    _opt.complete = _self.data( "_vgopt" ).onFinish || null;
                }

                clearTimeout( _c.data( "_vgtimeout" ) ); // Clear any previous animation timeout
                _c.data( "_vgtimeout", setTimeout( function() {

                    _c.animate(
                        {
                            left: _c.data( "_vgleft" ) + "px",
                            top: _c.data( "_vgtop" ) + "px"
                        },
                        _opt
                    );

                }, i * delay ) ); // Apply a staggered delay for each item

            } );

        }

    }

    // Handler for refreshing the grid layout
    function refreshHandler( tg ) {

        tg.each( function( num ) {

            var _self = $( this );
            clearTimeout( _self.data( "_vgtimeout" ) ); // Clear any pending refresh timeout

            _self.data( "_vgtimeout", setTimeout( function() {

                makePos( _self ); // Recalculate positions
                animateTo(
                    _self.data( "_vgchild" ),
                    _self.data( "_vgopt" ).easing || "linear", // Get easing from options or default
                    getNumValue( _self.data( "_vgopt" ).time, 500 ), // Get animation time or default
                    getNumValue( _self.data( "_vgopt" ).delay, 0 ) // Get delay or default
                );

            }, getNumValue( _self.data( "_vgopt" ).wait, 500 ) ) ); // Wait for a specified time before refreshing

        } );

    }

    // Sets up a listener for changes in font size (browser zoom)
    function setFontSizeListener( self, func ) {

        var s = $( "<span />" )
            .text( " " )
            .attr( "id", "_vgridspan" )
            .hide()
            .appendTo( "body" ); // Create a hidden span to detect font size changes

        s.data( "size", s.css( "font-size" ) ); // Store initial font size

        s.data( "timer", setInterval( function() {

            // If font size has changed, trigger the refresh function
            if ( s.css( "font-size" ) != s.data( "size" ) ) {
                s.data( "size", s.css( "font-size" ) ); // Update stored size
                func( self ); // Call the refresh handler
            }

        }, 1000 ) ); // Check every second

    }

    // Sets up event listeners for images loading within the grid
    function setImgLoadEvent( self, func ) {

        // Ensure event listeners are added only once per grid instance
        if ( !self.data( "vgrid-image-event-added" ) ) {
            self.data( "vgrid-image-event-added", 1 );

            // Custom event triggered when new elements are added to the grid
            self.on( "vgrid-added", function() {

                self.find( "img" ).each( function() {

                    var img = $( this );

                    // Add load handler to each image only once
                    if ( !img.data( "vgrid-image-handler" ) ) {
                        img.data( "vgrid-image-handler", 1 );
                        img.on( "load", function() {
                            func( self ); // Refresh grid when an image loads
                        } );
                    }

                } );

            } );
        }

        self.trigger( "vgrid-added" ); // Trigger initial scan for images

        // Override default append/prepend methods to trigger 'vgrid-added' event
        var _append = self.append;
        var _prepend = self.prepend;

        self.append = function() {
            _append.apply( self, arguments ); // Call original append
            self.trigger( "vgrid-added" ); // Trigger custom event
        };

        self.prepend = function() {
            _prepend.apply( self, arguments ); // Call original prepend
            self.trigger( "vgrid-added" ); // Trigger custom event
        };

    }


    // Extend jQuery's prototype with VGrid functions
    $.fn.extend( {

        // Main VGrid initialization function
        vgrid: function( option ) {

            var _target = $( this ); // The elements VGrid is applied to
            var _opt = option || {}; // Get options or initialize an empty object

            // Normalize 'easeing' to 'easing' for compatibility
            if ( _opt.easeing ) {
                _opt.easing = _opt.easeing;
            }

            _target.each( function() {

                var _self = $( this ); // Current grid container
                _self.data( "_vgopt", _opt ); // Store options
                _self.data( "_vgchild", _self.find( "> *" ) ); // Store direct children
                _self.data( "_vgdefchild", _self.data( "_vgchild" ) ); // Store initial children (for sorting reference)

                // Apply necessary CSS for positioning
                _self.css( {
                    "position": "relative",
                    "width": "auto"
                } );
                _self.data( "_vgchild" ).css( "position", "absolute" ); // Make children absolutely positioned

                makePos( _self ); // Calculate initial positions
                moveTo( _self.data( "_vgchild" ) ); // Move children to initial positions instantly

                // Handle fade-in animation if enabled
                if ( _self.data( "_vgopt" ).fadeIn ) {

                    var _prop = ( typeof( _self.data( "_vgopt" ).fadeIn ) === "object" )
                        ? _self.data( "_vgopt" ).fadeIn
                        : { time: _self.data( "_vgopt" ).fadeIn }; // Parse fade-in options

                    _self.data( "_vgchild" ).each( function( i ) {

                        var _c = $( this );

                        if ( _c.css( "display" ) === "none" ) {
                            return true; // Skip hidden items
                        }

                        _c.stop( false, true ).css( { opacity: 0 } ); // Hide and stop current animation
                        setTimeout( function() {
                            _c.stop( false, true ).fadeTo( _prop.time || 250, 1 ); // Fade in with delay
                        }, i * ( _prop.delay || 0 ) );

                    } );

                }

                // Attach resize event handler to window
                $( window ).resize( function( e ) {
                    refreshHandler( _self ); // Refresh grid on window resize
                } );

                // Set up image load event listener if enabled
                if ( _opt.useLoadImageEvent ) {
                    setImgLoadEvent( _self, refreshHandler );
                }

                // Set up font size listener if enabled
                if ( _opt.useFontSizeListener ) {
                    setFontSizeListener( _self, refreshHandler );
                }

            } );

            return _target; // Return the jQuery object for chaining

        },

        // Function to refresh the grid layout
        vgrefresh: function( easing, time, delay, func ) {

            var _target = $( this );

            _target.each( function() {

                var _obj = $( this );
                var _opt = _obj.data( "_vgopt" ) || {};

                if ( _obj.data( "_vgchild" ) ) {

                    _obj.data( "_vgchild", _obj.find( "> *" ) ); // Re-select children (in case of DOM changes)
                    _obj.data( "_vgchild" ).css( "position", "absolute" ); // Ensure children are absolutely positioned

                    makePos( _obj ); // Recalculate positions

                    // Get animation parameters, using defaults if not provided
                    time = getNumValue( time, getNumValue( _obj.data( "_vgopt" ).time, 500 ) );
                    delay = getNumValue( delay, getNumValue( _obj.data( "_vgopt" ).delay, 0 ) );

                    animateTo(
                        _obj.data( "_vgchild" ),
                        easing || _obj.data( "_vgopt" ).easing || "linear",
                        time,
                        delay
                    );

                    // Execute a callback function after animations complete
                    if ( typeof( func ) === 'function' ) {
                        setTimeout(
                            func,
                            _obj.data( "_vgchild" ).length * delay + time
                        );
                    }

                }

                // Re-apply image load event handler if enabled (for newly added images)
                if ( _opt.useLoadImageEvent ) {
                    setImgLoadEvent( _obj, refreshHandler );
                }

            } );

            return _target; // Return the jQuery object for chaining

        },

        // Function to sort grid items
        vgsort: function( func, easing, time, delay ) {

            var _target = $( this );

            _target.each( function() {

                var _obj = $( this );

                if ( _obj.data( "_vgchild" ) ) {

                    // Sort the child elements using the provided function
                    _obj.data( "_vgchild", _obj.data( "_vgchild" ).sort( func ) );

                    // Re-append children in the new sorted order to update DOM
                    _obj.data( "_vgchild" ).each( function( num ) {
                        $( this ).appendTo( _obj );
                    } );

                    makePos( _obj ); // Recalculate positions based on new order

                    // Animate items to their new positions
                    animateTo(
                        _obj.data( "_vgchild" ),
                        easing || _obj.data( "_vgopt" ).easing || "linear",
                        getNumValue( time, getNumValue( _obj.data( "_vgopt" ).time, 500 ) ),
                        getNumValue( delay, getNumValue( _obj.data( "_vgopt" ).delay, 0 ) )
                    );

                }

            } );

            return _target; // Return the jQuery object for chaining

        }

    } );

} )( jQuery );