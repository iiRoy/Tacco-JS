const fileSystemModule = require('fs');
const rawInputString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedInputContent = rawInputString.endsWith('\n') ? rawInputString.slice(0, -1) : rawInputString;
let processedLines = processedInputContent.split('\n');

function calculateItemPerformance(label, price, valA, valB, valC, valD, valE, valF, valS, valM) {
    const sumOfDE = valD + valE;
    const productOfFSM = valF * valS * valM;

    const totalCalculatedTime = valA + valB + valC + (sumOfDE * valM);
    const totalCalculatedProfit = productOfFSM - price;

    return [label, totalCalculatedProfit / totalCalculatedTime];
}

while (true) {
    const currentEntryCount = Number(processedLines.shift());

    if (currentEntryCount === 0) {
        break;
    }

    let computedResults = [];

    for (let entryIndex = 0; entryIndex < currentEntryCount; entryIndex++) {
        let currentLineParts = processedLines.shift().split(" ");
        const productName = currentLineParts.shift();

        const numericValues = currentLineParts.map(Number);

        const functionArguments = [productName, ...numericValues];

        computedResults.push(calculateItemPerformance.apply(null, functionArguments));
    }

    computedResults.sort((itemOne, itemTwo) => {
        const ratioOne = itemOne[1];
        const ratioTwo = itemTwo[1];
        const nameOne = itemOne[0];
        const nameTwo = itemTwo[0];

        if (ratioOne === ratioTwo) {
            return nameOne.localeCompare(nameTwo);
        } else {
            return ratioTwo - ratioOne;
        }
    });

    computedResults.forEach(outputEntry => {
        console.log(outputEntry[0]);
    });
    console.log("#");
}
