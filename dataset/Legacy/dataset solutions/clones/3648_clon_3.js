let inputLineData;
let finalComputedSum = 0;
let charSequenceArray;
const targetCharacterSet = ["A", "B", "C"];
const MODULO_CONSTANT = 1000000007;

const readlineInterface = require('readline');
const rlInstance = readlineInterface.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rlInstance.on('line', (inputStr) => {
    inputLineData = inputStr;
});

rlInstance.on('close', () => {
    charSequenceArray = inputLineData.split("");
    const initialCombination = Array(charSequenceArray.length);
    recursivelyGenerateCombinations(0, initialCombination);
    console.log(finalComputedSum);
});

function recursivelyGenerateCombinations(currentPosition, currentComboState) {
    const sequenceLength = charSequenceArray.length;

    if (currentPosition === sequenceLength) {
        calculateCombinationValue(currentComboState);
        return;
    }

    const currentChar = charSequenceArray[currentPosition];

    if (currentChar === "?") {
        for (const charOption of targetCharacterSet) {
            currentComboState[currentPosition] = charOption;
            recursivelyGenerateCombinations(currentPosition + 1, currentComboState);
        }
    } else {
        currentComboState[currentPosition] = currentChar;
        recursivelyGenerateCombinations(currentPosition + 1, currentComboState);
    }
}

function calculateCombinationValue(processedCombination) {
    const comboLength = processedCombination.length;
    const dpTable = Array.from({ length: comboLength }, () => Array(3).fill(0));

    if (processedCombination[0] === targetCharacterSet[0]) {
        dpTable[0][0] = 1;
    }

    for (let k = 1; k < comboLength; k++) {
        if (processedCombination[k] === targetCharacterSet[0]) {
            dpTable[k][0] = dpTable[k - 1][0] + 1;
        } else {
            dpTable[k][0] = dpTable[k - 1][0];
        }
    }

    for (let charTypeIndex = 1; charTypeIndex < targetCharacterSet.length; charTypeIndex++) {
        const charOccurrenceMap = {};

        for (let seqIndex = 1; seqIndex < comboLength; seqIndex++) {
            const currentComboChar = processedCombination[seqIndex];

            if (charOccurrenceMap[currentComboChar] === undefined) {
                charOccurrenceMap[currentComboChar] = 0;
            }

            if (currentComboChar === targetCharacterSet[charTypeIndex] && dpTable[seqIndex - 1][charTypeIndex - 1] !== 0) {
                dpTable[seqIndex][charTypeIndex] = dpTable[seqIndex - 1][charTypeIndex - 1] + charOccurrenceMap[currentComboChar];
                charOccurrenceMap[currentComboChar]++;
            } else {
                dpTable[seqIndex][charTypeIndex] = dpTable[seqIndex - 1][charTypeIndex];
            }
        }
    }
    finalComputedSum += (dpTable[comboLength - 1][2] % MODULO_CONSTANT);
}
