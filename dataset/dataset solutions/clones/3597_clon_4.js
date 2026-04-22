function supplyChain(rawData) {
    const streamOfLines = rawData.split('\n');
    let currentLinePointer = 0;
    let cachedTokens = [];

    const advanceLine = () => {
        if (cachedTokens.length === 0 && currentLinePointer < streamOfLines.length) {
            cachedTokens = streamOfLines[currentLinePointer].split(' ');
            currentLinePointer++;
        }
    };

    const acquireUnit = (isTextual) => {
        advanceLine();
        if (cachedTokens.length > 0) {
            const item = cachedTokens.pop();
            return isTextual ? item : Number(item);
        }
        return undefined;
    };

    const obtainSequence = (asStrings) => {
        if (currentLinePointer < streamOfLines.length) {
            const lineData = streamOfLines[currentLinePointer];
            currentLinePointer++;
            return asStrings ? lineData.split(' ') : lineData.split(' ').map(Number);
        }
        return undefined;
    };

    const harvestBlock = (rowCount, asStrings) => {
        const collectedRows = [];
        for (let k = 0; k < rowCount; k++) {
            if (currentLinePointer < streamOfLines.length) {
                const lineContent = streamOfLines[currentLinePointer];
                currentLinePointer++;
                collectedRows.push(asStrings ? lineContent.split(' ') : lineContent.split(' ').map(Number));
            } else {
                break;
            }
        }
        return collectedRows;
    };

    return {
        acquireUnit,
        obtainSequence,
        harvestBlock,
    };
}

function executeCalculation(inputProvider) {
    const primaryCount = inputProvider.acquireUnit();
    const initialList = inputProvider.obtainSequence();

    if (primaryCount <= 2) {
        return Math.max(...initialList);
    }

    const derivedPairs = initialList.slice(0, -1).map((element, index) =>
        Math.max(element, initialList[index + 1])
    );

    const combinedList = [...initialList, ...derivedPairs];

    const findMedianElement = (dataArray) => {
        dataArray.sort((val1, val2) => val1 - val2);
        return dataArray[Math.floor(dataArray.length / 2)];
    };

    return findMedianElement(combinedList);
}

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
const dataProcessor = supplyChain(inputSource);

console.log(executeCalculation(dataProcessor));