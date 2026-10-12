function processInputData(rawData) {
    const lines = rawData.split("\n");
    const firstLineParts = lines[0].split(" ");
    const elementCount = Number(firstLineParts[0]);

    let currentValues = lines[1].split(" ").map(Number);
    const recordedOperations = [];

    const maximumValue = Math.max(...currentValues);
    const minimumValue = Math.min(...currentValues);

    if (maximumValue >= Math.abs(minimumValue)) {
        const sourceIndexForMax = currentValues.findIndex(val => val === maximumValue);

        Array.from({ length: elementCount }, (_, targetIndex) => targetIndex)
            .filter(targetIndex => targetIndex !== sourceIndexForMax)
            .forEach(targetIndex => {
                recordedOperations.push([sourceIndexForMax + 1, targetIndex + 1]);
                currentValues[targetIndex] += maximumValue;
            });

        Array.from({ length: elementCount - 1 }, (_, offset) => offset + 1)
            .forEach(currentIndex => {
                if (currentValues[currentIndex] < currentValues[currentIndex - 1]) {
                    recordedOperations.push([currentIndex, currentIndex + 1]);
                    currentValues[currentIndex] += currentValues[currentIndex - 1];
                }
            });
    } else if (Math.abs(minimumValue) > maximumValue) {
        const sourceIndexForMin = currentValues.findIndex(val => val === minimumValue);

        Array.from({ length: elementCount }, (_, targetIndex) => targetIndex)
            .filter(targetIndex => targetIndex !== sourceIndexForMin)
            .forEach(targetIndex => {
                recordedOperations.push([sourceIndexForMin + 1, targetIndex + 1]);
                currentValues[targetIndex] += minimumValue;
            });

        Array.from({ length: elementCount - 1 }, (_, offset) => elementCount - 2 - offset)
            .forEach(currentIndex => {
                if (currentValues[currentIndex] > currentValues[currentIndex + 1]) {
                    recordedOperations.push([currentIndex + 2, currentIndex + 1]);
                    currentValues[currentIndex] += currentValues[currentIndex + 1];
                }
            });
    }

    const outputLines = [recordedOperations.length, ...recordedOperations.map(op => op.join(' '))];
    console.log(outputLines.join('\n'));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
