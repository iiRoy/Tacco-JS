chrome.extension.sendMessage( {}, ( messageData ) => {

  // Global object to manage player settings and controls
  var playbackManager = {
    preferences: {
      playbackRate: 1.0,         // Default speed factor
      rateIncrement: 0.1,        // Adjustment step for speed
      backwardJump: 10,          // Seconds to skip back
      reverseKey: 65,            // Key code for rewinding (A)
      decreaseRateKey: 83,       // Key code for slowing down (S)
      increaseRateKey: 68,       // Key code for speeding up (D)
      retainRate: false          // Should the speed be remembered?
    }
  };

  var pageLoadMonitor;

  // Retrieve stored configurations from browser storage
  chrome.storage.sync.get( playbackManager.preferences, ( savedOptions ) => {
      playbackManager.preferences.playbackRate = Number(savedOptions.playbackRate);
      playbackManager.preferences.rateIncrement = Number(savedOptions.rateIncrement);
      playbackManager.preferences.backwardJump = Number(savedOptions.backwardJump);
      playbackManager.preferences.reverseKey = Number(savedOptions.reverseKey);
      playbackManager.preferences.decreaseRateKey = Number(savedOptions.decreaseRateKey);
      playbackManager.preferences.increaseRateKey = Number(savedOptions.increaseRateKey);
      playbackManager.preferences.retainRate = Boolean(savedOptions.retainRate);

      // Begin periodic check for document readiness
      pageLoadMonitor = setInterval( setupMediaPlayback, 10 );
    }
  );


  // Function to initialize playback speed controls once the DOM is ready
  function setupMediaPlayback() {
    if ( document.readyState === 'complete' ) {
      clearInterval( pageLoadMonitor ); // Stop checking once ready

      // Constructor for managing individual video elements
      playbackManager.playerControls = function( mediaElement ) {
        this.media = mediaElement;

        // Reset speed if 'retainRate' is not enabled
        if ( !playbackManager.preferences.retainRate ) {
          playbackManager.preferences.playbackRate = 1.0;
        }

        this.configureInterface(); // Set up the control overlay

        // Ensure playback rate is applied when video starts playing
        mediaElement.addEventListener( 'play', function( actionEvt ) {
          mediaElement.playbackRate = playbackManager.preferences.playbackRate;
        } );

        // Update the displayed speed when the rate changes
        mediaElement.addEventListener( 'ratechange', function( actionEvt ) {
          var currentRateDisplay = this.retrieveCurrentRate();
          this.rateDisplayElement.textContent = currentRateDisplay;
        }.bind( this ) );

        // Apply the initial playback rate
        mediaElement.playbackRate = playbackManager.preferences.playbackRate;
      };


      // Method to get the formatted current playback rate
      playbackManager.playerControls.prototype.retrieveCurrentRate = function() {
        return parseFloat( this.media.playbackRate ).toFixed( 2 );
      };

      // Method to remove the control overlay
      playbackManager.playerControls.prototype.dispose = function() {
        this.parentElement.removeChild( this );
      };

      // Method to create and attach the playback control UI
      playbackManager.playerControls.prototype.configureInterface = function() {
        var docFragment = document.createDocumentFragment();
        var uiContainer = document.createElement( 'div' );
        var rateDisplay = document.createElement( 'span' );

        var buttonGroup = document.createElement( 'span' );
        var accelerateBtn = document.createElement( 'button' );
        var decelerateBtn = document.createElement( 'button' );
        var backBtn = document.createElement( 'button' );

        backBtn.innerHTML = '&laquo;'; // Left arrow for rewind
        accelerateBtn.textContent = '+';
        decelerateBtn.textContent = '-';

        buttonGroup.appendChild( backBtn );
        buttonGroup.appendChild( decelerateBtn );
        buttonGroup.appendChild( accelerateBtn );

        uiContainer.appendChild( rateDisplay );
        uiContainer.appendChild( buttonGroup );

        uiContainer.classList.add( 'pb-control-wrapper' );
        buttonGroup.classList.add( 'pb-action-buttons' );

        docFragment.appendChild( uiContainer );
        this.media.parentElement.insertBefore( docFragment, this.media );
        this.media.classList.add( 'pb-media-host' );

        // Initialize the displayed rate
        var initialRate = parseFloat( playbackManager.preferences.playbackRate ).toFixed( 2 );
        rateDisplay.textContent = initialRate;
        this.rateDisplayElement = rateDisplay; // Store reference to update later

        // Add click handlers for control buttons
        uiContainer.addEventListener( 'click', function( interactionEvt ) {
          if ( interactionEvt.target === decelerateBtn ) {
            performPlaybackAction( 'slow' );
          } else if ( interactionEvt.target === accelerateBtn ) {
            performPlaybackAction( 'fast' );
          } else if ( interactionEvt.target === backBtn ) {
            performPlaybackAction( 'rewind' );
          } else {
            // If click is not on a button, remove the controller
            uiContainer.nextSibling.classList.add( 'pb-cancelled' );
            uiContainer.remove();
          }

          interactionEvt.preventDefault();
          interactionEvt.stopPropagation();
        }, true );

        // Prevent full-screen activation on double-click
        uiContainer.addEventListener( 'dblclick', function( interactionEvt ) {
          interactionEvt.preventDefault();
          interactionEvt.stopPropagation();
        }, true );

        // Prevent full-screen activation on mouse down
        uiContainer.addEventListener( 'mousedown', function( interactionEvt ) {
          interactionEvt.preventDefault();
          interactionEvt.stopPropagation();
        }, true );
      };


      // Helper to adjust the playback rate of a video element
      function adjustPlaybackRate( player, newRate ) {
        player.playbackRate = newRate;
        playbackManager.preferences.playbackRate = newRate;
        chrome.storage.sync.set( { 'playbackRate': newRate } );
      }

      // Executes a specified playback action (rewind, faster, slower)
      function performPlaybackAction( command ) {
        var mediaElements = document.getElementsByTagName( 'video' );
        // Ensure forEach can be used on HTMLCollection
        mediaElements.forEach = Array.prototype.forEach;

        mediaElements.forEach( function( player ) {
          // Only modify playing videos that haven't been cancelled
          if ( !player.paused && !player.classList.contains( 'pb-cancelled' ) ) {
            if ( command === 'rewind' ) {
              player.currentTime -= playbackManager.preferences.backwardJump;
            } else if ( command === 'fast' ) {
              // Chromium's maximum playback speed is 16x
              var increasedRate = Math.min( player.playbackRate + playbackManager.preferences.rateIncrement, 16 );
              adjustPlaybackRate( player, increasedRate );
            } else if ( command === 'slow' ) {
              // Audio typically cuts out below 0.05x
              var decreasedRate = Math.max( player.playbackRate - playbackManager.preferences.rateIncrement, 0 );
              adjustPlaybackRate( player, decreasedRate );
            }
          }
        } );
      }

      // Global keyboard event listener for hotkeys
      document.addEventListener( 'keypress', function( keyEvt ) {
        // Convert key code to uppercase for consistent checking
        var keyIdentifier = String.fromCharCode( keyEvt.keyCode ).toUpperCase().charCodeAt();

        // Ignore key presses if user is typing in a text input field
        if ( document.activeElement.nodeName === 'INPUT' && document.activeElement.getAttribute( 'type' ) === 'text' ) {
          return false;
        }

        if ( keyIdentifier == playbackManager.preferences.reverseKey ) {
          performPlaybackAction( 'rewind' );
        } else if ( keyIdentifier == playbackManager.preferences.increaseRateKey ) {
          performPlaybackAction( 'fast' );
        } else if ( keyIdentifier == playbackManager.preferences.decreaseRateKey ) {
          performPlaybackAction( 'slow' );
        }

        return false; // Prevent default browser action
      }, true );

      // Listener for newly inserted DOM nodes, to detect new videos
      document.addEventListener( 'DOMNodeInserted', function( insertEvt ) {
        var insertedNode = insertEvt.target || null;
        if ( insertedNode && insertedNode.nodeName === 'VIDEO' ) {
          new playbackManager.playerControls( insertedNode );
        }
      } );

      // Initialize controls for any videos present on page load
      var mediaElements = document.getElementsByTagName( 'video' );
      mediaElements.forEach = Array.prototype.forEach; // Enable forEach on HTMLCollection
      mediaElements.forEach( function( currentVideo ) {
        new playbackManager.playerControls( currentVideo );
      } );
    }
  }
} );