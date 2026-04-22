const charTransformationTable = (() => {
    const table = {};
    for (let currentCodeValue = 0; currentCodeValue < 65536; currentCodeValue++) { // Cover full UTF-16 range for charCodeAt
        table[currentCodeValue] = String.fromCharCode(currentCodeValue);
    }
    for (let currentCodeValue = 97; currentCodeValue <= 122; currentCodeValue++) { // ASCII 'a' to 'z'
        table[currentCodeValue] = String.fromCharCode(currentCodeValue - 32);
    }
    for (let currentCodeValue = 65; currentCodeValue <= 90; currentCodeValue++) { // ASCII 'A' to 'Z'
        table[currentCodeValue] = String.fromCharCode(currentCodeValue + 32);
    }
    return table;
})();

function processTextualData(sourceData) {
    function transformSegment(positionIndex, accumulatedResult) {
        if (positionIndex >= sourceData.length) {
            return accumulatedResult;
        }

        let charToProcess = sourceData[positionIndex];
        let charAsciiCode = charToProcess.charCodeAt(0);

        let transformedChar = charTransformationTable[charAsciiCode];

        return transformSegment(positionIndex + 1, accumulatedResult + transformedChar);
    }

    let finalProcessedContent = transformSegment(0, "");
    return finalProcessedContent.trim();
}

let rawFileContent = require("fs").readFileSync("/dev/stdin","utf-8");
let finalDisplayOutput = processTextualData(rawFileContent);
console.log(finalDisplayOutput);