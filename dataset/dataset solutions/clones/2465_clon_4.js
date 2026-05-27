const checkRange = (val) => val >= 1 && val <= 10;

const computeResult = (sourceText) => {
  const numericalInputs = sourceText.split(' ').map(Number);

  const allValid = numericalInputs.every(checkRange);

  console.log(
    allValid
      ? numericalInputs[0] * numericalInputs[1]
      : -1
  );
};

computeResult(require('fs').readFileSync('/dev/stdin', 'utf8'));
