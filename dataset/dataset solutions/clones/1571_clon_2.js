process.stdin.resume();

process.stdin.setEncoding('utf8');

let bufferedInput = [];

const inputHandler = require('readline').createInterface(
  {
    input:  process.stdin,
    output: process.stdout
  }
);

inputHandler.on('line', (singleRow) => {
  bufferedInput.push(singleRow);
});

inputHandler.on('close', () => {

  let parsedItems = bufferedInput[0].split(' ');

  let firstArg = parseInt(parsedItems[0]);

  let secondArg = parseInt(parsedItems[1]);

  let thirdArg = parseInt(parsedItems[2]);

  let finalCalculation = Math.ceil(firstArg / secondArg) * thirdArg;

  console.log(finalCalculation);
});