/*
 * Underscore.js - A JavaScript utility library for common programming tasks.
 *
 * (c) 2010 Jeremy Ashkenas, DocumentCloud Inc. - All rights reserved.
 *
 * Underscore is freely distributable under the terms of the MIT license.
 * For full license text and details, please refer to the project's official documentation.
 *
 * Portions of Underscore's functionality are inspired by or directly borrowed from
 * other excellent JavaScript libraries, including:
 *  - Prototype.js, for its robust object-oriented features.
 *  - Oliver Steele's Functional JavaScript library, for its functional programming paradigms.
 *  - John Resig's Micro-Templating, for its efficient templating techniques.
 *
 * For comprehensive documentation, API reference, and usage examples,
 * please visit the official project website:
 * http://documentcloud.github.com/underscore
 *
 * This file represents a Type I clone, where only whitespace and comments have been altered
 * to create a visually distinct but functionally identical version of the original source.
 */

(function() {

    // ------------------------- Baseline setup ---------------------------------
    // This section establishes core environment variables and utility functions
    // required for Underscore's operation across different JavaScript environments.


    // Establish the root object. This will be 'window' in a browser environment,
    // or 'global' when running in Node.js or similar server-side JavaScript runtimes.
    var root = this;

    // Save the previous value of the global '_' variable.
    // This allows for noConflict mode, preventing namespace collisions.
    var previousUnderscore = root._;

    // Establish the object that gets thrown to break out of an iteration loop.
    // This provides a mechanism for early exit from `each` and similar functions.
    // It checks for `StopIteration` (used in older JS engines for iterators)
    // or defaults to a custom string "__break__" for compatibility.
    var breaker = typeof StopIteration !== 'undefined' ? StopIteration : '__break__';

    // A quick regular expression escaping function.
    // JavaScript's native RegExp object does not provide an escape method,
    // so this utility ensures that special characters in a string are
    // properly escaped for use within a regular expression.
    var escapeRegExp = function(s) {
        return s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
    };

    // Save references to Array.prototype and Object.prototype for byte savings
    // in the minified (but not gzipped) version of the library.
    // This avoids repeated lookups of these frequently accessed prototypes.
    var ArrayProto = Array.prototype,
        ObjProto   = Object.prototype;

    // Create quick reference variables for speed access to core prototypes' methods.
    // This pattern is common in high-performance JavaScript libraries
    // to reduce scope chain lookups and improve execution speed.
    var slice                 = ArrayProto.slice,
        unshift               = ArrayProto.unshift,
        toString              = ObjProto.toString,
        hasOwnProperty        = ObjProto.hasOwnProperty,
        propertyIsEnumerable  = ObjProto.propertyIsEnumerable;

    // All ECMA5 native implementations that Underscore hopes to leverage are declared here.
    // These native methods offer significant performance benefits when available.
    var
        nativeForEach      = ArrayProto.forEach,
        nativeMap          = ArrayProto.map,
        nativeReduce       = ArrayProto.reduce,
        nativeReduceRight  = ArrayProto.reduceRight,
        nativeFilter       = ArrayProto.filter,
        nativeEvery        = ArrayProto.every,
        nativeSome         = ArrayProto.some,
        nativeIndexOf      = ArrayProto.indexOf,
        nativeLastIndexOf  = ArrayProto.lastIndexOf,
        nativeIsArray      = Array.isArray,
        nativeKeys         = Object.keys;

    // Create a safe reference to the Underscore object.
    // This is the primary entry point for all Underscore functions.
    // It acts as a wrapper for chainable operations.
    var _ = function(obj) {
        return new wrapper(obj);
    };

    // Export the Underscore object for CommonJS environments (e.g., Node.js).
    // This makes Underscore available via `require('_')`.
    if (typeof exports !== 'undefined') {
        exports._ = _;
    }

    // Export Underscore to the global scope (e.g., 'window' in browsers).
    // This makes Underscore available globally as `_`.
    root._ = _;

    // Current version of Underscore.js.
    _.VERSION = '0.6.0';

    // ------------------------ Collection Functions: ---------------------------
    // These functions operate on collections of data, such as arrays and objects.

    // The cornerstone of collection iteration: an each implementation.
    // This function iterates over elements in an object, array, or any iterable.
    // It handles objects implementing `forEach` (like native arrays),
    // standard arrays, and raw objects (iterating over their own enumerable properties).
    // It delegates to JavaScript 1.6's native `forEach` method if it is available
    // and the object explicitly uses it.
    var each = _.forEach = function(obj, iterator, context) {
        try {
            if (nativeForEach && obj.forEach === nativeForEach) {
                // Use native forEach for optimal performance if available.
                obj.forEach(iterator, context);
            } else if (_.isNumber(obj.length)) {
                // Iterate over array-like objects (e.g., arguments, DOM NodeLists).
                for (var i = 0, l = obj.length; i < l; i++) {
                    iterator.call(context, obj[i], i, obj);
                }
            } else {
                // Iterate over plain JavaScript objects.
                for (var key in obj) {
                    if (hasOwnProperty.call(obj, key)) {
                        iterator.call(context, obj[key], key, obj);
                    }
                }
            }
        } catch(e) {
            // Catch the special 'breaker' exception to allow early exit from loops.
            if (e != breaker) {
                throw e; // Re-throw other exceptions.
            }
        }
        return obj; // Return the original object for chaining.
    };

    // Return the results of applying the `iterator` function to each element in a collection.
    // This is a fundamental functional programming primitive, also known as `collect`.
    // It delegates to JavaScript 1.6's native `map` method if it is available.
    _.map = function(obj, iterator, context) {
        if (nativeMap && obj.map === nativeMap) {
            return obj.map(iterator, context);
        }
        var results = []; // Initialize an empty array to store results.
        each(obj, function(value, index, list) {
            results.push(iterator.call(context, value, index, list));
        });
        return results;
    };

    // Reduce builds up a single result from a list of values.
    // This function is also known as `inject` or `foldl` (fold-left).
    // It delegates to JavaScript 1.8's native `reduce` method if available.
    _.reduce = function(obj, memo, iterator, context) {
        if (nativeReduce && obj.reduce === nativeReduce) {
            // If native reduce exists, use it after binding the iterator.
            return obj.reduce(_.bind(iterator, context), memo);
        }
        each(obj, function(value, index, list) {
            // Apply the iterator to the current memo and value, updating memo.
            memo = iterator.call(context, memo, value, index, list);
        });
        return memo; // Return the final accumulated value.
    };

    // The right-associative version of reduce, also known as `foldr` (fold-right).
    // This function processes elements from right to left.
    // It delegates to JavaScript 1.8's native `reduceRight` if available.
    _.reduceRight = function(obj, memo, iterator, context) {
        if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
            // Use native reduceRight if available, binding the iterator.
            return obj.reduceRight(_.bind(iterator, context), memo);
        }
        // If native is not available, reverse a clone of the array and then reduce it.
        var reversed = _.clone(_.toArray(obj)).reverse();
        return _.reduce(reversed, memo, iterator, context);
    };

    // Return the first value in a collection that passes a truth test (`iterator`).
    // This function is useful for finding a specific element quickly.
    _.detect = function(obj, iterator, context) {
        var result; // Variable to store the detected value.
        each(obj, function(value, index, list) {
            if (iterator.call(context, value, index, list)) {
                result = value; // Assign the value that passed the test.
                _.breakLoop();  // Use the internal mechanism to stop iteration early.
            }
        });
        return result; // Return the first matching value, or undefined if none found.
    };

    // Return all the elements in a collection that pass a truth test (`iterator`).
    // This function is also known as `select`.
    // It delegates to JavaScript 1.6's native `filter` method if available.
    _.filter = function(obj, iterator, context) {
        if (nativeFilter && obj.filter === nativeFilter) {
            return obj.filter(iterator, context);
        }
        var results = []; // Initialize an array to hold the filtered elements.
        each(obj, function(value, index, list) {
            // If the iterator returns true, push the value to results.
            iterator.call(context, value, index, list) && results.push(value);
        });
        return results;
    };

    // Return all the elements in a collection for which a truth test (`iterator`) fails.
    // This is the logical inverse of `filter`.
    _.reject = function(obj, iterator, context) {
        var results = []; // Initialize an array for rejected elements.
        each(obj, function(value, index, list) {
            // If the iterator returns false (negated), push the value to results.
            !iterator.call(context, value, index, list) && results.push(value);
        });
        return results;
    };

    // Determine whether all of the elements in a collection match a truth test (`iterator`).
    // This function is also known as `all`.
    // It delegates to JavaScript 1.6's native `every` method if available.
    _.every = function(obj, iterator, context) {
        iterator = iterator || _.identity; // Default to identity function if no iterator is provided.
        if (nativeEvery && obj.every === nativeEvery) {
            return obj.every(iterator, context);
        }
        var result = true; // Assume all pass initially.
        each(obj, function(value, index, list) {
            // If any element fails the test, `result` becomes false, and we break.
            if (!(result = result && iterator.call(context, value, index, list))) {
                _.breakLoop();
            }
        });
        return result; // Returns true if all passed, false otherwise.
    };

    // Determine if at least one element in the object matches a truth test (`iterator`).
    // This function is also known as `any`.
    // It delegates to JavaScript 1.6's native `some` method if available.
    _.some = function(obj, iterator, context) {
        iterator = iterator || _.identity; // Default to identity function.
        if (nativeSome && obj.some === nativeSome) {
            return obj.some(iterator, context);
        }
        var result = false; // Assume none pass initially.
        each(obj, function(value, index, list) {
            // If any element passes the test, `result` becomes true, and we break.
            if (result = iterator.call(context, value, index, list)) {
                _.breakLoop();
            }
        });
        return result; // Returns true if at least one passed, false otherwise.
    };

    // Determine if a given value is included in the array or object using strict equality ('===').
    // This function is also known as `contains`.
    _.include = function(obj, target) {
        // Use native `indexOf` for arrays if available for performance.
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) {
            return obj.indexOf(target) != -1;
        }
        var found = false; // Flag to indicate if the target is found.
        each(obj, function(value) {
            // If the value strictly equals the target, set found to true and break.
            if (found = value === target) {
                _.breakLoop();
            }
        });
        return found; // Returns true if target is found, false otherwise.
    };

    // Invoke a method with arguments on every item in a collection.
    // The `method` argument can be a string (method name) or a function.
    _.invoke = function(obj, method) {
        // Collect additional arguments to be passed to the invoked method.
        var args = _.rest(arguments, 2);
        return _.map(obj, function(value) {
            // Call the method on each value, using its context.
            return (method ? value[method] : value).apply(value, args);
        });
    };

    // Convenience version of a common use case for `map`: fetching a property.
    // Returns an array containing the value of a specific property from each object in the collection.
    _.pluck = function(obj, key) {
        return _.map(obj, function(value){
            return value[key];
        });
    };

    // Return the maximum item in a collection, or the item-based computation.
    // If an `iterator` is provided, the maximum is determined by the results of the iterator.
    _.max = function(obj, iterator, context) {
        // If no iterator is provided and the object is an array, use native Math.max.
        if (!iterator && _.isArray(obj)) {
            return Math.max.apply(Math, obj);
        }
        // Initialize result with a very small number for comparison.
        var result = {computed : -Infinity};
        each(obj, function(value, index, list) {
            // Compute the value for comparison, either directly or via the iterator.
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            // If the current computed value is greater than or equal to the stored maximum, update result.
            computed >= result.computed && (result = {value : value, computed : computed});
        });
        return result.value; // Return the actual value that produced the maximum computed value.
    };

    // Return the minimum element in a collection, or the element-based computation.
    // Similar to `max`, but for the minimum value.
    _.min = function(obj, iterator, context) {
        // If no iterator and object is an array, use native Math.min.
        if (!iterator && _.isArray(obj)) {
            return Math.min.apply(Math, obj);
        }
        // Initialize result with a very large number for comparison.
        var result = {computed : Infinity};
        each(obj, function(value, index, list) {
            // Compute value for comparison.
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            // If current computed value is less than stored minimum, update result.
            computed < result.computed && (result = {value : value, computed : computed});
        });
        return result.value; // Return the actual value that produced the minimum computed value.
    };

    // Sort the object's values by a criterion produced by an iterator.
    // This performs a stable sort.
    _.sortBy = function(obj, iterator, context) {
        return _.pluck(_.map(obj, function(value, index, list) {
            // Map each element to an object containing its original value and the computed criteria.
            return {
                value : value,
                criteria : iterator.call(context, value, index, list)
            };
        }).sort(function(left, right) {
            // Sort based on the computed criteria.
            var a = left.criteria,
                b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0; // Standard comparison for sort.
        }), 'value'); // Pluck the original values from the sorted intermediate objects.
    };

    // Use a comparator function to figure out at what index an object should
    // be inserted into a sorted array so as to maintain the array's order.
    // This uses a binary search algorithm for efficiency.
    _.sortedIndex = function(array, obj, iterator) {
        iterator = iterator || _.identity; // Default to identity function.
        var low = 0,
            high = array.length;
        while (low < high) {
            // Calculate the middle index using bitwise right shift for integer division.
            var mid = (low + high) >> 1;
            // Compare the criteria of the middle element with the object's criteria.
            iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
        }
        return low; // Return the insertion index.
    };

    // Convert anything iterable into a real, live array.
    // This is useful for arguments objects, NodeLists, or objects with a `toArray` method.
    _.toArray = function(iterable) {
        if (!iterable) {
            return []; // Return an empty array for null/undefined input.
        }
        if (iterable.toArray) {
            return iterable.toArray(); // If it has a toArray method, use it.
        }
        if (_.isArray(iterable)) {
            return iterable; // If it's already an array, return it directly.
        }
        if (_.isArguments(iterable)) {
            return slice.call(iterable); // Convert arguments object to a real array.
        }
        return _.values(iterable); // For other objects, return an array of their values.
    };

    // Return the number of elements in an object or array.
    _.size = function(obj) {
        return _.toArray(obj).length; // Convert to array and get its length.
    };

    // -------------------------- Array Functions: ------------------------------
    // These functions provide utilities for manipulating arrays.

    // Get the first element of an array.
    // Passing "n" will return the first N values in the array.
    // This function is also aliased as "head".
    // The "guard" check allows it to work correctly when passed as an iterator to `_.map`.
    _.first = function(array, n, guard) {
        return n && !guard ? slice.call(array, 0, n) : array[0];
    };

    // Returns everything but the first entry of the array.
    // This function is also aliased as "tail".
    // It's especially useful on the `arguments` object.
    // Passing an "index" will return the rest of the values in the array from that index onward.
    // The "guard" check allows it to work correctly when passed as an iterator to `_.map`.
    _.rest = function(array, index, guard) {
        // Use slice to get a portion of the array.
        // If index is undefined or guard is true, start from the second element (index 1).
        // Otherwise, start from the specified index.
        return slice.call(array, _.isUndefined(index) || guard ? 1 : index);
    };

    // Get the last element of an array.
    _.last = function(array) {
        return array[array.length - 1];
    };

    // Trim out all falsy values from an array.
    // Falsy values include `false`, `null`, `0`, `""`, `undefined`, and `NaN`.
    _.compact = function(array) {
        return _.filter(array, function(value){
            return !!value; // Double negation converts value to a boolean.
        });
    };

    // Return a completely flattened version of an array.
    // This function recursively flattens nested arrays into a single-level array.
    _.flatten = function(array) {
        return _.reduce(array, [], function(memo, value) {
            if (_.isArray(value)) {
                // If the value is an array, recursively flatten it and concatenate with memo.
                return memo.concat(_.flatten(value));
            }
            memo.push(value); // If not an array, just push the value.
            return memo;
        });
    };

    // Return a version of the array that does not contain the specified value(s).
    // The `values` to exclude are passed as additional arguments.
    _.without = function(array) {
        // Get all arguments after the first one (the array itself).
        var values = _.rest(arguments);
        return _.filter(array, function(value){
            // Filter out any values that are included in the `values` to exclude.
            return !_.include(values, value);
        });
    };

    // Produce a duplicate-free version of the array.
    // If the array has already been sorted, you have the option of using a faster algorithm.
    // This function is also known as `unique`.
    _.uniq = function(array, isSorted) {
        return _.reduce(array, [], function(memo, el, i) {
            // Add element to memo if it's the first element,
            // or if it's different from the last element of memo (for sorted arrays),
            // or if it's not already included in memo (for unsorted arrays).
            if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) {
                memo.push(el);
            }
            return memo;
        });
    };

    // Produce an array that contains every item shared between all the passed-in arrays.
    // This computes the intersection of multiple arrays.
    _.intersect = function(array) {
        var rest = _.rest(arguments); // Get all arrays after the first one.
        return _.filter(_.uniq(array), function(item) {
            // Filter the unique elements of the first array.
            // An item is included if it exists in ALL other arrays.
            return _.every(rest, function(other) {
                return _.indexOf(other, item) >= 0;
            });
        });
    };

    // Zip together multiple lists into a single array.
    // Elements that share an index across the input lists are grouped together.
    // For example: `_.zip(['moe', 'larry', 'curly'], [30, 40, 50], [true, false, false])`
    // returns `[["moe", 30, true], ["larry", 40, false], ["curly", 50, false]]`.
    _.zip = function() {
        var args = _.toArray(arguments); // Convert arguments to a real array.
        // Determine the maximum length among all input arrays.
        var length = _.max(_.pluck(args, 'length'));
        var results = new Array(length); // Pre-allocate results array.
        for (var i = 0; i < length; i++) {
            // For each index, pluck the element at that index from all input arrays.
            results[i] = _.pluck(args, String(i));
        }
        return results;
    };

    // If the browser doesn't supply us with `indexOf` (e.g., older Internet Explorer versions),
    // we need this function.
    // Return the position of the first occurrence of an item in an array,
    // or -1 if the item is not included in the array.
    // It delegates to JavaScript 1.8's native `indexOf` if available.
    _.indexOf = function(array, item) {
        if (nativeIndexOf && array.indexOf === nativeIndexOf) {
            return array.indexOf(item);
        }
        for (var i = 0, l = array.length; i < l; i++) {
            if (array[i] === item) {
                return i; // Return index if item is found.
            }
        }
        return -1; // Return -1 if item is not found.
    };

    // Delegates to JavaScript 1.6's native `lastIndexOf` if available.
    // Returns the position of the last occurrence of an item in an array,
    // or -1 if the item is not included.
    _.lastIndexOf = function(array, item) {
        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
            return array.lastIndexOf(item);
        }
        var i = array.length; // Start search from the end of the array.
        while (i--) {
            if (array[i] === item) {
                return i; // Return index if item is found.
            }
        }
        return -1; // Return -1 if item is not found.
    };

    // Generate an integer Array containing an arithmetic progression.
    // This is a port of the native Python `range()` function.
    // See: http://docs.python.org/library/functions.html#range
    // Can be called with `(stop)`, `(start, stop)`, or `(start, stop, step)`.
    _.range = function(start, stop, step) {
        var a     = _.toArray(arguments); // Convert arguments to array for flexible parsing.
        var solo  = a.length <= 1;        // Check if only one argument is provided.
        // Determine start, stop, and step values based on the number of arguments.
        var start = solo ? 0 : a[0],
            stop  = solo ? a[0] : a[1],
            step  = a[2] || 1; // Default step to 1 if not provided.

        var len   = Math.ceil((stop - start) / step); // Calculate the length of the range.
        if (len <= 0) {
            return []; // Return an empty array if length is non-positive.
        }
        var range = new Array(len); // Pre-allocate the range array.
        for (var i = start, idx = 0; true; i += step) {
            // Loop to populate the range array.
            // The condition for loop termination depends on the step direction.
            if ((step > 0 ? i - stop : stop - i) >= 0) {
                return range; // Break loop when the stop value is reached or crossed.
            }
            range[idx++] = i; // Add current number to the range.
        }
    };

    // ----------------------- Function Functions: ------------------------------
    // These functions provide utilities for working with JavaScript functions.

    // Create a function bound to a given object (assigning 'this', and arguments, optionally).
    // Binding with arguments is also known as 'curry'.
    // The `func` will always be called with `obj` as its `this` context.
    _.bind = function(func, obj) {
        // Collect any additional arguments passed to `bind` after `func` and `obj`.
        var args = _.rest(arguments, 2);
        return function() {
            // When the bound function is called, apply `func` with `obj` as context,
            // concatenating the pre-bound arguments with any new arguments.
            return func.apply(obj || {}, args.concat(_.toArray(arguments)));
        };
    };

    // Bind all of an object's methods to that object itself.
    // This is particularly useful for ensuring that all callbacks defined on an object
    // maintain the correct `this` context when invoked.
    _.bindAll = function(obj) {
        var funcs = _.rest(arguments); // Get method names from arguments.
        if (funcs.length == 0) {
            funcs = _.functions(obj); // If no names specified, bind all methods.
        }
        each(funcs, function(f) {
            // For each function name, reassign the object's method to its bound version.
            obj[f] = _.bind(obj[f], obj);
        });
        return obj; // Return the modified object.
    };

    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    // This is essentially a wrapper around `setTimeout`.
    _.delay = function(func, wait) {
        // Collect arguments to be passed to the delayed function.
        var args = _.rest(arguments, 2);
        return setTimeout(function(){
            // Apply the function with its original context (or undefined if not bound) and arguments.
            return func.apply(func, args);
        }, wait);
    };

    // Defers a function, scheduling it to run after the current call stack has cleared.
    // This is useful for non-blocking operations or ensuring a function runs after
    // all synchronous code has executed.
    _.defer = function(func) {
        // Effectively calls `_.delay(func, 1, ...args)`.
        return _.delay.apply(_, [func, 1].concat(_.rest(arguments)));
    };

    // Returns the first function passed as an argument to the second,
    // allowing you to adjust arguments, run code before and after, and
    // conditionally execute the original function.
    // This is a common pattern for creating decorators or wrappers.
    _.wrap = function(func, wrapper) {
        return function() {
            // The original function `func` is passed as the first argument to the `wrapper`.
            var args = [func].concat(_.toArray(arguments));
            return wrapper.apply(wrapper, args);
        };
    };

    // Returns a function that is the composition of a list of functions,
    // where each function consumes the return value of the function that follows.
    // For example, `_.compose(f, g, h)` is equivalent to `f(g(h()))`.
    _.compose = function() {
        var funcs = _.toArray(arguments); // Convert input functions to an array.
        return function() {
            var args = _.toArray(arguments); // Get arguments for the composed function.
            // Iterate through functions from right to left (last to first).
            for (var i = funcs.length - 1; i >= 0; i--) {
                // Apply the current function with the accumulated arguments.
                // The result becomes the new single argument for the next function.
                args = [funcs[i].apply(this, args)];
            }
            return args[0]; // The final result is the output of the first function.
        };
    };

    // ------------------------- Object Functions: ------------------------------
    // These functions provide utilities for working with JavaScript objects.

    // Retrieve the names of an object's own enumerable properties.
    // Delegates to ECMA5's native `Object.keys` for optimal performance.
    _.keys = nativeKeys || function(obj) {
        if (_.isArray(obj)) {
            return _.range(0, obj.length); // For arrays, return indices as keys.
        }
        var keys = []; // Initialize an array to store keys.
        for (var key in obj) {
            // Ensure the property is an own property of the object, not inherited.
            if (hasOwnProperty.call(obj, key)) {
                keys.push(key);
            }
        }
        return keys;
    };

    // Retrieve the values of an object's own enumerable properties.
    _.values = function(obj) {
        return _.map(obj, _.identity); // Use map with identity to extract values.
    };

    // Return a sorted list of the function names available on the object.
    // This includes both own and inherited methods.
    _.functions = function(obj) {
        return _.filter(_.keys(obj), function(key){
            return _.isFunction(obj[key]); // Filter for properties that are functions.
        }).sort(); // Sort the function names alphabetically.
    };

    // Extend a given object with all the properties in passed-in object(s).
    // This function performs a shallow copy of properties from source objects to the target object.
    // It handles ES5 getters/setters correctly.

    // Original simpler extend (commented out):
    // _.extend = function(obj) {
    //   each(_.rest(arguments), function(source) {
    //     for (var prop in source) obj[prop] = source[prop];
    //   });
    //   return obj;
    // };

    _.extend = function(target) {
        var i = 1,
            length = arguments.length,
            source;

        // Iterate through all source objects provided as arguments.
        for ( ; i < length; i++ ) {
            // Only deal with defined values for source objects.
            if ( (source = arguments[i]) != undefined ) {
                // Use Object.getOwnPropertyNames to get all own property names (enumerable and non-enumerable).
                Object.getOwnPropertyNames(source).forEach(function(k){
                    // Get the property descriptor for the current key.
                    // If it doesn't exist, create a default descriptor with the property's value.
                    var d = Object.getOwnPropertyDescriptor(source, k) || {value:source[k]};

                    // If the descriptor has a getter, use __defineGetter__ (for older engines)
                    // and potentially __defineSetter__ for setters.
                    if (d.get) {
                        target.__defineGetter__(k, d.get);
                        if (d.set) target.__defineSetter__(k, d.set);
                    }
                    // If it's a data property (not a getter/setter) and not a self-assignment,
                    // assign the value directly.
                    else if (target !== d.value) {
                        target[k] = d.value;
                    }
                });
            }
        }
        return target; // Return the modified target object.
    };


    // Create a (shallow-cloned) duplicate of an object.
    // For arrays, it uses `slice(0)` for an efficient shallow copy.
    // For objects, it uses `_.extend` to copy properties to a new empty object.
    _.clone = function(obj) {
        if (_.isArray(obj)) {
            return obj.slice(0); // Shallow copy for arrays.
        }
        return _.extend({}, obj); // Shallow copy for objects.
    };

    // Invokes `interceptor` with the `obj`, and then returns `obj`.
    // The primary purpose of this method is to "tap into" a method chain,
    // in order to perform operations on intermediate results within the chain
    // without breaking the chain.
    _.tap = function(obj, interceptor) {
        interceptor(obj); // Call the interceptor function with the object.
        return obj; // Return the original object to continue chaining.
    };

    // Perform a deep comparison to check if two objects are equal.
    // This function handles various types including primitives, dates, regex, and objects.
    _.isEqual = function(a, b) {
        // Check object identity first. If they are the same reference, they are equal.
        if (a === b) {
            return true;
        }

        // Check if types are different. If so, they cannot be deeply equal.
        var atype = typeof(a),
            btype = typeof(b);
        if (atype != btype) {
            return false;
        }

        // Basic equality test (watch out for type coercions with '==').
        // This handles primitives and null/undefined comparisons.
        if (a == b) {
            return true;
        }

        // One is falsy and the other truthy.
        // This catches cases like `0 == false` (true) but `0 === false` (false).
        // If `a` is falsy and `b` is truthy, or vice-versa, they are not deeply equal.
        if ((!a && b) || (a && !b)) {
            return false;
        }

        // If one of them implements an `isEqual()` method, delegate to it.
        // This allows custom equality logic for complex objects.
        if (a.isEqual) {
            return a.isEqual(b);
        }

        // Check dates' integer values.
        // If both are dates, compare their time values.
        if (_.isDate(a) && _.isDate(b)) {
            return a.getTime() === b.getTime();
        }

        // Check for NaN. `NaN === NaN` is false, so a special check is needed.
        if (_.isNaN(a) && _.isNaN(b)) {
            return true;
        }

        // Compare regular expressions.
        // Regex objects are equal if their source, global, ignoreCase, and multiline flags are identical.
        if (_.isRegExp(a) && _.isRegExp(b)) {
            return a.source     === b.source &&
                   a.global     === b.global &&
                   a.ignoreCase === b.ignoreCase &&
                   a.multiline  === b.multiline;
        }

        // If 'a' is not an object by this point, we can't handle it further
        // (e.g., primitives that failed previous checks).
        // This marks the end of deep comparison for non-object types.