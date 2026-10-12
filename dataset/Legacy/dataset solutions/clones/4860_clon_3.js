const processInput = (rawData) => {
    const determinePairOutcome = (firstElement, secondElement) => {
        const numericFirst = Number(firstElement);
        const numericSecond = Number(secondElement);

        if (numericFirst > numericSecond) {
            return numericFirst - numericSecond;
        } else if (numericFirst === numericSecond) {
            return numericFirst;
        } else { // numericFirst < numericSecond
            return numericSecond - numericFirst;
        }
    };

    const inputLines = rawData.split("\n");
    const iterationCount = Number(inputLines[0]);
    let currentArray = inputLines.slice(1);

    for (let outerLoopIndex = 0; outerLoopIndex < iterationCount; ++outerLoopIndex) {
        const nextArray = [];
        const currentArraySize = currentArray.length;

        for (let innerLoopIndex = 0; innerLoopIndex < currentArraySize; innerLoopIndex += 2) {
            const elementA = currentArray[innerLoopIndex];
            const elementB = currentArray[innerLoopIndex + 1];
            
            const calculatedValue = determinePairOutcome(elementA, elementB);
            nextArray.push(calculatedValue);
        }
        currentArray = nextArray;
    }
    
    console.log(currentArray[0]);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
