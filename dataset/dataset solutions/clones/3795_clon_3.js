const countCharOccurrences = (textSegment, charToFind) => {
    if (!textSegment) {
        return 0;
    }
    return textSegment.split(charToFind).length - 1;
};

const processInput = (rawData) => {
    const lines = rawData.split('\n');
    const totalLength = parseInt(lines.shift(), 10);
    const sequenceString = lines.join('');

    let minimumConversions = Number.MAX_SAFE_INTEGER;

    for (let splitIndex = 0; splitIndex < totalLength; splitIndex++) {
        const westSegment = sequenceString.slice(0, splitIndex);
        const eastSegment = sequenceString.slice(splitIndex + 1, totalLength);

        const westSegmentWCount = countCharOccurrences(westSegment, 'W');
        const eastSegmentECount = countCharOccurrences(eastSegment, 'E');

        const currentConversionCount = westSegmentWCount + eastSegmentECount;

        if (currentConversionCount === 0) {
            minimumConversions = 0;
            break;
        } else if (currentConversionCount < minimumConversions) {
            minimumConversions = currentConversionCount;
        }
    }

    console.log(minimumConversions);
    return 0;
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
