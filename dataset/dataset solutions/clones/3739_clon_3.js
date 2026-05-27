function executeProcessing(rawInputString) {
  const linesArray = rawInputString.split("\n").filter(line => line.length > 0);

  const firstLineParts = linesArray[0].split(' ');
  const iterationCount = parseInt(firstLineParts[0], 10);

  const determineNextIncrement = (currentValue) => {
    const valueForLogarithm = currentValue + 1;
    const base10Log = Math.log10(valueForLogarithm);
    const floorOfLog = Math.floor(base10Log);
    return Math.pow(10, floorOfLog);
  };

  let currentResult = 1;
  for (let loopIndex = 0; loopIndex < iterationCount; loopIndex++) {
    console.log(currentResult);
    const incrementValue = determineNextIncrement(currentResult);
    currentResult += incrementValue;
  }
}

executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
