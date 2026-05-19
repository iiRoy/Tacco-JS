function* inputGenerator() {
  // Read all input from stdin, decode as UTF-8, trim whitespace, and split by newlines or spaces.
  const inputLines = require("fs").readFileSync("/dev/stdin", "utf-8").trim().split(/\n|\s/);
  yield* inputLines; // Yield each line/token from the processed input.
}

function fetchMultiple(countToRead, inputSource) {
  // Use the provided input source or initialize a new one if not available.
  const activeIterator = inputSource || (this.dataIterator = inputGenerator());
  const collectedValues = []; // Array to store the fetched values.

  // Loop to fetch the specified number of values.
  for (let idx = 0; idx < countToRead; idx += 1) {
    collectedValues.push(activeIterator.next().value);
  }
  return collectedValues; // Return the array of fetched values.
}

(() => {
  // Fetch the first number, which represents the count of elements that follow.
  const [numElements] = fetchMultiple(1).map(itemStr => parseInt(itemStr));

  // Fetch 'numElements' more numbers and parse them into integers.
  const dataArray = fetchMultiple(numElements).map(itemStr => parseInt(itemStr));

  // Calculate the XOR sum of all elements in the dataArray.
  const totalXorSum = dataArray.reduce((accumulator, currentValue) => accumulator ^ currentValue);

  const resultArray = []; // Array to store the final computed results.

  // Iterate through the dataArray to compute the XOR sum excluding each element.
  for (let loopIndex = 0; loopIndex < numElements; loopIndex += 1) {
    resultArray.push(totalXorSum ^ dataArray[loopIndex]);
  }

  // Print the elements of the resultArray joined by a space.
  console.log(resultArray.join(' '));
})();
