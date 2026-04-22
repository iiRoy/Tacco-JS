/*!
 * PatternBuilder JS Utility v0.1.2
 * https://github.com/VerbalExpressions/JSVerbalExpressions
 *
 *
 * Licensed under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Build Date: 2023-10-27
 *
 */

// Encapsulate the entire implementation within an IIFE.
(function () {
    var globalContext = this;

    // This is the primary factory function for creating pattern instances.
    // It constructs a new regular expression object and augments it with
    // all the pattern-building utility methods.
    function PatternConstructor() {
        var patternObject = new RegExp(); // Initialize an empty regular expression object.

        // Equip the new regex object with all the utility methods
        // defined on PatternConstructor.prototype.
        PatternConstructor.distributeMethods(patternObject);

        // Deliver the newly configured regex object, ready for chaining.
        return patternObject;
    }

    // A static helper method to copy all prototype methods to a target object.
    // This allows the RegExp instance to directly use the builder methods.
    PatternConstructor.distributeMethods = function (targetObject) {
        // Iterate over each member defined within the prototype.
        for (var protoMember in PatternConstructor.prototype) {
            // Ensure the member is directly on the prototype and not inherited.
            if (PatternConstructor.prototype.hasOwnProperty(protoMember)) {
                // Attach the method from the prototype to the target regex object.
                targetObject[protoMember] = PatternConstructor.prototype[protoMember];
            }
        }

        return targetObject;
    };

    // Define all the available pattern building methods and internal properties.
    PatternConstructor.prototype = {
        // Internal properties storing various parts of the regex string and its flags.
        // Note: These properties are on the prototype, implying shared state across instances
        // if modified directly by methods on the RegExp instance, as per the original code's structure.
        _leadingParts: "",      // Stores elements such as start-of-line anchor ('^').
        _mainContent: "",       // Accumulates the core pattern components dynamically.
        _trailingParts: "",     // Stores elements such as end-of-line anchor ('$').
        _flagsOption: "gm",     // Default regex flags: global ('g') and multiline ('m').

        // Prepares input data to be safely included within a regex pattern.
        // Escapes special regex characters unless the input is already a RegExp or a number.
        cleanInput: function (inputVal) {
            // If the value already has a 'source' property (like a RegExp object), use it directly.
            if (inputVal && typeof inputVal.source === "string") return inputVal.source;
            // If the value is a number, it can often be used as-is in regex patterns.
            if (typeof inputVal === "number") return inputVal;
            // For strings, escape any characters that have special meaning in regex.
            return inputVal.replace(/[^\w]/g, function (charItem) {
                return "\\" + charItem;
            });
        },

        // Appends a new segment to the main pattern and then reconstructs the regex.
        // This method is central to building the pattern incrementally.
        appendToPattern: function (segment) {
            this._mainContent += segment || ""; // Add the new segment, defaulting to an empty string if null/undefined.
            // Recompile the regex with the updated leading, main, and trailing parts, and current flags.
            // 'this' here refers to the RegExp instance. The 'compile' method is a deprecated
            // feature of RegExp.prototype in modern JavaScript, but used here as per the original code's structure.
            this.compile(this._leadingParts + this._mainContent + this._trailingParts, this._flagsOption);
            return this; // Return 'this' to allow method chaining.
        },

        // Controls the start-of-line anchor ('^').
        beginOfLine: function (activate) {
            activate = (activate !== false); // Default to true if not explicitly false.
            this._leadingParts = activate ? "^" : ""; // Set or clear the leading anchor based on 'activate'.
            this.appendToPattern(""); // Recompile the regex to apply the change.
            return this;
        },

        // Controls the end-of-line anchor ('$').
        finishOfLine: function (activate) {
            activate = (activate !== false); // Default to true if not explicitly false.
            this._trailingParts = activate ? "$" : ""; // Set or clear the trailing anchor.
            this.appendToPattern(""); // Recompile the regex to apply the change.
            return this;
        },

        // Adds a non-capturing group for the next pattern segment.
        nextSegment: function (content) {
            content = this.cleanInput(content); // Sanitize the input for regex safety.
            this.appendToPattern("(?:" + content + ")"); // Add the content wrapped in a non-capturing group.
            return this;
        },

        // An alias for 'nextSegment', providing a more natural start to a pattern chain.
        locate: function (content) {
            return this.nextSegment(content);
        },

        // Makes the preceding pattern segment optional (zero or one occurrence).
        optionalSegment: function (content) {
            content = this.cleanInput(content); // Sanitize the input.
            this.appendToPattern("(?:" + content + ")?"); // Add as an optional non-capturing group.
            return this;
        },

        // Matches any character zero or more times.
        anyCharacters: function () {
            this.appendToPattern("(?:.*)"); // Non-capturing group with any character, zero or more.
            return this;
        },

        // Matches any character zero or more times, except for specified characters.
        anyExcept: function (forbiddenChars) {
            forbiddenChars = this.cleanInput(forbiddenChars); // Sanitize the input.
            this.appendToPattern("(?:[^" + forbiddenChars + "]*)"); // Inverted character set, zero or more.
            return this;
        },

        // Matches any character one or more times.
        someCharacters: function () {
            this.appendToPattern("(?:.+)"); // Non-capturing group with any character, one or more.
            return this;
        },

        // Matches any character one or more times, except for specified characters.
        someExcept: function (forbiddenChars) {
            forbiddenChars = this.cleanInput(forbiddenChars); // Sanitize the input.
            this.appendToPattern("(?:[^" + forbiddenChars + "]+)"); // Inverted character set, one or more.
            return this;
        },

        // Provides a convenient interface for String.prototype.replace,
        // using the constructed regex pattern.
        swapContent: function (originalText, replacementText) {
            originalText = originalText.toString(); // Ensure the source is a string.
            return originalText.replace(this, replacementText); // Use 'this' (the regex object) for replacement.
        },

        // Adds a pattern to match common newline sequences (CRLF, CR, LF).
        newlineSequence: function () {
            this.appendToPattern("(?:\\r\\n|\\r|\\n)"); // Matches Windows, old Mac, and Unix newlines.
            return this;
        },
        // Shorthand for 'newlineSequence'.
        nl: function () {
            return this.newlineSequence();
        },

        // Adds a pattern for a tab character.
        tabChar: function () {
            this.appendToPattern("\\t");
            return this;
        },

        // Adds a pattern for one or more word characters (alphanumeric + underscore).
        wordChars: function () {
            this.appendToPattern("\\w+");
            return this;
        },

        // Matches any single character from a specified set of characters.
        oneOfCharacters: function (charSet) {
            charSet = this.cleanInput(charSet); // Sanitize the input.
            this.appendToPattern("[" + charSet + "]"); // Add as a character set (e.g., [abc]).
            return this;
        },

        // Shorthand for 'oneOfCharacters'.
        anyCharFrom: function (charSet) {
            return this.oneOfCharacters(charSet);
        },

        // Matches characters within specified ranges (e.g., 'a-z', '0-9').
        // Accepts multiple pairs of arguments: range(start1, end1, start2, end2, ...).
        charRange: function () {
            var rangeString = "["; // Start building the character range string.
            var inputArgs = arguments; // Capture arguments locally for easier access.

            // Iterate through arguments in pairs (start character, end character).
            for (var idx = 1; idx < inputArgs.length; idx += 2) {
                var startChar = this.cleanInput(inputArgs[idx - 1]); // Sanitize start character.
                var endChar = this.cleanInput(inputArgs[idx]);       // Sanitize end character.

                rangeString += startChar + "-" + endChar; // Append the range (e.g., "a-z").
            }

            rangeString += "]"; // Close the character range definition.

            this.appendToPattern(rangeString); // Add the constructed range to the pattern.
            return this;
        },

        /// Regex Flag Management Methods ///

        // Activates a specific regex flag (e.g., 'i' for case-insensitivity).
        applyFlag: function (flagChar) {
            // Only add the flag if it's not already present in the current flags option.
            if (this._flagsOption.indexOf(flagChar) === -1) {
                this._flagsOption += flagChar;
            }
            this.appendToPattern(""); // Recompile the regex with the updated flags.
            return this;
        },
        // Deactivates a specific regex flag.
        clearFlag: function (flagChar) {
            this._flagsOption = this._flagsOption.replace(flagChar, ""); // Remove the flag character.
            this.appendToPattern(""); // Recompile the regex with the updated flags.
            return this;
        },

        // Toggles case-insensitivity ('i' flag) for the pattern.
        caseInsensitive: function (activate) {
            if (activate !== false) this.applyFlag("i"); // Enable 'i' flag if 'activate' is true or undefined.
            else this.clearFlag("i"); // Disable 'i' flag if 'activate' is explicitly false.

            this.appendToPattern("");
            return this;
        },

        // Toggles global matching ('g' flag).
        // The default behavior includes 'g', so this method reverses it.
        matchOnce: function (activate) {
            if (activate !== false) this.clearFlag("g"); // Disable 'g' flag for single match.
            else this.applyFlag("g"); // Enable 'g' flag for global matching.

            this.appendToPattern("");
            return this;
        },

        // Toggles multiline matching ('m' flag).
        // The default behavior includes 'm', so this method reverses it.
        singleLineSearch: function (activate) {
            if (activate !== false) this.clearFlag("m"); // Disable 'm' flag for single line behavior.
            else this.applyFlag("m"); // Enable 'm' flag for multiline behavior.

            this.appendToPattern("");
            return this;
        },

        // Repeats the immediately preceding pattern component.
        // Can specify an exact number of repetitions, or a range (e.g., {n} or {n,m}).
        repeatLast: function () {
            var repeatCount;
            var inputArgs = arguments; // Capture arguments locally.

            if (inputArgs.length <= 1) {
                // If one argument, treat it as an exact count (e.g., {5}).
                if (/\d+/.exec(inputArgs[0]) !== null) {
                    repeatCount = "{" + inputArgs[0] + "}";
                }
            } else {
                // If multiple arguments, form a range (e.g., {n,m}).
                var countList = [];
                for (var idx = 0; idx < inputArgs.length; idx++) {
                    if (/\d+/.exec(inputArgs[idx]) !== null) {
                        countList.push(inputArgs[idx]);
                    }
                }
                repeatCount = "{" + countList.join(",") + "}";
            }

            this.appendToPattern(repeatCount || ""); // Add the repetition quantifier to the pattern.
            return this;
        },

        /// Pattern Repetition and Alternatives ///

        // Matches the given pattern zero or more times.
        // Can also specify an exact number of repetitions if a second argument is provided.
        zeroOrMore: function (patternPart) {
            // Use the regex source property if available, otherwise sanitize the string.
            patternPart = patternPart && typeof patternPart.source === 'string' ? patternPart.source : this.cleanInput(patternPart);

            var inputArgs = arguments; // Capture arguments locally.

            if (inputArgs.length === 1) {
                this.appendToPattern("(?:" + patternPart + ")*"); // Match zero or more times.
            }
            if (inputArgs.length > 1) {
                this.appendToPattern("(?:" + patternPart + ")"); // Add the pattern part.
                this.appendToPattern("{" + inputArgs[1] + "}"); // Then add the exact repetition quantifier.
            }
            return this;
        },

        // Introduces an 'OR' condition into the pattern, allowing alternative matches.
        alternative: function (altPattern) {
            this._leadingParts += "(?:"; // Start an outer non-capturing group for the OR structure.
            this._trailingParts = ")" + this._trailingParts; // Close the outer group after suffixes.

            this.appendToPattern(")|(?:"); // Add the 'OR' separator for the alternative.
            if (altPattern) this.nextSegment(altPattern); // Add the alternative pattern if provided.

            return this;
        },

        // Initiates a capturing group in the regex pattern.
        startGroup: function () {
            // Temporarily add a closing parenthesis to suffixes to ensure subsequent compilation remains valid.
            this._trailingParts += ")";
            this.appendToPattern("(", false); // Add the opening parenthesis for the capturing group.

            return this;
        },

        // Concludes a capturing group.
        endGroup: function () {
            // Remove the last parenthesis from _trailingParts and add it directly to the main regex.
            this._trailingParts = this._trailingParts.substring(0, this._trailingParts.length - 1);
            this.appendToPattern(")", true); // Add the closing parenthesis for the capturing group.

            return this;
        },

        // Converts the currently constructed pattern into a standard RegExp object.
        // This is useful when the final RegExp object is needed directly.
        getRegexObject: function () {
            // Use toString() method of the RegExp instance to get the pattern and flags (e.g., "/pattern/flags").
            // Then, parse this string to extract the actual pattern and flags.
            var matchData = this.toString().match(/\/(.*)\/([a-z]+)?/);
            // Create and return a new RegExp object from the extracted components.
            return new RegExp(matchData[1], matchData[2]);
        }
    };

    // Factory function to create new PatternBuilder instances.
    function buildPatternInstance() {
        return new PatternConstructor();
    }

    // Support for various module systems (browser, Node.js, AMD).
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = buildPatternInstance; // Export for Node.js environments.
    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return PatternConstructor;
        }); // Export for Asynchronous Module Definition (AMD) loaders.
    } else {
        globalContext.PatBld = buildPatternInstance; // Expose as a global variable in browser environments.
    }

}).call();