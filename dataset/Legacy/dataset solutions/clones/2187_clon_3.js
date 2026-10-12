function processInput(rawInputString) {
  const parsedComponents = rawInputString.split(' ');

  console.log(parsedComponents);

  let operationCount = 0;

  let currentDividend = Number(parsedComponents[0]);
  let divisorValue = Number(parsedComponents[1]);

  while (currentDividend >= divisorValue) {
    currentDividend = currentDividend - divisorValue;
    operationCount++;
  }

  console.log(operationCount);
}

(function executeProgram() {
  const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  processInput(standardInputContent);
})();
