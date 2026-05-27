function processInputData(rawDataString) {
    const newlinePosition = rawDataString.indexOf('\n');

    const firstLineSegment = rawDataString.substring(0, newlinePosition);
    const secondLineSegment = rawDataString.substring(newlinePosition + 1);

    const initialValueNegated = 0 - Number(firstLineSegment);

    let accumulatedSum = 0;
    let currentParsingIndex = 0;
    let nextDelimiterIndex;

    while (currentParsingIndex < secondLineSegment.length) {
        nextDelimiterIndex = secondLineSegment.indexOf(' ', currentParsingIndex);

        let numericStringFragment;
        if (nextDelimiterIndex === -1) {
            numericStringFragment = secondLineSegment.substring(currentParsingIndex);
            currentParsingIndex = secondLineSegment.length;
        } else {
            numericStringFragment = secondLineSegment.substring(currentParsingIndex, nextDelimiterIndex);
            currentParsingIndex = nextDelimiterIndex + 1;
        }

        if (numericStringFragment.length > 0) {
            accumulatedSum += parseInt(numericStringFragment, 10);
        }
    }

    console.log(initialValueNegated + accumulatedSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
