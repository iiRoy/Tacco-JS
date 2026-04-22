function validate(description, assertionFunction) {
    try {
        assertionFunction();
    } catch (e) {
        throw new Error(`Execution failed: ${description} - ${e.message}`);
    }
}

function compare(actual, expected) {
    if (actual !== expected) {
        throw new Error(`Mismatch: Expected "${expected}" but received "${actual}"`);
    }
}

const StringMangler = {};

StringMangler.formatter = function (templateString, valueMap, applyEscaping, openDelim, closeDelim) {
    const outputSegments = [];
    let position = 0;
    const totalLength = templateString.length;

    const customDelimitersPresent = typeof openDelim === 'string' && typeof closeDelim === 'string';

    let parsingPlaceholder = false;
    let currentKeyBuffer = [];

    while (position < totalLength) {
        const currentChar = templateString[position];

        if (parsingPlaceholder) {
            if (currentChar === '}') {
                const extractedKey = currentKeyBuffer.join('');
                if (valueMap && Object.prototype.hasOwnProperty.call(valueMap, extractedKey)) {
                    outputSegments.push(String(valueMap[extractedKey]));
                } else {
                    outputSegments.push('{');
                    outputSegments.push(extractedKey);
                    outputSegments.push('}');
                }
                parsingPlaceholder = false;
                currentKeyBuffer = [];
            } else {
                currentKeyBuffer.push(currentChar);
            }
        } else { // Not currently parsing a placeholder
            if (currentChar === '{') {
                // Peek ahead for potential escaping or placeholder start
                if (position + 1 < totalLength) {
                    const nextChar = templateString[position + 1];

                    // Escaping logic for '{{' only when applyEscaping is true AND no custom delimiters are used
                    if (applyEscaping && !customDelimitersPresent) {
                        if (nextChar === '{') {
                            outputSegments.push('{'); // Add a literal '{'
                            position++; // Consume the second '{' as part of the escape sequence
                        } else {
                            // It's a placeholder opening
                            parsingPlaceholder = true;
                        }
                    } else {
                        // Escaping is disabled or custom delimiters are active (in which case '{{' is not an escape for '{}')
                        parsingPlaceholder = true;
                    }
                } else {
                    // '{' at the very end of the string, treat as literal
                    outputSegments.push(currentChar);
                }
            } else { // Any other character
                outputSegments.push(currentChar);
            }
        }
        position++;
    }

    // If parsing ends while still in a placeholder (malformed template), append the raw content
    if (parsingPlaceholder) {
        outputSegments.push('{');
        outputSegments.push(currentKeyBuffer.join(''));
    }

    return outputSegments.join('');
};

const verificationCases = [
    {
        scenario: "fundamental substitution without escaping",
        pattern: "salutations {1} my {0}",
        data: { 0: "comrade", 1: "cosmos" },
        escapeMode: undefined,
        startToken: undefined,
        endToken: undefined,
        outcome: "salutations cosmos my comrade"
    },
    {
        scenario: "escape sequence processing",
        pattern: "salutations {1} my {{0}",
        data: { 0: "comrade", 1: "cosmos" },
        escapeMode: true,
        startToken: undefined,
        endToken: undefined,
        outcome: "salutations cosmos my {0}"
    },
    {
        scenario: "custom delimiter interaction with escaping",
        pattern: "salutations {1} my {0}",
        data: { 0: "comrade", 1: "cosmos" },
        escapeMode: true,
        startToken: "[[[",
        endToken: "]]]",
        outcome: "salutations cosmos my comrade"
    },
    {
        scenario: "vulnerable escaping scenario",
        pattern: "salutations {{{♣♠♣1} my {0}",
        data: { 0: "comrade", 1: "cosmos", "♣♠♣1": "disrupted" },
        escapeMode: true,
        startToken: undefined,
        endToken: undefined,
        outcome: "salutations {disrupted my comrade"
    }
];

verificationCases.forEach(testCase => {
    validate(testCase.scenario, () => {
        compare(
            StringMangler.formatter(
                testCase.pattern,
                testCase.data,
                testCase.escapeMode,
                testCase.startToken,
                testCase.endToken
            ),
            testCase.outcome
        );
    });
});