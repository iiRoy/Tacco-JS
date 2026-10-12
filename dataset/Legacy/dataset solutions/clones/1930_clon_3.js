function processData(rawInputString) {
    const parseNumericInput = (inputStr) => {
        return inputStr.split(' ').map(strValue => parseInt(strValue, 10));
    };

    const numericValues = parseNumericInput(rawInputString);
    const [limitValueN, outputQuantityM] = numericValues;

    const formatPairString = (valA, valB) => `${valA} ${valB}`;

    let generatedPairList = [];

    const isLimitOdd = (limitValueN % 2 !== 0);

    if (isLimitOdd) {
        let currentLeftPointer = 1;
        let currentRightPointer = limitValueN - 1;
        while (currentLeftPointer < currentRightPointer) {
            generatedPairList.push(formatPairString(currentLeftPointer, currentRightPointer));
            currentLeftPointer++;
            currentRightPointer--;
        }
    } else {
        let currentLeftPointer = 1;
        let currentRightPointer = limitValueN - 1;
        let hasAdjustmentBeenMade = false;
        const thresholdForAdjustment = limitValueN / 2;

        while (currentLeftPointer < currentRightPointer) {
            const currentRangeDifference = currentRightPointer - currentLeftPointer;
            if (!hasAdjustmentBeenMade && currentRangeDifference <= thresholdForAdjustment) {
                currentRightPointer--;
                hasAdjustmentBeenMade = true;
            }
            generatedPairList.push(formatPairString(currentLeftPointer, currentRightPointer));
            currentLeftPointer++;
            currentRightPointer--;
        }
    }

    for (let outputIndex = 0; outputIndex < outputQuantityM; outputIndex++) {
        console.log(generatedPairList[outputIndex]);
    }
}

// processData('12 5')

// Don't edit this line!
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
