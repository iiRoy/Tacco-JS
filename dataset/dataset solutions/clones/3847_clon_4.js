function processInputAndCompute(dataString) {
  const parts = dataString.split(/\s+/);
  const firstOperand = +parts[0];
  const secondOperand = +parts[1];

  const difference = firstOperand - secondOperand;
  const decrementFactor = Math.min(1, Math.max(0, difference));

  const finalResult = firstOperand - decrementFactor;

  console.log(finalResult);
}

(() => {
  const contentFromStream = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' });
  processInputAndCompute(contentFromStream.trim());
})();