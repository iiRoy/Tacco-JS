/*

 This is a Type I clone of the original jQuery Runloop Plugin code.

 Version: 1.0.3
 Copyright (c) 2011, Faruk Ates

 This software is provided under a dual license (MIT or BSD).
 For full license details, please refer to the original source.

 The core concept of this plugin is attributed to Ben Nadel.
 Reference: http://j.mp/ben-nadel-concept

 Further documentation on usage and features can be found at:
 https://github.com/KuraFire/runloop/blob/master/documentation.md

*/
( function ( $ ) {

  $.runloop = function ( settings ) {

    // Internal configuration object.
    // Some properties can be extended or overridden via the 'settings' parameter.
    var config = {

      // Defines the type of rounding for each step calculation.
      // Valid values are 'floor' (default) or 'round'.
      // This is crucial for determining how each 5% or 10% interval is rounded.
      'roundType': 'floor',

      // The base interval for keyframe steps.
      // A base of 5 is used (and generally recommended) for loops 500ms and longer.
      // For durations less than 500ms, the base will automatically switch to 10.
      'base': 5
    };

    // If custom settings are provided, merge them with the default configuration.
    if ( settings ) {
      $.extend( config, settings );
    }

    // Plugin version constant.
    var version = "1.0.3",

    // A hidden, temporary DOM element used internally by jQuery's animation engine.
    // We animate its 'top' property from 0 to 100 to simulate progress.
    runloop = document.createElement( 'div' ),

    // A hash map to store all registered callback functions (keyframes).
    // Keys are in the format "atXX" where XX is the percentage.
    map = {},

    // A log to keep track of keyframes that have already been executed.
    // This prevents a single keyframe from being triggered multiple times
    // during a single play session, especially after pauses/resumes.
    execLog = {},

    // Internal variables to manage the state of the runloop.
    // `currentDuration` stores the total duration of the current animation cycle.
    currentDuration = false,

    // `remainingDuration` holds the time left if the runloop was paused.
    remainingDuration = false,

    // `currentStep` tracks the current percentage progress of the animation (0-100).
    currentStep = 0,

    // The main object that will be returned, exposing public methods.
    r,

    // Private helper function to standardize keyframe identifiers.
    // Takes a percentage (e.g., "10%", 10) and converts it to "at10".
    makeAt = function ( at ) {
      // Extract numeric part using regex, then parse as integer.
      var val = parseInt( at.toString().match( /[0-9]+/g ), 0 );

      // If parsing results in NaN, return false; otherwise, prepend "at".
      return isNaN( val ) ? false : "at" + val;
    };


    // Public interface of the Runloop plugin.
    return r = {

      // Boolean flag indicating if the runloop is currently active/playing.
      isPlaying: false,


      // Method to register a new keyframe callback.
      // `atPercentage`: The percentage point (e.g., 25, "50%") where the function should execute.
      // `func`: The JavaScript function to be executed at that percentage.
      addKey: function ( atPercentage, func ) {
        var at = makeAt( atPercentage ); // Standardize the keyframe identifier.

        // Only proceed if 'at' is a valid identifier.
        if ( at ) {
          var oldAt = map[ at ]; // Store existing function if any.

          // If no function is currently mapped to this keyframe, assign the new one directly.
          if ( typeof map[ at ] != 'function' ) {
            map[ at ] = func;
          }
          // If a function already exists, create a wrapper function.
          // This wrapper will execute the old function first, then the new one.
          else {
            map[ at ] = function () {
              if ( oldAt ) {
                oldAt(); // Execute previously assigned function.
              }
              func(); // Execute the newly added function.
            };
          }
        }
      },


      // Removes a previously registered keyframe.
      // `atPercentage`: The percentage point of the keyframe to remove.
      removeKey: function ( atPercentage ) {
        var at = makeAt( atPercentage ); // Standardize keyframe identifier.

        if ( at ) {
          delete map[ at ]; // Remove the keyframe from the map.
        }
      },


      // Adds multiple keyframe-function associations from a given map object.
      // `newMap`: An object where keys are percentages (e.g., "25%") and values are functions.
      addMap: function ( newMap ) {

        // Iterate over each property in the provided newMap.
        for ( var key in newMap ) {

          // Validate the key to ensure it's a legitimate keyframe percentage.
          at = makeAt( key );

          // If both the keyframe identifier is valid AND the value is a function,
          // then add it to the internal runloop map using `addKey`.
          if ( at && typeof newMap[ key ] == "function" ) {
            this.addKey( at, newMap[ key ] );
          }

        }
      },


      // Retrieves the current internal keyframe map for inspection.
      getMap: function () {
        return map; // Returns the 'map' object directly.
      },


      // Resets the runloop to its initial state (0% progress).
      reset: function () {

        // Reset internal state variables.
        currentDuration = false;
        remainingDuration = false;
        currentStep = 0;
        execLog = {}; // Clear the execution log.

        // Explicitly set the internal animation element's 'top' property back to 0.
        $( runloop ).css( { 'top': 0 } );
      },


      // Pauses the runloop at its current animation interval.
      //
      //                             IMPORTANT WARNING !!
      // This method only pauses the *internal* runloop animation.
      // It will NOT pause any external animations or asynchronous operations
      // that might have been triggered by keyframe functions!
      //
      pause: function () {

        r.isPlaying = false; // Set the playing flag to false.

        // Calculate the remaining duration based on the current progress.
        // This allows the runloop to resume from where it left off.
        remainingDuration = currentDuration - Math.round( currentDuration * ( Math.floor( currentStep ) / 100 ) );

        // Stop the jQuery animation on the internal 'runloop' element.
        $( runloop ).stop();
      },


      // Starts or resumes the runloop animation.
      // `duration`: The total duration of the runloop animation in milliseconds. (Default: 500ms)
      // `callback`: An optional function to execute when the runloop completes (100%).
      play: function ( duration, callback ) {

        // If the runloop is already playing, ignore the call.
        if ( r.isPlaying ) {
          return;
        }
        r.isPlaying = true; // Set playing flag to true.

        // Ensure duration is an integer, defaulting to 500ms if invalid or not provided.
        duration = parseInt( duration, 0 ) || 500;

        // If the total duration is less than 500ms,
        // automatically switch the base interval to 10% steps for finer control.
        if ( duration < 500 ) {
          config.base = 10;
        }

        // If `remainingDuration` is set (meaning it was previously paused),
        // adjust the current animation duration to the remaining time.
        if ( remainingDuration ) {
          duration = remainingDuration;
          // Set the 'top' CSS property to the current step to ensure smooth resume.
          // TODO: Investigate if this line is strictly necessary for proper functionality.
          $( runloop ).css( 'top', Math.floor( currentStep ) );
        }
        /*
          A note on edge cases: It's possible for `config.base` to remain 5
          even if `duration` becomes less than 500ms due to a pause/resume.
          This can happen if the original animation had 5% keyframes and was paused
          very close to completion, leaving less than 500ms remaining.
          While legitimate, this scenario *might* cause some keyframe intervals to be skipped
          if they fall between the new, shorter steps. It's generally advised to avoid
          such situations for optimal keyframe execution. :)
        */

        // If an optional callback function is provided,
        // register it as a keyframe at the 100% mark.
        if ( typeof callback == "function" ) {
          this.addKey( '100%', callback );
        }

        // Store the current animation duration. This is needed if the runloop is paused.
        currentDuration = duration;

        // Start the jQuery animation on our hidden 'runloop' element.
        // We animate 'top' from its current value to '100' (representing 100% completion).
        $( runloop ).animate( { 'top': '100' }, {

          duration: duration, // Use the determined animation duration.

          // The `step` function is called for each animation frame.
          step: function ( step ) {
            currentStep = step; // Update the current progress step.

            // Apply rounding based on the configured `roundType` and `base`.
            // Default is 'floor' (round down to the nearest base interval).
            if ( config.roundType == "round" ) {
              step = Math.round( step / config.base ) * config.base;
            } else { // 'floor' or any other value defaults to floor.
              step = Math.floor( step / config.base ) * config.base;
            }

            // Check if this step hasn't been executed yet AND if a keyframe exists for it.
            if ( !( step in execLog ) && map[ 'at' + step ] ) {

              // Log this keyframe location to prevent future double-execution within this cycle.
              execLog[ step ] = true;

              // Execute the stored function associated with this keyframe.
              map[ 'at' + step ]();
            }
          },
          easing: 'linear', // Use a linear easing for consistent progress.

          // The `complete` function is called once the animation finishes.
          complete: function () {
            r.isPlaying = false; // Set playing flag to false.
            r.reset(); // Reset the runloop state.
          }
        } );
      }
    };
  };

} )( jQuery );