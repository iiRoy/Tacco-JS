function processNumericalInput(sourceData) {
  const [lowerBound, upperBound, checkValue] = sourceData.split(' ').map(Number);

  const conditionMet = (checkValue - lowerBound >= 0) && (upperBound - checkValue >= 0);
  
  const outcomeMap = new Map();
  outcomeMap.set(true, 'Yes');
  outcomeMap.set(false, 'No');

  console.log(outcomeMap.get(conditionMet));
}

processNumericalInput(require("fs").readFileSync("/dev/stdin", "utf8"));
