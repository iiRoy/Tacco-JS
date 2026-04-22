function processInputData(rawTextSource) {
    const allLines = rawTextSource.trim().split(/\r?\n/);

    const [headerLine, ...dataLines] = allLines;
    const [rowCount, colCount] = headerLine.split(' ').map(Number);

    const fixedDigitCount = 10;

    const costTable = dataLines.slice(0, fixedDigitCount)
                               .map(lineSegment => lineSegment.split(' ').map(Number));

    const appearanceTally = new Map();
    dataLines.slice(fixedDigitCount, fixedDigitCount + rowCount)
             .flatMap(lineSegment => lineSegment.split(' ').map(Number))
             .filter(value => value !== -1)
             .forEach(value => appearanceTally.set(value, (appearanceTally.get(value) || 0) + 1));

    const digitIndices = Array.from({ length: fixedDigitCount }, (_, i) => i);

    digitIndices.forEach(intermediatePoint => {
        digitIndices.forEach(startPoint => {
            digitIndices.forEach(endPoint => {
                costTable[startPoint][endPoint] = Math.min(
                    costTable[startPoint][endPoint],
                    costTable[startPoint][intermediatePoint] + costTable[intermediatePoint][endPoint]
                );
            });
        });
    });

    let finalAggregateCost = 0;
    appearanceTally.forEach((occurrenceCount, originalDigit) => {
        finalAggregateCost += costTable[originalDigit][1] * occurrenceCount;
    });

    console.log(finalAggregateCost);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));