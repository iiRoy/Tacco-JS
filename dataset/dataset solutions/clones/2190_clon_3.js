function processInputData(rawDataString) {
  const LINE_DELIMITER = "\n";
  const VALUE_DELIMITER = " ";

  const calculateTotalSum = (numericArray) => {
    let currentSum = 0;
    for (let i = 0; i < numericArray.length; i++) {
      currentSum += numericArray[i];
    }
    return currentSum;
  };

  let inputLines = rawDataString.split(LINE_DELIMITER);

  if (inputLines[inputLines.length - 1] === '') {
    inputLines.pop();
  }

  const firstLineElements = inputLines[0].split(VALUE_DELIMITER);
  const requiredHealth = Number(firstLineElements[0]);
  const numberOfAttacks = Number(firstLineElements[1]);

  const attackDamageValues = inputLines[1].split(VALUE_DELIMITER).map(damageString => Number(damageString));
  
  const totalDamageDealt = calculateTotalSum(attackDamageValues);
  
  const resultConditionMet = totalDamageDealt >= requiredHealth;
  const outputMessage = resultConditionMet ? 'Yes' : 'No';

  console.log(outputMessage);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
