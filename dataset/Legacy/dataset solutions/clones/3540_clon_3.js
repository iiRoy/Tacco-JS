process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputHandler.on('close', () => {
    const firstLineData = inputLines[0].split(" ");
    let totalItems = Number(firstLineData[0]);
    let availableBudget = Number(firstLineData[1]);

    const costStrings = inputLines[1].split(" ");
    const itemCosts = costStrings.map(strVal => Number(strVal));
    itemCosts.sort((costA, costB) => costA - costB);

    let purchasedCount = 0;

    for (let itemIndex = 0; itemIndex < totalItems; itemIndex++) {
        const currentItemCost = itemCosts[itemIndex];

        if (availableBudget < 0) {
            break;
        }

        availableBudget -= currentItemCost;

        if (availableBudget >= 0) {
            purchasedCount++;
        }
    }

    console.log(purchasedCount);
});
