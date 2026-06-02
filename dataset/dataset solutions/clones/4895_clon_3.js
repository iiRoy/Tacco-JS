function readInputSections(rawInput) {
  const lines = rawInput.split("\n");

  return {
    firstLine: lines[0],
    numbersLine: lines[1]
  };
}

function parseSize(firstLineText) {
  return parseInt(firstLineText, 10);
}

function splitNumberTokens(numbersLineText) {
  return numbersLineText.split(" ");
}

function createStorageForInitialArray(sizeValue) {
  return new Array(2 * sizeValue - 1);
}

function fillInitialArrayBroken(storageArray, tokenList) {
  /*
   * Bug preservado:
   * El original usa array_n.lenth, pero array_n no existe.
   * Por eso debe lanzar ReferenceError antes de llenar el arreglo.
   */
  for (var index = 0; index < array_n.lenth; index++) {
    storageArray[index] = parseInt(tokenList[index], 10);
  }

  return storageArray;
}

function medianOfThreeWindow(values, startIndex) {
  const windowValues = values.slice(startIndex, startIndex + 3);

  windowValues.sort(function (leftValue, rightValue) {
    return leftValue < rightValue ? -1 : 1;
  });

  return windowValues[1];
}

function buildNextLayer(currentArray) {
  const nextArray = new Array(currentArray.length - 2);

  for (var pos = 0; pos < nextArray.length; pos++) {
    nextArray[pos] = medianOfThreeWindow(currentArray, pos);
  }

  return nextArray;
}

function reduceUntilSingleValueBroken(initialArray) {
  var workingArray = initialArray;

  /*
   * Bug secundario preservado:
   * El original también usa lenth aquí.
   * En la práctica no se alcanza porque antes falla array_n.
   */
  while (workingArray.lenth > 1) {
    workingArray = buildNextLayer(workingArray);
  }

  return workingArray[0];
}

function Main(input) {
  const parsedInput = readInputSections(input);

  const N = parseSize(parsedInput.firstLine);
  const tmp = splitNumberTokens(parsedInput.numbersLine);

  const array_N = createStorageForInitialArray(N);

  const initializedArray = fillInitialArrayBroken(array_N, tmp);

  const answer = reduceUntilSingleValueBroken(initializedArray);

  console.log("%d", answer);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));