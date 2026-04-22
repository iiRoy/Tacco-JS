const primaryExecution = (inputData) => {
    const parsedLines = inputData.trim().split("\n");
    const digitSequence = parsedLines[1].split("").map(char => parseInt(char, 10));

    const uniqueCodesIdentified = new Set();

    for (let firstVal = 0; firstVal <= 9; ++firstVal) {
        for (let secondVal = 0; secondVal <= 9; ++secondVal) {
            for (let thirdVal = 0; thirdVal <= 9; ++thirdVal) {
                const currentTriplet = [firstVal, secondVal, thirdVal];

                const finalPosition = currentTriplet.reduce((currentScanIndex, targetDigit) => {
                    if (currentScanIndex === -1) {
                        return -1;
                    }
                    const searchStartIndex = currentScanIndex + 1;
                    const foundDigitIndex = digitSequence.indexOf(targetDigit, searchStartIndex);
                    return foundDigitIndex;
                }, -1);

                if (finalPosition !== -1) {
                    uniqueCodesIdentified.add(firstVal * 100 + secondVal * 10 + thirdVal);
                }
            }
        }
    }

    console.log(uniqueCodesIdentified.size);
};

primaryExecution(require('fs').readFileSync('/dev/stdin', 'utf8'));