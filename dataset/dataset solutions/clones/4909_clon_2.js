process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputDataRows = [];

const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', (currentLineText) => {
  inputDataRows.push(currentLineText);
});

inputHandler.on('close', () => {
    const [firstVal, secondVal] = inputDataRows[0].split(" ").map(val => val);
    console.log(Math.pow(secondVal - 1, firstVal - 1) * secondVal);
});

const findMinimumValue = (...valuesToCompare) => {
    return valuesToCompare.reduce((currentMin, nextVal) => currentMin < nextVal ? currentMin : nextVal, valuesToCompare[0]);
};
