const processDataStream = (streamContent) => {
  const inputLines = streamContent.trim().split('\n');
  const totalEntries = Number(inputLines.shift());

  const entrySet = inputLines.map((lineText, entryIndex) => {
    const numericalValues = lineText.split(' ').map(Number);
    return {
      refId: entryIndex,
      attributeOne: numericalValues[0],
      attributeTwo: numericalValues[1]
    };
  });

  const establishRelationship = (firstEntry, secondEntry) => {
    const deltaA = firstEntry.attributeOne - secondEntry.attributeOne;
    const deltaB = firstEntry.attributeTwo - secondEntry.attributeTwo;
    return deltaA !== 0 && deltaB !== 0 && Math.sign(deltaA) === Math.sign(deltaB);
  };

  const entriesWithConnectionCounts = entrySet.map((currentEntry, currentIndex) => {
    const directConnections = entrySet.filter((otherEntry, otherIndex) =>
      currentIndex !== otherIndex && establishRelationship(currentEntry, otherEntry)
    ).length;
    return {
      ...currentEntry,
      directLinkCount: directConnections
    };
  });

  const finalCalculatedScores = entriesWithConnectionCounts.map((currentEntry, currentIndex) => {
    let cumulativeScore = 1;

    cumulativeScore += entriesWithConnectionCounts.filter((otherEntry, otherIndex) =>
      currentIndex !== otherIndex && establishRelationship(currentEntry, otherEntry)
    ).reduce((sumOfNeighborCounts, relatedEntry) =>
      sumOfNeighborCounts + relatedEntry.directLinkCount, 0);

    return cumulativeScore;
  });

  finalCalculatedScores.forEach(result => console.log(result));
};

processDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));