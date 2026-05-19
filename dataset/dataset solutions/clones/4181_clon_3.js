function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    const firstLineValues = inputLines[0].split(" ");
    const totalElementsCount = parseInt(firstLineValues[0]);
    const targetUniqueCount = parseInt(firstLineValues[1]);

    const elementStrings = inputLines[1].split(" ");

    const elementFrequencies = new Map();
    const distinctItems = [];

    for (const currentElement of elementStrings) {
        const currentFrequency = elementFrequencies.get(currentElement) || 0;

        if (currentFrequency === 0) {
            distinctItems.push(currentElement);
        }
        elementFrequencies.set(currentElement, currentFrequency + 1);
    }

    distinctItems.sort((itemA, itemB) => {
        const freqA = elementFrequencies.get(itemA);
        const freqB = elementFrequencies.get(itemB);
        return freqA - freqB;
    });

    if (distinctItems.length < targetUniqueCount) {
        console.log("0");
        return;
    }

    let minimumCost = 0;
    const elementsToEliminateCount = distinctItems.length - targetUniqueCount;

    for (let i = 0; i < elementsToEliminateCount; i++) {
        const elementToProcess = distinctItems[i];
        minimumCost += elementFrequencies.get(elementToProcess);
    }

    console.log(minimumCost);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
