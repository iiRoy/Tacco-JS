process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputDataLines = [];
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentInputLine) => {
  inputDataLines.push(currentInputLine);
});

inputReader.on('close', () => {
    const ZERO_BIGINT = BigInt(0);

    const convertToBigInt = (stringValue) => BigInt(stringValue);

    const firstLineValues = inputDataLines[0].split(" ");
    let currentNumber = convertToBigInt(firstLineValues[0]);
    const moduloDivisor = convertToBigInt(firstLineValues[1]);

    const encounteredValues = new Set();
    let minimumValue = currentNumber;

    const findMinBigInt = (valA, valB) => valA > valB ? valB : valA;

    while (!encounteredValues.has(currentNumber)) {
        encounteredValues.add(currentNumber);

        const calculatedRemainder = currentNumber % moduloDivisor;
        
        minimumValue = findMinBigInt(minimumValue, calculatedRemainder);
        
        // Original logic: N = K > a ? K - a : a - K;
        // Since 'a' (calculatedRemainder) is always N % K, it's guaranteed to be < K (for K > 0).
        // Thus, K > a is always true, simplifying the expression.
        currentNumber = moduloDivisor - calculatedRemainder;

        if (minimumValue === ZERO_BIGINT) {
            break;
        }
    }
    console.log(minimumValue.toString());
});
