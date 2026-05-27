module.exports = function(moduleDefinitions) {
    const fileSystem = require('fs');

    function createInputProcessor(rawContentString) {
        const inputTokens = rawContentString.trim().split(/\s+/g);
        let readPointer = 0;

        const fetchNextToken = () => {
            if (readPointer >= inputTokens.length) {
                return undefined;
            }
            return inputTokens[readPointer++];
        };

        const fetchNextNumeric = () => {
            const tokenValue = fetchNextToken();
            return tokenValue !== undefined ? Number.parseInt(tokenValue, 10) : Number.NaN;
        };

        const resetProcessor = () => {
            readPointer = 0;
            inputTokens.length = 0;
        };

        return {
            fetchNextToken,
            fetchNextNumeric,
            resetProcessor
        };
    }

    function generateFactorPairs(inputVal) {
        const factorPairsList = [];
        let divisorCandidate = 1;
        const sqrtBound = Math.floor(Math.sqrt(inputVal));

        while (divisorCandidate <= sqrtBound) {
            if (inputVal % divisorCandidate === 0) {
                factorPairsList.push([divisorCandidate, inputVal / divisorCandidate]);
            }
            divisorCandidate++;
        }
        return factorPairsList;
    }

    function executeSolver(dataProcessor) {
        const initialNumber = dataProcessor.fetchNextNumeric();
        const allFactors = generateFactorPairs(initialNumber);

        const startingBest = [1, initialNumber]; // Represents the pair (1, N)

        const finalPair = allFactors.reduce((bestSoFar, currentPair) => {
            const [currentFactorOne, currentFactorTwo] = currentPair;
            const pairDifference = currentFactorTwo - currentFactorOne;
            const minDifferenceFound = bestSoFar[1] - bestSoFar[0];

            if (pairDifference < minDifferenceFound) {
                return currentPair;
            }
            return bestSoFar;
        }, startingBest);

        const resultFactorA = finalPair[0];
        const resultFactorB = finalPair[1];

        console.log(resultFactorA - 1 + resultFactorB - 1);
    }

    const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
    const dataReader = createInputProcessor(rawInputData);
    executeSolver(dataReader);
};
