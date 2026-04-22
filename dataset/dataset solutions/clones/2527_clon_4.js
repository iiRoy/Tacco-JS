process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputCollector = [];
const textProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

textProcessor.on('line', (itemStream) => {
    inputCollector.push(itemStream);
});

textProcessor.on('close', () => {
    const elementCount = Number(inputCollector[0]);

    const rawValues = inputCollector[1].split(" ");

    const indexedValues = [];
    for (let currentPos = 0; currentPos < rawValues.length; currentPos++) {
        indexedValues.push([Number(rawValues[currentPos]), currentPos + 1]);
    }

    const sortedIdentifiers = [];
    const workingList = [...indexedValues];

    while (workingList.length > 0) {
        let smallestValue = Infinity;
        let smallestIndexInWorkingList = -1;

        for (let j = 0; j < workingList.length; j++) {
            if (workingList[j][0] < smallestValue) {
                smallestValue = workingList[j][0];
                smallestIndexInWorkingList = j;
            }
        }
        
        sortedIdentifiers.push(workingList[smallestIndexInWorkingList][1]);
        workingList.splice(smallestIndexInWorkingList, 1);
    }

    let finalOutput = "";
    for (let k = 0; k < sortedIdentifiers.length; k++) {
        finalOutput += sortedIdentifiers[k];
        if (k < sortedIdentifiers.length - 1) {
            finalOutput += " ";
        }
    }
    
    console.log(finalOutput);
});