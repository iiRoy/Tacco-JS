const inputHandler = require('readline');

const determineProgressionOutcome = (first, middle, last) => {
    const equidistant = (2 * middle) === (first + last);
    const possibleResults = ["NO", "YES"];
    return possibleResults[Number(equidistant)];
};

const dataStream = inputHandler.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

dataStream.on('line', (receivedPayload) => {
  const parsedUnits = receivedPayload.split(' ').map(Number);

  const firstValue = parsedUnits[0];
  const middleValue = parsedUnits[1];
  const lastValue = parsedUnits[2];

  console.log(determineProgressionOutcome(firstValue, middleValue, lastValue));

  dataStream.close();
});