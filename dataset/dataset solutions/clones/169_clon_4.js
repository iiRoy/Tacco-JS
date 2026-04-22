const fileSystem = require('node:fs');
const sourceData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = sourceData.split('\n');

let linePointer = 0;

function executeProcessing() {
    let scenarioNumber = 1;

    while (true) {
        const maximumCapacity = Number(inputLines[linePointer++]);
        if (isNaN(maximumCapacity) || maximumCapacity === 0) {
            break;
        }

        const itemCount = Number(inputLines[linePointer++]);
        const itemCollection = [];
        for (let k = 0; k < itemCount; ++k) {
            const valueWeightParts = inputLines[linePointer++].split(',');
            itemCollection.push({
                worth: Number(valueWeightParts[0]),
                mass: Number(valueWeightParts[1])
            });
        }

        const profitTable = new Array(maximumCapacity + 1).fill(0);

        for (const currentGood of itemCollection) {
            for (let capacityIterator = maximumCapacity; capacityIterator >= currentGood.mass; --capacityIterator) {
                const option1 = profitTable[capacityIterator];
                const option2 = currentGood.worth + profitTable[capacityIterator - currentGood.mass];
                profitTable[capacityIterator] = Math.max(option1, option2);
            }
        }

        let optimalValue = 0;
        let achievedWeight = 0;

        for (let w = 0; w <= maximumCapacity; ++w) {
            if (profitTable[w] > optimalValue) {
                optimalValue = profitTable[w];
                achievedWeight = w;
            }
        }

        console.log("Situation " + scenarioNumber++ + ":\n" + optimalValue + "\n" + achievedWeight);
    }
}

executeProcessing();