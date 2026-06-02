let bufferTokens;
let readCursor;

function takeNumber() {
  return parseInt(bufferTokens[readCursor++], 10);
}

function sameOddDifference(leftValue, rightValue) {
  if (leftValue == rightValue) {
    return leftValue;
  }
  return leftValue > rightValue ? leftValue - rightValue : rightValue - leftValue;
}

function resolveBracket(values, startAt, span) {
  if (span === 1) {
    return values[startAt];
  }

  const middle = span / 2;
  const leftWinner = resolveBracket(values, startAt, middle);
  const rightWinner = resolveBracket(values, startAt + middle, middle);
  return sameOddDifference(leftWinner, rightWinner);
}

function solve(source) {
  bufferTokens = source.replace(/\n/g, " ").split(" ");
  readCursor = 0;

  const exponent = takeNumber();
  const requiredSize = Math.pow(2, exponent);
  const storedNumbers = [];

  for (let position = 0; position < requiredSize; position++) {
    storedNumbers[position] = takeNumber();
  }

  let answer;
  if (Number.isInteger(requiredSize) && requiredSize >= 1) {
    answer = resolveBracket(storedNumbers, 0, requiredSize);
  } else {
    answer = undefined;
  }

  console.log(answer + "\n");
}

solve(require("fs").readFileSync("/dev/stdin", "utf8"));
