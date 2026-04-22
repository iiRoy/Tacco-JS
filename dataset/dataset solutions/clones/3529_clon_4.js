const transformationProcessor = function() {
    let receivedData = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { receivedData += chunk; });
    process.stdin.on('end', () => {
        const linesOfText = receivedData.trim().split('\n');
        if (linesOfText.length < 2) {
            process.stdout.write("No\n");
            return;
        }
        const initialText = linesOfText[0].trim();
        const alteredText = linesOfText[1].trim();

        analyzeEquivalence(initialText, alteredText);
    });
};

const analyzeEquivalence = function(sourceString, targetString) {
    if (sourceString.length !== targetString.length) {
        process.stdout.write("No\n");
        return;
    }

    if (sourceString.length === 0) {
        process.stdout.write("Yes\n");
        return;
    }

    // Using character code arrays for mappings to avoid identifier reuse and provide different structure
    // Max char code for typical ASCII/extended ASCII is 255.
    const forwardMap = new Array(256).fill(null); // Maps source charCode to target charCode
    const reverseMap = new Array(256).fill(null); // Maps target charCode to source charCode

    let consistentMapping = true;

    // First pass: establish mappings and check for immediate conflicts
    Array.from(sourceString).every((sourceChar, index) => {
        const targetChar = targetString[index];
        const sourceCode = sourceChar.charCodeAt(0);
        const targetCode = targetChar.charCodeAt(0);

        // Check forward mapping consistency
        if (forwardMap[sourceCode] !== null && forwardMap[sourceCode] !== targetCode) {
            consistentMapping = false;
            return false; // Stop iteration
        }
        forwardMap[sourceCode] = targetCode;

        // Check reverse mapping consistency (ensures injectivity from target side)
        if (reverseMap[targetCode] !== null && reverseMap[targetCode] !== sourceCode) {
            consistentMapping = false;
            return false; // Stop iteration
        }
        reverseMap[targetCode] = sourceCode;

        return true; // Continue iteration
    });

    if (!consistentMapping) {
        process.stdout.write("No\n");
        return;
    }

    // Second pass: verify the involution property (each mapping must be its own inverse or part of a 2-cycle)
    // Collect unique source characters to iterate only over relevant mappings
    const uniqueSourceCodes = new Set(Array.from(sourceString).map(c => c.charCodeAt(0)));

    uniqueSourceCodes.forEach(currentSourceCode => {
        if (!consistentMapping) return; // Short-circuit if already found inconsistent

        const currentTargetCode = forwardMap[currentSourceCode];

        // The core check: if A maps to B, then B must map back to A
        // This covers both A->A (where A must map from A) and A->B, B->A (where B must map to A)
        if (forwardMap[currentTargetCode] !== currentSourceCode) {
            consistentMapping = false;
        }
    });

    if (consistentMapping) {
        process.stdout.write("Yes\n");
    } else {
        process.stdout.write("No\n");
    }
};

// Entry point for the transformation evaluation
transformationProcessor();