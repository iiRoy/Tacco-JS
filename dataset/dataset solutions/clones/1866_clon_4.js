const calculateResult = (positiveItemCount, neutralItemCount, negativeItemCount, totalPicks) => {
    const scoreAddingUnits = Math.min(totalPicks, positiveItemCount);
    const picksAfterPositives = totalPicks - scoreAddingUnits;
    const neutralUnitsObtained = Math.min(picksAfterPositives, neutralItemCount);
    const scoreSubtractingUnits = picksAfterPositives - neutralUnitsObtained;
    return scoreAddingUnits - scoreSubtractingUnits;
};

const parseNumericSequence = (rawData) => {
    const collectedNumbers = [];
    let currentNumberString = '';
    for (let charIndex = 0; charIndex < rawData.length; charIndex++) {
        const character = rawData[charIndex];
        if (character >= '0' && character <= '9') {
            currentNumberString += character;
        } else if (currentNumberString !== '') {
            collectedNumbers.push(Number(currentNumberString));
            currentNumberString = '';
        }
    }
    if (currentNumberString !== '') {
        collectedNumbers.push(Number(currentNumberString));
    }
    return collectedNumbers;
};

const acquireRawInput = () => {
    const inputBuffer = Buffer.alloc(1024);
    const bytesReadCount = require('node:fs').readSync(0, inputBuffer, 0, inputBuffer.length, 0);
    return inputBuffer.toString('utf8', 0, bytesReadCount);
};

const rawTextFromStream = acquireRawInput();
const processedNumericalData = parseNumericSequence(rawTextFromStream);

const [initialValue, secondaryValue, tertiaryValue, selectionLimit] = processedNumericalData;

const finalComputedOutcome = calculateResult(initialValue, secondaryValue, tertiaryValue, selectionLimit);

process.stdout.write(String(finalComputedOutcome));