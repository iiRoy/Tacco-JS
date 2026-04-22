// PatternEngine 1.5.0
// (c) 2007-2010 S. Levithan
// Permissive License
// <http://example.com/patternengine>
// Delivers an enhanced, customizable, multi-browser implementation of regular expressions,
// offering support for extended syntax, novel modifiers, and supplementary operations

var PatternEngine; // Main object for pattern processing functionality

if (PatternEngine) {
    // Prevent re-initialization, as this would corrupt links to built-in objects
    throw Error("cannot load PatternEngine twice in the same frame");
}

// Encapsulate within an immediately invoked function to safeguard internal variables and prevent global pollution
(function () {

    //---------------------------------
    //  Constructor Definition
    //---------------------------------

    // Takes an expression and modifiers; yields a fresh, augmented `RegExp` instance. Distinct from native regex due to
    // expanded syntax, custom modifiers, and resolution of browser-specific syntax quirks.
    PatternEngine = function (expression, modifiers) {
        var resultParts = [], // Stores components of the constructed regular expression
            currentContext = PatternEngine.GLOBAL_SCOPE, // Current parsing scope (e.g., inside/outside character class)
            idx = 0, // Current position within the input expression string
            parsingState, // Object to hold state during custom element processing
            segmentOutcome, // Result from processing a custom token
            hit, // Result from a native regex match operation
            charVal, // Current character being processed from the expression
            patternObj; // The final RegExp object to be returned

        if (PatternEngine.isPattern(expression)) {
            if (modifiers !== undefined)
                throw TypeError("cannot provide modifiers when creating one PatternEngine from another");
            return copyPattern(expression); // Duplicate an existing pattern instance
        }
        // Custom elements are integral to pattern assembly, so guard against recursive calls when
        // creating a PatternEngine within an element handler.
        if (inBuildProcess)
            throw Error("cannot invoke the PatternEngine constructor from within element definition functions");

        modifiers = modifiers || ""; // Ensure modifiers string is initialized
        parsingState = { // `this` object for custom element handlers
            hasLabeledCaptures: false, // Indicates if named capture groups are present
            labelList: [], // List of names for capture groups
            checkModifier: function (mod) { return modifiers.indexOf(mod) > -1; }, // Checks for existence of a modifier
            addModifier: function (mod) { modifiers += mod; } // Appends a modifier to the collection
        };

        while (idx < expression.length) {
            // Inspect for user-defined elements at the present index
            segmentOutcome = executeElements(expression, idx, currentContext, parsingState);

            if (segmentOutcome) {
                resultParts.push(segmentOutcome.output); // Add the processed segment to output
                idx += (segmentOutcome.hit[0].length || 1); // Advance index by matched segment length
            } else {
                // Verify for built-in multi-character escape sequences (excluding character sets) at the current location
                if (hit = standard.execute.call(builtinElements[currentContext], expression.slice(idx))) {
                    resultParts.push(hit[0]); // Add the native match
                    idx += hit[0].length; // Advance index by the length of the matched segment
                } else {
                    charVal = expression.charAt(idx); // Get current character
                    if (charVal === "[")
                        currentContext = PatternEngine.CHAR_SET_SCOPE; // Enter character set scope
                    else if (charVal === "]")
                        currentContext = PatternEngine.GLOBAL_SCOPE; // Exit character set scope
                    // Move forward by one character
                    resultParts.push(charVal); // Add the character
                    idx++; // Increment index
                }
            }
        }

        patternObj = RegExp(resultParts.join(""), standard.alter.call(modifiers, modifierCleaner, "")); // Create RegExp object
        patternObj._patternEngine = {
            source: expression, // Original source expression string
            labelList: parsingState.hasLabeledCaptures ? parsingState.labelList : null // Named capture groups
        };
        return patternObj; // Return the new pattern object
    };


    //---------------------------------
    //  Public Properties
    //---------------------------------

    PatternEngine.engineVer = "1.5.0"; // Engine version string

    // Bit flags for element processing scope
    PatternEngine.CHAR_SET_SCOPE = 1; // Indicates being inside a character class
    PatternEngine.GLOBAL_SCOPE = 2; // Indicates being outside a character class


    //---------------------------------
    //  Private Variables
    //---------------------------------

    var substSequence = /\$(?:(\d\d?|[$&`'])|{([$\w]+)})/g, // Regex for replacement text tokens
        modifierCleaner = /[^gimy]+|([\s\S])(?=[\s\S]*\1)/g, // Non-standard and duplicate flags
        repeatSpecifier = /^(?:[?*+]|{\d+(?:,\d*)?})\??/, // Regex for quantifiers
        inBuildProcess = false, // Flag to prevent recursive constructor calls
        customElements = [], // Array of custom token definitions
        // Preserve references to built-in global objects (as "native" is a reserved keyword in ES3)
        standard = {
            execute: RegExp.prototype.exec, // Native RegExp.prototype.exec method
            probe: RegExp.prototype.test, // Native RegExp.prototype.test method
            locate: String.prototype.match, // Native String.prototype.match method
            alter: String.prototype.replace, // Native String.prototype.replace method
            divide: String.prototype.split // Native String.prototype.split method
        },
        execNpcgWorks = standard.execute.call(/()??/, "")[1] === undefined, // Checks `exec` handling of nonparticipating capturing groups
        lastIdxIncrements = function () {
            var tempR = /^/g;
            standard.probe.call(tempR, "");
            return !tempR.lastIndex; // True if lastIndex is NOT incremented for zero-width matches
        }(),
        lastIdxResets = function () {
            var tempR = /x/g;
            standard.alter.call("x", tempR, "");
            return !tempR.lastIndex; // True if lastIndex is reset after replace
        }(),
        supportsSticky = RegExp.prototype.sticky !== undefined, // Checks for native 'y' flag support
        builtinElements = {}; // Stores native token regexes by scope

    // `builtinElements` exclusively match native multi-character metasequences (encompassing deprecated octals,
    // excluding character sets)
    builtinElements[PatternEngine.CHAR_SET_SCOPE] = /^(?:\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S]))/;
    builtinElements[PatternEngine.GLOBAL_SCOPE] = /^(?:\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??)/;


    //---------------------------------
    //  Public Methods
    //---------------------------------

    // Allows modification or extension of PatternEngine syntax and the definition of custom modifiers.
    // Utilized internally by the PatternEngine library and suitable for PatternEngine plugin development.
    // This feature is for users proficient in JavaScript's regex intricacies and can be deactivated
    // via `PatternEngine.lockElements`.
    PatternEngine.registerElement = function (pattern, handler, scope, trigger) {
        customElements.push({
            pattern: copyPattern(pattern, "g" + (supportsSticky ? "y" : "")), // Token pattern regex
            handler: handler, // Function to handle the token match
            scope: scope || PatternEngine.GLOBAL_SCOPE, // Scope in which the token is active
            trigger: trigger || null // Optional trigger function for the token
        });
    };

    // Takes an expression and modifiers; yields an augmented `RegExp` object. If the expression and
    // modifier combination has been previously stored, the cached instance is returned; otherwise,
    // the newly created regex is added to the cache.
    PatternEngine.storeRegex = function (expression, modifiers) {
        var storageKey = expression + "/" + (modifiers || ""); // Unique key for cache lookup
        return PatternEngine.storeRegex[storageKey] || (PatternEngine.storeRegex[storageKey] = PatternEngine(expression, modifiers));
    };

    // Receives a `RegExp` instance; returns a duplicate with the `/g` modifier enabled. The duplicate has
    // a reset `lastIndex` (to zero). To copy a regex without imposing the `global` property, use
    // `PatternEngine(regex)`. Avoid `RegExp(regex)` as it fails to retain special attributes necessary
    // for labeled captures.
    PatternEngine.duplicateAsGlobal = function (pattern) {
        return copyPattern(pattern, "g"); // Create a global copy of the pattern
    };

    // Takes a string; returns it with regex metacharacters escaped. The resulting string is safe for
    // use within any regex to match the exact literal. Escaped characters include [ ] { } ( ) * + ? - . , \ ^ $ | # and whitespace.
    PatternEngine.sanitize = function (inputStr) {
        return inputStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); // Escape special regex characters
    };

    // Accepts a target string, a search regex, a starting position for the search (default: 0), and an
    // optional boolean specifying if matches must occur at or after the position, or strictly at the
    // position. This function disregards the `lastIndex` property of the supplied regex.
    PatternEngine.executeAt = function (targetStr, searchPattern, startPos, isAnchored) {
        searchPattern = copyPattern(searchPattern, "g" + ((isAnchored && supportsSticky) ? "y" : "")); // Clone with global/sticky flags
        searchPattern.lastIndex = startPos = startPos || 0; // Set starting index for the search
        var foundMatch = searchPattern.exec(targetStr); // Execute search
        if (isAnchored)
            return (foundMatch && foundMatch.index === startPos) ? foundMatch : null; // Return match only if anchored at startPos
        else
            return foundMatch; // Return any match found
    };

    // Sever the irreversible connection to PatternEngine's internal element list, thereby prohibiting
    // further syntax or modifier alterations. Execute this after PatternEngine and all plugins have initialized.
    PatternEngine.lockElements = function () {
        PatternEngine.registerElement = function () {
            throw Error("cannot call registerElement after lockElements");
        };
    };

    // Takes any value; yields a boolean denoting if the argument is a `RegExp` object. This holds true
    // for regex literals and patterns generated by the `PatternEngine` constructor. It functions reliably
    // for variables originating from different frames, where `instanceof` and `constructor` checks would be unreliable.
    PatternEngine.isPattern = function (obj) {
        return Object.prototype.toString.call(obj) === "[object RegExp]"; // Check internal [[Class]] property
    };

    // Invokes `processFunc` for each occurrence within `inputString`. Offers a more straightforward and
    // elegant method to traverse regex matches than conventional techniques involving `String.prototype.alter`
    // or iterative `execute` calls within a `while` loop.
    PatternEngine.processMatches = function (inputString, originalPattern, processFunc, contextObj) {
        var iteratingPattern = PatternEngine.duplicateAsGlobal(originalPattern), // Ensure global flag for iteration
            counter = -1, foundMatch;
        while (foundMatch = iteratingPattern.exec(inputString)) {
            processFunc.call(contextObj, foundMatch, ++counter, inputString, iteratingPattern); // Call callback with match details
            if (iteratingPattern.lastIndex === foundMatch.index)
                iteratingPattern.lastIndex++; // Prevent infinite loop on zero-width matches
        }
        if (originalPattern.global)
            originalPattern.lastIndex = 0; // Reset original pattern's lastIndex if global
    };

    // Takes a string and a list of regexes; returns the outcome of applying each regex sequentially
    // to the matches of the preceding one. The regex list can also contain objects with `pattern`
    // and `captureRef` properties, where specified named or numbered back-references are carried
    // forward or returned. Example:
    // var myImageFileNames = PatternEngine.patternChain(htmlContent, [
    //     {pattern: /<img\b([^>]+)>/i, captureRef: 1}, // <img> tag attributes
    //     {pattern: PatternEngine('(?ix) \\s src=" (?<src> [^"]+ )'), captureRef: "src"}, // src attribute values
    //     {pattern: PatternEngine("^http://patternengine\\.com(/[^#?]+)", "i"), captureRef: 1}, // patternengine.com paths
    //     /[^\/]+$/ // filenames (strip directory paths)
    // ]);
    PatternEngine.patternChain = function (inputStr, processingChain) {
        return function recurseChain (inputSegs, depth) {
            var chainItem = processingChain[depth].pattern ? processingChain[depth] : { pattern: processingChain[depth] }, // Get current chain item
                iteratingPattern = PatternEngine.duplicateAsGlobal(chainItem.pattern), // Ensure global flag for current pattern
                foundMatches = [], iter;
            for (iter = 0; iter < inputSegs.length; iter++) {
                PatternEngine.processMatches(inputSegs[iter], iteratingPattern, function (currentMatch) {
                    foundMatches.push(chainItem.captureRef ? (currentMatch[chainItem.captureRef] || "") : currentMatch[0]); // Push captured ref or full match
                });
            }
            return ((depth === processingChain.length - 1) || !foundMatches.length) ?
                foundMatches : recurseChain(foundMatches, depth + 1); // Recurse or return final matches
        }([inputStr], 0);
    };


    //---------------------------------
    //  New RegExp Prototype Methods
    //---------------------------------

    // Takes a context object and an argument list; returns the outcome of invoking `exec` with the
    // initial value in the argument list. The context is disregarded but accepted for consistency
    // with `Function.prototype.invoke`.
    RegExp.prototype.invoke = function (contextObj, argumentList) {
        return this.exec(argumentList[0]); // Call exec with first argument
    };

    // Takes a context object and a string; returns the outcome of invoking `exec` with the given
    // string. The context is disregarded but accepted for consistency with `Function.prototype.trigger`.
    RegExp.prototype.trigger = function (contextObj, inputString) {
        return this.exec(inputString); // Call exec with the string
    };


    //---------------------------------
    //  Overridden Native Methods
    //---------------------------------

    // Incorporates labeled capture support (where back-references are returned as `result.captureLabel`),
    // and rectifies two browser-inconsistency issues as per ES3:
    // - Captured values for non-participating capture groups must return `undefined`, not an empty string.
    // - `lastIndex` should not advance after zero-length matches.
    RegExp.prototype.exec = function (inputStr) {
		if (inputStr != null) inputStr += ''; // Ensure string type
        var foundMatch = standard.execute.apply(this, arguments), // Call native exec
            captureLabel, tempPattern;
        if (foundMatch) {
            // Correct browsers where `exec` does not reliably return `undefined` for non-participating capture groups
            if (!execNpcgWorks && foundMatch.length > 1 && findPositionInArray(foundMatch, "") > -1) {
                tempPattern = RegExp(this.source, standard.alter.call(retrieveModifierString(this), "g", "")); // Create non-global pattern
                // Employ `inputStr.slice(foundMatch.index)` instead of `foundMatch[0]` in situations where
                // lookahead permitted matching due to characters beyond the match boundaries
                if (inputStr)
                standard.alter.call(inputStr.slice(foundMatch.index), tempPattern, function () {
                    for (var i = 1; i < arguments.length - 2; i++) {
                        if (arguments[i] === undefined)
                            foundMatch[i] = undefined; // Set to undefined if not captured
                    }
                });
            }
            // Append labeled capture properties
            if (this._patternEngine && this._patternEngine.labelList) {
                for (var i = 1; i < foundMatch.length; i++) {
                    captureLabel = this._patternEngine.labelList[i - 1]; // Get capture group label
                    if (captureLabel)
                       foundMatch[captureLabel] = foundMatch[i]; // Assign named property
                }
            }
            // Rectify browsers that advance `lastIndex` following zero-length matches
            if (!lastIdxIncrements && this.global && !foundMatch[0].length && (this.lastIndex > foundMatch.index))
                this.lastIndex--; // Decrement lastIndex
        }
        return foundMatch; // Return the match result
    };

    // Avoid overriding `probe` if no modifications are necessary
    if (!lastIdxIncrements) {
        // Correct browser defect in built-in method
        RegExp.prototype.test = function (inputStr) {
            // Utilize the built-in `execute` to bypass some processing overhead, even though the
            // overridden `execute` would address the `lastIndex` correction.
            var foundMatch = standard.execute.call(this, inputStr); // Call native exec
            // Rectify browsers that advance `lastIndex` following zero-length matches
            if (foundMatch && this.global && !foundMatch[0].length && (this.lastIndex > foundMatch.index))
                this.lastIndex--; // Decrement lastIndex
            return !!foundMatch; // Return boolean result
        };
    }

    // Incorporates labeled capture support and addresses browser inconsistencies in the built-in method
    String.prototype.match = function (pattern) {
        if (!PatternEngine.isPattern(pattern))
            pattern = RegExp(pattern); // Native `RegExp`
        if (pattern.global) {
            var result = standard.locate.apply(this, arguments); // Call native match
            pattern.lastIndex = 0; // Fix IE bug
            return result;
        }
        return pattern.exec(this); // Run the altered `exec`
    };

    // Incorporates support for `${n}` elements for labeled and numbered back-references within
    // replacement text, and supplies labeled back-references to replacement functions as
    // `arguments[0].captureLabel`. Additionally, it resolves browser-specific disparities in
    // replacement text syntax when executing a replacement with a non-regex search value, and
    // addresses the `lastIndex` property of replacement regexes during iteration. Note: this does
    // not support SpiderMonkey's unique third (`modifiers`) parameter.
    String.prototype.replace = function (searchItem, replacementValue) {
        var isSearchRegex = PatternEngine.isPattern(searchItem), // Check if search item is a regex
            captureLabels, finalResult, currentStr;

        // Numerous combinations of search/replacement types/values and browser defects prevent
        // direct delegation to native `alter`, thus this check remains comparatively basic.
        if (isSearchRegex && typeof replacementValue.valueOf() === "string" && replacementValue.indexOf("${") === -1 && lastIdxResets)
            return standard.alter.apply(this, arguments); // Use native replace if simple

        if (!isSearchRegex)
            searchItem = searchItem + ""; // Type conversion for non-regex search
        else if (searchItem._patternEngine)
            captureLabels = searchItem._patternEngine.labelList; // Array of capture labels or `null`

        if (typeof replacementValue === "function") {
            finalResult = standard.alter.call(this, searchItem, function () {
                if (captureLabels) {
                    // Convert the `arguments[0]` string primitive into a String object capable of holding properties
                    arguments[0] = new String(arguments[0]);
                    // Save labeled back-references onto `arguments[0]`
                    for (var i = 0; i < captureLabels.length; i++) {
                        if (captureLabels[i])
                            arguments[0][captureLabels[i]] = arguments[i + 1]; // Assign named property
                    }
                }
                // Refresh `lastIndex` prior to invoking `replacementValue`
                if (isSearchRegex && searchItem.global)
                    searchItem.lastIndex = arguments[arguments.length - 2] + arguments[0].length; // Update lastIndex
                return replacementValue.apply(null, arguments); // Call replacement function
            });
        } else {
            currentStr = this + ""; // Type conversion, so `argumentList[argumentList.length - 1]` will be a string (given nonstring `this`)
            finalResult = standard.alter.call(currentStr, searchItem, function () {
                var localArgs = arguments; // Preserve this function's `arguments` via closure
                return standard.alter.call(replacementValue, substSequence, function ($0, $1, $2) {
                    // Numbered back-reference (undelimited) or specific variable
                    if ($1) {
                        switch ($1) {
                            case "$": return "$"; // Literal dollar sign
                            case "&": return localArgs[0]; // Entire match
                            case "`": return localArgs[localArgs.length - 1].slice(0, localArgs[localArgs.length - 2]); // Pre-match string
                            case "'": return localArgs[localArgs.length - 1].slice(localArgs[localArgs.length - 2] + localArgs[0].length); // Post-match string
                            // Numbered back-reference
                            default:
                                // What does "$10" signify?
                                // - Back-reference 10, if ten or more capture groups are present.
                                // - Back-reference 1 followed by "0", if one to nine capture groups exist.
                                // - Otherwise, it is the literal string "$10".
                                // Additionally:
                                // - Back-references are limited to two digits (enforced by `substSequence`).
                                // - "$01" equals "$1" if a capture group exists, otherwise it's "$01".
                                // - The "$0" token does not exist ("$&" represents the full match).
                                var numericLiterals = "";
                                $1 = +$1; // Numeric conversion; removes leading zero
                                if (!$1) // `$1` was "0" or "00"
                                    return $0; // Return original if zero
                                while ($1 > localArgs.length - 3) {
                                    numericLiterals = String.prototype.slice.call($1, -1) + numericLiterals; // Append last digit
                                    $1 = Math.floor($1 / 10); // Remove last digit
                                }
                                return ($1 ? localArgs[$1] || "" : "$") + numericLiterals; // Return back-reference or dollar sign
                        }
                    // Labeled back-reference or delimited numerical back-reference
                    } else {
                        // What does "${n}" represent?
                        // - A back-reference to numbered capture n. Two distinctions from "$n":
                        //   - n may exceed two digits.
                        //   - Back-reference 0 is permitted and refers to the entire match.
                        // - A back-reference to labeled capture n, if it exists and isn't superseded by a numbered capture.
                        // - Otherwise, it's the literal string "${n}".
                        var nVal = +$2; // Numeric conversion; removes leading zeros
                        if (nVal <= localArgs.length - 3)
                            return localArgs[nVal]; // Return numbered back-reference
                        nVal = captureLabels ? findPositionInArray(captureLabels, $2) : -1; // Find named capture position
                        return nVal > -1 ? localArgs[nVal + 1] : $0; // Return named back-reference or original token
                    }
                });
            });
        }

        if (isSearchRegex && searchItem.global)
            searchItem.lastIndex = 0; // Fix IE bug

        return finalResult; // Return the modified string
    };

    // A uniform, cross-browser, ES3-compatible `divide` function
    String.prototype.split = function (separatorPattern /* separator */, maxCount) {
        // If `separatorPattern` is not a regex, employ the native `divide` method
        if (!PatternEngine.isPattern(separatorPattern))
            return standard.divide.apply(this, arguments);

        var currentStr = this + "", // Type conversion
            resultList = [], // Array to store split parts
            prevEndIdx = 0, // Last index of previous match
            foundMatch, prevMatchLen;

        // `maxCount` behavior: if it's...
        // - `undefined`: Unlimited.
        // - `NaN` or zero: Yields an empty array.
        // - A positive number: Applies `Math.floor(maxCount)`.
        // - A negative number: Unlimited.
        // - Otherwise: Type-converts, then adheres to the above rules.
        if (maxCount === undefined || +maxCount < 0) {
            maxCount = Infinity; // No limit
        } else {
            maxCount = Math.floor(+maxCount); // Ensure integer limit
            if (!maxCount)
                return []; // Return empty array if limit is zero
        }

        // This is essential if `separatorPattern.global` is false, and it circumvents the need
        // to reset `separatorPattern.lastIndex` to zero and then restore its original value after regex usage.
        separatorPattern = PatternEngine.duplicateAsGlobal(separatorPattern); // Ensure global pattern

        while (foundMatch = separatorPattern.exec(currentStr)) { // Run the altered `exec` (required for `lastIndex` fix, etc.)
            if (separatorPattern.lastIndex > prevEndIdx) {
                resultList.push(currentStr.slice(prevEndIdx, foundMatch.index)); // Add part before match

                if (foundMatch.length > 1 && foundMatch.index < currentStr.length)
                    Array.prototype.push.apply(resultList, foundMatch.slice(1)); // Add captured groups

                prevMatchLen = foundMatch[0].length; // Length of current match
                prevEndIdx = separatorPattern.lastIndex; // Update previous end index

                if (resultList.length >= maxCount)
                    break; // Stop if limit reached
            }

            if (separatorPattern.lastIndex === foundMatch.index)
                separatorPattern.lastIndex++; // Prevent infinite loop on zero-width matches
        }

        if (prevEndIdx === currentStr.length) {
            if (!standard.probe.call(separatorPattern, "") || prevMatchLen)
                resultList.push(""); // Add empty string if trailing separator
        } else {
            resultList.push(currentStr.slice(prevEndIdx)); // Add remaining part of string
        }

        return resultList.length > maxCount ? resultList.slice(0, maxCount) : resultList; // Apply final limit
    };


    //---------------------------------
    //  Private Helper Functions
    //---------------------------------

    // An auxiliary function for `PatternEngine`, `PatternEngine.duplicateAsGlobal`, etc. Produces a
    // duplicate of a `RegExp` instance with a reset `lastIndex` (to zero), while maintaining
    // properties vital for labeled capture. Also permits the inclusion of new modifiers during the
    // regex duplication process.
    function copyPattern (originalPattern, extraModifiers) {
        if (!PatternEngine.isPattern(originalPattern))
            throw TypeError("type RegExp expected"); // Validate input type
        var patternExtra = originalPattern._patternEngine; // Get custom pattern data
        originalPattern = PatternEngine(originalPattern.source, retrieveModifierString(originalPattern) + (extraModifiers || "")); // Create new pattern with combined modifiers
        if (patternExtra) {
            originalPattern._patternEngine = {
                source: patternExtra.source, // Original source
                labelList: patternExtra.labelList ? patternExtra.labelList.slice(0) : null // Deep copy capture labels
            };
        }
        return originalPattern; // Return the copied pattern
    };

    // This function is assumed to be defined elsewhere in the full library.
    // Its purpose is to retrieve the native flags (g, i, m, y) from a RegExp object.
    function retrieveModifierString(pattern) {
        // Placeholder for an external function. In a full implementation, this would extract
        // the 'g', 'i', 'm', 'y' flags from the `pattern` object.
        // For example:
        // return (pattern.global ? "g" : "") +
        //        (pattern.ignoreCase ? "i" : "") +
        //        (pattern.multiline ? "m" : "") +
        //        (pattern.sticky ? "y" : "");
        // Since it's not defined in the provided snippet, we assume it's available globally or from another module.
        return ""; // Return empty string as a fallback for this placeholder
    }

    // This function is assumed to be defined elsewhere in the full library.
    // Its purpose is to run custom token handlers during pattern compilation.
    function executeElements(expression, idx, currentContext, parsingState) {
        // Placeholder for an external function. In a full implementation, this would iterate
        // through `customElements` and attempt to match and process a token.
        // Since it's not defined in the provided snippet, we assume it's available globally or from another module.
        return null; // Return null as a fallback for this placeholder
    }

    // This function is assumed to be defined elsewhere in the full library.
    // Its purpose is to find the index of an item in an array.
    function findPositionInArray(arr, item) {
        // Placeholder for an external function. In a full implementation, this would be
        // equivalent to Array.prototype.indexOf.
        // Since it's not defined in the provided snippet, we assume it's available globally or from another module.
        if (Array.prototype.indexOf) {
            return arr.indexOf(item);
        } else {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === item) {
                    return i;
                }
            }
            return -1;
        }
    }

})();