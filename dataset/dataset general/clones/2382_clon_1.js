// This is a Type I clone of the original almond.js 0.2.5 source code.
// The original source: almond 0.2.5 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
// It is available via the MIT or new BSD license.
// For more details, please see: http://github.com/jrburke/almond

// We are going sloppy here to avoid the 'use strict' string overhead,
// but all strict practices should still be rigorously followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;

( function ( undef ) {

	// Internal variables declaration for the module
	var main,
		req,
		makeMap,
		handlers,
		defined = {},    // Stores defined modules
		waiting = {},    // Stores modules waiting to be defined
		config = {},     // Configuration object for require
		defining = {},   // Tracks modules currently being defined
		hasOwn = Object.prototype.hasOwnProperty, // Reference to hasOwnProperty for performance
		aps = [].slice;  // Reference to array slice for arguments conversion


	/**
	 * A utility function to check if an object has a specific property.
	 * @param {Object} obj The object to check.
	 * @param {String} prop The name of the property.
	 * @returns {Boolean} True if the property exists, false otherwise.
	 */
	function hasProp( obj, prop ) {

		return hasOwn.call( obj, prop );

	} // end of hasProp function


	/**
	 * Given a relative module name, like ./something, normalize it to
	 * a real name that can be mapped to a path. This function handles
	 * relative paths, map configurations, and star maps.
	 *
	 * @param {String} name     The relative module name.
	 * @param {String} baseName A real name that the `name` argument is relative to.
	 * @returns {String} The normalized module name.
	 */
	function normalize( name, baseName ) {

		var nameParts, nameSegment, mapValue, foundMap,
			foundI, foundStarMap, starI, i, j, part,
			baseParts = baseName && baseName.split( "/" ),
			map = config.map,
			starMap = ( map && map[ '*' ] ) || {};

		// Adjust any relative paths.
		if ( name && name.charAt( 0 ) === "." ) {

			// If we have a base name, try to normalize against it.
			// Otherwise, assume it's a top-level require relative to baseUrl.
			if ( baseName ) {

				// Convert baseName to an array and remove the last part.
				// This ensures that "." matches the directory, not the module's name.
				// For example, "one/two/three" maps to "one/two/three.js",
				// but we need "one/two" for normalization.
				baseParts = baseParts.slice( 0, baseParts.length - 1 );

				name = baseParts.concat( name.split( "/" ) );

				// --- Start: trimDots section ---
				// Remove "." and handle ".." in the path segments.
				for ( i = 0; i < name.length; i += 1 ) {

					part = name[ i ];

					if ( part === "." ) {

						name.splice( i, 1 );
						i -= 1;

					} else if ( part === ".." ) {

						if ( i === 1 && ( name[ 2 ] === '..' || name[ 0 ] === '..' ) ) {

							// This is the end of the line. Keep at least one non-dot
							// path segment at the front so it can be mapped correctly to disk.
							// Otherwise, there is likely no path mapping for a path starting with '..'.
							// This might still fail, but it catches the most reasonable uses of '..'.
							break;

						} else if ( i > 0 ) {

							name.splice( i - 1, 2 );
							i -= 2;

						}

					}

				}
				// --- End: trimDots section ---

				name = name.join( "/" );

			} else if ( name.indexOf( './' ) === 0 ) {

				// No baseName, so this ID is resolved relative to baseUrl.
				// Remove the leading dot.
				name = name.substring( 2 );

			}

		} // end if (name && name.charAt(0) === ".")

		// Apply map configuration if available.
		if ( ( baseParts || starMap ) && map ) {

			nameParts = name.split( '/' );

			for ( i = nameParts.length; i > 0; i -= 1 ) {

				nameSegment = nameParts.slice( 0, i ).join( "/" );

				if ( baseParts ) {

					// Find the longest baseName segment match in the config.
					// This means checking joins from the biggest to smallest lengths of baseParts.
					for ( j = baseParts.length; j > 0; j -= 1 ) {

						mapValue = map[ baseParts.slice( 0, j ).join( '/' ) ];

						// If the baseName segment has a config, check if it has one for this specific name.
						if ( mapValue ) {

							mapValue = mapValue[ nameSegment ];

							if ( mapValue ) {

								// Match found! Update the name to the new value.
								foundMap = mapValue;
								foundI = i;
								break;

							}

						}

					} // end for j

				} // end if (baseParts)

				if ( foundMap ) {

					break;

				}

				// Check for a star map match, but just hold onto it.
				// If a shorter segment match appears later in a matching config,
				// that should be favored over this star map.
				if ( !foundStarMap && starMap && starMap[ nameSegment ] ) {

					foundStarMap = starMap[ nameSegment ];
					starI = i;

				}

			} // end for i

			if ( !foundMap && foundStarMap ) {

				foundMap = foundStarMap;
				foundI = starI;

			}

			if ( foundMap ) {

				nameParts.splice( 0, foundI, foundMap );
				name = nameParts.join( '/' );

			}

		} // end if ((baseParts || starMap) && map)

		return name;

	} // end of normalize function


	/**
	 * Creates a require function that passes a moduleName value for items
	 * that may need to look up paths relative to the moduleName.
	 *
	 * @param {String} relName   The name of the module from which the require is called.
	 * @param {Boolean} forceSync If true, forces synchronous loading.
	 * @returns {Function} A new require function.
	 */
	function makeRequire( relName, forceSync ) {

		return function () {

			return req.apply( undef, aps.call( arguments, 0 ).concat( [ relName, forceSync ] ) );

		};

	} // end of makeRequire function


	/**
	 * Creates a normalize function that is bound to a specific relative name.
	 * @param {String} relName The name to normalize against.
	 * @returns {Function} A new normalize function.
	 */
	function makeNormalize( relName ) {

		return function ( name ) {

			return normalize( name, relName );

		};

	} // end of makeNormalize function


	/**
	 * Creates a load function that will define a module once its value is ready.
	 * @param {String} depName The name of the dependency being loaded.
	 * @returns {Function} A function to load the dependency value.
	 */
	function makeLoad( depName ) {

		return function ( value ) {

			defined[ depName ] = value;

		};

	} // end of makeLoad function


	/**
	 * Calls a dependency, ensuring it is defined and handling
	 * cases where it might be waiting or currently defining.
	 *
	 * @param {String} name The name of the dependency to call.
	 * @returns {*} The value of the defined dependency.
	 * @throws {Error} If the dependency is not found.
	 */
	function callDep( name ) {

		if ( hasProp( waiting, name ) ) {

			var args = waiting[ name ];
			delete waiting[ name ];
			defining[ name ] = true;
			main.apply( undef, args );

		}

		if ( !hasProp( defined, name ) && !hasProp( defining, name ) ) {

			throw new Error( 'No ' + name );

		}

		return defined[ name ];

	} // end of callDep function


	// Turns a plugin!resource string into an array: [plugin, resource].
	// The plugin element will be undefined if the name did not have a plugin prefix.
	function splitPrefix( name ) {

		var prefix,
			index = name ? name.indexOf( '!' ) : -1; // Find the separator '!'

		if ( index > -1 ) {

			prefix = name.substring( 0, index ); // Extract the plugin prefix
			name = name.substring( index + 1, name.length ); // Extract the resource name

		}

		return [ prefix, name ];

	} // end of splitPrefix function


	/**
	 * Makes a name map, normalizing the name and using a plugin for
	 * normalization if necessary. It also grabs a reference to the plugin
	 * as an optimization.
	 *
	 * @param {String} name    The module name to map.
	 * @param {String} relName The name of the module from which the mapping is done.
	 * @returns {Object} An object containing the full name, name, prefix, and plugin.
	 */
	makeMap = function ( name, relName ) {

		var plugin,
			parts = splitPrefix( name ),
			prefix = parts[ 0 ];

		name = parts[ 1 ]; // The actual resource name

		if ( prefix ) {

			prefix = normalize( prefix, relName ); // Normalize the plugin prefix
			plugin = callDep( prefix ); // Get the plugin module

		}

		// Normalize according to plugin rules or standard normalization.
		if ( prefix ) {

			if ( plugin && plugin.normalize ) {

				name = plugin.normalize( name, makeNormalize( relName ) ); // Plugin-specific normalization

			} else {

				name = normalize( name, relName ); // Standard normalization if no plugin or normalize method

			}

		} else {

			name = normalize( name, relName ); // Standard normalization

			// Re-split if normalization introduced a new prefix (e.g., if a map entry
			// for 'foo' became 'bar!baz')
			parts = splitPrefix( name );
			prefix = parts[ 0 ];
			name = parts[ 1 ];

			if ( prefix ) {

				plugin = callDep( prefix ); // Get the plugin if a new prefix appeared

			}

		}

		// Using ridiculous single-letter property names for space reasons in minified code.
		return {
			f: prefix ? prefix + '!' + name : name, // f: fullName - the fully qualified module name
			n: name,                                // n: name - the resource name
			pr: prefix,                             // pr: prefix - the plugin prefix
			p: plugin                               // p: plugin - the plugin module itself
		};

	}; // end of makeMap function


	/**
	 * Creates a configuration getter function for a specific module name.
	 * @param {String} name The name of the module to get configuration for.
	 * @returns {Function} A function that returns the module's configuration.
	 */
	function makeConfig( name ) {

		return function () {

			// Return the module's specific configuration, or an empty object if none exists.
			return ( config && config.config && config.config[ name ] ) || {};

		};

	} // end of makeConfig function


	// Handlers for special CommonJS dependencies like 'require', 'exports', 'module'.
	handlers = {

		require: function ( name ) {
			return makeRequire( name );
		},

		exports: function ( name ) {
			var e = defined[ name ];
			if ( typeof e !== 'undefined' ) {
				return e; // Return existing exports if already defined
			} else {
				return ( defined[ name ] = {} ); // Create and return an empty exports object
			}
		},

		module: function ( name ) {
			return {
				id: name,           // The module's identifier
				uri: '',            // Not used in almond, but part of AMD spec
				exports: defined[ name ], // Reference to the module's exports object
				config: makeConfig( name ) // Function to get module-specific config
			};
		}

	}; // end of handlers object


	/**
	 * The core function for defining and loading modules.
	 * This is where the actual module definition logic resides.
	 *
	 * @param {String}   name      The name of the module being defined.
	 * @param {Array}    deps      An array of dependency names.
	 * @param {Function} callback  The module definition function or object.
	 * @param {String}   relName   The name relative to which dependencies should be resolved.
	 */
	main = function ( name, deps, callback, relName ) {

		var cjsModule, depName, ret, map, i,
			args = [],      // Array to hold resolved dependency values
			usingExports;   // Flag to indicate if 'exports' was used as a dependency

		// Use the given name if no relative name is provided.
		relName = relName || name;

		// Call the callback to define the module, if it's a function.
		if ( typeof callback === 'function' ) {

			// Pull out the defined dependencies and pass the ordered values to the callback.
			// Default to [ 'require', 'exports', 'module' ] if no deps are specified
			// and the callback expects arguments.
			deps = !deps.length && callback.length ? [ 'require', 'exports', 'module' ] : deps;

			for ( i = 0; i < deps.length; i += 1 ) {

				map = makeMap( deps[ i ], relName );
				depName = map.f; // The full normalized dependency name

				// Fast path for CommonJS standard dependencies.
				if ( depName === "require" ) {

					args[ i ] = handlers.require( name );

				} else if ( depName === "exports" ) {

					// CommonJS module spec 1.1
					args[ i ] = handlers.exports( name );
					usingExports = true; // Mark that exports was requested

				} else if ( depName === "module" ) {

					// CommonJS module spec 1.1
					cjsModule = args[ i ] = handlers.module( name );

				} else if ( hasProp( defined, depName ) ||
					        hasProp( waiting, depName ) ||
					        hasProp( defining, depName ) ) {

					// If the dependency is already defined, waiting, or being defined,
					// retrieve its value.
					args[ i ] = callDep( depName );

				} else if ( map.p ) {

					// Handle plugin dependencies (e.g., 'text!template.html')
					// The plugin loads the resource and calls makeLoad to define it.
					map.p.load( map.n, makeRequire( relName, true ), makeLoad( depName ), {} );
					args[ i ] = defined[ depName ]; // The value should now be defined by the plugin

				} else {

					// If a dependency is missing, throw an error.
					throw new Error( name + ' missing ' + depName );

				}

			} // end for loop over dependencies

			// Execute the module's callback function.
			ret = callback.apply( defined[ name ], args );

			if ( name ) {

				// If setting exports via "module" is in play, favor that over the return value
				// and the 'exports' object. After that, favor a non-undefined return value
				// over the 'exports' object usage.
				if ( cjsModule && cjsModule.exports !== undef &&
					cjsModule.exports !== defined[ name ] ) {

					defined[ name ] = cjsModule.exports;

				} else if ( ret !== undef || !usingExports ) {

					// Use the return value from the function.
					defined[ name ] = ret;

				}

			} // end if (name)

		} else if ( name ) {

			// This case handles modules defined as plain objects (not functions).
			// Only worry about defining if a module name is provided.
			defined[ name ] = callback;

		}

	}; // end of main function


	// Assign main function to global requirejs, require, and req variables.
	requirejs = require = req = function ( deps, callback, relName, forceSync, alt ) {

		// Handle the case where `deps` is a string (requesting a single module).
		if ( typeof deps === "string" ) {

			if ( handlers[ deps ] ) {

				// If it's a special handler like 'require', 'exports', or 'module'.
				// `callback` in this scenario is actually `relName`.
				return handlers[ deps ]( callback );

			}

			// Just return the module wanted. In this scenario, `deps` is the module name,
			// and the second arg (`callback`) (if passed) is just the `relName`.
			// Normalize the module name, especially if it contains '.' or '..'.
			return callDep( makeMap( deps, callback ).f );

		} else if ( !deps.splice ) {

			// `deps` is a config object, not an array of dependencies.
			config = deps;

			if ( callback.splice ) {

				// `callback` is an array, which means it's a dependency list.
				// Adjust arguments if there are dependencies.
				deps = callback;
				callback = relName;
				relName = null;

			} else {

				deps = undef; // No dependencies provided with config.

			}

		}

		// Support `require(['a'])` where no callback is provided.
		callback = callback || function () {};

		// If `relName` is a function, it's an errback handler, so remove it.
		if ( typeof relName === 'function' ) {

			relName = forceSync;
			forceSync = alt;

		}

		// Simulate async callback (even if dependencies are already loaded).
		if ( forceSync ) {

			main( undef, deps, callback, relName );

		} else {

			// Using a non-zero value because of concerns about what old browsers do,
			// and how latest browsers "upgrade" to 4 if a lower value is used:
			// http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
			// If you want a value immediately, use `require('id')` instead --
			// something that works in almond on the global level, but is not guaranteed
			// and unlikely to work in other AMD implementations.
			setTimeout( function () {

				main( undef, deps, callback, relName );

			}, 4 ); // Asynchronous execution with a small delay.

		}

		return req; // Return the `req` function to allow chaining (e.g., `require.config()...`).

	}; // end of requirejs/require/req function


	/**
	 * Just drops the config on the floor, but returns req in case
	 * the config return value is used (e.g., `require.config({}).foo()`).
	 * @param {Object} cfg The configuration object.
	 * @returns {Function} The `req` function.
	 */
	req.config = function ( cfg ) {

		config = cfg; // Store the configuration.

		if ( config.deps ) {

			req( config.deps, config.callback ); // Process initial dependencies and callback if specified.

		}

		return req;

	}; // end of req.config function


	/**
	 * Defines a module. This function stores the module definition
	 * for later asynchronous loading by `require`.
	 *
	 * @param {String}   name     The name of the module.
	 * @param {Array}    deps     An array of dependency names.
	 * @param {Function} callback The module definition function or object.
	 */
	define = function ( name, deps, callback ) {

		// This module may not have dependencies explicitly listed.
		if ( !deps.splice ) {

			// `deps` is not an array, so it probably means an object literal
			// or a factory function for the value. Adjust arguments accordingly.
			callback = deps;
			deps = []; // No explicit dependencies.

		}

		// If the module is not already defined or waiting, store it for later processing.
		if ( !hasProp( defined, name ) && !hasProp( waiting, name ) ) {

			waiting[ name ] = [ name, deps, callback ]; // Store the module definition.

		}

	}; // end of define function


	// AMD compliance.
	define.amd = {
		jQuery: true // Indicates compatibility with jQuery's AMD detection.
	};

} ( ) ); // Immediately Invoked Function Expression (IIFE) closure.