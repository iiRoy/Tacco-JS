/*
 * DRAGEND JS - A Touch-Enabled Content Scroller
 *
 * This file contains the core JavaScript for the Dragend library.
 * It is designed for responsive, swipe-based content navigation.
 *
 * Current Version: <%= pkg.version %>
 * Project Home: https://github.com/Stereobit/dragend
 * Author: Tobias Otte, t@stereob.it
 *
 * Licensing Information:
 *
 * This software is provided under the MIT-style license.
 *
 * Copyright (c) 2014 Tobias Otte.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

;( function( window ) {
  "use strict";

  // Cache frequently used DOM objects for performance
  var doc = document,
    win = window;

  // The main initialization function for dragend.
  function init( $ ) {

    // dragend.js: A robust, responsive, and touch-ready content swiping solution.
    // ===========================================================================
    //
    // This library is dependency-free, but can optionally integrate with jQuery
    // (https://github.com/jquery/jquery/) for convenience if available.
    //
    // Current release version: <%= pkg.version %>
    //
    // Basic Usage
    // =====================
    //
    // To enable dragend functionality on an element, simply call:
    //
    // $("#your-container-id").dragend();
    //
    // You can also pass an options object for configuration, or a string
    // to trigger specific actions like "up", "down", "left", "right" for
    // directional swiping. Use "page" with a second argument for explicit page
    // navigation. Calling without arguments navigates to the first page.
    //
    // Configuration Options
    // =====================
    //
    // The following options are available for customization:
    //
    // * pageClass: CSS class selector for individual page elements.
    // * direction: "horizontal" or "vertical" scrolling.
    // * minDragDistance: Minimum pixel distance for a drag to register as a swipe.
    // * scribe: Additional pixel offset for scrolling.
    // * onSwipeStart: Callback executed before a swipe animation begins.
    // * onSwipeEnd: Callback executed after a swipe animation completes.
    // * onDragStart: Callback triggered at the start of a drag interaction.
    // * onDrag: Callback during a drag interaction.
    // * onDragEnd: Callback at the end of a drag interaction.
    // * borderBetweenPages: Pixel value for spacing between pages.
    // * duration: Animation duration in milliseconds.
    // * stopPropagation: Boolean to stop event propagation.
    // * afterInitialize: Callback after pages are sized.
    // * preventDrag: Disables user drag interactions, allowing only manual swiping.

    var

      // Default configuration values for dragend instances.
      defaultSettings = {
        pageClass           : "dragend-page",
        direction           : "horizontal",
        minDragDistance     : "40",
        onSwipeStart        : noop,
        onSwipeEnd          : noop,
        onDragStart         : noop,
        onDrag              : noop,
        onDragEnd           : noop,
        afterInitialize     : noop,
        keyboardNavigation  : false,
        stopPropagation     : false,
        itemsInPage         : 1,
        scribe              : 0,
        borderBetweenPages  : 0,
        duration            : 300,
        preventDrag         : false
      },

      // Feature detection for touch events.
      isTouch = 'ontouchstart' in win,

      // Event names, normalized for touch or mouse.
      startEvent = isTouch ? 'touchstart' : 'mousedown',
      moveEvent = isTouch ? 'touchmove' : 'mousemove',
      endEvent = isTouch ? 'touchend' : 'mouseup',

      // Keycode to direction mapping for keyboard navigation.
      keycodes = {
        37: "left",
        38: "up",
        39: "right",
        40: "down"
      },

      // Error messages.
      errors = {
        pages: "No pages found"
      },

      // Styles applied to the main container.
      containerStyles = {
        overflow: "hidden",
        padding : 0
      },

      // Feature detection for CSS properties (e.g., transform).
      supports = ( function() {
        var div = doc.createElement( 'div' ),
          vendors = 'Khtml Ms O Moz Webkit'.split( ' ' ),
          len = vendors.length;

        return function( prop ) {
          if ( prop in div.style ) return true;

          prop = prop.replace( /^[a-z]/, function( val ) {
            return val.toUpperCase();
          } );

          while ( len-- ) {
            if ( vendors[len] + prop in div.style ) {
              return true;
            }
          }
          return false;
        };
      } )(),

      // Check if CSS transform is supported.
      supportTransform = supports( 'transform' );

    // A no-operation function, used as a default for callbacks.
    function noop() {}

    // A function that always returns false, useful for preventing default actions.
    function falseFn() {
      return false;
    }

    // Applies a set of CSS styles to a given DOM element.
    function setStyles( element, styles ) {

      var property,
        value;

      for ( property in styles ) {

        if ( styles.hasOwnProperty( property ) ) {
          value = styles[property];

          // Append 'px' to certain numeric values if not already present.
          switch ( property ) {
            case "height":
            case "width":
            case "marginLeft":
            case "marginTop":
              value += "px";
          }

          element.style[property] = value;

        }

      }

      return element;

    }

    // Merges properties from a source object into a destination object.
    function extend( destination, source ) {

      var property;

      for ( property in source ) {
        destination[property] = source[property];
      }

      return destination;

    }

    // Creates a function that, when called, has its 'this' context bound to 'context'.
    function proxy( fn, context ) {

      return function() {
        return fn.apply( context, Array.prototype.slice.call( arguments ) );
      };

    }

    // Retrieves elements by class name, optionally using jQuery if available.
    function getElementsByClassName( className, root ) {
      var elements;

      if ( $ ) {
        // Use jQuery's find method if jQuery is present.
        elements = $( root ).find( "." + className );
      } else {
        // Fallback to native getElementsByClassName for plain JS.
        elements = Array.prototype.slice.call( root.getElementsByClassName( className ) );
      }

      return elements;
    }

    // Animates a CSS property of an element. Uses jQuery's animate if available.
    function animate( element, propery, to, speed, callback ) {
      var propertyObj = {};

      propertyObj[propery] = to;

      if ( $ ) {
        // jQuery animation.
        $( element ).animate( propertyObj, speed, callback );
      } else {
        // Simple style setting for non-jQuery. No actual animation here.
        setStyles( element, propertyObj );
      }

    }

    /**
     * Extracts normalized x/y coordinates from an event object.
     * Handles both touch and mouse events.
     * @param {Object} event The event object (e.g., touchstart, mousedown).
     * @returns {Object} An object containing 'x' and 'y' coordinates.
     */
    function getCoords( event ) {
      // Touch events store data in 'touches' or 'changedTouches'.
      var touches = event.touches,
        data = touches && touches.length ? touches : event.changedTouches;

      return {
        x: isTouch ? data[0].pageX : event.pageX,
        y: isTouch ? data[0].pageY : event.pageY
      };
    }

    /**
     * Dragend constructor. Initializes a new dragend instance.
     * @param {HTMLElement} container The main DOM element to apply dragend to.
     * @param {Object} settings Custom configuration settings.
     */
    function Dragend( container, settings ) {
      // Create a fresh copy of default settings to avoid modification.
      var defaultSettingsCopy = extend( {}, defaultSettings );

      this.settings = extend( defaultSettingsCopy, settings );
      this.container = container;
      this.pageContainer = doc.createElement( "div" ); // Container for all pages.
      this.scrollBorder = {
        x: 0,
        y: 0
      }; // Tracks current scroll position for overscroll.
      this.page = 0; // Current page index.
      this.preventScroll = false; // Flag to temporarily prevent scrolling.
      this.pageCssProperties = {
        margin: 0
      }; // Default CSS properties for individual pages.

      // Bind event handlers to the instance context.
      this._onStart = proxy( this._onStart, this );
      this._onMove = proxy( this._onMove, this );
      this._onEnd = proxy( this._onEnd, this );
      this._onKeydown = proxy( this._onKeydown, this );
      this._sizePages = proxy( this._sizePages, this );
      this._afterScrollTransform = proxy( this._afterScrollTransform, this );

      // Move existing content into the new pageContainer.
      this.pageContainer.innerHTML = container.cloneNode( true ).innerHTML;
      container.innerHTML = ""; // Clear original container.
      container.appendChild( this.pageContainer ); // Add new pageContainer.

      // Select appropriate scroll and animation methods based on transform support.
      this._scroll = supportTransform ? this._scrollWithTransform : this._scrollWithoutTransform;
      this._animateScroll = supportTransform ? this._animateScrollWithTransform : this._animateScrollWithoutTransform;

      // Apply initial styles to the main container.
      setStyles( container, containerStyles );

      // Allow DOM to update, then initialize pages and observe events.
      setTimeout( proxy( function() {
        this.updateInstance( settings );
        if ( !this.settings.preventDrag ) {
          this._observe(); // Attach event listeners if dragging is allowed.
        }
        this.settings.afterInitialize.call( this ); // Execute afterInitialize callback.
      }, this ), 10 );

    }

    // Helper function to add event listeners, with jQuery support.
    function addEventListener( container, event, callback ) {
      if ( $ ) {
        $( container ).on( event, callback );
      } else {
        container.addEventListener( event, callback, false );
      }
    }

    // Helper function to remove event listeners, with jQuery support.
    function removeEventListener( container, event, callback ) {
      if ( $ ) {
        $( container ).off( event, callback );
      } else {
        container.removeEventListener( event, callback, false );
      }
    }

    // Extend the Dragend prototype with methods.
    extend( Dragend.prototype, {

      // Private methods for internal logic.
      // ===================================

      // ### Overscroll boundary check
      //
      // This method determines if a drag is exceeding the scroll boundaries
      // (first or last page) and calculates adjusted coordinates for a "rubber band" effect.
      //
      // @param {String} direction - The direction of the drag ("left", "right", "up", "down").
      // @param {Number} x - The raw X coordinate of the drag.
      // @param {Number} y - The raw Y coordinate of the drag.
      // @returns {Object} An object containing 'x', 'y' (adjusted coordinates),
      //                   and 'overscroll' (boolean indicating if overscroll occurred).

      _checkOverscroll: function( direction, x, y ) {
        var coordinates = {
          x: x,
          y: y,
          overscroll: true
        };

        switch ( direction ) {

          case "right":
            // If at the first page (scrollBorder.x is 0), apply overscroll effect.
            if ( !this.scrollBorder.x ) {
              coordinates.x = Math.round( ( x - this.scrollBorder.x ) / 5 );
              return coordinates;
            }
            break;

          case "left":
            // If at the last page (scrollBorder.x is at its maximum), apply overscroll.
            if ( ( this.pagesCount - 1 ) * this.pageDimentions.width <= this.scrollBorder.x ) {
              coordinates.x = Math.round( - ( ( Math.ceil( this.pagesCount ) - 1 ) * ( this.pageDimentions.width + this.settings.borderBetweenPages ) ) + x / 5 );
              return coordinates;
            }
            break;

          case "down":
            // If at the first page (scrollBorder.y is 0), apply overscroll effect.
            if ( !this.scrollBorder.y ) {
              coordinates.y = Math.round( ( y - this.scrollBorder.y ) / 5 );
              return coordinates;
            }
            break;

          case "up":
            // If at the last page (scrollBorder.y is at its maximum), apply overscroll.
            if ( ( this.pagesCount - 1 ) * this.pageDimentions.height <= this.scrollBorder.y ) {
              coordinates.y = Math.round( - ( ( Math.ceil( this.pagesCount ) - 1 ) * ( this.pageDimentions.height + this.settings.borderBetweenPages ) ) + y / 5 );
              return coordinates;
            }
            break;
        }

        // If no overscroll, return raw adjusted coordinates.
        return {
          x: x - this.scrollBorder.x,
          y: y - this.scrollBorder.y,
          overscroll: false
        };
      },

      // _observe
      //
      // Sets up all necessary event listeners for drag interactions, window resizing,
      // and optional keyboard navigation.

      _observe: function() {

        // Listen for the start of a drag/touch.
        addEventListener( this.container, startEvent, this._onStart );
        // Prevent default browser drag and selection behavior.
        this.container.onselectstart = falseFn;
        this.container.ondragstart = falseFn;

        // Add keyboard navigation listeners if enabled in settings.
        if ( this.settings.keyboardNavigation ) {
          addEventListener( doc.body, "keydown", this._onKeydown );
        }

        // Listen for window resize events to re-size pages.
        addEventListener( win, "resize", this._sizePages );

      },


      // _onStart
      //
      // Event handler for the 'touchstart' or 'mousedown' event.
      // Records the starting coordinates and attaches move/end listeners.
      //
      // @param {Event} event - The DOM event object.

      _onStart: function( event ) {

        event = event.originalEvent || event; // Normalize event for jQuery.

        // Stop event propagation if configured.
        if ( this.settings.stopPropagation ) {
          event.stopPropagation();
        }

        // Attach move and end event listeners to the document body.
        addEventListener( doc.body, moveEvent, this._onMove );
        addEventListener( doc.body, endEvent, this._onEnd );

        // Store the initial touch/mouse coordinates.
        this.startCoords = getCoords( event );

        // Trigger the onDragStart callback.
        this.settings.onDragStart.call( this, event );

      },

      // _onMove
      //
      // Event handler for 'touchmove' or 'mousemove'.
      // Calculates drag distance, checks for overscroll, and updates scroll position.
      //
      // @param {Event} event - The DOM event object.

      _onMove: function( event ) {

        event = event.originalEvent || event;

        // Ignore multi-touch gestures (e.g., pinching).
        if ( event.touches && event.touches.length > 1 || event.scale && event.scale !== 1 ) return;

        event.preventDefault(); // Prevent default browser scrolling.
        if ( this.settings.stopPropagation ) {
          event.stopPropagation();
        }

        // Parse event to get direction and distance.
        var parsedEvent = this._parseEvent( event ),
          // Check for overscroll and get adjusted coordinates.
          coordinates = this._checkOverscroll( parsedEvent.direction, -parsedEvent.distanceX, -parsedEvent.distanceY );

        // Trigger the onDrag callback.
        this.settings.onDrag.call( this, this.activeElement, parsedEvent, coordinates.overscroll, event );

        // If scrolling is not prevented, update the visual scroll position.
        if ( !this.preventScroll ) {
          this._scroll( coordinates );
        }
      },

      // _onEnd
      //
      // Event handler for 'touchend' or 'mouseup'.
      // Determines if a swipe occurred and triggers appropriate actions.
      //
      // @param {Event} event - The DOM event object.

      _onEnd: function( event ) {

        event = event.originalEvent || event;

        if ( this.settings.stopPropagation ) {
          event.stopPropagation();
        }

        var parsedEvent = this._parseEvent( event );

        // Reset start coordinates.
        this.startCoords = {
          x: 0,
          y: 0
        };

        // Check if drag distance is sufficient to trigger a swipe.
        if ( Math.abs( parsedEvent.distanceX ) > this.settings.minDragDistance || Math.abs( parsedEvent.distanceY ) > this.settings.minDragDistance ) {
          this.swipe( parsedEvent.direction ); // Perform the swipe.
        } else if ( Math.abs( parsedEvent.distanceX ) > 0 || Math.abs( parsedEvent.distanceY ) > 0 ) {
          // If a drag occurred but wasn't long enough for a swipe, snap back to current page.
          this._scrollToPage();
        }

        // Trigger the onDragEnd callback.
        this.settings.onDragEnd.call( this, this.container, this.activeElement, this.page + 1, event );

        // Remove move and end event listeners from the document body.
        removeEventListener( doc.body, moveEvent, this._onMove );
        removeEventListener( doc.body, endEvent, this._onEnd );

      },

      // _parseEvent
      //
      // Calculates the distance dragged from the start coordinates to the current event coordinates.
      //
      // @param {Event} event - The current DOM event object.
      // @returns {Object} An object containing distanceX, distanceY, and detected direction.

      _parseEvent: function( event ) {
        var coords = getCoords( event ),
          x = this.startCoords.x - coords.x,
          y = this.startCoords.y - coords.y;

        return this._addDistanceValues( x, y );
      },

      // _addDistanceValues
      //
      // Helper to determine the primary drag direction and set distance values.
      //
      // @param {Number} x - The raw horizontal distance.
      // @param {Number} y - The raw vertical distance.
      // @returns {Object} An event data object with distance and direction.

      _addDistanceValues: function( x, y ) {
        var eventData = {
          distanceX: 0,
          distanceY: 0
        };

        if ( this.settings.direction === "horizontal" ) {
          eventData.distanceX = x;
          eventData.direction = x > 0 ? "left" : "right";
        } else {
          eventData.distanceY = y;
          eventData.direction = y > 0 ? "up" : "down";
        }

        return eventData;
      },

      // _onKeydown
      //
      // Event handler for keyboard navigation.
      // Triggers a page scroll based on arrow key presses.
      //
      // @param {Event} event - The DOM keyboard event object.

      _onKeydown: function( event ) {
        var direction = keycodes[event.keyCode]; // Map keycode to direction string.

        if ( direction ) {
          this._scrollToPage( direction ); // Scroll to the next page in the detected direction.
        }
      },

      // _setHorizontalContainerCssValues
      //
      // Applies CSS styles specific to a horizontal dragend layout.
      // Configures page elements to float left and sets container width.

      _setHorizontalContainerCssValues: function() {
        // Set individual page CSS properties.
        extend( this.pageCssProperties, {
          "cssFloat": "left",
          "overflowY": "auto",
          "overflowX": "hidden",
          "padding": 0,
          "display": "block"
        } );

        // Set the main page container's CSS properties for horizontal layout.
        setStyles( this.pageContainer, {
          "overflow": "hidden",
          "width": ( this.pageDimentions.width + this.settings.borderBetweenPages ) * this.pagesCount,
          "boxSizing": "content-box",
          "-webkit-backface-visibility": "hidden",
          "-webkit-perspective": 1000,
          "margin": 0,
          "padding": 0
        } );
      },

      // _setVerticalContainerCssValues
      //
      // Applies CSS styles specific to a vertical dragend layout.
      // Configures page elements for vertical stacking.

      _setVerticalContainerCssValues: function() {
        // Set individual page CSS properties.
        extend( this.pageCssProperties, {
          "overflow": "hidden",
          "padding": 0,
          "display": "block"
        } );

        // Set the main page container's CSS properties for vertical layout.
        setStyles( this.pageContainer, {
          "padding-bottom": this.settings.scribe,