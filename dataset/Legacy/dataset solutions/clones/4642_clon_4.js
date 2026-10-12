const createFrequencyMap = (charSequence) => {
    const charFrequencies = {};
    for (const charUnit of charSequence) {
        charFrequencies[charUnit] = (charFrequencies[charUnit] || 0) + 1;
    }
    return charFrequencies;
};

const reconstructCharArray = (frequencyMap) => {
    const resultingCharacters = [];
    const sortedKeys = Object.keys(frequencyMap).sort();
    for (const charKey of sortedKeys) {
        for (let countIndex = 0; countIndex < frequencyMap[charKey]; countIndex++) {
            resultingCharacters.push(charKey);
        }
    }
    return resultingCharacters;
};

function executeProgram(rawData) {
    const lines = rawData.split('\n');
    const stringCount = Number(lines[0]);
    const sortedCharSequences = [];

    for (let lineIndex = 1; lineIndex <= stringCount; lineIndex++) {
        sortedCharSequences.push(lines[lineIndex].split('').sort());
    }

    let finalResultContainer;

    if (stringCount === 0) {
        finalResultContainer = undefined;
    } else {
        const initialSequence = sortedCharSequences.shift();
        const initialFrequencyMap = createFrequencyMap(initialSequence);

        const finalCommonFreqMap = sortedCharSequences.reduce((accumulatorFreqMap, currentCharArray) => {
            const currentStringFreqMap = createFrequencyMap(currentCharArray);
            const nextAccumulatorFreqMap = {};

            for (const charUnit in accumulatorFreqMap) {
                if (currentStringFreqMap.hasOwnProperty(charUnit)) {
                    nextAccumulatorFreqMap[charUnit] = Math.min(accumulatorFreqMap[charUnit], currentStringFreqMap[charUnit]);
                }
            }
            return nextAccumulatorFreqMap;
        }, initialFrequencyMap);

        finalResultContainer = reconstructCharArray(finalCommonFreqMap);
    }

    if (finalResultContainer.length === 0) {
        console.log();
    } else {
        console.log(finalResultContainer.join(''));
    }
}

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
