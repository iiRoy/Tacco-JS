const performCalculation = (rawInput) => {
  const lines = rawInput.trim().split('\n');
  const totalElements = Number(lines[0]);
  const elementStrings = lines[1].split(' ');

  const segregatedElements = elementStrings.reduce((accumulator, currentString, index) => {
    const numericValue = Number(currentString);
    if (index % 2 === 0) {
      accumulator.firstGroup.push(numericValue);
    } else {
      accumulator.secondGroup.push(numericValue);
    }
    return accumulator;
  }, { firstGroup: [], secondGroup: [] });

  const firstCollection = segregatedElements.firstGroup;
  const secondCollection = segregatedElements.secondGroup;

  const extractDominantFrequencies = (numericalSeries) => {
    const frequencyMap = numericalSeries.reduce((acc, num) => {
      acc.set(num, (acc.get(num) || 0) + 1);
      return acc;
    }, new Map());

    const sortedFrequencies = Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1]);

    const topEntry = sortedFrequencies[0] || [null, 0];
    const secondEntry = sortedFrequencies[1] || [null, 0];

    return [
      { value: topEntry[0], count: topEntry[1] },
      { value: secondEntry[0], count: secondEntry[1] }
    ];
  };

  const dominantEvenIndexed = extractDominantFrequencies(firstCollection);
  const dominantOddIndexed = extractDominantFrequencies(secondCollection);

  let finalOutcome = 0;

  const firstEvenValue = dominantEvenIndexed[0].value;
  const firstEvenCount = dominantEvenIndexed[0].count;
  const secondEvenCount = dominantEvenIndexed[1].count;

  const firstOddValue = dominantOddIndexed[0].value;
  const firstOddCount = dominantOddIndexed[0].count;
  const secondOddCount = dominantOddIndexed[1].count;

  if (firstEvenValue !== firstOddValue) {
    finalOutcome = totalElements - (firstEvenCount + firstOddCount);
  } else {
    const scenarioA = secondEvenCount + firstOddCount;
    const scenarioB = firstEvenCount + secondOddCount;
    finalOutcome = totalElements - Math.max(scenarioA, scenarioB);
  }
  console.log(finalOutcome);
};

performCalculation(require('node:fs').readFileSync('/dev/stdin', 'utf8'));