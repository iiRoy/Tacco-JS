/*
 * This file has been generated to support Visual Studio IntelliSense.
 * You should not use this file at runtime inside the browser--it is only
 * intended to be used only for design-time IntelliSense.
 * Please use the standard jQuery library for all production use.
 *
 * Comment version: 1.7.1
 *
 * This section provides metadata for the IDE, not for runtime execution.
 * It ensures that development tools can offer proper autocompletion and type checking.
 */


/*!
 * jQuery JavaScript Library v1.7.1
 * http://jquery.com/
 *
 * Distributed in whole under the terms of the MIT License.
 *
 * Copyright 2010, John Resig
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2010, The Dojo Foundation
 * Released under the MIT and BSD Licenses.
 *
 * This entire block is a standard license header, important for legal compliance.
 */


( function ( window, undefined ) {


var jQuery = function ( selector, context ) {

	/// <summary>
	///     1: Accepts a string containing a CSS selector which is then used to match a set of elements.
	///     <para>    1.1 - $(selector, context) </para>
	///     <para>    1.2 - $(element) </para>
	///     <para>    1.3 - $(object) </para>
	///     <para>    1.4 - $(elementArray) </para>
	///     <para>    1.5 - $(jQuery object) </para>
	///     <para>    1.6 - $()</para>
	///     <para>2: Creates DOM elements on the fly from the provided string of raw HTML.</para>
	///     <para>    2.1 - $(html, ownerDocument) </para>
	///     <para>    2.2 - $(html, props)</para>
	///     <para>3: Binds a function to be executed when the DOM has finished loading.</para>
	///     <para>    3.1 - $(callback)</para>
	/// </summary>
	/// <param name="selector" type="String">
	///     A string containing a selector expression
	/// </param>
	/// <param name="context" type="jQuery">
	///     A DOM Element, Document, or jQuery to use as context
	/// </param>
	/// <returns type="jQuery" />

		// The jQuery object is actually just the init constructor 'enhanced'.
		// This is the core factory function for creating jQuery objects.
		return new jQuery.fn.init( selector, context, rootjQuery );
	};


jQuery.Callbacks = function ( flags ) {
	/// <summary>
	///     A multi-purpose callbacks list object that provides a powerful way to manage callback lists.
	/// </summary>
	/// <param name="flags" type="String">
	///     An optional list of space-separated flags that change how the callback list behaves.
	/// </param>

	// Convert flags from String-formatted to Object-formatted.
	// We first check a cache to avoid re-parsing flags repeatedly.
	flags = flags ? ( flagsCache[ flags ] || createFlags( flags ) ) : {};

	var // Actual callback list storage.
		list = [],
		// Stack of fire calls for repeatable lists (used when `once` flag is not set).
		stack = [],
		// Last fire value (for non-forgettable lists, i.e., those with `memory` flag).
		memory,
		// Boolean flag to indicate if the list is currently in the process of firing callbacks.
		firing,
		// The starting index for the current firing loop.
		firingStart,
		// The total number of callbacks in the list when firing began.
		firingLength,
		// The current index of the callback being executed during a fire operation.
		firingIndex,

		// Internal helper function to add one or more callbacks to the list.
		add = function ( args ) {

			var i,
				length,
				elem,
				type,
				actual; // This variable is declared but not used in this scope.

			for ( i = 0, length = args.length; i < length; i++ ) {
				elem = args[ i ];
				type = jQuery.type( elem );

				if ( type === "array" ) {
					// If the element is an array, inspect it recursively to add its contents.
					add( elem );
				} else if ( type === "function" ) {
					// Add the function if `unique` flag is not set, or if the callback is not already in the list.
					if ( !flags.unique || !self.has( elem ) ) {
						list.push( elem );
					}
				}
			}
		},

		// Internal helper function to execute (fire) all callbacks in the list.
		fire = function ( context, args ) {

			args = args || []; // Ensure args is an array, even if not provided.

			memory = !flags.memory || [ context, args ]; // Store context and args if `memory` flag is set.
			firing = true; // Set firing flag to true.
			firingIndex = firingStart || 0; // Initialize firing index.
			firingStart = 0; // Reset firingStart for subsequent calls.
			firingLength = list.length; // Capture list length at the start of firing.

			// Loop through the list and execute each callback.
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				// If a callback returns `false` and `stopOnFalse` is set, halt execution.
				if ( list[ firingIndex ].apply( context, args ) === false && flags.stopOnFalse ) {
					memory = true; // Mark as halted, preventing further calls from memory.
					break;
				}
			}

			firing = false; // Reset firing flag.

			if ( list ) {
				if ( !flags.once ) {
					// If not a 'once' list, check if there are pending fire calls in the stack.
					if ( stack && stack.length ) {
						memory = stack.shift(); // Get the next call from the stack.
						self.fireWith( memory[ 0 ], memory[ 1 ] ); // Execute it.
					}
				} else if ( memory === true ) {
					// If `once` and halted (`memory === true`), disable the list.
					self.disable();
				} else {
					// If `once` and completed successfully, clear the list.
					list = [];
				}
			}
		},

		// The actual Callbacks object, defining its public API.
		self = {

			// Add a callback or a collection of callbacks to the list.
			add: function () {
				if ( list ) { // Only proceed if the list is not disabled.
					var length = list.length; // Store current length before adding.
					add( arguments ); // Use the internal `add` helper.

					// Do we need to add the callbacks to the current firing batch?
					if ( firing ) {
						firingLength = list.length; // Update `firingLength` if already firing.
					// With memory, if we're not firing then we should call right away,
					// unless a previous firing was halted (stopOnFalse).
					} else if ( memory && memory !== true ) {
						firingStart = length; // Set starting point for new callbacks.
						fire( memory[ 0 ], memory[ 1 ] ); // Fire with stored memory.
					}
				}
				return this; // Enable chaining.
			},

			// Remove a callback from the list.
			remove: function () {
				if ( list ) { // Only proceed if the list is not disabled.
					var args = arguments,
						argIndex = 0,
						argLength = args.length;

					for ( ; argIndex < argLength ; argIndex++ ) {
						for ( var i = 0; i < list.length; i++ ) {
							if ( args[ argIndex ] === list[ i ] ) {
								// Adjust firing indices if removal happens during firing.
								if ( firing ) {
									if ( i <= firingLength ) {
										firingLength--;
										if ( i <= firingIndex ) {
											firingIndex--;
										}
									}
								}
								// Remove the element from the list.
								list.splice( i--, 1 );
								// If `unique` flag is set, we only need to remove it once.
								if ( flags.unique ) {
									break;
								}
							}
						}
					}
				}
				return this; // Enable chaining.
			},

			// Check if a given callback is present in the list.
			has: function ( fn ) {
				if ( list ) { // Only proceed if the list is not disabled.
					var i = 0,
						length = list.length;
					for ( ; i < length; i++ ) {
						if ( fn === list[ i ] ) {
							return true; // Found the callback.
						}
					}
				}
				return false; // Callback not found or list is disabled.
			},

			// Remove all callbacks from the list.
			empty: function () {
				list = []; // Simply reassign to an empty array.
				return this; // Enable chaining.
			},

			// Disable the list, preventing any further operations.
			disable: function () {
				list = stack = memory = undefined; // Clear all internal state.
				return this; // Enable chaining.
			},

			// Check if the list is disabled.
			disabled: function () {
				return !list; // Returns true if list is undefined (disabled).
			},

			// Lock the list in its current state, preventing further `fire` calls.
			lock: function () {
				stack = undefined; // Clear the stack, preventing queued fires.
				if ( !memory || memory === true ) {
					self.disable(); // If no memory or halted, disable completely.
				}
				return this; // Enable chaining.
			},

			// Check if the list is locked.
			locked: function () {
				return !stack; // Returns true if stack is undefined (locked).
			},

			// Call all callbacks with the given context and arguments.
			fireWith: function ( context, args ) {
				if ( stack ) { // Only fire if not locked.
					if ( firing ) {
						if ( !flags.once ) {
							stack.push( [ context, args ] ); // Queue the fire call if currently firing and not `once`.
						}
					} else if ( !( flags.once && memory ) ) {
						fire( context, args ); // Otherwise, execute immediately if not `once` and not already fired/remembered.
					}
				}
				return this; // Enable chaining.
			},

			// Call all the callbacks with the given arguments (context defaults to `this`).
			fire: function () {
				self.fireWith( this, arguments ); // Delegate to fireWith.
				return this; // Enable chaining.
			},

			// Check if the callbacks have already been called at least once.
			fired: function () {
				return !!memory; // Returns true if memory is set (meaning it has fired).
			}
		};

	return self; // Return the Callbacks object.
};


jQuery.Deferred = function ( func ) {

		// Create three separate Callbacks lists for different states of the Deferred.
		var doneList = jQuery.Callbacks( "once memory" ), // `done` callbacks are fired once and remember their state.
			failList = jQuery.Callbacks( "once memory" ), // `fail` callbacks are fired once and remember their state.
			progressList = jQuery.Callbacks( "memory" ), // `progress` callbacks remember but can be fired multiple times.
			state = "pending", // Initial state of the Deferred.

			// Map state names to their respective Callbacks lists.
			lists = {
				resolve: doneList,
				reject: failList,
				notify: progressList
			},

			// The promise object, which exposes methods for registering callbacks and querying state.
			promise = {
				done: doneList.add, // Register success callbacks.
				fail: failList.add, // Register failure callbacks.
				progress: progressList.add, // Register progress callbacks.

				state: function () {
					return state; // Return the current state of the Deferred.
				},

				// Deprecated methods for checking state (use `state()` instead).
				isResolved: doneList.fired,
				isRejected: failList.fired,

				then: function ( doneCallbacks, failCallbacks, progressCallbacks ) {
					// Chain deferreds: register callbacks for success, failure, and progress.
					deferred.done( doneCallbacks ).fail( failCallbacks ).progress( progressCallbacks );
					return this; // Allow chaining.
				},

				always: function () {
					// Register callbacks to be executed regardless of success or failure.
					deferred.done.apply( deferred, arguments ).fail.apply( deferred, arguments );
					return this; // Allow chaining.
				},

				pipe: function ( fnDone, fnFail, fnProgress ) {
					// Create a new deferred and chain its resolution/rejection based on the return value of the provided functions.
					return jQuery.Deferred( function ( newDefer ) {
						jQuery.each( {
							done: [ fnDone, "resolve" ],
							fail: [ fnFail, "reject" ],
							progress: [ fnProgress, "notify" ]
						}, function ( handler, data ) {
							var fn = data[ 0 ], // The callback function.
								action = data[ 1 ], // The action to perform on the new deferred (e.g., "resolve", "reject").
								returned; // The value returned by the callback.

							if ( jQuery.isFunction( fn ) ) {
								deferred[ handler ]( function () {
									returned = fn.apply( this, arguments ); // Execute the callback.
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										// If the callback returns a promise, chain the new deferred to it.
										returned.promise().then( newDefer.resolve, newDefer.reject, newDefer.notify );
									} else {
										// Otherwise, resolve/reject/notify the new deferred with the returned value.
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								});
							} else {
								// If no callback function provided, simply pass through the state.
								deferred[ handler ]( newDefer[ action ] );
							}
						});
					}).promise(); // Return the promise aspect of the new deferred.
				},

				// Get a promise for this deferred. If an object is provided, the promise methods are added to it.
				promise: function ( obj ) {
					if ( obj == null ) {
						obj = promise; // If no object, return the internal promise object.
					} else {
						// Otherwise, copy promise methods onto the provided object.
						for ( var key in promise ) {
							obj[ key ] = promise[ key ];
						}
					}
					return obj; // Return the promise-enabled object.
				}
			},

			// The deferred object itself, which includes the promise methods and additional methods for controlling its state.
			deferred = promise.promise( {} ),
			key; // Loop variable.

		// Add resolve, reject, notify, and their 'With' counterparts to the deferred object.
		for ( key in lists ) {
			deferred[ key ] = lists[ key ].fire;
			deferred[ key + "With" ] = lists[ key ].fireWith;
		}

		// Handle state transitions:
		// When 'done' is fired, set state to "resolved" and disable/lock other lists.
		deferred.done( function () {
			state = "resolved";
		}, failList.disable, progressList.lock ).fail( function () { // When 'fail' is fired, set state to "rejected" and disable/lock other lists.
			state = "rejected";
		}, doneList.disable, progressList.lock );

		// Call the given function immediately if provided, passing the deferred object as context.
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done! Return the fully configured deferred object.
		return deferred;
	};


jQuery.Event = function ( src, props ) {

	// Allow instantiation without the 'new' keyword.
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// If `src` is an existing event object.
	if ( src && src.type ) {
		this.originalEvent = src; // Store the original browser event.
		this.type = src.type; // Copy the event type.

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value for `isDefaultPrevented`.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// If `src` is just a string, it's the event type.
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object.
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if the incoming event doesn't have one.
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed by jQuery (for internal use).
	this[ jQuery.expando ] = true;
};


jQuery._data = function ( elem, name, data ) {
		// Internal helper for data storage, allows for private data.
		return jQuery.data( elem, name, data, true );
	};


jQuery._mark = function ( elem, type ) {
		// Internal method to mark an element, typically for animation queues.
		if ( elem ) {
			type = ( type || "fx" ) + "mark"; // Default type is 'fx'.
			jQuery._data( elem, type, ( jQuery._data( elem, type ) || 0 ) + 1 ); // Increment mark count.
		}
	};


jQuery._unmark = function ( force, elem, type ) {
		// Internal method to unmark an element, decrementing the mark count.
		if ( force !== true ) {
			type = elem;
			elem = force;
			force = false;
		}
		if ( elem ) {
			type = type || "fx";
			var key = type + "mark",
				count = force ? 0 : ( ( jQuery._data( elem, key ) || 1 ) - 1 ); // Decrement count, or set to 0 if force.
			if ( count ) {
				jQuery._data( elem, key, count ); // Update count.
			} else {
				jQuery.removeData( elem, key, true ); // Remove data if count is zero.
				handleQueueMarkDefer( elem, type, "mark" ); // Handle deferred queue logic.
			}
		}
	};


jQuery.acceptData = function ( elem ) {
		// Determines if data can be stored on a given DOM element.
		if ( elem.nodeName ) {
			var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

			if ( match ) {
				// Check if the element's classid attribute matches the noData entry.
				return !( match === true || elem.getAttribute( "classid" ) !== match );
			}
		}

		return true; // By default, data can be accepted.
	};


jQuery.access = function ( elems, key, value, exec, fn, pass ) {

		var length = elems.length; // Number of elements in the collection.

		// Setting many attributes via an object.
		if ( typeof key === "object" ) {
			for ( var k in key ) {
				jQuery.access( elems, k, key[ k ], exec, fn, value ); // Recursively call for each key-value pair.
			}
			return elems; // Return the original collection for chaining.
		}

		// Setting one attribute.
		if ( value !== undefined ) {
			// Optionally, function values get executed if `exec` is true and `pass` is false.
			exec = !pass && exec && jQuery.isFunction( value );

			for ( var i = 0; i < length; i++ ) {
				// Call the provided function `fn` for each element.
				fn( elems[ i ], key, exec ? value.call( elems[ i ], i, fn( elems[ i ], key ) ) : value, pass );
			}

			return elems; // Return the original collection for chaining.
		}

		// Getting an attribute.
		return length ? fn( elems[ 0 ], key ) : undefined; // Return the value from the first element or undefined.
	};


jQuery.active = 0; // Counter for active Ajax requests.


jQuery.ajax = function ( url, options ) {
	/// <summary>
	///     Perform an asynchronous HTTP (Ajax) request.
	///     <para>1 - jQuery.ajax(url, settings) </para>
	///     <para>2 - jQuery.ajax(settings)</para>
	/// </summary>
	/// <param name="url" type="String">
	///     A string containing the URL to which the request is sent.
	/// </param>
	/// <param name="options" type="Object">
	///     A set of key/value pairs that configure the Ajax request. All settings are optional. A default can be set for any option with $.ajaxSetup(). See jQuery.ajax( settings ) below for a complete list of all settings.
	/// </param>

		// If url is an object, it means the first argument is actually the options object (pre-1.5 signature).
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Ensure options is an object, even if not provided.
		options = options || {};

		var // Create the final options object by merging defaults and provided options.
			s = jQuery.ajaxSetup( {}, options ),
			// Determine the context for callbacks (defaults to `s` if not specified).
			callbackContext = s.context || s,
			// Determine the context for global events (e.g., ajaxStart, ajaxComplete).
			// This is typically a DOM node or a jQuery collection, or jQuery.event itself.
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Create a Deferred object to manage the asynchronous operation.
			deferred = jQuery.Deferred(),
			// Callbacks list for the complete state of the request.
			completeDeferred = jQuery.Callbacks( "once memory" ),
			// Storage for status-dependent callbacks (e.g., statusCode: { 404: fn }).
			statusCode = s.statusCode || {},
			// Key to store the 'ifModified' timestamp.
			ifModifiedKey,
			// Object to hold request headers (sent all at once).
			requestHeaders = {};