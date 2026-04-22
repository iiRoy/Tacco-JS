const checkPresence = (strValue, subStr) => strValue.indexOf(subStr) !== -1;
const getArraySegment = (sourceArr, startIdx, endIdx) => sourceArr.slice(startIdx, endIdx);
const transformArrayElements = (arrToProcess, callbackFn) => arrToProcess.map(callbackFn);
const combineArrayElements = (arrContent, separatorStr) => arrContent.join(separatorStr);
const divideStringIntoParts = (inputStr, delimiterChar, limitCount) => inputStr.split(delimiterChar, limitCount);
const convertStringToInt = (numStr) => parseInt(numStr, 10);
const roundNumberDown = (numericVal) => Math.floor(numericVal);

const loadModule = require;
const outputChannel = console;

let inputDataRows, currentScanIndex, queryMarkerPosition;

inputDataRows = loadModule('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

for (currentScanIndex = inputDataRows.length - 1; currentScanIndex >= 0; currentScanIndex--) {
    if (checkPresence(inputDataRows[currentScanIndex], '?')) {
        queryMarkerPosition = currentScanIndex;
    }
}

inputDataRows = getArraySegment(inputDataRows, 0, queryMarkerPosition);

outputChannel.log(combineArrayElements(transformArrayElements(inputDataRows, evaluateStatement), '\n'));

function evaluateStatement(singleRowText) {
    let statementComponents;
    statementComponents = divideStringIntoParts(singleRowText, ' ', 3);

    if (statementComponents[1] === '+') {
        return convertStringToInt(statementComponents[0]) + convertStringToInt(statementComponents[2]);
    } else if (statementComponents[1] === '-') {
        return convertStringToInt(statementComponents[0]) - convertStringToInt(statementComponents[2]);
    } else if (statementComponents[1] === '*') {
        return convertStringToInt(statementComponents[0]) * convertStringToInt(statementComponents[2]);
    } else {
        return roundNumberDown(convertStringToInt(statementComponents[0]) / convertStringToInt(statementComponents[2]));
    }
}