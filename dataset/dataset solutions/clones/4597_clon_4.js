const obtainSourceMaterial = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
};

const evaluateTextualConstruct = (incomingText) => {
    const primarySegment = incomingText.split('\n')[0].trim();

    const dissectionPattern = /^(\S+)\s(\S+)\s(\S+)$/;
    const dissectionResult = primarySegment.match(dissectionPattern);

    if (!dissectionResult) {
        // If input does not match the expected three-part structure,
        // the original code would result in a runtime error (e.g., accessing .slice on undefined).
        // For strict Type IV equivalence, we assume valid input or allow for similar error behavior.
        // In competitive programming, input format is typically guaranteed.
        // If an explicit 'NO' was required for malformed input, this would be a change in functionality.
        throw new Error("Input format mismatch: Expected three space-separated strings.");
    }

    const [_, elementA, elementB, elementC] = dissectionResult;

    const charValueExtractor = {
        firstChar: (str) => str.codePointAt(0),
        lastChar: (str) => str.codePointAt(str.length - 1)
    };

    const logicalChecks = [
        charValueExtractor.lastChar(elementA) === charValueExtractor.firstChar(elementB),
        charValueExtractor.lastChar(elementB) === charValueExtractor.firstChar(elementC)
    ];

    return logicalChecks.every(condition => condition) ? 'YES' : 'NO';
};

const commenceOperation = () => {
    try {
        const rawData = obtainSourceMaterial();
        const finalDetermination = evaluateTextualConstruct(rawData);
        console.log(finalDetermination);
    } catch (error) {
        // Log error if any, similar to how original might crash
        console.error("An unexpected error occurred: " + error.message);
    }
};

commenceOperation();