var MatchCraft;

if (MatchCraft) {
    throw Error("MatchCraft already loaded, cannot re-initialize.");
}

(function () {

    // --- Internal Helpers ---
    var originalExecMethod = RegExp.prototype.exec;
    var originalMatchMethod = String.prototype.match;
    var originalReplaceMethod = String.prototype.replace;
    var originalSplitMethod = String.prototype.split;
    var originalTestMethod = RegExp.prototype.test;

    // A unique placeholder for custom capturing groups within the regex string
    var groupPlaceholder = "(_MC_GROUP_MC_)";
    // Regex to detect custom named group syntax in the user's pattern
    var namedGroupDetector = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
    // Regex to parse custom replacement string tokens
    var substitutionTokenParser = /\[\[([a-zA-Z_][a-zA-Z0-9_]*)\]\]|\[(\d+)\]|\[ALL\]|\[PRE\]|\[POST\]|\[LIT\]/g;

    // Custom class for representing a match result, similar to native Array but with named properties
    function MatchOutcome(nativeMatchResult, captureNameMap) {
        if (!nativeMatchResult) return null;

        // Copy array-like properties from the native match
        for (var i = 0; i < nativeMatchResult.length; i++) {
            this[i] = nativeMatchResult[i];
        }
        this.size = nativeMatchResult.length; // Renamed 'length' to 'size'
        this.position = nativeMatchResult.index; // Renamed 'index' to 'position'
        this.fullInput = nativeMatchResult.input; // Renamed 'input' to 'fullInput'
        this.namedCaptures = {}; // Container for named group values

        // Map numbered captures to named properties
        for (var nameKey in captureNameMap) {
            if (captureNameMap.hasOwnProperty(nameKey)) {
                var groupNumber = captureNameMap[nameKey];
                if (groupNumber < nativeMatchResult.length) {
                    this[nameKey] = nativeMatchResult[groupNumber]; // Direct property access
                    this.namedCaptures[nameKey] = nativeMatchResult[groupNumber]; // Stored in namedCaptures object
                }
            }
        }
    }
    MatchOutcome.prototype = Object.create(Array.prototype);
    MatchOutcome.prototype.constructor = MatchOutcome;

    // --- Main MatchCraft Constructor ---
    MatchCraft = function (expressionSource, behaviorOptions) {
        if (MatchCraft.identifyPattern(expressionSource)) {
            // If the input is already a MatchCraft pattern, duplicate it
            if (behaviorOptions !== undefined)
                throw TypeError("Cannot provide behavior options when cloning an existing pattern.");
            return MatchCraft.duplicatePattern(expressionSource);
        }

        var patternInput = String(expressionSource);
        var optionsInput = behaviorOptions ? String(behaviorOptions) : "";
        var transformedPatternParts = [];
        var collectedNames = {};
        var currentCaptureCount = 0;
        var lastPatternPosition = 0;
        var currentMatch;

        // Step 1: Parse custom named group syntax and convert to standard capturing groups
        while ((currentMatch = namedGroupDetector.exec(patternInput)) !== null) {
            transformedPatternParts.push(patternInput.slice(lastPatternPosition, currentMatch.index));
            transformedPatternParts.push(groupPlaceholder); // Insert a standard capturing group
            collectedNames[currentMatch[1]] = ++currentCaptureCount; // Map name to its capture index
            lastPatternPosition = namedGroupDetector.lastIndex;
        }
        transformedPatternParts.push(patternInput.slice(lastPatternPosition));

        var finalNativePatternString = transformedPatternParts.join("");

        // Step 2: Clean and filter flags for the native RegExp constructor
        var cleanFlags = "";
        var seenFlagChars = {};
        for (var f = 0; f < optionsInput.length; f++) {
            var flagChar = optionsInput.charAt(f);
            if (!seenFlagChars[flagChar] && "gimy".indexOf(flagChar) !== -1) { // Only allow standard flags
                cleanFlags += flagChar;
                seenFlagChars[flagChar] = true;
            }
        }

        this.wrappedNativePattern = new RegExp(finalNativePatternString, cleanFlags);
        this.capturedNamesMap = collectedNames;
        this.originalExpression = patternInput; // Store original user input
        this.originalOptions = optionsInput; // Store original options
    };

    // --- Static Properties for MatchCraft ---
    MatchCraft.libraryVersion = "1.0.0";
    MatchCraft.GLOBAL_SCOPE = 100; // Arbitrary scope constant
    MatchCraft.LOCAL_SCOPE = 200;  // Arbitrary scope constant

    // --- Static Methods for MatchCraft ---

    // Determines if an object is an instance of MatchCraft
    MatchCraft.identifyPattern = function (candidate) {
        return candidate instanceof MatchCraft;
    };

    // Escapes special regex characters in a string for literal matching
    MatchCraft.hardenString = function (rawText) {
        return String(rawText).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    // Creates a new MatchCraft pattern from an existing one, possibly adding new flags
    MatchCraft.duplicatePattern = function (originalInstance, additionalOptions) {
        if (!MatchCraft.identifyPattern(originalInstance))
            throw TypeError("Expected a MatchCraft pattern instance to duplicate.");
        return new MatchCraft(originalInstance.originalExpression, originalInstance.originalOptions + (additionalOptions || ""));
    };

    // Utility to iterate over all matches found by a pattern
    MatchCraft.walkThroughMatches = function (contentString, patternInstance, processingFunction, contextTarget) {
        if (!MatchCraft.identifyPattern(patternInstance))
            throw TypeError("Expected a MatchCraft pattern instance for match processing.");

        var iterablePattern = MatchCraft.duplicatePattern(patternInstance, "g"); // Ensure global behavior for iteration
        var currentResult;
        var iterationCount = -1;

        while ((currentResult = iterablePattern.locate(contentString)) !== null) {
            processingFunction.call(contextTarget, currentResult, ++iterationCount, contentString, iterablePattern);
            // Advance lastIndex to prevent infinite loops on zero-length matches
            if (iterablePattern.wrappedNativePattern.lastIndex === currentResult.position) {
                iterablePattern.wrappedNativePattern.lastIndex++;
            }
        }
        // Reset lastIndex for the original pattern if it wasn't global
        if (!patternInstance.wrappedNativePattern.global) {
            patternInstance.wrappedNativePattern.lastIndex = 0;
        }
    };

    // Performs string replacement using a MatchCraft pattern
    MatchCraft.effectReplacement = function (originalString, patternInstance, replacementSpecification) {
        if (!MatchCraft.identifyPattern(patternInstance))
            throw TypeError("Expected a MatchCraft pattern instance for replacement.");

        var resultingParts = [];
        var lastProcessedPosition = 0;
        var workingPattern = MatchCraft.duplicatePattern(patternInstance, "g"); // Global for iteration
        var currentMatchCount = 0;

        MatchCraft.walkThroughMatches(originalString, workingPattern, function (matchResult) {
            resultingParts.push(originalString.slice(lastProcessedPosition, matchResult.position));
            var resolvedReplacementContent;

            if (typeof replacementSpecification === "function") {
                // Prepare arguments for the replacement function, mimicking native behavior
                var functionArguments = [matchResult[0]];
                for (var i = 1; i < matchResult.size; i++) {
                    functionArguments.push(matchResult[i]);
                }
                functionArguments.push(matchResult.position, originalString);

                // Augment the first argument (full match string) with named properties
                var matchStringObject = new String(matchResult[0]);
                for(var nameOfCapture in matchResult.namedCaptures) {
                    if (matchResult.namedCaptures.hasOwnProperty(nameOfCapture)) {
                        matchStringObject[nameOfCapture] = matchResult.namedCaptures[nameOfCapture];
                    }
                }
                functionArguments[0] = matchStringObject;

                resolvedReplacementContent = replacementSpecification.apply(null, functionArguments);
            } else {
                resolvedReplacementContent = String(replacementSpecification).replace(substitutionTokenParser, function (tokenText, namedCaptureRef, numericCaptureRef) {
                    if (namedCaptureRef) { // [[name]]
                        return matchResult[namedCaptureRef] !== undefined ? matchResult[namedCaptureRef] : tokenText;
                    } else if (numericCaptureRef) { // [idx]
                        var numericIndex = parseInt(numericCaptureRef, 10);
                        return matchResult[numericIndex] !== undefined ? matchResult[numericIndex] : tokenText;
                    } else if (tokenText === "[ALL]") { // [ALL]
                        return matchResult[0];
                    } else if (tokenText === "[PRE]") { // [PRE]
                        return originalString.slice(0, matchResult.position);
                    } else if (tokenText === "[POST]") { // [POST]
                        return originalString.slice(matchResult.position + matchResult[0].length);
                    } else if (tokenText === "[LIT]") { // [LIT]
                        return "[";
                    }
                    return tokenText; // Should not be reached with current regex
                });
            }
            resultingParts.push(resolvedReplacementContent);
            lastProcessedPosition = workingPattern.wrappedNativePattern.lastIndex;
            currentMatchCount++;
        });

        resultingParts.push(originalString.slice(lastProcessedPosition)); // Append any remaining part of the string
        return resultingParts.join("");
    };

    // --- Prototype Methods for MatchCraft Instances ---

    // Locates the next match in the provided string
    MatchCraft.prototype.locate = function (targetString) {
        var nativeResult = originalExecMethod.call(this.wrappedNativePattern, targetString);
        return new MatchOutcome(nativeResult, this.capturedNamesMap);
    };

    // Checks if the pattern finds any match in the string
    MatchCraft.prototype.verify = function (targetString) {
        return originalTestMethod.call(this.wrappedNativePattern, targetString);
    };

    // Collects all matches found by the pattern in the string
    MatchCraft.prototype.collect = function (targetString) {
        if (!this.wrappedNativePattern.global) {
            var singleResult = this.locate(targetString);
            return singleResult ? [singleResult] : [];
        }

        var allResults = [];
        var workingPatternForCollect = MatchCraft.duplicatePattern(this, "g"); // Ensure global behavior
        var currentFound;
        while ((currentFound = workingPatternForCollect.locate(targetString)) !== null) {
            allResults.push(currentFound);
            // Advance lastIndex for zero-length matches
            if (workingPatternForCollect.wrappedNativePattern.lastIndex === currentFound.position) {
                workingPatternForCollect.wrappedNativePattern.lastIndex++;
            }
        }
        // Reset lastIndex for the original pattern
        this.wrappedNativePattern.lastIndex = 0;
        return allResults;
    };

    // Divides a string into an array of substrings based on pattern matches
    MatchCraft.prototype.fragment = function (targetString, maximumFragments) {
        var createdFragments = [];
        var fragmentLimit = (maximumFragments === undefined || maximumFragments < 0) ? Infinity : Math.floor(Number(maximumFragments));
        if (fragmentLimit === 0) return [];

        var stringToFragment = String(targetString);
        var lastFragmentEnd = 0;
        var currentFragmentCount = 0;
        var workingPatternForFragment = MatchCraft.duplicatePattern(this, "g"); // Ensure global for splitting
        var fragmentMatch;

        while (currentFragmentCount < fragmentLimit - 1 && (fragmentMatch = workingPatternForFragment.locate(stringToFragment)) !== null) {
            if (workingPatternForFragment.wrappedNativePattern.lastIndex === lastFragmentEnd) {
                // Skip empty string splits on zero-length matches
                workingPatternForFragment.wrappedNativePattern.lastIndex++;
                continue;
            }
            createdFragments.push(stringToFragment.slice(lastFragmentEnd, fragmentMatch.position));
            // Add captured groups as separate fragments
            for (var i = 1; i < fragmentMatch.size; i++) {
                createdFragments.push(fragmentMatch[i]);
            }
            lastFragmentEnd = workingPatternForFragment.wrappedNativePattern.lastIndex;
            currentFragmentCount++;
        }

        createdFragments.push(stringToFragment.slice(lastFragmentEnd));

        // Reset lastIndex for the original pattern
        this.wrappedNativePattern.lastIndex = 0;

        return createdFragments;
    };

    // --- String Prototype Extensions for MatchCraft Convenience ---
    // These methods provide an alternative API to native String methods,
    // leveraging MatchCraft patterns without directly overriding native behaviors.

    String.prototype.mcSubstitute = function (patternInput, replacementContent) {
        // If not a MatchCraft pattern, defer to native replace
        if (!MatchCraft.identifyPattern(patternInput)) {
            return originalReplaceMethod.apply(this, arguments);
        }
        return MatchCraft.effectReplacement(this, patternInput, replacementContent);
    };

    String.prototype.mcGatherAll = function (patternInput) {
        // If not a MatchCraft pattern, defer to native match
        if (!MatchCraft.identifyPattern(patternInput)) {
            return originalMatchMethod.apply(this, arguments);
        }
        return patternInput.collect(this);
    };

    String.prototype.mcDivideBy = function (patternInput, maxCount) {
        // If not a MatchCraft pattern, defer to native split
        if (!MatchCraft.identifyPattern(patternInput)) {
            return originalSplitMethod.apply(this, arguments);
        }
        return patternInput.fragment(this, maxCount);
    };

    String.prototype.mcFindNext = function (patternInput) {
        // This is a direct MatchCraft feature, no native equivalent for exact MatchOutcome return
        if (!MatchCraft.identifyPattern(patternInput)) {
            throw new TypeError("Expected a MatchCraft pattern instance for mcFindNext.");
        }
        return patternInput.locate(this);
    };

    // --- System Freezing and Caching ---

    // Prevents further extension of the MatchCraft system
    MatchCraft.sealFunctionality = function () {
        MatchCraft.registerCustomToken = function () {
            throw Error("Cannot register custom tokens after MatchCraft functionality is sealed.");
        };
        // More properties/methods could be sealed here if they represent extension points
    };

    // Internal cache for MatchCraft patterns
    var patternStorage = {};
    MatchCraft.fetchPattern = function (expression, options) {
        var storageKey = String(expression) + "::" + (options || "");
        return patternStorage[storageKey] || (patternStorage[storageKey] = new MatchCraft(expression, options));
    };

    // --- Placeholder for Custom Token Registration ---
    // The original XRegExp has a robust custom token system.
    // A Type IV clone would implement a completely different registration and processing mechanism.
    MatchCraft.registerCustomToken = function (tokenIdentifier, tokenProcessor, applicableContext) {
        // This would involve modifying the `namedGroupDetector` or adding a pre-parsing step
        // for `MatchCraft` constructor. For Type IV, it must be genuinely different from XRegExp's `tokens` array.
        // This is a conceptual placeholder for a different extensibility approach.
        console.warn("MatchCraft custom token registration system is conceptual in this clone.");
    };

})();