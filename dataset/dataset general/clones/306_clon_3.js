/*
 * Regular Expression Construction Utility v1.0.0
 * https://github.com/VerbalExpressions/JSVerbalExpressions (Inspired by)
 *
 * This software is provided under the MIT License.
 * http://opensource.org/licenses/MIT
 *
 * Creation Date: 2024-05-20
 */

// Encapsulate the core logic within an immediately invoked function expression.
(function() {
    // Establish a reference to the global object, whether `window` in browsers or `global` in Node.js.
    const globalContext = this;

    /**
     * Constructs a new instance of the PatternBuilder.
     * @class
     * @returns {RegExp} A new RegExp object with PatternBuilder methods injected.
     */
    function PatternBuilder() {
        // Initialize an empty regular expression object.
        const regexObject = new RegExp();

        // Attach all defined prototype methods directly to the new RegExp instance.
        PatternBuilder.transferPrototypeMethods(regexObject);

        // Return the augmented RegExp object for method chaining.
        return regexObject;
    }

    /**
     * Statically transfers all methods from the PatternBuilder prototype to a target object.
     * This allows direct method invocation on the RegExp instance.
     * @param {RegExp} targetRegex - The RegExp object to be enhanced.
     * @returns {RegExp} The modified RegExp object.
     */
    PatternBuilder.transferPrototypeMethods = function(targetRegex) {
        // Iterate through all properties defined on the PatternBuilder's prototype.
        for (const prototypeKey in PatternBuilder.prototype) {
            // Ensure the property is an own property of the prototype, not inherited.
            if (Object.prototype.hasOwnProperty.call(PatternBuilder.prototype, prototypeKey)) {
                // Assign the prototype method to the target RegExp object.
                targetRegex[prototypeKey] = PatternBuilder.prototype[prototypeKey];
            }
        }
        return targetRegex;
    };

    /**
     * Defines the core methods available for building regular expressions.
     * These methods are added to the prototype of PatternBuilder.
     */
    PatternBuilder.prototype = {

        // Internal string components that form the final regular expression pattern.
        // `_startPattern`: Stores initial regex components like '^'.
        _startPattern: "",
        // `_corePattern`: Accumulates the main body of the regex.
        _corePattern: "",
        // `_endPattern`: Stores trailing regex components like '$' or closing capture groups.
        _endPattern: "",
        // `_flags`: Stores regex flags (e.g., 'g', 'm', 'i'). Defaults to global and multiline.
        _flags: "gm",

        /**
         * Cleans up input values to be safely included in a regular expression.
         * Special regex characters are escaped.
         * @param {*} inputVal - The value to sanitize.
         * @returns {string|number} The sanitized string or original number.
         */
        normalizeInput: function(inputVal) {
            // If the input is already a RegExp object, extract its source.
            if (inputVal && typeof inputVal.source === 'string') {
                return inputVal.source;
            }
            // Numbers do not need escaping.
            if (typeof inputVal === "number") {
                return inputVal;
            }
            // Handle null/undefined or non-string types by converting to string.
            const stringifiedVal = String(inputVal === null ? '' : inputVal);
            // Escape any character that is not a word character.
            // This ensures special regex characters are treated as literals.
            return stringifiedVal.replace(/[^a-zA-Z0-9_]/g, (char) => `\\${char}`);
        },

        /**
         * Appends a new segment to the main regular expression pattern and recompiles.
         * @param {string} segment - The regex segment to add.
         * @returns {PatternBuilder} The current PatternBuilder instance for chaining.
         */
        appendSegment: function(segment) {
            this._corePattern += segment || ""; // Ensure segment is a string, even if null/undefined.
            // Recompile the internal RegExp object with the updated pattern and flags.
            this.compile(this._startPattern + this._corePattern + this._endPattern, this._flags);
            return this;
        },

        /**
         * Sets or unsets the beginning-of-line anchor.
         * @param {boolean} [shouldEnable=true] - Whether to enable the '^' anchor.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        atStartOfLine: function(shouldEnable = true) {
            this._startPattern = shouldEnable ? "^" : "";
            this.appendSegment(""); // Trigger re-compilation.
            return this;
        },

        /**
         * Sets or unsets the end-of-line anchor.
         * @param {boolean} [shouldEnable=true] - Whether to enable the '$' anchor.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        atEndOfLine: function(shouldEnable = true) {
            this._endPattern = shouldEnable ? "$" : "";
            this.appendSegment(""); // Trigger re-compilation.
            return this;
        },

        /**
         * Adds a non-capturing group for a given value.
         * This method is a core building block for many other pattern methods.
         * @param {*} patternValue - The value or pattern to include.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        thenMatch: function(patternValue) {
            const cleanedValue = this.normalizeInput(patternValue);
            this.appendSegment(`(?:${cleanedValue})`);
            return this;
        },

        /**
         * Alias for `thenMatch`, providing a more natural start to a regex chain.
         * @param {*} patternValue - The value or pattern to find.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        findMatch: function(patternValue) {
            return this.thenMatch(patternValue);
        },

        /**
         * Makes the preceding pattern optional (zero or one occurrence).
         * @param {*} optionalValue - The value or pattern to make optional.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        maybeMatch: function(optionalValue) {
            const cleanedValue = this.normalizeInput(optionalValue);
            this.appendSegment(`(?:${cleanedValue})?`);
            return this;
        },

        /**
         * Matches any character (except newline) zero or more times.
         * Equivalent to `.*`.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        anyCharacterMultipleTimes: function() {
            this.appendSegment("(?:.*)");
            return this;
        },

        /**
         * Matches any character NOT in the provided set, zero or more times.
         * @param {*} forbiddenChars - Characters that should not be matched.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        anyCharacterExcept: function(forbiddenChars) {
            const cleanedChars = this.normalizeInput(forbiddenChars);
            this.appendSegment(`(?:[^${cleanedChars}]*)`);
            return this;
        },

        /**
         * Matches any character (except newline) one or more times.
         * Equivalent to `.+`.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        someCharacterMultipleTimes: function() {
            this.appendSegment("(?:.+)");
            return this;
        },

        /**
         * Matches any character NOT in the provided set, one or more times.
         * @param {*} forbiddenChars - Characters that should not be matched.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        someCharacterExcept: function(forbiddenChars) {
            const cleanedChars = this.normalizeInput(forbiddenChars);
            this.appendSegment(`(?:[^${cleanedChars}]+)`);
            return this;
        },

        /**
         * Performs a string replacement using the constructed regular expression.
         * @param {string} inputString - The string to perform replacement on.
         * @param {string} replacementValue - The value to substitute for matches.
         * @returns {string} The string after replacement.
         */
        doReplace: function(inputString, replacementValue) {
            // Ensure the input string is converted to a string type.
            const targetString = String(inputString);
            return targetString.replace(this, replacementValue);
        },

        // --- Special Character Patterns ---

        /**
         * Matches common line break sequences (CRLF, CR, LF).
         * @returns {PatternBuilder} The current instance for chaining.
         */
        matchLineBreak: function() {
            this.appendSegment("(?:\\r\\n|\\r|\\n)");
            return this;
        },

        /**
         * Shorthand for `matchLineBreak`.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        matchBreak: function() {
            return this.matchLineBreak();
        },

        /**
         * Matches a tab character.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        matchTab: function() {
            this.appendSegment("\\t");
            return this;
        },

        /**
         * Matches one or more word characters (alphanumeric + underscore).
         * @returns {PatternBuilder} The current instance for chaining.
         */
        matchWord: function() {
            this.appendSegment("\\w+");
            return this;
        },

        /**
         * Matches any single character from a specified set.
         * @param {*} characterSet - The set of characters to match.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        matchAnyOf: function(characterSet) {
            const cleanedSet = this.normalizeInput(characterSet);
            this.appendSegment(`[${cleanedSet}]`);
            return this;
        },

        /**
         * Alias for `matchAnyOf`.
         * @param {*} characterSet - The set of characters to match.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        matchAnyChar: function(characterSet) {
            return this.matchAnyOf(characterSet);
        },

        /**
         * Matches characters within specified ranges.
         * Accepts arguments in pairs: (from, to, from, to, ...)
         * @param {...(string|number)} ranges - Pairs of start and end characters/numbers for ranges.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        matchRange: function(...ranges) {
            let rangeString = "[";
            // Ensure ranges array has an even number of elements for pairs.
            if (ranges.length % 2 !== 0) {
                console.warn("PatternBuilder.matchRange expects an even number of arguments (from, to pairs). Ignoring last argument.");
                ranges.pop();
            }

            for (let i = 0; i < ranges.length; i += 2) {
                const startChar = this.normalizeInput(ranges[i]);
                const endChar = this.normalizeInput(ranges[i + 1]);
                rangeString += `${startChar}-${endChar}`;
            }
            rangeString += "]";
            this.appendSegment(rangeString);
            return this;
        },

        // --- Modifier Management ---

        /**
         * Adds a regular expression flag if it's not already present.
         * @param {string} flagChar - The flag character to add (e.g., 'i', 'g', 'm').
         * @returns {PatternBuilder} The current instance for chaining.
         */
        applyFlag: function(flagChar) {
            if (!this._flags.includes(flagChar)) {
                this._flags += flagChar;
                this.appendSegment(""); // Trigger re-compilation.
            }
            return this;
        },

        /**
         * Removes a regular expression flag if it's present.
         * @param {string} flagChar - The flag character to remove.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        removeFlag: function(flagChar) {
            if (this._flags.includes(flagChar)) {
                this._flags = this._flags.replace(flagChar, "");
                this.appendSegment(""); // Trigger re-compilation.
            }
            return this;
        },

        /**
         * Toggles case-insensitivity ('i' flag).
         * @param {boolean} [enableCaseInsensitivity=true] - Whether to enable or disable.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        ignoreCase: function(enableCaseInsensitivity = true) {
            if (enableCaseInsensitivity) {
                this.applyFlag("i");
            } else {
                this.removeFlag("i");
            }
            return this;
        },

        /**
         * Toggles global matching ('g' flag). Default behavior is global.
         * @param {boolean} [matchOnce=true] - If true, disables global matching (matches only first occurrence).
         * @returns {PatternBuilder} The current instance for chaining.
         */
        matchOnlyFirst: function(matchOnce = true) {
            if (matchOnce) {
                this.removeFlag("g"); // Stop global matching
            } else {
                this.applyFlag("g"); // Re-enable global matching
            }
            return this;
        },

        /**
         * Toggles multiline matching ('m' flag). Default behavior is multiline.
         * @param {boolean} [singleLineMode=true] - If true, disables multiline matching.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        singleLineSearch: function(singleLineMode = true) {
            if (singleLineMode) {
                this.removeFlag("m"); // Disable multiline
            } else {
                this.applyFlag("m"); // Re-enable multiline
            }
            return this;
        },

        /**
         * Repeats the previous pattern a specific number of times.
         * Can specify exact repetitions or a range.
         * @param {number} count1 - The exact number of repetitions, or the minimum in a range.
         * @param {number} [count2] - The maximum number of repetitions for a range.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        repeatLast: function(count1, count2) {
            let quantifier = "";

            if (typeof count1 === 'number' && Number.isInteger(count1)) {
                if (typeof count2 === 'number' && Number.isInteger(count2)) {
                    // Range: {min,max}
                    quantifier = `{${count1},${count2}}`;
                } else {
                    // Exact: {n}
                    quantifier = `{${count1}}`;
                }
            } else {
                console.warn("PatternBuilder.repeatLast expects integer arguments. No quantifier applied.");
            }

            if (quantifier) {
                this.appendSegment(quantifier);
            }
            return this;
        },

        // --- Looping and Alternatives ---

        /**
         * Matches a given pattern zero or more times.
         * Optionally, can specify an exact number of repetitions.
         * @param {*} pattern - The pattern to repeat.
         * @param {number} [exactCount] - If provided, repeats the pattern exactly this many times.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        matchMultiple: function(pattern, exactCount) {
            const cleanedPattern = this.normalizeInput(pattern);

            if (typeof exactCount === 'number' && Number.isInteger(exactCount) && exactCount >= 0) {
                // If an exact count is given, append the pattern then the quantifier.
                this.appendSegment(`(?:${cleanedPattern}){${exactCount}}`);
            } else {
                // Otherwise, append the pattern with zero or more quantifier.
                this.appendSegment(`(?:${cleanedPattern})*`);
            }
            return this;
        },

        /**
         * Adds an 'OR' condition to the regular expression.
         * Any patterns added after this will be part of the alternative.
         * @param {*} [alternativeValue] - An optional pattern to immediately add as an alternative.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        orMatch: function(alternativeValue) {
            // Wrap the current accumulated pattern in a non-capturing group for the OR.
            this._startPattern += "(?:";
            // The closing parenthesis for this group will be added to _endPattern.
            this._endPattern = ")" + this._endPattern;

            // Add the 'OR' separator.
            this.appendSegment(")|(?:");
            // If an alternative value is provided, add it directly.
            if (alternativeValue) {
                this.thenMatch(alternativeValue);
            }

            return this;
        },

        /**
         * Starts a capturing group.
         * The content added after this will be captured.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        initCapture: function() {
            // Append a closing parenthesis to the end pattern to balance the capture.
            this._endPattern += ")";
            // Add the opening parenthesis for the capturing group to the core pattern.
            this.appendSegment("(");
            return this;
        },

        /**
         * Ends the most recently opened capturing group.
         * @returns {PatternBuilder} The current instance for chaining.
         */
        terminateCapture: function() {
            // Remove the last closing parenthesis from the _endPattern.
            if (this._endPattern.length > 0 && this._endPattern.endsWith(')')) {
                this._endPattern = this._endPattern.substring(0, this._endPattern.length - 1);
            } else {
                console.warn("Attempted to close a capture group, but no open capture group was found in _endPattern.");
            }
            // Add the closing parenthesis to the core pattern.
            this.appendSegment(")");
            return this;
        },

        /**
         * Converts the internal pattern and flags into a native RegExp object.
         * This is useful if the PatternBuilder object itself is not directly used as a RegExp.
         * @returns {RegExp} A new RegExp object.
         */
        toNativeRegExp: function() {
            // The PatternBuilder object itself is a RegExp, so we can use its own toString().
            // Example: /pattern/flags
            const regexStringRepresentation = this.toString();
            const parts = regexStringRepresentation.match(/^\/(.*)\/([a-z]*)$/);

            if (parts && parts.length === 3) {
                return new RegExp(parts[1], parts[2]);
            } else {
                // Fallback in case toString() format is unexpected (shouldn't happen for RegExp).
                return new RegExp(this._startPattern + this._corePattern + this._endPattern, this._flags);
            }
        }
    };

    /**
     * Factory function to create new PatternBuilder instances.
     * @returns {PatternBuilder} A new PatternBuilder object.
     */
    function createPatternBuilderInstance() {
        return new PatternBuilder();
    }

    // Support various module systems (Node.js, AMD, Browser global).
    if (typeof module !== 'undefined' && module.exports) {
        // CommonJS / Node.js
        module.exports = createPatternBuilderInstance;
    } else if (typeof define === 'function' && define.amd) {
        // Asynchronous Module Definition / RequireJS
        define(() => PatternBuilder); // Export the constructor directly for AMD.
    } else {
        // Browser global exposure
        globalContext.RegExFactory = createPatternBuilderInstance;
    }

}).call(this);