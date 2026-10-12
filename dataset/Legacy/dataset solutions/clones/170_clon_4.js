const fileSystem = require('fs');
const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = standardInputContent.trim().split('\n');
let currentLinePointer = 0;

const retrieveNumericLine = () => Number(inputLines[currentLinePointer++]);
const retrieveAndSplitLine = () => inputLines[currentLinePointer++].split(',');

let caseIdentifier = 1;

while (true) {
    const knapsackCapacity = retrieveNumericLine();
    if (knapsackCapacity === 0) {
        break;
    }

    const itemCount = retrieveNumericLine();
    
    const valueMatrix = Array.from({ length: knapsackCapacity + 1 }, () => 0);

    const itemCollection = [];
    for (let i = 0; i < itemCount; i++) {
        const itemComponents = retrieveAndSplitLine();
        itemCollection.push({
            itemValue: Number(itemComponents[0]),
            itemWeight: Number(itemComponents[1])
        });
    }

    itemCollection.forEach(item => {
        const { itemValue, itemWeight } = item;
        for (let currentCapacity = knapsackCapacity; currentCapacity >= itemWeight; currentCapacity--) {
            valueMatrix[currentCapacity] = Math.max(
                valueMatrix[currentCapacity - itemWeight] + itemValue,
                valueMatrix[currentCapacity]
            );
        }
    });

    let optimalValue = 0;
    let optimalWeight = 0;

    valueMatrix.forEach((currentValue, weightIndex) => {
        if (currentValue > optimalValue) {
            optimalValue = currentValue;
            optimalWeight = weightIndex;
        }
    });
    
    console.log(`Case ${caseIdentifier++}:\n${optimalValue}\n${optimalWeight}`);
}
