function processInputData(rawData) {
  const inputLines = rawData.split("\n");

  const itemCount = Number(inputLines[0]);

  const initialValues = inputLines[1].split(" ").map(Number);

  const computedStates = Array(itemCount);

  const resultIndices = [];

  const calculateMultiplesSum = (baseIndex, upperLimit, statesArray) => {
    let currentSum = 0;
    for (let multiplier = 2; baseIndex * multiplier < upperLimit; multiplier++) {
      currentSum += statesArray[baseIndex * multiplier];
    }
    return currentSum;
  };

  for (let currentBase = itemCount; currentBase > 0; currentBase--) {
    const sumOfMultiplesStates = calculateMultiplesSum(currentBase, itemCount, computedStates);

    const currentInitialValue = initialValues[currentBase - 1];

    const currentState = (sumOfMultiplesStates + currentInitialValue) % 2;

    computedStates[currentBase - 1] = currentState;

    if (currentState === 1) {
      resultIndices.push(currentBase);
    }
  }

  console.log(resultIndices.length);

  if (resultIndices.length > 0) {
    console.log(resultIndices.join(" "));
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
