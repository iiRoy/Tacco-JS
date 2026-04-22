const executeComputation = (algorithmExecutor) => {
    let entireInputData = '';

    process.stdin.on('data', (dataChunk) => {
        entireInputData += dataChunk.toString();
    });

    process.stdin.on('end', () => {
        const processedInputItems = entireInputData
            .split(/\r?\n|\r/)
            .filter(lineContent => lineContent.trim() !== '')
            .flatMap(lineContent => lineContent.split(/\s+/).filter(token => token !== ''));

        let collectedOutput = [];

        algorithmExecutor(processedInputItems, (finalValue) => {
            collectedOutput.push(String(finalValue));
        });

        process.stdout.write(collectedOutput.join(require('os').EOL) + require('os').EOL);
    });

    process.stdin.setEncoding('utf8');
};

const performAnalysis = (sourceInputTokens, deliverOutcome) => {
    const symbolToOrdinal = new Map([
        ['M', 0], ['A', 1], ['R', 2], ['C', 3], ['H', 4]
    ]);

    const tokenIndex = { current: 0 };

    const retrieveNextToken = () => sourceInputTokens[tokenIndex.current++];

    const totalEntriesCount = Number.parseInt(retrieveNextToken(), 10);

    const frequencyTallies = new Array(5).fill(0);

    Array.from({ length: totalEntriesCount }).forEach(() => {
        const currentToken = retrieveNextToken();
        const initialCharacter = currentToken[0];
        if (symbolToOrdinal.has(initialCharacter)) {
            frequencyTallies[symbolToOrdinal.get(initialCharacter)]++;
        }
    });

    const tripletCombinations = [
        [0, 1, 2], [0, 1, 3], [0, 1, 4],
        [0, 2, 3], [0, 2, 4],
        [0, 3, 4],
        [1, 2, 3], [1, 2, 4],
        [1, 3, 4],
        [2, 3, 4]
    ];

    const finalCalculatedSum = tripletCombinations.reduce((accumulatedValue, currentIndices) => {
        const [idxA, idxB, idxC] = currentIndices;
        return accumulatedValue + (frequencyTallies[idxA] * frequencyTallies[idxB] * frequencyTallies[idxC]);
    }, 0);

    deliverOutcome(finalCalculatedSum);
};

executeComputation(performAnalysis);