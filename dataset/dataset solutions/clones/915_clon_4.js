const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
const linesCollection = sourceData.split("\n");
let dataPointer = 0;

const vowelCheck = /[aiueo]/;

const morphWord = (originalPhrase) => {
    if (!originalPhrase) return "";
    const transformationState = originalPhrase.split('').reduce((stateAcc, characterUnit) => {
        let currentString = stateAcc.accumulatorString;
        let readyForNext = stateAcc.captureNext;

        if (readyForNext) {
            currentString += characterUnit;
            readyForNext = false;
        }

        if (vowelCheck.test(characterUnit)) {
            readyForNext = true;
        }

        return { accumulatorString: currentString, captureNext: readyForNext };
    }, { accumulatorString: "", captureNext: true });
    return transformationState.accumulatorString;
};

const calculatePrefixOverlap = (stringA, stringB, currentDepth = 0) => {
    if (stringA === stringB) {
        return -1;
    }
    if (currentDepth >= stringA.length || currentDepth >= stringB.length) {
        return currentDepth;
    }
    if (stringA[currentDepth] !== stringB[currentDepth]) {
        return currentDepth;
    }
    return calculatePrefixOverlap(stringA, stringB, currentDepth + 1);
};

const processInputBlocks = (inputLines) => {
    let currentPointer = 0;
    const outputResults = [];

    while (true) {
        const entryCount = parseInt(inputLines[currentPointer++], 10);
        if (entryCount === 0) {
            break;
        }

        const rawPhrases = [];
        for (let k = 0; k < entryCount; k++) {
            rawPhrases.push(inputLines[currentPointer++]);
        }

        const modifiedPhrases = rawPhrases.map(morphWord).sort();

        let maxOverlapFound = 0;

        if (modifiedPhrases.length > 1) {
            const evaluation = modifiedPhrases.slice(1).reduce((statusObject, currentPhrase, arrayIndex) => {
                if (statusObject.hasIdentical) {
                    return statusObject;
                }
                const previousPhrase = modifiedPhrases[arrayIndex];
                const overlapLength = calculatePrefixOverlap(previousPhrase, currentPhrase);

                if (overlapLength === -1) {
                    return { maxSharedLength: -2, hasIdentical: true };
                } else {
                    return {
                        maxSharedLength: Math.max(statusObject.maxSharedLength, overlapLength),
                        hasIdentical: false
                    };
                }
            }, { maxSharedLength: 0, hasIdentical: false });

            maxOverlapFound = evaluation.maxSharedLength;
        }
        outputResults.push(maxOverlapFound + 1);
    }
    return outputResults;
};

const finalResults = processInputBlocks(linesCollection);
finalResults.forEach(res => console.log(res));