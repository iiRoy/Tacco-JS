function processInputData(sourceText) {
  const allLines = sourceText.split("\n");
  const quantityOfItems = Number(allLines[0]);

  const itemRecords = allLines.slice(1, quantityOfItems + 1).map(lineContent => {
    const numericParts = lineContent.split(" ").map(Number);
    const centralPoint = numericParts[0];
    const extent = numericParts[1];
    return {
      center: centralPoint,
      span: extent,
      startBoundary: centralPoint - extent,
      endBoundary: centralPoint + extent
    };
  });

  itemRecords.sort((recA, recB) => recA.center - recB.center);

  const initialProcessingState = {
    selectedCount: 1,
    currentRightmostLimit: itemRecords[0].endBoundary
  };

  const finalProcessingState = itemRecords.slice(1).reduce((accumulator, currentRecord) => {
    let { selectedCount, currentRightmostLimit } = accumulator;
    const { startBoundary: recordStart, endBoundary: recordEnd } = currentRecord;

    if (currentRightmostLimit > recordStart) {
      currentRightmostLimit = Math.min(currentRightmostLimit, recordEnd);
    } else {
      selectedCount++;
      currentRightmostLimit = recordEnd;
    }
    return { selectedCount, currentRightmostLimit };
  }, initialProcessingState);

  const finalResult = finalProcessingState.selectedCount;
  console.log('%s', finalResult);
  return finalResult;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
