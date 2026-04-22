const processInput = (inputData) => {
  for (let lineIndex = 0;;) {
    let itemCount = Number.parseInt(inputData[lineIndex++], 10);
    if (itemCount === 0) {
      break;
    }

    const dataPoints = inputData[lineIndex++].split(/\s+/).map(Number.parseFloat);
    const meanValue = dataPoints.reduce((accumulator, currentNum) => accumulator + currentNum, 0) / dataPoints.length;
    const dataVariance = dataPoints.reduce((accumulator, currentNum) => accumulator + Math.pow(currentNum - meanValue, 2), 0) / dataPoints.length;
    const stdDev = Math.sqrt(dataVariance);
    console.log(stdDev.toFixed(6));
  }
};

const dataBuffers = [];
process.stdin.on('data', (dataSegment) => {
  dataBuffers.push(dataSegment);
});
process.stdin.on('end', () => {
  const lineSeries = dataBuffers.join('').split('\n');
  processInput(lineSeries);
});