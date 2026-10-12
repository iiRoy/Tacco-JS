(function processInput() {
  const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
  const desiredTerm = Number(sourceData) + 1;

  let previousValue = 0;
  let currentValue = 1;

  if (desiredTerm === 0) {
    console.log(previousValue);
    return;
  }
  if (desiredTerm === 1) {
    console.log(currentValue);
    return;
  }

  for (let iterationCount = 2; iterationCount <= desiredTerm; iterationCount++) {
    const nextValue = previousValue + currentValue;
    previousValue = currentValue;
    currentValue = nextValue;
  }

  console.log(currentValue);
})();
