const inputReader = require('readline');

const inputHandler = inputReader.createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputBuffer = [];
inputHandler.on('line', (currentLine) => {
  inputBuffer.push(currentLine);
});

inputHandler.on('close', () => {
  let bufferPosition = 0;

  const getNextParsedInteger = () => {
    const stringValue = inputBuffer[bufferPosition];
    bufferPosition++;
    return parseInt(stringValue, 10);
  };

  const quarterDivisor = 4;

  while (true) {
    let totalAccumulator = 0;
    const itemCount = getNextParsedInteger();

    if (itemCount === 0) {
      break;
    }

    const numberOfSubItems = itemCount / quarterDivisor;

    for (let loopCounter = 0; loopCounter < numberOfSubItems; loopCounter++) {
      const currentValue = getNextParsedInteger();
      totalAccumulator += currentValue;
    }
    console.log(totalAccumulator);
  }
});
