function processInput(rawData) {
    const lineSegments = rawData.split("\n");
    const elementQuantity = parseInt(lineSegments[0], 10);
    const numericStrings = lineSegments[1].split(" ");

    const initialCollection = Array.from({ length: 2 * elementQuantity - 1 }, (_, index) =>
        parseInt(numericStrings[index], 10)
    );

    const determineMiddleValue = (firstVal, secondVal, thirdVal) =>
        Math.max(Math.min(firstVal, secondVal), Math.min(thirdVal, Math.max(firstVal, secondVal)));

    const recursivelyReduceCollection = (currentCollection) => {
        if (currentCollection.length === 1) {
            return currentCollection[0];
        }

        const nextGenerationCollection = Array.from({ length: currentCollection.length - 2 }, (_, position) =>
            determineMiddleValue(currentCollection[position], currentCollection[position + 1], currentCollection[position + 2])
        );

        return recursivelyReduceCollection(nextGenerationCollection);
    };

    const finalOutcome = recursivelyReduceCollection(initialCollection);

    console.log('%d', finalOutcome);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
