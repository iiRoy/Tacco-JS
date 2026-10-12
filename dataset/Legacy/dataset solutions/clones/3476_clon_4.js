const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
let inputSource;
const rawInputLines = [];

inputReader.on('line', (line) => rawInputLines.push(line));
inputReader.on('close', () => {
  inputSource = createInputManager(rawInputLines);
  logDebug("-----start-----");
  const startTime = new Date();
  executeAlgorithm();
  const endTime = new Date() - startTime;
  logDebug("----- end -----");
  logDebug("time : " + (endTime) + "ms");
});

function createInputManager(lines) {
    let currentIdx = 0;
    return {
        pullNext: () => {
            if (currentIdx >= lines.length) {
                throw "ArrayIndexOutOfBoundsException これ以上ないよ";
            }
            return lines[currentIdx++];
        },
        hasMore: () => currentIdx < lines.length
    };
}

const typeConverters = new Map([
    [1, (val) => parseInt(val)],
    [2, (val) => val.split(" ")],
    [4, (val) => val.split(" ").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
    [8, (val) => val.join(" ")],
    [9, (val) => val.join("\n")],
    [0, (val) => val.join("")],
]);

function processConversion(inputVal, conversionType) {
    try {
        const converter = typeConverters.get(conversionType);
        return converter ? converter(inputVal) : inputVal;
    } catch (e) {
        return inputVal;
    }
}

function getNextInt() { return processConversion(inputSource.pullNext(), 1); }
function getNextStrArray() { return processConversion(inputSource.pullNext(), 2); }
function getNextIntArray() { return processConversion(inputSource.pullNext(), 4); }
function getNextCharArray() { return processConversion(inputSource.pullNext(), 6); }
function hasMoreInput() { return inputSource.hasMore(); }

function outputResult(content) { console.log(content); }
function logDebug(message) { console.error("debug:" + require("util").inspect(message, false, null)); }

function executeAlgorithm() {
    const elementCount = getNextInt();
    const sortedNumbers = Array.from({ length: elementCount }, () => getNextInt());
    sortedNumbers.sort((a, b) => a - b);

    let totalDifference = 0;
    const resultSequence = [];

    resultSequence.push(sortedNumbers.shift());

    for (let k = 0; k < elementCount - 1; k++) {
        const seqFront = resultSequence[0];
        const seqBack = resultSequence[resultSequence.length - 1];
        const listFront = sortedNumbers[0];
        const listBack = sortedNumbers[sortedNumbers.length - 1];

        if (seqFront === seqBack && listFront === listBack) {
            resultSequence.push(sortedNumbers.pop());
        } else if (seqFront === seqBack) {
            if (Math.abs(seqFront - listFront) >= Math.abs(seqFront - listBack)) {
                resultSequence.push(sortedNumbers.shift());
            } else {
                resultSequence.push(sortedNumbers.pop());
            }
        } else if (listFront === listBack) {
            if (Math.abs(seqFront - listFront) >= Math.abs(seqBack - listFront)) {
                resultSequence.unshift(sortedNumbers.shift());
            } else {
                resultSequence.push(sortedNumbers.shift());
            }
        } else {
            const diff_LF_SF = Math.abs(listFront - seqFront);
            const diff_LF_SB = Math.abs(listFront - seqBack);
            const diff_LB_SF = Math.abs(listBack - seqFront);
            const diff_LB_SB = Math.abs(listBack - seqBack);

            const potentialMoves = [
                { diff: diff_LF_SF, action: () => resultSequence.unshift(sortedNumbers.pop()) },
                { diff: diff_LF_SB, action: () => resultSequence.push(sortedNumbers.shift()) },
                { diff: diff_LB_SF, action: () => resultSequence.unshift(sortedNumbers.pop()) },
                { diff: diff_LB_SB, action: () => resultSequence.push(sortedNumbers.pop()) }
            ];

            const maxDifferenceValue = Math.max(...potentialMoves.map(move => move.diff));
            const chosenMove = potentialMoves.find(move => move.diff === maxDifferenceValue);
            
            chosenMove.action();
        }
    }

    for (let idx = 1; idx < elementCount; idx++) {
        totalDifference += Math.abs(resultSequence[idx - 1] - resultSequence[idx]);
    }
    outputResult(totalDifference);
}
