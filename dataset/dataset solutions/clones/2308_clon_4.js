function ProcessData(dataString) {
  const [firstLineData, secondLineData] = dataString.split('\n');
  const [upperLimit, targetSlots] = firstLineData.split(' ').map(Number);
  const sourceNumbers = secondLineData.split(' ').map(Number);

  const combinedEntries = Array.from({ length: upperLimit }).flatMap((_, idxA) =>
    Array.from({ length: idxA + 1 }).map((_, idxB) => ({
      worth: sourceNumbers[idxA] + sourceNumbers[idxB],
      solo: idxA === idxB,
    }))
  );

  combinedEntries.sort((entryA, entryB) => entryB.worth - entryA.worth);

  function processSelections(
    remainingItems,
    slotsRemaining,
    currentTotal = 0,
    currentIndex = 0
  ) {
    if (slotsRemaining <= 0 || currentIndex >= remainingItems.length) {
      return currentTotal;
    }

    const currentItem = remainingItems[currentIndex];
    const { worth, solo } = currentItem;

    if (solo || slotsRemaining === 1) {
      return processSelections(
        remainingItems,
        slotsRemaining - 1,
        currentTotal + worth,
        currentIndex + 1
      );
    } else {
      return processSelections(
        remainingItems,
        slotsRemaining - 2,
        currentTotal + (2 * worth),
        currentIndex + 1
      );
    }
  }

  const finalOutcome = processSelections(combinedEntries, targetSlots);

  console.log(finalOutcome);
}
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));