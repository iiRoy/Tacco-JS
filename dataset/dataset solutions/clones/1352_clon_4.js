const ioInterface = require('readline');
const systemContext = require('process');

const inputProcessor = ioInterface.createInterface({
  input: systemContext.stdin,
  output: systemContext.stdout
});

inputProcessor.on('line', (receivedDatum) => {
  const numericValue = parseFloat(receivedDatum);
  const calculatedResult = Math.pow(numericValue, 3);
  systemContext.stdout.write(calculatedResult.toString() + '\n');
  inputProcessor.close();
});