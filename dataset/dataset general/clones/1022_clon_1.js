/*
 * Swipley Main Plugin File
 *
 * Based on an adaptation of the original swipe.js by Torkil Johnsen.
 * Source: https://github.com/torkiljohnsen/swipe
 *
 * This software is dual-licensed under both the MIT and GPL licenses.
 * Feel free to use it according to your project's needs.
 */

( function ( $ ) {

  var Swipeable = function ( element, fixed, options ) {
    // Define constant values for various states or actions.
    var NEXT_CONST  = 'yyyNextyyy' ;
    var PREV_CONST  = 'yyyPrevyyy' ;
    var NAV_CONST   = 'yyyNavyyy'  ;
    var ABORT_CONST = 'yyyAbortyyy';

    var plugin = this;                 /* Reference to the current plugin instance. */
    var page   = $( element );         /* The primary DOM element, serving as the touch-enabled layer. */
    var nav    = $( fixed );           /* The secondary DOM element, acting as the fixed navigation layer. */

    // Default configuration options for the Swipeable plugin.
    var defaults = {
      animationSpeed      : 150,     // Speed (in milliseconds) for panel transitions.
      easing              : 'swing', // Easing function for animations. 'linear' and 'swing' are standard jQuery.
      minSwipeLength      : 20,      // Minimum horizontal distance (in pixels) to register a valid swipe.
      slideRightSelector  : '#slideRight', /* Selector for the 'slide right' button. */
      slideLeftSelector   : '#slideLeft'   /* Selector for the 'slide left' button. */
    };

    plugin.config = {}; // Initialize the configuration object.

    /*
     * Initializes the plugin, merging default options with user-provided ones.
     * Sets up the initial state for touch interactions and determines panel layout.
     */
    var init = function () {
      plugin.config = $.extend( defaults, options || {} ); // Merge defaults with custom options.
      plugin.state  = {
        touchesCount          : 0,         // Number of concurrent touch points.
        startTouchXPosition   : 0,         // X-coordinate of the initial touch.
        startTouchYPosition   : 0,         // Y-coordinate of the initial touch.
        deltaX                : 0,         // Accumulated horizontal movement during a swipe.
        elementPosition       : undefined, // Element's left position before a swipe begins.
        currentXTouchPosition : 0,         // Current X-coordinate during touchmove.
        currentYTouchPosition : 0,         // Current Y-coordinate during touchmove.
        isScrolling           : undefined  // Flag to differentiate between horizontal swipe and vertical scroll.
      };

      // Decide whether to use a multi-panel or single-panel layout based on screen width.
      if ( document.body.clientWidth > 480 ) {
        initManyPanels(); // For wider screens, enable multiple navigable panels.
      } else {
        initOnePanel();   // For narrower screens (e.g., mobile), use a single dynamic panel.
      }
    }; // End of init function.

    /*
     * Sets up the environment for multiple panels, typically for wider screens.
     * Dynamically loads content into panels and configures navigation.
     */
    var initManyPanels = function () {
      var PANEL_CONST = "panel"; // Constant for panel class/ID prefix.

      // Determine panel width, capping it at 800px or screen width, whichever is smaller.
      var panel_width = Math.min( 800, $( document ).width() );
      var width       = 0;       // Accumulator for total page width.
      var linksMap    = {};      // Map to store click handlers for navigation links.

      // Iterate through each navigation link to create corresponding panels.
      nav.find( "ul a" ).each( function ( index ) {
        var href          = undefined;     // The URL from the link's href attribute.
        var clickFunction = undefined;     // The click handler for the link.
        var panel         = undefined;     // The jQuery object for the newly created panel.

        // Define a default click handler for "index.html" to navigate to the primary view.
        linksMap["index.html"] = function ( event ) {
          event.preventDefault(); // Prevent default link behavior.
          movePage( NAV_CONST );  // Navigate to the navigation panel.
        };

        // Create a new panel div, append it to the page, and set its initial styles.
        panel = $( "<div class='panel' id='" + PANEL_CONST + index + "'></div>" )
                  .appendTo( page )
                  .css( "width", panel_width )
                  .css( "left", width );

        width += panel.outerWidth(); // Update total width.
        href   = $( this ).attr( 'href' ); // Get the href of the current navigation link.

        // Load content for the panel asynchronously.
        $.get( href,
          function ( html ) {
            var $html = $( html );          // Convert fetched HTML string to jQuery object.
            $( panel ).html( $html );       // Populate the panel with the fetched content.
            replaceLinks( $html, linksMap ); // Process links within the new content.
          }
        );

        // Define the click function for the current navigation link.
        clickFunction = function ( event ) {
          event.preventDefault();             // Prevent default link action.
          movePage( '#' + PANEL_CONST + index ); // Move to the panel associated with this link.
        };

        // Attach the click handler to the navigation link.
        $( this ).on( { 'click': clickFunction } );
        linksMap[ href ] = clickFunction; // Store the click handler in the map.
      } );

      page.css( "width", width ); // Set the total width of the swipeable page container.
      movePage( NAV_CONST );      // Initialize the view to the navigation panel.
      attach( page );             // Attach touch event listeners to the page.
    }; // End of initManyPanels function.

    /*
     * Configures the layout for a single dynamic panel, optimized for smaller screens.
     * Content is loaded into this single panel as navigation links are clicked.
     */
    var initOnePanel = function () {
      var PANEL_CONST = "panel"; // Constant for the single panel's class/ID.

      var width    = 0;          // Not strictly needed for one panel, but kept for consistency.
      var linksMap = {};         // Map for navigation link click handlers.
      var panel    = undefined;  // The jQuery object for the single dynamic panel.

      // Create the single panel div, append it, and set its initial dimensions.
      panel = $( "<div class='panel' id='" + PANEL_CONST + "'>" )
                .appendTo( page )
                .css( "width", $( document ).width() )
                .css( "left", 0 )
                .css( "height", $( document ).height() );

      width += panel.outerWidth(); // Update total width.

      // Process each navigation link.
      nav.find( "ul a" ).each( function ( index ) {
        var href          = undefined; // The URL from the link's href attribute.
        var clickFunction = undefined; // The click handler for the link.

        // Define a default click handler for "index.html".
        linksMap["index.html"] = function ( event ) {
          event.preventDefault();
          movePage( NAV_CONST );
        };

        href = $( this ).attr( 'href' ); // Get the href of the current navigation link.

        // Define the click handler for this navigation link.
        clickFunction = function ( event ) {
          event.preventDefault();
          $( panel ).html( "<p>loading…</p>" ); // Display a loading message.

          // Load content for the single panel.
          $.get( href,
            function ( html ) {
              $( panel ).scrollTop( 0 );     // Scroll to the top of the panel.
              var $html = $( html );         // Convert fetched HTML to jQuery object.
              $( panel ).html( $html );      // Populate the panel.
              replaceLinks( $html, linksMap ); // Process links within new content.
              if ( navigator.userAgent.match( /Android/i ) ) {
                window.scrollTo( 0, 1 ); // Workaround for Android address bar hiding.
              }
            }
          );
          movePage( '#' + PANEL_CONST ); // Move to the single panel view.
        };

        $( this ).on( { 'click': clickFunction } ); // Attach the click handler.
        linksMap[ href ] = clickFunction; // Store the handler in the map.
      } );

      page.css( "width", width ); // Set the width of the page container.
      movePage( NAV_CONST );      // Initialize to the navigation panel.
      attach( page );             // Attach touch event listeners.

      // Load initial content into the single panel from the first navigation link.
      var hrf = $( nav.find( "ul a" )[ 0 ] ).attr( 'href' );
      $.get( hrf, function ( html ) {
        var $html = $( html );
        $( panel ).html( $html );
        replaceLinks( $html, linksMap );
        movePage( '#' + PANEL_CONST );
        if ( navigator.userAgent.match( /Android/i ) ) {
          window.scrollTo( 0, 1 );
        }
      } );
    }; // End of initOnePanel function.

    /*
     * Attaches touch and pointer event handlers to the specified panel.
     * This enables swipe gestures for navigation.
     */
    var attach = function ( panel ) {
      // Standard touch events for iOS and Android.
      panel.on( {
        'touchstart': function ( event ) {
          // Note: event.originalEvent is needed to access native touch properties in jQuery.
          touchStart( event.originalEvent );
        },
        'touchmove': function ( event ) {
          touchMove( event.originalEvent );
        },
        'touchcancel': function ( event ) {
          touchCancel( event.originalEvent );
        },
        'touchend': function ( event ) {
          touchEnd( event.originalEvent );
        }
      } );

      // Windows 8/IE touch support using MSPointer events.
      if ( window.navigator.msPointerEnabled ) {
        panel.on( {
          'MSPointerCancel': function ( event ) {
            touchCancel( event.originalEvent );
          },
          'MSPointerDown': function ( event ) {
            touchStart( event.originalEvent );
          },
          'MSPointerMove': function ( event ) {
            touchMove( event.originalEvent );
          },
          'MSPointerOut': function ( event ) {
            touchCancel( event.originalEvent );
          },
          'MSPointerUp': function ( event ) {
            touchEnd( event.originalEvent );
          }
        } );
      }
    }; // End of attach function.

    /*
     * Handles the 'touchstart' event. Records the initial touch position
     * and validates if it's a single-finger touch for swiping.
     */
    var touchStart = function ( event ) {
      var state = plugin.state; // Shorthand for the plugin's state object.

      state.touchesCount = event.touches.length; // Get number of fingers touching.

      // Proceed only if a single finger is touching (for a swipe, not a multi-touch gesture).
      if ( state.touchesCount == 1 ) {
        // Reset or initialize swipe-specific state variables.
        state.isScrolling         = undefined;                  // Reset scroll flag.
        state.deltaX              = 0;                          // Reset horizontal movement.
        state.startTouchXPosition = event.touches[ 0 ].pageX; // Record initial X.
        state.startTouchYPosition = event.touches[ 0 ].pageY; // Record initial Y.
        state.elementPosition     = page.position().left;     // Store current element position.
      } else {
        // If not a single-finger touch, cancel the gesture.
        touchCancel( event );
      }
    }; // End of touchStart function.

    /*
     * Handles the 'touchmove' event. Calculates horizontal and vertical movement
     * to determine if it's a swipe or a scroll, then moves the page accordingly.
     */
    var touchMove = function ( event ) {
      var state   = plugin.state; // Plugin state.
      var pagePos = 0;            // Variable to hold the calculated new page position.

      // Only process if a single finger is actively swiping.
      if ( state.touchesCount == 1 ) {
        state.currentXTouchPosition = event.touches[ 0 ].pageX; // Update current X.
        state.currentYTouchPosition = event.touches[ 0 ].pageY; // Update current Y.

        state.deltaX = state.currentXTouchPosition - state.startTouchXPosition; // Calculate horizontal delta.
        var deltaY   = state.currentYTouchPosition - state.startTouchYPosition; // Calculate vertical delta.

        // Determine if the primary intent is scrolling (vertical) or swiping (horizontal).
        if ( typeof state.isScrolling == 'undefined' ) {
          state.isScrolling = !!( state.isScrolling || Math.abs( state.deltaX ) < Math.abs( deltaY ) );
        }

        // If it's determined to be a swipe (not scrolling), prevent default browser behavior
        // and visually move the page element to follow the finger.
        if ( !state.isScrolling ) {
          event.preventDefault();                   // Stop browser from scrolling the page.
          pagePos = state.elementPosition + state.deltaX; // Calculate new position.
          page.css( 'left', pagePos );              // Apply the new position.
        }
      } else {
        // If multiple fingers or no fingers, cancel the operation.
        touchCancel( event );
      }
    }; // End of touchMove function.

    /*
     * Handles the 'touchend' event. Evaluates if a valid swipe occurred
     * based on minimum swipe length and direction, then snaps the page.
     */
    var touchEnd = function ( event ) {
      var state = plugin.state; // Plugin state.

      // Conditions for a valid swipe: not scrolling, horizontal movement occurred,
      // single finger, and touch ended with a valid X position.
      if ( !state.isScrolling && state.deltaX != 0 && state.touchesCount == 1 && state.currentXTouchPosition != 0 ) {
        // Check if the swipe distance exceeds the minimum threshold.
        if ( Math.abs( state.deltaX ) > defaults.minSwipeLength ) {
          // Determine swipe direction and move to the appropriate panel.
          if ( state.deltaX > 0 ) {
            movePage( PREV_CONST ); // Swipe right: move to previous panel.
          } else {
            movePage( NEXT_CONST ); // Swipe left: move to next panel.
          }
        } else {
          // Swipe was too short; snap the page back to its original position.
          movePage( ABORT_CONST );
        }
      } else {
        // If conditions for a valid swipe are not met, cancel the touch interaction.
        touchCancel( event );
      }
    }; // End of touchEnd function.

    /*
     * Handles the 'touchcancel' event. Resets touch state and
     * snaps the page back if it was partially moved.
     */
    var touchCancel = function ( event ) {
      state = plugin.state; // Plugin state.

      // If the element's position has changed from its starting point, revert it.
      if ( state.elementPosition != state.currentXTouchPosition ) {
        movePage( ABORT_CONST );
      }

      // Reset current touch positions.
      state = $.extend( state, {
        currentXTouchPosition   : 0,
        currentYTouchPosition   : 0
      } );
    }; // End of touchCancel function.

    /*
     * Moves the page to a specific panel or position based on the given direction.
     * Supports 'next', 'prev', 'nav', 'abort', or a specific panel ID.
     */
    var movePage = function ( direction ) {
      // Directions:
      // 'yyyNextyyy': Move to the next panel (if available).
      // 'yyyPrevyyy': Move to the previous panel (if available).
      // 'yyyNavyyy' : Move to the navigation panel (index 0).
      // 'yyyAbortyyy': Revert to the position before the touch started.
      // Default: Move to a panel specified by its ID.

      var panels                     = $( 'div.panel' ); // All panels on the page.
      var leftMostBoundaryLeftPanel  = undefined;        // Panel to the left of the current view.
      var leftMostBoundaryRightPanel = undefined;        // Panel to the right of the current view.
      var offset                     = $( page ).offset().left; // Current left offset of the page container.

      // Determine which panels are currently visible or near the viewport boundaries.
      if ( offset > 0 ) {
        // If offset is positive, panel 0 and nav are visible.
        leftMostBoundaryRightPanel = $( panels )[ 0 ];
      } else {
        // Iterate through panels to find the ones at the viewport boundaries.
        for ( var i = 0; i < panels.length; i++ ) {
          offset += $( panels[ i ] ).outerWidth();
          if ( offset > 10 ) { // If this panel is mostly visible or just passed the left edge.
            leftMostBoundaryLeftPanel  = panels[ i ];
            leftMostBoundaryRightPanel = panels[ i + 1 ];
            break;
          }
        }
      }

      // Execute action based on the 'direction' parameter.
      switch ( direction ) {
        case PREV_CONST:
          if ( typeof leftMostBoundaryLeftPanel != 'undefined' ) {
            snapToPosition( page, -1 * $( leftMostBoundaryLeftPanel ).position().left );
          }
          break;
        case NAV_CONST:
          snapToPosition( page, nav.outerWidth() + nav.position().left ); // Move to navigation panel.
          break;
        case NEXT_CONST:
          if ( typeof leftMostBoundaryRightPanel != 'undefined' ) {
            snapToPosition( page, -1 * $( leftMostBoundaryRightPanel ).position().left );
          }
          break;
        case ABORT_CONST:
          snapToPosition( page, plugin.state.elementPosition ); // Revert to initial position.
          break;
        default:
          // Handle navigation to a specific panel ID.
          leftMostBoundaryLeftPanel = $( direction );
          if ( typeof leftMostBoundaryLeftPanel != 'undefined' ) {
            snapToPosition( page, -1 * $( leftMostBoundaryLeftPanel ).position().left );
          }
      }
    }; // End of movePage function.

    /*
     * Smoothly animates the page layer to a specified horizontal position.
     */
    var snapToPosition = function ( layer, endPosition ) {
      // Animate the 'left' CSS property of the layer.
      return page.animate( { left: endPosition }, plugin.config.animationSpeed, plugin.config.easing, function () {
        plugin.state.elementPosition = endPosition; // Update the stored element position after animation.
      } );
    }; // End of snapToPosition function.

    /*
     * Replaces standard link behaviors within a content fragment with custom click handlers.
     */
    var replaceLinks = function ( fragment, map ) {
      // Iterate through the map of links and their corresponding click functions.
      $.each( map, function ( link, clickF ) {
        // Find all anchor tags within the fragment that match the current link href.
        var links = $( fragment ).find( 'a[href="' + link + '"]' );
        links.on( { 'click': clickF } ); // Attach the custom click handler.
      } );
    }; // End of replaceLinks function.

    init(); // Call the initialization function when a new Swipeable instance is created.
  }; // End of Swipeable constructor.

  /*
   * jQuery plugin definition for 'swipeable'.
   * Allows calling the Swipeable constructor on a set of jQuery elements.
   */
  $.fn.swipeable = function ( fixed, options ) {
    return this.each( function () {
      var element = $( this ); // The current DOM element in the jQuery set.

      // If the element already has a 'swipeable' instance attached, do nothing.
      if ( element.data( 'swipeable' ) ) return;

      // Create a new Swipeable instance for the current element.
      var swipeable = new Swipeable( this, fixed, options );

      // Store the Swipeable instance in the element's data for future reference.
      element.data( 'swipeable', swipeable );
    } );
  }; // End of $.fn.swipeable.

} )( jQuery ); // Pass jQuery into the immediately invoked function expression.