const assessNumericPattern = (incomingData) => {
    const segmentCollection = incomingData.split('\n');
    const targetSegment = segmentCollection[1];
    const transformedNumbers = targetSegment.split(' ').map(strVal => parseInt(strVal, 10));

    const totalOddOccurrences = transformedNumbers.filter(numVal => (numVal & 1) !== 0).length;

    const outcomeMessage = (totalOddOccurrences % 2 === 0) ? "YES" : "NO";

    console.log(outcomeMessage);
};

const obtainExternalPayload = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim();
};

assessNumericPattern(obtainExternalPayload());