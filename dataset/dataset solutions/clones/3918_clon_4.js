const conversionStrategies = new Map([
  [0, (data) => data],
  [1, (data) => parseInt(data)],
  [2, (data) => data.split(" ")],
  [3, (data) => data.split("\n")],
  [4, (data) => data.split(" ").map((element) => Number(element))],
  [5, (data) => data.split("\n").map((element) => Number(element))],
  [6, (data) => data.split("")],
  [7, (data) => data.split("").map((element) => Number(element))],
]);

function fetchSourceData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(content) {
  console.log(content);
}

function reportIssue(message) {
  console.error(message);
}

function convertInput(sourceData, conversionType) {
  const strategy = conversionStrategies.get(conversionType);
  if (strategy) {
    return strategy(sourceData);
  }
  return undefined;
}

function processNumbers(inputContent) {
  let currentValues = convertInput(inputContent, 4).sort((valA, valB) => valA - valB);
  let totalOperations = 0;

  const paritiesMatchInitially = (
    currentValues[0] % 2 === currentValues[1] % 2 &&
    currentValues[0] % 2 === currentValues[2] % 2
  );

  if (!paritiesMatchInitially) {
    totalOperations++;
    const parityValues = currentValues.map(num => num % 2);
    const oddCount = parityValues.filter(p => p === 1).length;

    // If one number is odd (and two are even), increment the two even numbers.
    // If two numbers are odd (and one is even), increment the two odd numbers.
    // In both cases, we increment the numbers that share a parity.
    // The target parity for adjustment is the one that appears twice.
    // If oddCount is 1, it means two evens, one odd. Target parity to increment is 0 (even).
    // If oddCount is 2, it means two odds, one even. Target parity to increment is 1 (odd).
    const parityToAdjust = (oddCount === 1) ? 0 : 1;

    currentValues = currentValues.map(num =>
      (num % 2 === parityToAdjust) ? num + 1 : num
    );
  }

  const maximumValue = Math.max(...currentValues);

  totalOperations += currentValues.reduce((sum, val) => sum + (maximumValue - val) / 2, 0);

  displayResult(totalOperations);
}

processNumbers(fetchSourceData());
