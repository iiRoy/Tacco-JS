"use strict"

const transformInput = (sourceText) => {
    console.log(sourceText);

    const textLines = sourceText.trim().split('\n').filter(Boolean);

    const requiredIndices = [0, 1, 2];

    const extractedParts = requiredIndices.map((idx, lineNum) => {
        const currentLine = textLines[lineNum];
        if (currentLine === undefined) {
            return undefined;
        }
        const numberSequences = currentLine.match(/\d+/g);
        return (numberSequences && numberSequences[idx] !== undefined) ? numberSequences[idx] : undefined;
    });

    const finalResult = extractedParts.map(part => (part === undefined ? "undefined" : part)).join('');

    console.log(finalResult);
};

transformInput(Buffer.from(require('fs').readFileSync(0)).toString());