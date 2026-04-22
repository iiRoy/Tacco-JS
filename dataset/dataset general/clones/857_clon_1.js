/*!
 *
 *  Copyright 2009-2012 Kris Kowal under the terms of the MIT License.
 *  Found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 *  Portions contributed by Tyler Close.
 *  Copyright 2007-2009 Tyler Close under the terms of the MIT X license.
 *  Found at http://www.opensource.org/licenses/mit-license.html
 *  Forked at ref_send.js version: 2009-05-11
 *
 *  Additional contributions by Mark Miller.
 *  Copyright (C) 2011 Google Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  You may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  This file is part of the Q.js library.
 *  It provides a robust promise implementation for JavaScript.
 *
 */

( function ( definition ) {
  // Turn off strict mode for this function so we can assign to global.Q
  /* jshint strict: false */

  // This file is designed to function properly as a <script> tag, or as a
  // module using CommonJS (NodeJS) or RequireJS module formats.
  // In CommonJS/NodeJS/RequireJS environments, the module exports the Q API.
  // When executed as a simple <script> tag, it creates a global `Q` object.

  // Montage Require integration check.
  if ( typeof bootstrap === "function" ) {
    bootstrap( "promise", definition );

  // CommonJS environment detection.
  } else if ( typeof exports === "object" ) {
    module.exports = definition();

  // RequireJS environment detection.
  } else if ( typeof define === "function" && define.amd ) {
    define( definition );

  // SES (Secure EcmaScript) environment detection.
  } else if ( typeof ses !== "undefined" ) {
    if ( !ses.ok() ) {
      return;
    } else {
      ses.makeQ = definition;
    }

  // Standard <script> tag usage, create a global Q.
  } else {
    Q = definition();
  }

} )( function () {
"use strict"; // Enforce strict mode for the main definition function.

var hasStacks = false; // Flag to check if Error.prototype.stack is available.

try {
  throw new Error();
} catch ( e ) {
  hasStacks = !!e.stack; // Set to true if `e.stack` exists.
}

// All code after this point will be filtered from stack traces reported
// by Q, improving readability by removing internal Q frames.
var qStartingLine = captureLine(); // Captures the line number where Q's internal code begins.
var qFileName; // Will store the filename of the Q library.

// shims: A collection of polyfills and utility functions.

/**
 * A no-operation function. Does nothing.
 * Used as a placeholder or default callback.
 */
function noop() {
  /* This function intentionally left blank. */
}

/**
 * Use the fastest possible means to execute a task in a future turn
 * of the event loop. This is crucial for non-blocking asynchronous operations.
 *
 * This implementation uses a linked list to queue tasks.
 */
var nextTick = ( function () {
  // A linked list of tasks. The head node is a sentinel.
  var head = { task: void 0, next: null };
  var tail = head; // Tail always points to the last added node.
  var flushing = false; // Flag to prevent re-entry into flush.
  var requestTick = void 0; // Function to schedule the flush.
  var isNodeJS = false; // Flag to detect if running in a Node.js environment.

  /**
   * Processes all tasks currently in the queue.
   * Tasks are executed in the order they were added.
   */
  function flush() {
    /* jshint loopfunc: true */ // Suppress jshint warning about loop functions.

    while ( head.next ) {
      head = head.next; // Move to the next task in the queue.
      var task = head.task; // Get the task function.
      head.task = void 0; // Clear the task reference to prevent memory leaks.
      var domain = head.domain; // Get the associated domain for Node.js.

      if ( domain ) {
        head.domain = void 0; // Clear domain reference.
        domain.enter(); // Enter the domain.
      }

      try {
        task(); // Execute the task.

      } catch ( e ) {
        if ( isNodeJS ) {
          // In Node.js, uncaught exceptions are fatal by default.
          // Re-throw synchronously to interrupt the flush.

          // Ensure continuation if an uncaught exception is suppressed
          // by listening "uncaughtException" events (e.g., by domains).
          // Continue flushing in the next event loop tick.
          if ( domain ) {
            domain.exit();
          }
          setTimeout( flush, 0 ); // Schedule the remainder of the flush.
          if ( domain ) {
            domain.enter(); // Re-enter if we're throwing within a domain.
          }

          throw e; // Re-throw the exception.

        } else {
          // In browsers, uncaught exceptions are generally not fatal.
          // Re-throw asynchronously to avoid blocking the event loop and
          // allowing other tasks to complete.
          setTimeout( function () {
            throw e;
          }, 0 );
        }
      }

      if ( domain ) {
        domain.exit(); // Exit the domain after task completion or error.
      }
    }

    flushing = false; // Reset flushing flag once all tasks are processed.
  }

  /**
   * Schedules a task to be executed in a future turn of the event loop.
   * @param {Function} task The function to execute.
   */
  nextTick = function ( task ) {
    // Append the new task to the linked list.
    tail = tail.next = {
      task: task,
      domain: isNodeJS && process.domain, // Capture current domain if in Node.js.
      next: null // New tail has no next task yet.
    };

    // If not currently flushing, schedule a flush operation.
    if ( !flushing ) {
      flushing = true; // Set flushing flag.
      requestTick(); // Request a tick to run the flush.
    }
  };

  // Determine the best way to schedule a tick based on the environment.
  if ( typeof process !== "undefined" && process.nextTick ) {
    // Node.js environment (versions before 0.9).
    // Note: Some fake-Node environments (like Mocha) have `process` but no `nextTick`.
    isNodeJS = true;

    requestTick = function () {
      process.nextTick( flush ); // Use Node.js's native `nextTick`.
    };

  } else if ( typeof setImmediate === "function" ) {
    // Modern browsers (IE10+), Node.js 0.9+, or polyfills like NobleJS/setImmediate.
    if ( typeof window !== "undefined" ) {
      requestTick = setImmediate.bind( window, flush ); // Bind to window for browser compatibility.
    } else {
      requestTick = function () {
        setImmediate( flush ); // Use `setImmediate` directly.
      };
    }

  } else if ( typeof MessageChannel !== "undefined" ) {
    // Modern browser environments (e.g., Chrome, Firefox, Edge).
    // This is an efficient way to schedule non-blocking tasks.
    // See: http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    channel.port1.onmessage = flush; // When a message is received, flush tasks.
    requestTick = function () {
      channel.port2.postMessage( 0 ); // Send a message to trigger onmessage.
    };

  } else {
    // Fallback for older browsers or environments without better alternatives.
    // `setTimeout(..., 0)` is the least efficient but most compatible option.
    requestTick = function () {
      setTimeout( flush, 0 ); // Schedule flush with a zero delay.
    };
  }

  return nextTick; // Export the configured nextTick function.
} )();

// Attempt to make generics safe in the face of downstream modifications.
// This practice is often referred to as "safe meta-programming" or "primordial security".
// It is primarily a security measure, ensuring that built-in methods are not
// tampered with by untrusted code, or to avoid performance hits from
// prototype chain lookups.
// See Mark Miller’s explanation: http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
function uncurryThis( f ) {
  var call = Function.call; // Store a reference to the original Function.prototype.call.
  return function () {
    return call.apply( f, arguments ); // Apply the function `f` with the given arguments.
  };
}
// An alternative, but generally slower, implementation using bind:
// uncurryThis = Function_bind.bind(Function_bind.call);
// Performance comparison: http://jsperf.com/uncurrythis

// Uncurried version of Array.prototype.slice.
// Allows `array_slice(someArray, 0)` instead of `Array.prototype.slice.call(someArray, 0)`.
var array_slice = uncurryThis( Array.prototype.slice );

// Uncurried version of Array.prototype.reduce, with a shim for older environments.
var array_reduce = uncurryThis(
  Array.prototype.reduce || function ( callback, basis ) {
    var index = 0,
      length = this.length;
    // If an initial value (`basis`) is not provided,
    // the first element of the array is used as the initial value.
    if ( arguments.length === 1 ) {
      // Seek to the first value in the array, handling sparse arrays.
      do {
        if ( index in this ) {
          basis = this[ index++ ];
          break;
        }
        if ( ++index >= length ) {
          throw new TypeError(); // If array is empty or sparse, and no basis provided.
        }
      } while ( 1 );
    }
    // Perform the reduction.
    for ( ; index < length; index++ ) {
      // Account for sparse arrays by checking `index in this`.
      if ( index in this ) {
        basis = callback( basis, this[ index ], index, this ); // Pass current value, index, and array.
      }
    }
    return basis;
  }
);

// Uncurried version of Array.prototype.indexOf, with a basic shim.
var array_indexOf = uncurryThis(
  Array.prototype.indexOf || function ( value ) {
    // This is a simple shim, not fully spec-compliant for all edge cases,
    // but sufficient for its intended use within Q.
    for ( var i = 0; i < this.length; i++ ) {
      if ( this[ i ] === value ) {
        return i; // Found the value, return its index.
      }
    }
    return -1; // Value not found.
  }
);

// Uncurried version of Array.prototype.map, with a shim.
var array_map = uncurryThis(
  Array.prototype.map || function ( callback, thisp ) {
    var self = this; // Capture `this` context.
    var collect = []; // Array to store mapped results.
    // Use `array_reduce` to iterate and apply the callback.
    array_reduce( self, function ( undefined, value, index ) {
      // Push the result of the callback, with `thisp` as context.
      collect.push( callback.call( thisp, value, index, self ) );
    }, void 0 ); // `void 0` ensures no initial basis is used for reduce.
    return collect;
  }
);

// Object.create polyfill for older environments.
// Creates a new object with the specified prototype object and properties.
var object_create = Object.create || function ( prototype ) {
  /** @constructor */
  function Type() { } // A temporary constructor function.
  Type.prototype = prototype; // Set its prototype.
  return new Type(); // Return a new instance with the desired prototype.
};

// Uncurried version of Object.prototype.hasOwnProperty.
var object_hasOwnProperty = uncurryThis( Object.prototype.hasOwnProperty );

// Object.keys polyfill. Returns an array of a given object's own enumerable property names.
var object_keys = Object.keys || function ( object ) {
  var keys = [];
  for ( var key in object ) {
    // Ensure that the property belongs to the object itself, not its prototype chain.
    if ( object_hasOwnProperty( object, key ) ) {
      keys.push( key );
    }
  }
  return keys;
};

/**
 * Checks if a value is an object (and not null).
 * @param {*} value The value to check.
 * @returns {boolean} True if the value is an object, false otherwise.
 */
function isObject( value ) {
  // `Object(value)` converts primitives to their wrapper objects.
  // This comparison works because `Object(value)` will be strictly
  // equal to `value` if `value` is already an object.
  return value === Object( value );
}

// iterator related shims for handling different iterable types.

/**
 * Returns an iterator for a given value.
 * Supports objects with `iterator()` method, `next()` method, or array-like objects.
 * @param {*} values The value to iterate over.
 * @returns {object} An iterator object with a `next()` method.
 * @throws {Error} If the value is not iterable.
 */
function iterate( values ) {
  if ( !values ) {
    throw new Error( "Can't iterate: " + values );
  } else if ( typeof values.iterator === "function" ) {
    return values.iterator(); // Protocol for objects providing their own iterator.
  } else if ( typeof values.next === "function" ) {
    return values; // Already an iterator.
  } else if ( typeof values.length === "number" ) {
    return array_iterate( values ); // Array-like object.
  } else {
    throw new Error( "Can't iterate: " + values );
  }
}

/**
 * Creates an iterator for an array-like object.
 * Handles sparse arrays.
 * @param {ArrayLike} values The array-like object.
 * @returns {object} An iterator with `next()` and `send()` methods.
 */
function array_iterate( values ) {
  var index = 0; // Current index for iteration.

  /**
   * Returns the next item in the iteration sequence.
   * @returns {object} An object with `value` and `index`, or `done: true`.
   */
  function next() {
    // Skip over sparse elements until a valid index or end of array.
    while ( index < values.length && !( index in values ) ) {
      index++;
    }
    if ( index < values.length ) {
      return { value: values[ index ], index: index++ }; // Return current value and increment index.
    } else {
      return { done: true }; // Iteration complete.
    }
  }
  return { next: next, send: next }; // `send` is an alias for `next` for compatibility.
}

// long stack traces: Enhances error stack traces for better debugging.

var STACK_JUMP_SEPARATOR = "From previous event:"; // Marker for concatenating stack traces.

/**
 * Transforms an error stack trace by removing internal Q frames and concatenating
 * with the stack trace of a promise chain, if available.
 * @param {Error} error The error object.
 * @param {Promise} promise The promise that originated or propagated the error.
 */
function makeStackTraceLong( error, promise ) {
  // Only proceed if stack traces are supported and the error/promise have stack info.
  if ( hasStacks &&
    promise.stack &&
    typeof error === "object" &&
    error !== null &&
    error.stack &&
    error.stack.indexOf( STACK_JUMP_SEPARATOR ) === -1 // Avoid re-processing already long stacks.
  ) {
    var stacks = [];
    // Collect stack traces from the promise chain (source property).
    for ( var p = promise; !!p; p = p.source ) {
      if ( p.stack ) {
        stacks.unshift( p.stack ); // Add to the beginning to maintain chronological order.
      }
    }
    stacks.unshift( error.stack ); // Add the current error's stack.

    // Join all collected stacks with a separator.
    var concatedStacks = stacks.join( "\n" + STACK_JUMP_SEPARATOR + "\n" );
    // Filter out internal frames from the combined stack.
    error.stack = filterStackString( concatedStacks );
  }
}

/**
 * Filters a stack trace string to remove internal Q and Node.js frames.
 * @param {string} stackString The raw stack trace string.
 * @returns {string} The filtered stack trace.
 */
function filterStackString( stackString ) {
  var lines = stackString.split( "\n" );
  var desiredLines = [];
  for ( var i = 0; i < lines.length; ++i ) {
    var line = lines[ i ];

    // Keep lines that are not internal to Q or Node.js, and are not empty.
    if ( !isInternalFrame( line ) && !isNodeFrame( line ) && line ) {
      desiredLines.push( line );
    }
  }
  return desiredLines.join( "\n" );
}

/**
 * Checks if a stack line corresponds to an internal Node.js frame.
 * @param {string} stackLine A single line from a stack trace.
 * @returns {boolean} True if it's a Node.js internal frame.
 */
function isNodeFrame( stackLine ) {
  return stackLine.indexOf( "(module.js:" ) !== -1 ||
    stackLine.indexOf( "(node.js:" ) !== -1;
}

/**
 * Extracts the filename and line number from a stack trace line.
 * Handles different browser and Node.js stack trace formats.
 * @param {string} stackLine A single line from a stack trace.
 * @returns {Array<string, number>|null} An array `[filename, lineNumber]` or null if not parsed.
 */
function getFileNameAndLineNumber( stackLine ) {
  // Format 1: Named functions (Chrome/Node.js) "at functionName (filename:lineNumber:columnNumber)"
  // IE10 can have "Anonymous function" as name.
  var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec( stackLine );
  if ( attempt1 ) {
    return [ attempt1[ 1 ], Number( attempt1[ 2 ] ) ];
  }

  // Format 2: Anonymous functions (Chrome/Node.js) "at filename:lineNumber:columnNumber"
  var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec( stackLine );
  if ( attempt2 ) {
    return [ attempt2[ 1 ], Number( attempt2[ 2 ] ) ];
  }

  // Format 3: Firefox style "function@filename:lineNumber" or "@filename:lineNumber"
  var attempt3 = /.*@(.+):(\d+)$/.exec( stackLine );
  if ( attempt3 ) {
    return [ attempt3[ 1 ], Number( attempt3[ 2 ] ) ];
  }

  return null; // No match found.
}

// Placeholder for the line number where Q's internal code ends.
// This will be set dynamically once the Q object is fully constructed.
var qEndingLine;

/**
 * Checks if a stack line corresponds to an internal Q.js frame.
 * @param {string} stackLine A single line from a stack trace.
 * @returns {boolean} True if it's an internal Q frame.
 */
function isInternalFrame( stackLine ) {
  var fileNameAndLineNumber = getFileNameAndLineNumber( stackLine );

  if ( !fileNameAndLineNumber ) {
    return false; // Cannot parse, assume not internal.
  }

  var fileName = fileNameAndLineNumber[ 0 ];
  var lineNumber = fileNameAndLineNumber[ 1 ];

  // Check if the frame is within the Q file and within its code range.
  return fileName === qFileName &&
    lineNumber >= qStartingLine &&
    lineNumber <= qEndingLine;
}

/**
 * Captures the current line number and filename to identify Q's code boundaries
 * for stack trace filtering.
 * @returns {number|void} The line number, or undefined if stacks are not supported.
 */
function captureLine() {
  if ( !hasStacks ) {
    return; // Cannot capture without stack support.
  }

  try {
    throw new Error(); // Generate an error to get a stack trace.
  } catch ( e ) {
    var lines = e.stack.split( "\n" );
    // Heuristic to find the relevant line:
    // Some browsers include the error message on the first line.
    var firstLine = lines[ 0 ].indexOf( "@" ) > 0 ? lines[ 1 ] : lines[ 2 ];
    var fileNameAndLineNumber = getFileNameAndLineNumber( firstLine );
    if ( !fileNameAndLineNumber ) {
      return; // Could not parse the file and line number.
    }

    qFileName = fileNameAndLineNumber[ 0 ]; // Store the filename.
    return fileNameAndLineNumber[ 1 ]; // Return the line number.
  }
}

/**
 * Creates a deprecated version of a function, logging a warning when called.
 * @param {Function} callback The original function.
 * @param {string} name The name of the deprecated function/feature.
 * @param {string} alternative The suggested alternative function/feature.
 * @returns {Function} A wrapper function that logs a warning and then calls the original.
 */
function deprecate( callback, name, alternative ) {
  return function () {
    // Only warn if console and console.warn are available.
    if ( typeof console !== "undefined" &&
      typeof console.warn === "function" ) {
      // Log a warning message including the call stack where deprecation occurred.
      console.warn( name + " is deprecated, use " + alternative +
        " instead.", new Error( "" ).stack );
    }
    // Call the original function with its original context and arguments.
    return callback.apply( callback, arguments );
  };
}

// end of shims.
// beginning of real work: The core Q promise implementation.

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems into Q promises.
 * This is the main entry point for creating promises.
 * @param {*} value An immediate reference, a promise, or a thenable.
 * @returns {Promise} A Q promise.
 */
function Q( value ) {
  // If the object is already a Q Promise, return it directly.
  // This enables the `resolve` function to be used to create references from
  // objects and tolerably coerce non-promises to promises without re-wrapping.
  if ( Q.isPromise( value ) ) {
    return value;
  }

  // If the value is "promise-alike" (has a `then` method), coerce it into a Q promise.
  if ( Q.isPromiseAlike( value ) ) {
    return coerce( value );
  } else {
    // Otherwise, the value is an immediate reference; fulfill it immediately.
    return fulfill( value );
  }
}
Q.resolve = Q; // `Q.resolve` is an alias for `Q`.

/**
 * Performs a task in a future turn of the event loop.
 * This is a public API for scheduling asynchronous operations.
 * @param {Function} task The function to execute.
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be generated and used.
 * Setting this to `true` can help debug complex promise chains.
 */
Q.longStackSupport = false;

/**
 * Constructs a {promise, resolve, reject} object.
 * This is the standard way to create a "deferred" object, which allows
 * external control over the promise's state.
 *
 * `resolve` is a callback to invoke with a more resolved value for the promise.
 *   - To fulfill the promise, invoke `resolve` with any value that is not a thenable.
 *   - To reject the promise, invoke `resolve` with a rejected thenable, or
 *     invoke `reject` with the reason directly.
 *   - To resolve the promise to another thenable, thus putting it in the same state,
 *     invoke `resolve` with that other thenable.
 *
 * `reject` is a callback to invoke with the reason for rejection.
 */
Q.defer = defer;

/**
 * Creates a deferred object.
 * @returns {Deferred} An object containing `promise`, `resolve`, and `reject` methods.
 */
function defer() {
  // `messages` is an array: indicates the promise has not yet been resolved.
  // `messages` is `undefined`: indicates the promise has been resolved.
  // Each element in `messages` is an array of arguments to forward to the
  // resolved promise's `promiseDispatch` method.
  var messages = [],
    progressListeners = [], // Listeners for progress notifications.
    resolvedPromise; // The promise this deferred object resolves to.

  var deferred = object_create( defer.prototype ); // Create a new deferred object.
  var promise = object_create( Promise.prototype ); // Create a new promise object.

  // The core dispatch mechanism for the promise.
  // This method handles how operations (`op`) are applied to the promise.
  promise.promiseDispatch = function ( resolve, op, operands ) {
    var args = array_slice( arguments ); // Capture all arguments.
    if ( messages ) {
      messages.push( args ); // If not resolved, queue the operation.
      // If the operation is a 'when' with a progress callback, store it.
      if ( op === "when" && operands[ 1 ] ) { // progress operand is the second one
        progressListeners.push( operands[ 1 ] );
      }
    } else {
      // If already resolved, dispatch directly to the resolved promise.
      nextTick( function () {
        resolvedPromise.promiseDispatch.apply( resolvedPromise, args );
      } );
    }
  };

  // ... (rest of the Q implementation)
  // The code provided ends abruptly here.
  // I will continue the clone up to the provided boundary.

  // This is the point where `qEndingLine` should ideally be captured for stack filtering.
  // Since the provided code snippet ends mid-function, I'll place it logically here.
  // In a full Q.js file, this would be at the very end of the module's definition.
  // For the purpose of this exercise, I'll assume this is the end of the "code"
  // that needs to be filtered.
  qEndingLine = captureLine();
}
} );