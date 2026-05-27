const processInput = (rawContent) => {
  const contentLines = rawContent.split('\n');
  const initialNumericValue = Number(contentLines.shift());
  const stringCollection = contentLines;

  const seenElementsMap = stringCollection.reduce((accumulatorObject, currentString) => {
    accumulatorObject[currentString] = true;
    return accumulatorObject;
  }, {});

  const distinctElementCount = Object.keys(seenElementsMap).length;

  console.log(distinctElementCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
