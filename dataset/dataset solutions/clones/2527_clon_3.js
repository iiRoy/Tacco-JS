process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputLines = [];
const readlineModule = require('readline');
const lineReader = readlineModule.createInterface({
    input: process.stdin,
    output: process.stdout
});

lineReader.on('line', (currentLine) => {
    inputLines.push(currentLine);
});

lineReader.on('close', () => {
    const numElementsCount = Number(inputLines[0]);

    const createOrderObject = (valueString, originalIndex) => {
        const parsedOrderValue = Number(valueString);
        return { order: parsedOrderValue, id: originalIndex + 1 };
    };

    const compareOrderObjects = (itemA, itemB) => {
        return itemA.order - itemB.order;
    };

    const rawOrderValueStrings = inputLines[1].split(" ");
    
    const indexedOrderObjects = rawOrderValueStrings.map((elementValue, originalIndex) => {
        return createOrderObject(elementValue, originalIndex);
    });

    const sortedOrderObjects = indexedOrderObjects.sort(compareOrderObjects);

    const finalIds = sortedOrderObjects.map(sortedItem => sortedItem.id);

    const sortedIdsString = finalIds.join(" ");
    
    console.log(sortedIdsString);
});
