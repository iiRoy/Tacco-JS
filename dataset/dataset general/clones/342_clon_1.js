/**
 * jQuery Smoove - A JavaScript library for smooth scrolling effects.
 *
 * @version 1.0.0
 * @author Adam Bouqdib
 * @license abemedia.co.uk/license
 *
 * This file contains the core Smoove functionality, enabling
 * elements to animate into view as the user scrolls.
 * It's designed to be lightweight and easy to integrate.
 */
( function  (  $, window,  document ) {
  // Define the smoove plugin on the jQuery prototype.
  $.fn.smoove = function ( options ) {
    // Initialize the Smoove plugin for the selected elements.
    // Merges default settings with user-provided options.
    $.fn.smoove.init( this, $.extend( {}, $.fn.smoove.defaults, options ) );
    // Return the jQuery object for chaining.
    return this;
  };

  // Array to hold all Smoove-enabled items.
  $.fn.smoove.items = [ ];

  // Flag to ensure event handlers are loaded only once.
  $.fn.smoove.loaded = false;

  // Default settings for the Smoove plugin.
  // These can be overridden per element or globally.
  $.fn.smoove.defaults = {
    offset: 150, // Distance from the bottom of the viewport to trigger animation.
    opacity: 0, // Target opacity when the element is out of view (0-100).
    transition: "all 1s ease, opacity 1.5s ease", // CSS transition property.
    transformStyle: 'preserve-3d', // CSS transform-style property.
    transformOrigin: false, // CSS transform-origin property.
    perspective: 1000 // CSS perspective property for 3D transforms.
  };

  /**
   * Initializes Smoove for a collection of jQuery elements.
   *
   * @param {jQuery} items - The jQuery collection of elements to initialize.
   * @param {Object} settings - Global settings for these items.
   */
  $.fn.smoove.init = function ( items, settings ) {
    items.each( function ( ) {
      // Cache the jQuery object for the current item.
      var $item = $( this ),

        // Merge global settings with data attributes specific to this item.
        params = $item.params = $.extend( {}, settings, $item.data( ) );

      // Convert opacity to a 0-1 scale for CSS.
      $item.params.opacity = $item.params.opacity / 100;

      // Store the initial top position of the item.
      $item.data( 'top', $item.offset( ).top );

      // Apply vendor prefixes to the transition property.
      params.transition = crossBrowser( 'transition', params.transition, 'transform' );
      $item.css( params.transition );

      // Add the item to the global list of smoove items.
      $.fn.smoove.items.push( $item );
    } );

    /**
     * Helper function to add vendor prefixes to CSS properties.
     *
     * @param {string} property - The CSS property name (e.g., 'transition', 'transform').
     * @param {string} value - The CSS property value.
     * @param {string} [prefix] - An optional value to prefix within the 'value' string itself.
     * @returns {Object} An object with prefixed properties and the standard property.
     */
    function crossBrowser ( property, value, prefix ) {

      // Helper to capitalize the first letter of a string.
      function ucase ( string ) {
        return string.charAt( 0 ).toUpperCase( ) + string.slice( 1 );
      }

      var vendor = [ 'webkit', 'moz', 'ms', 'o' ], // Array of standard vendor prefixes.
        properties = { }; // Object to store the prefixed CSS properties.

      // Iterate through each vendor prefix.
      for ( var i = 0; i < vendor.length; i++ ) {
        var prefixedValue = value;
        if ( prefix ) {
          // If a specific prefix is needed within the value (e.g., for `transform`).
          prefixedValue = value.replace( prefix, '-' + vendor[ i ] + '-' + prefix );
        }
        // Add the vendor-prefixed property.
        properties[ ucase( vendor[ i ] ) + ucase( property ) ] = prefixedValue;
      }
      // Add the standard (unprefixed) property.
      properties[ property ] = value;

      return properties;
    }

    // Add event handlers only if they haven't been loaded yet.
    if ( !$.fn.smoove.loaded ) {
      $.fn.smoove.loaded = true; // Mark as loaded.

      var didScroll = false, // Flag to throttle scroll events.
        oldScroll = 0, // Stores the previous scroll position.
        oldHeight = $( window ).height( ), // Stores the previous window height.
        oldWidth = $( window ).width( ), // Stores the previous window width.
        oldDocHeight = $( document ).height( ), // Stores the previous document height.
        resizing; // Timeout variable for resize event throttling.

      // Naughty but effective: Hide horizontal scrollbars if body width matches window width
      // to prevent scrollbar appearance when elements slide in/out.
      if ( $( 'body' ).width( ) === $( window ).width( ) ) {
        $( 'body' ).css( 'overflow-x', 'hidden' );
      }

      // Handle window resize events.
      $( window ).resize( function ( ) {
        clearTimeout( resizing ); // Clear any existing resize timeout.
        resizing = setTimeout( function ( ) {
          var height = $( window ).height( ), // Current window height.
            width = $( window ).width( ), // Current window width.
            // Determine scroll direction based on height change (for responsive adjustments).
            direction = ( oldHeight > height ) ? 'up' : 'down',
            items = $.fn.smoove.items; // Get all smoove items.

          oldHeight = height; // Update old height.

          // Responsive support: If width changed, re-evaluate positions.
          if ( oldWidth !== width ) {
            // Temporarily remove transforms and transitions to allow reflow.
            for ( var i = 0; i < items.length; i++ ) {
              items[ i ].css( crossBrowser( 'transform', '' ) ).css( crossBrowser( 'transition', '' ) );
            }

            // Wait for responsive magic (e.g., CSS media queries) to finish.
            var stillResizing = setInterval( function ( ) {
              var docHeight = $( document ).height( ); // Current document height.
              if ( docHeight === oldDocHeight ) {
                // If document height stabilized, responsive layout is likely done.
                window.clearInterval( stillResizing ); // Stop checking.
                // Re-calculate and apply original transitions.
                for ( var i = 0; i < items.length; i++ ) {
                  items[ i ].data( 'top', items[ i ].offset( ).top );
                  items[ i ].css( items[ i ].params.transition );
                }
                smooveIt( direction ); // Trigger smoove animation.
              }
              oldDocHeight = docHeight; // Update old document height.
            }, 500 ); // Check every 500ms.
          }
          // If only height changed, just re-smoove.
          else {
            smooveIt( direction );
          }
          oldWidth = width; // Update old width.
        }, 500 ); // Throttle resize events to fire after 500ms of inactivity.
      } );

      // Handle window load event.
      $( window ).on( 'load', function ( ) {
        smooveIt( ); // Initial call to smoove items.

        // Throttle scroll handler to improve performance.
        $( window ).scroll( function ( ) {
          didScroll = true; // Set flag when scroll occurs.
        } );
        setInterval( function ( ) {
          if ( didScroll ) {
            didScroll = false; // Reset flag.
            var scrolltop = $( window ).scrollTop( ), // Current scroll position.
              // Determine scroll direction.
              direction = ( scrolltop < oldScroll ) ? 'up' : 'down';
            oldScroll = scrolltop; // Update old scroll position.
            smooveIt( direction ); // Trigger smoove animation.
          }
        }, 250 ); // Check for scroll events every 250ms.
      } );
    }

    /**
     * The main function to apply smoove effects to elements based on scroll position.
     *
     * @param {string} [direction] - The scroll direction ('up' or 'down').
     */
    function smooveIt ( direction ) {
      // Loop through all registered smoove items.
      for ( var i = 0; i < $.fn.smoove.items.length; i++ ) {
        var $item = $.fn.smoove.items[ i ], // Current smoove item.
          params = $item.params, // Parameters for the current item.
          height = $( window ).height( ), // Current window height.
          // Calculate offset: if no direction or scrolling down and item is visible, use 0 offset
          // to prevent hiding already visible items. Otherwise, use item's defined offset.
          offset = ( !direction || direction === 'down' && $item.css( 'opacity' ) === '1' ) ? 0 : params.offset,
          itemtop = $( window ).scrollTop( ) + height - $item.data( 'top' ); // Relative position of item to viewport bottom.

        // If offset is a percentage string, convert it to pixels.
        if ( typeof offset === 'string' && offset.indexOf( '%' ) !== -1 ) {
          offset = parseInt( offset ) / 100 * height;
        }

        // Check if the item is within the activation range.
        if ( itemtop < offset ) {
          // Item is out of view or entering from above.
          // Apply initial opacity if defined.
          if ( params.opacity !== false ) {
            $item.css( {
              opacity: params.opacity
            } );
          }

          var transforms = [ ], // Array to store individual transform properties.
            // List of supported transform properties.
            properties = [ 'move', 'move3D', 'moveX', 'moveY', 'moveZ', 'rotate', 'rotate3d', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scale3d', 'scaleX', 'scaleY', 'skew', 'skewX', 'skewY' ];

          // Collect transform values from item parameters.
          for ( var p = 0; p < properties.length; p++ ) {
            if ( typeof params[ properties[ p ] ] !== "undefined" ) {
              transforms[ properties[ p ] ] = params[ properties[ p ] ];
            }
          }

          var transform = ''; // String to build the CSS transform property.
          // Construct the transform string.
          for ( var t in transforms ) {
            // Replace 'move' with 'translate' for CSS compatibility.
            transform += t.replace( 'move', 'translate' ) + '(' + transforms[ t ] + ') ';
          }
          // Apply transforms if any were defined.
          if ( transform ) {
            $item.css( crossBrowser( 'transform', transform ) );
            // Apply perspective to the parent if it's a 3D transform.
            $item.parent( ).css( crossBrowser( 'perspective', params.perspective ) );
            // Note: transformStyle commented out in original, keeping it that way.
            //$item.parent().css(crossBrowser('transformStyle', params.transformstyle));

            // Apply transform-origin if specified.
            if ( params.transformOrigin ) {
              $item.css( crossBrowser( 'transformOrigin', params.transformOrigin ) );
            }
          }
        } else {
          // Item is in view (or scrolled past).
          // Reset opacity to 1 and remove any transforms.
          $item.css( 'opacity', 1 ).css( crossBrowser( 'transform', '' ) );
        }
      }
    }
  };

} ( jQuery, window, document ) );