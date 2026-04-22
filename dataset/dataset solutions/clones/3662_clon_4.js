function processSegmentData(rawInputText) {
  const parsedLines = rawInputText.trim().split('\n');
  const headerValues = parsedLines[0].split(' ').map(Number);
  const numberOfEntries = headerValues[1];

  const allEntries = parsedLines.slice(1, numberOfEntries + 1)
                              .map(entryLine => entryLine.split(' ').map(Number));

  const orderedEntries = [...allEntries].sort((itemA, itemB) => itemA[1] - itemB[1]);

  if (orderedEntries.length === 0) {
    console.log(0);
    return;
  }

  const initialBoundary = orderedEntries[0][1] - 2;
  const initialResult = { cutThreshold: initialBoundary, totalSelections: 1 };

  const finalState = orderedEntries.slice(1).reduce((accumulator, currentItem) => {
    const [startPoint, endPoint] = currentItem;
    if (startPoint - 1 <= accumulator.cutThreshold) {
      return accumulator;
    } else {
      return {
        cutThreshold: endPoint - 2,
        totalSelections: accumulator.totalSelections + 1
      };
    }
  }, initialResult);

  console.log(finalState.totalSelections);
}

processSegmentData(require("fs").readFileSync("/dev/stdin", "utf8"));