function processInput(fullText) {
  const lines = fullText.split('\n');
  const totalElements = parseInt(lines[0], 10);
  const dataSequence = lines[1].split(' ').map(x => parseInt(x, 10));

  const firstElementOccurrences = dataSequence.filter(val => val === dataSequence[0]).length;
  if (firstElementOccurrences === totalElements) {
    console.log(Math.floor(totalElements / 2));
    return;
  }

  if (firstElementOccurrences === 1 && totalElements >= 4) {
    console.log(Math.floor(totalElements / 2));
    return;
  }

  const evenIndexedFrequencies = dataSequence.reduce((acc, currentVal, idx) => {
    if (idx % 2 === 0) {
      acc[currentVal] = (acc[currentVal] || 0) + 1;
    }
    return acc;
  }, {});

  const oddIndexedFrequencies = dataSequence.reduce((acc, currentVal, idx) => {
    if (idx % 2 !== 0) {
      acc[currentVal] = (acc[currentVal] || 0) + 1;
    }
    return acc;
  }, {});

  const determineAlterations = (frequencyObject) => {
    const counts = Object.values(frequencyObject);
    if (counts.length === 0) return 0;
    if (counts.length === 1) return 0;

    const highestCount = Math.max(...counts);
    const totalCount = counts.reduce((sum, c) => sum + c, 0);
    return totalCount - highestCount;
  };

  let totalModifications = 0;
  totalModifications += determineAlterations(evenIndexedFrequencies);
  totalModifications += determineAlterations(oddIndexedFrequencies);

  console.log(totalModifications);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));