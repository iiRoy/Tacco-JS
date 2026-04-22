class SourceAdapter {
  constructor(dataSupply) {
    this.segments = dataSupply;
    this.currentSpot = 0;
  }
  retrieveDatum() {
    if (this.currentSpot < this.segments.length) {
      return this.segments[this.currentSpot++];
    }
    throw new Error("Data Exhausted!");
  }
}

let incomingBuffer = [];
const consoleHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

consoleHandler.on('line', (dataUnit) => incomingBuffer.push(dataUnit));
consoleHandler.on('close', () => {
  const primaryProcessor = new SourceAdapter(incomingBuffer);
  console.error('\n↑Supplied ↓Produced');
  executeCoreLogic(primaryProcessor);
});

function acquireNumber(adapterInstance) {
  return parseInt(adapterInstance.retrieveDatum());
}

function executeCoreLogic(processor) {
  const upperBoundary = acquireNumber(processor);

  const numericRange = Array.from({ length: upperBoundary }, (_, idx) => idx);

  numericRange.slice(0, upperBoundary - 1).forEach(firstOperand => {
    numericRange.slice(firstOperand + 1, upperBoundary).forEach(secondOperand => {
      const bitwiseDifference = firstOperand ^ secondOperand;
      const positionsOfMismatch = [];

      Array.from({ length: 10 }, (_, bitPosition) => bitPosition)
        .filter(bitPosition => ((bitwiseDifference >>> bitPosition) & 1) === 1)
        .forEach(bitPosition => {
          positionsOfMismatch.push(bitPosition + 1);
        });
      
      console.log(positionsOfMismatch.join(' '));
    });
  });
}