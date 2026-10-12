function processInputData(rawData) {
  const PARSE_RADIX = 10;
  const S_SIZE_LINE_INDEX = 0;
  const S_VALUES_LINE_INDEX = 1;
  const Q_SIZE_LINE_INDEX = 2;
  const T_VALUES_LINE_INDEX = 3;

  let parsedLines = rawData.split("\n");

  let sizeS = parseInt(parsedLines[S_SIZE_LINE_INDEX], PARSE_RADIX);
  let numQueries = parseInt(parsedLines[Q_SIZE_LINE_INDEX], PARSE_RADIX);

  let sValueStrings = parsedLines[S_VALUES_LINE_INDEX].split(" ");
  let tValueStrings = parsedLines[T_VALUES_LINE_INDEX].split(" ");

  let sourceArray = new Array(sizeS);
  let targetQueries = new Array(numQueries);

  const populateIntArray = (strArr, targetArr, count) => {
    for (let currentIdx = 0; currentIdx < count; currentIdx++) {
      targetArr[currentIdx] = parseInt(strArr[currentIdx], PARSE_RADIX);
    }
  };

  populateIntArray(sValueStrings, sourceArray, sizeS);
  populateIntArray(tValueStrings, targetQueries, numQueries);

  let matchCount = 0;

  const isElementPresent = (elementToFind, searchArr, arrLength) => {
    for (let searchPosition = 0; searchPosition < arrLength; searchPosition++) {
      if (searchArr[searchPosition] === elementToFind) {
        return true;
      }
    }
    return false;
  };

  for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
    const currentQueryValue = targetQueries[queryIdx];
    if (isElementPresent(currentQueryValue, sourceArray, sizeS)) {
      matchCount++;
    }
  }

  console.log(matchCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
