function processInput(rawData) {
  const processedText = rawData.trim();

  const charOccurrences = new Map();
  charOccurrences.set('a', 0);
  charOccurrences.set('b', 0);
  charOccurrences.set('c', 0);

  for (const charUnit of processedText) {
    if (charOccurrences.has(charUnit)) {
      charOccurrences.set(charUnit, charOccurrences.get(charUnit) + 1);
    }
  }

  const frequencyValues = Array.from(charOccurrences.values());
  frequencyValues.sort((x, y) => x - y);

  const lowestCount = frequencyValues[0];
  const highestCount = frequencyValues[frequencyValues.length - 1];

  const countDifference = highestCount - lowestCount;

  console.log(countDifference < 2 ? 'YES' : 'NO');
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
