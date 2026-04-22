const performBubbleSort = (arrToSort) => {
    const arrayLength = arrToSort.length;
    const temporaryArray = [...arrToSort];
    for (let currentIteration = 0; currentIteration < arrayLength - 1; currentIteration++) {
        for (let innerIndex = 0; innerIndex < arrayLength - 1 - currentIteration; innerIndex++) {
            if (temporaryArray[innerIndex] > temporaryArray[innerIndex + 1]) {
                [temporaryArray[innerIndex], temporaryArray[innerIndex + 1]] = [temporaryArray[innerIndex + 1], temporaryArray[innerIndex]];
            }
        }
    }
    return temporaryArray;
};

const evaluateArrangement = (rawDataInput) => {
    const dataLines = rawDataInput.split('\n');
    const numericalEntities = dataLines[1].split(' ').map(Number);

    const correctlyOrderedEntities = performBubbleSort(numericalEntities);

    const discrepancyCount = numericalEntities.map((currentValue, currentIndex) => 
        (currentValue === correctlyOrderedEntities[currentIndex] ? 0 : 1)
    ).reduce((accumulator, item) => accumulator + item, 0);

    const finalVerdict = (discrepancyCount <= 2) ? "YES" : "NO";
    console.log(finalVerdict);
};

evaluateArrangement(require("fs").readFileSync("/dev/stdin", "utf8"));