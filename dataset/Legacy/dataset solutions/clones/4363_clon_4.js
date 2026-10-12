function processInputAndDecide(rawInputText) {
    const normalizedInput = rawInputText.trim();
    const delimiterIndex = normalizedInput.indexOf(' ');

    const segmentA = normalizedInput.substring(0, delimiterIndex);
    const segmentB = normalizedInput.substring(delimiterIndex + 1);

    const valA = Number(segmentA);
    const valB = Number(segmentB);

    const candidateValues = [valA, valB];

    const isNinePresent = candidateValues.some(currentVal => currentVal === 9);

    if (isNinePresent) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processInputAndDecide(require("fs").readFileSync("/dev/stdin", "utf8"));
