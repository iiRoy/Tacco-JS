let incomingContent = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (part) => {
  incomingContent += part;
});
process.stdin.on('end', () => {
  const allTextLines = incomingContent.split(/\r\n|\r|\n/g);
  beginDataProcessing(allTextLines);
});

const beginDataProcessing = (sourceTextUnits) => {
  const processNextSegment = (unitCollection, currentUnitIndex) => {
    const definitionCount = Number(unitCollection[currentUnitIndex]);
    if (!definitionCount) {
      return;
    }

    const consumeUnits = (startPoint, countAmount, processingFunction) => {
      const extractedUnits = unitCollection.slice(startPoint, startPoint + countAmount).map(processingFunction);
      return { extracted: extractedUnits, nextPosition: startPoint + countAmount };
    };

    const { extracted: mappingEntries, nextPosition: afterMappings } = consumeUnits(
      currentUnitIndex + 1,
      definitionCount,
      (singleLine) => singleLine.split(' ')
    );

    const translationRegistry = new Map(mappingEntries);

    const outputItemCount = Number(unitCollection[afterMappings]);
    const { extracted: sourceKeysForOutput, nextPosition: afterKeysForOutput } = consumeUnits(
      afterMappings + 1,
      outputItemCount,
      (singleLine) => singleLine
    );

    const transformedItems = sourceKeysForOutput.map((queryKey) =>
      translationRegistry.has(queryKey) ? translationRegistry.get(queryKey) : queryKey
    );

    console.log(transformedItems.join(''));

    processNextSegment(unitCollection, afterKeysForOutput);
  };

  processNextSegment(sourceTextUnits, 0);
};