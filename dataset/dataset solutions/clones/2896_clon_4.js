function processInputData(rawInput) {
    const inputLines = rawInput.split('\n').map(s => s.trim()).filter(Boolean);

    const count = parseInt(inputLines[0], 10);

    const sidePairs = inputLines.slice(1, -1).map(line => {
        const pairElements = line.split(' ').map(Number);
        return pairElements.sort((a, b) => a - b);
    });

    const availableValues = inputLines[inputLines.length - 1]
        .split(' ')
        .map(Number)
        .sort((a, b) => b - a)
        .slice(0, count);

    return { count, sidePairs, availableValues };
}

function organizeAndCalculate(data) {
    const { availableValues, sidePairs } = data;

    const groupedByFirstElement = sidePairs.reduce((accumulator, currentPair) => {
        const firstElement = currentPair[0];
        if (!accumulator.has(firstElement)) {
            accumulator.set(firstElement, []);
        }
        accumulator.get(firstElement).push(currentPair);
        return accumulator;
    }, new Map());

    const groupsArray = Array.from(groupedByFirstElement.values());

    groupsArray.sort((groupA, groupB) => groupB.length - groupA.length);

    const orderedPairs = groupsArray.flat();

    const calculationState = orderedPairs.reduce((acc, currentPair) => {
        let currentSum = acc.currentSum;
        const elementAssignments = acc.elementAssignments;
        let valueIndex = acc.valueIndex;

        const [firstSideElement, secondSideElement] = currentPair;

        if (!elementAssignments.has(firstSideElement)) {
            elementAssignments.set(firstSideElement, availableValues[valueIndex]);
            valueIndex++;
        }
        if (!elementAssignments.has(secondSideElement)) {
            elementAssignments.set(secondSideElement, availableValues[valueIndex]);
            valueIndex++;
        }

        currentSum += Math.min(elementAssignments.get(firstSideElement), elementAssignments.get(secondSideElement));

        return {
            currentSum: currentSum,
            elementAssignments: elementAssignments,
            valueIndex: valueIndex
        };
    }, { currentSum: 0, elementAssignments: new Map(), valueIndex: 0 });

    return {
        finalSum: calculationState.currentSum,
        originalValuesForOutput: availableValues
    };
}

function executeMain(inputContent) {
    const processedData = processInputData(inputContent);
    const calculationResult = organizeAndCalculate(processedData);

    console.log(calculationResult.finalSum + '\n' + calculationResult.originalValuesForOutput.join(" "));
}

executeMain(require("fs").readFileSync("/dev/stdin", "utf8"));
