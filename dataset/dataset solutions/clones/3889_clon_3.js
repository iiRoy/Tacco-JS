function processInputData(rawDataContent) {
  const cleanedInput = rawDataContent.trim();
  const numberStrings = cleanedInput.split(" ");

  const numericalArray = numberStrings.map(str => parseInt(str, 10));

  const valueA = numericalArray[0];
  const valueB = numericalArray[1];
  const valueC = numericalArray[2];

  const sumOfFirstAndSecond = valueA + valueB;

  const conditionOneMet = (valueC >= valueA);
  const conditionTwoMet = (sumOfFirstAndSecond >= valueC);

  let finalOutcomeMessage;
  if (conditionOneMet && conditionTwoMet) {
    finalOutcomeMessage = "YES";
  } else {
    finalOutcomeMessage = "NO";
  }

  console.log(finalOutcomeMessage);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
