const outputWriter = console.log;

if (typeof process !== "undefined") {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const rawInputLines = fileContent.split("\n");
    processInputData(rawInputLines);
}

function processInputData(rawInputLines) {
    const parsedData = rawInputLines.reduce((accumulator, currentLine) => {
        const lineContent = currentLine.trim();
        if (lineContent === "") return accumulator;

        const numericTokens = lineContent.split(/\s+/).map(Number);
        accumulator.push(numericTokens.length > 1 ? numericTokens : numericTokens[0]);
        return accumulator;
    }, []);

    const [initialConfiguration] = parsedData.splice(0, 1);
    const [itemCount, capacityLimit] = initialConfiguration;
    const itemSpecifications = parsedData;

    computeKnapsackValue(itemSpecifications, capacityLimit);
}

function computeKnapsackValue(itemSpecifications, capacityLimit) {
    const dpArray = Array(capacityLimit + 1).fill(0);

    for (const currentItem of itemSpecifications) {
        const itemVal = currentItem[0];
        const itemWt = currentItem[1];

        for (let currentWtCapacity = capacityLimit; currentWtCapacity >= itemWt; currentWtCapacity--) {
            dpArray[currentWtCapacity] = Math.max(
                dpArray[currentWtCapacity],
                dpArray[currentWtCapacity - itemWt] + itemVal
            );
        }
    }

    for (let finalWeightIndex = capacityLimit; finalWeightIndex > 0; finalWeightIndex--) {
        if (dpArray[finalWeightIndex] > 0) {
            outputWriter(dpArray[finalWeightIndex]);
            return;
        }
    }
}
