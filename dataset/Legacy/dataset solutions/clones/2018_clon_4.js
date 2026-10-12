function processStringConditions(sourceContent) {
  const contentLines = sourceContent.split("\n");
  const targetSequence = contentLines[0];

  const comparisonIndices = [
    [2, 3],
    [4, 5]
  ];

  const allConditionsMet = comparisonIndices.every(pair => {
    const [firstIndex, secondIndex] = pair;
    return targetSequence.charAt(firstIndex) === targetSequence.charAt(secondIndex);
  });

  console.log(allConditionsMet ? "Yes" : "No");
}

processStringConditions(require("fs").readFileSync("/dev/stdin", "utf8"));
