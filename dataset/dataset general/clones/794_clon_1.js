"use strict"; /* This directive enforces strict mode for the entire script. */

/**
 * Dahuapp Viewer Module.
 *
 * This module extends the core dahuapp object with viewer capabilities.
 *
 * @param {object} dahuapp - The main dahuapp application object.
 * @param {jQuery} $ - The jQuery library instance.
 * @returns {object} The dahuapp object, now augmented with the viewer module.
 */

( function ( dahuapp , $ ) {

  // Immediately-invoked function expression (IIFE) for the viewer module.
  var viewer = ( function ( ) {

    var self = { } ; // A self-reference object for the viewer's public methods.

    /**
     * DahuViewerModel constructor function.
     * Manages the presentation logic, actions, and user interactions.
     * @param {string} select - The CSS selector for the viewer container.
     * @param {object} getParams - An object containing URL query parameters.
     * @constructor
     */
    var DahuViewerModel = function ( select , getParams ) {

      /* --- Private API Methods and Variables --- */
      // These are internal to the DahuViewerModel instance.

      var json = null ; // Stores the parsed presentation JSON data.
      var selector = select ; // The DOM selector for the viewer's root element.

      /**
       * Parses an auto-option from URL parameters.
       * Determines if an 'auto' setting (like autoplay, autostart) is enabled
       * and retrieves its delay value if specified.
       * @param {string} name - The name of the parameter (e.g., 'autoplay').
       * @param {number} defaultValue - The default numeric value if not found or invalid.
       * @returns {boolean|number} False if explicitly 'false', otherwise the parsed integer delay, or the defaultValue.
       */
      var parseAutoOption = function ( name , defaultValue ) {
        var res = getParams [ name ] ; // Get the parameter value.
        if ( res == null ) { // Check if the parameter is missing or null.
          if ( name == 'auto' ) { // Special case for a generic 'auto' flag.
            return false ;
          } else {
            // Recursively check for a generic 'auto' flag if a specific one is not found.
            return parseAutoOption ( 'auto' , defaultValue ) ;
          }
        }
        if ( res.toLowerCase ( ) === 'false' ) { // If explicitly set to 'false'.
          return false ;
        }
        res = parseInt ( res ) ; // Attempt to parse as an integer.
        if ( isNaN ( res ) ) {
          // If not a number (e.g., "?autoplay" or "?autoplay=true"), return default.
          return defaultValue ;
        }
        return res ; // Return the parsed integer value.
      } ; // End of parseAutoOption function.

      // Configuration variables for automatic playback behaviors.
      var autoPlay = parseAutoOption ( 'autoplay' , 5000 ) ; // Delay between actions in autoplay mode.
      var autoStart = parseAutoOption ( 'autostart' , 5000 ) ; // Delay before starting on page load.
      var autoLoop = parseAutoOption ( 'autoloop' , 5000 ) ; // Delay before looping presentation.

      /**
       * Manages custom events within the viewer model.
       * Utilizes jQuery.Callbacks for event handling.
       */
      var events = ( function ( ) {
        var self = { } ; // Local object to hold event publishers.

        /**
         * Factory function to create a generic event object.
         * @returns {object} An object with publish, subscribe, unsubscribe, and unsubscribeAll methods.
         */
        var createEvent = function ( ) {
          var callbacks = $.Callbacks ( ) ; // Initialize jQuery Callbacks.
          return {
            publish : callbacks.fire , // Publishes the event to all subscribers.
            subscribe : callbacks.add , // Adds a listener to the event.
            unsubscribe : callbacks.remove , // Removes a specific listener.
            unsubscribeAll : callbacks.empty // Removes all listeners.
          } ;
        } ; // End of createEvent function.

        // Define specific events for the viewer.
        self.onNext = createEvent ( ) ; // Event triggered when 'next' action is requested.
        self.onPrevious = createEvent ( ) ; // Event triggered when 'previous' action is requested.
        self.onActionOver = createEvent ( ) ; // Event triggered when an action completes.
        self.onActionStart = createEvent ( ) ; // Event triggered when an action begins.
        self.onAllActionFinish = createEvent ( ) ; // Event triggered when all current actions have finished.

        return self ; // Return the events object.
      } ) ( ) ; // End of events IIFE.

      // State variables for tracking presentation progress.
      var currentAction = 0 ; // Index of the action currently being processed.
      var nextAction = 0 ; // Index of the next action to execute on 'Next' click.
      var nbActionsRunning = 0 ; // Counter for actions currently in progress.
      var previousAnchor = -1 ; // Stores the last known URL hash, for `onhashchange` fallback.

      /**
       * Stops all currently running animations related to the presentation.
       * Also reinitializes callback lists to prevent stale subscriptions.
       */
      var stopAllActions = function ( ) {
        // Stop all jQuery animations on children of '.object-list'.
        $ ( selector + " .object-list" ) . children ( ) . stop ( true , true ) ;
        reinitialiseCallbackLists ( ) ; // Reset event subscriptions.
        nbActionsRunning = 0 ; // Reset the count of running actions.
      } ;

      /**
       * Reinitializes the event callback lists, ensuring only default subscriptions.
       */
      var reinitialiseCallbackLists = function ( ) {
        events.onActionStart.unsubscribeAll ( ) ; // Clear all 'onActionStart' handlers.
        events.onActionStart.subscribe ( onActionStartEventHandler ) ; // Re-subscribe the default handler.
        events.onAllActionFinish.unsubscribeAll ( ) ; // Clear all 'onAllActionFinish' handlers.
      } ;

      var playTimer = 0 ; // Holds the ID of the `setTimeout` for autoplay.

      /**
       * Handles the 'onNext' event, advancing the presentation.
       * Manages action execution based on their triggers ('onClick', 'withPrevious', 'afterPrevious').
       */
      var onNextEventHandler = function ( ) {
        window.clearTimeout ( playTimer ) ; // Cancel any pending autoplay timer.

        enterAnimationMode ( ) ; // Indicate that an animation sequence has started.
        stopAllActions ( ) ; // Ensure all previous actions are stopped.
        var tmpAction = nextAction ; // Store the action index for immediate execution.
        var onlyWithPrevious = true ; // Flag to determine if only 'withPrevious' actions are being processed.
        nextAction ++ ; // Increment nextAction for the next "onClick" target.
        currentAction = nextAction ; // Set currentAction to the potential start of subsequent actions.

        // Loop through actions to find 'withPrevious' or 'afterPrevious' actions.
        while ( json.action [ currentAction ] && onlyWithPrevious ) {
          switch ( json.action [ currentAction ] . trigger ) {
            case 'onClick' :
              nextAction = currentAction ; // This is the next 'onClick' target.
              onlyWithPrevious = false ; // Stop looking for 'withPrevious' actions.
              break ;
            case 'withPrevious' :
              var tmp = currentAction ; // Capture currentAction for the closure.
              // Subscribe a function to execute this action when another action starts.
              events.onActionStart.subscribe ( function ( events , selector ) {
                json.action [ tmp ] . execute ( events , selector ) ;
              } ) ;
              break ;
            case 'afterPrevious' :
              var tmp = currentAction ; // Capture currentAction for the closure.
              // Subscribe a function to execute this action when all previous actions finish.
              events.onAllActionFinish.subscribe ( function ( events , selector ) {
                json.action [ tmp ] . execute ( events , selector ) ;
              } ) ;
              // Advance nextAction past all subsequent 'withPrevious' actions for the next 'onClick'.
              while ( json.action [ nextAction ] && json.action [ nextAction ] . trigger !== 'onClick' ) {
                nextAction ++ ;
              }
              onlyWithPrevious = false ; // Stop looking for 'withPrevious' actions.
              break ;
          }
          currentAction ++ ; // Move to the next action in the sequence.
        }

        // Launch the initial action if it exists.
        if ( json.action [ tmpAction ] ) {
          launch ( json.action [ tmpAction ] ) ;
        }

        // Ensure nextAction does not exceed the total number of actions.
        if ( nextAction > json.action.length ) {
          nextAction = json.action.length ;
        }
      } ; // End of onNextEventHandler.

      /**
       * Handles the 'onPrevious' event, moving the presentation backward.
       */
      var onPreviousEventHandler = function ( ) {
        stopAllActions ( ) ; // Stop any ongoing actions.
        currentAction = nextAction - 1 ; // Start from the action before the current 'next'.

        // Reverse through actions until an 'onClick' trigger is found.
        while ( json.action [ currentAction ] && json.action [ currentAction ] . trigger !== 'onClick' ) {
          launchReverse ( json.action [ currentAction ] ) ; // Execute the action in reverse.
          currentAction -- ; // Move to the previous action.
        }

        // If an 'onClick' action was found, execute its reverse.
        if ( currentAction > -1 ) {
          launchReverse ( json.action [ currentAction ] ) ;
        }

        // Ensure currentAction doesn't go below zero.
        if ( currentAction < 0 ) {
          currentAction = 0 ;
        }
        nextAction = currentAction ; // Update nextAction to the new position.
      } ; // End of onPreviousEventHandler.

      /**
       * Handles the 'onActionOver' event, triggered when an action completes.
       * Manages the transition to the next set of actions or presentation state.
       */
      var onActionOverEventHandler = function ( ) {
        nbActionsRunning -- ; // Decrement the count of active actions.
        if ( nbActionsRunning === 0 ) { // If all actions have finished.
          events.onAllActionFinish.publish ( events , selector ) ; // Notify that all actions are done.
          reinitialiseCallbackLists ( ) ; // Reset callbacks for the next sequence.

          // Continue processing actions based on their triggers.
          while ( json.action [ currentAction ] ) {
            switch ( json.action [ currentAction ] . trigger ) {
              case 'onClick' :
                leaveAnimationMode ( ) ; // Exit animation mode.
                // If autoplay is enabled and no actions are running, schedule the next 'onNext'.
                if ( autoPlay && nbActionsRunning === 0 ) {
                  playTimer = setTimeout ( function ( ) {
                    events.onNext.publish ( ) ; // Trigger the next action sequence.
                  } , autoPlay ) ;
                }
                return ; // Stop processing actions, wait for user or autoplay.
              case 'withPrevious' :
                var tmp = currentAction ; // Capture currentAction for the closure.
                events.onActionStart.subscribe ( function ( events , selector ) {
                  json.action [ tmp ] . execute ( events , selector ) ;
                } ) ;
                break ;
              case 'afterPrevious' :
                var tmp = currentAction ; // Capture currentAction for the closure.
                events.onAllActionFinish.subscribe ( function ( events , selector ) {
                  json.action [ tmp ] . execute ( events , selector ) ;
                } ) ;
                currentAction ++ ; // Move to the next action.
                return ; // Stop and wait for the 'onAllActionFinish' event.
            }
            currentAction ++ ; // Advance to the next action.
          }

          // If all actions are exhausted and autoLoop is enabled, restart the presentation.
          if ( autoLoop && nbActionsRunning === 0 ) {
            setTimeout ( function ( ) {
              resetPresentation ( ) ; // Reset to the initial state.
              startPresentationMaybe ( ) ; // Potentially restart with autostart.
            } , autoLoop ) ;
          }
        }
        leaveAnimationMode ( ) ; // Ensure animation mode is left even if not all actions are done.
      } ; // End of onActionOverEventHandler.

      /**
       * Handles the 'onActionStart' event, incrementing the count of running actions.
       */
      var onActionStartEventHandler = function ( ) {
        nbActionsRunning ++ ; // One more action has started.
      } ;

      /**
       * Enters "animation mode," typically hiding the "pause" cursor and showing the "normal" cursor.
       * This signifies that actions are automatically progressing.
       */
      var enterAnimationMode = function ( ) {
        $ ( selector + ' .mouse-cursor-pause' ) . hide ( ) ; // Hide the paused cursor.
        $ ( selector + ' .mouse-cursor-normal' ) . show ( ) ; // Show the animating cursor.
      } ;

      /**
       * Leaves "animation mode," typically showing the "pause" cursor and hiding the "normal" cursor.
       * This signifies that the presentation is awaiting user interaction.
       */
      var leaveAnimationMode = function ( ) {
        $ ( selector + ' .mouse-cursor-pause' ) . show ( ) ; // Show the paused cursor.
        $ ( selector + ' .mouse-cursor-normal' ) . hide ( ) ; // Hide the animating cursor.
      } ;

      /**
       * Executes a given action in the forward direction.
       * @param {object} action - The action object to execute.
       */
      var launch = function ( action ) {
        action.execute ( events , selector ) ; // Call the action's 'execute' method.
      } ;

      /**
       * Executes a given action in the reverse direction.
       * @param {object} action - The action object to execute.
       */
      var launchReverse = function ( action ) {
        action.executeReverse ( selector ) ; // Call the action's 'executeReverse' method.
      } ;

      /**
       * Retrieves an array of actions needed to jump forward to a specific anchor.
       * @param {string|number} anchor - The ID of the target anchor.
       * @returns {Array<object>|null} An array of actions, or null if the anchor is not found.
       */
      var getActionsToJumpForward = function ( anchor ) {
        var actions = new Array ( ) ; // Initialize an empty array to store actions.
        // Iterate from the current nextAction position to find the anchor.
        for ( var i = nextAction ; i < json.action.length ; i ++ ) {
          if ( json.action [ i ] . id == anchor ) { // Use '==' for loose comparison (string vs. number).
            return actions ; // Anchor found, return collected actions.
          } else {
            actions.push ( json.action [ i ] ) ; // Add action to the list.
          }
        }
        return null ; // Anchor not found in the forward scan.
      } ;

      /**
       * Retrieves an array of actions needed to jump backward to a specific anchor.
       * @param {string|number} anchor - The ID of the target anchor.
       * @returns {Array<object>|null} An array of actions, or null if the anchor is not found.
       */
      var getActionsToJumpBackwards = function ( anchor ) {
        var actions = new Array ( ) ; // Initialize an empty array.
        // Iterate backward from the action before nextAction.
        for ( var i = nextAction - 1 ; i >= 0 ; i -- ) {
          actions.push ( json.action [ i ] ) ; // Add action to the list.
          if ( json.action [ i ] . id == anchor ) { // Use '==' for loose comparison.
            return actions ; // Anchor found, return collected actions.
          }
        }
        return null ; // Anchor not found in the backward scan.
      } ;

      /**
       * Navigates the presentation to a specific anchor point.
       * @param {string} anchor - The ID of the anchor to jump to.
       */
      var jumpToAnchor = function ( anchor ) {
        if ( anchor !== '' ) { // Only proceed if the anchor is not empty.
          stopAllActions ( ) ; // Halt all current activities.

          var currentNextAction = nextAction ; // Store current nextAction before potential changes.

          var targetAnchorIndex = -1 ;
          for ( var i = 0 ; i < json.action.length ; i ++ ) {
            if ( json.action [ i ] . id == anchor ) {
              targetAnchorIndex = i ;
              break ;
            }
          }

          if ( targetAnchorIndex === -1 ) {
            // Anchor not found, do nothing or reset to start
            return ;
          }

          if ( targetAnchorIndex > currentNextAction ) {
            // Jump forward
            var actions = getActionsToJumpForward ( anchor ) ;
            if ( actions ) { // Ensure actions were found.
              for ( var i = 0 ; i < actions.length ; i ++ ) {
                actions [ i ] . executeImmediately ( selector ) ; // Execute actions without delay.
              }
              nextAction = targetAnchorIndex ; // Update nextAction to the target anchor.
            }
          } else if ( targetAnchorIndex < currentNextAction ) {
            // Jump backward
            var actions = getActionsToJumpBackwards ( anchor ) ;
            if ( actions ) { // Ensure actions were found.
              for ( var i = 0 ; i < actions.length ; i ++ ) {
                actions [ i ] . executeReverse ( selector ) ; // Execute actions in reverse.
              }
              nextAction = targetAnchorIndex ; // Update nextAction to the target anchor.
            }
          }
          // If targetAnchorIndex == currentNextAction, no jump needed.
        }
      } ; // End of jumpToAnchor.

      /**
       * Resets the presentation to its initial state.
       * Clears timers, resets action counters, and sets initial visuals.
       */
      var resetPresentation = function ( ) {
        window.clearTimeout ( playTimer ) ; // Clear any active autoplay timer.

        currentAction = 0 ; // Reset current action index.
        nextAction = 0 ; // Reset next action index.
        nbActionsRunning = 0 ; // Reset running actions count.

        // Hide all objects in the list initially.
        $ ( selector + " .object-list" ) . children ( ) . hide ( ) ;

        // Show the initial background image based on metadata.
        $ ( selector + " ." + json.metaData.initialBackgroundId ) . show ( ) ;

        // Position the mouse cursor to its initial coordinates.
        $ ( selector + " .mouse-cursor" ) . css ( {
          'top' : ( json.metaData.initialMouseY * json.metaData.imageHeight ) + "px" ,
          'left' : ( json.metaData.initialMouseX * json.metaData.imageWidth ) + "px"
        } ) ;

        $ ( selector + " .mouse-cursor" ) . show ( ) ; // Make the mouse cursor visible.
      } ; // End of resetPresentation.

      /**
       * Initiates the presentation with an autostart delay if configured.
       */
      var startPresentationMaybe = function ( ) {
        if ( autoStart ) { // Check if autostart is enabled.
          playTimer = setTimeout ( function ( ) {
            events.onNext.publish ( ) ; // Trigger the first 'onNext' event.
          } , autoStart ) ;
        }
      } ; // End of startPresentationMaybe.

      /* --- Public API Methods --- */
      // These methods are exposed on the DahuViewerModel instance.

      /**
       * Loads presentation data from a specified URL.
       * Performs a synchronous AJAX call to retrieve the JSON data.
       * @param {string} url - The URL to fetch the presentation JSON from.
       */
      this.loadUrl = function ( url ) {
        var dataJson ; // Variable to hold the fetched JSON data.
        $.ajax ( {
          'async' : false , // Make the AJAX call synchronous.
          'global' : false , // Prevent global AJAX event handlers from firing.
          'url' : url , // The URL to request.
          'dataType' : "json" , // Expect JSON data.
          'success' : function ( data ) {
            dataJson = data ; // Assign fetched data on success.
          }
        } ) ;

        load ( dataJson ) ; // Process the loaded JSON data.
      } ; // End of loadUrl method.

      /**
       * Loads and processes the presentation data from a JSON object.
       * Transforms raw JSON into an executable model for actions.
       * @param {object} dataJson - The JSON object containing presentation data.
       */
      this.load = function ( dataJson ) {
        // Create an executable model instance.
        var execModel = dahuapp.createScreencastExecutableModel ( ) ;
        execModel.loadJson ( dataJson ) ; // Load the raw JSON into the executable model.
        json = execModel.getJson ( ) ; // Get the processed JSON from the executable model.
      } ; // End of load method.

      /**
       * Starts the presentation viewer.
       * Sets up event listeners, initializes the display, and handles URL anchors.
       */
      this.start = function ( ) {

        // Subscribe event handlers to their respective events.
        events.onNext.subscribe ( onNextEventHandler ) ;
        events.onPrevious.subscribe ( onPreviousEventHandler ) ;
        events.onActionOver.subscribe ( onActionOverEventHandler ) ;
        events.onActionStart.subscribe ( onActionStartEventHandler ) ;

        resetPresentation ( ) ; // Reset the presentation to its initial state.

        // Jump to a specific anchor if one is present in the URL hash.
        jumpToAnchor ( window.location.hash.substring ( 1 ) ) ;

        // Set up listener for URL hash changes.
        if ( "onhashchange" in window ) {
          // Use the native 'onhashchange' event if supported.
          window.onhashchange = function ( ) {
            jumpToAnchor ( window.location.hash.substring ( 1 ) ) ;
          } ;
        } else {
          // Fallback for browsers that don't support 'onhashchange': poll periodically.
          window.setInterval ( function ( ) {
            var currentHash = window.location.hash.substring ( 1 ) ;
            if ( currentHash !== previousAnchor ) {
              previousAnchor = currentHash ; // Update the last known anchor.
              jumpToAnchor ( currentHash ) ; // Jump to the new anchor.
            }
          } , 100 ) ; // Check every 100 milliseconds.
        }

        // Attach click handler for the "next" button.
        $ ( selector + " .next" ) . click ( function ( ) {
          events.onNext.publish ( ) ; // Publish the 'onNext' event.
        } ) ;

        // Attach click handler for the "previous" button.
        $ ( selector + " .previous" ) . click ( function ( ) {
          events.onPrevious.publish ( ) ; // Publish the 'onPrevious' event.
        } ) ;

        // Hide the loading indicator and show the presentation content.
        $ ( "#loading" ) . hide ( ) ;
        $ ( selector + " .object-list" ) . show ( ) ;

        startPresentationMaybe ( ) ; // Potentially start the presentation automatically.
      } ; // End of start method.
    } ; // End of DahuViewerModel constructor.

    /**
     * Factory method to create a new DahuViewerModel instance.
     * @param {string} selector - The CSS selector for the viewer container.
     * @param {object} getParams - URL query parameters.
     * @returns {DahuViewerModel} A new instance of DahuViewerModel.
     */
    self.createDahuViewer = function ( selector , getParams ) {
      return new DahuViewerModel ( selector , getParams ) ;
    } ;

    return self ; // Return the public interface of the viewer module.
  } ) ( ) ; // End of viewer IIFE.

  dahuapp.viewer = viewer ; // Attach the viewer module to the dahuapp object.
} ) ( dahuapp || { } , jQuery ) ; // Pass dahuapp (or an empty object) and jQuery to the IIFE.