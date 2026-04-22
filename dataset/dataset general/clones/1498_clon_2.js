/*
 *  VIEWPORT WIDGET - jQuery Component for interacting with panoramic views.
 *  Interactive Overlay Module - provides navigation and command interface for panorama objects.
 *
 *  Version 1.0.0
 *  -------------
 *  Copyright 2024 GlobalView Solutions. All rights reserved.
 *  Usage subject to licensing terms.
 *
 */

$.fn.leanorama.extensions.push( function initializePanel() {
  // Declare the primary panel and its interactive components
  let $controlPanel, $actionElements;

  // Function to construct the user interface elements
  function assembleInterface() {
    // Remove any previously existing instance of the interface panel
    $( ".leanorama-controlbar", this.$scope ).remove();

    // Instantiate the interactive element objects
    $actionElements = {
      view:        createDivElement( { class: "leanorama-controlbar-button" } ).html( "v" ) // Show panel
                     .css( "display", "none" )
                     .css( "margin-left", ".5em" ),
      conceal:     createDivElement( { class: "leanorama-controlbar-button actionable" } ).html( "h" ), // Hide panel
      separator:   createDivElement( { class: "leanorama-controlbar-button" } ).html( "|" ), // Element divider
      magnify:     createDivElement( { class: "leanorama-controlbar-button actionable" } ).html( "+" ), // Zoom in view
      minify:      createDivElement( { class: "leanorama-controlbar-button actionable" } ).html( "-" ), // Zoom out view
      beginRotation: createDivElement( { class: "leanorama-controlbar-button actionable" } ).html( "p" ), // Start auto-rotation
      haltRotation:  createDivElement( { class: "leanorama-controlbar-button actionable" } ).html( "s" ), // Stop auto-rotation
      lookUp:      createDivElement( { class: "leanorama-controlbar-button actionable" } ).html( "u" ), // Pan upwards
      lookDown:    createDivElement( { class: "leanorama-controlbar-button actionable" } ).html( "d" ), // Pan downwards
      moveLeft:    createDivElement( { class: "leanorama-controlbar-button actionable" } ).html( "l" ), // Pan left
      moveRight:   createDivElement( { class: "leanorama-controlbar-button actionable" } ).html( "r" ), // Pan right
      manualControl: createDivElement( { class: "leanorama-controlbar-button actionable" } ).html( "t" ), // Touch-based control
      motionControl: createDivElement( { class: "leanorama-controlbar-button actionable" } ).html( "g" ) // Device motion control
    };

    // Check the auto-rotation status. If active, show 'Stop', otherwise 'Play'.
    if ( this.autorotate === 0 ) {
      $actionElements.haltRotation.css( "display", "none" );
    } else {
      $actionElements.beginRotation.css( "display", "none" );
    }

    // Create the container for controls and append all command buttons
    const $buttonContainer = createDivElement( { class: "leanorama-controlbar-controls" } )
                     .append( $actionElements.conceal )
                     .append( $actionElements.separator );

    // Verify support for device orientation to enable motion control
    let orientationSupported;
    if ( window.DeviceOrientationEvent ) {
      window.addEventListener( "deviceorientation", processDeviceMotion, false );
    }

    function processDeviceMotion( orientationEvent ) {
      orientationSupported = orientationEvent; // Will hold event data or be null
    }

    // Add motion/manual controls if the device supports orientation events
    if ( orientationSupported ) {
      $buttonContainer.append( $actionElements.manualControl )
                      .append( $actionElements.motionControl );
      if ( this.gyro ) {
        $actionElements.motionControl.css( "display", "none" );
      } else {
        $actionElements.manualControl.css( "display", "none" );
      }
    }

    $buttonContainer.append( $actionElements.magnify )
                  .append( $actionElements.minify )
                  .append( $actionElements.moveLeft )
                  .append( $actionElements.moveRight )
                  .append( $actionElements.lookUp )
                  .append( $actionElements.lookDown )
                  .append( $actionElements.beginRotation )
                  .append( $actionElements.haltRotation )
                  .append( $actionElements.view );

    // Build the main control panel element
    $controlPanel = createDivElement( { class: "leanorama-controlbar" } );
    // The background layer should be a sibling to the controls to prevent opacity inheritance
    $controlPanel.append( createDivElement( { class: "leanorama-controlbar-bg" } ) );
    $controlPanel.append( $buttonContainer );

    // Introduce the control panel to the page with an animation
    $controlPanel.css( "display", "none" );
    this.$el.after( $controlPanel );
    $controlPanel.fadeIn( "slow" );

    /* Event hookups for the control panel */

    // Connect the "hide panel" button
    $actionElements.conceal.click( $.proxy( function() {
      this.toggleDisplayPanel();
    }, this ) );

    // Connect the "show panel" button
    $actionElements.view.click( $.proxy( function() {
      this.toggleDisplayPanel();
    }, this ) );

    // Connect the Start Auto-rotation button
    $actionElements.beginRotation.click( $.proxy( function() {
      displayStopButton();
      this.toggle_rotate();
    }, this ) );

    // Connect the Stop Auto-rotation button
    $actionElements.haltRotation.click( $.proxy( function() {
      displayPlayButton();
      this.toggle_rotate();
    }, this ) );

    // Modify the global keydown binding for Spacebar to include panel auto-rotation toggle
    $( window ).bind( "keydown", $.proxy( function( keyEvent ) {
      if ( keyEvent.originalEvent.which == 32 ) {
        this.toggle_rotate();
        if ( this.autorotate === 0 ) $actionElements.beginRotation.click();
        else $actionElements.haltRotation.click();
      }
    }, this ) );

    // Connect the Motion Control button
    $actionElements.motionControl.click( $.proxy( function() {
      // Activate Gyro control
      this.unbind_touch();
      this.bind_gyro();

      // Conceal Gyro button and reveal Touch button
      $actionElements.motionControl.hide();
      $actionElements.manualControl.fadeIn( "fast" );
    }, this ) );

    // Connect the Manual Control button
    $actionElements.manualControl.click( $.proxy( function() {
      // Activate Touch control
      this.unbind_gyro();
      this.bind_touch();

      // Conceal Touch button and reveal Gyro button
      $actionElements.manualControl.hide();
      $actionElements.motionControl.fadeIn( "fast" );
    }, this ) );

    // Connect the Magnify button
    $actionElements.magnify.bind( "touchstart mousedown", $.proxy( function() {
      this.scale_start( 0.05 );
    }, this ) ).bind( "touchend mouseup", $.proxy( function() {
      this.scale_stop();
    }, this ) );

    // Connect the Minify button
    $actionElements.minify.bind( "touchstart mousedown", $.proxy( function() {
      this.scale_start( -0.05 );
    }, this ) ).bind( "touchend mouseup", $.proxy( function() {
      this.scale_stop();
    }, this ) );

    // Connect the Move Left button
    $actionElements.moveLeft.bind( "touchstart mousedown", $.proxy( function() {
      this.pan_start( -0.7, 0 );
      displayPlayButton();
    }, this ) ).bind( "touchend mouseup", $.proxy( function() {
      this.pan_stop();
    }, this ) );

    // Connect the Move Right button
    $actionElements.moveRight.bind( "touchstart mousedown", $.proxy( function() {
      this.pan_start( 0.7, 0 );
      displayPlayButton();
    }, this ) ).bind( "touchend mouseup", $.proxy( function() {
      this.pan_stop();
    }, this ) );

    // Connect the Look Up button
    $actionElements.lookUp.bind( "touchstart mousedown", $.proxy( function() {
      this.pan_start( 0, 0.7 );
      displayPlayButton();
    }, this ) ).bind( "touchend mouseup", $.proxy( function() {
      this.pan_stop();
    }, this ) );

    // Connect the Look Down button
    $actionElements.lookDown.bind( "touchstart mousedown", $.proxy( function() {
      this.pan_start( 0, -0.7 );
      displayPlayButton();
    }, this ) ).bind( "touchend mouseup", $.proxy( function() {
      this.pan_stop();
    }, this ) );
  }

  // Method to show/hide the control panel
  this.toggleDisplayPanel = $.proxy( function() {
    // Ensure the control panel exists
    if ( $controlPanel.itemPresent() ) {
      $controlPanel.css( "left" ) == "0px" ? $actionElements.view.fadeIn( "fast" ) : $actionElements.view.fadeOut( "fast" );

      // Hide / Show the control panel
      $controlPanel.animate( {
        left: $controlPanel.css( "left" ) == "0px" ? "-" + ( $controlPanel.width() - $controlPanel.height() ) : "0"
      } );
    }
  }, this );

  // Function to remove the interface panel object
  function dismantleInterface() {
    if ( $controlPanel.itemPresent() ) {
      // In case the panel is visible (e.g., after viewpoint change)
      $controlPanel.fadeOut( "slow" );
      setTimeout( function() {
        $controlPanel.remove();
      }, 600 );
    }
  }

  function displayPlayButton() {
    $actionElements.haltRotation.hide();
    $actionElements.beginRotation.show();
  }

  function displayStopButton() {
    $actionElements.beginRotation.hide();
    $actionElements.haltRotation.show();
  }

  // React to the auto-rotation state change events
  this.$el.bind( this.EV_AUTOROTATE_STOPPED, displayPlayButton );
  this.$el.bind( this.EV_AUTOROTATE_STARTED, displayStopButton );

  // Initialize the module upon engine startup
  this.$el.bind( this.EV_ENGINE_STARTED, $.proxy( assembleInterface, this ) );

  // Utility functions
  // Generate a DIV HTML element
  function createDivElement( attributes ) {
    return $( document.createElement( "div" ) ).attr( attributes );
  }
  // Generate a SPAN HTML element
  function createSpanElement( attributes ) {
    return $( document.createElement( "span" ) ).attr( attributes );
  }

  // Extend jQuery prototype with a new method
  $.fn.itemPresent = function() {
    return this.length > 0;
  };
} );