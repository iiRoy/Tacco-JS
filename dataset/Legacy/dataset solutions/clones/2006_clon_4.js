const processData = rawInput => {
  const parsedValues = rawInput.split(' ').map(valStr => BigInt(valStr));
  const [initialValue, divisor] = parsedValues;

  function* sequenceGenerator(startVal, divVal) {
    let priorVal = startVal;
    while (true) {
      let currentVal = priorVal - divVal;
      currentVal = currentVal > 0n ? currentVal : -1n * currentVal;

      yield { prev: priorVal, curr: currentVal };

      if (currentVal === divVal) {
        return 0n;
      }
      if (currentVal < divVal) {
        if (currentVal < divVal / 2n) {
          return currentVal;
        }
      }
      priorVal = currentVal;
    }
  }

  let finalOutcome;
  const valueIterator = sequenceGenerator(initialValue, divisor);
  let stepResult;

  while (true) {
    stepResult = valueIterator.next();
    if (stepResult.done) {
      finalOutcome = stepResult.value;
      break;
    }
    console.log(`${stepResult.value.prev}\n${stepResult.value.curr}`);
  }

  console.log(Number(finalOutcome));
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
