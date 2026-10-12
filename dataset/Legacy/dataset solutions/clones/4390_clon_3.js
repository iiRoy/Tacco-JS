process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
    const firstLineParts = inputLines[0].split(" ");
    const quarterPrice = BigInt(firstLineParts[0]);
    const halfPrice = BigInt(firstLineParts[1]);
    const singlePrice = BigInt(firstLineParts[2]);
    const doublePrice = BigInt(firstLineParts[3]);

    const targetVolume = BigInt(inputLines[1]);

    if (targetVolume % 2n === 0n) {
        const costFromQuarterLitersForTwoLiters = quarterPrice * 8n;
        const costFromHalfLitersForTwoLiters = halfPrice * 4n;
        const costFromSingleLitersForTwoLiters = singlePrice * 2n;
        
        const costPerTwoLiters = findMinimum(
            costFromQuarterLitersForTwoLiters,
            costFromHalfLitersForTwoLiters,
            costFromSingleLitersForTwoLiters,
            doublePrice
        );
        
        const totalCostEven = (targetVolume / 2n) * costPerTwoLiters;
        outputResult(totalCostEven);
    } else {
        const costFromQuarterLitersForOneLiter = quarterPrice * 4n;
        const costFromHalfLitersForOneLiter = halfPrice * 2n;
        
        const costPerOneLiter = findMinimum(
            costFromQuarterLitersForOneLiter,
            costFromHalfLitersForOneLiter,
            singlePrice
        );
        
        const costPerTwoLitersDirect = doublePrice;
        
        const costOfTwoOneLiterUnits = costPerOneLiter * 2n;

        if (costOfTwoOneLiterUnits < costPerTwoLitersDirect) {
            const totalCostOddCheaperOneLiter = targetVolume * costPerOneLiter;
            outputResult(totalCostOddCheaperOneLiter);
        } else {
            const remainingVolumeForTwoLiterUnits = targetVolume - 1n;
            const numTwoLiterUnits = remainingVolumeForTwoLiterUnits / 2n;
            
            const totalCostOddMixed = (numTwoLiterUnits * costPerTwoLitersDirect) + costPerOneLiter;
            outputResult(totalCostOddMixed);
        }
    }
});

function findMinimum(...values) {
    if (values.length === 0) {
        throw new Error("findMinimum requires at least one argument.");
    }
    let currentMin = values[0];
    for (let i = 1; i < values.length; i++) {
        if (values[i] < currentMin) {
            currentMin = values[i];
        }
    }
    return currentMin;
}

function outputResult(valueToLog) {
    console.log(valueToLog.toString());
}
