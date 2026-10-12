function processNumbers(inputString) {
  const parsedNumbers = inputString.split("\n")[0].split(" ").map(val => parseInt(val, 10)).sort((x, y) => y - x);

  const largestValue = parsedNumbers[0];
  const middleValue = parsedNumbers[1];
  const smallestValue = parsedNumbers[2];

  let operationCount;

  if ((middleValue - smallestValue) % 2 === 0) {
    operationCount = (largestValue - middleValue) + (middleValue - smallestValue) / 2;
  } else {
    operationCount = 1 + (largestValue - middleValue) + (middleValue - smallestValue + 1) / 2;
  }

  console.log(operationCount);
}

processNumbers(require("fs").readFileSync("/dev/stdin", "utf8"));
