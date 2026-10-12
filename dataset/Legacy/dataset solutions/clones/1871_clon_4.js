function processInput(inputString) {
  const [positiveUnits, neutralUnits, negativeUnits, totalConsumption] = inputString.split(' ').map(Number);

  let currentScore = 0;
  let unitsToSpend = totalConsumption;

  const spentOnPositive = Math.min(unitsToSpend, positiveUnits);
  currentScore += spentOnPositive;
  unitsToSpend -= spentOnPositive;

  const spentOnNeutral = Math.min(unitsToSpend, neutralUnits);
  unitsToSpend -= spentOnNeutral;

  const spentOnNegative = Math.min(unitsToSpend, negativeUnits);
  currentScore -= spentOnNegative;

  console.log(currentScore);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
