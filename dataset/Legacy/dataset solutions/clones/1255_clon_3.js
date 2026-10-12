process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (dataChunk) {
    let rawInputLines = dataChunk.split("\n");

    const validInputLines = rawInputLines.filter(lineContent => lineContent.trim() !== "");

    const expectedNumberCount = Number(validInputLines[0]);
    const numberValueStrings = validInputLines[1].split(" ");

    const firstNumericElement = Number(numberValueStrings[0]);
    let minimumFound = firstNumericElement;
    let maximumFound = firstNumericElement;
    let cumulativeSum = firstNumericElement;

    for (let currentIdx = 1; currentIdx < expectedNumberCount; currentIdx++) {
        const currentNumericValue = Number(numberValueStrings[currentIdx]);

        if (currentNumericValue < minimumFound) {
            minimumFound = currentNumericValue;
        }

        if (currentNumericValue > maximumFound) {
            maximumFound = currentNumericValue;
        }

        cumulativeSum += currentNumericValue;
    }

    const finalResultString = `${minimumFound} ${maximumFound} ${cumulativeSum}`;
    console.log(finalResultString);
});
