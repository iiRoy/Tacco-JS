function computeGCD(firstNumber, secondNumber) {
   let currentMax = Math.max(firstNumber, secondNumber);
   let currentMin = Math.min(firstNumber, secondNumber);

   while (currentMin !== 0) {
      const moduloResult = currentMax % currentMin;
      currentMax = currentMin;
      currentMin = moduloResult;
   }
   return currentMax;
}

function readAndParseInputLines() {
    const rawFileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    return rawFileContent.trim().split("\n");
}

function parseNumberPair(pairString) {
    return pairString.split(" ").map(Number);
}

let allInputLines = readAndParseInputLines();

while (true) {
   const currentDataSetSizeString = allInputLines.shift();
   const currentDataSetSize = parseInt(currentDataSetSizeString, 10);

   if (currentDataSetSize === 0) {
      break;
   }

   const processedRatios = [];
   for (let i = 0; i < currentDataSetSize; i++) {
      const rawValues = parseNumberPair(allInputLines.shift());
      const divisorValue = computeGCD(rawValues[0], rawValues[1]);
      processedRatios.push([rawValues[0] / divisorValue, rawValues[1] / divisorValue]);
   }

   const initialLCM = processedRatios.reduce((accumulatorLCM, currentRatioPair) => {
      const denominator = currentRatioPair[1];
      const commonDivisorForLCM = computeGCD(denominator, accumulatorLCM);
      const productOfValues = denominator * accumulatorLCM;
      return productOfValues / commonDivisorForLCM;
   }, 1);

   const scaledNumeratorValues = processedRatios.map(currentRatioPair => {
       const denominator = currentRatioPair[1];
       const numerator = currentRatioPair[0];
       const scalingFactor = initialLCM / denominator;
       return numerator * scalingFactor;
   });

   const finalCommonMultiple = scaledNumeratorValues.reduce((accumulatorLCM, currentNumerator) => {
      const commonDivisorForFinalLCM = computeGCD(currentNumerator, accumulatorLCM);
      const productOfNumerators = currentNumerator * accumulatorLCM;
      return productOfNumerators / commonDivisorForFinalLCM;
   }, 1);

   for (const numerator of scaledNumeratorValues) {
       console.log(finalCommonMultiple / numerator);
   }
}
