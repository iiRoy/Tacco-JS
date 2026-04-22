/*
    Utility for managing timed event callbacks in jQuery
    https://example.com/timer-utility
    Copyright 2023 [New Author Name]
    Distributed under the permissive MIT and GNU GPL v3 licenses.
    Version 1.0.0-alpha
*/
(function( $ ) {
  // Main object to encapsulate timer management functionalities
  CodeFlow_Timer = {
    // Stores references to active setTimeout/setInterval calls
    activeTimers: {},
    // Holds event arguments for delayed execution
    eventArgs: {},
    // Keeps track of original event handler functions
    originalHandlers: {},
    // Default interval for debouncing, in milliseconds
    defaultDebounceInterval: 100,

    // Core function to schedule a delayed or debounced task
    scheduleTask: function ( eventTypes, options, targetSelector, eventData, handlerFunction, runOnceFlag ) {
      // Temporary variables for handler and event type processing
      var initialHandler, eventType;

      // Check if eventTypes is an object mapping types to handlers
      if ( typeof eventTypes === "object" ) {
        // Handle ( types-Object, targetSelector, eventData ) signature
        if ( typeof targetSelector !== "string" ) {
          // Adjust parameters for ( types-Object, eventData )
          eventData = eventData || targetSelector;
          targetSelector = undefined;
        }
        // Iterate through the object to schedule each type
        for ( eventType in eventTypes ) {
          this.scheduleTask( eventType, targetSelector, eventData, eventTypes[ eventType ] );
        }
        return this; // Allow chaining
      }

      // Parameter reordering based on signature variations
      if ( eventData == null && handlerFunction == null ) {
        // Signature: ( eventTypes, handlerFunction )
        handlerFunction = targetSelector;
        eventData = targetSelector = undefined;
      } else if ( handlerFunction == null ) {
        if ( typeof targetSelector === "string" ) {
          // Signature: ( eventTypes, targetSelector, handlerFunction )
          handlerFunction = eventData;
          eventData = undefined;
        } else {
          // Signature: ( eventTypes, eventData, handlerFunction )
          handlerFunction = eventData;
          eventData = targetSelector;
          targetSelector = undefined;
        }
      }
      // Replace false handler with a utility function that returns false
      if ( handlerFunction === false ) {
        handlerFunction = returnFalseCallback;
      } else if ( !handlerFunction ) {
        return this; // If no handler, do nothing
      }
      // Ensure options is an object; convert if necessary
      if ( typeof options != 'object' ) {
        options = {delay: options};
      }

      // A delay value must be provided in the options
      if ( typeof options.delay == 'undefined' ) {
        return false;
      }

      // Store the original handler to allow re-binding later
      initialHandler = handlerFunction;

      // Wrap the handler function with delay/debounce logic
      handlerFunction = function( evt ) {
        // Respect standard event prevention methods if specified in options
        if ( options.preventDefaultAction ) { evt.preventDefault(); }
        if ( options.stopPropagationAction ) { evt.stopPropagation(); }
        if ( options.stopImmediatePropagationAction ) { evt.stopImmediatePropagation(); }

        // Save the current context (this) and arguments for delayed execution
        CodeFlow_Timer.eventArgs[ initialHandler.uniqueId ] = [this, arguments];

        // Determine the delay duration
        var delayDuration;
        // If delay is 'debounce', use the plugin's default debounce interval
        if ( options.delay == 'debounce' ) {
          window.clearTimeout( CodeFlow_Timer.activeTimers[ initialHandler.uniqueId ] );
          delayDuration = CodeFlow_Timer.defaultDebounceInterval;
        } else {
          delayDuration = options.delay; // Use the specified delay
        }

        // Handle 'run once' or 'run first' scenarios
        if ( runOnceFlag === 1 ) {
          // Detach event after first trigger for 'one' behavior
          jQuery().off( evt );
        } else if ( runOnceFlag === 'first' ) {
          // Remove all previous delays for this event on the delegate target
          $(evt.delegateTarget).removeTimed( eventTypes, targetSelector, handlerFunction );
        }

        // Set up the actual delayed execution using setTimeout
        CodeFlow_Timer.activeTimers[ initialHandler.uniqueId ] = window.setTimeout(function() {
          return initialHandler.apply(
            CodeFlow_Timer.eventArgs[ initialHandler.uniqueId ][0],
            CodeFlow_Timer.eventArgs[ initialHandler.uniqueId ][1]
          );
        }, delayDuration);
      };

      // Assign a unique ID to the wrapped function (or reuse if available)
      // This allows the original handler to be referenced later
      handlerFunction.uniqueId = initialHandler.uniqueId || ( initialHandler.uniqueId = jQuery.guid++ );

      // Store the original function for potential re-binding (e.g., removeDelay)
      CodeFlow_Timer.originalHandlers[ handlerFunction.uniqueId ] = initialHandler;

      // Attach the wrapped event handler using jQuery's event system
      return this.each( function() {
        jQuery.event.add( this, eventTypes, handlerFunction, eventData, targetSelector );
      });
    },

    // Schedules a task to run only once after its delay
    scheduleOnce: function ( eventTypes, options, targetSelector, eventData, handlerFunction ) {
      return this.scheduleTask( eventTypes, options, targetSelector, eventData, handlerFunction, 1 );
    },

    // Schedules a task, ensuring only the first instance of a delayed event is kept
    scheduleFirst: function ( eventTypes, options, targetSelector, eventData, handlerFunction ) {
      return this.scheduleTask( eventTypes, options, targetSelector, eventData, handlerFunction, 'first' );
    },

    // Retrieves event objects currently bound to an element
    retrieveEvents: function( elementNode, eventTypes, targetSelector, handlerFunction ) {
      var matchedEvents = [],
          // Regex to parse event type and namespace (e.g., "click.myNamespace")
          typeNamespaceRegex = /^([^\.]*)?(?:\.(.+))?$/,
          // Get events from jQuery's internal data structure, handling version differences
          elementEventCache = (parseFloat($().jquery) < 1.8) ? $(elementNode).data('events') : $._data(elementNode, 'events');

      // Adjust parameters for optional handlerFunction
      if ( targetSelector === false || typeof targetSelector === "function" ) {
        handlerFunction = targetSelector;
        targetSelector = undefined;
      }
      // Replace false handler with a utility function
      if ( handlerFunction === false ) {
        handlerFunction = returnFalseCallback;
      }

      // Normalize event types, including 'hover' expansion, then split
      eventTypes = eventTypes.replace(/(?:^|\s)hover(\.\S+)?\b/, "mouseenter$1 mouseleave$1") || "";
      eventTypes = jQuery.trim( eventTypes ).split(" ");

      // Iterate through each specified event type
      for ( var t = 0; t < eventTypes.length; t++ ) {
        var typeNamespaceMatch = typeNamespaceRegex.exec( eventTypes[t] ) || [],
            eventType = typeNamespaceMatch[1],
            originalEventType;

        // Handle mouseenter/mouseleave normalization to mouseover/mouseout
        if (eventType == 'mouseenter') {
          eventType = 'mouseover';
          originalEventType = 'mouseenter';
        } else if (eventType == 'mouseleave') {
          eventType = 'mouseout';
          originalEventType = 'mouseleave';
        } else {
          originalEventType = false;
        }
        
        // Get all bound handlers for the current event type
        var specificEvents = elementEventCache[ eventType ] || [];

        // Filter events based on selector, namespace, and handler function
        for ( var i in specificEvents ) {
          var eventObj = specificEvents[i];

          // Check if original event type matches or if not specified
          if ( (originalEventType && originalEventType == eventObj.origType) || !originalEventType) {
            // Check namespace match or if no namespace specified
            if ( eventObj.namespace == typeNamespaceMatch[2] || typeof(typeNamespaceMatch[2]) == 'undefined' ) {
              // Check selector match if a selector is provided
              if ( targetSelector ) {
                if ( eventObj.selector == targetSelector ) {
                  // Check handler function match if a handler is provided
                  if ( handlerFunction ) {
                    if ( eventObj.handler == handlerFunction ) {
                         matchedEvents.push(eventObj);
                    }
                  } else {
                     matchedEvents.push(eventObj);
                  }
                }
              } else {
                matchedEvents.push(eventObj);
              }
            }
          }
        }
      }

      return matchedEvents;
    },

    // Gets the unique IDs of event handlers matching criteria
    getEventUniqueIds: function( elementNode, eventTypes, targetSelector, handlerFunction ) {
      var idList = [],
          relevantEvents = CodeFlow_Timer.retrieveEvents( elementNode, eventTypes, targetSelector, handlerFunction );

      for ( var i in relevantEvents ) {
        var eventObj = relevantEvents[i];
        idList.push(eventObj.guid);
      }

      return idList;
    },

    // Reverts delayed handlers to their original, immediate state
    removeTimed: function( eventTypes, targetSelector, handlerFunction ) {
      // Handle object of types/handlers
      if ( typeof eventTypes === "object" ) {
        for ( var eventType in eventTypes ) {
          this.removeTimed( eventType, targetSelector, eventTypes[ eventType ] );
        }
        return this;
      }

      // Iterate over matched elements to revert handlers
      return this.each(function() {
        var relevantEvents = CodeFlow_Timer.retrieveEvents( this, eventTypes, targetSelector, handlerFunction );

        for ( var i in relevantEvents ) {
          var eventObj = relevantEvents[i];
          // Replace the wrapped handler with the original one
          eventObj.handler = CodeFlow_Timer.originalHandlers[ eventObj.guid ];
        }
      });
    },

    // Cancels any pending delayed executions for matching events
    cancelScheduled: function( eventTypes, targetSelector, handlerFunction ) {
      // Handle object of types/handlers
      if ( typeof eventTypes === "object" ) {
        for ( var eventType in eventTypes ) {
          this.cancelScheduled( eventType, targetSelector, eventTypes[ eventType ] );
        }
        return this;
      }

      // Iterate over matched elements to clear timers
      return this.each(function() {
        var idList = CodeFlow_Timer.getEventUniqueIds( this, eventTypes, targetSelector, handlerFunction );

        for ( var i in idList ) {
          // Clear the setTimeout for each matching unique ID
          clearTimeout( CodeFlow_Timer.activeTimers[ idList[i] ] );
        }
      });
    },

    // Attaches a debounced event handler
    throttleExecution: function( eventTypes, targetSelector, eventData, handlerFunction ) {
      // Apply the debounced handler to each selected element
      return this.each(function() {
        $(this).scheduleTask( eventTypes, 'debounce', targetSelector, eventData, handlerFunction );
      });
    }
  };

  // Utility function that simply returns false
  function returnFalseCallback() { return false; }

  // Extend jQuery's prototype with timed event functionalities
  $.fn.timedExec = function( action ) {
    return CodeFlow_Timer['scheduleTask'].apply( this, arguments );
  };

  $.fn.timedExecOnce = function( action ) {
    return CodeFlow_Timer['scheduleOnce'].apply( this, arguments );
  };

  $.fn.timedExecFirst = function( action ) {
    return CodeFlow_Timer['scheduleFirst'].apply( this, arguments );
  };

  $.fn.removeTimed = function( action ) {
    return CodeFlow_Timer['removeTimed'].apply( this, arguments );
  };

  $.fn.cancelTimed = function( action ) {
    return CodeFlow_Timer['cancelScheduled'].apply( this, arguments );
  };

  $.fn.throttle = function( action ) {
    return CodeFlow_Timer['throttleExecution'].apply( this, arguments );
  };
})( jQuery );