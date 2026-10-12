(async () => {
    const readAllStdinData = async () => {
        const inputBufferChunks = [];
        for await (const dataSegment of process.stdin) {
            inputBufferChunks.push(dataSegment);
        }
        return Buffer.concat(inputBufferChunks).toString();
    };

    const parseProblemParameters = (fullInputString) => {
        const inputLines = fullInputString.split(/\n/);
        const [sizeStr, numQueriesStr] = inputLines[0].split(/\s/);
        const arraySize = +sizeStr;
        const numQueries = +numQueriesStr;

        const allQueriesData = inputLines.slice(1, numQueries + 1).map(lineContent =>
            lineContent.split(/\s/).map(valueString => +valueString)
        );
        return { arraySize, numQueries, allQueriesData };
    };

    const rawInputContent = await readAllStdinData();
    const { arraySize, numQueries, allQueriesData } = parseProblemParameters(rawInputContent);

    let digitSequence = new Array(arraySize).fill(1);

    const MODULO_CONSTANT = 998244353;
    const MULTIPLIER_BASE = 10;
    const INITIAL_DIGIT_VALUE = 1;

    let currentCalculatedValue = 0;
    for (let elementIndex = 0; elementIndex < arraySize; ++elementIndex) {
        currentCalculatedValue = (currentCalculatedValue * MULTIPLIER_BASE + INITIAL_DIGIT_VALUE) % MODULO_CONSTANT;
    }

    const extractQueryDetails = (queryArray) => {
        const startIdx = queryArray[0] - 1;
        const endIdx = queryArray[1] - 1;
        const replacementDigit = queryArray[2];
        return { startIdx, endIdx, replacementDigit };
    };

    for (const currentQueryEntry of allQueriesData) {
        const { startIdx, endIdx, replacementDigit } = extractQueryDetails(currentQueryEntry);

        let queryContribution = 0;
        for (let elementIndex = startIdx; elementIndex <= endIdx; ++elementIndex) {
            const digitDelta = replacementDigit - digitSequence[elementIndex];
            queryContribution = (queryContribution * MULTIPLIER_BASE + digitDelta) % MODULO_CONSTANT;
            digitSequence[elementIndex] = replacementDigit;
        }

        const trailingPositionsCount = arraySize - (endIdx + 1);
        for (let k = 0; k < trailingPositionsCount; ++k) {
            queryContribution = (queryContribution * MULTIPLIER_BASE) % MODULO_CONSTANT;
        }
        
        currentCalculatedValue = (currentCalculatedValue + queryContribution + MODULO_CONSTANT) % MODULO_CONSTANT;

        console.log(currentCalculatedValue);
    }

})();
