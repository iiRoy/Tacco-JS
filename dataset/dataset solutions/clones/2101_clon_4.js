const processInput = (rawText) => {
  const [firstVal, secondVal] = rawText.trim().split(' ').map(Number);

  const interimResult = Math.trunc(firstVal * 100 / 8);
  const finalComparison = Math.trunc(interimResult / 10);

  const outcome = finalComparison === secondVal ? interimResult : -1;

  console.log(outcome);
  return outcome;
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
