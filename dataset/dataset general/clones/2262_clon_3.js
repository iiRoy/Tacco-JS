// This module provides a flexible and readable API for constructing regular expressions.
// It aims to abstract the complexities of regex syntax into a chainable, declarative style,
// facilitating easier pattern creation and maintenance within JavaScript applications.

/**
 * @class PatternAssembler
 * @description A fluent builder for creating regular expression patterns.
 * Encapsulates the state and logic for constructing complex regex strings.
 */
class PatternAssembler {
    /**
     * Initializes a new PatternAssembler instance.
     * Sets up the internal state variables required for pattern construction.
     */
    constructor() {
        // Core state for the overall regular expression pattern
        this._patternModifiers = new Set();        // Stores unique regex flags (e.g., 'i', 'm', 'g')
        this._expressionSegments = [];            // An array that accumulates individual regex components

        // Tracks the count of capturing groups defined, essential for adjusting backreferences
        this._groupCounter = 0;

        // Manages segments currently being built as part of an 'oneOf' / 'orElse' alternative group
        this._currentAlternativeParts = [];

        // Resets the state specifically for the *current* pattern segment being defined
        this._resetCurrentSegmentState();
    }

    /**
     * Resets all transient state properties related to the pattern segment
     * that is currently being defined. This is typically invoked after a segment
     * has been fully specified and committed to the `_expressionSegments` array.
     * @private
     */
    _resetCurrentSegmentState() {
        this._minOccurrences = null;     // Minimum repetitions (e.g., in {min,max}, +)
        this._maxOccurrences = null;     // Maximum repetitions (e.g., in {min,max}, ?)
        this._exactMatchChar = null;     // A specific literal string to match (escaped)
        this._matchAnyChar = false;      // Flag for matching any character ('.')
        this._groupRefIndex = null;      // Index for a backreference (e.g., '\1')
        this._charSetInclude = null;     // String of characters for a positive character set ([abc])
        this._charSetExclude = null;     // String of characters for a negative character set ([^abc])
        this._nestedPattern = null;      // A sub-pattern (from another PatternAssembler) to embed
        this._isReluctant = false;       // Flag to make quantifiers non-greedy (e.g., '??', '*?')
        this._shouldCapture = false;     // Flag to make the current segment a capturing group
        this._segmentStateActive = false; // Indicates if any method has actively modified this segment's state
    }

    /**
     * Processes and adds the currently defined pattern segment to the main
     * `_expressionSegments` array. This method acts as a flush mechanism,
     * ensuring that all pending state for a segment is converted into a regex string.
     * It also handles the finalization of any pending alternative groups.
     * @private
     */
    _commitPendingSegment() {
        // First, finalize any active alternative group (oneOf/orElse)
        if (this._currentAlternativeParts.length > 0) {
            this._expressionSegments.push(`(?:${this._currentAlternativeParts.join('|')})`);
            this._currentAlternativeParts = []; // Clear the alternative buffer
        }

        // Determine if there's any actual content defined for the current segment
        const hasContent = this._exactMatchChar !== null ||
                           this._matchAnyChar ||
                           this._groupRefIndex !== null ||
                           this._charSetInclude !== null ||
                           this._charSetExclude !== null ||
                           this._nestedPattern !== null;

        // If the segment state was not actively modified and has no content, there's nothing to commit.
        if (!this._segmentStateActive && !hasContent) {
            return;
        }

        const segmentRegexString = this._constructSegmentString();
        if (segmentRegexString) {
            this._expressionSegments.push(segmentRegexString);
        } else if (this._segmentStateActive) {
            // Log a warning if a segment was actively configured but resulted in an empty string
            console.warn("PatternAssembler: An active segment configuration resulted in an empty pattern string. Review the builder sequence.");
        }

        this._resetCurrentSegmentState(); // Clear the state for the next segment
    }

    /**
     * Builds the regex string for the current pending segment based on its internal state.
     * This private helper method aggregates the character specifier, quantifier, and capturing/reluctant flags.
     * @returns {string} The fully formed regex string for the current segment.
     * @private
     */
    _constructSegmentString() {
        const capturingPrefix = this._shouldCapture ? "" : "?:"; // Non-capturing by default
        const quantifierString = this._buildQuantifierString();
        const characterSpecifier = this._buildCharacterSpecifier();
        const reluctanceSuffix = this._isReluctant ? "?" : "";

        if (!characterSpecifier) {
            // If no base character/pattern was specified, we can't build a segment.
            return "";
        }

        // The base character specifier is wrapped in a non-capturing group to ensure
        // quantifiers and reluctance apply correctly to the entire unit.
        return `(${capturingPrefix}(?:${characterSpecifier})${quantifierString}${reluctanceSuffix})`;
    }

    /**
     * Generates the quantifier part of a regex (e.g., '{1,3}', '+', '?', '*')
     * based on the `_minOccurrences` and `_maxOccurrences` properties.
     * @returns {string} The quantifier string.
     * @private
     */
    _buildQuantifierString() {
        const min = this._minOccurrences;
        const max = this._maxOccurrences;

        // No quantifier specified
        if (min === null && max === null) {
            return "";
        }

        // Handle common shorthand quantifiers
        if (min === 0 && max === 1) return "?"; // Zero or one time
        if (min === 1 && max === null) return "+"; // One or more times
        if (min === 0 && max === null) return "*"; // Zero or more times

        // Handle explicit range quantifiers
        if (min !== null && max !== null) {
            if (min === max) return `{${min}}`;       // Exactly N times
            return `{${min},${max}}`;             // Between min and max times
        }
        if (min !== null) {
            return `{${min},}`;                   // At least min times
        }
        if (max !== null) {
            return `{0,${max}}`;                  // At most max times (implies min 0)
        }

        return ""; // Fallback, should not be reached if logic is sound
    }

    /**
     * Determines the fundamental character or pattern string for the current segment.
     * This method prioritizes specific types of character matching.
     * @returns {string} The core character/pattern literal.
     * @private
     */
    _buildCharacterSpecifier() {
        if (this._exactMatchChar !== null) {
            return this._exactMatchChar;
        }
        if (this._matchAnyChar) {
            return "."; // Matches any character (except newline by default)
        }
        if (this._groupRefIndex !== null) {
            // Basic validation for group reference index
            if (typeof this._groupRefIndex !== 'number' || !Number.isInteger(this._groupRefIndex) || this._groupRefIndex <= 0) {
                console.error(`PatternAssembler: Invalid group reference index provided: ${this._groupRefIndex}. Must be a positive integer.`);
                return ""; // Return empty or throw error for invalid input
            }
            return `\\${this._groupRefIndex}`;
        }
        if (this._charSetInclude !== null) {
            return `[${this._charSetInclude}]`; // Positive character set
        }
        if (this._charSetExclude !== null) {
            return `[^${this._charSetExclude}]`; // Negative character set
        }
        if (this._nestedPattern !== null) {
            return this._nestedPattern; // Embedded sub-pattern
        }
        return ""; // No character specifier was set for this segment
    }

    /**
     * Finalizes all pending segments and returns the complete regular expression pattern as a string.
     * This is the string that would be passed to the `RegExp` constructor.
     * @returns {string} The full regular expression pattern string.
     */
    toPatternString() {
        this._commitPendingSegment(); // Ensure any currently building segment is added
        return this._expressionSegments.join("");
    }

    /**
     * Incorporates the pattern from another `PatternAssembler` instance into the current one.
     * This involves generating the sub-pattern's string and adjusting its group references
     * to prevent conflicts with groups already defined in the main pattern.
     * @param {PatternAssembler} subAssembler The `PatternAssembler` instance whose pattern is to be embedded.
     * @returns {string} The adjusted pattern string from the sub-assembler.
     * @private
     */
    _incorporateSubpattern(subAssembler) {
        if (!(subAssembler instanceof PatternAssembler)) {
            console.error("PatternAssembler: Attempted to incorporate a non-PatternAssembler object. Ensure you pass a PatternAssembler instance.");
            return ""; // Return an empty string on invalid input
        }

        const subPatternLiteral = subAssembler.toPatternString();
        const currentGlobalGroupCount = this._groupCounter; // Store the current group count before incorporating
        this._groupCounter += subAssembler._groupCounter;   // Add the sub-assembler's group count to the global total

        // Adjust backreferences within the sub-pattern based on the initial global group count
        return this._adjustGroupReferences(subPatternLiteral, currentGlobalGroupCount);
    }

    /**
     * Modifies numeric backreferences (e.g., `\1`, `\2`) within a given pattern string
     * by adding an `offset`. This is crucial when combining patterns from different builders
     * to ensure backreferences point to the correct groups in the merged pattern.
     * @param {string} patternString The regex pattern string containing backreferences.
     * @param {number} offset The number to add to each group reference index.
     * @returns {string} The pattern string with adjusted backreferences.
     * @private
     */
    _adjustGroupReferences(patternString, offset) {
        if (offset === 0) {
            return patternString; // No adjustment needed if offset is zero
        }

        // Use a regex to find numeric backreferences (e.g., `\1`, `\10`)
        // The `replace` callback captures the digit string and allows arithmetic adjustment.
        return patternString.replace(/\\(\d+)/g, (fullMatch, groupNumberStr) => {
            const originalGroupNumber = parseInt(groupNumberStr, 10);
            const adjustedGroupNumber = originalGroupNumber + offset;
            return `\\${adjustedGroupNumber}`;
        });
    }

    /**
     * Finalizes the pattern construction and returns a new `RegExp` object.
     * This is the terminal method for creating the actual regex instance.
     * @returns {RegExp} The constructed regular expression object.
     */
    toRegExpObject() {
        this._commitPendingSegment(); // Ensure all pending parts are processed and added

        const finalPattern = this._expressionSegments.join("");
        const finalFlags = Array.from(this._patternModifiers).join("");

        if (!finalPattern) {
            // If the pattern string is empty, it typically indicates an issue in construction.
            // An empty regex matches everything, but a warning is appropriate.
            console.warn("PatternAssembler: The generated regular expression pattern is empty. This might not be intended.");
            return new RegExp("", finalFlags);
        }

        return new RegExp(finalPattern, finalFlags);
    }

    /**
     * Adds a single regex modifier (flag) to the pattern's set of modifiers.
     * Ensures that only unique, single-character flags are added.
     * @param {string} modifierChar The single character flag (e.g., 'i' for ignore case, 'm' for multi-line).
     * @returns {PatternAssembler} This instance for chaining.
     * @private
     */
    _applyModifier(modifierChar) {
        if (typeof modifierChar === 'string' && modifierChar.length === 1) {
            this._patternModifiers.add(modifierChar);
        } else {
            console.warn(`PatternAssembler: Attempted to apply an invalid modifier character: "${modifierChar}". Modifiers must be single characters.`);
        }
        return this;
    }

    // --- Public API: Modifiers (Flags) ---

    /**
     * Configures the regex for case-insensitive matching ('i' flag).
     * @returns {PatternAssembler} This instance for chaining.
     */
    caseInsensitive() {
        return this._applyModifier("i");
    }

    /**
     * Enables multi-line mode ('m' flag), which causes `^` and `$` to match
     * the start/end of lines, not just the start/end of the entire input.
     * @returns {PatternAssembler} This instance for chaining.
     */
    multiLineMode() {
        return this._applyModifier("m");
    }

    /**
     * Enables global matching ('g' flag), allowing the regex to find all matches
     * in a string, rather than stopping after the first.
     * @returns {PatternAssembler} This instance for chaining.
     */
    globalSearch() {
        return this._applyModifier("g");
    }

    // --- Public API: Anchors ---

    /**
     * Anchors the pattern to match only at the absolute beginning of the input string (`^`).
     * @returns {PatternAssembler} This instance for chaining.
     */
    atStartOfInput() {
        this._commitPendingSegment(); // Commit any preceding segment before adding the anchor
        this._expressionSegments.push("(?:^)");
        return this;
    }

    /**
     * Anchors the pattern to match at the beginning of any line.
     * Automatically enables `multiLineMode`.
     * @returns {PatternAssembler} This instance for chaining.
     */
    atStartOfLine() {
        this.multiLineMode(); // Ensure multi-line flag is set for `^` to work as expected
        return this.atStartOfInput();
    }

    /**
     * Anchors the pattern to match only at the absolute end of the input string (`$`).
     * @returns {PatternAssembler} This instance for chaining.
     */
    atEndOfInput() {
        this._commitPendingSegment(); // Commit any preceding segment before adding the anchor
        this._expressionSegments.push("(?:$)");
        return this;
    }

    /**
     * Anchors the pattern to match at the end of any line.
     * Automatically enables `multiLineMode`.
     * @returns {PatternAssembler} This instance for chaining.
     */
    atEndOfLine() {
        this.multiLineMode(); // Ensure multi-line flag is set for `$` to work as expected
        return this.atEndOfInput();
    }

    // --- Public API: Alternatives and Lookaheads ---

    /**
     * Starts an alternative group, specifying the first possible pattern to match.
     * Subsequent calls to `orElse` will add more alternatives to this group.
     * @param {(string|PatternAssembler)} pattern The first pattern or literal string for the alternative.
     * @returns {PatternAssembler} This instance for chaining.
     */
    oneOf(pattern) {
        this._commitPendingSegment(); // Commit any non-alternative segments
        const subAssembler = typeof pattern === "string" ? new PatternAssembler().exactlyN(1).matchString(pattern) : pattern;
        this._currentAlternativeParts.push(this._incorporateSubpattern(subAssembler));
        this._segmentStateActive = true; // Mark as active to ensure the alternative group is committed
        return this;
    }

    /**
     * Adds another alternative to the currently open `oneOf` group.
     * If `oneOf` has not been called previously, this will implicitly start a new
     * alternative group, which is a slight deviation from the original's
     * implicit modification of the last literal, but yields clearer behavior.
     * @param {(string|PatternAssembler)} pattern The next pattern or literal string for the alternative.
     * @returns {PatternAssembler} This instance for chaining.
     */
    orElse(pattern) {
        this._commitPendingSegment(); // Commit any non-alternative segments
        if (this._currentAlternativeParts.length === 0) {
            console.warn("PatternAssembler: 'orElse' was called without an active 'oneOf' group. A new alternative block will be started implicitly.");
        }
        const subAssembler = typeof pattern === "string" ? new PatternAssembler().exactlyN(1).matchString(pattern) : pattern;
        this._currentAlternativeParts.push(this._incorporateSubpattern(subAssembler));
        this._segmentStateActive = true; // Mark as active
        return this;
    }

    /**
     * Implements a negative lookahead assertion. The pattern only matches if
     * the given `patternToAvoid` is NOT immediately ahead.
     * This method handles both string literals and `PatternAssembler` instances.
     * @param {(string|PatternAssembler)} patternToAvoid The pattern that should not be ahead.
     * @returns {PatternAssembler} This instance for chaining.
     */
    notFollowedBy(patternToAvoid) {
        // If a string is provided, create a temporary builder for it.
        if (typeof patternToAvoid === "string") {
            return this.notFollowedByAssertion(new PatternAssembler().exactlyN(1).matchString(patternToAvoid));
        }
        return this.notFollowedByAssertion(patternToAvoid);
    }

    /**
     * (Original `nor` method) This method combines a negative lookahead with
     * matching zero or more of any character. It effectively means "match anything
     * that is not followed by the specified pattern."
     * @param {(string|PatternAssembler)} patternToAvoid The pattern that should not be ahead.
     * @returns {PatternAssembler} This instance for chaining.
     */
    norAlso(patternToAvoid) {
        this._commitPendingSegment(); // Commit any pending segment before applying the lookahead
        // This effectively creates a pattern like `(?!patternToAvoid).*`
        this.notFollowedBy(patternToAvoid);
        return this.atLeast(0).anyCharacter();
    }

    // --- Public API: Quantifiers ---

    /**
     * Specifies that the preceding pattern segment must occur exactly `n` times.
     * @param {number} n The precise number of occurrences. Must be a non-negative integer.
     * @returns {PatternAssembler} This instance for chaining.
     */
    exactlyN(n) {
        if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) {
            console.error(`PatternAssembler: 'exactlyN' expects a non-negative integer, but received: ${n}.`);
            return this;
        }
        this._commitPendingSegment(); // Commit previous segment before applying new quantifier
        this._minOccurrences = n;
        this._maxOccurrences = n;
        this._segmentStateActive = true;
        return this;
    }

    /**
     * Specifies that the preceding pattern segment must occur at least `n` times.
     * @param {number} n The minimum number of occurrences. Must be a non-negative integer.
     * @returns {PatternAssembler} This instance for chaining.
     */
    atLeast(n) {
        if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) {
            console.error(`PatternAssembler: 'atLeast' expects a non-negative integer, but received: ${n}.`);
            return this;
        }
        this._commitPendingSegment();
        this._minOccurrences = n;
        this._maxOccurrences = null; // Indicates no upper bound (infinity)
        this._segmentStateActive = true;
        return this;
    }

    /**
     * Specifies that the preceding pattern segment must occur at most `n` times.
     * @param {number} n The maximum number of occurrences. Must be a non-negative integer.
     * @returns {PatternAssembler} This instance for chaining.
     */
    atMost(n) {
        if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) {
            console.error(`PatternAssembler: 'atMost' expects a non-negative integer, but received: ${n}.`);
            return this;
        }
        this._commitPendingSegment();
        this._minOccurrences = null; // Indicates no lower bound (implies 0)
        this._maxOccurrences = n;
        this._segmentStateActive = true;
        return this;
    }

    // --- Public API: Character and Pattern Matching ---

    /**
     * Matches the exact literal string provided. Special regex characters within the string
     * are automatically escaped to ensure they are treated as literals.
     * @param {string} literalString The string to match precisely.
     * @returns {PatternAssembler} This instance for chaining.
     */
    matchString(literalString) {
        if (typeof literalString !== 'string') {
            console.error(`PatternAssembler: 'matchString' expects a string, but received: ${typeof literalString}.`);
            return this;
        }
        this._exactMatchChar = this._escapeRegexSpecialChars(literalString);
        this._segmentStateActive = true;
        return this;
    }

    /**
     * Matches any single character (typically excluding newline, unless 's' flag is set).
     * This corresponds to the `.` regex metacharacter.
     * @returns {PatternAssembler} This instance for chaining.
     */
    anyCharacter() {
        this._matchAnyChar = true;
        this._segmentStateActive = true;
        return this;
    }

    /**
     * Creates a backreference to a previously defined capturing group.
     * For example, `backreferenceTo(1)` refers to the first capturing group.
     * @param {number} groupNumber The 1-based index of the capturing group to reference.
     * @returns {PatternAssembler} This instance for chaining.
     */
    backreferenceTo(groupNumber) {
        this._groupRefIndex = groupNumber;
        this._segmentStateActive = true;
        return this;
    }

    /**
     * Matches any single character that is present within the provided set of characters.
     * Corresponds to `[abc]` syntax.
     * @param {(string|string[])} charSet The characters to include in the set. Can be a string or an array of strings.
     * @returns {PatternAssembler} This instance for chaining.
     */
    fromSet(charSet) {
        let characterSetString;
        if (Array.isArray(charSet)) {
            characterSetString = charSet.join("");
        } else if (typeof charSet === 'string') {
            characterSetString = charSet;
        } else {
            console.error(`PatternAssembler: 'fromSet' expects a string or an array of strings, but received: ${typeof charSet}.`);
            return this;
        }
        this._charSetInclude = this._escapeRegexSpecialChars(characterSetString);
        this._segmentStateActive = true;
        return this;
    }

    /**
     * Matches any single character that is NOT present within the provided set of characters.
     * Corresponds to `[^abc]` syntax.
     * @param {(string|string[])} charSet The characters to exclude from the set. Can be a string or an array of strings.
     * @returns {PatternAssembler} This instance for chaining.
     */
    notFromSet(charSet) {
        let characterSetString;
        if (Array.isArray(charSet)) {
            characterSetString = charSet.join("");
        } else if (typeof charSet === 'string') {
            characterSetString = charSet;
        } else {
            console.error(`PatternAssembler: 'notFromSet' expects a string or an array of strings, but received: ${typeof charSet}.`);
            return this;
        }
        this._charSetExclude = this._escapeRegexSpecialChars(characterSetString);
        this._segmentStateActive = true;
        return this;
    }

    /**
     * Embeds the complete pattern generated by another `PatternAssembler` instance
     * directly into the current pattern. This is useful for building nested patterns.
     * @param {PatternAssembler} subAssembler The `PatternAssembler` instance to embed.
     * @returns {PatternAssembler} This instance for chaining.
     */
    withPattern(subAssembler) {
        this._nestedPattern = this._incorporateSubpattern(subAssembler);
        this._segmentStateActive = true;
        return this;
    }

    /**
     * Makes the preceding quantifier reluctant (non-greedy). For example, `a*?` matches
     * the shortest possible string of 'a's.
     * @returns {PatternAssembler} This instance for chaining.
     */
    asReluctant() {
        this._isReluctant = true;
        this._segmentStateActive = true; // This modifies the current segment's quantifier behavior
        return this;
    }

    /**
     * Implements a positive lookahead assertion `(?=...)`. The pattern only matches if
     * the `lookaheadPattern` IS immediately ahead, but `lookaheadPattern` itself is not consumed.
     * @param {PatternAssembler} lookaheadPattern The `PatternAssembler` instance for the lookahead condition.
     * @returns {PatternAssembler} This instance for chaining.
     */
    followedBy(lookaheadPattern) {
        this._commitPendingSegment(); // Commit any preceding segment before adding the lookahead
        const patternString = this._incorporateSubpattern(lookaheadPattern);
        this._expressionSegments.push(`(?=${patternString})`);
        return this;
    }

    /**
     * Implements a negative lookahead assertion `(?!...)`. The pattern only matches if
     * the `lookaheadPattern` is NOT immediately ahead, and `lookaheadPattern` is not consumed.
     * @param {PatternAssembler} lookaheadPattern The `PatternAssembler` instance for the negative lookahead condition.
     * @returns {PatternAssembler} This instance for chaining.
     */
    notFollowedByAssertion(lookaheadPattern) {
        this._commitPendingSegment();
        const patternString = this._incorporateSubpattern(lookaheadPattern);
        this._expressionSegments.push(`(?!${patternString})`);
        return this;
    }

    /**
     * Designates the current pattern segment as a capturing group.
     * Capturing groups store the matched text for later retrieval (e.g., in `match()` results).
     * @returns {PatternAssembler} This instance for chaining.
     */
    asCapturingGroup() {
        this._shouldCapture = true;
        this._groupCounter++; // Increment the global group counter for this new capturing group
        this._segmentStateActive = true;
        return this;
    }

    // --- Public API: Convenience and Common Patterns ---

    /**
     * Matches the specified string exactly once. A convenient alias for `exactlyN(1).matchString(str)`.
     * @param {string} str The literal string to match.
     * @returns {PatternAssembler} This instance for chaining.
     */
    thenMatch(str) {
        return this.exactlyN(1).matchString(str);
    }

    /**
     * Alias for `thenMatch`. Matches the specified string exactly once.
     * @param {string} str The literal string to locate.
     * @returns {PatternAssembler} This instance for chaining.
     */
    locate(str) {
        return this.thenMatch(str);
    }

    /**
     * Matches one or more characters from the provided set.
     * @param {(string|string[])} charSet The characters to match from.
     * @returns {PatternAssembler} This instance for chaining.
     */
    oneOrMoreFrom(charSet) {
        return this.atLeast(1).fromSet(charSet);
    }

    /**
     * Matches zero or more characters from the provided set.
     * @param {(string|string[])} charSet The characters to match from.
     * @returns {PatternAssembler} This instance for chaining.
     */
    zeroOrMoreFrom(charSet) {
        return this.atLeast(0).fromSet(charSet);
    }

    /**
     * Matches the given string zero or one time, making it an optional match.
     * Alias for `atMost(1).matchString(str)`.
     * @param {string} str The string to match optionally.
     * @returns {PatternAssembler} This instance for chaining.
     */
    optionalMatch(str) {
        return this.atMost(1).matchString(str);
    }

    /**
     * Matches one or more of any character (`.+`).
     * @returns {PatternAssembler} This instance for chaining.
     */
    anyCharOneOrMore() {
        return this.atLeast(1).anyCharacter();
    }

    /**
     * Matches zero or more of any character (`.*`).
     * @returns {PatternAssembler} This instance for chaining.
     */
    anyCharZeroOrMore() {
        return this.atLeast(0).anyCharacter();
    }

    /**
     * Matches zero or more of any character, but only if the `exclusionPattern` is NOT ahead.
     * This is a common pattern for "match anything until X".
     * @param {(string|PatternAssembler)} exclusionPattern The pattern that should not be ahead.
     * @returns {PatternAssembler} This instance for chaining.
     */
    anyCharExcept(exclusionPattern) {
        this.notFollowedBy(exclusionPattern); // Applies a negative lookahead
        return this.anyCharZeroOrMore();      // Then matches zero or more of any character
    }

    /**
     * Matches any single character exactly once (`.`).
     * @returns {PatternAssembler} This instance for chaining.
     */
    singleAnyChar() {
        return this.exactlyN(1).anyCharacter();
    }

    /**
     * Matches a common line break sequence (`\r\n`, `\r`, or `\n`).
     * @returns {PatternAssembler} This instance for chaining.
     */
    lineSeparator() {
        this._commitPendingSegment();
        this._expressionSegments.push("(?:\\r\\n|\\r|\\n)");
        return this;
    }

    /**
     * Matches one or more common line break sequences.
     * @returns {PatternAssembler} This instance for chaining.
     */
    multipleLineSeparators() {
        // Embeds a single lineSeparator pattern and applies 'atLeast(1)'
        return this.withPattern(new PatternAssembler().lineSeparator()).atLeast(1);
    }

    /**
     * Matches a single whitespace character (`\s`).
     * If no quantifier is explicitly set, it defaults to matching exactly one.
     * If a quantifier is active, it applies to `\s`.
     * @returns {PatternAssembler} This instance for chaining.
     */
    whitespaceChar() {
        return this._handleSingleCharType("\\s");
    }

    /**
     * Matches a single non-whitespace character (`\S`).
     * If no quantifier is explicitly set, it defaults to matching exactly one.
     * If a quantifier is active, it applies to `\S`.
     * @returns {PatternAssembler} This instance for chaining.
     */
    nonWhitespaceChar() {
        return this._handleSingleCharType("\\S");
    }

    /**
     * Matches a single tab character (`\t`).
     * @returns {PatternAssembler} This instance for chaining.
     */
    tabChar() {
        this._commitPendingSegment();
        this._expressionSegments.push("(?:\\t)");
        return this;
    }

    /**
     * Matches one or more tab characters.
     * @returns {PatternAssembler} This instance for chaining.
     */
    multipleTabChars() {
        return this.withPattern(new PatternAssembler().tabChar()).atLeast(1);
    }

    /**
     * Matches a single digit character (`\d`).
     * @returns {PatternAssembler} This instance for chaining.
     */
    singleDigit() {
        this._commitPendingSegment();
        this._expressionSegments.push("(?:\\d)");
        return this;
    }

    /**
     * Matches a single non-digit character (`\D`).
     * @returns {PatternAssembler} This instance for chaining.
     */
    singleNonDigit() {
        this._commitPendingSegment();
        this._expressionSegments.push("(?:\\D)");
        return this;
    }

    /**
     * Matches one or more digit characters.
     * @returns {PatternAssembler} This instance for chaining.
     */
    multipleDigits() {
        return this.withPattern(new PatternAssembler().singleDigit()).atLeast(1);
    }

    /**
     * Matches one or more non-digit characters.
     * @returns {PatternAssembler} This instance for chaining.
     */
    multipleNonDigits() {
        return this.withPattern(new PatternAssembler().singleNonDigit()).atLeast(1);
    }

    /**
     * Matches a single letter (A-Z or a-z).
     * @returns {PatternAssembler} This instance for chaining.
     */
    singleLetter() {
        return this.exactlyN(1).fromSet("A-Za-z");
    }

    /**
     * Matches a single character that is not a letter.
     * @returns {PatternAssembler} This instance for chaining.
     */
    singleNonLetter() {
        return this.exactlyN(1).notFromSet("A-Za-z");
    }

    /**
     * Matches one or more letter characters.
     * @returns {PatternAssembler} This instance for chaining.
     */
    multipleLetters() {
        return this.atLeast(1).fromSet("A-Za-z");
    }

    /**
     * Matches one or more non-letter characters.
     * @returns {PatternAssembler} This instance for chaining.
     */
    multipleNonLetters() {
        return this.atLeast(1).notFromSet("A-Za-z");
    }

    /**
     * Matches a single lowercase letter (a-z).
     * @returns {PatternAssembler} This instance for chaining.
     */
    singleLowercaseLetter() {
        return this.exactlyN(1).fromSet("a-z");
    }

    /**
     * Matches one or more lowercase letters.
     * @returns {PatternAssembler} This instance for chaining.
     */
    multipleLowercaseLetters() {
        return this.atLeast(1).fromSet("a-z");
    }

    /**
     * Matches a single uppercase letter (A-Z).
     * @returns {PatternAssembler} This instance for chaining.
     */
    singleUppercaseLetter() {
        return this.exactlyN(1).fromSet("A-Z");
    }

    /**
     * Matches one or more uppercase letters.
     * @returns {PatternAssembler} This instance for chaining.
     */
    multipleUppercaseLetters() {
        return this.atLeast(1).fromSet("A-Z");
    }

    /**
     * Appends a sub-pattern to the current pattern, ensuring it matches exactly once.
     * Alias for `exactlyN(1).withPattern(subAssembler)`.
     * @param {PatternAssembler} subAssembler The pattern to append.
     * @returns {PatternAssembler} This instance for chaining.
     */
    appendPattern(subAssembler) {
        return this.exactlyN(1).withPattern(subAssembler);
    }

    /**
     * Makes a sub-pattern optional (matches zero or one time).
     * Alias for `atMost(1).withPattern(subAssembler)`.
     * @param {PatternAssembler} subAssembler The pattern to make optional.
     * @returns {PatternAssembler} This instance for chaining.
     */
    optionalGroup(subAssembler) {
        return this.atMost(1).withPattern(subAssembler);
    }

    /**
     * Helper method to streamline the handling of single-character regex types (like `\s`, `\d`).
     * It intelligently applies quantifiers if they are set, or defaults to a single match.
     * @param {string} charType The regex character type string (e.g., "\\s", "\\d").
     * @returns {PatternAssembler} This instance for chaining.
     * @private
     */
    _handleSingleCharType(charType) {
        this._commitPendingSegment(); // Commit any previous segment

        // If no quantifier (min/max) is set, it implies an exact match of one.
        if (this._minOccurrences === null && this._maxOccurrences === null) {
            this._expressionSegments.push(`(?:${charType})`);
            this._resetCurrentSegmentState(); // The segment is fully committed, so reset its state
        } else {
            // If a quantifier is active, set the character type as a nested pattern
            // so that `_constructSegmentString` can wrap it and apply the quantifier.
            this._nestedPattern = charType;
            this._segmentStateActive = true; // Mark as active for `_commitPendingSegment`
        }
        return this;
    }

    /**
     * Escapes special regular expression characters within a given string.
     * This ensures the string is treated as a literal sequence in the regex pattern.
     * @param {string} inputString The string containing characters that might need escaping.
     * @returns {string} The input string with special regex characters escaped.
     * @private
     */
    _escapeRegexSpecialChars(inputString) {
        // Regex to match characters that have special meaning in regular expressions
        // The `$&` in the replacement string inserts the matched substring itself.
        return inputString.replace(/[.*+?^=!:${}()|[\]/\\]/g, "\\$&");
    }
}

// Node.js or similar environment (CommonJS)
if (typeof exports !== 'undefined') {
    /**
     * Factory function to create a new PatternAssembler instance.
     * This is the recommended way to start building a new regex.
     * @returns {PatternAssembler} A new instance of PatternAssembler.
     */
    exports.create = () => new PatternAssembler();

    // Export individual chainable methods as convenient starting points.
    // Each of these methods returns a new PatternAssembler instance initialized with that specific step.
    exports.caseInsensitive = () => new PatternAssembler().caseInsensitive();
    exports.multiLineMode = () => new PatternAssembler().multiLineMode();
    exports.globalSearch = () => new PatternAssembler().globalSearch();
    exports.atStartOfInput = () => new PatternAssembler().atStartOfInput();
    exports.atStartOfLine = () => new PatternAssembler().atStartOfLine();
    exports.atEndOfInput = () => new PatternAssembler().atEndOfInput();
    exports.atEndOfLine = () => new PatternAssembler().atEndOfLine();
    exports.oneOf = (pattern) => new PatternAssembler().oneOf(pattern);
    exports.notFollowedBy = (pattern) => new PatternAssembler().notFollowedBy(pattern);
    exports.exactlyN = (n) => new PatternAssembler().exactlyN(n);
    exports.atLeast = (n) => new PatternAssembler().atLeast(n);
    exports.atMost = (n) => new PatternAssembler().atMost(n);
    exports.followedBy = (pattern) => new PatternAssembler().followedBy(pattern);
    exports.notFollowedByAssertion = (pattern) => new PatternAssembler().notFollowedByAssertion(pattern);
    exports.thenMatch = (str) => new PatternAssembler().thenMatch(str);
    exports.locate = (str) => new PatternAssembler().locate(str);
    exports.oneOrMoreFrom = (charSet) => new PatternAssembler().oneOrMoreFrom(charSet);
    exports.zeroOrMoreFrom = (charSet) => new PatternAssembler().zeroOrMoreFrom(charSet);
    exports.optionalMatch = (str) => new PatternAssembler().optionalMatch(str);

    // Also export the class constructor itself, for direct instantiation if preferred.
    exports.PatternAssembler = PatternAssembler;
} else {
    // Browser environment (or similar, where `exports` is not defined)
    // Expose a global object for the API, to avoid polluting the global namespace directly.
    if (typeof window !== 'undefined') {
        window.RegExAssembler = {};
        const globalAssembler = window.RegExAssembler;

        globalAssembler.create = () => new PatternAssembler();
        globalAssembler.caseInsensitive = () => new PatternAssembler().caseInsensitive();
        globalAssembler.multiLineMode = () => new PatternAssembler().multiLineMode();
        globalAssembler.globalSearch = () => new PatternAssembler().globalSearch();
        globalAssembler.atStartOfInput = () => new PatternAssembler().atStartOfInput();
        globalAssembler.atStartOfLine = () => new PatternAssembler().atStartOfLine();
        globalAssembler.atEndOfInput = () => new PatternAssembler().atEndOfInput();
        globalAssembler.atEndOfLine = () => new PatternAssembler().atEndOfLine();
        globalAssembler.oneOf = (p) => new PatternAssembler().oneOf(p);
        globalAssembler.notFollowedBy = (p) => new PatternAssembler().notFollowedBy(p);
        globalAssembler.exactlyN = (n) => new PatternAssembler().exactlyN(n);
        globalAssembler.atLeast = (n) => new PatternAssembler().atLeast(n);
        globalAssembler.atMost = (n) => new PatternAssembler().atMost(n);
        globalAssembler.followedBy = (p) => new PatternAssembler().followedBy(p);
        globalAssembler.notFollowedByAssertion = (p) => new PatternAssembler().notFollowedByAssertion(p);
        globalAssembler.thenMatch = (s) => new PatternAssembler().thenMatch(s);
        globalAssembler.locate = (s) => new PatternAssembler().locate(s);
        globalAssembler.oneOrMoreFrom = (s) => new PatternAssembler().oneOrMoreFrom(s);
        globalAssembler.zeroOrMoreFrom = (s) => new PatternAssembler().zeroOrMoreFrom(s);
        globalAssembler.optionalMatch = (s) => new PatternAssembler().optionalMatch(s);
        globalAssembler.PatternAssembler = PatternAssembler; // Also expose the class
    }
}