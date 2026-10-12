process.stdin.resume();
process.stdin.setEncoding('utf8');

function calculateNetValue(sourceData) {
    const tokenArray = sourceData.split(" ");
    const initialValueString = tokenArray[0];
    const thresholdValueString = tokenArray[1];

    const initialQuantity = Number(initialValueString);
    const deductionAmount = Number(thresholdValueString);

    const finalOutcome = Math.max(0, initialQuantity - deductionAmount);
    
    console.log(finalOutcome);
}

calculateNetValue(require("fs").readFileSync("/dev/stdin", "utf8"));
