function calculateMinOperations(inputData) {
  const firstLine = inputData.split("\n")[0];
  const stringNumbers = firstLine.split(" ");
  let numbersArray = stringNumbers.map(currentElement => parseInt(currentElement, 10));

  numbersArray.sort((firstVal, secondVal) => secondVal - firstVal);

  let totalOperations = 0;

  const performEqualizationSteps = (arr, currentOpCount) => {
    let localOpCount = currentOpCount;
    while (arr[0] !== arr[1] || arr[0] !== arr[2]) {
      if (arr[0] > arr[1]) {
        arr[1]++;
        arr[2]++;
        localOpCount++;
      } else {
        arr[2] += 2;
        localOpCount++;
      }
    }
    return localOpCount;
  };

  const secondValue = numbersArray[1];
  const thirdValue = numbersArray[2];
  const parityCheckResult = (secondValue - thirdValue) % 2;

  if (parityCheckResult === 0) {
    totalOperations = performEqualizationSteps(numbersArray, totalOperations);
  } else {
    numbersArray[0]++;
    numbersArray[1]++;
    totalOperations++;
    totalOperations = performEqualizationSteps(numbersArray, totalOperations);
  }

  console.log(totalOperations);
}

calculateMinOperations(require("fs").readFileSync("/dev/stdin", "utf8"));
