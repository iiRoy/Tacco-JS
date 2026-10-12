function calculateSequenceSum(inputData) {
    const elementCount = parseInt(inputData[0], 10);
    const numberSeries = inputData.slice(1).map(item => parseInt(item, 10));

    const finalResult = numberSeries.slice(1).reduce((currentAccumulator, currentItem, currentPosition) => {
        const originalIndex = currentPosition + 1;
        if (originalIndex === elementCount - 1) {
            return currentAccumulator + numberSeries[originalIndex - 1];
        } else {
            return currentAccumulator + Math.min(numberSeries[originalIndex - 1], numberSeries[originalIndex]);
        }
    }, numberSeries[0]);

    console.log(finalResult);
}

calculateSequenceSum(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
