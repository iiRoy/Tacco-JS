/*
 * promptuMenu - jQuery Plugin - Version 1.0
 * For more details, visit: https://github.com/natrixnatrix89/promptu-menu
 *
 * Copyright (c) 2012 Janis Zarzeckis (http://natrixnatrix89.net)
 * Released under the MIT or GPL Version 2 licenses.
 * See LICENSE.txt for full license details.
 */
( function( $ ) {

  // Main plugin function definition for jQuery
  $.fn.promptumenu = function( options ) {

    // --- Plugin Initialization Start ---

    // Extend default settings with user-provided options.
    // This allows for customization of the menu behavior.
    var settings = $.extend( {
      'columns': 3,                 // Number of columns in the menu grid
      'rows': 4,                    // Number of rows in the menu grid
      'direction': 'horizontal',    // Layout direction: 'horizontal' or 'vertical'
      'width': 'auto',              // Width of the menu window (can be 'auto' or a pixel value)
      'height': 'auto',             // Height of the menu window (can be 'auto' or a pixel value)
      'duration': 500,              // Animation duration in milliseconds
      'pages': true,                // Enable / Disable pagination (navigation buttons)
      'inertia': 200                // Inertia for drag/swipe movements
    }, options );

    // Iterate over each selected element to apply the plugin
    return this.each( function() {
      var $this = $( this );        // Cache the jQuery object for the current element

      var properties;               // Stores original CSS properties of the element

      // Cursor object to track current position during layout calculation
      var cursor = {
        x: 0,                       // Current column
        y: 1,                       // Current row
        page: 1                     // Current page
      };

      // Cell dimensions and page tracking
      var cells = {
        'width': 0,                 // Calculated width of a single cell
        'height': 0,                // Calculated height of a single cell
        'pages': 1,                 // Total number of pages
        'current_page': 1           // The page currently displayed
      };

      // --- Core Methods Definition ---
      var methods = {

        /**
         * Navigates the menu to a specific page.
         * @param {number} index - The 1-based index of the page to go to.
         * @param {string} [easing='swing'] - The easing function for the animation.
         * @param {boolean} [webkit=false] - Flag to use Webkit CSS transforms for animation.
         */
        go_to: function( index, easing, webkit ) {

          // Set default easing if not provided
          if ( easing === undefined ) {
            easing = 'swing';
          }
          // Set default webkit flag if not provided
          if ( webkit === undefined ) {
            webkit = false;
          }

          var anim, anim_css; // Variables to store animation properties

          // Determine animation based on direction
          if ( settings.direction == 'vertical' ) {
            // Vertical animation: change 'top' property
            anim = { 'top': ( index - 1 ) * properties.height * ( -1 ) };
            // Webkit transform for vertical movement
            anim_css = { '-webkit-transform': 'translate3d(0px, ' + ( ( index - 1 ) * properties.height * ( -1 ) ) + 'px, 0px)' };
          } else {
            // Horizontal animation: change 'left' property
            anim = { 'left': ( index - 1 ) * properties.width * ( -1 ) };
            // Webkit transform for horizontal movement
            anim_css = { '-webkit-transform': 'translate3d(' + ( ( index - 1 ) * properties.width * ( -1 ) ) + 'px, 0px, 0px)' };
          }

          // Apply animation using Webkit transforms or jQuery animate
          if ( webkit ) {
            // Apply CSS transitions for smooth Webkit transform animation
            $this.css( {
              '-webkit-transition-property': '-webkit-transform',
              '-webkit-transition-duration': settings.duration + 'ms',
              '-webkit-transition-timing-function': 'ease-out'
            } );
            $this.css( anim_css ); // Apply the Webkit transform
            // Store the current position for touch events
            $this.data( 'ppos', ( index - 1 ) * properties.width * ( -1 ) );
          } else {
            // Use standard jQuery animation
            $this.animate( anim, settings.duration, easing );
          }

          // Update navigation buttons: remove active class from old, add to new
          $this.parent( '.promptumenu_window' ).find( '.promptumenu_nav a.active' ).removeClass( 'active' );
          $this.parent( '.promptumenu_window' ).find( '.promptumenu_nav a:nth-child(' + ( index ) + ')' ).addClass( 'active' );

          cells.current_page = index; // Update the current page tracker
        },

        /**
         * Navigates to the next page.
         */
        next_page: function() {
          methods.go_to( cells.current_page + 1 );
        },

        /**
         * Navigates to the previous page.
         */
        prev_page: function() {
          methods.go_to( cells.current_page - 1 );
        }
      };
      // --- End Core Methods Definition ---


      // Check if the plugin has already been initialized on this element
      if ( $this.data( 'promptumenu' ) ) {
        // Log an error if promptumenu is called multiple times on the same element
        console.error( 'You are calling promptumenu for an element more than twice. Please have a look.' );
      } else {
        // --- Plugin Setup for Uninitialized Element ---

        // Mark the element as initialized
        $this.data( 'promptumenu', true );
        // Initialize position data for touch events
        $this.data( 'ppos', 0 );

        // Store original CSS properties to preserve layout
        properties = {
          'width': ( settings.width == 'auto' ) ? $this.width() : settings.width,
          'height': ( settings.height == 'auto' ) ? $this.height() : settings.height,
          // 'margin': $this.css('margin'), // These properties are commented out as they are not used
          // 'position': ($this.css('position') == 'absolute') ? 'absolute' : 'relative',
          // 'top': $this.css('top'),
          // 'right': $this.css('right'),
          // 'bottom': $this.css('bottom'),
          // 'left': $this.css('left'),
          'padding': 0,               // Ensure no padding on the wrapper
          'display': 'block',         // Display as a block element
          'overflow': 'hidden'        // Hide overflow for the menu window
        };

        // Calculate individual cell dimensions
        cells.width = properties.width / settings.columns;
        cells.height = properties.height / settings.rows;

        // Wrap the original element in a new div to act as the viewport
        $this.wrap( '<div class="promptumenu_window" />' );
        // Apply stored properties to the newly created wrapper
        $this.parent( '.promptumenu_window' ).css( properties );

        // Apply base CSS to the main menu list element
        $this.css( {
          'display': 'block',         // Ensure it's a block
          'position': 'absolute',     // Position absolutely within its wrapper
          'list-style': 'none',       // Remove default list styling
          'overflow': 'visible',      // Allow contents to overflow for positioning
          'height': 'auto',           // Height will be adjusted later
          'width': 'auto',            // Width will be adjusted later
          'top': 0,                   // Initial top position
          'left': 0,                  // Initial left position
          'margin': 0,                // Remove default margins
          'padding': 0                // Remove default padding
        } );

        // Apply base CSS to each list item (child element)
        $this.children( 'li' ).css( {
          'display': 'block',         // Each item is a block
          'position': 'absolute',     // Position absolutely for grid layout
          'margin': 0                 // Remove default margins
        } );

        // --- Layout Calculation for Each List Item ---
        $this.children( 'li' ).each( function() {
          var $li = $( this );        // Cache the current list item

          // Simulate a typewriter movement to place items in a grid
          cursor.x += 1;
          // If columns limit is reached, move to the next row
          if ( cursor.x > settings.columns ) {
            cursor.x = 1;
            cursor.y += 1;
          }
          // If rows limit is reached, move to the next page
          if ( cursor.y > settings.rows ) {
            cursor.x = 1;
            cursor.y = 1;
            cursor.page += 1;
          }

          // Attach layout information to the list item's data
          $li.data( 'layout', $.extend( {}, cursor ) );

          // Position the list item based on the menu direction
          if ( settings.direction == 'vertical' ) {

            // Vertical layout: items stack vertically across pages
            $li.css( {
              'top': Math.round( ( cursor.y * cells.height - cells.height / 2 ) - ( $li.height() / 2 ) + ( cursor.page - 1 ) * properties.height ),
              'left': Math.round( ( cursor.x * cells.width - cells.width / 2 ) - ( $li.width() / 2 ) )
            } );

            // Handle image loading: reposition if image dimensions affect 'li' height
            $li.find( 'img' ).bind( 'load', function() {
              var cursor = $li.data( 'layout' ); // Retrieve layout data
              $li.css( {
                'top': Math.round( ( cursor.y * cells.height - cells.height / 2 ) - ( $li.height() / 2 ) + ( cursor.page - 1 ) * properties.height ),
                'left': Math.round( ( cursor.x * cells.width - cells.width / 2 ) - ( $li.width() / 2 ) )
              } );
            } );

          } else { // Horizontal direction

            // Horizontal layout: items stack horizontally across pages
            $li.css( {
              'top': Math.round( ( cursor.y * cells.height - cells.height / 2 ) - ( $li.height() / 2 ) ),
              'left': Math.round( ( cursor.x * cells.width - cells.width / 2 ) - ( $li.width() / 2 ) + ( cursor.page - 1 ) * properties.width )
            } );

            // Handle image loading for horizontal layout
            $li.find( 'img' ).bind( 'load', function() {
              var cursor = $li.data( 'layout' ); // Retrieve layout data

              $li.css( {
                'top': Math.round( ( cursor.y * cells.height - cells.height / 2 ) - ( $li.height() / 2 ) ),
                'left': Math.round( ( cursor.x * cells.width - cells.width / 2 ) - ( $li.width() / 2 ) + ( cursor.page - 1 ) * properties.width )
              } );
            } );

          }

        } );
        // --- End Layout Calculation ---


        cells.pages = cursor.page; // Update total number of pages
        $this.data( 'promptumenu_page_count', cells.pages ); // Store page count in data

        // Append navigation buttons if multiple pages and pagination is enabled
        if ( cells.pages > 1 && settings.pages == true ) {
          var page_links = '<a class="active">Page 1</a>'; // Start with the first page link
          // Generate links for subsequent pages
          for ( i = 2; i <= cells.pages; i++ ) {
            page_links = page_links + '<a>Page ' + i + '</a>';
          }

          // Append the navigation container to the parent window
          $this.parent( 'div.promptumenu_window' ).append( '<div class="promptumenu_nav">' + page_links + '</div>' );

          // Bind click event to navigation buttons
          $this.parent( 'div.promptumenu_window' ).find( '.promptumenu_nav a' ).bind( 'click.promptumenu', function() {
            methods.go_to( $( this ).index() + 1 ); // Navigate to the clicked page
          } );
        }

        // Adjust the size of the main list element to accommodate all pages
        // This ensures the entire draggable area is correctly sized.
        if ( settings.direction == 'vertical' ) {
          $this.css( {
            'width': properties.width,
            'height': properties.height * cells.pages
          } );
        } else { // Horizontal direction
          $this.css( {
            'width': properties.width * cells.pages,
            'height': properties.height
          } );
        }

        // --- Mouse Dragging Event Binding ---
        $this.bind( 'mousedown.promptumenu', function( mdown ) {
          mdown.preventDefault(); // Prevent default browser drag behavior

          $this.stop( true, false ); // Stop any ongoing animations

          var init_pos = $this.position(); // Initial position of the element
          var click = {
            'x': mdown.pageX,           // X coordinate of mouse down
            'y': mdown.pageY            // Y coordinate of mouse down
          };
          var delta = {
            'x': 0,                     // Change in X since mouse down
            'y': 0                      // Change in Y since mouse down
          };
          var mmove_event = new Array(); // Array to store recent mouse move events for inertia calculation

          // Bind mousemove event to drag the list
          $( document ).bind( 'mousemove.promptumenu', function( mmove ) {
            mmove.preventDefault(); // Prevent text selection etc.
            var date = new Date(); // Current timestamp
            var this_event = {
              'time': date.getTime(),   // Timestamp of this event
              'x': mmove.pageX,         // X coordinate of mouse move
              'y': mmove.pageY          // Y coordinate of mouse move
            };

            // Keep only the last few mousemove events for speed calculation
            while ( mmove_event.length > 4 ) {
              mmove_event.shift(); // Remove the oldest event
            }

            // Update position based on direction
            if ( settings.direction == 'vertical' ) {
              delta.y = mmove.pageY - click.y;
              $this.css( 'top', init_pos.top + delta.y );
            } else { // Horizontal direction
              delta.x = mmove.pageX - click.x;
              $this.css( 'left', init_pos.left + delta.x );
              // $this.css('-webkit-transform', 'translate3d(' + (init_pos.left + delta.x) + 'px, 0, 0)'); // Alternative using webkit transform
            }
            mmove_event.push( this_event ); // Add current event to history
          } );

          // Bind mouseup event to stop dragging and animate to final position
          $( document ).bind( 'mouseup.promptumenu', function( mup ) {
            mup.preventDefault(); // Prevent default browser behavior
            $( document ).unbind( '.promptumenu' ); // Unbind all mouse events related to promptumenu

            var date = new Date(); // Current timestamp

            var delta_start = mmove_event[0]; // First recorded mousemove event
            // If no mousemove events were recorded, use the mouseup event as the start
            if ( !delta_start ) {
                delta_start = {
                    'time': date.getTime() - 1, // Assume a very short duration
                    'x': mup.pageX,
                    'y': mup.pageY
                };
            }

            var delta_end = {
              'time': date.getTime(),   // Timestamp of mouse up
              'x': mup.pageX,           // X coordinate of mouse up
              'y': mup.pageY            // Y coordinate of mouse up
            };

            // Calculate overall movement delta and time delta
            var event_delta = {
              'time': ( delta_end.time - delta_start.time ),
              'x': ( delta_end.x - delta_start.x ),
              'y': ( delta_end.y - delta_start.y )
            };

            // Calculate speed (pixels per millisecond)
            var speed = {
              'x': event_delta.x / event_delta.time,
              'y': event_delta.y / event_delta.time
            };

            // console.log(mmove_event);
            // console.log('The time delta is: ' + (delta_end.time - delta_start.time));
            // console.log('The y_speed was: ' + (event_delta.y/event_delta.time));

            // Animate the list with inertia
            if ( settings.direction == 'vertical' ) {

              var pos = init_pos.top + delta.y + speed.y * settings.inertia; // Calculate final position with inertia
              // Boundary checks: prevent scrolling past the first or last page
              if ( pos < ( ( -1 ) * properties.height * ( cells.pages - 1 ) ) ) {
                pos = ( -1 ) * properties.height * ( cells.pages - 1 );
              } else if ( pos > 0 ) {
                pos = 0;
              }

              // If pagination is enabled, snap to the nearest page
              if ( settings.pages ) {
                var snap_to_page = Math.round( ( -pos ) / properties.height );
                methods.go_to( snap_to_page + 1, 'inertia' ); // Use custom 'inertia' easing
              } else {
                // Otherwise, animate to the calculated inertia position
                $this.animate( {
                  'top': pos
                }, Math.abs( speed.y * settings.inertia ), 'inertia' );
              }

            } else { // Horizontal direction

              var pos = init_pos.left + delta.x + speed.x * settings.inertia; // Calculate final position with inertia
              // Boundary checks
              if ( pos < ( ( -1 ) * properties.width * ( cells.pages - 1 ) ) ) {
                pos = ( -1 ) * properties.width * ( cells.pages - 1 );
              } else if ( pos > 0 ) {
                pos = 0;
              }

              // If pagination is enabled, snap to the nearest page
              if ( settings.pages ) {
                var snap_to_page = Math.round( ( -pos ) / properties.width );
                methods.go_to( snap_to_page + 1, 'inertia' );
              } else {
                // Otherwise, animate to the calculated inertia position
                $this.animate( {
                  'left': pos
                }, Math.abs( speed.x * settings.inertia ), 'inertia' );
              }

            }
          } );
        } );
        // --- End Mouse Dragging ---


        // --- Touch Event Binding (for mobile devices) ---
        try {
          // Attempt to bind touch events; this block will fail gracefully on non-touch devices

          var tinit_pos, tclick, tdelta; // Variables for touch state
          var tmove_event = new Array(); // Array to store recent touch move events

          // Handler for touchmove event
          var touchmove = function( tmove ) {

            tmove.preventDefault(); // Prevent default touch scrolling/zoom
            var date = new Date(); // Current timestamp
            var this_event = {
              'time': date.getTime(),       // Timestamp
              'x': tmove.touches[0].pageX,  // X coordinate of first touch
              'y': tmove.touches[0].pageY   // Y coordinate of first touch
            };

            // Keep only the last few touchmove events for speed calculation
            while ( tmove_event.length > 4 ) {
              tmove_event.shift();
            }

            // Update position using Webkit transforms
            if ( settings.direction == 'vertical' ) {
              tdelta.y = tmove.touches[0].pageY - tclick.y;
              // $this.css('top', tinit_pos.top + tdelta.y); // Old way
              $this.css( '-webkit-transform', 'translate3d(0px, ' + ( tinit_pos + tdelta.y ) + 'px, 0px)' );
            } else { // Horizontal direction
              tdelta.x = tmove.touches[0].pageX - tclick.x;
              // $this.css('left', tinit_pos.left + tdelta.x); // Old way
              $this.css( '-webkit-transform', 'translate3d(' + ( tinit_pos + tdelta.x ) + 'px, 0px, 0px)' );
            }
            tmove_event.push( this_event ); // Add current event to history

          };

          // Handler for touchend event
          var touchend = function( tend ) {

            tend.preventDefault(); // Prevent default behavior
            // Unbind touch event listeners
            document.removeEventListener( 'touchmove', touchmove, false );
            document.removeEventListener( 'touchend', touchend, false );

            var date = new Date(); // Current timestamp

            var delta_start = tmove_event[0]; // First recorded touchmove event
            // If no touchmove events were recorded, use the touchend event as the start
            if ( !delta_start ) {
                delta_start = {
                    'time': date.getTime() - 1, // Assume a very short duration
                    'x': tend.changedTouches[0].pageX,
                    'y': tend.changedTouches[0].pageY
                };
            }

            // Get the last touchmove event for calculating speed
            var delta_end = tmove_event[tmove_event.length - 1];
            // If tmove_event is empty, use the touchend event itself
            if (!delta_end) {
                delta_end = {
                    'time': date.getTime(),
                    'x': tend.changedTouches[0].pageX,
                    'y': tend.changedTouches[0].pageY
                };
            }


            // Calculate movement delta and time delta
            var event_delta = {
              'time': ( delta_end.time - delta_start.time ),
              'x': ( delta_end.x - delta_start.x ),
              'y': ( delta_end.y - delta_start.y )
            };

            // Calculate speed (pixels per millisecond)
            var speed = {
              'x': event_delta.x / event_delta.time,
              'y': event_delta.y / event_delta.time
            };
            // alert('speed_x: ' + speed.x + '\nspeed_y: ' + speed.y);

            // Animate the list with inertia using Webkit transforms
            if ( settings.direction == 'vertical' ) {

              // Handle cases where speed might be NaN (e.g., very short/no movement)
              if ( isNaN( speed.y ) ) {
                speed.y = 2; // Default speed if calculation fails
              }
              // Apply CSS transitions for smooth animation
              $this.css( {
                '-webkit-transition-duration': Math.abs( speed.y * settings.inertia * 3 ) + 'ms',
                '-webkit-transition-timing-function': 'ease-out'
              } );

              var pos = tinit_pos + tdelta.y + speed.y * settings.inertia; // Calculate final position with inertia
              // Boundary checks
              if ( pos < ( ( -1 ) * properties.height * ( cells.pages - 1 ) ) ) {
                pos = ( -1 ) * properties.height * ( cells.pages - 1 );
              } else if ( pos > 0 ) {
                pos = 0;
              }

              // If pagination is enabled, snap to the nearest page
              if ( settings.pages ) {
                var snap_to_page = Math.round( ( -pos ) / properties.height );
                methods.go_to( snap_to_page + 1, 'inertia', true ); // Use Webkit transforms for page snap
              } else {
                // Otherwise, apply the inertia transform
                $this.css( '-webkit-transform', 'translate3d(0px, ' + pos + 'px, 0px)' );
                $this.data( 'ppos', pos ); // Store the new position
              }
            } else { // Horizontal direction
              // alert('init pos: ' + tinit_pos + '\ndelta x: ' + tdelta.x + '\nspeed: ' + speed.x);
              // Handle NaN speed
              if ( isNaN( speed.x ) ) {
                speed.x = 2;
              }

              // Apply CSS transitions for smooth animation
              $this.css( {
                '-webkit-transition-duration': Math.abs( speed.y * settings.inertia * 3 ) + 'ms', // Note: used speed.y here, should probably be speed.x
                '-webkit-transition-timing-function': 'ease-out'
              } );

              var pos = tinit_pos + tdelta.x + speed.x * settings.inertia; // Calculate final position with inertia
              // Boundary checks
              if ( pos < ( ( -1 ) * properties.width * ( cells.pages - 1 ) ) ) {
                pos = ( -1 ) * properties.width * ( cells.pages - 1 );
              } else if ( pos > 0 ) {
                pos = 0;
              }

              // If pagination is enabled, snap to the nearest page
              if ( settings.pages ) {
                var snap_to_page = Math.round( ( -pos ) / properties.width );
                methods.go_to( snap_to_page + 1, 'inertia', true );
              } else {

                $this.css( '-webkit-transform', 'translate3d(' + pos + 'px, 0px, 0px)' );
                $this.data( 'ppos', pos );
                // alert(pos);
              }

            }


          };


          // Add touchstart event listener to the element
          $this[0].addEventListener( 'touchstart', function( tstart ) {
            // alert('touchstart');
            // Disable mouse events when touch events are active
            $this.unbind( '.promptumenu' );

            // tstart.preventDefault(); // Prevent default behavior only if necessary, might block native scrolling

            $this.stop( true, false ); // Stop any ongoing animations
            // Reset Webkit transition duration for immediate response
            $this.css( {
              '-webkit-transition-duration': '0ms'
            } );

            var date = new Date(); // Current timestamp

            tinit_pos = $this.data( 'ppos' ); // Get initial position from data
            tclick = {
              'x': tstart.touches[0].pageX, // X coordinate of touch start
              'y': tstart.touches[0].pageY, // Y coordinate of touch start
              'time': date.getTime()        // Timestamp of touch start
            };
            tdelta = {
              'x': 0,                       // Reset delta X
              'y': 0                        // Reset delta Y
            };
            tmove_event = new Array();      // Clear touch move event history

            // Bind touchmove and touchend events
            document.addEventListener( 'touchmove', touchmove, false );
            document.addEventListener( 'touchend', touchend, false );
            document.addEventListener( 'touchcancel', touchend, false ); // Handle touch cancellations
          }, false );
        } catch ( error ) {
          // If the browser does not support touch events, this block will catch the error
          // and the plugin will proceed without touch functionality.
          // console.log('Touch events not supported or an error occurred:', error);
        }
        // --- End Touch Event Binding ---

      } // End of if/else for plugin initialization check

    } ); // End of this.each()

  }; // End of $.fn.promptumenu

} )( jQuery ); // Pass jQuery object to the immediately invoked function expression