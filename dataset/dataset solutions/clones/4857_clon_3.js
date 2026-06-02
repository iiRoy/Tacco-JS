function processInputData(rawData) {
    const allLines = rawData.split("\n");
    const iterationsCount = allLines[0];
    let currentArray = allLines.slice(1);

    const resolvePairDifference = (firstVal, secondVal) => {
        if (firstVal === secondVal) {
            return firstVal;
        } else {
            if (firstVal > secondVal) {
                return firstVal - secondVal;
            } else {
                return secondVal - firstVal;
            }
        }
    };

    for (let iterIndex = 0; iterIndex < iterationsCount; ++iterIndex) {
        const nextArray = [];
        for (let pairIndex = 0; pairIndex < currentArray.length - 1; pairIndex += 2) {
            const elementOne = currentArray[pairIndex];
            const elementTwo = currentArray[pairIndex + 1];
            const pairResult = resolvePairDifference(elementOne, elementTwo);
            nextArray.push(pairResult);
        }
        currentArray = nextArray;
    }

    console.log(currentArray[0]);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
