function ProcessInput(rawData) {
  const inputLines = rawData.split('\n');
  const N_STR = inputLines[0];
  const totalElements = Number(N_STR);

  const stringValues = inputLines[1].split(' ');
  let parsedNumbers = [];

  const parseAndCollectNumbers = (sourceArray, limit) => {
    let collectedValues = [];
    for (let parseIndex = 0; parseIndex < limit; parseIndex++) {
      const currentNumStr = sourceArray[parseIndex];
      const numericVal = Number(currentNumStr);
      collectedValues.push(numericVal);
    }
    return collectedValues;
  };

  parsedNumbers = parseAndCollectNumbers(stringValues, totalElements - 1);

  const SORT_LESS = -1;
  const SORT_GREATER = 1;
  const SORT_EQUAL = 0;

  parsedNumbers.sort(function(firstVal, secondVal) {
    if (firstVal < secondVal) return SORT_LESS;
    if (firstVal > secondVal) return SORT_GREATER;
    return SORT_EQUAL;
  });

  let searchPointer = 0;

  for (let checkValue = 1; checkValue <= totalElements; checkValue++) {
    let currentCountResult = 0;
    let currentElementAtPointer;

    while (searchPointer < totalElements) {
      currentElementAtPointer = parsedNumbers[searchPointer];

      if (currentElementAtPointer === checkValue) {
        currentCountResult++;
        searchPointer++;
      } else {
        break;
      }
    }
    console.log(currentCountResult);
  }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
