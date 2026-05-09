/*
 * This section implements a basic CommonJS-like 'require'
 * functionality for browser environments. It manages module loading
 * and dependencies within a simulated module system.
 */

function require( p ) { // Main require function definition
  // Resolve the module path using the internal resolver logic
  var path = require.resolve(p),
      mod  = require.modules[path]; // Retrieve the module from the cache

  // If the requested module is not found in the registered modules, an error is thrown.
  if (!mod) {
    throw new Error('failed to require "' + p + '"');
  }

  // If the module has been registered but not yet executed (i.e., its exports are not initialized)
  if (!mod.exports) {
    mod.exports = {}; // Initialize the exports object for the module
    // Execute the module function, passing 'module', 'exports', and a 'relative require' function.
    mod.call(mod.exports, mod, mod.exports, require.relative(path));
  }

  // Return the initialized exports of the module.
  return mod.exports;
} // End of the primary require function

// A central object to store all registered module functions, keyed by their paths.
// This acts as both a registry and a cache for module definitions.
require.modules = {};

/*
 * Resolves a given path to its canonical module identifier.
 * It attempts to find the module in the following order:
 * 1. As a direct match (e.g., "foo/bar")
 * 2. By appending '.js' (e.g., "foo/bar.js")
 * 3. By appending '/index.js' (e.g., "foo/bar/index.js")
 * If no registered module matches, the original path is returned.
 */
require.resolve = function( path ) {
  var orig  = path, // Store the original path for fallback
      reg   = path + '.js', // Candidate path with .js extension
      index = path + '/index.js'; // Candidate path as an index file within a directory

  // Return the first path that corresponds to a registered module.
  return require.modules[reg] && reg ||
         require.modules[index] && index ||
         orig;
}; // End of require.resolve definition

/*
 * Registers a module function with a specific path.
 * The provided function `fn` encapsulates the module's logic and will be
 * executed the first time the module is required.
 */
require.register = function( path, fn ) {
  require.modules[path] = fn; // Map the module path to its corresponding function.
}; // End of require.register definition

/*
 * Creates a specialized 'require' function that resolves paths relative
 * to a given `parent` module's path. This enables modules to use
 * relative imports like `./component` or `../utils`.
 */
require.relative = function( parent ) {
  return function( p ) {
    // If the path does not start with '.', it's an absolute path, so use the global require.
    if ('.' != p.charAt(0)) {
      return require(p);
    }

    var path = parent.split('/'), // Break down the parent path into segments
        segs = p.split('/'); // Break down the relative path into segments
    path.pop(); // Remove the parent module's filename to get its directory path.

    // Process each segment of the relative path.
    for (var i = 0; i < segs.length; i++) {
      var seg = segs[i]; // Current path segment
      if ('..' == seg) {
        path.pop(); // '..' means go up one directory level.
      } else if ('.' != seg) {
        path.push(seg); // Add the segment to the path if it's not '.' (current directory).
      }
    }

    // Join the processed path segments and perform a global require.
    return require(path.join('/'));
  }; // End of the inner relative require function
}; // End of require.relative definition


require.register("browser/debug.js", function( module, exports, require ) { // Registering the debug module

  // This module exports a function that, when called with a 'type',
  // returns another function. This returned function is typically
  // used as a placeholder for debug logging, which might be
  // conditionally enabled or disabled based on build configurations.
  module.exports = function( type ) {
    return function() {
      // The inner function is intentionally left empty in this context.
      // Actual debug output or side effects would be implemented here.
    };
  };

}); /* End of module: browser/debug.js registration */

require.register("browser/diff.js", function( module, exports, require ) {
  /*
   * For licensing details and terms of usage, please refer to the license.txt file.
   */

  /**
   * Core Text Diff Implementation.
   * This library provides various diffing APIs for comparing text:
   * - `JsDiff.diffChars`: Performs a character-by-character comparison.
   * - `JsDiff.diffWords`: Compares texts word by word, intelligently ignoring whitespace differences.
   * - `JsDiff.diffLines`: Conducts a line-based comparison.
   * - `JsDiff.diffCss`: A specialized diff targeted at CSS content.
   *
   * The algorithms herein are based on the seminal work "An O(ND) Difference Algorithm and its Variations"
   * by Myers, 1986. For a deeper understanding, consult the paper:
   * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927
   */
  var JsDiff = (function() {
    /**
     * Creates a shallow duplicate of a path object.
     * This is crucial to avoid modifying shared references during the diff computation.
     * @param {object} path - The original path object.
     * @returns {object} A new object with identical `newPos` and a cloned `components` array.
     */
    function clonePath( path ) {
      return { newPos: path.newPos, components: path.components.slice(0) };
    }

    /**
     * Filters out any empty string elements from an array.
     * Useful for cleaning up tokenized strings.
     * @param {Array<string>} array - The array to process.
     * @returns {Array<string>} A new array containing only non-empty elements.
     */
    function removeEmpty( array ) {
      var ret = [];
      for (var i = 0; i < array.length; i++) {
        if (array[i]) {
          ret.push(array[i]);
        }
      }
      return ret;
    }

    /**
     * Converts special HTML characters in a string into their entity equivalents.
     * This prevents XSS and ensures correct rendering in HTML contexts.
     * @param {string} s - The string needing HTML escaping.
     * @returns {string} The HTML-escaped version of the input string.
     */
    function escapeHTML( s ) {
      var n = s;
      n = n.replace(/&/g, "&amp;");
      n = n.replace(/</g, "&lt;");
      n = n.replace(/>/g, "&gt;");
      n = n.replace(/"/g, "&quot;");

      return n;
    }


    /**
     * Constructor for the base diff object (`fbDiff` - "fast-block diff" or similar).
     * @param {boolean} ignoreWhitespace - A flag indicating whether whitespace should be ignored during comparisons.
     * @constructor
     */
    var fbDiff = function( ignoreWhitespace ) {
      this.ignoreWhitespace = ignoreWhitespace;
    };

    // Define methods for the `fbDiff` prototype.
    fbDiff.prototype = {
      /**
       * The core method to compute differences between two strings.
       * This implements the Myers' diff algorithm.
       * @param {string} oldString - The original text.
       * @param {string} newString - The modified text.
       * @returns {Array<object>} An array of diff components, each describing a change (added, removed, or unchanged).
       */
      diff: function( oldString, newString ) {
        // Optimization: If strings are identical, return a single 'unchanged' component.
        if (newString == oldString) {
          return [{ value: newString }];
        }
        // Edge case: If new string is empty, all of old string is 'removed'.
        if (!newString) {
          return [{ value: oldString, removed: true }];
        }
        // Edge case: If old string is empty, all of new string is 'added'.
        if (!oldString) {
          return [{ value: newString, added: true }];
        }

        // Tokenize the input strings based on the specific diff type (char, word, line, etc.).
        newString = this.tokenize(newString);
        oldString = this.tokenize(oldString);

        var newLen = newString.length,
            oldLen = oldString.length;
        var maxEditLength = newLen + oldLen; // Maximum possible length of the edit script.
        var bestPath = [{ newPos: -1, components: [] }]; // Initialize the best path array for the algorithm.

        // Seed the algorithm with editLength = 0 (common prefix).
        var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
        // If the entire strings are common from the start, return the components.
        if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
          return bestPath[0].components;
        }

        // Main loop of Myers' algorithm: iterate through increasing edit lengths.
        for (var editLength = 1; editLength <= maxEditLength; editLength++) {
          // Iterate through diagonals (k-lines).
          for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
            var basePath;
            var addPath    = bestPath[diagonalPath - 1], // Path representing an 'add' operation.
                removePath = bestPath[diagonalPath + 1]; // Path representing a 'remove' operation.
            oldPos = (removePath ? removePath.newPos : 0) - diagonalPath; // Calculate corresponding old string position.

            // Clear the previous diagonal path to save memory if it won't be used again.
            if (addPath) {
              bestPath[diagonalPath - 1] = undefined;
            }

            // Determine if 'add' or 'remove' operations are valid from current paths.
            var canAdd    = addPath && addPath.newPos + 1 < newLen;
            var canRemove = removePath && 0 <= oldPos && oldPos < oldLen;

            // If neither operation is possible, this diagonal path is invalid; skip it.
            if (!canAdd && !canRemove) {
              bestPath[diagonalPath] = undefined;
              continue;
            }

            // Select the preferred path to extend. We choose the one that reaches
            // farthest into the new string, prioritizing 'add' if positions are equal.
            if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {
              basePath = clonePath(removePath);
              this.pushComponent(basePath.components, oldString[oldPos], undefined, true); // Mark as removed.
            } else {
              basePath = clonePath(addPath);
              basePath.newPos++;
              this.pushComponent(basePath.components, newString[basePath.newPos], true, undefined); // Mark as added.
            }

            // Extend the current path by finding common elements (snakes).
            var oldPos = this.extractCommon(basePath, newString, oldString, diagonalPath);

            // If we've reached the end of both strings, this is the shortest edit script.
            if (basePath.newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
              return basePath.components;
            } else {
              bestPath[diagonalPath] = basePath; // Store the found path for this diagonal.
            }
          }
        }
      },

      /**
       * Adds a new diff component to the list, merging with the previous component
       * if they have the same status (added/removed/unchanged).
       * This helps in consolidating adjacent changes.
       * @param {Array<object>} components - The array of diff components.
       * @param {string} value - The content of the component.
       * @param {boolean} added - True if the component was added.
       * @param {boolean} removed - True if the component was removed.
       */
      pushComponent: function( components, value, added, removed ) {
        var last = components[components.length - 1];
        // Check if the last component has the same status and can be merged.
        if (last && last.added === added && last.removed === removed) {
          // Clone the component to prevent unintended reference sharing.
          components[components.length - 1] =
            { value: this.join(last.value, value), added: added, removed: removed };
        } else {
          // Otherwise, append a new component.
          components.push({ value: value, added: added, removed: removed });
        }
      },

      /**
       * Extends a path by identifying and incorporating common elements (a "snake").
       * This moves along the diagonal as long as elements in both strings match.
       * @param {object} basePath - The current path object to extend.
       * @param {Array<string>} newString - The tokenized new string.
       * @param {Array<string>} oldString - The tokenized old string.
       * @param {number} diagonalPath - The current diagonal index.
       * @returns {number} The updated position in the old string after extending the common part.
       */
      extractCommon: function( basePath, newString, oldString, diagonalPath ) {
        var newLen = newString.length,
            oldLen = oldString.length,
            newPos = basePath.newPos,
            oldPos = newPos - diagonalPath;

        // Continue extending as long as elements match and we are within string bounds.
        while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
          newPos++;
          oldPos++;
          this.pushComponent(basePath.components, newString[newPos], undefined, undefined); // Mark as unchanged.
        }
        basePath.newPos = newPos; // Update the new position in the base path.
        return oldPos; // Return the corresponding old position.
      },

      /**
       * Compares two values for equality, with an option to ignore whitespace for certain diff types.
       * @param {string} left - The first value to compare.
       * @param {string} right - The second value to compare.
       * @returns {boolean} True if values are considered equal, false otherwise.
       */
      equals: function( left, right ) {
        var reWhitespace = /\S/; // Regular expression to detect non-whitespace characters.
        // If ignoring whitespace and both values consist only of whitespace, they are considered equal.
        if (this.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right)) {
          return true;
        } else {
          return left == right; // Otherwise, use standard string equality.
        }
      },

      /**
       * Concatenates two strings. Used when merging diff components.
       * @param {string} left - The first string.
       * @param {string} right - The second string.
       * @returns {string} The combined string.
       */
      join: function( left, right ) {
        return left + right;
      },

      /**
       * The default tokenizer method. By default, it returns the input value as is.
       * This method is intended to be overridden by specific diff types (e.g., WordDiff)
       * to provide custom tokenization logic.
       * @param {string} value - The string to tokenize.
       * @returns {string} The original string (default behavior).
       */
      tokenize: function( value ) {
        return value;
      }
    };

    // Instantiate specific diff types with their respective configurations.
    var CharDiff = new fbDiff(); // Character-level diff: does not ignore whitespace.

    var WordDiff = new fbDiff(true); // Word-level diff: ignores whitespace.
    WordDiff.tokenize = function( value ) {
      // Tokenizes a string into words and surrounding whitespace, then filters out empty tokens.
      return removeEmpty(value.split(/(\s+|\b)/));
    };

    var CssDiff = new fbDiff(true); // CSS-specific diff: ignores whitespace.
    CssDiff.tokenize = function( value ) {
      // Tokenizes CSS by delimiters (braces, colons, semicolons, commas) and whitespace.
      return removeEmpty(value.split(/([{}:;,]|\s+)/));
    };

    var LineDiff = new fbDiff(); // Line-level diff: does not ignore whitespace.
    LineDiff.tokenize = function( value ) {
      // Tokenizes a string into an array of lines, preserving newlines within tokens if present.
      return value.split(/^/m);
    };

    // The public interface of the JsDiff module.
    return {
      // Exposed diffing functions for various granularities.
      diffChars: function( oldStr, newStr ) {
        return CharDiff.diff(oldStr, newStr);
      },
      diffWords: function( oldStr, newStr ) {
        return WordDiff.diff(oldStr, newStr);
      },
      diffLines: function( oldStr, newStr ) {
        return LineDiff.diff(oldStr, newStr);
      },

      diffCss: function( oldStr, newStr ) {
        return CssDiff.diff(oldStr, newStr);
      },

      /**
       * Generates a standard unified diff patch string.
       * This format is commonly used by version control systems.
       * @param {string} fileName - The name of the file being patched.
       * @param {string} oldStr - The original content of the file.
       * @param {string} newStr - The new content of the file.
       * @param {string} [oldHeader] - Optional header information for the old file (e.g., timestamp).
       * @param {string} [newHeader] - Optional header information for the new file.
       * @returns {string} The complete diff patch string.
       */
      createPatch: function( fileName, oldStr, newStr, oldHeader, newHeader ) {
        var ret = []; // Array to collect the lines of the patch.

        // Add standard patch header lines.
        ret.push("Index: " + fileName);
        ret.push("===================================================================");
        ret.push("--- " + fileName + (typeof oldHeader === "undefined" ? "" : "\t" + oldHeader));
        ret.push("+++ " + fileName + (typeof newHeader === "undefined" ? "" : "\t" + newHeader));

        var diff = LineDiff.diff(oldStr, newStr); // Perform line-level diff.
        // Remove a trailing empty value if it exists, which can occur from `split` behavior.
        if (!diff[diff.length - 1].value) {
          diff.pop();
        }
        diff.push({ value: "", lines: [] }); // Append an empty component to simplify boundary handling.

        /**
         * Prefixes each line in an array with a space to denote context lines in a diff.
         * @param {Array<string>} lines - An array of text lines.
         * @returns {Array<string>} The array with each line prefixed by a space.
         */
        function contextLines( lines ) {
          return lines.map(function( entry ) {
            return ' ' + entry;
          });
        }

        /**
         * Checks if the last line of a file lacks a newline character and adds the
         * standard `\ No newline at end of file` marker to the patch hunk if needed.
         * @param {Array<string>} curRange - The current array of lines for the hunk.
         * @param {number} i - The current index in the main diff array.
         * @param {object} current - The current diff component being processed.
         */
        function eofNL( curRange, i, current ) {
          var last = diff[diff.length - 2],
              isLast = i === diff.length - 2,
              isLastOfType = i === diff.length - 3 && (current.added === !last.added || current.removed === !last.removed);

          // If the current value does not end with a newline and it's the last line (or near last)
          if (!/\n$/.test(current.value) && (isLast || isLastOfType)) {
            curRange.push('\\ No newline at end of file');
          }
        }

        var oldRangeStart = 0,
            newRangeStart = 0,
            curRange      = [], // Stores lines for the current diff hunk.
            oldLine       = 1,
            newLine       = 1;

        // Iterate through each diff component to construct the patch hunks.
        for (var i = 0; i < diff.length; i++) {
          var current = diff[i],
              lines   = current.lines || current.value.replace(/\n$/, "").split("\n");
          current.lines = lines; // Cache the split lines array on the component.

          if (current.added || current.removed) {
            // This component represents either an addition or a removal.
            if (!oldRangeStart) {
              var prev = diff[i - 1]; // Get the previous component to determine context.
              oldRangeStart = oldLine;
              newRangeStart = newLine;

              // If there was a preceding component, add up to 4 lines of context from it.
              if (prev) {
                curRange = contextLines(prev.lines.slice(-4));
                oldRangeStart -= curRange.length; // Adjust range start based on context added.
                newRangeStart -= curRange.length;
              }
            }
            // Add the changed lines to the current hunk, prefixed with '+' or '-'.
            curRange.push.apply(curRange, lines.map(function( entry ) {
              return (current.added ? "+" : "-") + entry;
            }));
            eofNL(curRange, i, current); // Check for EOF newline.

            // Update line counters based on added/removed lines.
            if (current.added) {
              newLine += lines.length;
            } else {
              oldLine += lines.length;
            }
          } else {
            // This component represents unchanged lines (context).
            if (oldRangeStart) {
              // If there's an active change hunk, consider joining or closing it.
              // If the context block is small and not near the end, it might be part of an overlapping hunk.
              if (lines.length <= 8 && i < diff.length - 2) {
                curRange.push.apply(curRange, contextLines(lines)); // Add as part of the current hunk.
              } else {
                // Close out the current hunk and append it to the patch.
                var contextSize = Math.min(lines.length, 4); // Use up to 4 lines of context around the hunk.
                ret.push(
                  "@@ -" + oldRangeStart + "," + (oldLine - oldRangeStart + contextSize) +
                  " +" + newRangeStart + "," + (newLine - newRangeStart + contextSize) +
                  " @@"
                );
                ret.push.apply(ret, curRange); // Add the accumulated changed lines.
                ret.push.apply(ret, contextLines(lines.slice(0, contextSize))); // Add leading context for this block.
                if (lines.length <= 4) {
                  eofNL(ret, i, current); // Check for EOF newline if context is small.
                }

                // Reset variables for the next hunk.
                oldRangeStart = 0;
                newRangeStart = 0;
                curRange      = [];
              }
            }
            // Always update line counters for context lines, whether part of a hunk or not.
            oldLine += lines.length;
            newLine += lines.length;
          }
        }

        return ret.join('\n') + '\n'; // Join all patch lines with newlines and add a final newline.
      },

      /**
       * Transforms an array of diff changes into an HTML string, using `<ins>` for added
       * content and `<del>` for removed content, with HTML entities escaped.
       * @param {Array<object>} changes - The array of diff components.
       * @returns {string} An HTML string representing the changes.
       */
      convertChangesToXML: function( changes ) {
        var ret = []; // Array to build the HTML output.
        for (var i = 0; i < changes.length; i++) {
          var change = changes[i];
          if (change.added) {
            ret.push("<ins>"); // Opening tag for inserted content.
          } else if (change.removed) {
            ret.push("<del>"); // Opening tag for deleted content.
          }

          ret.push(escapeHTML(change.value)); // Add the content, ensuring it's HTML-safe.

          if (change.added) {
            ret.push("</ins>"); // Closing tag for inserted content.
          } else if (change.removed) {
            ret.push("</del>"); // Closing tag for deleted content.
          }
        }
        return ret.join(""); // Concatenate all parts into a single HTML string.
      }
    };
  })(); // End of self-executing anonymous function for JsDiff.

  // Export the JsDiff object if a CommonJS-like `module` object is available (e.g., Node.js environment).
  if (typeof module !== "undefined") {
    module.exports = JsDiff;
  }

}); // End of module: browser/diff.js registration

require.register("browser/events.js", function( module, exports, require ) {

  /*
   * This module provides a robust implementation of an EventEmitter,
   * a pattern for handling events and callbacks in an asynchronous manner.
   */

  // Make the EventEmitter constructor available via `exports`.
  exports.EventEmitter = EventEmitter;

  /**
   * A utility function to reliably determine if a given object is an array.
   * This method is generally preferred over `instanceof Array` for cross-frame compatibility.
   * @param {any} obj - The object to be checked.
   * @returns {boolean} Returns `true` if `obj` is an array, `false` otherwise.
   */
  function isArray( obj ) {
    return '[object Array]' == {}.toString.call(obj);
  }

  /**
   * The constructor for the EventEmitter.
   * Instances of this class can register and emit events.
   * @constructor
   * @api public
   */
  function EventEmitter() {};

  /**
   * Registers a new listener function (`fn`) for a specified event `name`.
   * If multiple listeners are registered for the same event, they will be invoked
   * in the order they were added.
   * @param {string} name - The name of the event to listen for.
   * @param {Function} fn - The callback function to execute when the event is emitted.
   * @returns {EventEmitter} Returns the EventEmitter instance (`this`) for method chaining.
   * @api public
   */
  EventEmitter.prototype.on = function( name, fn ) {
    // Initialize the event storage object if it doesn't already exist.
    if (!this.$events) {
      this.$events = {};
    }

    // If no listeners are currently registered for this event name,
    // the function is assigned directly.
    if (!this.$events[name]) {
      this.$events[name] = fn;
    }
    // If an array of listeners already exists for this event,
    // the new function is appended to the array.
    else if (isArray(this.$events[name])) {
      this.$events[name].push(fn);
    }
    // If a single function was previously assigned (not an array),
    // convert it into an array containing both the old and new functions.
    else {
      this.$events[name] = [this.$events[name], fn];
    }

    return this; // Enable fluent interface / method chaining.
  };

  // Provide an alias for `on` as `addListener` for compatibility with other event emitter implementations.
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  /**
   * Adds a listener that will be executed at most once for a given event `name`.
   * After the event is emitted and the listener is called, it is automatically removed.
   * @param {string} name - The name of the event.
   * @param {Function} fn - The listener function to be called once.
   * @returns {EventEmitter} Returns the EventEmitter instance (`this`) for method chaining.
   * @api public
   */
  EventEmitter.prototype.once = function( name, fn ) {
    var self = this; // Capture the `this` context to use within the wrapper function.

    // A wrapper function that removes itself before calling the original listener.
    function on() {
      self.removeListener(name, on); // Remove this one-time listener.
      fn.apply(this, arguments); // Invoke the original listener with the correct context and arguments.
    };

    on.listener = fn; // Store a reference to the original listener, useful for `removeListener`.
    this.on(name, on); // Register the wrapper function as a regular listener.

    return this; // Enable method chaining.
  };

  /**
   * Removes a specific listener function for the given event `name`.
   * If the listener function `fn` is not found, no action is taken.
   * @param {string} name - The name of the event.
   * @param {Function} fn - The specific listener function to remove.
   * @returns {EventEmitter} Returns the EventEmitter instance (`this`) for method chaining.
   * @api public
   */
  EventEmitter.prototype.removeListener = function( name, fn ) {
    // Proceed only if event storage and listeners for the specified event exist.
    if (this.$events && this.$events[name]) {
      var list = this.$events[name]; // Get the list of listeners for this event.

      // If the listeners are stored in an array.
      if (isArray(list)) {
        var pos = -1; // Initialize position to -1 (not found).

        // Iterate through the list to find the specified function or its `once` wrapper.
        for (var i = 0, l = list.length; i < l; i++) {
          if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {
            pos = i;
            break;
          }
        }

        // If the function was not found, return immediately.
        if (pos < 0) {
          return this;
        }

        list.splice(pos, 1); // Remove the listener from the array.

        // If the array becomes empty after removal, delete the event entry to save memory.
        if (!list.length) {
          delete this.$events[name];
        }
      }
      // If a single function (not an array) was registered for this event.
      else if (list === fn || (list.listener && list.listener === fn)) {
        delete this.$events[name]; // Delete the single listener entry.
      }
    }

    return this; // Enable method chaining.
  };

  /**
   * Removes all listeners for a specified event `name`.
   * If `name` is omitted or `undefined`, all listeners for all events are removed.
   * @param {string} [name] - The name of the event.
   * @returns {EventEmitter} Returns the EventEmitter instance (`this`) for method chaining.
   * @api public
   */
  EventEmitter.prototype.removeAllListeners = function( name ) {
    // If no specific event name is provided, clear all events by resetting the `$events` object.
    if (name === undefined) {
      this.$events = {};
      return this;
    }

    // If listeners exist for the specified event, remove them by setting the entry to null.
    // (Could also use `delete this.$events[name];` for a more complete removal.)
    if (this.$events && this.$events[name]) {
      this.$events[name] = null;
    }

    return this; // Enable method chaining.
  };

  /**
   * Retrieves an array of all listener functions currently registered for a specific event `name`.
   * If no listeners are registered, an empty array is returned.
   * @param {string} name - The name of the event.
   * @returns {Array<Function>} An array containing the registered listener functions.
   * @api public
   */
  EventEmitter.prototype.listeners = function( name ) {
    // Initialize the event storage if it doesn't exist.
    if (!this.$events) {
      this.$events = {};
    }

    // If no listeners exist for this event, initialize an empty array.
    if (!this.$events[name]) {
      this.$events[name] = [];
    }

    // If a single function (not an array) is registered, wrap it in an array
    // to ensure a consistent return type.
    if (!isArray(this.$events[name])) {
      this.$events[name] = [this.$events[name]];
    }

    return this.$events[name]; // Return the array of listeners.
  };

  /**
   * This JSDoc comment describes the `emit` method, which is typically part of
   * an EventEmitter implementation. The actual JavaScript code for the `emit`
   * method was not provided in the original snippet, only its documentation.
   * An implementation would usually iterate through the listeners for `name`
   * and call each one with the arguments passed to `emit`.
   *
   * @api public
   */
  // EventEmitter.prototype.emit = function (name) { /* ... implementation ... */ };

}); // End of module: browser/events.js registration