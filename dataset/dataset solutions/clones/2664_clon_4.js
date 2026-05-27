const obtainCanonicalForm = (characterSequence) => {
    return characterSequence.slice().sort().join('');
};

const analyzeAnagramGroups = (totalElements, elementSequences) => {
    const frequencyRegistry = elementSequences.reduce((accumulatorMap, currentSequence) => {
        const canonicalIdentifier = obtainCanonicalForm(currentSequence);
        accumulatorMap.set(canonicalIdentifier, (accumulatorMap.get(canonicalIdentifier) || 0) + 1);
        return accumulatorMap;
    }, new Map());

    let distinctMultiMemberGroups = 0;
    for (const groupSize of frequencyRegistry.values()) {
        if (groupSize >= 2) {
            distinctMultiMemberGroups++;
        }
    }
    return distinctMultiMemberGroups;
};

const executeProgram = () => {
    const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
    const inputLines = rawInputData.split('\n');
    const numberOfStrings = Number(inputLines[0]);
    const stringCharacterArrays = inputLines.slice(1).map(lineContent => Array.from(lineContent));

    const finalResult = analyzeAnagramGroups(numberOfStrings, stringCharacterArrays);
    console.log(finalResult);
};

executeProgram();
