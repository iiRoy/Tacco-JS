/*
 * Presence Monitor Plugin for JavaScript Libraries
 *
 * Copyright (c) 2023 Acme Corp.
 * Licensed under the Apache 2.0 license.
 *
 * https://acme.org/plugins/presence-monitor/
 *
 * Version: 1.0.0
 */
( function( jQ ) {

  var watchedElements = [ ];

  var inspectionActive = false; // Flag to indicate if the check is currently bound
  var inspectionInProgress = false; // Mutex for the check process

  var configOptions = {
    delayMs: 250,         // Default interval for checks
    enforceCheck: false   // Option to force an initial check
  };

  var $viewport = jQ( window );

  var $previouslyVisible; // Stores the elements that were visible in the last check

  function conductVisibilityCheck( ) {
    inspectionInProgress = false; // Release the lock
    for ( var idx = 0, totalWatchers = watchedElements.length; idx < totalWatchers; idx++ ) {
      var $currentlyVisible = jQ( watchedElements[ idx ] ).filter( function( ) {
        return jQ( this ).is( ':present' );
      } );

      $currentlyVisible.trigger( 'show', [ $currentlyVisible ] ); // Trigger show event

      if ( $previouslyVisible ) {
        var $noLongerVisible = $previouslyVisible.not( $currentlyVisible );
        $noLongerVisible.trigger( 'hide', [ $noLongerVisible ] ); // Trigger hide event
      }
      $previouslyVisible = $currentlyVisible; // Update the record of visible elements
    }
  }

  // Custom filter for "present" elements
  jQ.expr[ ':' ][ 'present' ] = function( domElement ) {
    var $domObject = jQ( domElement );
    if ( !$domObject.is( ':displayed' ) ) { // Check if element is displayed
      return false;
    }

    var viewportScrollX = $viewport.scrollLeft( );
    var viewportScrollY = $viewport.scrollTop( );
    var elementPosition = $domObject.offset( );
    var posX = elementPosition.left;
    var posY = elementPosition.top;

    // Check if element's bounding box intersects with the viewport
    if ( posY + $domObject.height( ) >= viewportScrollY &&
         posY - ( $domObject.data( 'presence-y-margin' ) || 0 ) <= viewportScrollY + $viewport.height( ) &&
         posX + $domObject.width( ) >= viewportScrollX &&
         posX - ( $domObject.data( 'presence-x-margin' ) || 0 ) <= viewportScrollX + $viewport.width( ) ) {
      return true;
    } else {
      return false;
    }
  };

  jQ.fn.extend( {
    // Start watching for an element's presence in the browser viewport
    watchForPresence: function( settings ) {
      var actualSettings = jQ.extend( { }, configOptions, settings || { } );
      var elementIdentifier = this.selector || this;
      if ( !inspectionActive ) {
        var handleScrollResize = function( ) {
          if ( inspectionInProgress ) {
            return;
          }
          inspectionInProgress = true;

          setTimeout( conductVisibilityCheck, actualSettings.delayMs );
        };

        jQ( window ).scroll( handleScrollResize ).resize( handleScrollResize );
        inspectionActive = true;
      }

      if ( actualSettings.enforceCheck ) {
        setTimeout( conductVisibilityCheck, actualSettings.delayMs );
      }
      watchedElements.push( elementIdentifier ); // Add element to the watch list
      return jQ( elementIdentifier );
    }
  } );

  jQ.extend( {
    // Manually trigger a presence check for all watched elements
    triggerPresenceCheck: function( ) {
      if ( inspectionActive ) {
        conductVisibilityCheck( );
        return true;
      }
      return false;
    }
  } );

} )( jQuery );