function processInputAndDetermine(rawText) {
  const lines = rawText.split('\n');
  const divisorVal = Number(lines[0]);
  const [startVal, endVal] = lines[1].split(' ').map(Number);

  const isAnyDivisible = Array.from(
    { length: endVal - startVal + 1 },
    (_, index) => startVal + index
  ).some(
    (currentNumber) => currentNumber % divisorVal === 0
  );

  console.log(isAnyDivisible ? 'OK' : 'NG');
}

processInputAndDetermine(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
