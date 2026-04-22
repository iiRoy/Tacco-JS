/*
 * This is a Type I code clone generated from an original JavaScript source.
 * The primary goal is to maintain exact logical and structural identity
 * while introducing extensive variations in whitespace and comments.
 *
 * This file implements a video speed controller for web browsers.
 * It uses Chrome extension APIs for storage and message passing.
 */
chrome . extension . sendMessage ( { } ,
  function ( response ) {

    // Define the core configuration object 'tc' (stands for 'Time Controller' or 'Type Clone' as per current context).
    var tc = {
      settings : {
        speed : 1.0 ,         // Initial playback speed, set to 1x (normal speed).
        speedStep : 0.1 ,     // Incremental step for speed adjustments (e.g., 0.1x).
        rewindTime : 10 ,     // Time in seconds to rewind video (e.g., 10 seconds).
        rewindKeyCode : 65 ,  // Keyboard key code for rewind action (e.g., 'A' key).
        slowerKeyCode : 83 ,  // Keyboard key code for slower speed action (e.g., 'S' key).
        fasterKeyCode : 68 ,  // Keyboard key code for faster speed action (e.g., 'D' key).
        rememberSpeed : false // Flag to remember the last set speed across sessions.
      }
    } ; // End of tc object definition.

    /*
     * Declare a variable to hold the interval ID for checking document readiness.
     * This interval will be cleared once the document is fully loaded.
     */
    var readyStateCheckInterval ;

    // Retrieve user settings from Chrome's synchronized storage.
    chrome . storage . sync . get ( tc . settings ,
      function ( storage ) {
        // Update the 'tc.settings' object with values retrieved from storage.
        // Ensure values are correctly typed as Numbers or Booleans.
        tc . settings . speed = Number ( storage . speed ) ;
        tc . settings . speedStep = Number ( storage . speedStep ) ;
        tc . settings . rewindTime = Number ( storage . rewindTime ) ;
        tc . settings . rewindKeyCode = Number ( storage . rewindKeyCode ) ;
        tc . settings . slowerKeyCode = Number ( storage . slowerKeyCode ) ;
        tc . settings . fasterKeyCode = Number ( storage . fasterKeyCode ) ;
        tc . settings . rememberSpeed = Boolean ( storage . rememberSpeed ) ;

        // Once settings are loaded, start checking for the document's ready state.
        readyStateCheckInterval = setInterval ( initializeVideoSpeed , 10 ) ;
      } // End of storage.sync.get callback function.
    ) ; // End of chrome.storage.sync.get call.

    /**
     * Initializes the video speed control functionality once the document is fully loaded.
     * This function is called repeatedly by `setInterval` until `document.readyState` is 'complete'.
     */
    function initializeVideoSpeed ( ) {

      if ( document . readyState === 'complete' ) {
        // Clear the interval as the document is now ready.
        clearInterval ( readyStateCheckInterval ) ;

        /*
         * Constructor for the video controller object.
         * Manages individual video elements.
         * @param {HTMLVideoElement} target - The video element to control.
         */
        tc . videoController = function ( target ) {
          this . video = target ; // Store a reference to the video element.

          // If 'rememberSpeed' is false, reset speed to default 1.0.
          if ( ! tc . settings . rememberSpeed ) {
            tc . settings . speed = 1.0 ;
          }

          this . initializeControls ( ) ; // Set up the UI controls for this video.

          // Add an event listener for when the video starts playing.
          target . addEventListener ( 'play' , function ( event ) {
            target . playbackRate = tc . settings . speed ; // Apply the stored speed.
          } ) ; // End of 'play' event listener.

          // Add an event listener for when the playback rate changes.
          target . addEventListener ( 'ratechange' , function ( event ) {
            var speed = this . getSpeed ( ) ; // Get the current speed formatted.
            this . speedIndicator . textContent = speed ; // Update the displayed speed.
          } . bind ( this ) ) ; // Bind 'this' to the videoController instance.

          // Set the initial playback rate of the video.
          target . playbackRate = tc . settings . speed ;
        } ; // End of tc.videoController constructor.

        /*
         * Prototype method to get the current playback speed of the video, formatted to two decimal places.
         * @returns {string} The formatted speed.
         */
        tc . videoController . prototype . getSpeed = function ( ) {
          return parseFloat ( this . video . playbackRate ) . toFixed ( 2 ) ;
        } ; // End of getSpeed method.

        /*
         * Prototype method to remove the video controller's UI elements from the DOM.
         */
        tc . videoController . prototype . remove = function ( ) {
          // Assuming `this` refers to the container element of the controls.
          this . parentElement . removeChild ( this ) ;
        } ; // End of remove method.

        /*
         * Prototype method to initialize and append the video control UI elements to the DOM.
         */
        tc . videoController . prototype . initializeControls = function ( ) {
          var fragment = document . createDocumentFragment ( ) ; // Create a document fragment for efficient DOM manipulation.
          var container = document . createElement ( 'div' ) ; // Main container for all controls.
          var speedIndicator = document . createElement ( 'span' ) ; // Displays the current speed.

          var controls = document . createElement ( 'span' ) ; // Container for control buttons.
          var fasterButton = document . createElement ( 'button' ) ; // Button to increase speed.
          var slowerButton = document . createElement ( 'button' ) ; // Button to decrease speed.
          var rewindButton = document . createElement ( 'button' ) ; // Button to rewind.

          // Set content for the control buttons.
          rewindButton . innerHTML = '&laquo;' ;
          fasterButton . textContent = '+' ;
          slowerButton . textContent = '-' ;

          // Append buttons to the 'controls' span.
          controls . appendChild ( rewindButton ) ;
          controls . appendChild ( slowerButton ) ;
          controls . appendChild ( fasterButton ) ;

          // Append speed indicator and controls to the main container.
          container . appendChild ( speedIndicator ) ;
          container . appendChild ( controls ) ;

          // Add CSS classes for styling.
          container . classList . add ( 'tc-videoController' ) ;
          controls . classList . add ( 'tc-controls' ) ;

          // Append the container to the document fragment.
          fragment . appendChild ( container ) ;

          // Insert the controls into the DOM before the video element.
          this . video . parentElement . insertBefore ( fragment , this . video ) ;

          // Add a class to the video itself for potential styling or identification.
          this . video . classList . add ( 'tc-videoHost' ) ;

          // Set and display the initial speed.
          var speed = parseFloat ( tc . settings . speed ) . toFixed ( 2 ) ;
          speedIndicator . textContent = speed ;
          this . speedIndicator = speedIndicator ; // Store a reference to the speed indicator.

          /*
           * Add a click event listener to the main container for handling button clicks.
           * This uses event delegation.
           */
          container . addEventListener ( 'click' , function ( e ) {
            if ( e . target === slowerButton ) {
              runAction ( 'slower' ) ; // Execute 'slower' action.
            } else if ( e . target === fasterButton ) {
              runAction ( 'faster' ) ; // Execute 'faster' action.
            } else if ( e . target === rewindButton ) {
              runAction ( 'rewind' ) ; // Execute 'rewind' action.
            } else {
              // If clicked anywhere else within the container, remove controls.
              container . nextSibling . classList . add ( 'vc-cancelled' ) ;
              container . remove ( ) ;
            }

            e . preventDefault ( ) ; // Prevent default browser action (e.g., button click behavior).
            e . stopPropagation ( ) ; // Stop event propagation up the DOM tree.
          } , true ) ; // Use capturing phase for event.

          // Prevent full-screen mode on YouTube by intercepting double-clicks.
          container . addEventListener ( 'dblclick' , function ( e ) {
            e . preventDefault ( ) ;
            e . stopPropagation ( ) ;
          } , true ) ;

          // Prevent full-screen mode on Vimeo by intercepting mousedown events.
          container . addEventListener ( 'mousedown' , function ( e ) {
            e . preventDefault ( ) ;
            e . stopPropagation ( ) ;
          } , true ) ;
        } ; // End of initializeControls method.

        /*
         * Sets the playback speed for a given video element and updates stored settings.
         * @param {HTMLVideoElement} v - The video element.
         * @param {number} speed - The new playback speed.
         */
        function setSpeed ( v , speed ) {
          v . playbackRate = speed ; // Apply the speed to the video.
          tc . settings . speed = speed ; // Update the speed in our settings object.
          chrome . storage . sync . set ( { 'speed' : speed } ) ; // Persist the speed to Chrome storage.
        } // End of setSpeed function.

        /*
         * Executes a specific action (rewind, faster, slower) on all active video elements.
         * @param {string} action - The action to perform ('rewind', 'faster', 'slower').
         */
        function runAction ( action ) {
          var videoTags = document . getElementsByTagName ( 'video' ) ; // Get all video elements on the page.
          videoTags . forEach = Array . prototype . forEach ; // Borrow Array's forEach method for HTMLCollection.

          videoTags . forEach ( function ( v ) {
            // Only apply action if video is not paused and controls are not cancelled.
            if ( ! v . paused && ! v . classList . contains ( 'vc-cancelled' ) ) {
              if ( action === 'rewind' ) {
                v . currentTime -= tc . settings . rewindTime ; // Rewind the video.
              } else if ( action === 'faster' ) {
                // Chromium's max playback speed is 16.
                // Reference: https://code.google.com/p/chromium/codesearch#chromium/src/media/blink/webmediaplayer_impl.cc&l=64
                var s = Math . min ( v . playbackRate + tc . settings . speedStep , 16 ) ;
                setSpeed ( v , s ) ; // Increase speed, capped at 16.
              } else if ( action === 'slower' ) {
                // Audio playback is cut off at 0.05 in Chromium.
                // Reference: https://code.google.com/p/chromium/codesearch#chromium/src/media/filters/audio_renderer_algorithm.cc&l=49
                var s = Math . max ( v . playbackRate - tc . settings . speedStep , 0 ) ;
                setSpeed ( v , s ) ; // Decrease speed, floored at 0.
              }
            }
          } ) ; // End of videoTags.forEach.
        } // End of runAction function.

        /*
         * Global keypress event listener to handle speed adjustments via keyboard shortcuts.
         */
        document . addEventListener ( 'keypress' , function ( event ) {
          // Convert key code to uppercase to handle both cases (e.g., 'a' and 'A').
          var keyCode = String . fromCharCode ( event . keyCode ) . toUpperCase ( ) . charCodeAt ( ) ;

          // Ignore keypress events if the user is typing in a text input field.
          if ( document . activeElement . nodeName === 'INPUT' && document . activeElement . getAttribute ( 'type' ) === 'text' ) {
            return false ; // Do not process keypress.
          }

          // Check if the pressed key matches any of our defined action key codes.
          if ( keyCode == tc . settings . rewindKeyCode ) {
            runAction ( 'rewind' ) ;
          } else if ( keyCode == tc . settings . fasterKeyCode ) {
            runAction ( 'faster' ) ;
          } else if ( keyCode == tc . settings . slowerKeyCode ) {
            runAction ( 'slower' ) ;
          }

          return false ; // Prevent default browser actions for these keypresses.
        } , true ) ; // Use capturing phase.

        /*
         * Event listener for dynamically inserted DOM nodes.
         * This ensures that controls are added to videos that load after the initial page load.
         */
        document . addEventListener ( 'DOMNodeInserted' , function ( event ) {
          var node = event . target || null ; // Get the inserted node.
          // If the inserted node is a video element, create a new controller for it.
          if ( node && node . nodeName === 'VIDEO' ) {
            new tc . videoController ( node ) ;
          }
        } ) ; // End of DOMNodeInserted listener.

        // Initial scan for existing video elements when the page first loads.
        var videoTags = document . getElementsByTagName ( 'video' ) ;
        videoTags . forEach = Array . prototype . forEach ; // Enable forEach on HTMLCollection.
        videoTags . forEach ( function ( video ) {
          var control = new tc . videoController ( video ) ; // Create a controller for each existing video.
        } ) ; // End of initial videoTags.forEach.
      } // End of if (document.readyState === 'complete').
    } // End of initializeVideoSpeed function.
  } // End of chrome.extension.sendMessage callback function.
) ; // End of chrome.extension.sendMessage call.

// End of Type I clone.