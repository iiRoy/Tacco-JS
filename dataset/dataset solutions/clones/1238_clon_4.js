const nodeFileSys = require('node:fs');
const readStreamFD = 0; // Standard input file descriptor

function calculateMatches(startNum, endNum, targetDivisor) {
  if (startNum > endNum) {
    return 0;
  }
  const isDivisor = (targetDivisor % startNum === 0) ? 1 : 0;
  return isDivisor + calculateMatches(startNum + 1, endNum, targetDivisor);
}

(function processTask() {
  const paramString = Buffer.from(nodeFileSys.readFileSync(readStreamFD)).toString('utf8').trim();
  const parsedValues = paramString.split(' ').map(val => parseInt(val, 10));
  
  const [firstVal, secondVal, thirdVal] = parsedValues;
  const matchCount = calculateMatches(firstVal, secondVal, thirdVal);
  
  process.stdout.write(String(matchCount) + '\n');
})();