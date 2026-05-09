/*!
 * Dynamic Sequence Controller -- v. 1.0.3
 * © 2011, Firat Aslan
 * Released under MIT & BSD stipulations
 *
 * Inspired by Ben Nadel's concept:
 * http://j.mp/ben-nadel-concept
 *
 * Full documentation:
 * https://github.com/KuraFire/runloop/blob/master/documentation.md (Placeholder, not changed as per instructions)
*/

( function ( jq ) {

   jq.sequencePlayer = function ( options ) {

      // Internal configuration parameters, can be partially overridden
      var params = {

         // roundingMethod can be 'floor' or 'round'; employed within Math functions for aligning each progression step to its nearest 5% or 10% mark.
         'roundingMethod': 'floor',

         // intervalBase of 5 is typically utilized (and recommended to remain unchanged) for sequences 500ms and longer; < 500ms will consistently revert to intervalBase 10!
         'intervalBase': 5
      };

      // Merge user-supplied options if provided
      if ( options ) {
         jq.extend( params, options );
      }


      // Library version string
      var libVersion = "1.0.3",

      // Establish a transient DOM element to drive the animation process
      animationProxy = document.createElement( 'div' ),

      // Repository for all event handlers tied to specific points
      actionPoints = {},

      // Record of already triggered event points to prevent re-execution
      executedEvents = {},

      // Variables for managing the animation's internal state
      totalTime = false,
      timeLeft = false,
      currentProgress = 0,

      // The object that will be returned, exposing public API
      animator,

      // Private utility to construct a unique identifier for a percentage point
      createPointId = function ( position ) {
         var numericVal = parseInt( position.toString().match( /[0-9]+/g ), 10 );
         // Return a specific ID or boolean false if invalid
         return isNaN( numericVal ) ? false : "point" + numericVal;
      };

      // Public interface methods:
      return animator = {

         isAnimating: false,

         // Enlist a new action at a specified percentage mark, along with its execution logic
         registerAction: function ( percentPoint, actionFunc ) {
            var positionId = createPointId( percentPoint );

            if ( positionId ) {
               var previousAction = actionPoints[ positionId ];
               // If no action exists at this point, simply assign the new one
               if ( typeof actionPoints[ positionId ] !== 'function' ) {
                  actionPoints[ positionId ] = actionFunc;
               } else {
                  // If an action already exists, chain them together
                  actionPoints[ positionId ] = function () {
                     if ( previousAction ) {
                        previousAction(); // Execute the previously registered function
                     }
                     actionFunc(); // Execute the newly registered function
                  };
               }
            }
         },

         // Remove an existing action point at a given percentage
         unregisterAction: function ( percentPoint ) {
            var positionId = createPointId( percentPoint );
            if ( positionId ) {
               delete actionPoints[ positionId ];
            }
         },

         // Incorporate multiple keyframe-function pairs from a provided object
         registerActionsFromObject: function ( actionMap ) {

            // Iterate through every property in the supplied action map
            for ( var pointKey in actionMap ) {

               // Validate the current item from the actionMap
               var idForPoint = createPointId( pointKey );

               // If both the ID and the function are valid, add to the main actionPoints
               if ( idForPoint && typeof actionMap[ pointKey ] === "function" ) {
                  this.registerAction( idForPoint, actionMap[ pointKey ] );
               }

            }
         },

         // Provides the current collection of action points for review
         retrieveActions: function () {
            return actionPoints;
         },

         // Resets the sequence player to its initial zero state
         initializeState: function () {

            // Reset all internal state variables to their defaults
            totalTime = false;
            timeLeft = false;
            currentProgress = 0;
            executedEvents = {};

            // Explicitly set the animation proxy's visual state to 0
            jq( animationProxy ).css( { 'top': 0 } );
         },

         // Halts the sequence player at its current progression.
         //
         //                             IMPORTANT NOTE !!
         // This operation will NOT pause any animations initiated by the keyframe functions themselves!
         //
         haltExecution: function () {

            animator.isAnimating = false;

            // Calculate the remaining time and store it
            timeLeft = totalTime - Math.round( totalTime * ( Math.floor( currentProgress ) / 100 ) );

            // Stop the underlying jQuery animation
            jq( animationProxy ).stop();
         },

         // Initiates the sequence player; if previously halted, it resumes from that point
         startExecution: function ( animationDuration, completionCallback ) {

            // If the player is already active, simply exit
            if ( animator.isAnimating ) {
               return;
            }
            animator.isAnimating = true;

            // Establish a default duration if none is provided or invalid
            animationDuration = parseInt( animationDuration, 10 ) || 500;

            // For shorter sequences (under 500ms), simplify the step intervals to 10%
            if ( animationDuration < 500 ) {
               params.intervalBase = 10;
            }

            // If resuming from a halted state, adjust duration to the remaining time
            if ( timeLeft ) {
               animationDuration = timeLeft;
               // Set the proxy's initial position to match the current progress percentage
               jq( animationProxy ).css( 'top', Math.floor( currentProgress ) );
            }
            // It's worth noting here that it's still possible to have an intervalBase of 5
            //   even if the remaining duration is less than 500ms. This unusual situation
            //   is valid if the original animation used 5% keyframes and was paused so near
            //   its end that very little time remained. However, this scenario might cause
            //   some intervals to be skipped, so it's generally not ideal. :)

            // If a completion callback is provided, register it as a 100% keyframe
            if ( typeof completionCallback === "function" ) {
               this.registerAction( '100%', completionCallback );
            }

            // Store the total duration in case the player is halted later
            totalTime = animationDuration;

            // Animate the dummy element to drive the sequence
            jq( animationProxy ).animate( { 'top': '100' }, {

               duration: animationDuration,

               step: function ( currentPercentage ) {
                  currentProgress = currentPercentage; // Update the current progress

                  // Apply rounding based on configured method
                  if ( params.roundingMethod === "round" ) {
                     currentPercentage = Math.round( currentPercentage / params.intervalBase ) * params.intervalBase;
                  } else {
                     currentPercentage = Math.floor( currentPercentage / params.intervalBase ) * params.intervalBase;
                  }

                  // If this percentage point hasn't been executed and has an associated action
                  if ( !( currentPercentage in executedEvents ) && actionPoints[ 'point' + currentPercentage ] ) {

                     // Mark this keyframe location as executed to prevent re-triggering
                     executedEvents[ currentPercentage ] = true;

                     // Invoke the stored function for this specific keyframe
                     actionPoints[ 'point' + currentPercentage ]();
                  }
               },
               easing: 'linear', // Use a linear progression for even timing

               complete: function () {
                  animator.isAnimating = false; // Mark player as inactive
                  animator.initializeState(); // Reset player to its initial state
               }
            } );
         }
      };
   };
} )( jQuery );