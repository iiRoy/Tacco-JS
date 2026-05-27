function processNumericData(rawData) {
    const lineSegments = rawData.split('\n');

    const primaryValue = Number(lineSegments[0]);
    const secondaryValue = Number(lineSegments[1]);
    const tertiaryValue = Number(lineSegments[2]);

    const commonIncrement = primaryValue + 1;

    const commonIncrementSquared = commonIncrement * commonIncrement;
    const sumOfOtherValues = secondaryValue + tertiaryValue;
    const productOfCommonAndSum = commonIncrement * sumOfOtherValues;
    const productOfOtherValues = secondaryValue * tertiaryValue;

    const computedOutcome = commonIncrementSquared - productOfCommonAndSum + productOfOtherValues;

    console.log(computedOutcome);
}

processNumericData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
