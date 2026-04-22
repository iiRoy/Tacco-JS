/*
 * This file contains the JSONQuery library.
 *
 * Original Copyright (c) 2008 Jason E. Smith.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * ---
 *
 * CREDITS:
 * Special thanks to Kris Zyp from SitePen for his invaluable contribution:
 * a standalone port of JSONQuery, originally from the dojox.json.query module.
 *
 * ---
 *
 * OVERVIEW:
 * JSONQuery.js is designed as a standalone, zero-dependency port of the
 * dojox.json.query module. It aims to improve upon and succeed the JSONPath API
 * (http://goessner.net/articles/JsonPath/), offering powerful querying capabilities
 * akin to those found in XQuery.
 *
 * ---
 *
 * USAGE EXAMPLES:
 * For detailed examples and usage, please refer to:
 * http://www.sitepen.com/blog/2008/07/16/jsonquery-data-querying-beyond-jsonpath/
 *
 * * Key Evaluation Patterns:
 *   - JSONQuery(queryString, object)
 *   - JSONQuery(queryString)(object)
 *   Both patterns yield identical results. The first evaluates immediately,
 *   while the second returns a function for later evaluation.
 *
 * * Example 1: Direct Property Access
 *   JSONQuery("foo", {foo: "bar"})
 *   // Returns: "bar"
 *
 * * Example 2: Filtering with a Predicate Function
 *   // Define an evaluator function
 *   evaluator = JSONQuery("?foo='bar'&rating>3");
 *
 *   // Use the evaluator on an array of objects
 *   evaluator([{foo: "bar", rating: 4}, {foo: "baz", rating: 2}])
 *   // Returns: [{foo: "bar", rating: 4}]
 *   // This finds objects where 'foo' is 'bar' AND 'rating' is greater than 3.
 *
 * * Example 3: Complex Query with Filtering, Sorting, and Slicing
 *   evaluator = JSONQuery("$[?price<15.00][\\rating][0:10]");
 *   // This query:
 *   // 1. Filters objects with 'price' less than 15.00.
 *   // 2. Sorts the results by 'rating' in descending order.
 *   // 3. Returns the first ten items from the filtered and sorted list.
 *
 * * Example 4: Nested Data Query
 *   var data = {
 *     customers: [
 *       {name: "Susan", purchases: 29},
 *       {name: "Kim", purchases: 150},
 *       {name: "Jake", purchases: 27}
 *     ]
 *   };
 *
 *   var results = json.JSONQuery("$.customers[?purchases > 21 & name='Jake'][\\purchases]", data);
 *   // This query selects customers where 'purchases' > 21 AND 'name' is 'Jake',
 *   // then sorts them by 'purchases' in descending order.
 *   // (Note: The original comment for this example was slightly misleading,
 *   // it implies sorting *all* customers by purchases, but the filter applies first.)
 */

( function () {

  // A basic map implementation for arrays.
  // Mimics Array.prototype.map functionality.
  function map ( arr, fun /*, thisp*/ ) {
    var len = arr.length; // Get array length.

    if ( typeof fun != "function" ) {
      throw new TypeError(); // Ensure 'fun' is a function.
    }

    var res = new Array(len); // Initialize result array.
    var thisp = arguments[2]; // Optional 'this' context.

    for ( var i = 0; i < len; i++ ) {
      // Check if index exists in array (handles sparse arrays).
      if ( i in arr ) {
        res[i] = fun.call( thisp, arr[i], i, arr ); // Apply function and store result.
      }
    }

    return res; // Return the new array.
  }

  // A basic filter implementation for arrays.
  // Mimics Array.prototype.filter functionality.
  function filter ( arr, fun /*, thisp*/ ) {
    var len = arr.length;

    if ( typeof fun != "function" ) {
      throw new TypeError();
    }

    var res = new Array(); // Initialize an empty array for results.
    var thisp = arguments[2];

    for ( var i = 0; i < len; i++ ) {
      if ( i in arr ) {
        var val = arr[i]; // Store value before potential mutation by 'fun'.

        if ( fun.call( thisp, val, i, arr ) ) {
          res.push( val ); // Add to results if function returns true.
        }
      }
    }

    return res;
  }; // Semicolon here is part of the original code, keep it.

  // Handles slice operations on arrays, similar to Python's slice.
  // e.g., [3:6:2]
  function slice ( obj, start, end, step ) {
    var len = obj.length,
        results = [];

    end = end || len; // Default end to array length.
    start = ( start < 0 ) ? Math.max( 0, start + len ) : Math.min( len, start ); // Handle negative start.
    end = ( end < 0 ) ? Math.max( 0, end + len ) : Math.min( len, end ); // Handle negative end.

    for ( var i = start; i < end; i += step ) {
      results.push( obj[i] ); // Collect elements within the slice.
    }

    return results; // Return the sliced array.
  }

  // Expands an object/array based on a given name or for full recursion.
  // Used for ..name, .*, [*], [val1,val2], [val] operations.
  function expand ( obj, name ) {
    var results = []; // Array to store expanded results.

    function walk ( obj ) {
      // Recursive helper function.
      if ( name ) {
        if ( name === true && !( obj instanceof Array ) ) {
          // Full recursive object search (for '..').
          results.push( obj );
        } else if ( obj[name] ) {
          // Found the named property.
          results.push( obj[name] );
        }
      }

      for ( var i in obj ) { // Iterate over properties/indices.
        var val = obj[i];

        if ( !name ) {
          // If no specific name, collect all property values (.* or [*]).
          results.push( val );
        } else if ( val && typeof val == 'object' ) {
          // Recurse into nested objects.
          walk( val );
        }
      }
    }

    if ( name instanceof Array ) {
      // Handle array of indices/keys: [3,4,5]
      if ( name.length == 1 ) {
        // Special case for single-element array, possibly due to parser.
        // Fixes issues with commas in brackets like [@.func(4,2)].
        return obj[name[0]];
      }

      for ( var i = 0; i < name.length; i++ ) {
        results.push( obj[name[i]] );
      }
    } else {
      // Otherwise, perform the recursive walk.
      walk( obj );
    }

    return results; // Return the expanded results.
  }

  // Filters an array and removes duplicates.
  function distinctFilter ( array, callback ) {
    var outArr = []; // Output array without duplicates.
    var primitives = {}; // Used to track primitive duplicates.

    for ( var i = 0, l = array.length; i < l; ++i ) {
      var value = array[i];

      if ( callback( value, i, array ) ) {
        if ( ( typeof value == 'object' ) && value ) {
          // For objects, use a temporary marker property to detect duplicates.
          if ( !value.__included ) {
            value.__included = true;
            outArr.push( value );
          }
        } else if ( !primitives[value + typeof value] ) {
          // For primitives, use a map key (value + type) to detect duplicates.
          primitives[value + typeof value] = true;
          outArr.push( value );
        }
      }
    }

    // Clean up the temporary marker properties on objects.
    for ( i = 0, l = outArr.length; i < l; ++i ) {
      if ( outArr[i] ) {
        delete outArr[i].__included;
      }
    }

    return outArr; // Return the distinct, filtered array.
  }

  // The main JSONQuery function.
  var JSONQuery = function ( /*String*/ query, /*Object?*/ obj ) {
    //
    // Summary:
    //   Executes a JSONQuery on the provided object and returns the results.
    //   If only a query string is provided, it returns a "compiled" function
    //   that can evaluate objects based on the given query.
    //
    // query: String
    //   The JSONQuery query string.
    //
    // obj: Object?
    //   The target object for the JSONQuery. If omitted, a function is returned.
    //
    // Description:
    //   JSONQuery offers a comprehensive suite of data querying tools, including:
    //   filtering, recursive search, sorting, mapping, range selection, and
    //   powerful expressions with wildcard string comparisons and various operators.
    //   It generally supersedes JSONPath and aims for a syntax that aligns
    //   with JavaScript behavior where possible.
    //
    //   JSONQuery evaluations always start from the provided object, which
    //   can be referenced using '$'. Operators are applied sequentially
    //   to the result of the previous operation.
    //
    //   Supported Operators:
    //   --------------------
    //   * `.property`: Direct property access, behaves like JavaScript's dot notation.
    //   * `[expression]`: Property/index access based on the evaluation of 'expression'.
    //   * `[?expression]` or `?expression`: Filters an array, returning items that
    //     match 'expression'. Note: `?expression` without brackets allows no
    //     subsequent operators due to lack of containment.
    //   * `[^?expression]`: Distinct filter operation on an array, similar to `[?expression]`
    //     but removes duplicate values/objects from the result set.
    //   * `[/expression]`, `[\expression]`, `[/expression, /expression]`: Sorts an array.
    //     Multiple comma-delimited expressions allow for multi-level sorting.
    //     `/` indicates ascending, `\` indicates descending order.
    //   * `[=expression]`: Maps an array, creating a new array where each item is the
    //     result of evaluating 'expression' for each item in the source array.
    //   * `[start:end:step]`: Array slice/range operation, returning elements
    //     from 'start' to 'end' (exclusive), stepping by 'step'. All parts optional.
    //   * `[expr,expr]`: Union operator, returns an array of all property/index values
    //     resulting from the evaluation of the comma-delimited expressions.
    //   * `.*` or `[*]`: Returns the values of all properties of the current object.
    //   * `$`: Represents the root object. If a query doesn't start with `$`, it's
    //     automatically prepended.
    //   * `@`: Represents the current object within filter, sort, and map expressions.
    //     Often optional as names are auto-converted to property references of `@`.
    //   * `..property`: Performs a recursive search for 'property' within the current
    //     object and its sub-objects, returning an array of all found values.
    //   * `expr = expr`: Performs a comparison (like `==` in JS). String comparisons
    //     support wildcards: `*` (any number of chars), `?` (any single char).
    //   * `expr ~ expr`: Performs a case-insensitive string comparison.
    //   * `..[?expression]`: Deep search filter. Searches property values, arrays,
    //     and their children, not just within an array.
    //   * `$1, $2, $3, ...`: References to extra parameters passed to the query
    //     or evaluator function.
    //   * `+, -, /, *, &, |, %, (, ), <, >, <=, >=, !=`: These operators
    //     function identically to their JavaScript counterparts.
    //
    //   Evaluation Patterns (reiterated):
    //   | dojox.json.query(queryString, object)
    //   | and
    //   | dojox.json.query(queryString)(object)
    //   | always return identical results. The first immediately evaluates,
    //   | the second returns a function that then evaluates the object.
    //
    //   Example: Direct Property Access
    //   | dojox.json.query("foo", {foo:"bar"})
    //   | This will return "bar".
    //
    //   Example: Filter with a Predicate Function
    //   | evaluator = dojox.json.query("?foo='bar'&rating>3");
    //   | This creates a function that finds objects in an array
    //   | with `foo` equal to "bar" and `rating` greater than 3.
    //   | evaluator([{foo:"bar",rating:4},{foo:"baz",rating:2}])
    //   | This returns:
    //   | {foo:"bar",rating:4}
    //
    //   Example: Complex Query
    //   | evaluator = dojox.json.query("$[?price<15.00][\\rating][0:10]");
    //   | This finds objects in an array with `price` less than 15.00,
    //   | sorts them by `rating` (highest rated first), and returns
    //   | the first ten items from this filtered and sorted list.

    var tokens = []; // Not used in current implementation, but kept for consistency.
    var depth = 0; // Tracks bracket depth during string replacement.
    var str = []; // Stores string literals replaced during parsing.

    // Pre-process the query string:
    // 1. Mark inner brackets to be ignored (`]`).
    // 2. Replace string literals with placeholders (`\`` + index).
    query = query.replace( /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'|[\[\]]/g, function ( t ) {
      depth += t == '[' ? 1 : t == ']' ? -1 : 0; // Update bracket depth.
      return ( t == ']' && depth > 0 ) ? '`]' : // Mark inner ']' as skippable.
             ( t.charAt(0) == '"' || t.charAt(0) == "'" ) ? "`" + ( str.push(t) - 1 ) : // Replace strings.
               t; // Keep other characters as is.
    } );

    var prefix = ''; // Used to prepend function calls like 'map(', 'filter('.

    // Helper to wrap the current expression with a function call.
    function call ( name ) {
      prefix = name + "(" + prefix;
    }

    // Generates a regular expression matcher for wildcard/case-insensitive comparisons.
    function makeRegex ( t, a, b, c, d ) {
      // Check for wildcards or case-insensitive flag.
      return str[d].match( /[\*\?]/ ) || c == '~' ?
          "/^" + str[d].substring( 1, str[d].length - 1 ) // Get string content without quotes.
            .replace( /\\([btnfr\\"'])|([^\w\*\?])/g, "\\$1$2" ) // Escape special regex chars.
            .replace( /([\*\?])/g, ".$1" ) + // Convert JSONQuery wildcards to regex.
            ( c == '~' ? '$/i' : '$/' ) + // Add case-insensitive flag if '~'.
            ".test(" + a + ")" : // Construct the test call.
          t; // Return original token if no regex needed.
    }

    // Security check: Prevent unsafe function calls.
    query.replace( /(\]|\)|push|pop|shift|splice|sort|reverse)\s*\(/, function () {
      throw new Error( "Unsafe function call" );
    } );

    // Transform the query string into executable JavaScript.
    query = query.replace( /([^<>=]=)([^=])/g, "$1=$2" ) // Change single '=' to '==' for comparisons.
      .replace( /@|(\.\s*)?[a-zA-Z\$_]+(\s*:)?/g, function ( t ) {
        return t.charAt(0) == '.' ? t : // Leave dot-prefixed properties alone.
               t == '@' ? "$obj" : // Replace '@' with the current object variable.
               ( t.match( /:|^(\$|Math|true|false|null)$/ ) ? "" : "$obj." ) + t; // Add '$obj.' prefix to plain names unless they're special.
      } )
      .replace( /\.?\.?\[(`\]|[^\]])*\]|\?.*|\.\.([\w\$_]+)|\.\*/g, function ( t, a, b ) {
        // Handle various bracketed expressions, recursive descent, and wildcards.

        var oper = t.match( /^\.?\.?(\[\s*\^?\?|\^?\?|\[\s*==)(.*?)\]?$/ ); // [?expr], ?expr, [=expr], =expr
        if ( oper ) {
          var currentPrefix = '';
          if ( t.match( /^\.\./ ) ) {
            // Recursive object search (e.g., `..[?expr]`).
            call( "expand" );
            currentPrefix = ",true)"; // For expand function.
          }
          // Determine which helper function to call: map, distinctFilter, or filter.
          call( oper[1].match( /\=/ ) ? "map" : oper[1].match( /\^/ ) ? "distinctFilter" : "filter" );
          return currentPrefix + ",function($obj){return " + oper[2] + "})";
        }

        oper = t.match( /^\[\s*([\/\\].*)\]/ ); // Sort operations: [/sortexpr, \sortexpr]
        if ( oper ) {
          // Clone array and sort it.
          return ".concat().sort(function(a,b){" + oper[1].replace( /\s*,?\s*([\/\\])\s*([^,\\\/]+)/g, function ( t, direction, sortExpr ) {
              // Generate comparison logic for sorting.
              return "var av= " + sortExpr.replace( /\$obj/, "a" ) + // Replace $obj with 'a' for current item.
                     ",bv= " + sortExpr.replace( /\$obj/, "b" ) + // Replace $obj with 'b' for next item.
                     ";" + // End of var declarations.
                     "if(av>bv||bv==null){return " + ( direction == "/" ? 1 : -1 ) + ";}\n" + // Ascending or Descending.
                     "if(bv>av||av==null){return " + ( direction == "/" ? -1 : 1 ) + ";}\n";
          } ) + "})";
        }

        oper = t.match( /^\[(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)\]/ ); // Slice operation: [0:3:1]
        if ( oper ) {
          call( "slice" );
          return "," + ( oper[1] || 0 ) + "," + ( oper[2] || 0 ) + "," + ( oper[3] || 1 ) + ")";
        }

        // Handle recursive property search (..prop), all properties (.*, [*]), and union ([,]).
        if ( t.match( /^\.\.|\.\*|\[\s*\*\s*\]|,/ ) ) {
          call( "expand" );
          return ( t.charAt(1) == '.' ?
              ",'" + b + "'" : // ..prop -> expand(obj, 'prop')
                t.match( /,/ ) ?
                  "," + t : // [prop1,prop2] -> expand(obj, [prop1,prop2])
                  "" ) + ")"; // [*] or .* -> expand(obj, undefined)
        }

        return t; // Return token as is if no match.
      } )
      // Replace wildcard/case-insensitive comparisons with regex tests.
      .replace( /(\$obj\s*(\.\s*[\w_$]+\s*)*)(==|~)\s*`([0-9]+)/g, makeRegex ) // Left-hand side is $obj.
      .replace( /`([0-9]+)\s*(==|~)\s*(\$obj(\s*\.\s*[\w_$]+)*)/g, function ( t, a, b, c, d ) { // Right-hand side is $obj.
        return makeRegex( t, c, d, b, a ); // Call makeRegex with arguments swapped.
      } );

    // Final assembly of the query string.
    query = prefix + ( query.charAt(0) == '$' ? "" : "$" ) + query.replace( /`([0-9]+|\])/g, function ( t, a ) {
      // Restore string literals and inner bracket markers.
      return a == ']' ? ']' : str[a];
    } );

    // Create an executable function in the current scope.
    // This allows it to access helper functions like expand and slice.
    var executor = eval( "1&&function($,$1,$2,$3,$4,$5,$6,$7,$8,$9){var $obj=$;return " + query + "}" );

    // Shift arguments to correctly pass parameters to the executor.
    for ( var i = 0; i < arguments.length - 1; i++ ) {
      arguments[i] = arguments[i + 1];
    }

    // Execute the query or return the executor function.
    return obj ? executor.apply( this, arguments ) : executor;
  };

  // Export JSONQuery to the global scope or a defined namespace.
  if ( typeof namespace == "function" ) {
    // If a 'namespace' function is available (e.g., from Dojo).
    namespace( "json::JSONQuery", JSONQuery );
  } else {
    // Otherwise, attach to the window object for browser environments.
    window["JSONQuery"] = JSONQuery;
  }

} )(); // Immediately-invoked function expression.