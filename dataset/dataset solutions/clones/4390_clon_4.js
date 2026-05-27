process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = [];
const lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineProcessor.on('line', (currentLine) => {
  inputBuffer.push(currentLine);
});

lineProcessor.on('close', () => {
    const [quarterCost, halfCost, singleCost, doubleCost] = inputBuffer[0].split(" ").map(val => BigInt(val));
    const totalVolume = BigInt(inputBuffer[1]);

    const findMinimum = (...values) => {
        let currentMin = values[0];
        for (let i = 1; i < values.length; i++) {
            if (values[i] < currentMin) {
                currentMin = values[i];
            }
        }
        return currentMin;
    };

    const outputValue = (val) => {
        console.log(val.toString());
    };

    const optimalOneLiterPrice = findMinimum(
        quarterCost * 4n,
        halfCost * 2n,
        singleCost
    );

    const optimalTwoLiterPrice = findMinimum(
        optimalOneLiterPrice * 2n,
        doubleCost
    );

    const allSingleLiterCost = totalVolume * optimalOneLiterPrice;

    const numTwoLiterPacks = totalVolume / 2n;
    const remainderLiter = totalVolume % 2n;

    const mixedStrategyCost = numTwoLiterPacks * optimalTwoLiterPrice +
                              (remainderLiter === 1n ? optimalOneLiterPrice : 0n);

    const finalOptimalCost = findMinimum(allSingleLiterCost, mixedStrategyCost);

    outputValue(finalOptimalCost);
});
