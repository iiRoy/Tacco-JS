(function () {
  let inputBuffer = '';

  function processInputData() {
    const lineSegments = inputBuffer.split('\n');
    
    const relevantLines = lineSegments.slice(0, lineSegments.length - 1);

    const bookCollection = relevantLines.reduce((accumulatorMap, currentLineText) => {
      const lineParts = currentLineText.split(' ');
      const primaryKey = lineParts[0];
      const secondaryValue = lineParts[1];

      if (!accumulatorMap.has(primaryKey)) {
        accumulatorMap.set(primaryKey, []);
      }
      accumulatorMap.get(primaryKey).push(secondaryValue);
      return accumulatorMap;
    }, new Map());

    const orderedBookEntries = Array.from(bookCollection.entries())
      .map(([entryKey, entryValues]) => [entryKey, entryValues.sort((valA, valB) => valA - valB)])
      .sort(([keyOne], [keyTwo]) => keyOne.localeCompare(keyTwo));

    orderedBookEntries.forEach(([outputKeyIdentifier, outputValueArray]) => {
      console.log(outputKeyIdentifier);
      console.log(outputValueArray.join(' '));
    });
  }

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (dataChunk) => {
    inputBuffer += dataChunk;
  });

  process.stdin.on('end', () => {
    processInputData();
  });
}());
