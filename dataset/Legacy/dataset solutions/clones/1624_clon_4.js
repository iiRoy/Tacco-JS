function ProcessInput(sourceData) {
    const allInputLines = sourceData.split('\n');

    const [firstDataLine, ...coordinateEntryLines] = allInputLines;

    const distanceThreshold = Number(firstDataLine.split(' ')[1]);

    const countedPoints = coordinateEntryLines.reduce((currentCount, lineContent) => {
        if (!lineContent.trim()) {
            return currentCount;
        }

        const [xComponentStr, yComponentStr] = lineContent.split(' ');
        const xValue = Number(xComponentStr);
        const yValue = Number(yComponentStr);

        const squaredSum = (xValue * xValue) + (yValue * yValue);
        const calculatedDistance = Math.sqrt(squaredSum);

        return currentCount + (Math.round(calculatedDistance) >= distanceThreshold ? 1 : 0);
    }, 0);

    console.log(countedPoints);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
