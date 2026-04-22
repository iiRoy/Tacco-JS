const calculateDeviation = (incomingText) => {
    const referenceSequence = "CODEFESTIVAL2016";
    const incomingChars = incomingText.split('');

    const totalMismatches = incomingChars.reduce((errorCount, currentInputChar, index) => {
        if (currentInputChar !== referenceSequence[index]) {
            return errorCount + 1;
        }
        return errorCount;
    }, 0);

    console.log(totalMismatches);
};

calculateDeviation(require("fs").readFileSync("/dev/stdin", "utf8").trim());