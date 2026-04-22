/***********************************************************************************************************************
 * almond 0.2.7 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * For more details and licensing information, please visit:
 * @see http://github.com/jrburke/almond
 ***********************************************************************************************************************/

// This file is intentionally written in a "sloppy" JavaScript mode to avoid the performance cost
// of the 'use strict' directive, especially in older JavaScript engines.
// However, best practices for strict code should still be observed where applicable.
/*jslint sloppy: true, browser: true, devel: true */
/*global setTimeout: false */ // Declare setTimeout as a global to satisfy JSLint, as it's provided by the browser environment.

var requirejs, require, define; // Declare global variables for the AMD loader.

// Start of the Immediately Invoked Function Expression (IIFE)
// This pattern creates a private scope to prevent polluting the global namespace.
( function (undef) {
    // undef is passed in to ensure its value is truly undefined,
    // which can be useful in environments where 'undefined' might be reassigned.

    var main,                           // The core module definition function.
        req,                            // The primary require function instance.
        makeMap,                        // Function to create a module name map.
        handlers,                       // Object holding handlers for special dependency names (require, exports, module).
        defined = {},                   // Stores modules that have been defined and are ready for use.
        waiting = {},                   // Modules that are waiting for their dependencies to be defined.
        config = {},                    // Global configuration object for the loader.
        defining = {},                  // Modules currently in the process of being defined.
        hasOwn = Object.prototype.hasOwnProperty, // Shortcut for Object.prototype.hasOwnProperty.
        aps = [].slice;                 // Shortcut for Array.prototype.slice, used for converting arguments to an array.


    /**
     * Helper function to check if an object has a specific property.
     * @param {Object} obj The object to check.
     * @param {String} prop The name of the property.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    function hasProp (obj, prop) {

        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name (e.g., './something'), this function normalizes it
     * into an absolute, real module name that can be mapped to a file path.
     * This involves resolving relative paths and applying any configured path mappings.
     *
     * @param {String} name The relative or absolute module name to normalize.
     * @param {String} baseName A real module name against which the 'name' argument is relative.
     * @returns {String} The fully normalized module name.
     */
    function normalize (name, baseName) {

        var nameParts,                  // Array to hold parts of the module name.
            nameSegment,                // A segment of the module name being processed.
            mapValue,                   // Value found in the map configuration.
            foundMap,                   // Indicates if a map entry was found for the current segment.
            foundI,                     // Index related to foundMap.
            foundStarMap,               // Indicates if a wildcard map entry was found.
            starI,                      // Index related to foundStarMap.
            i,                          // Loop counter.
            j,                          // Another loop counter.
            part,                       // A part of the path during normalization.
            baseParts = baseName && baseName.split("/"), // Split baseName into an array of path segments.
            map = config.map,           // Retrieve the map configuration from the global config.
            starMap = (map && map['*']) || {}; // Get the wildcard map entries, if any.


        // Adjust any relative paths found in the 'name' argument.
        if (name && name.charAt(0) === ".") {

            // If a baseName is provided, attempt to normalize 'name' against it.
            // Otherwise, assume it's a top-level require relative to baseUrl.
            if (baseName) {

                // Convert baseName to an array of path segments.
                // Then, remove the last part so that '.' refers to the "directory"
                // of the baseName's module, not the module name itself.
                // For example, if baseName is "one/two/three", we want "one/two".
                baseParts = baseParts.slice(0, baseParts.length - 1);


                // Concatenate the base path segments with the name's segments.
                name = baseParts.concat(name.split("/"));


                // --- Start trimDots logic ---
                // This loop processes path segments to handle '.' and '..'
                // It effectively resolves relative path components.
                for (i = 0; i < name.length; i += 1) {

                    part = name[i]; // Get the current path segment.

                    if (part === ".") {
                        // If the segment is '.', remove it as it means "current directory".
                        name.splice(i, 1);
                        i -= 1; // Adjust the counter because an element was removed.
                    } else if (part === "..") {
                        // If the segment is '..', it means "parent directory".

                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            // Special case: If we are at the beginning and encounter '..',
                            // and the next segment is also '..' or the first is '..',
                            // we keep at least one non-dot path segment at the front.
                            // This helps ensure proper mapping to disk paths.
                            // It catches common uses of '..', though it might still fail in edge cases.
                            break;
                        } else if (i > 0) {
                            // If not the special case, remove the '..' and the preceding segment.
                            name.splice(i - 1, 2);
                            i -= 2; // Adjust the counter for two removed elements.
                        }
                    }
                }
                // --- End trimDots logic ---

                // Join the processed path segments back into a single string.
                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // If there's no baseName, but the name starts with './',
                // it means it's relative to baseUrl. Remove the leading './'.
                name = name.substring(2);
            }
        }

        // Apply map configuration if available in the global config.
        // This allows remapping module IDs.
        if ((baseParts || starMap) && map) {

            nameParts = name.split('/'); // Split the module name into segments.

            for (i = nameParts.length; i > 0; i -= 1) {

                nameSegment = nameParts.slice(0, i).join("/"); // Get a segment from the name (e.g., 'foo/bar' then 'foo').

                if (baseParts) {
                    // If there are baseParts, look for the longest matching baseName segment
                    // in the configuration's map.
                    for (j = baseParts.length; j > 0; j -= 1) {

                        mapValue = map[baseParts.slice(0, j).join('/')]; // Get map entry for a base segment.

                        // If a map value exists for this base segment,
                        // check if it contains a mapping for the current nameSegment.
                        if (mapValue) {

                            mapValue = mapValue[nameSegment]; // Look for the specific nameSegment mapping.
                            if (mapValue) {
                                // A match was found! Update the module name to the new mapped value.
                                foundMap = mapValue;
                                foundI = i; // Store the index where the match was found.
                                break; // Exit inner loop as we found the longest base segment match.
                            }
                        }
                    }
                }

                if (foundMap) {
                    // If a specific map was found, we can break out of the outer loop.
                    break;
                }

                // Check for a wildcard ('*') map match.
                // We hold onto this, but a more specific segment match (if found later)
                // will take precedence over a wildcard match.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment]; // Store the wildcard map value.
                    starI = i; // Store the index for the wildcard map.
                }
            }

            // If no specific map was found, but a wildcard map was, use the wildcard map.
            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            // If any map (specific or wildcard) was found, apply it to the name.
            if (foundMap) {
                nameParts.splice(0, foundI, foundMap); // Replace the matched segment with the mapped value.
                name = nameParts.join('/'); // Reconstruct the name.
            }
        }

        return name; // Return the fully normalized module name.
    }

    /**
     * Creates a `require` function variant that is bound to a specific module name (`relName`).
     * This allows relative `require` calls within that module to resolve correctly.
     *
     * @param {String} relName The module name to which the returned require function is relative.
     * @param {boolean} forceSync If true, forces synchronous loading (used by plugin loads).
     * @returns {Function} A specialized require function.
     */
    function makeRequire (relName, forceSync) {

        return function () {
            // This anonymous function serves as the `require` instance for a module.
            // It uses `apply` to pass arguments to the main `req` function,
            // appending `relName` and `forceSync` to the argument list.
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    /**
     * Creates a `normalize` function variant that is bound to a specific module name (`relName`).
     * This is used by plugins to normalize resource names relative to the plugin's module.
     *
     * @param {String} relName The module name to which the returned normalize function is relative.
     * @returns {Function} A specialized normalize function.
     */
    function makeNormalize (relName) {

        return function (name) {
            // This anonymous function calls the main `normalize` helper,
            // passing the provided name and the bound `relName`.
            return normalize(name, relName);
        };
    }

    /**
     * Creates a `load` function for plugins. When a plugin calls this `load` function,
     * it defines the value for the given dependency name in the `defined` registry.
     *
     * @param {String} depName The full dependency name (including plugin prefix if any).
     * @returns {Function} A specialized load function.
     */
    function makeLoad (depName) {

        return function (value) {
            // Assigns the loaded value directly to the defined modules registry.
            defined[depName] = value;
        };
    }

    /**
     * Retrieves a module from the `defined` registry.
     * If the module is still `waiting` or `defining`, it processes it.
     * If the module is not found after processing, it throws an error.
     *
     * @param {String} name The name of the module to retrieve.
     * @returns {*} The exported value of the module.
     * @throws {Error} If the module is not found or cannot be resolved.
     */
    function callDep (name) {

        // If the module is in the 'waiting' state, it means it has dependencies
        // that need to be resolved and its definition function called.
        if (hasProp(waiting, name)) {

            var args = waiting[name]; // Get the arguments for its definition function.
            delete waiting[name];     // Remove it from 'waiting' as it's now being processed.

            defining[name] = true;    // Mark it as currently 'defining' to prevent re-entry.
            main.apply(undef, args);  // Call the main definition function for this module.
        }

        // After attempting to define it (if it was waiting),
        // check if it's in the 'defined' registry or still being 'defined'.
        if (!hasProp(defined, name) && !hasProp(defining, name)) {

            // If not found in either, it means the module could not be resolved.
            throw new Error('No ' + name);
        }

        return defined[name]; // Return the defined module's exports.
    }

    // Splits a module name into a plugin prefix and the resource name.
    // For example, "text!myTemplate.html" becomes ["text", "myTemplate.html"].
    // If no plugin prefix, the prefix will be undefined.
    function splitPrefix (name) {

        var prefix, // Variable to hold the plugin prefix.
            index = name ? name.indexOf('!') : -1; // Find the index of '!' if name exists.

        if (index > -1) {
            // If '!' is found, extract the prefix and the remaining name.
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name]; // Return an array containing the prefix and the name.
    }

    /**
     * Creates a module name map entry. This involves normalizing the module name
     * and, if it uses a plugin, normalizing the plugin name and getting a reference
     * to the plugin's module for optimization.
     *
     * @param {String} name The module name to map.
     * @param {String} relName The module name this 'name' is relative to.
     * @returns {Object} An object containing the full normalized name, the resource name,
     *                   the plugin prefix, and a reference to the plugin module.
     */
    makeMap = function (name, relName) {

        var plugin,                     // Reference to the plugin module.
            parts = splitPrefix(name),  // Split the name into [prefix, resource].
            prefix = parts[0];          // Extract the prefix.

        name = parts[1];                // Extract the resource name.

        if (prefix) {
            // If a plugin prefix exists, normalize it and retrieve the plugin module.
            prefix = normalize(prefix, relName); // Normalize the plugin's own ID.
            plugin = callDep(prefix);             // Get the plugin module using callDep.
        }

        // Perform normalization of the resource name.
        if (prefix) {
            // If there's a plugin, and it has a custom normalize method, use it.
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName)); // Use plugin's normalize.
            } else {
                // Otherwise, use the standard normalization for the resource name.
                name = normalize(name, relName);
            }
        } else {
            // If no plugin prefix, just use standard normalization.
            name = normalize(name, relName);

            // After initial normalization, the name might have become a plugin-prefixed name.
            // For example, 'foo/bar' might normalize to 'text!path/to/foo/bar'.
            parts = splitPrefix(name); // Re-split to check for new prefix.
            prefix = parts[0];
            name = parts[1];

            if (prefix) {
                // If a new prefix appeared, get the plugin.
                plugin = callDep(prefix);
            }
        }

        // Return an object with abbreviated property names to save space (for almond's small footprint).
        return {
            f: prefix ? prefix + '!' + name : name, // 'f' for fullName: the complete, normalized module ID.
            n: name,                                // 'n' for name: the resource part of the ID.
            pr: prefix,                             // 'pr' for prefix: the plugin prefix.
            p: plugin                               // 'p' for plugin: the plugin module object.
        };
    };

    /**
     * Creates a configuration getter function for a specific module name.
     * This allows modules to access their own configuration data.
     *
     * @param {String} name The module name for which to get the config.
     * @returns {Function} A function that, when called, returns the module's config.
     */
    function makeConfig (name) {

        return function () {
            // Returns the configuration for the given module name, or an empty object if not found.
            return (config && config.config && config.config[name]) || {};
        };
    }

    // Object containing handlers for special AMD dependencies: 'require', 'exports', 'module'.
    handlers = {
        require: function (name) {
            // Returns a specialized 'require' function for the current module context.
            return makeRequire(name);
        },
        exports: function (name) {
            // Provides the 'exports' object for a module.
            var e = defined[name]; // Try to get existing exports.

            if (typeof e !== 'undefined') {
                return e; // If already defined, return it.
            } else {
                // Otherwise, initialize it as an empty object and store it.
                return (defined[name] = {});
            }
        },
        module: function (name) {
            // Provides the 'module' object for a module, adhering to CommonJS Module Spec 1.1.
            return {
                id: name,           // The module's ID.
                uri: '',            // The module's URI (not used by almond, but part of spec).
                exports: defined[name], // The module's exports object.
                config: makeConfig(name) // A function to get the module's config.
            };
        }
    };

    /**
     * The main function responsible for defining and resolving a module.
     * This is the core logic that processes dependencies and executes the module's factory function.
     *
     * @param {String} name The module's ID.
     * @param {Array} deps An array of dependency IDs.
     * @param {Function|Object} callback The module's factory function or an object literal.
     * @param {String} relName The module ID that 'name' is relative to (for internal use).
     */
    main = function (name, deps, callback, relName) {

        var cjsModule,          // Holds the CommonJS 'module' object if requested.
            depName,            // The normalized name of a dependency.
            ret,                // The return value from the callback function.
            map,                // The map object for a dependency.
            i,                  // Loop counter.
            args = [],          // Array to hold resolved dependency values passed to the callback.
            callbackType = typeof callback, // Type of the callback (e.g., 'function', 'object').
            usingExports;       // Flag to indicate if 'exports' was requested as a dependency.

        // Use 'name' as 'relName' if 'relName' is not provided.
        relName = relName || name;

        // Call the module's callback to define its value, if it's a function.
        if (callbackType === 'undefined' || callbackType === 'function') {

            // If no dependencies are explicitly listed but the callback expects them
            // (by having parameters like `function(require, exports, module)`),
            // default to the CommonJS standard dependencies.
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;

            // Iterate through each dependency to resolve it.
            for (i = 0; i < deps.length; i += 1) {

                map = makeMap(deps[i], relName); // Get the mapped dependency info.
                depName = map.f;                 // The full normalized dependency name.

                // Handle the fast path for CommonJS standard dependencies ('require', 'exports', 'module').
                if (depName === "require") {
                    args[i] = handlers.require(name); // Provide the module-specific require.
                } else if (depName === "exports") {
                    // CommonJS module spec 1.1: provide the exports object.
                    args[i] = handlers.exports(name);
                    usingExports = true; // Mark that 'exports' was used.
                } else if (depName === "module") {
                    // CommonJS module spec 1.1: provide the module object.
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    // If the dependency is already defined, waiting, or defining,
                    // attempt to call it (which will resolve it if waiting/defining).
                    args[i] = callDep(depName);
                } else if (map.p) {
                    // If it's a plugin dependency (map.p is the plugin module),
                    // instruct the plugin to load the resource.
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName]; // After load, the dependency should be defined.
                } else {
                    // If the dependency cannot be resolved by any of the above means, throw an error.
                    throw new Error(name + ' missing ' + depName);
                }
            }

            // Execute the module's factory function (callback) with its resolved dependencies.
            // The `defined[name]` is passed as `this` context to the callback,
            // which can be useful for CommonJS-style modules modifying `exports`.
            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                // If a module name was provided (i.e., it's not an anonymous module),
                // store its resolved value.

                // Prioritize 'module.exports' if it was used and modified.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    // Otherwise, if the callback returned a value, use that.
                    // Or if 'exports' was NOT used (meaning the module doesn't rely on `exports` modification),
                    // then the return value is the module's value (even if undefined).
                    defined[name] = ret;
                }
            }
        } else if (name) {
            // If the callback is not a function (e.g., an object literal),
            // and a module name is provided, directly define the module with this value.
            defined[name] = callback;
        }
    };

    // Global `requirejs`, `require`, and `req` assignments.
    // `req` is the internal reference to the main require function.
    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {

        // Handle the case where the first argument is a string (a single module ID to retrieve).
        if (typeof deps === "string") {

            if (handlers[deps]) {
                // If it's one of the special AMD dependencies ('require', 'exports', 'module'),
                // call its handler. `callback` in this context is actually `relName`.
                return handlers[deps](callback);
            }

            // If it's a regular module name, normalize it and return its value.
            // `callback` here acts as `relName` for `makeMap`.
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            // If `deps` is not an array, it's treated as a configuration object.
            config = deps; // Set the global config.

            if (callback.splice) {
                // If `callback` is an array, it means it's a dependency list for a subsequent require.
                // Adjust arguments: `deps` becomes `callback`, `callback` becomes `relName`, `relName` is null.
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef; // No dependencies provided in this config call.
            }
        }

        // Ensure `callback` is always a function, even if not provided.
        callback = callback || function () {};

        // If `relName` is a function, it's actually an errback handler.
        // Reassign arguments to correctly handle `forceSync` and `alt`.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        // Simulate asynchronous loading using setTimeout, unless `forceSync` is true.
        if (forceSync) {
            // If synchronous loading is forced, call `main` directly.
            main(undef, deps, callback, relName);
        } else {
            // For asynchronous loading, use `setTimeout`.
            // A non-zero value (4ms) is used due to browser behavior:
            // older browsers might "upgrade" lower values to 4ms, and it generally
            // ensures the task is deferred to the next event loop tick.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req; // Return the `req` function itself for chaining.
    };

    /**
     * Allows setting global configuration options for the AMD loader.
     * This function is primarily for setting paths, shims, and other loader behaviors.
     *
     * @param {Object} cfg The configuration object.
     * @returns {Function} The `req` function (for chaining).
     */
    req.config = function (cfg) {

        config = cfg; // Update the global configuration.

        if (config.deps) {
            // If `deps` are specified in the config, immediately require them.
            req(config.deps, config.callback);
        }
        return req; // Return `req` for fluent API.
    };

    /**
     * Expose the internal module registry for debugging and tooling purposes.
     * This allows external scripts or development tools to inspect the defined modules.
     */
    requirejs._defined = defined;

    /**
     * The global `define` function for defining modules.
     * This function registers modules with their dependencies and factory functions.
     *
     * @param {String} name The module's ID.
     * @param {Array} deps An array of dependency IDs.
     * @param {Function|Object} callback The module's factory function or an object literal.
     */
    define = function (name, deps, callback) {

        // If `deps` is not an array, it means it's either the `callback`
        // (if `name` and `callback` are the only args) or an object literal.
        if (!deps.splice) {
            // Adjust arguments: `callback` becomes `deps`, `deps` becomes an empty array.
            callback = deps;
            deps = [];
        }

        // Only register the module if it hasn't been defined or isn't already waiting.
        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            // Store the module's definition arguments in the 'waiting' registry.
            // It will be processed when its dependencies are met or when explicitly required.
            waiting[name] = [name, deps, callback];
        }
    };

    // Add an `amd` property to the `define` function, as per AMD specification.
    // This property can be used by other tools (like jQuery) to detect an AMD loader.
    define.amd = {
        jQuery: true // Indicates compatibility with jQuery's AMD detection.
    };

// End of the IIFE. The `undef` parameter is passed as `undefined` to ensure its value.
}(
    // Pass `undefined` explicitly to the IIFE.
    // This is a common pattern to ensure `undefined` truly means `undefined`
    // within the scope of the IIFE, even if the global `undefined` was reassigned.
    undefined
)
); // Call the IIFE immediately.