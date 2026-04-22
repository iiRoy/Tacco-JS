/*
 * This is a highly optimized and robust JavaScript implementation
 * of the Mustache templating engine. It aims to provide logic-less
 * templates for dynamic content generation.
 *
 * For more information, please visit the official project repository:
 *   http://github.com/janl/mustache.js
 *
 * This file is part of the Mustache.js library, version 0.5.0-dev.
 *
 * (c) 2011 Jan Lehnardt <jan@apache.org>
 * Licensed under the MIT license.
 *
 * File: mustache.js
 * Version: 0.5.0-dev
 */
var Mustache = (typeof module !== "undefined" && module.exports) || {}; // Global Mustache object, also exported for CommonJS.

(function (exports) {

    // Expose core properties and functions of the Mustache engine.
    exports.name = "mustache.js";
    exports.version = "0.5.0-dev";
    exports.tags = ["{{", "}}"]; // Default delimiters for tags.

    // Core API functions.
    exports.parse = parse;
    exports.compile = compile;
    exports.render = render;
    exports.clearCache = clearCache;


    /* This function provides backwards compatibility with older versions (e.g., 0.4.x)
     * by mapping `to_html` to the standard `render` function.
     */
    exports.to_html = function (template, view, partials, send) {
        var result = render(template, view, partials); // Render the template.

        if (typeof send === "function") {
            send(result); // If a callback is provided, invoke it with the result.
        } else {
            return result; // Otherwise, return the rendered string directly.
        }
    };


    // Internal utility functions and native method references.
    var _toString = Object.prototype.toString; // Reference to Object.prototype.toString for type checking.
    var _isArray = Array.isArray;             // Reference to Array.isArray for efficient array detection.
    var _forEach = Array.prototype.forEach;   // Reference to Array.prototype.forEach for iteration.
    var _trim = String.prototype.trim;        // Reference to String.prototype.trim for whitespace removal.


    var isArray; // Our internal `isArray` implementation.
    if (_isArray) {
        isArray = _isArray; // Use native Array.isArray if available.
    } else {
        // Fallback for environments without native Array.isArray.
        isArray = function (obj) {
            return _toString.call(obj) === "[object Array]";
        };
    }


    var forEach; // Our internal `forEach` implementation.
    if (_forEach) {
        // Use native Array.prototype.forEach if available, wrapped for consistency.
        forEach = function (obj, callback, scope) {
            return _forEach.call(obj, callback, scope);
        };
    } else {
        // Manual `forEach` implementation for older environments.
        forEach = function (obj, callback, scope) {
            for (var i = 0, len = obj.length; i < len; ++i) {
                callback.call(scope, obj[i], i, obj);
            }
        };
    }


    var spaceRe = /^\s*$/; // Regular expression to test for strings containing only whitespace.


    function isWhitespace(string) {
        return spaceRe.test(string); // Checks if a string consists solely of whitespace characters.
    }


    var trim; // Our internal `trim` implementation.
    if (_trim) {
        // Use native String.prototype.trim if available.
        trim = function (string) {
            return string == null ? "" : _trim.call(string);
        };
    } else {
        // Fallback for environments without native String.prototype.trim.
        var trimLeft, trimRight;

        // Check if non-breaking space is matched by \s (it's not in IE).
        if (isWhitespace("\xA0")) {
            trimLeft = /^\s+/;  // Matches leading whitespace.
            trimRight = /\s+$/; // Matches trailing whitespace.
        } else {
            /* IE does not consider non-breaking spaces (\xA0) as \s.
             * This adjusted regex handles them correctly. Thanks, jQuery!
             */
            trimLeft = /^[\s\xA0]+/;
            trimRight = /[\s\xA0]+$/;
        }

        trim = function (string) {
            return string == null ? "" :
                String(string).replace(trimLeft, "").replace(trimRight, "");
        };
    }


    // Mapping for HTML entities to be escaped.
    var escapeMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;'
    };

    /*
     * Escapes special HTML characters in a string to prevent XSS.
     * Replaces &, <, >, ", ' with their corresponding HTML entities.
     */
    function escapeHTML(string) {
        return String(string).replace(/&(?!\w+;)|[<>"']/g, function (s) {
            return escapeMap[s] || s; // Replace known characters; otherwise, return original.
        });
    }


    /**
     * Enhances an error object with template-specific debugging information.
     * Adds `template`, `line`, and `file` properties and a more descriptive message.
     *
     * @param {Error} e        The original error object.
     * @param {string} template The template string where the error occurred.
     * @param {number} line     The line number in the template.
     * @param {string} file     The name of the template file (optional).
     * @returns {Error} The enhanced error object.
     */
    function debug(e, template, line, file) {
        file = file || "<template>"; // Default file name if not provided.

        var lines = template.split("\n"),
            start = Math.max(line - 3, 0),         // Start line for context (3 lines before).
            end = Math.min(lines.length, line + 3), // End line for context (3 lines after).
            context = lines.slice(start, end);      // Extract relevant lines for context.

        var c;
        for (var i = 0, len = context.length; i < len; ++i) {
            c = i + start + 1; // Actual line number.
            context[i] = (c === line ? " >> " : "    ") + context[i]; // Highlight the error line.
        }

        e.template = template; // Store the template source.
        e.line = line;         // Store the line number.
        e.file = file;         // Store the file name.
        e.message = [file + ":" + line, context.join("\n"), "", e.message].join("\n"); // Prepend context to message.

        return e;
    }


    /**
     * Looks up the value of a given `name` within the current context `stack`.
     * Supports dot-notation for nested property access (e.g., "user.address.city").
     *
     * @param {string} name         The name of the variable to look up.
     * @param {Array<Object>} stack The context stack (array of view objects).
     * @param {*} defaultValue      The value to return if `name` is not found.
     * @returns {*} The looked-up value or `defaultValue`.
     */
    function lookup(name, stack, defaultValue) {
        // Special case: `.` refers to the current context.
        if (name === ".") {
            return stack[stack.length - 1];
        }

        var names = name.split(".");      // Split name by dots for nested lookup.
        var lastIndex = names.length - 1; // Index of the final property name.
        var target = names[lastIndex];    // The actual property name to find.

        var value, context, i = stack.length, j, localStack;

        // Iterate through the context stack from newest to oldest context.
        while (i) {
            localStack = stack.slice(0); // Create a shallow copy of the stack for function calls.
            context = stack[--i];        // Get the current context object.

            j = 0;
            // Traverse nested properties if `name` contains dots.
            while (j < lastIndex) {
                context = context[names[j++]];

                if (context == null) {
                    break; // If a part of the path is null/undefined, stop.
                }

                localStack.push(context); // Add nested context to local stack.
            }

            // If context exists and the target property is found, get its value.
            if (context && typeof context === "object" && target in context) {
                value = context[target];
                break; // Value found, exit loop.
            }
        }

        // If the looked-up value is a function, call it in its current context.
        if (typeof value === "function") {
            value = value.call(localStack[localStack.length - 1]);
        }

        // Return defaultValue if value is null or undefined.
        if (value == null) {
            return defaultValue;
        }

        return value;
    }


    /**
     * Renders a Mustache section (# or ^).
     *
     * @param {string} name     The name of the section variable.
     * @param {Array<Object>} stack The context stack.
     * @param {Function} callback The function to execute for rendering the section's content.
     * @param {boolean} inverted If true, this is an inverted section (`^`).
     * @returns {string} The rendered content of the section.
     */
    function renderSection(name, stack, callback, inverted) {
        var buffer = "";                 // Buffer to accumulate rendered output.
        var value = lookup(name, stack); // Look up the section's value.

        if (inverted) {
            /*
             * According to the spec, inverted sections render once if the key
             * doesn't exist, is false, or is an empty list/array.
             */
            if (value == null || value === false || (isArray(value) && value.length === 0)) {
                buffer += callback(); // Render content if condition met.
            }
        } else if (isArray(value)) {
            // If value is an array, iterate over it, pushing each item onto the stack.
            forEach(value, function (value) {
                stack.push(value);    // Push current array item as context.
                buffer += callback(); // Render section content with new context.
                stack.pop();          // Pop context after rendering.
            });
        } else if (typeof value === "object") {
            // If value is an object (but not an array), push it as a single context.
            stack.push(value);    // Push object as context.
            buffer += callback(); // Render section content.
            stack.pop();          // Pop context.
        } else if (typeof value === "function") {
            // If value is a function, call it with the current scope and a rendering helper.
            var scope = stack[stack.length - 1]; // Get the current scope.
            var scopedRender = function (template) {
                return render(template, scope); // Helper to render sub-templates with current scope.
            };
            // Call the function, passing the rendered content and scoped render helper.
            buffer += value.call(scope, callback(), scopedRender) || "";
        } else if (value) {
            // If value is truthy (not null, false, 0, or empty string), render once.
            buffer += callback();
        }

        return buffer; // Return the accumulated buffer.
    }


    /**
     * Parses the given `template` string and returns the source code of a JavaScript
     * function that, when executed, will render the template.
     *
     * Recognized `options` include:
     *   - `file`:    The name of the file the template originated from (used in error messages).
     *   - `tags`:    An array of custom open and close tags for the template. Defaults to `Mustache.tags`.
     *   - `debug`:   Set to `true` to log the generated function's body to the console.
     *   - `space`:   Set to `true` to preserve whitespace on lines containing only a `{{tag}}`. Defaults to `false`.
     *
     * @param {string} template The Mustache template string to parse.
     * @param {object} options  Configuration options for parsing.
     * @returns {string} The JavaScript source code for the rendering function.
     */
    function parse(template, options) {
        options = options || {}; // Ensure options object exists.

        var tags = options.tags || exports.tags, // Determine tags from options or defaults.
            openTag = tags[0],                   // The opening tag string.
            closeTag = tags[tags.length - 1];    // The closing tag string.

        // Initialize the array that will build the JavaScript function's body.
        var code = [
            'var buffer = "";',     // The buffer to accumulate output.
            "\nvar line = 1;",      // Current line number for debugging.
            "\ntry {",              // Start of the try block for error handling.
            '\nbuffer += "'         // Initial string literal for appending template text.
        ];

        var spaces = [],        // Stores indices of whitespace characters on the current line.
            hasTag = false,     // Flag: true if a Mustache tag has been encountered on the current line.
            nonSpace = false;   // Flag: true if non-whitespace characters are on the current line.

        /**
         * Cleans up whitespace in the `code` array for the current line.
         * If `hasTag` is true, `nonSpace` is false, and `options.space` is false,
         * all whitespace added to `code` for the current line is removed.
         */
        var stripSpace = function () {
            if (hasTag && !nonSpace && !options.space) {
                // Remove all whitespace characters accumulated on this line.
                while (spaces.length) {
                    code.splice(spaces.pop(), 1);
                }
            } else {
                spaces = []; // Reset spaces for the next line.
            }

            hasTag = false;   // Reset tag flag.
            nonSpace = false; // Reset non-space flag.
        };


        var sectionStack = [], // Stack to keep track of open sections (for proper closing).
            updateLine,        // String for updating the `line` variable in the generated code.
            nextOpenTag,       // Stores the open tag for the next iteration (can change dynamically).
            nextCloseTag;      // Stores the close tag for the next iteration.

        /**
         * Sets new open and close tags based on the provided source string.
         * The source string is trimmed and split by whitespace.
         * E.g., `{{=<% %>=}}` sets `nextOpenTag` to `<%` and `nextCloseTag` to `%>`.
         * @param {string} source The tag definition string.
         */
        var setTags = function (source) {
            tags = trim(source).split(/\s+/); // Split by one or more whitespace characters.
            nextOpenTag = tags[0];           // New opening tag.
            nextCloseTag = tags[tags.length - 1]; // New closing tag.
        };

        /**
         * Appends code to include a partial template.
         * Looks up the partial by name and renders it using the current context.
         * @param {string} source The name of the partial template.
         */
        var includePartial = function (source) {
            code.push(
                '";',                                                    // Close current string literal.
                updateLine,                                              // Update line number.
                '\nvar partial = partials["' + trim(source) + '"];',    // Get partial from `partials` object.
                '\nif (partial) {',                                      // Check if partial exists.
                '\n  buffer += render(partial,stack[stack.length - 1],partials);', // Render partial.
                '\n}',
                '\nbuffer += "'                                          // Resume string literal.
            );
        };

        /**
         * Appends code to open a new section (# or ^).
         * Pushes the section's name and inverted status onto the `sectionStack`.
         * Generates a nested function (`callback`) that will render the section's content.
         * @param {string} source   The name of the section.
         * @param {boolean} inverted True if this is an inverted section.
         */
        var openSection = function (source, inverted) {
            var name = trim(source); // Get the section name, trimmed.

            if (name === "") {
                throw debug(new Error("Section name may not be empty"), template, line, options.file);
            }

            sectionStack.push({name: name, inverted: inverted}); // Push section onto stack.

            code.push(
                '";',                                  // Close current string literal.
                updateLine,                            // Update line number.
                '\nvar name = "' + name + '";',        // Declare section name variable.
                '\nvar callback = (function () {',     // Start the anonymous callback function.
                '\n  return function () {',            // Return the actual rendering function.
                '\n    var buffer = "";',              // Inner buffer for section content.
                '\nbuffer += "'                        // Resume string literal for inner content.
            );
        };

        /**
         * Convenience function to open an inverted section (`^`).
         * @param {string} source The name of the inverted section.
         */
        var openInvertedSection = function (source) {
            openSection(source, true); // Call openSection with `inverted` set to true.
        };

        /**
         * Appends code to close a section (`/`).
         * Pops the last section from `sectionStack` and generates the `renderSection` call.
         * @param {string} source The name of the section being closed.
         */
        var closeSection = function (source) {
            var name = trim(source); // Get the name of the section to close.
            // Get the name of the currently open section from the stack.
            var openName = sectionStack.length != 0 && sectionStack[sectionStack.length - 1].name;

            // Validate that the closing section matches the most recently opened one.
            if (!openName || name != openName) {
                throw debug(new Error('Section named "' + name + '" was never opened'), template, line, options.file);
            }

            var section = sectionStack.pop(); // Pop the section from the stack.

            code.push(
                '";',                                  // Close current string literal for section content.
                '\n    return buffer;',                // Return the inner buffer.
                '\n  };',                              // End of the inner rendering function.
                '\n})();'                              // End of the anonymous callback function.
            );

            // Generate the call to `renderSection` based on whether it's inverted.
            if (section.inverted) {
                code.push("\nbuffer += renderSection(name,stack,callback,true);");
            } else {
                code.push("\nbuffer += renderSection(name,stack,callback);");
            }

            code.push('\nbuffer += "'); // Resume outer string literal.
        };

        /**
         * Appends code to output a variable's value without HTML escaping.
         * Uses `lookup` to get the value.
         * @param {string} source The variable name.
         */
        var sendPlain = function (source) {
            code.push(
                '";',                                                  // Close current string literal.
                updateLine,                                            // Update line number.
                '\nbuffer += lookup("' + trim(source) + '",stack,"");', // Lookup and append value.
                '\nbuffer += "'                                        // Resume string literal.
            );
        };

        /**
         * Appends code to output a variable's value with HTML escaping.
         * Uses `lookup` to get the value and `escapeHTML` to escape it.
         * @param {string} source The variable name.
         */
        var sendEscaped = function (source) {
            code.push(
                '";',                                                          // Close current string literal.
                updateLine,                                                    // Update line number.
                '\nbuffer += escapeHTML(lookup("' + trim(source) + '",stack,""));', // Lookup, escape, and append.
                '\nbuffer += "'                                                // Resume string literal.
            );
        };


        var line = 1, c, callback; // Initialize line number, current char, and callback function.

        // Main loop to iterate through the template string character by character.
        for (var i = 0, len = template.length; i < len; ++i) {
            // Check if the current position matches the open tag.
            if (template.slice(i, i + openTag.length) === openTag) {
                i += openTag.length; // Advance past the open tag.
                c = template.substr(i, 1); // Get the character immediately after the open tag.

                updateLine = '\nline = ' + line + ';'; // Prepare line update string for generated code.
                nextOpenTag = openTag;             // Reset next tags to current defaults.
                nextCloseTag = closeTag;
                hasTag = true;                     // Mark that a tag was found on this line.

                // Determine the type of tag based on the character `c`.
                switch (c) {
                    case "!": // Comment tag `{{! ... }}`
                        i++; // Advance past '!'
                        callback = null; // Comments are ignored, no callback needed.
                        break;
                    case "=": // Set delimiter tag `{{=<% %>=}}`
                        i++; // Advance past '='
                        closeTag = "=" + closeTag; // Adjust close tag for the delimiter definition.
                        callback = setTags;        // Use setTags to parse new delimiters.
                        break;
                    case ">": // Partial tag `{{> partial_name }}`
                        i++; // Advance past '>'
                        callback = includePartial; // Use includePartial to insert partials.
                        break;
                    case "#": // Section tag `{{# section_name }}`
                        i++; // Advance past '#'
                        callback = openSection; // Use openSection for regular sections.
                        break;
                    case "^": // Inverted section tag `{{^ section_name }}`
                        i++; // Advance past '^'
                        callback = openInvertedSection; // Use openInvertedSection for inverted sections.
                        break;
                    case "/": // Close section tag `{{/ section_name }}`
                        i++; // Advance past '/'
                        callback = closeSection; // Use closeSection to close sections.
                        break;
                    case "{": // Unescaped variable tag `{{{ variable_name }}}`
                        closeTag = "}" + closeTag; // Adjust close tag to include the extra brace.
                        // Fall through to '&' case, as both are for unescaped variables.
                    case "&": // Unescaped variable tag `{{& variable_name }}`
                        i++; // Advance past '{' or '&'
                        nonSpace = true; // Mark as non-space content.
                        callback = sendPlain; // Use sendPlain for unescaped output.
                        break;
                    default: // Escaped variable tag `{{ variable_name }}`
                        nonSpace = true;  // Mark as non-space content.
                        callback = sendEscaped; // Use sendEscaped for HTML-escaped output.
                }

                // Find the closing tag for the current Mustache expression.
                var end = template.indexOf(closeTag, i);

                if (end === -1) {
                    // If no closing tag is found, it's an error.
                    throw debug(new Error('Tag "' + openTag + '" was not closed properly'), template, line, options.file);
                }

                var source = template.substring(i, end); // Extract the content between tags.

                if (callback) {
                    callback(source); // Execute the appropriate callback for the tag type.
                }

                // Update the line count based on newlines within the tag's source content.
                var n = 0;
                while (~(n = source.indexOf("\n", n))) {
                    line++; // Increment line number for each newline.
                    n++;    // Move past the found newline.
                }

                i = end + closeTag.length - 1; // Move index past the closing tag.
                openTag = nextOpenTag;         // Restore open tag for next iteration.
                closeTag = nextCloseTag;       // Restore close tag for next iteration.
            } else {
                // If not a Mustache tag, process as regular template text.
                c = template.substr(i, 1); // Get the current character.

                switch (c) {
                    case '"':
                    case "\\":
                        nonSpace = true; // These characters are not whitespace.
                        code.push("\\" + c); // Escape quotes and backslashes in the generated string.
                        break;
                    case "\r":
                        /* Ignore carriage returns, as they are often paired with \n
                         * and we only count \n for line numbers.
                         */
                        break;
                    case "\n":
                        spaces.push(code.length); // Record position of this newline.
                        code.push("\\n");         // Add escaped newline to code.
                        stripSpace();             // Check if this line was only whitespace and a tag.
                        line++;                   // Increment line number.
                        break;
                    default:
                        if (isWhitespace(c)) {
                            spaces.push(code.length); // Record position of this whitespace char.
                        } else {
                            nonSpace = true; // This character is not whitespace.
                        }

                        code.push(c); // Add character to code.
                }
            }
        }

        // After parsing, check if any sections were left unclosed.
        if (sectionStack.length != 0) {
            var unclosedSection = sectionStack[sectionStack.length - 1].name;
            throw debug(new Error('Section "' + unclosedSection + '" was not closed properly'), template, line, options.file);
        }

        // Final cleanup for any trailing whitespace on the last line.
        stripSpace();

        // Append the closing parts of the generated function's body.
        code.push(
            '";',                                    // Close the final string literal.
            "\nreturn buffer;",                      // Return the accumulated buffer.
            "\n} catch (e) { throw {error: e, line: line}; }" // Catch errors and re-throw with line info.
        );

        // Join the code array and remove any `buffer += "";\n` statements, which are artifacts.
        var body = code.join("").replace(/buffer \+= "";\n/g, "");

        // If debug option is enabled, log the generated function body.
        if (options.debug) {
            if (typeof console != "undefined" && console.log) {
                console.log(body); // Log to browser console.
            } else if (typeof print === "function") {
                print(body); // Log to other environments (e.g., Rhino).
            }
        }

        return body; // Return the raw JavaScript function body.
    }


    /**
     * Internal helper function used by `compile` to generate a reusable
     * rendering function for a given `template`.
     * This function wraps the `parse` result in a `Function` constructor.
     *
     * @param {string} template The template string to compile.
     * @param {object} options  Compilation options.
     * @returns {Function} A function that can render the template.
     */
    function _compile(template, options) {
        // Arguments that the generated function will expect.
        var args = "view,partials,stack,lookup,escapeHTML,renderSection,render";
        var body = parse(template, options); // Get the JS body from parsing the template.
        var fn = new Function(args, body);   // Create the rendering function.

        /*
         * This anonymous function serves as a wrapper for the generated `fn`.
         * It handles argument coercion, sets up initial variables (like the context stack),
         * and provides robust error handling by catching exceptions from `fn`
         * and enriching them with debugging information.
         */
        return function (view, partials) {
            partials = partials || {}; // Ensure partials object exists.

            var stack = [view]; // Initialize the context stack with the primary view.

            try {
                // Execute the generated rendering function with all necessary helpers.
                return fn(view, partials, stack, lookup, escapeHTML, renderSection, render);
            } catch (e) {
                // If an error occurs during rendering, enhance it with debug info and re-throw.
                throw debug(e.error, template, e.line, options.file);
            }
        };
    }

    // Cache object to store pre-compiled templates, keyed by template string.
    var _cache = {};

    /**
     * Compiles a template string into a reusable rendering function.
     * If the template has been compiled before, it returns the cached function.
     *
     * @param {string} template The template string to compile.
     * @param {object} options  Compilation options (e.g., custom tags, debug).
     * @returns {Function} A function that takes a view and partials, and returns the rendered string.
     */
    function compile(template, options) {
        options = options || {}; // Ensure options object exists.

        // Generate a unique cache key based on template and options (especially custom tags).
        var key = template + "-" + (options.tags || exports.tags).join(" ");
        var fn = _cache[key]; // Try to retrieve from cache.

        if (!fn) {
            // If not in cache, compile it and store the result.
            fn = _cache[key] = _compile(template, options);
        }

        return fn; // Return the compiled function.
    }

    /**
     * Renders a Mustache template with the given view and partials.
     * This is the primary entry point for rendering.
     *
     * @param {string} template The Mustache template string.
     * @param {object} view     The data object (context) to render the template with.
     * @param {object} partials An object containing partial templates (name: template_string).
     * @returns {string} The rendered template string.
     */
    function render(template, view, partials) {
        return compile(template)(view, partials); // Compile and immediately execute the function.
    }

    /**
     * Clears the internal cache of compiled templates.
     * This is useful for development environments or when templates might change dynamically.
     */
    function clearCache() {
        _cache = {}; // Reset the cache object.
    }

})(Mustache); // Pass the global Mustache object as `exports` to the IIFE.