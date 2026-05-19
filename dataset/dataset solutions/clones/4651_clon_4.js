const computeCharFrequencies = (textSegment) => {
    const frequencyRegistry = new Map();
    for (const symbol of textSegment) {
        frequencyRegistry.set(symbol, (frequencyRegistry.get(symbol) || 0) + 1);
    }
    return frequencyRegistry;
};

const rawInputContent = require("fs").readFileSync(0).toString();
const processedInputLines = rawInputContent.split('\n').slice(1, -1);

const lineSpecificFrequencyMaps = processedInputLines.map(computeCharFrequencies);

let combinedCharacterCounts = new Map();

if (lineSpecificFrequencyMaps.length > 0) {
    combinedCharacterCounts = new Map(lineSpecificFrequencyMaps[0]);

    for (let i = 1; i < lineSpecificFrequencyMaps.length; i++) {
        const currentLineMap = lineSpecificFrequencyMaps[i];
        for (const [charKey, currentMinimum] of combinedCharacterCounts.entries()) {
            const countInCurrentLine = currentLineMap.get(charKey) || 0;
            combinedCharacterCounts.set(charKey, Math.min(currentMinimum, countInCurrentLine));
        }
    }
}

const finalCharacterSegments = Array.from(combinedCharacterCounts.entries())
    .filter(([, countValue]) => countValue > 0)
    .flatMap(([charKey, countValue]) => Array(countValue).fill(charKey));

console.log(finalCharacterSegments.sort().join(''));
