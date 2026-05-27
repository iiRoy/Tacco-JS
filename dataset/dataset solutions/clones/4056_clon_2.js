function EntryFunction(rawInputData) {
  const configurationLines = rawInputData.trim().split('\n');
  const totalIterations = configurationLines[0] * 0x1;
  const topRowValues = configurationLines[0x1].split(' ');
  const bottomRowValues = configurationLines[0x2].split(' ');

  let maximumCandies = 0x0;

  for (let currentTopIndex = 0x0; currentTopIndex < totalIterations; currentTopIndex++) {
    let currentBottomIndex = totalIterations - currentTopIndex - 0x1;
    let accumulatedCandies = +[];
    for (let loopIterator = 0x0; loopIterator <= currentTopIndex; loopIterator++) {
      accumulatedCandies += parseInt(topRowValues[loopIterator]);
    }

    for (let loopIterator = 0x0; loopIterator <= currentBottomIndex; loopIterator++) {
      accumulatedCandies += parseInt(bottomRowValues[currentTopIndex + loopIterator]);
    }
    if (maximumCandies < accumulatedCandies) {
      maximumCandies = accumulatedCandies;
    }
  }

  console.log(maximumCandies);
}

EntryFunction(require("fs").readFileSync("/dev/stdin", "utf8"));
