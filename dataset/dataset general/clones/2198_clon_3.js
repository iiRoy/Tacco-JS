var PatternEngine;

/*
 * PatternEngine 1.5.0
 * (c) 2007-2010 S. Levithan (original author)
 * This code is provided under the MIT License.
 * For more information, visit <http://xregexp.com> (original source)
 *
 * This utility provides an advanced, extensible, and cross-platform regular expression
 * implementation, supporting extended syntax, custom flags, and enhanced methods.
 */

/*
 * Initial check to prevent multiple loads of the library.
 * If PatternEngine is already defined, it indicates a re-load attempt.
 */
if (PatternEngine) {
    throw new Error("PatternEngine: Attempted to load the library more than once in the same execution context. This is not allowed.");
}

/*
 * All core logic is encapsulated within this anonymous function scope
 * to protect internal variables and prevent global namespace pollution.
 */
(function () {

    /*
     * =====================================================================
     *  Core Constructor Definition
     * =====================================================================
     */

    /**
     * Constructs a new extended `RegExp` object.
     * This differs from standard `RegExp` by supporting additional syntax,
     * custom flags, and addressing cross-browser inconsistencies.
     *
     * @param {string|RegExp} sourceString - The regular expression pattern string or an existing RegExp object.
     * @param {string} [modifiers] - Optional flags for the regular expression (e.g., 'g', 'i', 'm').
     * @returns {RegExp} A new, augmented RegExp instance.
     * @throws {TypeError} If flags are provided when cloning an existing RegExp.
     * @throws {Error} If called recursively from within a token definition.
     */
    PatternEngine = function (sourceString, modifiers) {
        var resultSegments = [];
        var currentScopeState = PatternEngine.GLOBAL_CONTEXT;
        var currentIndex = 0;
        var parsingContext;
        var elementMatchOutcome;
        var regexMatch;
        var characterUnit;
        var finalExpression;

        /*
         * Handle cloning of an existing RegExp object.
         * If the input is already a RegExp, we create a copy.
         */
        if (PatternEngine.isPatternObject(sourceString)) {
            if (modifiers !== undefined) {
                throw new TypeError("PatternEngine: Cannot supply explicit modifiers when initializing from an existing RegExp object.");
            }
            return duplicatePattern(sourceString);
        }

        /*
         * Guard against recursive calls during token processing, which can lead to infinite loops.
         */
        if (isEngineInitializing) {
            throw new Error("PatternEngine: Recursive constructor call detected within token definition functions. This is forbidden.");
        }

        // Ensure modifiers are a string, default to empty if not provided.
        modifiers = (modifiers === undefined || modifiers === null) ? String() : String(modifiers);

        /*
         * Parsing context for custom token handlers.
         * Stores state relevant to named capture groups and modifier management.
         */
        parsingContext = {
            includesNamedGroups: false,
            groupNamesCollection: [],
            /** Checks if a specific modifier is present. */
            checkModifierPresence: function (modChar) {
                return modifiers.indexOf(modChar) > -1;
            },
            /** Adds a new modifier to the current set. */
            addModifier: function (modChar) {
                modifiers += modChar;
            }
        };

        /*
         * Main loop to process the pattern string character by character or by token.
         */
        while (currentIndex < sourceString.length) {
            var segmentProcessed = false;

            // Attempt to match and process custom tokens at the current position.
            elementMatchOutcome = evaluateRegisteredComponents(sourceString, currentIndex, currentScopeState, parsingContext);

            if (elementMatchOutcome) {
                resultSegments[resultSegments.length] = elementMatchOutcome.output;
                currentIndex += (elementMatchOutcome.regexMatch[0].length || 1);
                segmentProcessed = true;
            } else {
                // If no custom token matched, check for native multi-character metasequences.
                // Excludes character classes from this check.
                regexMatch = nativeMethods.exec.call(builtInElementMatchers[currentScopeState], sourceString.slice(currentIndex));

                if (regexMatch) {
                    resultSegments[resultSegments.length] = regexMatch[0];
                    currentIndex += regexMatch[0].length;
                    segmentProcessed = true;
                } else {
                    // If neither custom nor native multi-char tokens match, process a single character.
                    characterUnit = sourceString.charAt(currentIndex);

                    if (characterUnit === "[") {
                        currentScopeState = PatternEngine.CHAR_CLASS_CONTEXT;
                    } else if (characterUnit === "]") {
                        currentScopeState = PatternEngine.GLOBAL_CONTEXT;
                    }

                    resultSegments[resultSegments.length] = characterUnit;
                    currentIndex++;
                    segmentProcessed = true;
                }
            }

            // Simple validation: ensure progress is made to prevent infinite loops on malformed tokens
            if (!segmentProcessed && currentIndex < sourceString.length) {
                 // This case should ideally not be reached if all paths correctly advance currentIndex.
                 // As a fallback, force advancement if no token or char was processed.
                 resultSegments[resultSegments.length] = sourceString.charAt(currentIndex);
                 currentIndex++;
            }
        }

        /*
         * Construct the final RegExp object using the processed segments and cleaned modifiers.
         * The `modifierCleanerPattern` removes non-standard and duplicate flags.
         */
        finalExpression = RegExp(resultSegments.join(String()), nativeMethods.replace.call(modifiers, modifierCleanerPattern, String()));
        finalExpression._ptnEng = {
            source: sourceString,
            groupNamesCollection: parsingContext.includesNamedGroups ? parsingContext.groupNamesCollection : null
        };
        return finalExpression;
    };


    /*
     * =====================================================================
     *  Public Static Properties for PatternEngine
     * =====================================================================
     */

    PatternEngine.version = "1.5.0"; // Current library version.

    // Bitflags to represent parsing context within a regex pattern.
    PatternEngine.CHAR_CLASS_CONTEXT = 1; // Inside a character class (e.g., `[a-z]`).
    PatternEngine.GLOBAL_CONTEXT = 2; // Outside a character class.


    /*
     * =====================================================================
     *  Private Internal Variables
     * =====================================================================
     */

    var substDirectivePattern = /\$(?:(\d\d?|[$&`'])|{([$\w]+)})/g; // Pattern for replacement string directives.
    var modifierCleanerPattern = /[^gimy]+|([\s\S])(?=[\s\S]*\1)/g; // Regex to remove non-standard and duplicate RegExp flags.
    var qtySpecifierPattern = /^(?:[?*+]|{\d+(?:,\d*)?})\??/; // Matches common quantifier syntax.
    var isEngineInitializing = false; // Flag to prevent re-entrant calls to the constructor.
    var registeredComponents = []; // Array to store custom token definitions.

    /*
     * References to original native `RegExp.prototype` and `String.prototype` methods.
     * This allows us to call the original methods even after they've been overridden.
     */
    var nativeMethods = {
        exec: RegExp.prototype.exec,
        test: RegExp.prototype.test,
        match: String.prototype.match,
        replace: String.prototype.replace,
        split: String.prototype.split
    };

    /*
     * Feature detection for JavaScript engine compliance.
     * These help identify and work around browser-specific regex bugs.
     */
    var execHandlesNonParticipatingGroups = (function () {
        // Checks if `exec` returns `undefined` for non-participating capturing groups.
        return nativeMethods.exec.call(/()??/, String())[1] === undefined;
    })();

    var execAdvancesLastIndexForZeroLength = (function () {
        // Checks if `lastIndex` is correctly not advanced after zero-length matches.
        var tempReg = /^/g;
        nativeMethods.test.call(tempReg, String());
        return !tempReg.lastIndex;
    })();

    var replaceResetsLastIndex = (function () {
        // Checks if `lastIndex` is correctly reset after `String.prototype.replace` with a global regex.
        var tempReg = /x/g;
        nativeMethods.replace.call("x", tempReg, String());
        return !tempReg.lastIndex;
    })();

    var supportsStickyFlag = RegExp.prototype.sticky !== undefined; // Detects native 'y' (sticky) flag support.

    /*
     * Stores native multicharacter metasequence patterns
     * for different parsing contexts (inside/outside character classes).
     */
    var builtInElementMatchers = Object.create(null);
    builtInElementMatchers[PatternEngine.CHAR_CLASS_CONTEXT] = /^(?:\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S]))/;
    builtInElementMatchers[PatternEngine.GLOBAL_CONTEXT] = /^(?:\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??)/;


    /*
     * =====================================================================
     *  Public Static Methods
     * =====================================================================
     */

    /**
     * Registers a new custom token handler for PatternEngine syntax.
     * This method is for advanced users creating plugins.
     *
     * @param {RegExp} tokenPattern - The regex pattern to match the custom token.
     * @param {Function} tokenHandler - A function that processes the token match.
     * @param {number} [contextScope] - The scope (e.g., GLOBAL_CONTEXT) where the token is active.
     * @param {string} [triggerChar] - An optional single character that must immediately precede the token match.
     */
    PatternEngine.registerComponent = function (tokenPattern, tokenHandler, contextScope, triggerChar) {
        registeredComponents.push({
            pattern: duplicatePattern(tokenPattern, "g" + (supportsStickyFlag ? "y" : String())),
            handler: tokenHandler,
            scope: contextScope || PatternEngine.GLOBAL_CONTEXT,
            trigger: triggerChar || null
        });
    };

    /**
     * Retrieves a cached RegExp object or creates a new one if not found.
     * Useful for performance when repeatedly using the same pattern/flags.
     *
     * @param {string} sourceString - The regex pattern string.
     * @param {string} [modifiers] - Flags for the regex.
     * @returns {RegExp} The cached or newly created RegExp object.
     */
    PatternEngine.getOrCache = function (sourceString, modifiers) {
        var cacheKey = String(sourceString) + "/" + (modifiers || String());
        return PatternEngine.getOrCache[cacheKey] || (PatternEngine.getOrCache[cacheKey] = PatternEngine(sourceString, modifiers));
    };

    /**
     * Creates a global-flagged copy of a RegExp object.
     * The copy has its `lastIndex` reset.
     *
     * @param {RegExp} inputPattern - The RegExp object to copy.
     * @returns {RegExp} A new RegExp object with the 'g' flag set.
     */
    PatternEngine.createGlobalCopy = function (inputPattern) {
        return duplicatePattern(inputPattern, "g");
    };

    /**
     * Escapes special regex characters in a string, making it safe to use as a literal in a pattern.
     *
     * @param {string} literalString - The string to escape.
     * @returns {string} The escaped string.
     */
    PatternEngine.sanitizeLiteral = function (literalString) {
        // Escapes characters: `[ ] { } ( ) * + ? - . , \ ^ $ | #` and whitespace.
        return String(literalString).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    /**
     * Executes a regex search at a specific position within a string.
     * Ignores the regex's `lastIndex` property.
     *
     * @param {string} textToSearch - The string to search within.
     * @param {RegExp} searchPattern - The regex to use for searching.
     * @param {number} [startPosition=0] - The index to start the search from.
     * @param {boolean} [isAnchored=false] - If true, match must start exactly at `startPosition`.
     * @returns {RegExpMatchArray|null} The match result, or null if no match.
     */
    PatternEngine.executeAtPosition = function (textToSearch, searchPattern, startPosition, isAnchored) {
        var patternClone = duplicatePattern(searchPattern, "g" + ((isAnchored && supportsStickyFlag) ? "y" : String()));
        patternClone.lastIndex = Number(startPosition) || 0; // Ensure startPosition is a number.
        var currentMatch = patternClone.exec(textToSearch);

        if (isAnchored) {
            return (currentMatch && currentMatch.index === patternClone.lastIndex) ? currentMatch : null;
        } else {
            return currentMatch;
        }
    };

    /**
     * Prevents further registration of custom tokens.
     * Should be called after all desired plugins are loaded.
     */
    PatternEngine.lockComponents = function () {
        PatternEngine.registerComponent = function () {
            throw new Error("PatternEngine: Cannot register new components after 'lockComponents' has been invoked.");
        };
    };

    /**
     * Determines if a given value is a RegExp object.
     * Works correctly across different JavaScript frames.
     *
     * @param {*} potentialPattern - The value to check.
     * @returns {boolean} True if the value is a RegExp object, false otherwise.
     */
    PatternEngine.isPatternObject = function (potentialPattern) {
        return Object.prototype.toString.call(potentialPattern) === "[object RegExp]";
    };

    /**
     * Iterates over all matches of a regex within a string, calling a callback for each.
     * Provides a cleaner alternative to `while(exec())` loops.
     *
     * @param {string} textToScan - The string to search.
     * @param {RegExp} originalPattern - The regex to use (will be cloned as global).
     * @param {Function} matchCallback - Function to call for each match: `function(match, index, string, regex)`.
     * @param {*} [callbackContext] - The `this` context for the callback.
     */
    PatternEngine.walkMatches = function (textToScan, originalPattern, matchCallback, callbackContext) {
        var globalPattern = duplicatePattern(originalPattern, "g");
        var matchIndex = -1;
        var currentMatch;

        while ((currentMatch = globalPattern.exec(textToScan)) !== null) {
            matchCallback.call(callbackContext, currentMatch, ++matchIndex, textToScan, globalPattern);
            // Prevent infinite loops on zero-length matches when lastIndex doesn't advance.
            if (globalPattern.lastIndex === currentMatch.index) {
                globalPattern.lastIndex++;
            }
        }
        // If the original pattern was global, reset its lastIndex.
        if (originalPattern.global) {
            originalPattern.lastIndex = 0;
        }
    };

    /**
     * Processes a string through a chain of regular expressions,
     * allowing extraction and transformation of data.
     *
     * @param {string} initialString - The starting string.
     * @param {Array<RegExp|Object>} regexChain - An array of regexes or objects with `regex` and `backref` properties.
     * @returns {Array<string>} An array of results from the final step of the chain.
     */
    PatternEngine.processChain = function (initialString, regexChain) {
        /*
         * Inner recursive function to handle the chaining logic.
         * @param {Array<string>} currentValues - The strings to process at the current level.
         * @param {number} currentLevel - The current index in the regexChain.
         */
        function recurseChain (currentValues, currentLevel) {
            var chainItem = regexChain[currentLevel];
            var processingRule = (typeof chainItem === 'object' && chainItem !== null && chainItem.regex) ? chainItem : {regex: chainItem};
            var currentRegex = duplicatePattern(processingRule.regex, "g");
            var levelMatches = [];
            var valueIdx;

            for (valueIdx = 0; valueIdx < currentValues.length; valueIdx++) {
                PatternEngine.walkMatches(currentValues[valueIdx], currentRegex, function (matchResult) {
                    var extractedRef = processingRule.backref ? (matchResult[processingRule.backref] || String()) : matchResult[0];
                    levelMatches.push(extractedRef);
                });
            }

            // If this is the last level or no matches were found, return the results.
            // Otherwise, recurse with the new set of matches.
            if ((currentLevel === regexChain.length - 1) || (levelMatches.length === 0)) {
                return levelMatches;
            } else {
                return recurseChain(levelMatches, currentLevel + 1);
            }
        }
        return recurseChain([initialString], 0); // Start the chain with the initial string in an array.
    };


    /*
     * =====================================================================
     *  New Methods Added to RegExp.prototype
     * =====================================================================
     */

    /**
     * Calls `RegExp.prototype.exec` with the first argument from an array.
     * Mimics `Function.prototype.apply` signature.
     *
     * @param {*} _context - Ignored, for API compatibility.
     * @param {Array<string>} argsArray - An array where the first element is the string to search.
     * @returns {RegExpMatchArray|null} The match result.
     */
    RegExp.prototype.apply = function (_context, argsArray) {
        return this.exec(argsArray[0]);
    };

    /**
     * Calls `RegExp.prototype.exec` with a provided string.
     * Mimics `Function.prototype.call` signature.
     *
     * @param {*} _context - Ignored, for API compatibility.
     * @param {string} searchString - The string to search.
     * @returns {RegExpMatchArray|null} The match result.
     */
    RegExp.prototype.call = function (_context, searchString) {
        return this.exec(searchString);
    };


    /*
     * =====================================================================
     *  Overridden Native Methods for Enhanced Functionality
     * =====================================================================
     */

    /**
     * Overrides the native `RegExp.prototype.exec` to add:
     * - Named capture group support (results accessible via `match.groupName`).
     * - Fixes for cross-browser issues (e.g., `undefined` for non-participating groups, `lastIndex` for zero-length matches).
     *
     * @param {string} inputString - The string to search.
     * @returns {RegExpMatchArray|null} The match result, augmented with named captures.
     */
    RegExp.prototype.exec = function (inputString) {
        // Ensure inputString is a string. Null or undefined become empty string.
        var processedString = (inputString === null || inputString === undefined) ? String() : String(inputString);
        var baseMatch = nativeMethods.exec.apply(this, [processedString]);
        var groupName;
        var tempRegexForFix;

        if (baseMatch) {
            // Fix for browsers that return empty string instead of `undefined` for non-participating groups.
            if (!execHandlesNonParticipatingGroups && baseMatch.length > 1) {
                // If an empty string is found in the capture array, it might be a non-participating group.
                var emptyCaptureFound = false;
                for (var k = 1; k < baseMatch.length; k++) {
                    if (baseMatch[k] === String()) {
                        emptyCaptureFound = true;
                        break;
                    }
                }

                if (emptyCaptureFound) {
                    tempRegexForFix = RegExp(this.source, nativeMethods.replace.call(extractNativeModifiers(this), "g", String()));
                    // Use `replace` to re-evaluate captures, which often behaves more consistently.
                    nativeMethods.replace.call(processedString.slice(baseMatch.index), tempRegexForFix, function () {
                        for (var i = 1; i < arguments.length - 2; i++) {
                            if (arguments[i] === undefined) {
                                baseMatch[i] = undefined;
                            }
                        }
                    });
                }
            }

            // Attach named capture properties if available.
            if (this._ptnEng && this._ptnEng.groupNamesCollection) {
                for (var j = 1; j < baseMatch.length; j++) {
                    groupName = this._ptnEng.groupNamesCollection[j - 1];
                    if (groupName) {
                        baseMatch[groupName] = baseMatch[j];
                    }
                }
            }

            // Fix for browsers that incorrectly increment `lastIndex` after zero-length matches.
            if (!execAdvancesLastIndexForZeroLength && this.global && baseMatch[0].length === 0 && (this.lastIndex > baseMatch.index)) {
                this.lastIndex--;
            }
        }
        return baseMatch;
    };

    /*
     * Only override `RegExp.prototype.test` if `lastIndex` increment behavior is buggy.
     * If the native method is already compliant, no need to override.
     */
    if (!execAdvancesLastIndexForZeroLength) {
        /**
         * Overrides `RegExp.prototype.test` to fix a browser bug regarding `lastIndex`
         * advancement after zero-length matches.
         *
         * @param {string} inputString - The string to test against.
         * @returns {boolean} True if a match is found, false otherwise.
         */
        RegExp.prototype.test = function (inputString) {
            // Call the (potentially overridden) `exec` method.
            var testMatch = this.exec(inputString);
            // Apply the `lastIndex` fix if a global regex and zero-length match occurred.
            if (testMatch && this.global && testMatch[0].length === 0 && (this.lastIndex > testMatch.index)) {
                this.lastIndex--;
            }
            return !!testMatch; // Return boolean result.
        };
    }

    /**
     * Overrides `String.prototype.match` to ensure it uses the augmented `exec` method
     * for non-global regexes and handles `lastIndex` reset for global ones.
     *
     * @param {string|RegExp} regexOrString - The regex or string to match.
     * @returns {RegExpMatchArray|Array<string>|null} The match results.
     */
    String.prototype.match = function (regexOrString) {
        var patternObj = PatternEngine.isPatternObject(regexOrString) ? regexOrString : RegExp(regexOrString); // Ensure it's a RegExp object.

        if (patternObj.global) {
            var matchResult = nativeMethods.match.apply(this, arguments);
            patternObj.lastIndex = 0; // Fix for IE bug where lastIndex isn't reset.
            return matchResult;
        }
        // For non-global regexes, call the augmented `exec` method.
        return patternObj.exec(this);
    };

    /**
     * Overrides `String.prototype.replace` to add:
     * - Support for `${name}` and `${n}` tokens in replacement strings.
     * - Named backreferences passed to replacement functions as `arguments[0].name`.
     * - Fixes cross-browser inconsistencies in replacement string syntax.
     *
     * @param {string|RegExp} searchFor - The pattern to search for.
     * @param {string|Function} replacementValue - The string or function to use for replacement.
     * @returns {string} The string with replacements made.
     */
    String.prototype.replace = function (searchFor, replacementValue) {
        var isSearchRegex = PatternEngine.isPatternObject(searchFor);
        var capturedGroupNames;
        var finalResult;
        var selfString = String(this); // Ensure 'this' is treated as a string.

        /*
         * Early exit if it's a simple case that native `replace` can handle without issues.
         * This avoids overhead of custom processing.
         */
        if (isSearchRegex && typeof replacementValue === "string" && replacementValue.indexOf("${") === -1 && replaceResetsLastIndex) {
            return nativeMethods.replace.apply(selfString, arguments);
        }

        if (!isSearchRegex) {
            searchFor = String(searchFor); // Ensure search pattern is a string if not a regex.
        } else if (searchFor._ptnEng) {
            capturedGroupNames = searchFor._ptnEng.groupNamesCollection; // Get named capture info.
        }

        if (typeof replacementValue === "function") {
            finalResult = nativeMethods.replace.call(selfString, searchFor, function () {
                var currentArgs = arguments; // Capture arguments for closure.
                if (capturedGroupNames) {
                    // Convert the first argument (the match string) to a String object
                    // to attach named properties.
                    currentArgs[0] = new String(currentArgs[0]);
                    for (var i = 0; i < capturedGroupNames.length; i++) {
                        if (capturedGroupNames[i]) {
                            currentArgs[0][capturedGroupNames[i]] = currentArgs[i + 1];
                        }
                    }
                }
                // Update `lastIndex` for global regexes before calling the replacement function.
                if (isSearchRegex && searchFor.global) {
                    searchFor.lastIndex = currentArgs[currentArgs.length - 2] + currentArgs[0].length;
                }
                return replacementValue.apply(null, currentArgs); // Call the user's replacement function.
            });
        } else {
            // Process string replacement value for custom directives.
            finalResult = nativeMethods.replace.call(selfString, searchFor, function () {
                var argsFromMatch = arguments; // Arguments from the `replace` callback for this specific match.
                var lastIndexOffset = argsFromMatch.length - 1; // Helper for arguments array access.

                return nativeMethods.replace.call(String(replacementValue), substDirectivePattern, function (fullMatch, numberedRef, namedRef) {
                    // Handle standard numbered backreferences ($1, $&, $`, $', etc.)
                    if (numberedRef) {
                        switch (numberedRef) {
                            case "$": return "$"; // Literal dollar sign.
                            case "&": return argsFromMatch[0]; // Entire match.
                            case "`": return argsFromMatch[lastIndexOffset - 1].slice(0, argsFromMatch[lastIndexOffset - 2]); // Pre-match string.
                            case "'": return argsFromMatch[lastIndexOffset - 1].slice(argsFromMatch[lastIndexOffset - 2] + argsFromMatch[0].length); // Post-match string.
                            default:
                                var numericRefVal = parseInt(numberedRef, 10);
                                var trailingDigits = String();

                                // Handle ambiguous backreferences like "$10" (is it group 10 or group 1 followed by '0'?)
                                while (numericRefVal > argsFromMatch.length - 3) {
                                    trailingDigits = String(numericRefVal).slice(-1) + trailingDigits;
                                    numericRefVal = Math.floor(numericRefVal / 10);
                                }
                                return (numericRefVal ? argsFromMatch[numericRefVal] || String() : "$") + trailingDigits;
                        }
                    // Handle named backreferences (${name}) or delimited numbered backreferences (${n}).
                    } else if (namedRef) {
                        var numericNamedRef = parseInt(namedRef, 10);
                        if (!isNaN(numericNamedRef) && numericNamedRef <= argsFromMatch.length - 3) {
                            // If it's a valid numeric capture group reference (e.g., ${1}, ${0} for full match).
                            return argsFromMatch[numericNamedRef];
                        }

                        // Otherwise, try to find a named capture group.
                        if (capturedGroupNames) {
                            var namedIndex = locateItemIndex(capturedGroupNames, namedRef);
                            if (namedIndex > -1) {
                                return argsFromMatch[namedIndex + 1];
                            }
                        }
                        return fullMatch; // If not found, return the original directive (e.g., "${nonexistent}").
                    }
                    return fullMatch; // Fallback, should not be reached with `substDirectivePattern`.
                });
            });
        }

        // Reset `lastIndex` for global regexes after replacement, fixing another IE bug.
        if (isSearchRegex && searchFor.global) {
            searchFor.lastIndex = 0;
        }

        return finalResult;
    };

    /**
     * Overrides `String.prototype.split` to provide a consistent, ES3-compliant implementation
     * that works correctly with RegExp objects, including those with custom flags and behaviors.
     *
     * @param {string|RegExp} separator - The pattern or string to split by.
     * @param {number} [limitValue] - Optional limit on the number of splits.
     * @returns {Array<string>} An array of strings resulting from the split.
     */
    String.prototype.split = function (separator, limitValue) {
        // If the separator is not a RegExp, use the native `split` for efficiency.
        if (!PatternEngine.isPatternObject(separator)) {
            return nativeMethods.split.apply(this, arguments);
        }

        var sourceString = String(this); // Ensure 'this' is a string.
        var splitResults = [];
        var lastProcessedIndex = 0;
        var currentMatch;
        var lastMatchLength;

        // Determine the effective limit for the split operation.
        var effectiveLimit;
        if (limitValue === undefined || !isFinite(Number(limitValue)) || Number(limitValue) < 0) {
            effectiveLimit = Infinity;
        } else {
            effectiveLimit = Math.floor(Number(limitValue));
            if (effectiveLimit === 0) {
                return []; // If limit is 0, return an empty array.
            }
        }

        // Clone the separator regex and ensure it's global for proper iteration.
        var globalSeparator = PatternEngine.createGlobalCopy(separator);

        /*
         * Main loop to find all matches and perform splits.
         * Uses the augmented `exec` for correct `lastIndex` handling.
         */
        while ((currentMatch = globalSeparator.exec(sourceString)) !== null) {
            // Check if the match actually advanced the position, to avoid infinite loops on zero-length matches.
            if (globalSeparator.lastIndex > lastProcessedIndex) {
                splitResults.push(sourceString.slice(lastProcessedIndex, currentMatch.index));

                // If the regex has capturing groups and the match is not at the end of the string,
                // include captured groups in the result array.
                if (currentMatch.length > 1 && currentMatch.index < sourceString.length) {
                    Array.prototype.push.apply(splitResults, currentMatch.slice(1));
                }

                lastMatchLength = currentMatch[0].length;
                lastProcessedIndex = globalSeparator.lastIndex;

                // Stop if the limit has been reached.
                if (splitResults.length >= effectiveLimit) {
                    break;
                }
            }

            // If a zero-length match occurred and `lastIndex` didn't advance, manually advance it
            // to prevent an infinite loop.
            if (globalSeparator.lastIndex === currentMatch.index) {
                globalSeparator.lastIndex++;
            }
        }

        // Add the remaining part of the string after the last match.
        if (lastProcessedIndex === sourceString.length) {
            // Special case: if the regex matches an empty string at the very end,
            // and the last match was not zero-length, add an empty string.
            if (!nativeMethods.test.call(globalSeparator, String()) || lastMatchLength) {
                splitResults.push(String());
            }
        } else {
            splitResults.push(sourceString.slice(lastProcessedIndex));
        }

        // Trim the result array if it exceeds the effective limit.
        return splitResults.length > effectiveLimit ? splitResults.slice(0, effectiveLimit) : splitResults;
    };


    /*
     * =====================================================================
     *  Private Helper Functions
     * =====================================================================
     */

    /**
     * Creates a copy of a RegExp instance, preserving its custom properties (`_ptnEng`)
     * and allowing additional flags to be applied. Resets `lastIndex` to zero.
     *
     * @param {RegExp} sourceRegex - The RegExp object to duplicate.
     * @param {string} [extraModifiers] - Additional flags to add to the new regex.
     * @returns {RegExp} A new RegExp object.
     * @throws {TypeError} If the input is not a RegExp object.
     */
    function duplicatePattern (sourceRegex, extraModifiers) {
        if (!PatternEngine.isPatternObject(sourceRegex)) {
            throw new TypeError("PatternEngine: Expected a RegExp object for duplication.");
        }

        var customProps = sourceRegex._ptnEng;
        var combinedModifiers = extractNativeModifiers(sourceRegex) + (extraModifiers || String());
        // Remove duplicates and sort flags for consistency (optional, but good practice)
        combinedModifiers = Array.from(new Set(Array.from(combinedModifiers))).sort().join(String());

        var newRegex = PatternEngine(sourceRegex.source, combinedModifiers);

        if (customProps) {
            newRegex._ptnEng = {
                source: customProps.source,
                groupNamesCollection: customProps.groupNamesCollection ? customProps.groupNamesCollection.slice(0) : null
            };
        }
        return newRegex;
    }

    /**
     * Extracts the native flags (g, i, m, y) from a RegExp object.
     *
     * @param {RegExp} regexObj - The RegExp object.
     * @returns {string} A string containing the active native flags.
     */
    function extractNativeModifiers (regexObj) {
        var flags = String();
        if (regexObj.global) flags += "g";
        if (regexObj.ignoreCase) flags += "i";
        if (regexObj.multiline) flags += "m";
        if (regexObj.sticky) flags += "y"; // Only if supported
        return flags;
    }

    /**
     * Finds the index of an item in an array. Similar to `Array.prototype.indexOf`.
     *
     * @param {Array<*>} searchArray - The array to search within.
     * @param {*} itemToFind - The item to locate.
     * @returns {number} The index of the item, or -1 if not found.
     */
    function locateItemIndex (searchArray, itemToFind) {
        for (var i = 0; i < searchArray.length; i++) {
            if (searchArray[i] === itemToFind) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Iterates through registered custom tokens and attempts to match them
     * at the current position in the pattern string.
     *
     * @param {string} patternInput - The full regex pattern string.
     * @param {number} currentPosition - The current index in `patternInput`.
     * @param {number} scopeContext - The current parsing scope (GLOBAL_CONTEXT or CHAR_CLASS_CONTEXT).
     * @param {Object} parsingState - The context object for token handlers.
     * @returns {Object|null} An object `{ output: string, regexMatch: RegExpMatchArray }` if a token matches, else `null`.
     */
    function evaluateRegisteredComponents (patternInput, currentPosition, scopeContext, parsingState) {
        for (var i = 0; i < registeredComponents.length; i++) {
            var component = registeredComponents[i];

            // Check if the component is active in the current scope.
            if ((scopeContext & component.scope) === 0) {
                continue; // Skip if scope doesn't match.
            }

            // If a trigger character is defined, check if it matches the current character.
            if (component.trigger && patternInput.charAt(currentPosition) !== component.trigger) {
                continue; // Skip if trigger doesn't match.
            }

            // Attempt to execute the token's pattern against the remaining part of the input.
            // Use the native `exec` to avoid re-entering the augmented `RegExp.prototype.exec`
            // and potential recursion issues when processing internal regexes.
            var tokenMatch = nativeMethods.exec.call(component.pattern, patternInput.slice(currentPosition));

            if (tokenMatch) {
                // If a match is found, call the token's handler.
                var handlerResult = component.handler(patternInput, currentPosition, scopeContext, parsingState, tokenMatch);

                // If the handler returns a non-null result, this token has been successfully processed.
                if (handlerResult !== null) {
                    return {
                        output: handlerResult,
                        regexMatch: tokenMatch
                    };
                }
            }
        }
        return null; // No custom token matched.
    }

})(); // End of self-executing anonymous function.