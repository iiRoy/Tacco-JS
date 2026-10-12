function analyzeStringDifferences(rawInputData) {
  const inputLines = rawInputData.split("\n");
  const processedString = inputLines[0].trim();

  const stringLength = processedString.length;
  if (stringLength === 0) {
    console.log(0);
    return;
  }

  let priorCharacter = processedString.charAt(0);
  let differenceTally = 0;

  for (let currentIndex = 1; currentIndex < stringLength; currentIndex++) {
    const currentCharacter = processedString.charAt(currentIndex);
    if (priorCharacter !== currentCharacter) {
      differenceTally++;
    }
    priorCharacter = currentCharacter;
  }
  console.log(differenceTally);
}

// This line should not be edited (reads from standard input once and calls analyzeStringDifferences)
analyzeStringDifferences(require("fs").readFileSync("/dev/stdin", "utf8"));
