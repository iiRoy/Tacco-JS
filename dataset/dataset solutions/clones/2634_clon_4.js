function processInputData(rawInput) {
    const lines = rawInput.split('\n');
    const numericStrings = lines[1].split(' ');
    return numericStrings.map(str => Number(str));
}

function computeAggregatedMean(initialNumericSet) {
    let workingCollection = [...initialNumericSet];

    while (workingCollection.length > 1) {
        let minimumValA = Infinity;
        let minimumValB = Infinity;
        let indexForA = -1;
        let indexForB = -1;

        for (let currentIdx = 0; currentIdx < workingCollection.length; currentIdx++) {
            const currentElement = workingCollection[currentIdx];
            if (currentElement < minimumValA) {
                minimumValB = minimumValA;
                indexForB = indexForA;
                minimumValA = currentElement;
                indexForA = currentIdx;
            } else if (currentElement < minimumValB) {
                minimumValB = currentElement;
                indexForB = currentIdx;
            }
        }

        if (indexForA > indexForB) {
            workingCollection.splice(indexForA, 1);
            workingCollection.splice(indexForB, 1);
        } else {
            workingCollection.splice(indexForB, 1);
            workingCollection.splice(indexForA, 1);
        }

        workingCollection.push((minimumValA + minimumValB) / 2.0);
    }

    return workingCollection[0];
}

function EntryPoint(sourceText) {
    const parsedNumbers = processInputData(sourceText);
    const finalResult = computeAggregatedMean(parsedNumbers);
    console.log(finalResult - 0.0);
}

EntryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
