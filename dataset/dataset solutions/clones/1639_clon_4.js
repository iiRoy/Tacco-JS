function evaluateSequence(sourceString) {
  const allLines = sourceString.split('\n');

  const [, queryTotal] = allLines[0].split(' ').map(Number);
  const itemCollection = allLines[1].split(' ');

  const queryInstructions = allLines.slice(2, 2 + queryTotal).map(lineText => {
    const [firstIndex, lastIndex] = lineText.split(' ').map(Number);
    return { beginning: firstIndex, ending: lastIndex };
  });

  const uniqueItemCounts = queryInstructions.map(instructionSet => {
    const segment = itemCollection.slice(instructionSet.beginning - 1, instructionSet.ending);
    const distinctSet = new Set(segment);
    return distinctSet.size;
  });

  console.log(uniqueItemCounts.join('\n'));
}

evaluateSequence(require("fs").readFileSync("/dev/stdin", "utf8"));