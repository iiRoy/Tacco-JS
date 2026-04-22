function findCommonMultiple(firstNum, secondNum) {
  let higherValue = Math.max(firstNum, secondNum);
  let lowerValue = Math.min(firstNum, secondNum);
  let currentTestMultiple = higherValue;

  while (true) {
    if (currentTestMultiple % lowerValue === 0) {
      return currentTestMultiple;
    }
    currentTestMultiple += higherValue;
  }
}

function processData(rawInputText) {
  const parsedNumbers = rawInputText.trim().split(' ').map(str => Number(str));
  const finalOutcome = findCommonMultiple(parsedNumbers[0], parsedNumbers[1]);

  console.log(finalOutcome);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));