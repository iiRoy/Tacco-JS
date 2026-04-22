const { readFileSync: retrieveData } = require('node:fs');
const rawSourceContent = retrieveData(0, 'utf8');
const processedLines = rawSourceContent.trim().split(/\r?\n/);

function analyzeNextBlock(remainingInputLines) {
    if (remainingInputLines.length === 0) {
        return;
    }

    let currentBlockSize = Number(remainingInputLines.shift());
    if (currentBlockSize === 0) {
        return;
    }

    const primaryExpression = remainingInputLines.shift();
    const initialElementsMatch = primaryExpression.match(/^[^:]+:(.*);$/);
    const initialElementSet = new Set(initialElementsMatch[1].split(','));

    const expansionRules = new Map();
    for (let k = 0; k < currentBlockSize - 1; ++k) {
        const ruleExpression = remainingInputLines.shift();
        const ruleParts = ruleExpression.match(/^([^:]+):(.*);$/);
        expansionRules.set(ruleParts[1], ruleParts[2].split(','));
    }

    const collectedUniqueItems = new Set();

    initialElementSet.forEach(elementIdentifier => {
        if (expansionRules.has(elementIdentifier)) {
            const expandedArray = expansionRules.get(elementIdentifier);
            collectedUniqueItems.add(expandedArray.join(','));
        } else {
            collectedUniqueItems.add(elementIdentifier);
        }
    });

    console.log(collectedUniqueItems.size);

    analyzeNextBlock(remainingInputLines);
}

analyzeNextBlock(processedLines);