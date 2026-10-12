function sumOfDigits(numVal) {
  let digitSumAccumulator = 0;
  let currentNumber = numVal;

  while (currentNumber > 0) {
    digitSumAccumulator += currentNumber % 10;
    currentNumber = Math.floor(currentNumber / 10);
  }
  return digitSumAccumulator;
}

function processInput(inputStr) {
  const targetCount = +inputStr;

  function* generateSpecialNumbers() {
    let lastAccepted = 0;
    let multiplier = 1;

    while (true) {
      const candidate = lastAccepted + multiplier;

      const ratioCandidate = candidate / sumOfDigits(candidate);
      const ratioNextStep = (candidate + multiplier) / sumOfDigits(candidate + multiplier);

      if (ratioCandidate <= ratioNextStep) {
        yield candidate;
        lastAccepted = candidate;
      } else {
        multiplier *= 10;
      }
    }
  }

  const resultNumbers = [];
  const numberGen = generateSpecialNumbers();

  for (let i = 0; i < targetCount; ++i) {
    resultNumbers.push(numberGen.next().value);
  }

  console.log(resultNumbers.join("\n"));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
