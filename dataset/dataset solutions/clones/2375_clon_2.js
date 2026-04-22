function processInputData(rawData) {
 const    parsedLines    = rawData.split('\n');

  const sequenceLength = parseInt(parsedLines[0], 10);
let  currentNumberString   = '';
 const candidateDigits = [];
  const targetDigitsArray = Array(sequenceLength);

let matchTracker = 0;
 let successfulMatches = 0;

  for (let dataIndex = 0; dataIndex < sequenceLength; dataIndex++) {
    targetDigitsArray[dataIndex] = parseInt(parsedLines[1][dataIndex], 10);
  }

  for (let numericalCandidate = 0; numericalCandidate < 1000; numericalCandidate++) {
    currentNumberString = String(numericalCandidate);
   matchTracker = 0;

    candidateDigits[0] = currentNumberString[0];
    candidateDigits[1] = currentNumberString[1];
    candidateDigits[2] = currentNumberString[2];

   for (let dataScanIndex = 0; dataScanIndex < sequenceLength; dataScanIndex++) {
      if (candidateDigits[matchTracker] == targetDigitsArray[dataScanIndex] && matchTracker !== 3) {
       matchTracker++;
      }
    }

    if (matchTracker === 3) {
      successfulMatches++;
    }
  }

  console.info(successfulMatches);
}

processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));