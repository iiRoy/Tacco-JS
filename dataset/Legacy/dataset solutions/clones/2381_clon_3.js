const parseNumericLine = (lineString) => lineString.split(" ").map(val => parseInt(val, 10));

function processInputData(rawData) {
    const processedLines = rawData.trim().split("\n").map(parseNumericLine);

    const [timePeriod1, timePeriod2] = processedLines[0];
    const [rateA1, rateA2] = processedLines[1];
    const [rateB1, rateB2] = processedLines[2];

    const period1NetRate = BigInt(rateA1 - rateB1);
    const period2NetRate = BigInt(rateA2 - rateB2);

    const initialDifference = period1NetRate * BigInt(timePeriod1);
    let cumulativeDifference = period2NetRate * BigInt(timePeriod2) + initialDifference;

    let finalResult;

    if (cumulativeDifference === 0n) {
        finalResult = 'infinity';
    } else if (initialDifference * cumulativeDifference < 0n) {
        const absoluteCumulativeDifference = cumulativeDifference < 0n ? -cumulativeDifference : cumulativeDifference;
        const baseQuotient = initialDifference / absoluteCumulativeDifference;
        const hasRemainder = initialDifference % absoluteCumulativeDifference !== 0n;
        finalResult = baseQuotient * 2n + (hasRemainder ? 1n : 0n);
    } else {
        finalResult = 0n;
    }

    console.log(finalResult.toString());
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
