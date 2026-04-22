/*
 * This file is part of the LEANORAMA jQuery Plugin.
 *
 * It provides the Control Bar Extension, enabling navigation
 * and interaction with panoramic images.
 *
 * Version: 0.2.0 (Stable Release)
 *
 * Copyright (c) 2013 Leandigo (http://www.leandigo.com).
 * All rights reserved. This software is proprietary.
 *
 * Please refer to the accompanying license agreement for terms of use.
 *
 */


// Begin definition of the Leanorama Control Bar Extension
$.fn
  .leanorama
  .extensions
    .push(
      function start()
      {
        // Declare variables for the main control bar container and the individual control elements.
        var $bar,
            $controls;


        // This internal function is responsible for creating and initializing the control bar.
        function create_controlbar()
        {
            // First, ensure any previous control bar instances are completely removed
            // from the current scope to prevent duplicates or conflicts.
            $( '.leanorama-controlbar', this.$scope )
              .remove();


            // Initialize the `$controls` object with all necessary buttons and their
            // respective configurations, including their display text and initial styling.
            $controls = {
                show:       div( { class: 'leanorama-controlbar-button' } ) .html( 'v' )
                            // Initially hidden, this button will show the control bar.
                            .css( 'display', 'none' )
                            .css( 'margin-left', '.5em' ),

                hide:       div( { class: 'leanorama-controlbar-button actionable' } ) .html( 'h' ), // Hides the control bar.

                delim:      div( { class: 'leanorama-controlbar-button' } ) .html( '|' ),  // A simple visual separator for buttons.

                zoomin:     div( { class: 'leanorama-controlbar-button actionable' } ) .html( '+' ),  // Increases the zoom level.

                zoomout:    div( { class: 'leanorama-controlbar-button actionable' } ) .html( '-' ),  // Decreases the zoom level.

                play:       div( { class: 'leanorama-controlbar-button actionable' } ) .html( 'p' ),  // Initiates automatic rotation.

                stop:       div( { class: 'leanorama-controlbar-button actionable' } ) .html( 's' ),  // Halts automatic rotation.

                up:         div( { class: 'leanorama-controlbar-button actionable' } ) .html( 'u' ),  // Pans the view upwards.

                down:       div( { class: 'leanorama-controlbar-button actionable' } ) .html( 'd' ),  // Pans the view downwards.

                left:       div( { class: 'leanorama-controlbar-button actionable' } ) .html( 'l' ),  // Pans the view to the left.

                right:      div( { class: 'leanorama-controlbar-button actionable' } ) .html( 'r' ),  // Pans the view to the right.

                touch:      div( { class: 'leanorama-controlbar-button actionable' } ) .html( 't' ),  // Activates touch-based control (disables gyroscope).

                gyro:       div( { class: 'leanorama-controlbar-button actionable' } ) .html( 'g' )    // Activates gyroscope control (disables touch).
            };


            // Based on the current autorotate status, either the 'Stop' or 'Play' button
            // will be initially visible. If autorotation is off (0), show 'Play'.
            if ( this.autorotate === 0 )
            {
                $controls.stop.css( 'display', 'none' ); // Hide the stop button if not rotating.
            }
            else
            {
                $controls.play.css( 'display', 'none' ); // Hide the play button if already rotating.
            }


            // Construct the main container for the control buttons.
            var $container = div( { class: 'leanorama-controlbar-controls' } )
                                 .append( $controls.hide )    // Add the 'hide' button.
                                 .append( $controls.delim );  // Add a delimiter after 'hide'.


            // Perform a check for device orientation API support.
            var canHandleOrientation; // This variable will store orientation event data if available.

            if ( window.DeviceOrientationEvent )
            {
                // If supported, attach an event listener to capture device orientation changes.
                window.addEventListener( "deviceorientation", handleOrientation, false );
            }


            // Internal function to process device orientation events.
            function handleOrientation( event )
            {
                canHandleOrientation = event; // Store the event object.
            }


            // Conditionally add gyroscope and touch controls if device orientation is supported.
            if ( canHandleOrientation )
            {
                $container
                    .append( $controls.touch ) // Add the touch control button.
                    .append( $controls.gyro ); // Add the gyro control button.

                // Determine which of the two (gyro/touch) should be initially hidden.
                if ( this.gyro )
                {
                    $controls.gyro.css( 'display', 'none' );  // Hide gyro if already active.
                }
                else
                {
                    $controls.touch.css( 'display', 'none' ); // Hide touch if gyro is active.
                }
            }


            // Append the remaining set of navigational and functional control buttons
            // to the main control bar container in a specific order.
            $container
                .append( $controls.zoomin )
                .append( $controls.zoomout )
                .append( $controls.left )
                .append( $controls.right )
                .append( $controls.up )
                .append( $controls.down )
                .append( $controls.play )
                .append( $controls.stop )
                .append( $controls.show );


            // Instantiate the main control bar element itself.
            $bar = div( { class: 'leanorama-controlbar' } );
            // It's crucial for the background layer to be a sibling, not a child,
            // of the controls container to prevent unwanted opacity inheritance.
            $bar.append( div( { class: 'leanorama-controlbar-bg' } ) );
            $bar.append( $container ); // Attach the previously assembled controls container.


            // Prepare the control bar for animation by initially hiding it,
            // then adding it to the DOM, and finally fading it into view.
            $bar.css( 'display', 'none' );
            this.$el.after( $bar );
            $bar.fadeIn( 'slow' ); // Smoothly reveal the control bar.


            /*
             * Section: Control Bar Event Bindings
             * ----------------------------------
             * This part of the code defines the event handlers for all interactive
             * elements within the control bar, linking them to core Leanorama functionalities.
             */

            // Bind a click event to the "hide control bar" button.
            $controls.hide.click(
                $.proxy(
                    function()
                    {
                        // When clicked, invoke the method to toggle the control bar's visibility.
                        this.toggle_controlbar();
                    },
                    this
                )
            );


            // Bind a click event handler for the "show control bar" button.
            $controls.show.click(
                $.proxy(
                    function()
                    {
                        // This also calls the toggle method, effectively showing the bar.
                        this.toggle_controlbar();
                    },
                    this
                )
            );


            // Establish the click event for the 'Start Autorotate' button.
            $controls.play.click(
                $.proxy(
                    function()
                    {
                        // Upon activation, switch the display to the 'stop' button.
                        show_stop();
                        // Then, initiate or resume the panoramic image rotation.
                        this.toggle_rotate();
                    },
                    this
                )
            );


            // Define the click behavior for the 'Stop Autorotate' button.
            $controls.stop.click(
                $.proxy(
                    function()
                    {
                        // When this button is pressed, show the 'play' button.
                        show_play();
                        // And halt the automatic rotation of the panorama.
                        this.toggle_rotate();
                    },
                    this
                )
            );


            // Override or augment the global keydown event listener.
            // Specifically, handle the Spacebar key for toggling autorotation.
            $( window ).bind(
                'keydown',
                $.proxy(
                    function( e )
                    {
                        // Check if the pressed key is the Spacebar (key code 32).
                        if ( e.originalEvent.which == 32 )
                        {
                            // Toggle the rotation state of the panorama.
                            this.toggle_rotate();

                            // Depending on the new autorotation state, simulate a click
                            // on either the 'play' or 'stop' button to update the UI.
                            if ( this.autorotate === 0 )
                                $controls.play.click();
                            else
                                $controls.stop.click();
                        }
                    },
                    this
                )
            );


            // Configure the click action for the 'Gyroscope Control' button.
            $controls.gyro.click(
                $.proxy(
                    function()
                    {
                        // Deactivate touch controls.
                        this.unbind_touch();
                        // Activate gyroscope-based control for the panorama.
                        this.bind_gyro();

                        // Adjust button visibility: hide the gyro button, show the touch button.
                        $controls.gyro.hide();
                        $controls.touch.fadeIn( 'fast' ); // Fade in the touch control option.
                    },
                    this
                )
            );


            // Set up the click handler for the 'Touch Control' button.
            $controls.touch.click(
                $.proxy(
                    function()
                    {
                        // Deactivate gyroscope controls.
                        this.unbind_gyro();
                        // Activate touch-based control for user interaction.
                        this.bind_touch();

                        // Adjust button visibility: hide the touch button, show the gyro button.
                        $controls.touch.hide();
                        $controls.gyro.fadeIn( 'fast' ); // Fade in the gyroscope control option.
                    },
                    this
                )
            );


            // Bind both touchstart and mousedown events for the 'Zoom In' button.
            $controls.zoomin.bind(
                'touchstart mousedown',
                $.proxy(
                    function()
                    {
                        // Start the scaling operation with a positive increment.
                        this.scale_start( 0.05 );
                    },
                    this
                )
            ).bind( // Bind touchend and mouseup to stop the scaling.
                'touchend mouseup',
                $.proxy(
                    function()
                    {
                        // Cease the continuous scaling action.
                        this.scale_stop();
                    },
                    this
                )
            );


            // Bind touchstart and mousedown events for the 'Zoom Out' functionality.
            $controls.zoomout.bind(
                'touchstart mousedown',
                $.proxy(
                    function()
                    {
                        // Initiate scaling with a negative value to zoom out.
                        this.scale_start( -0.05 );
                    },
                    this
                )
            ).bind( // Bind touchend and mouseup to stop the scaling process.
                'touchend mouseup',
                $.proxy(
                    function()
                    {
                        // Terminate the scaling operation.
                        this.scale_stop();
                    },
                    this
                )
            );


            // Set up event handlers for the 'Pan Left' button.
            $controls.left.bind(
                'touchstart mousedown',
                $.proxy(
                    function()
                    {
                        // Begin panning horizontally to the left.
                        this.pan_start( -0.7, 0 );
                        // Ensure the 'play' button is visible as panning is a manual interaction.
                        show_play();
                    },
                    this
                )
            ).bind( // Bind touchend and mouseup to stop the panning.
                'touchend mouseup',
                $.proxy(
                    function()
                    {
                        // Halt the panning movement.
                        this.pan_stop();
                    },
                    this
                )
            );


            // Set up event handlers for the 'Pan Right' button.
            $controls.right.bind(
                'touchstart mousedown',
                $.proxy(
                    function()
                    {
                        // Start panning horizontally to the right.
                        this.pan_start( 0.7, 0 );
                        // Display the 'play' button, indicating manual control.
                        show_play();
                    },
                    this
                )
            ).bind( // Bind touchend and mouseup to stop the panning.
                'touchend mouseup',
                $.proxy(
                    function()
                    {
                        // Stop the panning action.
                        this.pan_stop();
                    },
                    this
                )
            );


            // Set up event handlers for the 'Pan Up' button.
            $controls.up.bind(
                'touchstart mousedown',
                $.proxy(
                    function()
                    {
                        // Begin panning vertically upwards.
                        this.pan_start( 0, 0.7 );
                        // Show the 'play' button, indicating manual control.
                        show_play();
                    },
                    this
                )
            ).bind( // Bind touchend and mouseup to stop the panning.
                'touchend mouseup',
                $.proxy(
                    function()
                    {
                        // Halt the upward panning movement.
                        this.pan_stop();
                    },
                    this
                )
            );


            // Set up event handlers for the 'Pan Down' button.
            $controls.down.bind(
                'touchstart mousedown',
                $.proxy(
                    function()
                    {
                        // Start panning vertically downwards.
                        this.pan_start( 0, -0.7 );
                        // Display the 'play' button, indicating manual control.
                        show_play();
                    },
                    this
                )
            ).bind( // Bind touchend and mouseup to stop the panning.
                'touchend mouseup',
                $.proxy(
                    function()
                    {
                        // Stop the downward panning action.
                        this.pan_stop();
                    },
                    this
                )
            );
        } // End of create_controlbar function.


        // Expose a method to toggle the visibility and position of the control bar.
        this.toggle_controlbar = $.proxy(
            function()
            {
                // Proceed only if the control bar element actually exists in the DOM.
                if ( $bar.exists() )
                {
                    // Adjust the visibility of the 'show' control button based on the
                    // current 'left' CSS property of the control bar.
                    // If the bar is visible (left: 0px), fade in the 'show' button;
                    // otherwise, fade it out.
                    $bar.css( 'left' ) == '0px'
                      ? $controls.show.fadeIn( 'fast' )
                      : $controls.show.fadeOut( 'fast' );

                    // Animate the control bar's horizontal position to either hide it
                    // partially off-screen or bring it fully into view.
                    $bar.animate(
                        {
                            left: $bar.css( 'left' ) == '0px'
                                ? '-' + ( $bar.width() - $bar.height() ) // Move off-screen.
                                : '0'                                     // Bring fully on-screen.
                        }
                    );
                }
            },
            this
        );


        // Define a private function to gracefully remove the control bar from the display.
        function remove_controlbar()
        {
            // Only attempt removal if the control bar element is present.
            if ( $bar.exists() )
            {
                // If the control bar is currently visible, initiate a fade-out animation.
                // This ensures a smooth transition before the element is fully removed.
                $bar.fadeOut( 'slow' );

                // After the fade-out animation completes (or a short delay),
                // physically remove the control bar from the DOM.
                setTimeout(
                    function()
                    {
                        $bar.remove();
                    },
                    600
                );
            }
        }


        // Helper function to update button visibility: show 'Play', hide 'Stop'.
        function show_play()
        {
            $controls.stop.hide(); // Hide the stop button.
            $controls.play.show(); // Display the play button.
        }


        // Helper function to update button visibility: show 'Stop', hide 'Play'.
        function show_stop()
        {
            $controls.play.hide(); // Hide the play button.
            $controls.stop.show(); // Display the stop button.
        }


        // Bind internal events to update the UI based on autorotation state changes.
        // When autorotation stops, ensure the 'play' button is visible.
        this.$el.bind( this.EV_AUTOROTATE_STOPPED, show_play );

        // When autorotation starts, ensure the 'stop' button is visible.
        this.$el.bind( this.EV_AUTOROTATE_STARTED, show_stop );


        // Initialize the control bar extension when the Leanorama engine has fully started.
        this.$el.bind(
            this.EV_ENGINE_STARTED,
            $.proxy( create_controlbar, this )
        );


        /*
         * Internal Utility Functions
         * --------------------------
         * These functions simplify the creation of common HTML elements.
         */

        // Function to create a new DIV element with specified attributes.
        function div( attrs )
        {
            return $( document.createElement( 'div' ) ) .attr( attrs );
        }

        // Function to create a new SPAN element with specified attributes.
        function span( attrs )
        {
            return $( document.createElement( 'span' ) ) .attr( attrs );
        }


        // Extend jQuery's prototype with a utility function to check if a
        // jQuery object contains any elements.
        $.fn.exists = function()
        {
            return this.length > 0; // Returns true if elements are found, false otherwise.
        };

      } // End of the 'start' function.
    ); // End of $.fn.leanorama.extensions.push.