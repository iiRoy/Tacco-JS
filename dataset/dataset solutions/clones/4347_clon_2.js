process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputData = [];

const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (currentLine) => {
  inputData.push(currentLine);
});

inputProcessor.on('close', () => {
  const itemCount = Number(inputData[0]);
  const thresholdVal = Number(inputData[1]);
  let dataPoints = inputData[2].split(' ');
  dataPoints = dataPoints.map(function(stringRep) {
    return Number(stringRep);
  });

  let totalDistance = 0;

  for (let idx = 0; idx < itemCount; idx++) {
    if (dataPoints[idx] < Math.floor(thresholdVal / 2)) {
      totalDistance += dataPoints[idx] * 2;
    } else if (dataPoints[idx] > (thresholdVal / 2)) {
      totalDistance += (thresholdVal - dataPoints[idx]) * 2;
    }
  }

  console.log(totalDistance);
});
