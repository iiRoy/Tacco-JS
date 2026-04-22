function operateOnNumericCollection(sourceTextualData) {
  const textualLineSegments = sourceTextualData.split(/\r?\n/);

  const initialNumericSequence = textualLineSegments[0].match(/-?\d+/g).map(Number);

  const operationRepetitions = Number(textualLineSegments[1]);

  const applyRecursiveTransformation = (currentCollection, remainingTransformations) => {
    if (remainingTransformations === 0) {
      return currentCollection;
    }

    const peakElementDetails = currentCollection.reduce((accumulator, currentValue, currentIndex) => {
      if (currentValue > accumulator.highestValue) {
        return { highestValue: currentValue, firstFoundIndex: currentIndex };
      }
      return accumulator;
    }, { highestValue: -Infinity, firstFoundIndex: -1 });

    const transformedCollection = currentCollection.map((element, index) => {
      return index === peakElementDetails.firstFoundIndex ? element * 2 : element;
    });

    return applyRecursiveTransformation(transformedCollection, remainingTransformations - 1);
  };

  return applyRecursiveTransformation(initialNumericSequence, operationRepetitions);
}

operateOnNumericCollection(require('fs').readFileSync('/dev/stdin', 'utf8'));