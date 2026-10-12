const processData = (sourceInput) => {
  const [firstLineContent, secondLineContent] = sourceInput.split('\n');
  const elementStrings = secondLineContent.split(' ');
  const totalElements = elementStrings.length;

  const itemFrequencies = elementStrings.reduce((accumulator, currentItem) => {
    accumulator.set(currentItem, (accumulator.get(currentItem) || 0) + 1);
    return accumulator;
  }, new Map());

  const distinctItemEntries = Array.from(itemFrequencies.entries());
  const distinctItemCount = distinctItemEntries.length;

  if (distinctItemCount === 1) {
    console.log(totalElements / 2);
  } else if (distinctItemCount === 2) {
    distinctItemEntries.sort((entryA, entryB) => entryB[1] - entryA[1]);
    const topFrequency = distinctItemEntries[0][1];
    const secondFrequency = distinctItemEntries[1][1];
    console.log((topFrequency - secondFrequency) / 2);
  } else {
    distinctItemEntries.sort((entryA, entryB) => entryB[1] - entryA[1]);
    const remainingEntries = distinctItemEntries.slice(2);
    const sumOfOtherFrequencies = remainingEntries.reduce((sum, entry) => sum + entry[1], 0);
    console.log(sumOfOtherFrequencies);
  }
};

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
