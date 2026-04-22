const analyzeTextData = (dataStream) => {
  const retrieveRelevantSegments = (collectionOfStrings) => {
    if (collectionOfStrings.length === 0 || collectionOfStrings[0] === '') {
      return [];
    }
    return [collectionOfStrings[0], ...retrieveRelevantSegments(collectionOfStrings.slice(1))];
  };

  const initialSegments = dataStream.split('\n');
  const operationalSegments = retrieveRelevantSegments(initialSegments);
  const combinedContent = operationalSegments.join('');

  const occurrenceRegistry = Array.from(combinedContent).reduce((tallyMap, currentSymbol) => {
    const adjustedSymbol = currentSymbol.toLowerCase();
    return tallyMap.set(adjustedSymbol, (tallyMap.get(adjustedSymbol) || 0) + 1);
  }, new Map());

  const alphabetSeries = Array.from({ length: 26 }, (_, position) =>
    String.fromCharCode('a'.charCodeAt(0) + position)
  );

  const finalReportEntries = alphabetSeries.map(charElement => {
    const recordedCount = occurrenceRegistry.get(charElement) || 0;
    return `${charElement} : ${recordedCount}`;
  });

  finalReportEntries.forEach(entryLine => console.log(entryLine));
};

analyzeTextData(require("fs").readFileSync("/dev/stdin", "utf8"));