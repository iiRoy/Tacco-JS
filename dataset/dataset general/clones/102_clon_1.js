/*
 * Tiny Scrollbar 1.65 - Enhanced Clone Edition
 *
 * Original project URL: http://www.baijs.nl/tinyscrollbar/
 *
 * This is a Type I code clone, preserving all original logic,
 * identifiers, and expressions.
 *
 * Changes are limited exclusively to whitespace and comments
 * to demonstrate visual differentiation while maintaining
 * exact functional equivalence.
 *
 * Copyright (c) 2010, Maarten Baijs - All rights reserved.
 *
 * This software is distributed under a dual license model:
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 * GPL Version 2 License: http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Latest Revision Date: 10 / 05 / 2011 (original)
 *
 * Requires: jQuery library
 *
 */


( function( $ ) {



  // Ensure the $.tiny namespace exists; create it if it doesn't.
  $.tiny = $.tiny || {};



  // Define the default options for the tiny scrollbar plugin.
  $.tiny.scrollbar = {

    options: {

      axis        : 'y', // Determines scroll direction: 'x' for horizontal, 'y' for vertical.
      wheel       : 40,  // Number of pixels the mouse wheel scrolls per tick.
      scroll      : true, // Boolean: true to enable mousewheel scrolling, false to disable.
      size        : 'auto', // Scrollbar size: 'auto' (matches viewport) or a fixed pixel value.
      sizethumb   : 'auto'  // Thumb size: 'auto' (calculated) or a fixed pixel value.

    }

  };



  /**
   * jQuery plugin entry point for initializing the Tiny Scrollbar.
   *
   * @param {Object} options - Custom options to override defaults.
   * @returns {jQuery} The jQuery object for chaining.
   */
  $.fn.tinyscrollbar = function( options ) {

    // Merge default options with user-provided options.
    var options = $.extend( {}, $.tiny.scrollbar.options, options );


    // Iterate over each selected element and initialize a new Scrollbar instance.
    this.each( function() {

      $( this ).data( 'tsb', new Scrollbar( $( this ), options ) );

    } );


    // Return the jQuery object to allow for method chaining.
    return this;

  };



  /**
   * jQuery plugin method for updating an existing Tiny Scrollbar instance.
   *
   * @param {string|number} sScroll - Scroll position (e.g., 'relative', 'bottom', or pixel value).
   * @returns {any} Result of the update operation.
   */
  $.fn.tinyscrollbar_update = function( sScroll ) {

    // Retrieve the Scrollbar instance from the data and call its update method.
    return $( this ).data( 'tsb' ).update( sScroll );

  };




  /**
   * The main Scrollbar constructor function.
   * Initializes and manages the custom scrollbar behavior.
   *
   * @param {jQuery} root - The root jQuery element of the scrollbar.
   * @param {Object} options - Configuration options for this scrollbar instance.
   */
  function Scrollbar( root, options ) {

    var self          = this;           // Reference to the current Scrollbar instance.
    var wrapper       = root;           // The main container element.
    var viewport      = $( '.viewport', root ); // The visible content area.
    var content       = $( '.overview', root ); // The actual scrollable content.
    var scrollbar     = $( '.scrollbar', root ); // The scrollbar container.
    var track         = $( '.track', scrollbar ); // The track along which the thumb moves.
    var thumb         = $( '.thumb', scrollbar ); // The draggable thumb element.


    // Determine the axis and corresponding CSS properties.
    var xAxis         = options.axis == 'x',
        cssDirection  = xAxis ? 'left' : 'top', // 'left' for horizontal, 'top' for vertical.
        sSize         = xAxis ? 'Width' : 'Height'; // 'Width' for horizontal, 'Height' for vertical.


    // Variables to store scroll position, sizes, and mouse coordinates.
    var iScroll,
        scrollSize,
        offscreenSize,
        scrollbarRatio,
        iPosition     = { start: 0, now: 0 }, // Mouse position during drag.
        iMouse        = {}; // Initial mouse position.




    /**
     * Checks if the scrollbar is active (i.e., content overflows the viewport).
     *
     * @returns {boolean} True if content is larger than viewport, false otherwise.
     */
    this.active = function() {

      return self.contentRatio < 1;

    };



    /**
     * Verifies that all necessary sub-elements for the scrollbar exist.
     *
     * @returns {boolean} True if all required elements are found, false otherwise.
     */
    function requirements_met() {

      return ( viewport.length && content.length && scrollbar.length && track.length && thumb.length );

    }




    /**
     * Initializes the scrollbar by performing an initial update and setting up event listeners.
     *
     * @returns {Scrollbar} The current Scrollbar instance.
     */
    function initialize() {

      if ( requirements_met() ) {

        self.update();      // Perform an initial size and position update.
        setEvents();        // Attach all necessary event handlers.

      }

      return self;

    }




    /**
     * Updates the scrollbar's size, position, and thumb appearance.
     * This method can be called externally to refresh the scrollbar.
     *
     * @param {string|number} sScroll - Optional scroll position: 'relative', 'bottom', or a pixel value.
     */
    this.update = function( sScroll ) {

      // Check if all required elements are present. If not, throw an error.
      if ( !requirements_met() ) {
        $.error( "Missing required tinyscrollbar sub-element: either .viewport .overview .scrollbar .track or .thumb" );
      }


      // Get the current dimensions of the viewport and content.
      var viewportSize  = viewport[0][ 'offset' + sSize ];
      var contentSize   = content[0][ 'scroll' + sSize ];


      // Calculate the total scrollable distance.
      offscreenSize     = contentSize - viewportSize;


      // Determine the ratio of viewport size to content size.
      self.contentRatio = viewportSize / contentSize;


      // Toggle the 'disable' class on the scrollbar based on its active state.
      scrollbar.toggleClass( 'disable', !self.active() );


      // Calculate the size of the track.
      var trackSize     = options.size == 'auto' ? viewportSize : options.size;


      // Calculate the size of the thumb, ensuring it's within valid bounds.
      var thumbSize     = Math.min(
                            trackSize,
                            Math.max(
                              0,
                              ( options.sizethumb == 'auto' ? ( trackSize * self.contentRatio ) : options.sizethumb )
                            )
                          );


      // Calculate the maximum distance the thumb can travel.
      scrollSize        = trackSize - thumbSize;


      // Determine the ratio between content scroll and thumb movement.
      scrollbarRatio    = options.sizethumb == 'auto' ? ( contentSize / trackSize ) : offscreenSize / scrollSize;


      // Adjust the scroll position based on the 'sScroll' parameter.
      if ( self.active() && sScroll == 'relative' ) {

        iScroll = Math.min( offscreenSize, Math.max( 0, iScroll ) );

      }

      else if ( self.active() <= 1 && sScroll == 'bottom' ) {

        iScroll = offscreenSize; // Scroll to the very end.

      }

      else {

        iScroll = isNaN( parseInt( sScroll ) ) ? 0 : parseInt( sScroll ); // Use provided scroll value or default to 0.

      }


      // Apply the calculated positions to the thumb and content elements.
      thumb.css( cssDirection, iScroll / scrollbarRatio );
      content.css( cssDirection, -iScroll );


      // Store the initial position of the thumb for drag operations.
      iMouse[ 'start' ] = thumb.offset()[ cssDirection ];


      // Get the lowercase version of the size property for CSS.
      var sCssSize      = sSize.toLowerCase();


      // Apply the calculated sizes to the scrollbar, track, and thumb.
      scrollbar.css( sCssSize, trackSize );
      track.css( sCssSize, trackSize );
      thumb.css( sCssSize, thumbSize );

    };




    /**
     * Sets up all event listeners for mouse and touch interactions.
     */
    function setEvents() {

      // Mouse down event on the thumb to initiate dragging.
      thumb.bind( 'mousedown', start );


      // Touch start event for mobile devices.
      thumb[0].ontouchstart = function( event ) {

        event.preventDefault(); // Prevent default touch behavior (e.g., scrolling page).
        thumb.unbind( 'mousedown' ); // Unbind mouse event to prevent conflicts.
        start( event.touches[0] ); // Call start function with the first touch point.
        return false;

      };


      // Mouse up event on the track to jump to a position.
      track.bind( 'mouseup', drag );


      // Mouse wheel events for scrolling, cross-browser compatibility.
      if ( options.scroll && this.addEventListener ) {

        wrapper[0].addEventListener( 'DOMMouseScroll', wheel, false ); // Firefox
        wrapper[0].addEventListener( 'mousewheel', wheel, false );     // Webkit, IE

      }

      else if ( options.scroll ) {

        wrapper[0].onmousewheel = wheel; // Older IE

      }

    };




    /**
     * Initiates a drag operation when the thumb is clicked or touched.
     *
     * @param {Event} event - The mouse or touch event object.
     * @returns {boolean} False to prevent default browser behavior.
     */
    function start( event ) {

      // Record the initial mouse/touch position.
      iMouse.start    = xAxis ? event.pageX : event.pageY;


      // Get the current position of the thumb.
      var thumbDir    = parseInt( thumb.css( cssDirection ) );


      // Store the thumb's starting position for drag calculation.
      iPosition.start = thumbDir == 'auto' ? 0 : thumbDir;


      // Bind document-wide mouse/touch move and up events.
      $( document ).bind( 'mousemove', drag );

      document.ontouchmove = function( event ) {

        $( document ).unbind( 'mousemove' ); // Unbind mousemove to prevent conflicts.
        drag( event.touches[0] ); // Call drag with the first touch point.

      };


      $( document ).bind( 'mouseup', end );
      thumb.bind( 'mouseup', end );


      // Touch end events for mobile.
      thumb[0].ontouchend = document.ontouchend = function( event ) {

        $( document ).unbind( 'mouseup' ); // Clean up mouse events.
        thumb.unbind( 'mouseup' );
        end( event.touches[0] ); // Call end with the touch point.

      };


      return false;

    };




    /**
     * Handles mouse wheel scrolling.
     *
     * @param {Event} event - The mouse wheel event object.
     */
    function wheel( event ) {

      if ( self.active() ) {

        event = $.event.fix( event || window.event ); // Normalize the event object.


        // Determine the scroll direction and magnitude.
        var iDelta = event.wheelDelta ? event.wheelDelta / 120 : -event.detail / 3;


        // Update the scroll position based on wheel movement and options.
        iScroll -= iDelta * options.wheel;


        // Constrain the scroll position within valid bounds.
        iScroll = Math.min( offscreenSize, Math.max( 0, iScroll ) );


        // Apply the new positions to the thumb and content.
        thumb.css( cssDirection, iScroll / scrollbarRatio );
        content.css( cssDirection, -iScroll );


        event.preventDefault(); // Prevent default browser scrolling.

      }

    };




    /**
     * Ends the drag operation, unbinding temporary event listeners.
     *
     * @param {Event} event - The mouse or touch event object.
     * @returns {boolean} False to prevent default browser behavior.
     */
    function end( event ) {

      // Unbind the document-wide mouse move and up events.
      $( document ).unbind( 'mousemove', drag ).unbind( 'mouseup', end );
      thumb.unbind( 'mouseup', end );


      // Clear touch event handlers.
      document.ontouchmove = thumb[0].ontouchend = document.ontouchend = null;


      return false;

    };




    /**
     * Handles the dragging of the thumb.
     *
     * @param {Event} event - The mouse or touch event object during drag.
     * @returns {boolean} False to prevent default browser behavior.
     */
    function drag( event ) {

      if ( self.active() ) {

        // Calculate the new position of the thumb.
        iPosition.now = Math.min(
                          scrollSize,
                          Math.max(
                            0,
                            ( iPosition.start + ( ( xAxis ? event.pageX : event.pageY ) - iMouse.start ) )
                          )
                        );


        // Calculate the corresponding content scroll position.
        iScroll = iPosition.now * scrollbarRatio;


        // Apply the new positions to the content and thumb.
        content.css( cssDirection, -iScroll );
        thumb.css( cssDirection, iPosition.now );

      }

      return false;

    };


    // Initialize the scrollbar upon creation and return the instance.
    return initialize();

  };


} )( jQuery ); // Pass jQuery into the immediately invoked function expression.