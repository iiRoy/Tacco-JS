process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (inputData) {
    const INCREMENT_INDICATOR_CHAR = "I";

    let rawInputLines = inputData.toString().split('\n');
    let totalOperationsCount = parseInt(rawInputLines[0], 10);
    let operationSequenceString = rawInputLines[1];

    let currentBalanceLevel = 0;
    let peakBalanceLevelAchieved = 0;

    const determineNewPeak = (currentVal, peakVal) => {
        return currentVal > peakVal ? currentVal : peakVal;
    };

    for (let operationIndex = 0; operationIndex < totalOperationsCount; operationIndex++) {
        let charAtCurrentPosition = operationSequenceString.charAt(operationIndex);

        if (charAtCurrentPosition === INCREMENT_INDICATOR_CHAR) {
            currentBalanceLevel = currentBalanceLevel + 1;
            peakBalanceLevelAchieved = determineNewPeak(currentBalanceLevel, peakBalanceLevelAchieved);
        } else {
            // Any other character implies a decrement based on the original logic
            currentBalanceLevel = currentBalanceLevel - 1;
        }
    }

    console.log(peakBalanceLevelAchieved);
});
