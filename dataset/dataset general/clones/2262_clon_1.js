// This is an extensively modified Type I clone of the original JavaScript code.
// No functional changes have been made; only whitespace and comments have been altered.
// The purpose of this file is to demonstrate a visual difference while retaining exact logical equivalence.

/*
 * RegExpBuilder: A utility class for constructing regular expressions programmatically.
 * This constructor initializes the internal state for building a regex pattern.
 */
var RegExpBuilder = function()
{
    // Initialize flags for the regular expression (e.g., 'i' for ignoreCase, 'm' for multiLine).
    this._flags      =  "";

    // This array will store the individual parts of the regular expression literal.
    this._literal    =  [];

    // Counter for managing group numbering, especially for nested builders.
    this._groupsUsed =  0;


    // Call the internal _clear method to reset the state for the current segment.
    this._clear();
}; // End of RegExpBuilder constructor definition.


// 'self' is a common pattern to reference the prototype of the constructor.
// This allows for cleaner method definitions on the prototype chain.
var self = RegExpBuilder.prototype;



/**
 * @private
 * Resets the internal state variables used for building a single regex segment.
 * This method is called after a segment has been flushed to the _literal array.
 */
self._clear = function()
{
    // Minimum quantity for the preceding token (e.g., in {min,max}).
    this._min       =   -1;

    // Maximum quantity for the preceding token.
    this._max       =   -1;

    // Specific string to match.
    this._of        =   "";

    // Flag to indicate matching any character ('.').
    this._ofAny     =   false;

    // Reference to a captured group by its number.
    this._ofGroup   =   -1;

    // Characters to match from a set (e.g., '[abc]').
    this._from      =   "";

    // Characters *not* to match from a set (e.g., '[^abc]').
    this._notFrom   =   "";

    // A pre-built regex literal or a reference to another builder's literal.
    this._like      =   "";

    // Stores the first part of an 'either/or' construct.
    this._either    =   "";

    // Flag for reluctant quantifiers (e.g., '??', '*?').
    this._reluctant =   false;

    // Flag to indicate if the current segment should be a capturing group.
    this._capture   =   false;
}; // End of _clear method.



/*
 * @private
 * Flushes the current pending state into the _literal array as a regex segment.
 * This method is crucial for combining various state settings into a single, valid regex part.
 */
self._flushState = function()
{
    // Only flush if there's an active state that needs to be converted into a literal.
    if  (
            this._of != "" ||
            this._ofAny ||
            this._ofGroup > 0 ||
            this._from != "" ||
            this._notFrom != "" ||
            this._like != ""
        )
    {
        // Determine if the group should be capturing or non-capturing.
        var captureLiteral   = this._capture ? "" : "?:";

        // Get the quantity part (e.g., {1,5}, *, +).
        var quantityLiteral  = this._getQuantityLiteral();

        // Get the character part (e.g., "a", ".", "[abc]").
        var characterLiteral = this._getCharacterLiteral();

        // Get the reluctant quantifier part, if applicable.
        var reluctantLiteral = this._reluctant ? "?" : "";

        // Push the combined segment into the literal array.
        // The structure is typically: (captureLiteral(?:characterLiteral)quantityLiteralreluctantLiteral)
        this._literal.push(
            "(" +
            captureLiteral +
            "(?:" +
            characterLiteral +
            ")" +
            quantityLiteral +
            reluctantLiteral +
            ")"
        );

        // After flushing, clear the state for the next segment.
        this._clear();
    }
}; // End of _flushState method.



// @private
// Generates the quantity part of a regex literal based on _min and _max.
// Examples: "{1,}", "{0,5}", "{3,5}".
self._getQuantityLiteral = function()
{
    // If a minimum is specified.
    if (this._min != -1)
    {
        // If both minimum and maximum are specified.
        if (this._max != -1)
        {
            return "{" + this._min + "," + this._max + "}";
        }

        // Only minimum is specified (e.g., 'at least min').
        return "{" + this._min + ",}";
    }

    // If only maximum is specified (implies min=0, e.g., 'at most max').
    return "{0," + this._max + "}";
}; // End of _getQuantityLiteral method.



// @private
// Generates the character part of a regex literal based on various _of, _ofAny, _from, etc. properties.
self._getCharacterLiteral = function()
{
    // Match a specific string.
    if (this._of != "")
    {
        return this._of;
    }

    // Match any character ('.').
    if (this._ofAny)
    {
        return ".";
    }

    // Match a backreference to a group.
    if (this._ofGroup > 0)
    {
        return "\\" + this._ofGroup;
    }

    // Match from a character set.
    if (this._from != "")
    {
        return "[" + this._from + "]";
    }

    // Match not from a character set.
    if (this._notFrom != "")
    {
        return "[^" + this._notFrom + "]";
    }

    // Match a pre-defined literal or another regex builder's output.
    if (this._like != "")
    {
        return this._like;
    }
}; // End of _getCharacterLiteral method.



/*
 * Public method: getLiteral
 * Returns the raw regular expression string built so far.
 * It ensures any pending state is flushed before returning the joined literal parts.
 */
self.getLiteral = function()
{
    // Flush any pending state into the literal array.
    this._flushState();

    // Join all parts of the literal array to form the complete regex string.
    return this._literal.join("");
}; // End of getLiteral method.



// @private
// Combines group numbering when incorporating another RegExpBuilder's literal.
// This ensures group references are correctly re-indexed if necessary.
self._combineGroupNumberingAndGetLiteral = function(r)
{
    // Get the literal from the other RegExpBuilder instance and increment its group numbers.
    var literal = this._incrementGroupNumbering(r.getLiteral(), this._groupsUsed);

    // Update the total count of groups used in this builder.
    this._groupsUsed += r._groupsUsed;

    // Return the modified literal.
    return literal;
}; // End of _combineGroupNumberingAndGetLiteral method.



// @private
// Increments group references within a regex literal by a given amount.
// This is used when embedding one regex into another to avoid group number collisions.
self._incrementGroupNumbering = function(literal, increment)
{
    // Only proceed if an increment is needed.
    if (increment > 0)
    {
        // Use a regex to find backreferences (e.g., '\1', '\2').
        // The regex `/[^\\]\\\d+/g` specifically looks for `\` followed by digits,
        // ensuring it's not a double-escaped backslash `\\`
        literal = literal.replace(/[^\\]\\\d+/g, function(groupReference)
        {
            // Extract the group number (e.g., '1' from '\1').
            var groupNumber = parseInt(groupReference.substring(2)) + increment;

            // Reconstruct the backreference with the new number.
            return groupReference.substring(0, 2) + groupNumber;
        });
    }

    // Return the literal with potentially incremented group numbers.
    return literal;
}; // End of _incrementGroupNumbering method.



/*
 * Public method: getRegExp
 * Returns a new RegExp object based on the constructed pattern and flags.
 */
self.getRegExp = function()
{
    // Ensure all pending state is processed.
    this._flushState();

    // Create and return a new RegExp object.
    return new RegExp(this._literal.join(""), this._flags);
}; // End of getRegExp method.



// @private
// Adds a flag to the regular expression if it's not already present.
self._addFlag = function(flag)
{
    // Check if the flag already exists.
    if (this._flags.indexOf(flag) == -1)
    {
        // If not, append it.
        this._flags += flag;
    }

    // Allows for method chaining.
    return this;
}; // End of _addFlag method.



// Public method: ignoreCase
// Sets the 'i' flag for case-insensitive matching.
self.ignoreCase = function()
{
    return this._addFlag("i");
}; // End of ignoreCase method.



// Public method: multiLine
// Sets the 'm' flag for multi-line matching (affects ^ and $).
self.multiLine = function()
{
    return this._addFlag("m");
}; // End of multiLine method.



// Public method: globalMatch
// Sets the 'g' flag for global matching (finds all occurrences, not just the first).
self.globalMatch = function()
{
    return this._addFlag("g");
}; // End of globalMatch method.



// Public method: startOfInput
// Adds the '^' anchor to match the beginning of the input string.
self.startOfInput = function()
{
    // Directly push the non-capturing group for start of input.
    this._literal.push("(?:^)");

    return this;
}; // End of startOfInput method.



// Public method: startOfLine
// Combines multiLine flag with startOfInput to match the beginning of a line.
self.startOfLine = function()
{
    // Enable multi-line mode.
    this.multiLine();

    // Add the start-of-input/line anchor.
    return this.startOfInput();
}; // End of startOfLine method.



// Public method: endOfInput
// Adds the '$' anchor to match the end of the input string.
self.endOfInput = function()
{
    // Flush any pending state before adding the anchor.
    this._flushState();

    // Directly push the non-capturing group for end of input.
    this._literal.push("(?:$)");

    return this;
}; // End of endOfInput method.



// Public method: endOfLine
// Combines multiLine flag with endOfInput to match the end of a line.
self.endOfLine = function()
{
    // Enable multi-line mode.
    this.multiLine();

    // Add the end-of-input/line anchor.
    return this.endOfInput();
}; // End of endOfLine method.



// Public method: either
// Starts an 'OR' condition. Can take a string or another RegExpBuilder instance.
self.either = function(r)
{
    // If 'r' is a string, wrap it in a new RegExpBuilder.
    if (typeof r == "string")
    {
        return this._eitherLike(new RegExpBuilder().exactly(1).of(r));
    }
    // If 'r' is already a RegExpBuilder instance.
    else
    {
        return this._eitherLike(r);
    }
}; // End of either method.



// @private
// Internal helper for 'either' logic.
self._eitherLike = function(r)
{
    // Flush existing state before starting an 'either' block.
    this._flushState();

    // Store the literal from the first 'either' part.
    this._either = this._combineGroupNumberingAndGetLiteral(r);

    return this;
}; // End of _eitherLike method.



// Public method: or
// Continues an 'OR' condition. Can take a string or another RegExpBuilder instance.
self.or = function(r)
{
    // If 'r' is a string, wrap it in a new RegExpBuilder.
    if (typeof r == "string")
    {
        return this._orLike(new RegExpBuilder().exactly(1).of(r));
    }
    // If 'r' is already a RegExpBuilder instance.
    else
    {
        return this._orLike(r);
    }
}; // End of or method.



// @private
// Internal helper for 'or' logic.
self._orLike = function(r)
{
    var either = this._either;
    var or     = this._combineGroupNumberingAndGetLiteral(r);

    // If this is the first 'or' after an 'either'.
    if (either == "")
    {
        // Get the last added literal, which should be the previous 'either' or 'or' block.
        var lastOr = this._literal[this._literal.length - 1];

        // Remove the closing parenthesis from the last block to insert the '|' and the new 'or' block.
        lastOr = lastOr.substring(0, lastOr.length - 1);
        this._literal[this._literal.length - 1] = lastOr;

        // Append the 'or' operator and the new alternative, closing the group.
        this._literal.push("|(?:" + or + "))");
    }
    // If this is the first 'or' and no 'either' was explicitly called (e.g., `RegExpBuilder().or(r1).or(r2)`).
    else
    {
        // Combine the 'either' part with the 'or' part using a non-capturing group.
        this._literal.push("(?:(?:" + either + ")|(?:" + or + "))");
    }

    // Clear the state as the 'either/or' block is now formed.
    this._clear();

    return this;
}; // End of _orLike method.



// Public method: neither
// Sets up a negative lookahead assertion. Can take a string or another RegExpBuilder.
self.neither = function(r)
{
    // If 'r' is a string, convert it to a RegExpBuilder.
    if (typeof r == "string")
    {
        return this.notAhead(new RegExpBuilder().exactly(1).of(r));
    }

    // Otherwise, directly pass the RegExpBuilder instance to notAhead.
    return this.notAhead(r);
}; // End of neither method.



// Public method: nor
// Combines 'neither' with matching zero or more of any character.
// Often used to say "match anything except this pattern".
self.nor = function(r)
{
    // Reset min/ofAny if they were set to a specific "anything" state.
    if (this._min == 0 && this._ofAny)
    {
        this._min = -1;
        this._ofAny = false;
    }

    // Apply the negative lookahead.
    this.neither(r);

    // Then match zero or more of any character following the lookahead.
    return this.min(0).ofAny();
}; // End of nor method.



// Public method: exactly
// Specifies an exact quantity 'n' for the preceding token.
self.exactly = function(n)
{
    // Flush any pending state.
    this._flushState();

    // Set both min and max to 'n'.
    this._min = n;
    this._max = n;

    return this;
}; // End of exactly method.



// Public method: min
// Specifies a minimum quantity 'n' for the preceding token.
self.min = function(n)
{
    // Flush any pending state.
    this._flushState();

    // Set the minimum quantity.
    this._min = n;

    return this;
}; // End of min method.



// Public method: max
// Specifies a maximum quantity 'n' for the preceding token.
self.max = function(n)
{
    // Flush any pending state.
    this._flushState();

    // Set the maximum quantity.
    this._max = n;

    return this;
}; // End of max method.



// Public method: of
// Specifies a literal string 's' to match.
self.of = function(s)
{
    // Sanitize the string to escape special regex characters.
    this._of = this._sanitize(s);

    return this;
}; // End of of method.



// Public method: ofAny
// Specifies to match any single character ('.').
self.ofAny = function()
{
    this._ofAny = true;

    return this;
}; // End of ofAny method.



// Public method: ofGroup
// Specifies to match a backreference to a previously captured group 'n'.
self.ofGroup = function(n)
{
    this._ofGroup = n;

    return this;
}; // End of ofGroup method.



// Public method: from
// Specifies to match any character from the provided set 's'.
self.from = function(s)
{
    // Sanitize the joined string of characters.
    this._from = this._sanitize(s.join(""));

    return this;
}; // End of from method.



// Public method: notFrom
// Specifies to match any character *not* from the provided set 's'.
self.notFrom = function(s)
{
    // Sanitize the joined string of characters.
    this._notFrom = this._sanitize(s.join(""));

    return this;
}; // End of notFrom method.



// Public method: like
// Specifies to match a pattern generated by another RegExpBuilder 'r'.
self.like = function(r)
{
    // Combine group numbering and get the literal from the other builder.
    this._like = this._combineGroupNumberingAndGetLiteral(r);

    return this;
}; // End of like method.



// Public method: reluctantly
// Makes the preceding quantifier reluctant (non-greedy).
self.reluctantly = function()
{
    this._reluctant = true;

    return this;
}; // End of reluctantly method.



// Public method: ahead
// Adds a positive lookahead assertion `(?=r)` where 'r' is another RegExpBuilder.
self.ahead = function(r)
{
    // Flush any current state.
    this._flushState();

    // Push the lookahead assertion.
    this._literal.push("(?=" + this._combineGroupNumberingAndGetLiteral(r) + ")");

    return this;
}; // End of ahead method.



// Public method: notAhead
// Adds a negative lookahead assertion `(?!r)` where 'r' is another RegExpBuilder.
self.notAhead = function(r)
{
    // Flush any current state.
    this._flushState();

    // Push the negative lookahead assertion.
    this._literal.push("(?!" + this._combineGroupNumberingAndGetLiteral(r) + ")");

    return this;
}; // End of notAhead method.



// Public method: asGroup
// Makes the current regex segment a capturing group.
self.asGroup = function()
{
    this._capture = true;

    // Increment the group counter.
    this._groupsUsed++;

    return this;
}; // End of asGroup method.



// Public method: then
// Syntactic sugar for `exactly(1).of(s)`.
self.then = function(s)
{
    return this.exactly(1).of(s);
}; // End of then method.



// Public method: find
// Alias for `then(s)`.
self.find = function(s)
{
    return this.then(s);
}; // End of find method.



// Public method: some
// Syntactic sugar for `min(1).from(s)`. Matches one or more characters from set 's'.
self.some = function(s)
{
    return this.min(1).from(s);
}; // End of some method.



// Public method: maybeSome
// Syntactic sugar for `min(0).from(s)`. Matches zero or more characters from set 's'.
self.maybeSome = function(s)
{
    return this.min(0).from(s);
}; // End of maybeSome method.



// Public method: maybe
// Syntactic sugar for `max(1).of(s)`. Matches zero or one occurrence of 's'.
self.maybe = function(s)
{
    return this.max(1).of(s);
}; // End of maybe method.



// Public method: something
// Syntactic sugar for `min(1).ofAny()`. Matches one or more of any character.
self.something = function()
{
    return this.min(1).ofAny();
}; // End of something method.



// Public method: anything
// Syntactic sugar for `min(0).ofAny()`. Matches zero or more of any character.
self.anything = function()
{
    return this.min(0).ofAny();
}; // End of anything method.



// Public method: anythingBut
// Matches anything except a specific string 's'.
self.anythingBut = function(s)
{
    // If 's' is a single character, use the simpler `notFrom` approach.
    if (s.length == 1)
    {
        return this.min(0).notFrom([s]);
    }

    // Otherwise, use a negative lookahead for the string 's', then match anything.
    this.notAhead(new RegExpBuilder().exactly(1).of(s));

    return this.min(0).ofAny();
}; // End of anythingBut method.



// Public method: any
// Syntactic sugar for `exactly(1).ofAny()`. Matches any single character.
self.any = function()
{
    return this.exactly(1).ofAny();
}; // End of any method.



// Public method: lineBreak
// Adds a pattern to match common line break sequences.
self.lineBreak = function()
{
    // Flush existing state.
    this._flushState();

    // Push the line break pattern.
    this._literal.push("(?:\\r\\n|\\r|\\n)");

    return this;
}; // End of lineBreak method.



// Public method: lineBreaks
// Matches one or more line breaks.
self.lineBreaks = function()
{
    // Uses 'like' to apply quantity to the lineBreak pattern.
    return this.like(new RegExpBuilder().lineBreak());
}; // End of lineBreaks method.



// Public method: whitespace
// Matches a single whitespace character (`\s`).
self.whitespace = function()
{
    // If no quantity is specified, directly add `\s`.
    if (this._min == -1 && this._max == -1)
    {
        this._flushState();
        this._literal.push("(?:\\s)");
        return this;
    }

    // Otherwise, set `_like` to `\s` to allow quantity to be applied.
    this._like = "\\s";

    return this;
}; // End of whitespace method.



// Public method: notWhitespace
// Matches a single non-whitespace character (`\S`).
self.notWhitespace = function()
{
    // If no quantity is specified, directly add `\S`.
    if (this._min == -1 && this._max == -1)
    {
        this._flushState();
        this._literal.push("(?:\\S)");
        return this;
    }

    // Otherwise, set `_like` to `\S` to allow quantity to be applied.
    this._like = "\\S";

    return this;
}; // End of notWhitespace method.



// Public method: tab
// Matches a single tab character (`\t`).
self.tab = function()
{
    // Flush existing state.
    this._flushState();

    // Push the tab character pattern.
    this._literal.push("(?:\\t)");

    return this;
}; // End of tab method.



// Public method: tabs
// Matches one or more tab characters.
self.tabs = function()
{
    // Uses 'like' to apply quantity to the tab pattern.
    return this.like(new RegExpBuilder().tab());
}; // End of tabs method.



// Public method: digit
// Matches a single digit character (`\d`).
self.digit = function()
{
    // Flush existing state.
    this._flushState();

    // Push the digit character pattern.
    this._literal.push("(?:\\d)");

    return this;
}; // End of digit method.



// Public method: notDigit
// Matches a single non-digit character (`\D`).
self.notDigit = function()
{
    // Flush existing state.
    this._flushState();

    // Push the non-digit character pattern.
    this._literal.push("(?:\\D)");

    return this;
}; // End of notDigit method.



// Public method: digits
// Matches one or more digit characters.
self.digits = function()
{
    // Uses 'like' to apply quantity to the digit pattern.
    return this.like(new RegExpBuilder().digit());
}; // End of digits method.



// Public method: notDigits
// Matches one or more non-digit characters.
self.notDigits = function()
{
    // Uses 'like' to apply quantity to the notDigit pattern.
    return this.like(new RegExpBuilder().notDigit());
}; // End of notDigits method.



// Public method: letter
// Matches a single letter (case-insensitive ASCII).
self.letter = function()
{
    // Ensures exactly one occurrence.
    this.exactly(1);

    // Sets the character range for letters.
    this._from = "A-Za-z";

    return this;
}; // End of letter method.



// Public method: notLetter
// Matches a single non-letter (case-insensitive ASCII).
self.notLetter = function()
{
    // Ensures exactly one occurrence.
    this.exactly(1);

    // Sets the character range for non-letters.
    this._notFrom = "A-Za-z";

    return this;
}; // End of notLetter method.



// Public method: letters
// Matches one or more letters (case-insensitive ASCII).
self.letters = function()
{
    // Sets the character range for letters (quantity will be applied by min/max).
    this._from = "A-Za-z";

    return this;
}; // End of letters method.



// Public method: notLetters
// Matches one or more non-letters (case-insensitive ASCII).
self.notLetters = function()
{
    // Sets the character range for non-letters (quantity will be applied by min/max).
    this._notFrom = "A-Za-z";

    return this;
}; // End of notLetters method.



// Public method: lowerCaseLetter
// Matches a single lowercase letter.
self.lowerCaseLetter = function()
{
    // Ensures exactly one occurrence.
    this.exactly(1);

    // Sets the character range for lowercase letters.
    this._from = "a-z";

    return this;
}; // End of lowerCaseLetter method.



// Public method: lowerCaseLetters
// Matches one or more lowercase letters.
self.lowerCaseLetters = function()
{
    // Sets the character range for lowercase letters (quantity will be applied by min/max).
    this._from = "a-z";

    return this;
}; // End of lowerCaseLetters method.



// Public method: upperCaseLetter
// Matches a single uppercase letter.
self.upperCaseLetter = function()
{
    // Ensures exactly one occurrence.
    this.exactly(1);

    // Sets the character range for uppercase letters.
    this._from = "A-Z";

    return this;
}; // End of upperCaseLetter method.



// Public method: upperCaseLetters
// Matches one or more uppercase letters.
self.upperCaseLetters = function()
{
    // Sets the character range for uppercase letters (quantity will be applied by min/max).
    this._from = "A-Z";

    return this;
}; // End of upperCaseLetters method.



// Public method: append
// Appends another RegExpBuilder's pattern with an implicit exactly(1) quantity.
self.append = function(r)
{
    // Ensures it's treated as a single occurrence.
    this.exactly(1);

    // Incorporates the other builder's literal.
    this._like = this._combineGroupNumberingAndGetLiteral(r);

    return this;
}; // End of append method.



// Public method: optional
// Makes another RegExpBuilder's pattern optional (zero or one occurrence).
self.optional = function(r)
{
    // Sets the maximum quantity to one (making it optional).
    this.max(1);

    // Incorporates the other builder's literal.
    this._like = this._combineGroupNumberingAndGetLiteral(r);

    return this;
}; // End of optional method.



// @private
// Escapes special regular expression characters in a string.
self._sanitize = function(s)
{
    // Regex to find special characters needing escaping.
    return s.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}; // End of _sanitize method.



// Exporting functions for CommonJS/Node.js compatibility.
// If 'exports' is undefined (e.g., in a browser environment), initialize it.
if ( typeof exports == 'undefined' )
{
    exports = {};
}


// Exported helper functions that create a new RegExpBuilder and call a method on it.

// Helper for ignoreCase.
exports.ignoreCase = function()
{
    return new RegExpBuilder().ignoreCase();
};

// Helper for multiLine.
exports.multiLine = function()
{
    return new RegExpBuilder().multiLine();
};

// Helper for globalMatch.
exports.globalMatch = function()
{
    return new RegExpBuilder().globalMatch();
};

// Helper for startOfInput.
exports.startOfInput = function()
{
    return new RegExpBuilder().startOfInput();
};

// Helper for startOfLine.
exports.startOfLine = function()
{
    return new RegExpBuilder().startOfLine();
};

// Helper for endOfInput.
exports.endOfInput = function()
{
    return new RegExpBuilder().endOfInput();
};

// Helper for endOfLine.
exports.endOfLine = function()
{
    return new RegExpBuilder().endOfLine();
};

// Helper for either.
exports.either = function(r)
{
    return new RegExpBuilder().either(r);
};

// Helper for neither.
exports.neither = function(r)
{
    return new RegExpBuilder().neither(r);
};

// Helper for exactly.
exports.exactly = function(n)
{
    return new RegExpBuilder().exactly(n);
};

// Helper for min.
exports.min = function(n)
{
    return new RegExpBuilder().min(n);
};

// Helper for max.
exports.max = function(n)
{
    return new RegExpBuilder().max(n);
};

// Helper for ahead.
exports.ahead = function(r)
{
    return new RegExpBuilder().ahead(r);
};

// Helper for notAhead.
exports.notAhead = function(r)
{
    return new RegExpBuilder().notAhead(r);
};

// Helper for then.
exports.then = function(s)
{
    return new RegExpBuilder().then(s);
};

// Helper for find.
exports.find = function(s)
{
    return new RegExpBuilder().find(s);
};

// Helper for some.
exports.some = function(s)
{
    return new RegExpBuilder().some(s);
};

// Helper for maybeSome.
exports.maybeSome = function(s)
{
    return new RegExpBuilder().maybeSome(s);
};

// Helper for maybe.
exports.maybe = function(s)
{
    return new RegExpBuilder().maybe(s);
};
// End of exported functions.