process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
inputProcessor.on('line', (currentLine) => {
  inputLines.push(currentLine);
});
inputProcessor.on('close', () => {
    const [quarterLiterPrice, halfLiterPrice, singleLiterPrice, doubleLiterPrice] = inputLines[0].split(" ").map(Number);
    const totalLitersRequired = Number(inputLines[1]);

    const costPerLiterFromQuarter = quarterLiterPrice * 4;
    const costPerLiterFromHalf = halfLiterPrice * 2;
    const costPerLiterFromSingle = singleLiterPrice;

    const minimumCostForOneLiter = Math.min(
        costPerLiterFromQuarter,
        costPerLiterFromHalf,
        costPerLiterFromSingle
    );

    const minimumCostForTwoLiters = Math.min(
        minimumCostForOneLiter * 2,
        doubleLiterPrice
    );

    const numTwoLiterUnits = Math.floor(totalLitersRequired / 2);
    const costFromTwoLiterUnits = numTwoLiterUnits * minimumCostForTwoLiters;

    const hasRemainingLiter = totalLitersRequired % 2 !== 0;
    const costFromRemainingLiter = hasRemainingLiter ? minimumCostForOneLiter : 0;

    const finalTotalCost = costFromTwoLiterUnits + costFromRemainingLiter;

    console.log(finalTotalCost);
});
