inputData = [];
var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', (currentLine) => {
  inputData.push(currentLine);
});

inputHandler.on('close', () => {
  const countOfNumbers = Number(inputData[0]);
  
  const primeCount = inputData
    .slice(1, 1 + countOfNumbers)
    .map(Number)
    .filter(checkPrimality)
    .length;
  
  console.log(primeCount);
});

function checkPrimality(valueToTest) {
    if (valueToTest === 2) return true;
    if (valueToTest < 2 || valueToTest % 2 === 0) return false;

    const divisorUpperLimit = Math.floor(Math.sqrt(valueToTest));

    const recursiveDivisorCheck = (currentDivisor) => {
        if (currentDivisor > divisorUpperLimit) {
            return true;
        }
        if (valueToTest % currentDivisor === 0) {
            return false;
        }
        return recursiveDivisorCheck(currentDivisor + 2);
    };
    
    return recursiveDivisorCheck(3);
}
