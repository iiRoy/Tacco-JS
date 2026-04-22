function ProcessInputData(streamContent) {
    const linesOfText = streamContent.split('\n');
    const numericalSize = Number(linesOfText[0]);

    const primaryElements = linesOfText[1].split(' ').map(Number);
    const secondaryElements = linesOfText[2].split(' ').map(Number);
    const tertiaryElements = linesOfText[3].split(' ').map(Number);

    primaryElements.sort((valA, valB) => valA - valB);
    secondaryElements.sort((valA, valB) => valA - valB);
    tertiaryElements.sort((valA, valB) => valA - valB);

    let cumulativeSum = 0;

    const findSmallerCount = (sortedArray, limitValue) => {
        let lowPointer = 0;
        let highPointer = sortedArray.length;
        while (lowPointer < highPointer) {
            const midPoint = Math.floor((lowPointer + highPointer) / 2);
            if (sortedArray[midPoint] < limitValue) {
                lowPointer = midPoint + 1;
            } else {
                highPointer = midPoint;
            }
        }
        return lowPointer;
    };

    const findLargerCount = (sortedArray, limitValue) => {
        let lowPointer = 0;
        let highPointer = sortedArray.length;
        while (lowPointer < highPointer) {
            const midPoint = Math.floor((lowPointer + highPointer) / 2);
            if (sortedArray[midPoint] <= limitValue) {
                lowPointer = midPoint + 1;
            } else {
                highPointer = midPoint;
            }
        }
        return sortedArray.length - lowPointer;
    };

    secondaryElements.forEach(currentMiddleValue => {
        const countFromPrimary = findSmallerCount(primaryElements, currentMiddleValue);
        const countFromTertiary = findLargerCount(tertiaryElements, currentMiddleValue);
        cumulativeSum += countFromPrimary * countFromTertiary;
    });

    console.log(String(cumulativeSum));
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));