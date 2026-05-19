function processInputData(rawDataString) {
  const trimmedInputContent = rawDataString.trim();
  const stringValueArray = trimmedInputContent.split(" ");

  const numericValues = stringValueArray.map(str => Number(str));

  function ascendingNumberComparator(firstElement, secondElement) {
    return firstElement - secondElement;
  }

  numericValues.sort(ascendingNumberComparator);

  const smallestValue = numericValues[0];
  const secondSmallestValue = numericValues[1];

  const productOfSmallestTwo = smallestValue * secondSmallestValue;
  const divisionFactor = 2;

  const finalCalculatedResult = productOfSmallestTwo / divisionFactor;

  console.log(finalCalculatedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
