process.stdin.resume();
process.stdin.setEncoding('utf8');

// This array will hold all the input lines received.
let inputDataRows = [];

// Set up an interface to read input line by line.
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// When a new line of input is received, add it to our collection.
inputProcessor.on('line', (currentLineText) => {
  inputDataRows.push(currentLineText);
});

// Once the input stream is closed, process the collected data.
inputProcessor.on('close', () => {
    // Extract the three numbers from the first line, converting them to BigInt.
    const [firstNum, secondNum, thirdNum] = inputDataRows[0].split(" ").map(strVal => BigInt(strVal));

    // Check if any of the numbers are even.
    // If any number is even, then at least one of the products (A*B, B*C, A*C) will be even.
    // Since we are looking for the minimum product of two numbers, and if all numbers are odd,
    // the products will be odd. If any number is even, the minimum product will be 0 if we consider
    // the problem to be about finding the smallest possible product of two numbers from the set,
    // and if any number is even, it implies a different context or a misunderstanding of the problem.
    // However, following the original logic, if any number is even, the output is 0.
    if (firstNum % 2n === 0n || secondNum % 2n === 0n || thirdNum % 2n === 0n) {
        console.log(0);
    } else {
        // If all numbers are odd, calculate the products of each pair and find the smallest one.
        // The products will also be odd.
        console.log(findSmallest(firstNum * secondNum, secondNum * thirdNum, firstNum * thirdNum).toString());
    }
});

// A utility function to determine the smallest value among a set of BigInt numbers.
const findSmallest = (...numericValues) => {
    // Use the reduce method to iterate through the array and find the minimum.
    return numericValues.reduce((currentMin, nextVal) => currentMin < nextVal ? currentMin : nextVal, numericValues[0]);
};
