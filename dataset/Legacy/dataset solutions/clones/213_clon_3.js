const getStdinContent = () => {
  const fileSystem = require('fs');
  const fileDescriptor = process.stdin.fd;
  const stats = fileSystem.fstatSync(fileDescriptor);
  const bufferSize = stats.size;
  const dataBuffer = Buffer.alloc(bufferSize);
  const bytesReadCount = fileSystem.readSync(fileDescriptor, dataBuffer, 0, bufferSize, 0);
  const rawContent = dataBuffer.toString('utf8', 0, bytesReadCount);
  return rawContent.split('\n');
};

const inputLines = getStdinContent();

executePrimeSumQueries();
   
function executePrimeSumQueries(){
  const precomputedCumulativePrimeSums = calculateAndStoreCumulativePrimeSums();
  const effectiveInputLineCount = inputLines.length - 1;

  for(let lineIdx = 0; lineIdx < effectiveInputLineCount; lineIdx++){
    const currentQueryValue = Number(inputLines[lineIdx]);

    if(currentQueryValue === 0){
      return;
    }
    
    console.log(precomputedCumulativePrimeSums[currentQueryValue]);
  }
}
  
function calculateAndStoreCumulativePrimeSums(){
  const maximumValue = 104729;
  const isCompositeSieve = new Int8Array(maximumValue + 1);

  isCompositeSieve[0] = 1;
  isCompositeSieve[1] = 1;

  const sieveIterationLimit = Math.trunc(Math.sqrt(maximumValue));
  for(let currentSieveNum = 2; currentSieveNum <= sieveIterationLimit; currentSieveNum++){
    if(isCompositeSieve[currentSieveNum] === 0){
      const firstMultiple = currentSieveNum * 2;
      for(let multipleMarker = firstMultiple; multipleMarker <= maximumValue; multipleMarker += currentSieveNum){
        isCompositeSieve[multipleMarker] = 1;
      }
    }
  }
  
  const cumulativeSumsArray = new Int32Array(maximumValue + 1);
  let runningTotalOfPrimes = 0;
  let primeIndexCounter = 0;

  for(let numCandidate = 1; numCandidate <= maximumValue; numCandidate++){
    if(isCompositeSieve[numCandidate] === 0){
      primeIndexCounter++;
      runningTotalOfPrimes += numCandidate;
      cumulativeSumsArray[primeIndexCounter] = runningTotalOfPrimes;
    }
  }
    
  return cumulativeSumsArray;
}
