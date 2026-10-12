function processInputData(rawData) {
  const lines = rawData.split("\n");
  const charSequence = lines[1].split("");
  const sequenceLength = charSequence.length;

  function* generateIndexTriplets(currentIndices = [], startPosition = 0, requiredCount = 3) {
    if (currentIndices.length === requiredCount) {
      yield currentIndices;
      return;
    }
    for (let currentPosition = startPosition; currentPosition < sequenceLength; currentPosition++) {
      yield* generateIndexTriplets([...currentIndices, currentPosition], currentPosition + 1, requiredCount);
    }
  }

  const evaluateTripletConditions = (firstElement, secondElement, thirdElement) => {
    const combinedFirst = secondElement + thirdElement;
    const combinedSecond = firstElement + thirdElement;
    const combinedThird = firstElement + secondElement;

    const satisfiesInequalities = (
      firstElement < combinedFirst &&
      secondElement < combinedSecond &&
      thirdElement < combinedThird
    );

    const areAllUnique = (
      firstElement !== secondElement &&
      secondElement !== thirdElement &&
      firstElement !== thirdElement
    );

    return satisfiesInequalities && areAllUnique;
  };

  let validCount = 0;
  for (const indices of generateIndexTriplets()) {
    const [indexOne, indexTwo, indexThree] = indices;
    const elementOne = charSequence[indexOne];
    const elementTwo = charSequence[indexTwo];
    const elementThree = charSequence[indexThree];

    if (evaluateTripletConditions(elementOne, elementTwo, elementThree)) {
      validCount++;
    }
  }

  console.log(validCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
