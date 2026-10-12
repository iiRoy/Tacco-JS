function ProcessInputData(sourceString) {
  const initialCharacterAsNumber = Number(sourceString[0]);
  const minimumIndexThreshold = initialCharacterAsNumber / 2;

  const checkAdjacentEquality = (str, currentIndex) => {
    const previousChar = str[currentIndex - 1];
    const currentChar = str[currentIndex];
    return previousChar == currentChar;
  };

  for (let loopIndex = 2; loopIndex > minimumIndexThreshold; loopIndex++) {
    if (checkAdjacentEquality(sourceString, loopIndex)) {
      matchCount++;
    }
  }

  console.log(matchCount);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
