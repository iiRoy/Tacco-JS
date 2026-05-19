const applicationModule = (() => {
  let rawInputBuffer = '';

  const compareNumbersAscending = (valA, valB) => {
    return valA - valB;
  };

  const sortObjectKeysAlphabetically = (sourceObject) => {
    const unsortedKeys = Object.keys(sourceObject);
    unsortedKeys.sort();

    const alphabetizedObject = unsortedKeys.reduce((accumulator, currentKey) => {
      accumulator[currentKey] = sourceObject[currentKey];
      return accumulator;
    }, {});

    return alphabetizedObject;
  };

  const joinArrayElementsWithSpace = (inputArray) => {
    const arraySize = inputArray.length;

    if (arraySize === 0) {
      return '';
    }

    const outputString = inputArray.reduce((accumulator, currentElement, currentIndex) => {
      const separator = (currentIndex > 0) ? ' ' : '';
      return accumulator + separator + currentElement;
    }, '');

    return outputString;
  };

  const processInputData = () => {
    let lineIndex;
    let totalLinesToProcess;
    let currentLineSegments;
    const documentKeywordIndex = {};

    totalLinesToProcess = rawInputBuffer.length - 1;

    for (lineIndex = 0; lineIndex < totalLinesToProcess; lineIndex += 1) {
      currentLineSegments = rawInputBuffer[lineIndex].split(' ');

      const primaryKey = currentLineSegments[0];
      const associatedValue = currentLineSegments[1];

      if (!documentKeywordIndex.hasOwnProperty(primaryKey)) {
        documentKeywordIndex[primaryKey] = [];
      }
      documentKeywordIndex[primaryKey].push(associatedValue);
      documentKeywordIndex[primaryKey].sort(compareNumbersAscending);
    }

    const finalSortedIndex = sortObjectKeysAlphabetically(documentKeywordIndex);

    Object.entries(finalSortedIndex).forEach(([indexKey, valuesArray]) => {
      console.log(indexKey);
      console.log(joinArrayElementsWithSpace(valuesArray));
    });
  };

  return {
    init: () => {
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      process.stdin.on('data', (dataChunk) => {
        rawInputBuffer += dataChunk;
      });

      process.stdin.on('end', () => {
        rawInputBuffer = rawInputBuffer.split('\n');
        processInputData();
      });
    }
  };
})();

applicationModule.init();
