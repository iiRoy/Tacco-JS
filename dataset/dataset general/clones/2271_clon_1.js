//
// Delayed for jQuery - A plug-in designed to introduce delay or debounce functionality
// to event handlers within jQuery applications.
//
// Project Homepage: http://www.theloveofcode.com/jquery/delayed/
// GitHub Repository: https://github.com/theloveofcode/delayed-for-jquery
//
// Copyright (c) 2012 Tyler Vigeant <tyler@theloveofcode.com>
//
// This software is released under the terms of both the MIT and GPL licenses.
// Please see the accompanying license files for full details.
//
// Current Version: 1.1.0
//

(  function(  $  )
{
  // Global object to manage delayed functions and their states.
  TLOC_Delayed  =
  {
    // A mapping of GUIDs to active setTimeout/setInterval IDs for delayed functions.
    functions:  {},

    // Stores the 'this' context and 'arguments' array for delayed function calls.
    arguments:  {},

    // Keeps references to the original, undelayed function handlers.
    originals:  {},

    // The default threshold in milliseconds for debounce operations.
    debounce_threshhold:  100,


    // Main function to apply delayed execution to event handlers.
    // Supports various overloads for parameters.
    delayed:  function  (  types,  params,  selector,  data,  fn,  one  )
    {
      var  origFn; // Will hold the reference to the original function.
      var  type;   // Used for iterating through event types.

      // Check if 'types' is an object, indicating a map of event types to handlers.
      if (  typeof  types  ===  "object"  )
      {
        // This is an overload: ( types-Object, selector, data )
        // If 'selector' is not a string, it means 'selector' might be 'data'.
        if (  typeof  selector  !==  "string"  )  // And selector could potentially be null.
        {
          // Adjust parameters for the ( types-Object, data ) overload.
          data      =  data  ||  selector; // 'data' takes 'selector' if 'data' is null/undefined.
          selector  =  undefined;          // 'selector' is explicitly cleared.
        }

        // Iterate over each property (event type) in the 'types' object.
        for (  type  in  types  )
        {
          // Recursively call 'delayed' for each individual event type and its handler.
          this.delayed(  type,  selector,  data,  types[  type  ]  );
        }

        // Return 'this' for method chaining.
        return  this;
      }


      // Handle various parameter overloads when 'types' is a string.

      // Overload: ( types, fn )
      if (  data  ==  null  &&  fn  ==  null  )
      {
        fn        =  selector; // 'fn' is actually 'selector'.
        data      =  undefined; // 'data' is undefined.
        selector  =  undefined; // 'selector' is undefined.
      }
      // Overload: ( types, selector, fn ) or ( types, data, fn )
      else  if (  fn  ==  null  )
      {
        if (  typeof  selector  ===  "string"  )
        {
          // This is ( types, selector, fn )
          fn    =  data;      // 'fn' is 'data'.
          data  =  undefined; // 'data' is undefined.
        }
        else
        {
          // This is ( types, data, fn )
          fn        =  data;      // 'fn' is 'data'.
          data      =  selector;  // 'data' is 'selector'.
          selector  =  undefined; // 'selector' is undefined.
        }
      }

      // If 'fn' is explicitly false, use jQuery's internal `returnFalse` function.
      if (  fn  ===  false  )
      {
        fn  =  returnFalse;
      }
      // If 'fn' is falsy (e.g., null, undefined, 0, ""), exit.
      else  if (  !fn  )
      {
        return  this; // Nothing to delay, return for chaining.
      }


      // Ensure 'params' is an object. If not, treat it as a delay value.
      if (  typeof  params  !=  'object'  )
      {
        params  =  {  delay:  params  };
      }

      // If 'delay' is not specified within 'params', then this is an invalid call.
      if (  typeof  params.delay  ==  'undefined'  )
      {
        return  false; // Indicate failure or incorrect usage.
      }


      // Store the original function reference.
      origFn  =  fn;

      // Wrap the original function with delay logic.
      fn  =  function(  event  )
      {
        var  delay_ms; // Variable to hold the calculated delay in milliseconds.

        // Emulate built-in event methods based on 'params'.
        if (  params.preventDefault         )  {  event.preventDefault();         }
        if (  params.stopPropagation        )  {  event.stopPropagation();        }
        if (  params.stopImmediatePropagation  )  {  event.stopImmediatePropagation();  }

        // Store the current context ('this') and the 'arguments' array
        // so they can be applied correctly when the delayed function executes.
        TLOC_Delayed.arguments[  origFn.guid  ]  =  [  this,  arguments  ];

        // If the 'delay' parameter is the string 'debounce',
        // use the plugin's default debounce threshold.
        if (  params.delay  ==  'debounce'  )
        {
          window.clearTimeout(  TLOC_Delayed.functions[  origFn.guid  ]  ); // Clear any previous debounce timer.
          delay_ms  =  TLOC_Delayed.debounce_threshhold;                   // Set delay to debounce threshold.
        }
        else
        {
          delay_ms  =  params.delay; // Use the specified delay value.
        }


        // Handle 'one' and 'first' delayed event types.
        if (  one  ===  1  )
        {
          // For 'delayedOne', the event should only fire once.
          // This removes the event handler immediately after its first trigger.
          jQuery().off(  event  );
        }
        else  if (  one  ===  'first'  )
        {
          // For 'delayedFirst', remove the delay behavior from the target element.
          $(  event.delegateTarget  ).removeDelay(  types,  selector,  fn  );
        }

        // Set a timeout to execute the original function.
        // The timeout ID is stored to allow clearing (e.g., for debounce).
        TLOC_Delayed.functions[  origFn.guid  ]  =  window.setTimeout(  function()
        {
          // Execute the original function with the stored context and arguments.
          return  origFn.apply(
            TLOC_Delayed.arguments[  origFn.guid  ][0], // The original 'this' context.
            TLOC_Delayed.arguments[  origFn.guid  ][1]  // The original 'arguments' array.
          );
        },  delay_ms  ); // The calculated delay in milliseconds.
      };

      // Assign the same GUID to the wrapper function as the original function.
      // This allows callers to remove the event using the original function reference.
      fn.guid  =  origFn.guid  ||  (  origFn.guid  =  jQuery.guid++  );

      // Store the original function reference in 'originals'
      // so it can be restored later by 'removeDelay'.
      TLOC_Delayed.originals[  fn.guid  ]  =  origFn;

      // Attach the wrapped (delayed) event handler to the matched elements.
      return  this.each(  function()
      {
        jQuery.event.add(  this,  types,  fn,  data,  selector  );
      });
    },


    // Wrapper for delayed events that fire only once.
    delayedOne:  function  (  types,  params,  selector,  data,  fn  )
    {
      // Calls the main 'delayed' function with the 'one' parameter set to 1.
      return  this.delayed(  types,  params,  selector,  data,  fn,  1  );
    },


    // Wrapper for delayed events that affect only the first trigger, then remove delay.
    delayedFirst:  function  (  types,  params,  selector,  data,  fn  )
    {
      // Calls the main 'delayed' function with the 'one' parameter set to 'first'.
      return  this.delayed(  types,  params,  selector,  data,  fn,  'first'  );
    },


    // Retrieves a list of event objects attached to an element.
    get_events:  function(  elem,  types,  selector,  fn  )
    {
      var  events          =  [];                               // Array to store matching event objects.
      var  rtypenamespace  =  /^([^\.]*)?(?:\.(.+))?$/;         // Regex to parse event type and namespace.
      var  elemEvents      =  (  parseFloat(  $().jquery  )  <  1.8  )  ?  $(  elem  ).data(  'events'  )  :  $._data(  elem,  'events'  );
      var  tns;                                                 // Temporary storage for type/namespace parts.
      var  type;                                                // Event type (e.g., 'click', 'mouseover').
      var  origType;                                            // Original event type if mapped (e.g., 'mouseenter' -> 'mouseover').
      var  eventType;                                           // Events registered for a specific type on the element.
      var  e;                                                   // Current event object being processed.

      // Handle parameter overloads for ( types [, fn] ).
      if (  selector  ===  false  ||  typeof  selector  ===  "function"  )
      {
        fn        =  selector;  // If selector is false or a function, it's the handler.
        selector  =  undefined; // Clear selector.
      }
      // If 'fn' is false, use jQuery's internal `returnFalse`.
      if (  fn  ===  false  )
      {
        fn  =  returnFalse;
      }

      // Normalize event types: replace 'hover' with 'mouseenter mouseleave'.
      types  =  types.replace(  /(?:^|\s)hover(\.\S+)?\b/,  "mouseenter$1 mouseleave$1"  )  ||  "";
      // Trim whitespace and split types into an array.
      types  =  jQuery.trim(  types  ).split(  " "  );

      // Iterate through each specified event type.
      for (  var  t  =  0;  t  <  types.length;  t++  )
      {
        tns      =  rtypenamespace.exec(  types[t]  )  ||  []; // Parse type and namespace.
        type     =  tns[1];                                    // Extract the base event type.
        origType =  tns[1];                                    // Initialize original type.

        // Support for 'mouseenter' and 'mouseleave' (mapped to 'mouseover'/'mouseout').
        if (  type  ==  'mouseenter'  )
        {
          type      =  'mouseover';  // Map mouseenter to mouseover.
          origType  =  'mouseenter'; // Keep original type for comparison.
        }
        else  if (  type  ==  'mouseleave'  )
        {
          type      =  'mouseout';   // Map mouseleave to mouseout.
          origType  =  'mouseleave'; // Keep original type for comparison.
        }
        else
        {
          origType  =  false; // No special mapping.
        }
        
        // Get all events registered for the current 'type' on the element.
        eventType  =  elemEvents[  type  ]  ||  [];

        // Iterate through each event handler found for this type.
        for (  var  i  in  eventType  )
        {
          e  =  eventType[i]; // Current event object.

          // Check if the original type matches (if specified) or if no original type filter.
          if (  (  origType  &&  origType  ==  e.origType  )  ||  !origType  )
          {
            // Check if the namespace matches or if no namespace filter is applied.
            if (  e.namespace  ==  tns[2]  ||  typeof(  tns[2]  )  ==  'undefined'  )
            {
              // If a selector is specified, check for a match.
              if (  selector  )
              {
                if (  e.selector  ==  selector  )
                {
                  // If a specific function is provided, check for a handler match.
                  if (  fn  )
                  {
                    if (  e.handler  ==  fn  )
                    {
                      events.push(  e  ); // Found a full match.
                    }
                  }
                  else
                  {
                    events.push(  e  ); // Match by selector, no function filter.
                  }
                }
              }
              else
              {
                events.push(  e  ); // No selector filter, match by type/namespace.
              }
            }
          }
        }
      }

      return  events; // Return the array of matching event objects.
    },


    // Retrieves an array of GUIDs for event handlers attached to an element.
    get_event_guids:  function(  elem,  types,  selector,  fn  )
    {
      var  guids   =  [];                                           // Array to store GUIDs.
      var  events  =  TLOC_Delayed.get_events(  elem,  types,  selector,  fn  ); // Get matching event objects.
      var  e;                                                       // Current event object.

      // Iterate through the retrieved event objects and extract their GUIDs.
      for (  var  i  in  events  )
      {
        e  =  events[i];
        guids.push(  e.guid  );
      }

      return  guids; // Return the array of GUIDs.
    },


    // Restores original (undelayed) event handlers to elements.
    removeDelay:  function(  types,  selector,  fn  )
    {
      // Handle the overload where 'types' is an object (map of types/handlers).
      if (  typeof  types  ===  "object"  )
      {
        // For each type in the object, recursively call 'removeDelay'.
        for (  var  type  in  types  )
        {
          this.removeDelay(  type,  selector,  types[  type  ]  );
        }
        return  this; // Return for chaining.
      }

      // Process each element in the jQuery collection.
      return  this.each(  function()
      {
        // Get all event objects that match the criteria.
        var  events  =  TLOC_Delayed.get_events(  this,  types,  selector,  fn  );
        var  e;     // Current event object.

        // For each matching event, restore its handler to the original function.
        for (  var  i  in  events  )
        {
          e          =  events[i];
          e.handler  =  TLOC_Delayed.originals[  e.guid  ]; // Revert to the original handler.
        }
      });
    },


    // Stops any currently pending delayed execution for matched event handlers.
    stopDelayed:  function(  types,  selector,  fn  )
    {
      // Handle the overload where 'types' is an object.
      if (  typeof  types  ===  "object"  )
      {
        // Recursively call 'stopDelayed' for each type in the object.
        for (  var  type  in  types  )
        {
          this.stopDelayed(  type,  selector,  types[  type  ]  );
        }
        return  this; // Return for chaining.
      }

      // Process each element in the jQuery collection.
      return  this.each(  function()
      {
        // Get the GUIDs of all event handlers that match the criteria.
        var  guids  =  TLOC_Delayed.get_event_guids(  this,  types,  selector,  fn  );
        var  i;      // Loop counter.

        // For each matching GUID, clear its associated timeout.
        for (  i  in  guids  )
        {
          // clearTimeout is used to prevent the delayed function from executing.
          clearTimeout(  TLOC_Delayed.functions[  guids[i]  ]  );
        }
      });
    },


    // Applies a debounce effect to event handlers.
    debounce:  function(  types,  selector,  data,  fn  )
    {
      // Process each element in the jQuery collection.
      return  this.each(  function()
      {
        // Calls the 'delayed' function with 'debounce' as the delay parameter.
        $(  this  ).delayed(  types,  'debounce',  selector,  data,  fn  );
      });
    }
  };


  // Extend jQuery's prototype with `delayed` method.
  $.fn.delayed  =  function(  method  )
  {
    // Delegates to TLOC_Delayed.delayed, preserving context and arguments.
    return  TLOC_Delayed['delayed'].apply(  this,  arguments  );
  };

  // Extend jQuery's prototype with `delayedOne` method.
  $.fn.delayedOne  =  function(  method  )
  {
    // Delegates to TLOC_Delayed.delayedOne.
    return  TLOC_Delayed['delayedOne'].apply(  this,  arguments  );
  };

  // Extend jQuery's prototype with `delayedFirst` method.
  $.fn.delayedFirst  =  function(  method  )
  {
    // Delegates to TLOC_Delayed.delayedFirst.
    return  TLOC_Delayed['delayedFirst'].apply(  this,  arguments  );
  };

  // Extend jQuery's prototype with `removeDelay` method.
  $.fn.removeDelay  =  function(  method  )
  {
    // Delegates to TLOC_Delayed.removeDelay.
    return  TLOC_Delayed['removeDelay'].apply(  this,  arguments  );
  };

  // Extend jQuery's prototype with `stopDelayed` method.
  $.fn.stopDelayed  =  function(  method  )
  {
    // Delegates to TLOC_Delayed.stopDelayed.
    return  TLOC_Delayed['stopDelayed'].apply(  this,  arguments  );
  };

  // Extend jQuery's prototype with `debounce` method.
  $.fn.debounce  =  function(  method  )
  {
    // Delegates to TLOC_Delayed.debounce.
    return  TLOC_Delayed['debounce'].apply(  this,  arguments  );
  };

})(  jQuery  ); // Pass jQuery object into the IIFE.