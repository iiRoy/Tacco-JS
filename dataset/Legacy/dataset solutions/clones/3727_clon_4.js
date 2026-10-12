function processInput(rawData) {
    const dataLines = rawData.split("\n");
    const [_, coverageWidthStr] = dataLines[0].split(" ");
    const elementSequence = dataLines[1].split(" ");

    const coverageWidth = Number(coverageWidthStr);
    const sequenceLength = elementSequence.length;

    const oneMarkerPosition = elementSequence.findIndex(item => item === "1");

    const leftSideCount = oneMarkerPosition;
    const rightSideCount = sequenceLength - 1 - oneMarkerPosition;

    const effectiveCoveragePerOperation = coverageWidth - 1;

    let calculatedOperationTotal = 0;

    if (leftSideCount > 0) {
        calculatedOperationTotal += Math.ceil(leftSideCount / effectiveCoveragePerOperation);
    }

    if (rightSideCount > 0) {
        calculatedOperationTotal += Math.ceil(rightSideCount / effectiveCoveragePerOperation);
    }

    const totalPeripheralElements = leftSideCount + rightSideCount;
    const finalAdjustment = (totalPeripheralElements <= coverageWidth && calculatedOperationTotal > 0) ? -1 : 0;

    const finalResult = calculatedOperationTotal + finalAdjustment;

    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
