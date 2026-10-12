/**
 * 
 * @param {String} rawInputDataString 
 */
function processInputData(rawInputDataString) {
    const NEWLINE_DELIMITER = "\n";
    const RADIX_DECIMAL = 10;

    function extractCostValues(lineContent) {
        const allNumbersInLine = lineContent.split(' ').map(strVal => parseInt(strVal, RADIX_DECIMAL));
        return allNumbersInLine.slice(1);
    }

    const inputLinesArray = rawInputDataString.split(NEWLINE_DELIMITER);
    const totalTestCases = parseInt(inputLinesArray[0], RADIX_DECIMAL);
    
    for (let caseIndex = 0; caseIndex < totalTestCases; ++caseIndex) {
        const currentTestCaseLine = inputLinesArray[caseIndex + 1];
        const costValuesForOutput = extractCostValues(currentTestCaseLine);
        console.log(costValuesForOutput.join(' '));
    }
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
