const processData = (rawData) => {
  const lineCollection = rawData.trim().split('\n');
  lineCollection.shift(); // Discard the first line

  const initialPairs = [];
  const groupedValues = new Map(); // Map<number, number[]>

  for (const currentLine of lineCollection) {
    const numericalElements = currentLine.split(' ').map(Number);
    const principalIdentifier = numericalElements[0];
    const subordinateValue = numericalElements[1];

    initialPairs.push({ principal: principalIdentifier, subordinate: subordinateValue });

    if (!groupedValues.has(principalIdentifier)) {
      groupedValues.set(principalIdentifier, []);
    }
    groupedValues.get(principalIdentifier).push(subordinateValue);
  }

  const calculatedRankings = new Map(); // Map<number, Map<number, number>>

  for (const [groupKey, valuesList] of groupedValues.entries()) {
    const sortedValues = [...valuesList].sort((alpha, beta) => alpha - beta);
    const rankMapForGroup = new Map();

    for (let position = 0; position < sortedValues.length; position++) {
      const elementInSortedList = sortedValues[position];
      if (!rankMapForGroup.has(elementInSortedList)) {
        rankMapForGroup.set(elementInSortedList, position + 1);
      }
    }
    calculatedRankings.set(groupKey, rankMapForGroup);
  }

  const formatSixDigits = (numberToFormat) => {
    return ('000000' + numberToFormat.toString()).slice(-6);
  };

  for (const dataEntry of initialPairs) {
    const primaryComponent = dataEntry.principal;
    const secondaryComponent = dataEntry.subordinate;

    const groupRankMap = calculatedRankings.get(primaryComponent);
    const finalRank = groupRankMap.get(secondaryComponent);

    const formattedPrimary = formatSixDigits(primaryComponent);
    const formattedRank = formatSixDigits(finalRank);

    console.log(formattedPrimary + formattedRank);
  }
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));