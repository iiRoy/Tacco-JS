function processData(rawInputString) {
  let processedLines = rawInputString.replace(/\n/g, ' ').split(" ");
  let elementCount = Number(processedLines.shift());

  let numberSequence = processedLines.map(Number);

  let countDivisibleByFour = 0;
  let countEvenNotDivisibleByFour = 0;
  let countOdd = 0;

  let finalResult = "No";

  for (let currentIndex = 0; currentIndex < elementCount; currentIndex++) {
    let currentNumber = numberSequence[currentIndex];
    if (currentNumber % 4 === 0) {
      countDivisibleByFour++;
    } else if (currentNumber % 2 === 0) {
      countEvenNotDivisibleByFour++;
    } else {
      countOdd++;
    }
  }

  let isSatisfied = false;
  if (countOdd <= countDivisibleByFour) {
    isSatisfied = true;
  } else {
    let requiredOddCount = countDivisibleByFour + 1;
    let hasNoTwoMultiples = countEvenNotDivisibleByFour === 0;
    if (countOdd === requiredOddCount && hasNoTwoMultiples) {
      isSatisfied = true;
    }
  }

  finalResult = isSatisfied ? "Yes" : "No";

  console.log(finalResult);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
