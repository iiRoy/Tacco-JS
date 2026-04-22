let collectedInput = '';

process.stdin.on('data', (dataChunk) => {
    collectedInput += dataChunk.toString();
});

process.stdin.on('end', () => {
    const removeWhitespace = (text) => {
        let beginning = 0;
        while (beginning < text.length && (text[beginning] === ' ' || text[beginning] === '\t' || text[beginning] === '\n' || text[beginning] === '\r')) {
            beginning++;
        }
        let ending = text.length - 1;
        while (ending >= 0 && (text[ending] === ' ' || text[ending] === '\t' || text[ending] === '\n' || text[ending] === '\r')) {
            ending--;
        }
        return text.substring(beginning, ending + 1);
    };

    const cleanedInput = removeWhitespace(collectedInput);

    const extractLines = (sourceText) => {
        const lineArray = [];
        let currentLineStart = 0;
        for (let charIndex = 0; charIndex < sourceText.length; charIndex++) {
            if (sourceText[charIndex] === '\n' || sourceText[charIndex] === '\r') {
                if (charIndex > currentLineStart) { // Avoid empty lines if multiple newlines
                    lineArray.push(sourceText.substring(currentLineStart, charIndex));
                }
                currentLineStart = charIndex + 1;
                if (sourceText[charIndex] === '\r' && sourceText[charIndex + 1] === '\n') { // Handle CRLF
                    currentLineStart++;
                    charIndex++; // Skip the '\n'
                }
            }
        }
        if (currentLineStart < sourceText.length) { // Add last line if not newline-terminated
            lineArray.push(sourceText.substring(currentLineStart, sourceText.length));
        }
        return lineArray;
    };

    const contentRows = extractLines(cleanedInput);

    const dataRows = [];
    for (let r = 1; r < contentRows.length; r++) { // Skip the first row ('n')
        dataRows.push(contentRows[r]);
    }
    
    const relevantDataString = dataRows[0]; // This is the actual heap data line

    const separateValuesBySpace = (inputStr) => {
        const partsList = [];
        let currentFragment = '';
        for (let s = 0; s < inputStr.length; s++) {
            if (inputStr[s] === ' ') {
                if (currentFragment.length > 0) {
                    partsList.push(currentFragment);
                    currentFragment = '';
                }
            } else {
                currentFragment += inputStr[s];
            }
        }
        if (currentFragment.length > 0) {
            partsList.push(currentFragment);
        }
        return partsList;
    };

    const stringValueSegments = separateValuesBySpace(relevantDataString);

    const numericalElements = [];
    for (let t = 0; t < stringValueSegments.length; t++) {
        numericalElements.push(parseInt(stringValueSegments[t], 10));
    }

    class HierarchicalComponentPresenter {
        constructor(numericalSequence) {
            this.componentSet = numericalSequence;
            this.totalComponents = numericalSequence.length;
        }

        produceComponentBreakdowns() {
            const collectedBreakdowns = [];

            for (let currentEntityIndex = 0; currentEntityIndex < this.totalComponents; currentEntityIndex++) {
                const entityValue = this.componentSet[currentEntityIndex];
                let currentEntityStatement = `item ${currentEntityIndex}: value = ${entityValue}`;

                const superiorEntityIndex = Math.trunc((currentEntityIndex - 1) / 2);
                if (currentEntityIndex > 0) {
                    currentEntityStatement += `, superior value = ${this.componentSet[superiorEntityIndex]}`;
                }

                const leftSubordinateIndex = 2 * currentEntityIndex + 1;
                if (leftSubordinateIndex < this.totalComponents) {
                    currentEntityStatement += `, left subordinate value = ${this.componentSet[leftSubordinateIndex]}`;
                }

                const rightSubordinateIndex = 2 * currentEntityIndex + 2;
                if (rightSubordinateIndex < this.totalComponents) {
                    currentEntityStatement += `, right subordinate value = ${this.componentSet[rightSubordinateIndex]}`;
                }

                collectedBreakdowns.push(currentEntityStatement);
            }
            return collectedBreakdowns.join('\n');
        }
    }

    const structureAnalyzer = new HierarchicalComponentPresenter(numericalElements);
    const finalReport = structureAnalyzer.produceComponentBreakdowns();

    process.stdout.write(finalReport + '\n');
});

process.stdin.on('error', (err) => {
    process.stderr.write('Input stream encountered an issue: ' + err.message + '\n');
});