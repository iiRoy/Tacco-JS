const standardInput = require('readline');
const inputHandler = standardInput.createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataBuffer = [];

const processInputAndCalculate = (lineSegments) => {
    const firstValue = lineSegments[0];
    const secondValue = lineSegments[1];

    const checkLimit = (val) => val <= 9;
    const areBothValid = checkLimit(firstValue) && checkLimit(secondValue);

    const outcomeMap = new Map([
        [true, () => firstValue * secondValue],
        [false, () => -1]
    ]);

    return outcomeMap.get(areBothValid)();
};

inputHandler.on('line', function (currentLine) {
    dataBuffer = currentLine.split(' ').map(Number);
  })
  .on('close', function () {
	console.log(processInputAndCalculate(dataBuffer));
    
    process.exit();
  });
