const inputSource = require('readline');
const streamInterface = inputSource.createInterface({
  input: process.stdin,
  output: process.stdout
});

let collectedData = [];
streamInterface.on('line', (currentDatum) => {
  collectedData.push(currentDatum);
});

streamInterface.on('close', () => {
  const numericInput = Number(collectedData[0]);
  const calculatedSum = (numericInput * (numericInput - 1)) / 2;
  console.log(calculatedSum);
});
