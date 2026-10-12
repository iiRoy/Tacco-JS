function generateFrequencyMap(inputElements) {
  const frequencyMap = {};
  for (const currentElement of inputElements) {
    frequencyMap[currentElement] = (frequencyMap[currentElement] || 0) + 1;
  }
  return frequencyMap;
}

const processInputData = (rawData) => {
  const processedLines = rawData.split('\n');
  processedLines.shift(); // Remove the first line (which is 'n' and not used further)

  const elementCounts = generateFrequencyMap(processedLines);

  const uniqueElements = Object.keys(elementCounts);
  const elementDetailsList = [];
  let highestFrequency = 0;

  for (const elementKey of uniqueElements) {
    const currentElementFrequency = elementCounts[elementKey];
    const currentElementDetail = {
      key: elementKey,
      value: currentElementFrequency
    };
    elementDetailsList.push(currentElementDetail);

    if (currentElementFrequency > highestFrequency) {
      highestFrequency = currentElementFrequency;
    }
  }

  const mostFrequentElements = elementDetailsList
    .filter(detailEntry => {
      const entryValue = detailEntry.value;
      return entryValue === highestFrequency;
    })
    .map(detailEntry => detailEntry.key);

  mostFrequentElements.sort();

  console.log(mostFrequentElements.join('\n'));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
