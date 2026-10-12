var inputLines = [];

var maxIterations = 0;
var conversionRateA = 0;
var conversionRateB = 0;
var currentBiscuits = 1;

var ioHandler = require('readline');
var interfaceInstance = ioHandler.createInterface({
  input:  process.stdin,
  output: process.stdout
});

interfaceInstance.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

interfaceInstance.on('close', function() {
  const firstLineParts = inputLines[0].split(" ");
  maxIterations = Number(firstLineParts[0]);
  conversionRateA = Number(firstLineParts[1]);
  conversionRateB = Number(firstLineParts[2]);

  for (var iterationCounter = 1; iterationCounter <= maxIterations; iterationCounter++) {
    const absoluteDifferenceAB = Math.abs(conversionRateA - conversionRateB);
    const isConversionIneffective = absoluteDifferenceAB === 1 || conversionRateA > conversionRateB;
    const notEnoughBiscuitsForConversion = currentBiscuits < conversionRateA;
    const isCurrentIterationFinal = iterationCounter === maxIterations;

    if (isConversionIneffective || notEnoughBiscuitsForConversion || isCurrentIterationFinal) {
      currentBiscuits++;
    } else {
      const numberOfConversionsPossible = Math.floor(currentBiscuits / conversionRateA);
      const remainingBiscuitsAfterConversion = currentBiscuits % conversionRateA;
      currentBiscuits = (numberOfConversionsPossible * conversionRateB) + remainingBiscuitsAfterConversion;
      iterationCounter++;
    }
  }
  console.log(currentBiscuits);
});
