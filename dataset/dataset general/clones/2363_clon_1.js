/*
 * Dust - Asynchronous Templating Engine
 * Version: 0.6.0
 * Project Home: http://akdubya.github.com/dustjs
 *
 * (c) 2010 Aleksander Williams
 * License: MIT (http://opensource.org/licenses/MIT)
 *
 * This file contains the core functionalities of the Dust templating system.
 * It handles template compilation, rendering, and context management.
 */

var dust = { } ; // Main Dust.js object, holds all core functionalities and settings.

/**
 * Retrieves the global dust object.
 * This is a self-executing anonymous function to ensure 'this' context.
 * @returns {object} The global dust object.
 */
function getGlobal ( )
{
  return ( function ( )
  {
    // The 'this' context here will be the global object (window in browser, global in Node.js)
    // when called with .call(null) or .call(undefined).
    return this . dust ;
  } ) . call ( null ) ; // Explicitly setting 'this' to null/undefined for global context.
}

// Immediately Invoked Function Expression (IIFE) to encapsulate the dust library.
// It passes the 'dust' object as an argument, ensuring local scope and avoiding global pollution.
( function ( dust ) {

  // The cache stores compiled templates, making them reusable.
  dust . cache = { } ;

  /**
   * Registers a compiled template with a given name in the cache.
   * @param {string} name The unique name of the template.
   * @param {function} tmpl The compiled template function.
   * @returns {void}
   */
  dust . register = function ( name , tmpl ) {
    // A template must have a name to be registered.
    if ( ! name )
    {
      return ;
    }
    // Store the template function in the cache under its name.
    dust . cache [ name ] = tmpl ;
  } ;

  /**
   * Renders a template.
   * This is the entry point for rendering a template to a callback.
   * @param {string} name The name of the template to render.
   * @param {object} context The data context for rendering.
   * @param {function} callback The function to call when rendering is complete (err, out).
   * @returns {void}
   */
  dust . render = function ( name , context , callback )
  {
    // Create a new Stub object which manages the output and the callback.
    // The 'head' property of the Stub is the initial Chunk.
    var chunk = new Stub ( callback ) . head ;

    // Load and execute the template, passing the initial chunk and wrapped context.
    // The .end() call signals the completion of the template execution.
    dust . load ( name , chunk , Context . wrap ( context ) ) . end ( ) ;
  } ;

  /**
   * Streams a template's output.
   * This method returns a Stream object that emits 'data', 'error', and 'end' events.
   * @param {string} name The name of the template to stream.
   * @param {object} context The data context for rendering.
   * @returns {Stream} A Stream instance.
   */
  dust . stream = function ( name , context ) {
    var stream = new Stream ( ) ; // Create a new Stream object.

    // Schedule the template loading and rendering for the next tick of the event loop.
    // This prevents blocking and allows event listeners to be attached before rendering starts.
    dust . nextTick ( function ( ) {
      dust . load ( name , stream . head , Context . wrap ( context ) ) . end ( ) ;
    } ) ;

    return stream ; // Return the stream immediately.
  } ;

  /**
   * Renders a template directly from a source string.
   * This bypasses the cache and compiles the source on the fly.
   * @param {string} source The template source string.
   * @param {object} context The data context for rendering.
   * @param {function} callback The function to call when rendering is complete (err, out).
   * @returns {any} The result of the compiled function.
   */
  dust . renderSource = function ( source , context , callback ) {
    // Compile the source and immediately execute the resulting function.
    return dust . compileFn ( source ) ( context , callback ) ;
  } ;

  /**
   * Compiles a template source string into a render function.
   * This function can then be used repeatedly with different contexts.
   * @param {string} source The template source string.
   * @param {string} [name] Optional name for the compiled template (for caching, if needed later).
   * @returns {function} A function that takes context and callback to render the template.
   */
  dust . compileFn = function ( source , name ) {
    // Compile the source string and load it into a template function.
    var tmpl = dust . loadSource ( dust . compile ( source , name ) ) ;

    // Return a new render function.
    return function ( context , callback ) {
      // If a callback is provided, use a Stub; otherwise, use a Stream for asynchronous rendering.
      var master = callback ? new Stub ( callback ) : new Stream ( ) ;

      // Schedule the template execution for the next tick.
      dust . nextTick ( function ( ) {
        tmpl ( master . head , Context . wrap ( context ) ) . end ( ) ;
      } ) ;

      return master ; // Return the master object (Stub or Stream).
    } ;
  } ;

  /**
   * Loads a template by name from the cache or via an external loader.
   * This is a core internal function used by render and stream.
   * @param {string} name The name of the template to load.
   * @param {Chunk} chunk The current rendering chunk.
   * @param {Context} context The current rendering context.
   * @returns {Chunk} The chunk resulting from template execution.
   */
  dust . load = function ( name , chunk , context ) {
    var tmpl = dust . cache [ name ] ; // Try to retrieve the template from cache.

    if ( tmpl ) {
      // If found in cache, execute it immediately.
      return tmpl ( chunk , context ) ;
    } else {
      // If not in cache, check if an onLoad handler is defined.
      if ( dust . onLoad ) {
        // Map the chunk to handle asynchronous loading.
        return chunk . map ( function ( chunk ) {
          // Call the custom onLoad handler.
          dust . onLoad ( name , function ( err , src ) {
            if ( err )
            {
              // If there's an error during loading, set it on the chunk.
              return chunk . setError ( err ) ;
            }
            // If the template was not cached by another concurrent load, compile and cache it.
            if ( ! dust . cache [ name ] )
            {
              dust . loadSource ( dust . compile ( src , name ) ) ;
            }
            // Execute the loaded and cached template.
            dust . cache [ name ] ( chunk , context ) . end ( ) ;
          } ) ;
        } ) ;
      }
      // If no onLoad handler and not in cache, return an error.
      return chunk . setError ( new Error ( "Template Not Found: " + name ) ) ;
    }
  } ;

  /**
   * Loads a compiled template source string into the JavaScript runtime.
   * This uses `eval` to execute the compiled JavaScript code.
   * @param {string} source The compiled JavaScript source code.
   * @param {string} [path] Optional path, not currently used but might be for debugging.
   * @returns {function} The compiled template function.
   */
  dust . loadSource = function ( source , path ) {
    // DANGER: Eval is evil. But for compiled templates, it's often necessary.
    return eval ( source ) ;
  } ;

  // Provide a robust Array.isArray check.
  // This ensures compatibility across different JavaScript environments.
  if ( Array . isArray ) {
    dust . isArray = Array . isArray ;
  } else {
    // Fallback for older environments that don't support Array.isArray.
    dust . isArray = function ( arr ) {
      return Object . prototype . toString . call ( arr ) == "[object Array]" ;
    } ;
  }

  // nextTick provides a way to defer execution until the next event loop cycle.
  // It uses process.nextTick for Node.js and setTimeout(0) for browsers.
  dust . nextTick = ( function ( ) {
    if ( typeof process !== "undefined" ) {
      // Node.js environment
      return process . nextTick ;
    } else {
      // Browser environment or other non-Node.js
      return function ( callback ) {
        setTimeout ( callback , 0 ) ;
      } ;
    }
  } ) ( ) ; // Self-executing to determine the appropriate nextTick implementation.

  /**
   * Checks if a value is considered "empty" by Dust.
   * This includes empty arrays, null, undefined, false, and empty strings, but not 0.
   * @param {any} value The value to check.
   * @returns {boolean} True if the value is empty, false otherwise.
   */
  dust . isEmpty = function ( value ) {
    // Check for empty arrays.
    if ( dust . isArray ( value ) && ! value . length )
    {
      return true ;
    }
    // 0 is not considered empty in Dust.
    if ( value === 0 )
    {
      return false ;
    }
    // Generic check for falsy values (null, undefined, '', false).
    return ( ! value ) ;
  } ;

  /**
   * Applies filters to a string.
   * @param {string} string The input string.
   * @param {string|null} auto The automatic filter to apply (e.g., 'h' for HTML escape).
   * @param {Array<string>} filters An array of explicit filter names to apply.
   * @returns {string} The filtered string.
   */
  dust . filter = function ( string , auto , filters ) {
    // Apply explicit filters first.
    if ( filters ) {
      for ( var i = 0 , len = filters . length ; i < len ; i ++ ) {
        var name = filters [ i ] ;
        // 's' filter (for 'strict') disables auto-filtering.
        if ( name === "s" ) {
          auto = null ;
        } else {
          // Apply the named filter.
          string = dust . filters [ name ] ( string ) ;
        }
      }
    }
    // Apply automatic filter if it's still enabled.
    if ( auto ) {
      string = dust . filters [ auto ] ( string ) ;
    }
    return string ;
  } ;

  // Pre-defined filters for common use cases like escaping.
  dust . filters = {
    h : function ( value ) { return dust . escapeHtml ( value ) ; } , // HTML escape
    j : function ( value ) { return dust . escapeJs ( value ) ; } ,   // JavaScript escape
    u : encodeURI ,                                                  // URI escape
    uc : encodeURIComponent ,                                        // URI Component escape
    js : function ( value ) {
      if ( ! JSON ) {
        return value ;
      }
      return JSON . stringify ( value ) ;
    } , // JSON stringify
    jp : function ( value ) {
      if ( ! JSON ) {
        return value ;
      }
      return JSON . parse ( value ) ;
    }  // JSON parse
  } ;

  /**
   * Represents the rendering context.
   * It manages the data stack, global data, and block definitions.
   * @param {Stack} stack The current data stack.
   * @param {object} global Global data accessible from any context.
   * @param {Array<object>} blocks Block definitions.
   * @constructor
   */
  function Context ( stack , global , blocks ) {
    this . stack  = stack ;  // The data stack (linked list of data objects).
    this . global = global ; // Global context data.
    this . blocks = blocks ; // Block definitions for inheritance.
  }

  /**
   * Creates a base context from global data.
   * @param {object} global The global data object.
   * @returns {Context} A new base Context instance.
   */
  dust . makeBase = function ( global ) {
    // Start with an empty stack and the provided global data.
    return new Context ( new Stack ( ) , global ) ;
  } ;

  /**
   * Wraps an existing object into a Context if it's not already one.
   * @param {object|Context} context The object or existing Context.
   * @returns {Context} A Context instance.
   */
  Context . wrap = function ( context ) {
    if ( context instanceof Context ) {
      return context ; // Already a Context, return as is.
    }
    // If it's a plain object, create a new Context with it on the stack.
    return new Context ( new Stack ( context ) ) ;
  } ;

  /**
   * Retrieves a value from the current context stack.
   * It searches from the current head of the stack down to the global context.
   * @param {string} key The key to look up.
   * @returns {any|undefined} The value associated with the key, or undefined if not found.
   */
  Context . prototype . get = function ( key ) {
    var ctx = this . stack , // Start at the current stack frame.
        value ;

    // Iterate through the stack frames.
    while ( ctx ) {
      // Only consider objects on the stack.
      if ( ctx . isObject ) {
        value = ctx . head [ key ] ;
        // If the key exists (even if its value is null or false), return it.
        if ( ! ( value === undefined ) ) {
          return value ;
        }
      }
      ctx = ctx . tail ; // Move to the previous stack frame.
    }
    // If not found in stack, check the global context.
    return this . global ? this . global [ key ] : undefined ;
  } ;

  /**
   * Retrieves a value from the context using a path.
   * Similar to 'get' but allows for nested property access (e.g., 'user.address.street').
   * @param {boolean} cur Indicates if the current context head should be used.
   * @param {Array<string>} down An array of path segments.
   * @returns {any|undefined} The value at the specified path.
   */
  Context . prototype . getPath = function ( cur , down ) {
    var ctx = this . stack ,
        len = down . length ;

    if ( cur && len === 0 )
    {
      return ctx . head ; // Return the current head if path is empty and 'cur' is true.
    }
    if ( ! ctx . isObject )
    {
      return undefined ; // Cannot traverse if the current head is not an object.
    }
    ctx = ctx . head ; // Start traversal from the head of the current stack frame.
    var i = 0 ;
    while ( ctx && i < len ) {
      ctx = ctx [ down [ i ] ] ; // Traverse down the path.
      i ++ ;
    }
    return ctx ; // Return the final value or undefined.
  } ;

  /**
   * Pushes a new data object onto the context stack.
   * This creates a new Context with an updated stack.
   * @param {object} head The new data object to push.
   * @param {number} idx The current index (for loop contexts).
   * @param {number} len The total length (for loop contexts).
   * @returns {Context} A new Context instance with the updated stack.
   */
  Context . prototype . push = function ( head , idx , len ) {
    if ( head ) {
      // Add special properties for loop iteration if provided.
      head [ '$idx' ] = idx ; // Current index in a loop.
      head [ '$len' ] = len ; // Total length of the collection in a loop.
    }
    // Create a new Context with a new Stack frame.
    return new Context ( new Stack ( head , this . stack , idx , len ) , this . global , this . blocks ) ;
  } ;

  /**
   * Replaces the current head of the context stack.
   * Useful for changing the immediate data object without pushing a new frame.
   * @param {object} head The new head data object.
   * @returns {Context} A new Context instance with the rebased stack.
   */
  Context . prototype . rebase = function ( head ) {
    return new Context ( new Stack ( head ) , this . global , this . blocks ) ;
  } ;

  /**
   * Returns the data object at the current head of the context stack.
   * @returns {object} The current data object.
   */
  Context . prototype . current = function ( ) {
    return this . stack . head ;
  } ;

  /**
   * Retrieves a block definition from the context.
   * Blocks are used for template inheritance.
   * @param {string} key The name of the block.
   * @returns {function|undefined} The block function, or undefined if not found.
   */
  Context . prototype . getBlock = function ( key ) {
    var blocks = this . blocks ;

    if ( ! blocks )
    {
      return ; // No blocks defined in this context.
    }
    var len = blocks . length , fn ;
    // Iterate through blocks from most recent to oldest.
    while ( len -- ) {
      fn = blocks [ len ] [ key ] ;
      if ( fn )
      {
        return fn ; // Found the block.
      }
    }
  } ;

  /**
   * Adds new local block definitions to the context.
   * This is used when defining blocks within a template.
   * @param {object} locals An object containing block definitions.
   * @returns {Context} A new Context instance with the updated block stack.
   */
  Context . prototype . shiftBlocks = function ( locals ) {
    var blocks = this . blocks ;
    var newBlocks ; // Declare newBlocks variable.

    if ( locals ) {
      if ( ! blocks ) {
        newBlocks = [ locals ] ; // If no existing blocks, start a new array.
      } else {
        newBlocks = blocks . concat ( [ locals ] ) ; // Add new locals to existing blocks.
      }
      return new Context ( this . stack , this . global , newBlocks ) ;
    }
    return this ; // No locals to add, return current context.
  } ;

  /**
   * Represents a stack frame in the rendering context.
   * Stores the current data object, a pointer to the previous frame, and loop metadata.
   * @param {object} head The data object for this stack frame.
   * @param {Stack} tail The previous stack frame.
   * @param {number} idx The index for loop contexts.
   * @param {number} len The length for loop contexts.
   * @constructor
   */
  function Stack ( head , tail , idx , len ) {
    this . tail = tail ; // Reference to the previous stack frame.
    // Determine if the head is an object (and not an array).
    this . isObject = ! dust . isArray ( head ) && head && typeof head === "object" ;
    this . head = head ;   // The current data object.
    this . index = idx ;   // Loop index.
    this . of = len ;      // Loop length.
  }

  /**
   * A Stub is used for rendering to a single callback.
   * It collects all output and calls the callback once rendering is complete or an error occurs.
   * @param {function} callback The callback function (err, out).
   * @constructor
   */
  function Stub ( callback ) {
    this . head = new Chunk ( this ) ; // Initial chunk associated with this stub.
    this . callback = callback ;       // The callback to invoke.
    this . out = '' ;                 // Accumulates the output string.
  }

  /**
   * Flushes the Stub's chunks.
   * It iterates through available chunks, appends their data, and calls the callback when done.
   */
  Stub . prototype . flush = function ( ) {
    var chunk = this . head ;

    while ( chunk ) {
      if ( chunk . flushable ) {
        this . out += chunk . data ; // Append data from flushable chunks.
      } else if ( chunk . error ) {
        this . callback ( chunk . error ) ; // If an error, call callback with error.
        this . flush = function ( ) { } ;     // Disable further flushing.
        return ;
      } else {
        return ; // If not flushable and no error, stop and wait.
      }
      chunk = chunk . next ; // Move to the next chunk.
      this . head = chunk ;   // Update the head of the Stub.
    }
    this . callback ( null , this . out ) ; // All chunks processed, call callback with success.
  } ;

  /**
   * A Stream is used for rendering to an event emitter.
   * It emits 'data' events as chunks become available, 'error' for errors, and 'end' when done.
   * @constructor
   */
  function Stream ( ) {
    this . head = new Chunk ( this ) ; // Initial chunk for this stream.
  }

  /**
   * Flushes the Stream's chunks.
   * It iterates through available chunks and emits events.
   */
  Stream . prototype . flush = function ( ) {
    var chunk = this . head ;

    while ( chunk ) {
      if ( chunk . flushable ) {
        this . emit ( 'data' , chunk . data ) ; // Emit 'data' event.
      } else if ( chunk . error ) {
        this . emit ( 'error' , chunk . error ) ; // Emit 'error' event.
        this . flush = function ( ) { } ;           // Disable further flushing.
        return ;
      } else {
        return ; // Not flushable and no error, stop and wait.
      }
      chunk = chunk . next ; // Move to the next chunk.
      this . head = chunk ;   // Update the head of the Stream.
    }
    this . emit ( 'end' ) ; // All chunks processed, emit 'end' event.
  } ;

  /**
   * Emits an event with associated data.
   * @param {string} type The type of event (e.g., 'data', 'error', 'end').
   * @param {any} data The data to pass with the event.
   */
  Stream . prototype . emit = function ( type , data ) {
    var events = this . events ;

    if ( events && events [ type ] ) {
      events [ type ] ( data ) ; // Invoke the registered event handler.
    }
  } ;

  /**
   * Registers an event listener for a given event type.
   * @param {string} type The event type.
   * @param {function} callback The callback function to execute when the event is emitted.
   * @returns {Stream} The Stream instance for chaining.
   */
  Stream . prototype . on = function ( type , callback ) {
    if ( ! this . events ) {
      this . events = { } ; // Initialize events object if it doesn't exist.
    }
    this . events [ type ] = callback ; // Register the callback for the event type.
    return this ;
  } ;

  /**
   * Represents a piece of output being rendered.
   * Chunks are linked together to form a chain of output.
   * @param {Stub|Stream} root The root Stub or Stream managing this chunk.
   * @param {Chunk} [next] The next chunk in the chain.
   * @param {Tap} [taps] The current tap stack for this chunk.
   * @constructor
   */
  function Chunk ( root , next , taps ) {
    this . root = root ;       // Reference to the main Stub/Stream.
    this . next = next ;       // Next chunk in the linked list.
    this . data = '' ;         // The accumulated string data for this chunk.
    this . flushable = false ; // Flag indicating if this chunk is ready to be flushed.
    this . taps = taps ;       // Stack of tap functions to apply to data.
  }

  /**
   * Writes data to the current chunk, applying taps if present.
   * @param {string} data The data string to write.
   * @returns {Chunk} The current chunk for chaining.
   */
  Chunk . prototype . write = function ( data ) {
    var taps = this . taps ;

    if ( taps ) {
      data = taps . go ( data ) ; // Apply all tap functions.
    }
    this . data += data ; // Append the (potentially filtered) data.
    return this ;
  } ;

  /**
   * Signals that this chunk is complete and ready to be flushed.
   * @param {string} [data] Optional final data to write before ending.
   * @returns {Chunk} The current chunk for chaining.
   */
  Chunk . prototype . end = function ( data ) {
    if ( data ) {
      this . write ( data ) ; // Write any remaining data.
    }
    this . flushable = true ; // Mark as flushable.
    this . root . flush ( ) ; // Trigger flushing of the root Stub/Stream.
    return this ;
  } ;

  /**
   * Creates a new branch in the chunk chain for asynchronous operations.
   * The callback receives a new branch chunk, which it can write to.
   * The original chunk's next pointer is updated to include this branch.
   * @param {function} callback A function that receives the new branch chunk.
   * @returns {Chunk} A new cursor chunk, which will follow the branch.
   */
  Chunk . prototype . map = function ( callback ) {
    // cursor: This chunk will be the one after the branch completes.
    var cursor = new Chunk ( this . root , this . next , this . taps ) ,
        // branch: This is the new chunk for the asynchronous operation.
        // Its 'next' is the 'cursor'.
        branch = new Chunk ( this . root , cursor , this . taps ) ;

    this . next = branch ;       // The current chunk now points to the new branch.
    this . flushable = true ;    // Mark the current chunk as flushable.
    callback ( branch ) ;        // Execute the callback with the new branch.
    return cursor ;              // Return the cursor for further chaining on the main path.
  } ;

  /**
   * Pushes a new tap function onto the chunk's tap stack.
   * Taps are functions that transform output data.
   * @param {function} tap The tap function to add.
   * @returns {Chunk} The current chunk for chaining.
   */
  Chunk . prototype . tap = function ( tap ) {
    var taps = this . taps ;

    if ( taps ) {
      this . taps = taps . push ( tap ) ; // Push onto existing tap stack.
    } else {
      this . taps = new Tap ( tap ) ;     // Create a new tap stack.
    }
    return this ;
  } ;

  /**
   * Removes the top tap function from the chunk's tap stack.
   * @returns {Chunk} The current chunk for chaining.
   */
  Chunk . prototype . untap = function ( ) {
    this . taps = this . taps . tail ; // Pop from the tap stack.
    return this ;
  } ;

  /**
   * Renders a body (template block) with the current chunk and context.
   * @param {function} body The template function representing the body.
   * @param {Context} context The current rendering context.
   * @returns {Chunk} The chunk resulting from the body's execution.
   */
  Chunk . prototype . render = function ( body , context ) {
    return body ( this , context ) ;
  } ;

  /**
   * Handles rendering of references (`{key}`).
   * It retrieves the value, applies filters, and writes it to the chunk.
   * @param {any} elem The element to reference (can be a function, string, etc.).
   * @param {Context} context The current rendering context.
   * @param {string|null} auto Automatic filter.
   * @param {Array<string>} filters Explicit filters.
   * @returns {Chunk} The current chunk for chaining.
   */
  Chunk . prototype . reference = function ( elem , context , auto , filters ) {
    // If elem is a function, execute it to get the actual value.
    if ( typeof elem === "function" ) {
      elem = elem ( this , context , null , { auto : auto , filters : filters } ) ;
      if ( elem instanceof Chunk ) {
        return elem ; // If the function returns a chunk, continue with that chunk.
      }
    }
    // If the element is not empty, filter and write it.
    if ( ! dust . isEmpty ( elem ) ) {
      return this . write ( dust . filter ( elem , auto , filters ) ) ;
    } else {
      return this ; // Otherwise, return the current chunk without writing.
    }
  } ;

  /**
   * Handles rendering of sections (`{#key}`).
   * It iterates over arrays, renders conditional blocks, or executes functions.
   * @param {any} elem The element for the section (array, boolean, object, function).
   * @param {Context} context The current rendering context.
   * @param {object} bodies Contains 'block' (for truthy) and 'else' (for falsy) template functions.
   * @param {object} params Parameters passed to the section.
   * @returns {Chunk} The chunk resulting from the section's execution.
   */
  Chunk . prototype . section = function ( elem , context , bodies , params ) {
    // If elem is a function, execute it to get the actual value.
    if ( typeof elem === "function" ) {
      elem = elem ( this , context , bodies , params ) ;
      if ( elem instanceof Chunk ) {
        return elem ; // If the function returns a chunk, continue with that chunk.
      }
    }

    var body = bodies . block , // The main block to render if elem is truthy.
        skip = bodies [ 'else' ] ; // The 'else' block to render if elem is falsy.

    // If parameters are provided, push them onto the context.
    if ( params ) {
      context = context . push ( params ) ;
    }

    // Handle arrays: iterate and render the body for each item.
    if ( dust . isArray ( elem ) ) {
      if ( body ) {
        var len = elem . length ,
            chunk = this ;
        for ( var i = 0 ; i < len ; i ++ ) {
          // Push each array item onto the context stack with its index and length.
          chunk = body ( chunk , context . push ( elem [ i ] , i , len ) ) ;
        }
        return chunk ;
      }
    } else if ( elem === true ) {
      // Handle boolean true: render the main body.
      if ( body )
      {
        return body ( this , context ) ;
      }
    } else if ( elem || elem === 0 ) {
      // Handle truthy values (including 0): push the element onto context and render body.
      if ( body )
      {
        return body ( this , context . push ( elem ) ) ;
      }
    } else if ( skip ) {
      // Handle falsy values: render the 'else' block.
      return skip ( this , context ) ;
    }
    return this ; // If nothing rendered, return the current chunk.
  } ;

  /**
   * Handles rendering of exists blocks (`{?key}`).
   * Renders 'block' if elem is not empty, 'else' otherwise.
   * @param {any} elem The element to check for existence.
   * @param {Context} context The current rendering context.
   * @param {object} bodies Contains 'block' and 'else' template functions.
   * @returns {Chunk} The current chunk for chaining.
   */
  Chunk . prototype . exists = function ( elem , context , bodies ) {
    var body = bodies . block ,
        skip = bodies [ 'else' ] ;

    if ( ! dust . isEmpty ( elem ) ) {
      if ( body )
      {
        return body ( this , context ) ;
      }
    } else if ( skip ) {
      return skip ( this , context ) ;
    }
    return this ;
  } ;

  /**
   * Handles rendering of notexists blocks (`{^key}`).
   * Renders 'block' if elem is empty, 'else' otherwise.
   * @param {any} elem The element to check for non-existence.
   * @param {Context} context The current rendering context.
   * @param {object} bodies Contains 'block' and 'else' template functions.
   * @returns {Chunk} The current chunk for chaining.
   */
  Chunk . prototype . notexists = function ( elem , context , bodies ) {
    var body = bodies . block ,
        skip = bodies [ 'else' ] ;

    if ( dust . isEmpty ( elem ) ) {
      if ( body )
      {
        return body ( this , context ) ;
      }
    } else if ( skip ) {
      return skip ( this , context ) ;
    }
    return this ;
  } ;

  /**
   * Handles rendering of block definitions and calls (`{+block}`).
   * It can define a block or render a block from the context.
   * @param {function} elem The block definition function (if defining).
   * @param {Context} context The current rendering context.
   * @param {object} bodies Contains 'block' template function.
   * @returns {Chunk} The current chunk for chaining.
   */
  Chunk . prototype . block = function ( elem , context , bodies ) {
    var body = bodies . block ;

    if ( elem ) {
      body = elem ; // If an element is provided, it overrides the default body.
    }

    if ( body ) {
      return body ( this , context ) ; // Render the block.
    }
    return this ; // No block to render.
  } ;

  /**
   * Handles rendering of partials (`{>partial}`).
   * Loads and renders another template.
   * @param {string|function} elem The name of the partial or a function that returns the name.
   * @param {Context} context The current rendering context.
   * @param {object} params Parameters to push onto the context for the partial.
   * @returns {Chunk} The chunk resulting from the partial's execution.
   */
  Chunk . prototype . partial = function ( elem , context , params ) {
    var ctx = context . stack ,
        tempHead = ctx . head ; // Store the current head for later re-attachment.

    if ( params ) {
      // Rebase context to remove the current head for a moment.
      context = context . rebase ( ctx . tail ) ;
      // Push parameters onto the context.
      context = context . push ( params ) ;
      // Re-attach the original head after parameters.
      context = context . push ( tempHead ) ;
    }

    // If elem is a function, capture its output to get the partial name.
    if ( typeof elem === "function" ) {
      return this . capture ( elem , context , function ( name , chunk ) {
        dust . load ( name , chunk , context ) . end ( ) ; // Load and render the partial.
      } ) ;
    }
    // Otherwise, directly load and render the partial by name.
    return dust . load ( elem , this , context ) ;
  } ;

  /**
   * Handles rendering of helper calls (`{@helper}`).
   * Delegates to registered helper functions.
   * @param {string} name The name of the helper.
   * @param {Context} context The current rendering context.
   * @param {object} bodies Contains 'block' and other body functions.
   * @param {object} params Parameters passed to the helper.
   * @returns {Chunk} The chunk resulting from the helper's execution.
   */
  Chunk . prototype . helper = function ( name , context , bodies , params ) {
    // Call the registered helper function.
    return dust . helpers [ name ] ( this , context , bodies , params ) ;
  } ;

  /**
   * Captures the output of a body function into a string.
   * Useful for passing template output as a string to helpers or other functions.
   * @param {function} body The template function whose output needs to be captured.
   * @param {Context} context The current rendering context.
   * @param {function} callback A callback (out, chunk) that receives the captured string.
   * @returns {Chunk} The current chunk for chaining.
   */
  Chunk . prototype . capture = function ( body , context , callback ) {
    return this . map ( function ( chunk ) {
      // Create a temporary Stub to capture the output of the body.
      var stub = new Stub ( function ( err , out ) {
        if ( err ) {
          chunk . setError ( err ) ; // If capture fails, set error on the main chunk.
        } else {
          callback ( out , chunk ) ; // Call the provided callback with the captured output.
        }
      } ) ;
      body ( stub . head , context ) . end ( ) ; // Execute the body with the capture stub.
    } ) ;
  } ;

  /**
   * Sets an error on the current chunk and triggers flushing.
   * @param {Error} err The error object.
   * @returns {Chunk} The current chunk for chaining.
   */
  Chunk . prototype . setError = function ( err ) {
    this . error = err ;         // Store the error.
    this . root . flush ( ) ;    // Trigger flushing to propagate the error.
    return this ;
  } ;

  /**
   * Represents a node in the tap stack.
   * Taps are functions applied to data as it's written to a chunk.
   * @param {function} head The current tap function.
   * @param {Tap} [tail] The previous tap in the stack.
   * @constructor
   */
  function Tap ( head , tail ) {
    this . head = head ; // The current tap function.
    this . tail = tail ; // The previous tap in the stack.
  }

  /**
   * Pushes a new tap function onto this tap stack.
   * @param {function} tap The new tap function.
   * @returns {Tap} A new Tap instance with the new tap at the head.
   */
  Tap . prototype . push = function ( tap ) {
    return new Tap ( tap , this ) ;
  } ;

  /**
   * Applies all tap functions in the stack to a given value.
   * @param {any} value The initial value.
   * @returns {any} The value after all taps have been applied.
   */
  Tap . prototype . go = function ( value ) {
    var tap = this ;

    // Iterate through the tap stack from head to tail.
    while ( tap ) {
      value = tap . head ( value ) ; // Apply the current tap function.
      tap = tap . tail ;             // Move to the next tap.
    }
    return value ;
  } ;

  // Regular expressions for HTML escaping.
  var HCHARS = new RegExp ( /[&<>\"\']/ ) , // Characters that need HTML escaping.
      AMP    = /&/g ,                      // Ampersand global regex.
      LT     = /</g ,                      // Less than global regex.
      GT     = />/g ,                      // Greater than global regex.
      QUOT   = /\"/g ,                     // Double quote global regex.
      SQUOT  = /\'/g ;                     // Single quote global regex.

  /**
   * Escapes HTML special characters in a string.
   * @param {string} s The string to escape.
   * @returns {string} The HTML-escaped string.
   */
  dust . escapeHtml = function ( s ) {
    if ( typeof s === "string" ) {
      if ( ! HCHARS . test ( s ) ) {
        return s ; // If no special characters, return original string.
      }
      // Replace special characters.
      return s . replace ( AMP , '&amp;' ) . replace ( LT , '&lt;' ) . replace ( GT , '&gt;' ) . replace ( QUOT , '&quot;' ) . replace ( SQUOT , '&#39;' ) ;
    }
    return s ; // Return non-string values as is.
  } ;

  // Regular expressions for JavaScript escaping.
  var JCHARS = new RegExp ( /[\x00-\x1F\x7F-\u009F\u00AD\u0600-\u0605\u061C\u06DD\u070F\u0890-\u0891\u08E2\u180E\u200B-\u200F\u202F\u2060-\u2064\u206A-\u206F\u20SPR\uFEFF\uFFF9-\uFFFC]/ ) ,
      LT_SLASH_GT = /<\//g ;

  /**
   * Escapes JavaScript special characters in a string.
   * This is particularly important for embedding JSON or other string data directly into HTML <script> tags.
   * It escapes various control characters and also `</` to prevent script termination issues.
   * @param {string} s The string to escape.
   * @returns {string} The JavaScript-escaped string.
   */
  dust . escapeJs = function ( s ) {
    if ( typeof s === "string" ) {
      if ( ! JCHARS . test ( s ) ) {
        return s ; // If no special characters, return original string.
      }
      // Replace </ with <\/ to prevent script termination.
      return s . replace ( LT_SLASH_GT , '<\\/' ) ;
    }
    return s ; // Return non-string values as is.
  } ;

  // Global dust helpers object.
  // These are custom functions that can be called within templates using {@helper}.
  dust . helpers = { } ;

} ) ( dust ) ; // End of IIFE, passing 'dust' object.

// If running in a Node.js-like environment, export the dust object.
if ( typeof exports !== 'undefined' ) {
  if ( typeof module !== 'undefined' && module . exports ) {
    exports = module . exports = dust ;
  }
  exports . dust = dust ;
} else {
  // If in a browser environment, make dust available globally.
  this . dust = dust ;
}

// Ensure the dust object is available globally, even if not explicitly exported.
// This handles cases where dust might be loaded directly in a browser.
if ( typeof define === 'function' && define . amd ) {
  // AMD support for RequireJS etc.
  define ( function ( ) {
    return dust ;
  } ) ;
}