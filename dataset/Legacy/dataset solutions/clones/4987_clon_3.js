process.stdin.resume();
process.stdin.setEncoding('utf8');

var receivedLines = [];
var lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineProcessor.on('line', (currentInputLine) => {
  receivedLines.push(currentInputLine);
});

lineProcessor.on('close', () => {
    const inputString = receivedLines[0];
    const stringValues = inputString.split(" ");
    
    const firstVal = BigInt(stringValues[0]);
    const secondVal = BigInt(stringValues[1]);
    const thirdVal = BigInt(stringValues[2]);

    const isAnyValueEven = (firstVal % 2n === 0n || secondVal % 2n === 0n || thirdVal % 2n === 0n);

    if (isAnyValueEven) {
        console.log(0);
    } else {
        const productAB = firstVal * secondVal;
        const productBC = secondVal * thirdVal;
        const productAC = firstVal * thirdVal;

        const minimumProduct = getSmallestBigInt(productAB, productBC, productAC);
        console.log(minimumProduct.toString());
    }
});

const getSmallestBigInt = (...values) => {
    return values.reduce((currentMin, currentValue) => {
        return currentMin < currentValue ? currentMin : currentValue;
    }, values[0]);
};
