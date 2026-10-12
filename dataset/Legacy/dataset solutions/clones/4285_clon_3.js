process.stdin.resume();
process.stdin.setEncoding('utf8');

var receivedInputLines = [];
var lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineProcessor.on('line', (currentInputLine) => {
  receivedInputLines.push(currentInputLine);
});

lineProcessor.on('close', () => {
    const totalCountN = Number(receivedInputLines[0]);

    const rawNumberStrings = receivedInputLines[1].split(" ");
    const parsedNumbersArray = [];
    for (let i = 0; i < rawNumberStrings.length; i++) {
        const currentString = rawNumberStrings[i];
        parsedNumbersArray.push(Number(currentString));
    }

    let evenCount = 0;
    for (let i = 0; i < parsedNumbersArray.length; i++) {
        const numVal = parsedNumbersArray[i];
        if (numVal % 2 === 0) {
            evenCount++;
        }
    }

    const powerOfThreeResult = Math.pow(3, totalCountN);
    const powerOfTwoResult = Math.pow(2, evenCount);
    const finalCalculationResult = powerOfThreeResult - powerOfTwoResult;

    console.log(finalCalculationResult);
});
