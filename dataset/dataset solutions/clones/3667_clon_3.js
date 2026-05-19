function processInputString(rawInputString) {
  let countOfMatches = 0;
  let currentIdx = 2;

  const loopBoundValue = rawInputString[0] / 2;

  const checkAdjacentEquality = (sourceString, indexPosition) => {
    const charBefore = sourceString[indexPosition - 1];
    const currentChar = sourceString[indexPosition];
    return charBefore === currentChar;
  };

  while (currentIdx > loopBoundValue) {
    if (checkAdjacentEquality(rawInputString, currentIdx)) {
      countOfMatches++;
    }
    currentIdx++;
  }

  console.log(countOfMatches);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
