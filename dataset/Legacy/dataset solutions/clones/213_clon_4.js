var fileSystem = require('fs');
var dataLength = fileSystem.fstatSync(process.stdin.fd).size;
var inputBuffer = Buffer.alloc(dataLength);
var bytesReadCount = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0);
var inputLines = inputBuffer.toString('utf8', 0, bytesReadCount).split('\n');

processInput();

function processInput() {
  var primeSumCache = generatePrimeSums();
  inputLines.slice(0, inputLines.length - 1).some(function(lineContent) {
    var numericValue = parseInt(lineContent, 10);
    if (numericValue === 0) {
      return true;
    }
    console.log(primeSumCache[numericValue]);
    return false;
  });
}

function generatePrimeSums() {
  var maxVal = 104729;
  var isPrimeIndicator = new Array(maxVal + 1).fill(true);
  isPrimeIndicator[0] = isPrimeIndicator[1] = false;

  for (let pVal = 2; pVal * pVal <= maxVal; pVal++) {
    if (isPrimeIndicator[pVal]) {
      for (let multiple = pVal * pVal; multiple <= maxVal; multiple += pVal) {
        isPrimeIndicator[multiple] = false;
      }
    }
  }

  var cumulativePrimeTotals = new Int32Array(maxVal + 1);
  var currentPrimeOrdinal = 0;
  var runningTotal = 0;

  for (let numCandidate = 2; numCandidate <= maxVal; numCandidate++) {
    if (isPrimeIndicator[numCandidate]) {
      runningTotal += numCandidate;
      currentPrimeOrdinal++;
      cumulativePrimeTotals[currentPrimeOrdinal] = runningTotal;
    }
  }

  return cumulativePrimeTotals;
}
