function processInput(rawInput) {
  const [firstVal, secondVal, thirdVal] = rawInput.split(' ').map(Number);

  const orderedSet = [firstVal, secondVal, thirdVal].sort((a, b) => a - b);

  const [lowest, central, highest] = orderedSet;

  const gapCentralHighest = highest - central;
  const gapLowestCentral = central - lowest;

  const parityCheck = gapLowestCentral % 2;

  const finalCount = gapCentralHighest + (gapLowestCentral >> 1) + (parityCheck ? 2 : 0);

  return finalCount;
}

function entryPoint(dataString) {
  console.log(processInput(dataString));
}

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
