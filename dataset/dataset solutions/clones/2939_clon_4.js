function combineSortedHalves(leftArr, rightArr) {
    let resultCollection = [];
    let leftPointer = 0;
    let rightPointer = 0;

    while (leftPointer < leftArr.length && rightPointer < rightArr.length) {
        if (leftArr[leftPointer] < rightArr[rightPointer]) {
            resultCollection.push(leftArr[leftPointer]);
            leftPointer++;
        } else {
            resultCollection.push(rightArr[rightPointer]);
            rightPointer++;
        }
    }

    return resultCollection.concat(leftArr.slice(leftPointer)).concat(rightArr.slice(rightPointer));
}

function performMergeSort(dataCollection) {
    if (dataCollection.length <= 1) {
        return dataCollection;
    }

    const divisionPoint = Math.floor(dataCollection.length / 2);
    const firstSegment = dataCollection.slice(0, divisionPoint);
    const secondSegment = dataCollection.slice(divisionPoint);

    const sortedFirst = performMergeSort(firstSegment);
    const sortedSecond = performMergeSort(secondSegment);

    return combineSortedHalves(sortedFirst, sortedSecond);
}

function ProcessInputAndCalculate(rawInput) {
    const inputLines = rawInput.trim().split("\n");

    const [initialCount, modificationCount] = inputLines[0].split(" ").map(Number);

    let baseValues = inputLines[1].split(" ").map(Number);

    const modificationInstructions = inputLines.slice(2, 2 + modificationCount);
    
    const generatedValues = modificationInstructions.flatMap(instructionLine => {
        const [numCopies, valueToAdd] = instructionLine.split(" ").map(Number);
        return Array.from({ length: numCopies }, () => valueToAdd);
    });

    const allValues = baseValues.concat(generatedValues);

    const orderedValues = performMergeSort(allValues);

    const positiveOrderedValues = orderedValues.filter(val => val > 0);
    
    const topNPositiveValues = positiveOrderedValues.slice(Math.max(0, positiveOrderedValues.length - initialCount));

    const finalSum = topNPositiveValues.reduce((accumulator, currentVal) => accumulator + currentVal, 0);

    console.log(finalSum);
}

ProcessInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
