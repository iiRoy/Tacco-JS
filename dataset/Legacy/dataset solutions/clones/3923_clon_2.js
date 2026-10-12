function ProcessInput(inputString) {
  inputString = inputString.split("\n");
  const queryCount = +inputString[0];

  for (let idx = 0; idx < queryCount; idx++) {
    let numbersArray = inputString[idx + 1].split(" ").map(val => +val);
    let maxValue = Math.max(numbersArray[0], numbersArray[1]);
    let minValue = Math.min(numbersArray[0], numbersArray[1]);

    let sqrtProductCeil = Math.ceil(Math.sqrt(minValue * maxValue));
    let resultValue = (minValue - 1) * 2;

    if (minValue < maxValue - 1) {
      resultValue++;
    }

    for (let currentDivisor = minValue + 1; currentDivisor < sqrtProductCeil; currentDivisor++) {
      if (Math.floor(minValue / currentDivisor * maxValue) === currentDivisor) {
        resultValue++;
      } else {
        resultValue += 2;
      }
    }
    console.log(resultValue);
  }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
