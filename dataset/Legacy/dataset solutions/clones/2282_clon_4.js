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
    const sequenceLength = Number(inputLines[0]);
    const firstSequence = inputLines[1].split(' ').map(Number);
    const secondSequence = inputLines[2].split(' ').map(Number);

    const factorialCache = new Array(sequenceLength + 1);
    factorialCache[0] = 1;
    for (let counter = 1; counter <= sequenceLength; counter++) {
        factorialCache[counter] = factorialCache[counter - 1] * counter;
    }

    function determineLexicographicalOrder(targetSequence, len, cache) {
        let computedOrder = 0;
        const remainingDigits = Array.from({ length: len }, (_, index) => index + 1);

        for (let position = 0; position < len; position++) {
            const currentDigit = targetSequence[position];
            const indexInRemaining = remainingDigits.indexOf(currentDigit);
            
            computedOrder += indexInRemaining * cache[len - 1 - position];
            
            remainingDigits.splice(indexInRemaining, 1);
        }
        return computedOrder + 1;
    }

    const orderA = determineLexicographicalOrder(firstSequence, sequenceLength, factorialCache);
    const orderB = determineLexicographicalOrder(secondSequence, sequenceLength, factorialCache);
    
    console.log(Math.abs(orderA - orderB));
});
