const statementAnalyzer = {};

// Helper class to manage input string and cursor position
class SourceReader {
    constructor(sourceText) {
        this.fullContent = sourceText;
        this.currentPosition = 0;
    }

    // Checks if the remaining content at the current position starts with a given prefix string.
    beginsWith(prefix) {
        return this.fullContent.substring(this.currentPosition, this.currentPosition + prefix.length) === prefix;
    }

    // Advances the internal cursor by a specified length and returns the consumed text segment.
    // Throws an error if attempting to read beyond the end of the input.
    advanceBy(length) {
        if (this.currentPosition + length > this.fullContent.length) {
            throw new Error(`Attempted to read past end of input at position ${this.currentPosition}.`);
        }
        const consumedSegment = this.fullContent.substring(this.currentPosition, this.currentPosition + length);
        this.currentPosition += length;
        return consumedSegment;
    }

    // Attempts to advance the cursor by consuming a specific prefix.
    // Returns `true` if the prefix was found and consumed, `false` otherwise.
    tryAdvance(prefix) {
        if (this.beginsWith(prefix)) {
            this.advanceBy(prefix.length);
            return true;
        }
        return false;
    }

    // Returns the character at the current cursor position without advancing the cursor.
    // Returns an empty string if the cursor is at or beyond the end of the input.
    peekCharacter() {
        if (this.isAtEnd()) {
            return '';
        }
        return this.fullContent[this.currentPosition];
    }

    // Checks if the cursor has reached or surpassed the end of the input string.
    isAtEnd() {
        return this.currentPosition >= this.fullContent.length;
    }

    // Skips over any whitespace characters from the current position.
    skipIgnored() {
        while (!this.isAtEnd() && /\s/.test(this.peekCharacter())) {
            this.advanceBy(1);
        }
    }
}

// Parses a complete conditional statement from the input.
// Expects the format: (if <criterion> (<values>) <predicate> (<values>))
function processCondition(reader) {
    reader.skipIgnored();
    const entryPosition = reader.currentPosition; // For backtracking on failure

    if (!reader.tryAdvance("(if")) {
        return null; // Not a condition statement at this point
    }
    reader.skipIgnored();

    const currentCriterion = extractCriterion(reader);
    if (currentCriterion === null) {
        throw new Error(`Missing criterion in condition at position ${reader.currentPosition}.`);
    }
    reader.skipIgnored();

    if (!reader.tryAdvance("(")) {
        throw new Error(`Expected '(' after criterion at position ${reader.currentPosition}.`);
    }
    const firstValueCollection = collectValues(reader);
    if (!reader.tryAdvance(")")) {
        throw new Error(`Expected ')' after first value collection at position ${reader.currentPosition}.`);
    }
    reader.skipIgnored();

    const currentPredicate = extractPredicate(reader);
    if (currentPredicate === null) {
        throw new Error(`Missing predicate in condition at position ${reader.currentPosition}.`);
    }
    reader.skipIgnored();

    if (!reader.tryAdvance("(")) {
        throw new Error(`Expected '(' after predicate at position ${reader.currentPosition}.`);
    }
    const secondValueCollection = collectValues(reader);
    if (!reader.tryAdvance(")")) {
        throw new Error(`Expected ')' after second value collection at position ${reader.currentPosition}.`);
    }
    reader.skipIgnored();

    if (!reader.tryAdvance(")")) {
        throw new Error(`Expected final ')' for condition at position ${reader.currentPosition}.`);
    }

    return [currentCriterion, firstValueCollection, currentPredicate, secondValueCollection];
}

// Extracts the selector (criterion) keyword.
function extractCriterion(reader) {
    reader.skipIgnored();
    const criterionOptions = ["value of", "any of", "all of"];
    for (const option of criterionOptions) {
        if (reader.beginsWith(option)) {
            reader.advanceBy(option.length);
            return option;
        }
    }
    return null; // No matching criterion found
}

// Extracts the check (predicate) keyword phrase.
// Matches longer phrases before shorter ones to avoid partial matches (e.g., "is not in" before "is").
function extractPredicate(reader) {
    reader.skipIgnored();
    const predicatePhrases = [
        "is not in", "are not in",
        "is in", "are in",
        "is not", "are not", "matches not",
        "is", "are", "matches"
    ];

    for (const phrase of predicatePhrases) {
        if (reader.beginsWith(phrase)) {
            reader.advanceBy(phrase.length);
            return phrase;
        }
    }
    return null; // No matching predicate found
}

// Collects a list of values enclosed within parentheses.
function collectValues(reader) {
    const collected = [];
    reader.skipIgnored();
    while (reader.peekCharacter() !== ')') {
        const item = retrieveValue(reader);
        // The original PEG.js grammar's `value` rule returns `''` if no sub-rule (param, condition, literal) matches.
        collected.push(item === null ? '' : item);

        reader.skipIgnored();
        reader.tryAdvance(","); // Consume optional comma
        reader.skipIgnored();
        
        // If the next character is ')' after consuming a value (and optional comma),
        // it means the value list has ended.
        if (reader.peekCharacter() === ')') {
            break; 
        }
    }
    return collected;
}

// Retrieves a single value, which can be a parameter, a nested condition, or a literal string.
// Returns `null` if no valid value type is found at the current position.
function retrieveValue(reader) {
    reader.skipIgnored();
    const initialPosition = reader.currentPosition;
    let valueResult = null;

    // To check for nested conditions first, we must peek without consuming,
    // as `processCondition` will consume `(if` if it matches.
    const tempReaderForConditionCheck = new SourceReader(reader.fullContent);
    tempReaderForConditionCheck.currentPosition = reader.currentPosition;
    tempReaderForConditionCheck.skipIgnored();
    if (tempReaderForConditionCheck.beginsWith("(if")) {
         valueResult = processCondition(reader);
    }
    
    if (valueResult === null) {
        valueResult = fetchParameter(reader);
    }

    if (valueResult === null) {
        valueResult = decodeLiteral(reader);
    }
    
    return valueResult; // Will be `null` if none of the above matched
}

// Fetches a parameter string, e.g., '{$paramName}'.
// Returns `null` if the pattern does not match or is malformed.
function fetchParameter(reader) {
    reader.skipIgnored();
    const initialPosition = reader.currentPosition;

    if (!reader.tryAdvance("{$")) {
        return null;
    }

    let parameterContent = '';
    while (!reader.isAtEnd()) {
        const char = reader.peekCharacter();
        if (char === '}') {
            break; // End of parameter
        }
        // According to PEG rule `[^,\s}]+`, parameters cannot contain commas or whitespace.
        if (char === ',' || /\s/.test(char)) {
            reader.currentPosition = initialPosition; // Backtrack on invalid char
            return null;
        }
        parameterContent += reader.advanceBy(1);
    }

    if (!reader.tryAdvance("}")) {
        reader.currentPosition = initialPosition; // Backtrack on missing closing '}'
        return null;
    }
    return `{$${parameterContent}}`;
}

// Decodes a literal string, handling balanced nested parentheses as part of the literal content.
// Returns `null` if no literal can be parsed at the current position.
function decodeLiteral(reader) {
    reader.skipIgnored();
    const initialPosition = reader.currentPosition;
    let literalAccumulator = '';
    let parenthesisBalance = 0;

    const startChar = reader.peekCharacter();
    if (startChar === '(') {
        reader.advanceBy(1); // Consume '('
        literalAccumulator += '(';
        parenthesisBalance++;

        // Continue parsing until the balancing ')' is found at the top level
        while (!reader.isAtEnd() && parenthesisBalance > 0) {
            const char = reader.peekCharacter();
            if (char === '(') {
                literalAccumulator += reader.advanceBy(1);
                parenthesisBalance++;
            } else if (char === ')') {
                literalAccumulator += reader.advanceBy(1);
                parenthesisBalance--;
            } else {
                // Any other character is part of the literal content within balanced parens
                literalAccumulator += reader.advanceBy(1);
            }
        }
        if (parenthesisBalance !== 0) {
            reader.currentPosition = initialPosition; // Backtrack on unbalanced parentheses
            return null;
        }
    } else {
        // Not starting with '(', consume characters until a delimiter.
        // Delimiters for a non-parenthesized literal are comma, open/close paren, or whitespace.
        while (!reader.isAtEnd()) {
            const char = reader.peekCharacter();
            if (char === ',' || char === '(' || char === ')' || /\s/.test(char)) {
                break; // Delimiter found, stop consuming for this literal segment
            }
            literalAccumulator += reader.advanceBy(1);
        }
    }

    if (literalAccumulator === '') {
        reader.currentPosition = initialPosition; // Backtrack if no characters were consumed
        return null;
    }
    return literalAccumulator;
}

// The main entry point for the Type IV clone.
// It takes an input string and returns the parsed array structure.
statementAnalyzer.interpretCondition = function(inputString) {
    const reader = new SourceReader(inputString);
    const parsedResult = processCondition(reader);

    reader.skipIgnored();
    if (!reader.isAtEnd()) {
        throw new Error(`Unprocessed characters remaining in input: '${reader.fullContent.substring(reader.currentPosition)}' at position ${reader.currentPosition}.`);
    }
    
    if (parsedResult === null) {
        throw new Error("Failed to parse the entire condition statement. Check input format.");
    }

    return parsedResult;
};

// Assign the new function to the original's entry point for compatibility.
// Ensure 'conditionalizer' exists in the global scope if not already defined.
if (typeof conditionalizer === 'undefined') {
    var conditionalizer = {};
}
conditionalizer.tokenize = statementAnalyzer.interpretCondition;