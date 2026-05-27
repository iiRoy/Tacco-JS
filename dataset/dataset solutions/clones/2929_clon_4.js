function* generateSequence(multiplier, subtractor, startValue) {
  let previousValue = startValue;
  for (let k = 0; k < 10; k++) {
    previousValue = multiplier * previousValue - subtractor;
    yield previousValue;
  }
}

function computeAndDisplay(sourceData) {
  const components = sourceData.split(" ");
  const coeff = Number(components[0]);
  const diff = Number(components[1]);
  const seed = Number(components[2]);

  for (const val of generateSequence(coeff, diff, seed)) {
    console.log(val);
  }
}

computeAndDisplay(require('fs').readFileSync('/dev/stdin', 'utf8'));
