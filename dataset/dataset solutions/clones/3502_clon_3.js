function processInput(rawData) {
    function transformDigit(digitChar) {
        let currentTransformedValue;
        switch (digitChar) {
            case '1':
                currentTransformedValue = '9';
                break;
            case '9':
                currentTransformedValue = '1';
                break;
            default:
                currentTransformedValue = digitChar;
                break;
        }
        return currentTransformedValue;
    }

    const inputSegments = [rawData[0], rawData[1], rawData[2]];
    let intermediateTransformedSegments = [];

    for (let segmentIndex = 0; segmentIndex < inputSegments.length; segmentIndex++) {
        const currentSegmentChar = inputSegments[segmentIndex];
        const processedSegmentChar = transformDigit(currentSegmentChar);
        intermediateTransformedSegments.push(processedSegmentChar);
    }

    const finalOutputString = intermediateTransformedSegments.join('');
    return finalOutputString;
}

console.log(processInput(require("fs").readFileSync("/dev/stdin", "utf8")));
