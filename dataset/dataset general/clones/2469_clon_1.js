/*
 * This file is part of the Leaflet mapping library.
 * It provides core utilities and foundational classes.
 *
 * Leaflet - a JavaScript library for interactive maps, optimized for mobile.
 * Visit: http://leafletjs.com
 *
 * Copyright (c) 2010-2013 by Vladimir Agafonkin
 * Copyright (c) 2010-2011 by CloudMade
 * All rights reserved.
 *
 * This specific version is '0.7.3'.
 */
( function (window, document, undefined) {

  // Store the original 'L' global variable, if it exists, to prevent conflicts.
  var oldL = window.L,

      // Initialize the main Leaflet object.
      L = {};

  // Set the current version of the Leaflet library.
  L.version = '0.7.3';

  // Check for CommonJS/Node.js module environment.
  if (typeof module === 'object' && typeof module.exports === 'object')
  {
    module.exports = L; // Export L for Node.js.
  }
  // Check for Asynchronous Module Definition (AMD) environment.
  else if (typeof define === 'function' && define.amd)
  {
    define(L); // Define L as an AMD module.
  }

  // Define Leaflet as a global 'L' variable.
  // The original 'L' (if any) is saved for potential restoration.

  L.noConflict = function () {

    // Restore the 'L' global to its previous value.
    window.L = oldL;

    // Return the Leaflet object to allow chaining.
    return this;
  };

  // Assign the Leaflet object to the global scope.
  window.L = L;


/*
 * L.Util: This object encapsulates a collection of essential utility functions
 *         that are leveraged across the entire Leaflet codebase.
 *         These functions provide common operations like object extension,
 *         function binding, unique ID stamping, and more.
 */

L.Util = {

  // Function to extend an object with properties from one or more other objects.
  // Signature: (destination_object[, source_object_1, source_object_2, ...]) -> destination_object
  extend: function (dest) {

    // Retrieve all source objects from the arguments, starting from the second argument.
    var sources = Array.prototype.slice.call(arguments, 1),

        // Declare loop counters and temporary variables.
        i, j, len, src;

    // Iterate through each source object.
    for (j = 0, len = sources.length; j < len; j++) {

      // Get the current source object, or an empty object if it's null/undefined.
      src = sources[j] || {};

      // Iterate over the properties of the current source object.
      for (i in src) {

        // Ensure the property belongs to the object itself, not its prototype chain.
        if (src.hasOwnProperty(i)) {

          // Copy the property from the source to the destination.
          dest[i] = src[i];
        }
      }
    }

    // Return the modified destination object.
    return dest;
  },

  // Function to bind a function's 'this' context to a specific object.
  // Optionally, it can also pre-fill arguments.
  // Signature: (function_to_bind, context_object[, arg1, arg2, ...]) -> bound_function
  bind: function (fn, obj) {

    // Capture any additional arguments passed after 'fn' and 'obj'.
    // These will be prepended to the arguments of the bound function.
    var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;

    // Return a new function that, when called, will execute 'fn' with 'obj' as its 'this' context.
    return function () {

      // Apply the function 'fn' with the specified 'obj' context.
      // Use the pre-filled 'args' if they exist, otherwise use the arguments passed to the returned function.
      return fn.apply(obj, args || arguments);
    };
  },

  // Provides a unique ID stamping mechanism for objects.
  // This is an immediately invoked function expression (IIFE) to create a closure.
  stamp: (function () {

    // Private counter for generating unique IDs.
    var lastId = 0,

        // The property key used to store the unique ID on an object.
        key = '_leaflet_id';

    // The function returned by the IIFE, which is assigned to L.Util.stamp.
    return function (obj) {

      // Assign a unique ID to the object if it doesn't already have one.
      // The '||' operator ensures that if obj[key] is falsy (e.g., undefined),
      // it will be assigned the new incremented ID.
      obj[key] = obj[key] || ++lastId;

      // Return the object's unique ID.
      return obj[key];
    };
  }()), // The IIFE is invoked here.

  // Helper function to invoke a method on each property of an object.
  // Used primarily for event handling where `types` can be an object map.
  // Signature: (object_map, method_to_call, context_for_method[, extra_arg1, ...]) -> boolean
  invokeEach: function (obj, method, context) {
    var i, args; // Declare variables.

    // Check if the first argument is an object (e.g., an event map).
    if (typeof obj === 'object') {

      // Collect any additional arguments passed after 'obj', 'method', and 'context'.
      args = Array.prototype.slice.call(arguments, 3);

      // Iterate over each property in the object.
      for (i in obj) {

        // Invoke the 'method' with the specified 'context'.
        // The arguments passed to 'method' will be: the property name, the property value,
        // and then any collected extra arguments.
        method.apply(context, [i, obj[i]].concat(args));
      }

      // Indicate that the operation was performed on an object.
      return true;
    }

    // Indicate that the operation was not performed (because 'obj' was not an object).
    return false;
  },

  // Limits the execution of a function to a specified interval.
  // If the function is called multiple times within the interval,
  // it will only execute once, and then once more after the interval
  // if it was called again during the locked period.
  // Signature: (function_to_limit, time_interval_ms, context_object) -> debounced_function
  limitExecByInterval: function (fn, time, context) {

    // 'lock' prevents immediate execution if already running.
    var lock,
        // 'execOnUnlock' flags if a call occurred while locked.
        execOnUnlock;

    // Return the debounced wrapper function.
    return function wrapperFn() {

      // Capture the arguments for potential delayed execution.
      var args = arguments;

      // If currently locked, set flag to execute on unlock and exit.
      if (lock) {
        execOnUnlock = true;
        return;
      }

      // Acquire the lock.
      lock = true;

      // Set a timeout to release the lock and potentially re-execute.
      setTimeout(function () {
        lock = false; // Release the lock.

        // If a call was made while locked, execute the function again.
        if (execOnUnlock) {
          wrapperFn.apply(context, args); // Re-execute with captured args.
          execOnUnlock = false;           // Reset the flag.
        }
      }, time); // Wait for the specified time interval.

      // Execute the original function immediately for the first call.
      fn.apply(context, args);
    };
  },

  // A simple function that always returns 'false'. Useful as a no-op placeholder.
  falseFn: function () {
    return false;
  },

  // Formats a number to a specified number of decimal digits.
  // Signature: (number, number_of_digits) -> formatted_number
  formatNum: function (num, digits) {
    // Calculate the power of 10 for rounding. Default to 5 digits if not specified.
    var pow = Math.pow(10, digits || 5);

    // Round the number to the desired precision.
    return Math.round(num * pow) / pow;
  },

  // Trims leading and trailing whitespace from a string.
  // Uses native String.prototype.trim if available, otherwise a regex fallback.
  // Signature: (string) -> trimmed_string
  trim: function (str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
  },

  // Splits a string into an array of words, handling multiple spaces.
  // Signature: (string) -> array_of_words
  splitWords: function (str) {
    // Trim whitespace and then split by one or more whitespace characters.
    return L.Util.trim(str).split(/\s+/);
  },

  // Sets or merges options for an object.
  // Signature: (object_to_configure, new_options_object) -> merged_options
  setOptions: function (obj, options) {
    // Extend the object's existing options with new ones, creating a new object.
    obj.options = L.extend({}, obj.options, options);
    return obj.options;
  },

  // Generates a URL parameter string from an object.
  // Signature: (parameters_object, existing_url_string, boolean_uppercase_keys) -> query_string
  getParamString: function (obj, existingUrl, uppercase) {

    var params = []; // Array to store encoded parameter key-value pairs.

    // Iterate over the properties of the input object.
    for (var i in obj) {
      // Encode both the key (optionally uppercased) and the value, then add to the array.
      params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
    }

    // Determine whether to prepend with '?' or '&'.
    // If no existing URL or no '?' in existing URL, use '?'. Otherwise, use '&'.
    return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
  },

  // Simple template engine for strings. Replaces {key} placeholders.
  // Signature: (template_string, data_object) -> rendered_string
  template: function (str, data) {
    // Use a regular expression to find all occurrences of { variable_name }.
    return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {

      // Retrieve the value associated with the key from the data object.
      var value = data[key];

      // If the value is undefined, throw an error.
      if (value === undefined) {
        throw new Error('No value provided for variable ' + str);
      }
      // If the value is a function, execute it with the entire data object as context.
      else if (typeof value === 'function') {
        value = value(data);
      }

      // Return the resolved value.
      return value;
    });
  },

  // Determines if a given object is an array.
  // Uses native Array.isArray if available, otherwise a cross-browser fallback.
  // Signature: (any_object) -> boolean
  isArray: Array.isArray || function (obj) {
    // Fallback: Check the internal [[Class]] property via Object.prototype.toString.
    return (Object.prototype.toString.call(obj) === '[object Array]');
  },

  // A base64 encoded transparent GIF. Used as a placeholder for empty images
  // to avoid broken image icons in certain browsers/contexts.
  emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
}; // End of L.Util object definition.

(function () { // Start of IIFE for animation frame utilities.

  // This section is inspired by Paul Irish's work on requestAnimationFrame polyfills.
  // Reference: http://paulirish.com/2011/requestanimationframe-for-smart-animating/

  // Helper function to get a browser-prefixed version of a function.
  function getPrefixed(name) {
    var i, fn,
        prefixes = ['webkit', 'moz', 'o', 'ms']; // Common browser prefixes.

    // Iterate through prefixes until the function is found.
    for (i = 0; i < prefixes.length && !fn; i++) {
      fn = window[prefixes[i] + name];
    }

    return fn; // Return the prefixed function or undefined.
  }

  // Variable to track the last animation frame time for the timeoutDefer fallback.
  var lastTime = 0;

  // Fallback for requestAnimationFrame using setTimeout, aiming for 60fps (16ms).
  function timeoutDefer(fn) {
    var time = +new Date(), // Current time in milliseconds.
        // Calculate time to wait to achieve approximately 60fps.
        timeToCall = Math.max(0, 16 - (time - lastTime));

    lastTime = time + timeToCall; // Update last time for the next call.
    return window.setTimeout(fn, timeToCall); // Schedule the function.
  }

  // Determine the best available requestAnimationFrame function.
  // Tries native, then prefixed, then the setTimeout fallback.
  var requestFn = window.requestAnimationFrame ||
                  getPrefixed('RequestAnimationFrame') ||
                  timeoutDefer;

  // Determine the best available cancelAnimationFrame function.
  // Tries native, then prefixed, then clearTimeout fallback.
  var cancelFn = window.cancelAnimationFrame ||
                 getPrefixed('CancelAnimationFrame') ||
                 getPrefixed('CancelRequestAnimationFrame') ||
                 function (id) {
                   window.clearTimeout(id); // Fallback to clearTimeout.
                 };

  // Expose requestAnimFrame on L.Util.
  // Signature: (function, context_object, boolean_immediate_if_timeout, DOM_element_for_RAF)
  L.Util.requestAnimFrame = function (fn, context, immediate, element) {
    // Bind the function to its context.
    fn = L.bind(fn, context);

    // If 'immediate' is true and we're using the setTimeout fallback, execute immediately.
    // This is useful for initial rendering that doesn't need to wait for a frame.
    if (immediate && requestFn === timeoutDefer) {
      fn();
    } else {
      // Otherwise, use the determined requestAnimationFrame function.
      return requestFn.call(window, fn, element);
    }
  };

  // Expose cancelAnimFrame on L.Util.
  // Signature: (animation_frame_id)
  L.Util.cancelAnimFrame = function (id) {
    // Only attempt to cancel if an ID was provided.
    if (id) {
      cancelFn.call(window, id);
    }
  };

}()); // End of animation frame IIFE.

// Provide convenient shortcuts for frequently used L.Util functions directly on the L object.
L.extend    = L.Util.extend;
L.bind      = L.Util.bind;
L.stamp     = L.Util.stamp;
L.setOptions= L.Util.setOptions;


/*
 * L.Class: This is the cornerstone for Leaflet's object-oriented programming (OOP) model.
 *          It provides a class-like inheritance mechanism, inspired by
 *          the works of John Resig and Dean Edwards on JavaScript inheritance.
 *          All core Leaflet components inherit from L.Class.
 */

L.Class = function () {}; // The base class constructor, essentially a no-op.

// The `extend` method allows creating new classes that inherit from `L.Class`
// or other classes derived from `L.Class`.
// Signature: (properties_object) -> new_Class_constructor
L.Class.extend = function (props) {

  // This will be the constructor function for the new, extended class.
  var NewClass = function () {

    // If an `initialize` method is defined on the prototype, call it as the constructor.
    if (this.initialize) {
      this.initialize.apply(this, arguments);
    }

    // After initialization, execute any registered constructor hooks.
    if (this._initHooks) {
      this.callInitHooks();
    }
  };

  // Create a temporary constructor to set up the prototype chain without
  // invoking the parent constructor. This is a common pattern for classical inheritance.
  var F = function () {};
  F.prototype = this.prototype; // Inherit from the parent's prototype.

  // Create the new prototype object for `NewClass`.
  var proto = new F();
  proto.constructor = NewClass; // Set the constructor property back to `NewClass`.

  NewClass.prototype = proto; // Assign the newly created prototype to `NewClass`.

  // Inherit static properties from the parent class.
  // This copies properties directly attached to the class constructor itself, not its prototype.
  for (var i in this) {
    if (this.hasOwnProperty(i) && i !== 'prototype') {
      NewClass[i] = this[i];
    }
  }

  // If `props` contains a 'statics' object, mix those properties into the `NewClass` constructor.
  if (props.statics) {
    L.extend(NewClass, props.statics);
    delete props.statics; // Remove statics from `props` as they are handled.
  }

  // If `props` contains an 'includes' array, mix those objects' properties into the new prototype.
  if (props.includes) {
    // Use `L.Util.extend` to merge properties from all included objects into `proto`.
    L.Util.extend.apply(null, [proto].concat(props.includes));
    delete props.includes; // Remove includes from `props`.
  }

  // Merge options: If both the parent prototype and `props` define `options`,
  // create a new options object by extending the parent's with the new ones.
  if (props.options && proto.options) {
    props.options = L.extend({}, proto.options, props.options);
  }

  // Finally, mix all remaining properties from `props` into the new prototype.
  L.extend(proto, props);

  // Initialize an empty array for constructor hooks on the new prototype.
  proto._initHooks = [];

  // Store a reference to the parent class for `__super__` property (for debugging/introspection).
  var parent = this;
  // jshint camelcase: false // Suppress JSHint warning for non-camelCase property.
  NewClass.__super__ = parent.prototype;

  // Add a method to the prototype for calling all registered constructor hooks.
  proto.callInitHooks = function () {

    // Prevent hooks from being called multiple times.
    if (this._initHooksCalled) {
      return;
    }

    // Call parent's init hooks first, if they exist.
    if (parent.prototype.callInitHooks) {
      parent.prototype.callInitHooks.call(this);
    }

    this._initHooksCalled = true; // Mark hooks as called for this instance.

    // Iterate through and execute each hook function.
    for (var i = 0, len = proto._initHooks.length; i < len; i++) {
      proto._initHooks[i].call(this); // Execute each hook in the context of the current instance.
    }
  };

  return NewClass; // Return the newly created class constructor.
};


// Helper method to add properties directly to a class's prototype.
// Useful for mixins or extending functionality after class definition.
// Signature: (properties_object)
L.Class.include = function (props) {
  L.extend(this.prototype, props);
};

// Helper method to merge new default options into a class's existing options.
// These options will be inherited by instances of the class.
// Signature: (options_object)
L.Class.mergeOptions = function (options) {
  L.extend(this.prototype.options, options);
};

// Method to add a constructor hook. These hooks are functions
// that get called automatically when an instance of the class (or its subclasses) is created.
// Signature: (function_to_call) OR (method_name_string, arg1, arg2, ...)
L.Class.addInitHook = function (fn) {
  // Capture any additional arguments passed after the function/method name.
  var args = Array.prototype.slice.call(arguments, 1);

  // If 'fn' is a function, use it directly.
  // Otherwise, assume 'fn' is a string method name and create a wrapper function
  // that calls that method on the instance with the captured arguments.
  var init = typeof fn === 'function' ? fn : function () {
    this[fn].apply(this, args);
  };

  // Ensure the _initHooks array exists on the prototype, then add the new hook.
  this.prototype._initHooks = this.prototype._initHooks || [];
  this.prototype._initHooks.push(init);
};


/*
 * L.Mixin.Events: This mixin provides a robust custom event system
 *                 that can be easily integrated into any Leaflet class.
 *                 It allows objects to emit, listen for, and handle
 *                 various types of events, facilitating loose coupling.
 */

// Internal key used to store event listeners on an object.
var eventsKey = '_leaflet_events';

// Initialize the L.Mixin namespace.
L.Mixin = {};

// The L.Mixin.Events object defines the event handling interface.
L.Mixin.Events = {

  // Registers an event listener for one or more event types.
  // Can take a string of space-separated types or an object map {type: handler}.
  // Signature: (string_types, function_handler[, object_context]) OR (object_map[, object_context])
  addEventListener: function (types, fn, context) {

    // If 'types' is an object (e.g., {'click': handler1, 'mouseover': handler2}),
    // iterate over its properties and call addEventListener for each.
    if (L.Util.invokeEach(types, this.addEventListener, this, fn, context)) {
      return this; // Return 'this' for chaining if object map was processed.
    }

    // Initialize the event storage if it doesn't exist.
    var events = this[eventsKey] = this[eventsKey] || {},
        // Generate a unique ID for the context object if it's different from 'this'.
        // This optimizes removal for context-bound listeners.
        contextId = context && context !== this && L.stamp(context),
        // Declare loop and temporary variables.
        i, len, event, type, indexKey, indexLenKey, typeIndex;

    // Split the 'types' string into an array of individual event type strings.
    types = L.Util.splitWords(types);

    // Iterate over each event type.
    for (i = 0, len = types.length; i < len; i++) {
      event = {
        action: fn,                  // The actual handler function.
        context: context || this     // The context in which the handler will be executed.
      };
      type = types[i];               // Current event type string.

      // If a specific context is provided and has an ID, store the listener in a context-indexed structure.
      if (contextId) {
        // Storing listeners by context ID significantly boosts performance
        // when removing many layers with context-bound listeners.

        indexKey = type + '_idx';      // Key for the context-indexed map for this event type.
        indexLenKey = indexKey + '_len'; // Key to track the count of unique contexts for this type.

        typeIndex = events[indexKey] = events[indexKey] || {}; // Get/create the context index map.

        // If this is the first listener for this context ID under this event type.
        if (!typeIndex[contextId]) {
          typeIndex[contextId] = []; // Initialize an array for listeners of this context.

          // Increment the count of unique contexts for this event type.
          events[indexLenKey] = (events[indexLenKey] || 0) + 1;
        }

        typeIndex[contextId].push(event); // Add the event listener to the context-specific array.

      } else {
        // If no specific context ID, store the listener in a general array for the event type.
        events[type] = events[type] || []; // Get/create the general listeners array.
        events[type].push(event);          // Add the event listener.
      }
    }

    return this; // Allow method chaining.
  },

  // Checks if there are any registered listeners for a given event type.
  // Signature: (string_event_type) -> boolean
  hasEventListeners: function (type) {
    var events = this[eventsKey]; // Get the event storage.

    // Return true if events exist AND either:
    // 1. The event type has general listeners AND its array is not empty.
    // 2. The event type has context-indexed listeners AND there's at least one unique context.
    return !!events && ((type in events && events[type].length > 0) ||
                        (type + '_idx' in events && events[type + '_idx_len'] > 0));
  },

  // Removes one or more event listeners.
  // Can remove specific listeners, all listeners of a type, or all listeners entirely.
  // Signature: ([string_types, function_handler, object_context]) OR (object_map[, object_context])
  removeEventListener: function (types, fn, context) {

    // If no event storage exists, there's nothing to remove.
    if (!this[eventsKey]) {
      return this;
    }

    // If 'types' is not specified, clear all listeners.
    if (!types) {
      return this.clearAllEventListeners();
    }

    // If 'types' is an object map, invoke removeEventListener for each entry.
    if (L.Util.invokeEach(types, this.removeEventListener, this, fn, context)) {
      return this;
    }

    var events = this[eventsKey],
        contextId = context && context !== this && L.stamp(context),
        i, len, type, listeners, j, indexKey, indexLenKey, typeIndex, removed;

    // Split the 'types' string into individual event type strings.
    types = L.Util.splitWords(types);

    // Iterate over each event type to remove listeners.
    for (i = 0, len = types.length; i < len; i++) {
      type = types[i];
      indexKey = type + '_idx';
      indexLenKey = indexKey + '_len';

      typeIndex = events[indexKey]; // Get the context-indexed map for this type.

      // If no specific function is provided, clear all listeners for this event type.
      if (!fn) {
        delete events[type];        // Delete general listeners array.
        delete events[indexKey];    // Delete context-indexed map.
        delete events[indexLenKey]; // Delete context count.

      } else {
        // Get the relevant listeners array: context-specific or general.
        listeners = contextId && typeIndex ? typeIndex[contextId] : events[type];

        // If listeners exist for this type/context.
        if (listeners) {
          // Iterate backwards to safely remove items during iteration.
          for (j = listeners.length - 1; j >= 0; j--) {
            // Check if the handler function and context match.
            if ((listeners[j].action === fn) && (!context || (listeners[j].context === context))) {
              removed = listeners.splice(j, 1); // Remove the listener.
              // Set the removed listener's action to a no-op to prevent issues
              // if it's currently being iterated over by fireEvent.
              removed[0].action = L.Util.falseFn;
            }
          }

          // If this was a context-indexed listener and its array is now empty,
          // remove the context entry and decrement the count.
          if (context && typeIndex && (listeners.length === 0)) {
            delete typeIndex[contextId];
            events[indexLenKey]--;
          }
        }
      }
    }

    return this; // Allow method chaining.
  },

  // Removes all registered event listeners from the object.
  clearAllEventListeners: function () {
    delete this[eventsKey]; // Simply delete the entire event storage.
    return this;            // Allow method chaining.
  },

  // Fires an event of a given type, optionally with data.
  // All registered listeners for that type will be invoked.
  // Signature: (string_event_type[, object_event_data])
  fireEvent: function (type, data) {
    // If no listeners for this type, do nothing.
    if (!this.hasEventListeners(type)) {
      return this;
    }

    // Create an event object, extending provided data with type and target.
    var event = L.Util.extend({}, data, { type: type, target: this });

    var events = this[eventsKey],
        listeners, i, len, typeIndex, contextId;

    // First, process general listeners (not context-indexed).
    if (events[type]) {
      // Create a shallow copy of the listeners array to prevent infinite loops
      // if listeners are added/removed during event dispatch.
      listeners = events[type].slice();

      // Invoke each listener.
      for (i = 0, len = listeners.length; i < len; i++) {
        listeners[i].action.call(listeners[i].context, event);
      }
    }

    // Next, process context-indexed listeners.
    typeIndex = events[type + '_idx'];

    // Iterate over each unique context ID for this event type.
    for (contextId in typeIndex) {
      // Create a shallow copy of the listeners for the current context ID.
      listeners = typeIndex[contextId].slice();

      if (listeners) {
        // Invoke each listener for this context.
        for (i = 0, len = listeners.length; i < len; i++) {
          listeners[i].action.call(listeners[i].context, event);
        }
      }
    }

    return this; // Allow method chaining.
  },

  // Registers a one-time event listener. It will be automatically removed after being fired once.
  // Signature: (string_types, function_handler[, object_context])
  addOneTimeEventListener: function (types, fn, context) {

    // If 'types' is an object map, invoke addOneTimeEventListener for each entry.
    if (L.Util.invokeEach(types, this.addOneTimeEventListener, this, fn, context)) {
      return this;
    }

    // Create a wrapper handler function that will remove both the original listener
    // and itself after execution.
    var handler = L.bind(function () {
      this
          .removeEventListener(types, fn, context)       // Remove the original listener.
          .removeEventListener(types, handler, context); // Remove this one-time handler.
    }, this);

    // Register both the original listener and the one-time handler.
    // The one-time handler ensures cleanup.
    return this
        .addEventListener(types, fn, context)
        .addEventListener(types, handler, context);
  }
};

// Provide aliases for event methods for more concise usage.
L.Mixin.Events.on   = L.Mixin.Events.addEventListener;
L.Mixin.Events.off  = L.Mixin.Events.removeEventListener;
L.Mixin.Events.once = L.Mixin.Events.addOneTimeEventListener;
L.Mixin.Events.fire = L.Mixin.Events.fireEvent;

}(window, document, undefined) ); // End of the main Leaflet IIFE.