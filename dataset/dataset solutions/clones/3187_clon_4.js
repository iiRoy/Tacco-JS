const createInputProcessor = (sourceText) => {
    let lineBuffer = sourceText.trim().split("\n");
    let currentLinePointer = 0;
    let currentLineTokens = [];

    const prepareTokensForSingleRead = () => {
        if (currentLineTokens.length === 0 && currentLinePointer < lineBuffer.length) {
            currentLineTokens = lineBuffer[currentLinePointer].split(" ").reverse();
        }
    };

    const getSingleToken = (asString) => {
        prepareTokensForSingleRead();
        if (currentLineTokens.length === 0) {
            return undefined;
        }
        const token = currentLineTokens.pop();
        if (currentLineTokens.length === 0) {
            currentLinePointer++;
        }
        return asString ? token : +token;
    };

    const getFullLine = (asString) => {
        if (currentLinePointer >= lineBuffer.length) {
            return [];
        }
        currentLineTokens = [];
        const line = lineBuffer[currentLinePointer++];
        return line.split(" ").map(t => asString ? t : +t);
    };

    const getMatrix = (numLines, asString) => {
        const result = [];
        for (let i = 0; i < numLines; i++) {
            if (currentLinePointer >= lineBuffer.length) break;
            currentLineTokens = [];
            const line = lineBuffer[currentLinePointer++];
            result.push(line.split(" ").map(t => asString ? t : +t));
        }
        return result;
    };

    const getRawLines = (numLines, asString) => {
        const result = [];
        for (let i = 0; i < numLines; i++) {
            if (currentLinePointer >= lineBuffer.length) break;
            currentLineTokens = [];
            const line = lineBuffer[currentLinePointer++];
            result.push(asString ? line : +line);
        }
        return result;
    };

    return {
        fetchSingle: getSingleToken,
        fetchLine: getFullLine,
        fetchMatrix: getMatrix,
        fetchRawLines: getRawLines
    };
};

const processInput = (inputContent) => {
    const dataParser = createInputProcessor(inputContent);

    const countN = dataParser.fetchSingle();
    const countM = dataParser.fetchSingle();

    const frequencyTracker = Array.from({ length: countM }, () => 0);

    Array.from({ length: countN }).forEach(() => {
        const currentLineData = dataParser.fetchLine();
        const numElementsToProcess = currentLineData[0];
        
        Array.from({ length: numElementsToProcess }).forEach((_, indexOffset) => {
            const targetIndex = currentLineData[indexOffset];
            frequencyTracker[targetIndex]++;
        });
    });

    const finalResult = frequencyTracker.filter(val => val === countN).length;
    return finalResult;
};

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processInput(inputSource));
