/*
 * This JavaScript file is a Type I clone of the original jquery.Jcrop.js v0.9.9.
 * All functional aspects, variable names, and logic have been preserved without modification.
 * The only changes made are to whitespace (indentation, line breaks, spacing) and comments.
 * This ensures the code is logically identical to the original but visually distinct.
 *
 * Original project: jQuery Image Cropping Plugin
 * Original author: Kelly Hallman <khallman@gmail.com>
 * Copyright (c) 2008-2010 Kelly Hallman - distributed under the MIT License.
 *
 * MIT License details:
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

( function ( $ ) {

  $.Jcrop = function ( obj, opt ) {
    // --- Jcrop Initialization Block ---

    // Sanitize and normalize input parameters.
    var obj = obj, opt = opt;
    var myself = this; // Reference to the current Jcrop instance.

    if ( typeof ( obj ) !== 'object' ) {
      obj = $( obj )[ 0 ];
    }
    if ( typeof ( opt ) !== 'object' ) {
      opt = {};
    }

    // Special handling for Internet Explorer regarding document tracking.
    if ( ! ( 'trackDocument' in opt ) ) {
      opt.trackDocument = $.browser.msie ? false : true;
      if ( $.browser.msie && $.browser.version.split( '.' )[ 0 ] == '8' ) {
        opt.trackDocument = true;
      }
    }

    // Key support option for IE.
    if ( ! ( 'keySupport' in opt ) ) {
      opt.keySupport = $.browser.msie ? false : true;
    }

    // --- Default Options Definition ---
    var defaults = {

      // Basic settings for Jcrop functionality.
      trackDocument: false,
      baseClass: 'jcrop',
      addClass: null,

      // Styling and visual appearance options.
      bgColor: 'black',
      bgOpacity: .6,
      borderOpacity: .4,
      handleOpacity: .5,

      handleSize: 9,
      handleOffset: 5,

      aspectRatio: 0,
      keySupport: true,
      cornerHandles: true,
      sideHandles: true,
      drawBorders: true,
      dragEdges: true,

      boxWidth: 0,
      boxHeight: 0,
      boundary: 3,
      animationDelay: 20,
      swingSpeed: 3,

      allowSelect: true,
      allowMove: true,
      allowResize: true,
      fadeTime: 400,

      minSelect: [ 0, 0 ],
      maxSize: [ 0, 0 ],
      minSize: [ 0, 0 ],

      // Callback functions for events.
      onChange: function ( ) { },
      onSelect: function ( ) { }

    };
    var options = defaults;
    setOptions( opt ); // Overwrite defaults with user-provided options.

    // --- Initialize jQuery Objects for UI Elements ---

    // Standard CSS properties for image elements.
    var img_css = {
      border: 'none',
      margin: 0,
      padding: 0,
      position: 'absolute'
    };

    var $origimg = $( obj );
    // Clone the original image, remove its ID, and apply base CSS.
    var $img = $origimg . clone( ) . removeAttr( 'id' ) . css( img_css );

    $img . width( $origimg . width( ) );
    $img . height( $origimg . height( ) );
    $origimg . after( $img ) . hide( ); // Insert clone after original, then hide original.

    presize( $img, options.boxWidth, options.boxHeight );

    var boundx = $img . width( ),
      boundy = $img . height( ),

      // Create the main container div for the Jcrop instance.
      $div = $( '<div />' )
        .width( boundx ) . height( boundy )
        .addClass( cssClass( 'holder' ) )
        .css( {
          position: 'relative',
          backgroundColor: options.bgColor
        } ) . insertAfter( $origimg ) . append( $img )
    ;

    delete ( options.bgColor ); // This option is consumed.
    if ( options.addClass ) {
      $div . addClass( options.addClass );
    }

    // Create a second image element for the overlay.
    var $img2 = $( '<img />' )
      .attr( 'src', $img . attr( 'src' ) )
      .css( img_css )
      .width( boundx ) . height( boundy )
    ;

    // Holder for the overlay image, providing clipping.
    var $img_holder = $( '<div />' )
      .width( pct( 100 ) ) . height( pct( 100 ) )
      .css( {
        zIndex: 310,
        position: 'absolute',
        overflow: 'hidden'
      } )
      .append( $img2 )
    ;

    // Holder for the selection handles and borders.
    var $hdl_holder = $( '<div />' )
      .width( pct( 100 ) ) . height( pct( 100 ) )
      .css( 'zIndex', 320 )
    ;

    // The main selection area div.
    var $sel = $( '<div />' )
      .css( {
        position: 'absolute',
        zIndex: 300
      } )
      .insertBefore( $img )
      .append( $img_holder, $hdl_holder )
    ;

    // The tracker div captures mouse events across the entire cropping area.
    var bound = options.boundary;
    var $trk = newTracker( ) . width( boundx + ( bound * 2 ) ) . height( boundy + ( bound * 2 ) )
      .css( { position: 'absolute', top: px( -bound ), left: px( -bound ), zIndex: 290 } )
      .mousedown( newSelection )
    ;

    // --- Internal State Variables ---
    var bgopacity = options.bgOpacity;
    var xlimit, ylimit, xmin, ymin;
    var xscale, yscale, enabled = true;
    var docOffset = getPos( $img ),
      // Flags for tracking user interaction and animation states.
      btndown, lastcurs, dimmed, animating,
      shift_down;

    // --- Internal Modules and Helper Functions ---

    var Coords = function ( ) {
      // Manages the selection rectangle's numerical coordinates.
      var x1 = 0, y1 = 0, x2 = 0, y2 = 0, ox, oy;

      // Sets the initial selection point.
      function setPressed ( pos ) {
        var pos = rebound( pos );
        x2 = x1 = pos[ 0 ];
        y2 = y1 = pos[ 1 ];
      }

      // Updates the current selection point during a drag.
      function setCurrent ( pos ) {
        var pos = rebound( pos );
        ox = pos[ 0 ] - x2;
        oy = pos[ 1 ] - y2;
        x2 = pos[ 0 ];
        y2 = pos[ 1 ];
      }

      // Returns the change in position from the last update.
      function getOffset ( ) {
        return [ ox, oy ];
      }

      // Moves the entire selection by a given offset, respecting boundaries.
      function moveOffset ( offset ) {
        var ox = offset[ 0 ], oy = offset[ 1 ];

        // Boundary checks for the top and left edges.
        if ( 0 > x1 + ox ) {
          ox -= ox + x1;
        }
        if ( 0 > y1 + oy ) {
          oy -= oy + y1;
        }

        // Boundary checks for the bottom and right edges.
        if ( boundy < y2 + oy ) {
          oy += boundy - ( y2 + oy );
        }
        if ( boundx < x2 + ox ) {
          ox += boundx - ( x2 + ox );
        }

        x1 += ox;
        x2 += ox;
        y1 += oy;
        y2 += oy;
      }

      // Retrieves the coordinates for a specific corner.
      function getCorner ( ord ) {
        var c = getFixed( );
        switch ( ord ) {
          case 'ne': return [ c.x2, c.y ];
          case 'nw': return [ c.x, c.y ];
          case 'se': return [ c.x2, c.y2 ];
          case 'sw': return [ c.x, c.y2 ];
        }
      }

      // Calculates and returns the fixed coordinates, applying aspect ratio and size constraints.
      function getFixed ( ) {
        if ( ! options.aspectRatio ) {
          return getRect( );
        }

        var aspect = options.aspectRatio,
          min_x = options.minSize[ 0 ] / xscale,
          min_y = options.minSize[ 1 ] / yscale,
          max_x = options.maxSize[ 0 ] / xscale,
          max_y = options.maxSize[ 1 ] / yscale,
          rw = x2 - x1,
          rh = y2 - y1,
          rwa = Math.abs( rw ),
          rha = Math.abs( rh ),
          real_ratio = rwa / rha,
          xx, yy
        ;

        // Ensure max_x/y are not zero for calculations.
        if ( max_x == 0 ) {
          max_x = boundx * 10;
        }
        if ( max_y == 0 ) {
          max_y = boundy * 10;
        }

        // Adjust coordinates based on aspect ratio.
        if ( real_ratio < aspect ) {
          yy = y2;
          w = rha * aspect;
          xx = rw < 0 ? x1 - w : w + x1;

          if ( xx < 0 ) {
            xx = 0;
            h = Math.abs( ( xx - x1 ) / aspect );
            yy = rh < 0 ? y1 - h : h + y1;
          }
          else if ( xx > boundx ) {
            xx = boundx;
            h = Math.abs( ( xx - x1 ) / aspect );
            yy = rh < 0 ? y1 - h : h + y1;
          }
        }
        else {
          xx = x2;
          h = rwa / aspect;
          yy = rh < 0 ? y1 - h : y1 + h;
          if ( yy < 0 ) {
            yy = 0;
            w = Math.abs( ( yy - y1 ) * aspect );
            xx = rw < 0 ? x1 - w : w + x1;
          }
          else if ( yy > boundy ) {
            yy = boundy;
            w = Math.abs( yy - y1 ) * aspect;
            xx = rw < 0 ? x1 - w : w + x1;
          }
        }

        // Apply min/max size constraints.
        if ( xx > x1 ) { // Right edge resize.
          if ( xx - x1 < min_x ) {
            xx = x1 + min_x;
          } else if ( xx - x1 > max_x ) {
            xx = x1 + max_x;
          }
          if ( yy > y1 ) {
            yy = y1 + ( xx - x1 ) / aspect;
          } else {
            yy = y1 - ( xx - x1 ) / aspect;
          }
        } else if ( xx < x1 ) { // Left edge resize.
          if ( x1 - xx < min_x ) {
            xx = x1 - min_x;
          } else if ( x1 - xx > max_x ) {
            xx = x1 - max_x;
          }
          if ( yy > y1 ) {
            yy = y1 + ( x1 - xx ) / aspect;
          } else {
            yy = y1 - ( x1 - xx ) / aspect;
          }
        }

        // Final boundary checks for the calculated coordinates.
        if ( xx < 0 ) {
          x1 -= xx;
          xx = 0;
        } else if ( xx > boundx ) {
          x1 -= xx - boundx;
          xx = boundx;
        }

        if ( yy < 0 ) {
          y1 -= yy;
          yy = 0;
        } else if ( yy > boundy ) {
          y1 -= yy - boundy;
          yy = boundy;
        }

        return makeObj( flipCoords( x1, y1, xx, yy ) );
      }

      // Ensures coordinates are within the image bounds.
      function rebound ( p ) {
        if ( p[ 0 ] < 0 ) {
          p[ 0 ] = 0;
        }
        if ( p[ 1 ] < 0 ) {
          p[ 1 ] = 0;
        }

        if ( p[ 0 ] > boundx ) {
          p[ 0 ] = boundx;
        }
        if ( p[ 1 ] > boundy ) {
          p[ 1 ] = boundy;
        }

        return [ p[ 0 ], p[ 1 ] ];
      }

      // Orders coordinates such that x1 <= x2 and y1 <= y2.
      function flipCoords ( x1, y1, x2, y2 ) {
        var xa = x1, xb = x2, ya = y1, yb = y2;
        if ( x2 < x1 ) {
          xa = x2;
          xb = x1;
        }
        if ( y2 < y1 ) {
          ya = y2;
          yb = y1;
        }
        return [ Math.round( xa ), Math.round( ya ), Math.round( xb ), Math.round( yb ) ];
      }

      // Calculates the selection rectangle, enforcing min/max dimensions.
      function getRect ( ) {
        var xsize = x2 - x1;
        var ysize = y2 - y1;

        if ( xlimit && ( Math.abs( xsize ) > xlimit ) ) {
          x2 = ( xsize > 0 ) ? ( x1 + xlimit ) : ( x1 - xlimit );
        }
        if ( ylimit && ( Math.abs( ysize ) > ylimit ) ) {
          y2 = ( ysize > 0 ) ? ( y1 + ylimit ) : ( y1 - ylimit );
        }

        if ( ymin && ( Math.abs( ysize ) < ymin ) ) {
          y2 = ( ysize > 0 ) ? ( y1 + ymin ) : ( y1 - ymin );
        }
        if ( xmin && ( Math.abs( xsize ) < xmin ) ) {
          x2 = ( xsize > 0 ) ? ( x1 + xmin ) : ( x1 - xmin );
        }

        // Adjust selection if it goes out of bounds.
        if ( x1 < 0 ) {
          x2 -= x1; x1 -= x1;
        }
        if ( y1 < 0 ) {
          y2 -= y1; y1 -= y1;
        }
        if ( x2 < 0 ) {
          x1 -= x2; x2 -= x2;
        }
        if ( y2 < 0 ) {
          y1 -= y2; y2 -= y2;
        }
        if ( x2 > boundx ) {
          var delta = x2 - boundx; x1 -= delta; x2 -= delta;
        }
        if ( y2 > boundy ) {
          var delta = y2 - boundy; y1 -= delta; y2 -= delta;
        }
        if ( x1 > boundx ) { // Original code might have a bug here, adjusting y for x-bound.
          var delta = x1 - boundy; // Should likely be `x1 - boundx`
          y2 -= delta; // Should likely be `x2 -= delta`
          y1 -= delta; // Should likely be `x1 -= delta`
        }
        if ( y1 > boundy ) {
          var delta = y1 - boundy;
          y2 -= delta;
          y1 -= delta;
        }

        return makeObj( flipCoords( x1, y1, x2, y2 ) );
      }

      // Converts coordinate array [x1, y1, x2, y2] into an object.
      function makeObj ( a ) {
        return {
          x: a[ 0 ], y: a[ 1 ], x2: a[ 2 ], y2: a[ 3 ],
          w: a[ 2 ] - a[ 0 ], h: a[ 3 ] - a[ 1 ]
        };
      }

      return {
        flipCoords: flipCoords,
        setPressed: setPressed,
        setCurrent: setCurrent,
        getOffset: getOffset,
        moveOffset: moveOffset,
        getCorner: getCorner,
        getFixed: getFixed
      };
    } ( ); // Coords module ends.

    var Selection = function ( ) {
      // Manages the visual representation of the selection (borders, handles).
      var start, end, dragmode, awake, hdep = 370;
      var borders = {};
      var handle = {};
      var seehandles = false;
      var hhs = options.handleOffset; // Handle half-size/offset.

      // --- Insert Draggable Elements ---

      // Create and insert border divs for the selection outline.
      if ( options.drawBorders ) {
        borders = {
          top: insertBorder( 'hline' ),
          bottom: insertBorder( 'hline' ),
          left: insertBorder( 'vline' ),
          right: insertBorder( 'vline' )
        };
      }

      // Create and insert draggable bars for edges if dragEdges is enabled.
      if ( options.dragEdges ) {
        handle.t = insertDragbar( 'n' );
        handle.b = insertDragbar( 's' );
        handle.r = insertDragbar( 'e' );
        handle.l = insertDragbar( 'w' );
      }

      // Create side handles if enabled.
      options.sideHandles &&
        createHandles( [ 'n', 's', 'e', 'w' ] );

      // Create corner handles if enabled.
      options.cornerHandles &&
        createHandles( [ 'sw', 'nw', 'ne', 'se' ] );

      // --- Private Methods for DOM Element Creation ---

      // Helper to create a single border div.
      function insertBorder ( type ) {
        var jq = $( '<div />' )
          .css( { position: 'absolute', opacity: options.borderOpacity } )
          .addClass( cssClass( type ) );
        $img_holder . append( jq );
        return jq;
      }

      // Generic function to create a draggable div (handle or dragbar).
      function dragDiv ( ord, zi ) {
        var jq = $( '<div />' )
          .mousedown( createDragger( ord ) )
          .css( {
            cursor: ord + '-resize',
            position: 'absolute',
            zIndex: zi
          } )
        ;
        $hdl_holder . append( jq );
        return jq;
      }

      // Creates and returns a handle div.
      function insertHandle ( ord ) {
        return dragDiv( ord, hdep++ )
          .css( { top: px( -hhs + 1 ), left: px( -hhs + 1 ), opacity: options.handleOpacity } )
          .addClass( cssClass( 'handle' ) );
      }

      // Creates and returns a dragbar div for edge resizing.
      function insertDragbar ( ord ) {
        var s = options.handleSize,
          h = s, w = s,
          t = hhs, l = hhs;

        // Adjust dimensions based on orientation.
        switch ( ord ) {
          case 'n': case 's': w = pct( 100 ); break;
          case 'e': case 'w': h = pct( 100 ); break;
        }

        return dragDiv( ord, hdep++ ) . width( w ) . height( h )
          .css( { top: px( -t + 1 ), left: px( -l + 1 ) } );
      }

      // Utility to create multiple handles from a list.
      function createHandles ( li ) {
        for ( var i = 0; i < li.length; i++ ) {
          handle[ li[ i ] ] = insertHandle( li[ i ] );
        }
      }

      // Positions all handles and borders based on current selection coordinates.
      function moveHandles ( c ) {
        var midvert = Math.round( ( c.h / 2 ) - hhs ),
          midhoriz = Math.round( ( c.w / 2 ) - hhs ),
          north = west = -hhs + 1,
          east = c.w - hhs,
          south = c.h - hhs;