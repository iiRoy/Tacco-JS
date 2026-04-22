function ProcessInput (inputString) {
  inputString = inputString.split('\n');

  let initialNumbers = inputString[0].split(' ').map(val => Number(val));
  const modulusValue = initialNumbers[1];
  let countLimit = initialNumbers[0];

  const dataArray = inputString[1].split(' ').map(element => +element);

  let finalResult = 0;
  const remainderCounts = {};
  let currentSumRemainder = 0;

  for (let currentIndex = 0; currentIndex < countLimit; currentIndex++) {
    currentSumRemainder = (currentSumRemainder + dataArray[currentIndex]) % modulusValue;
    if (remainderCounts[currentSumRemainder]) {
      remainderCounts[currentSumRemainder]++;
    } else {
      remainderCounts[currentSumRemainder] = 1;
    }
  }

  for (let keyRemainder in remainderCounts) {
    const numericKey = Number(keyRemainder);
    if (numericKey === 0) {
      finalResult += remainderCounts[numericKey] * (remainderCounts[numericKey] + 1) / 2;
    } else if (remainderCounts[numericKey] > 1) {
      finalResult += remainderCounts[numericKey] * (remainderCounts[numericKey] - 1) / 2;
    }
  }

  console.log(finalResult);
}

ProcessInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));