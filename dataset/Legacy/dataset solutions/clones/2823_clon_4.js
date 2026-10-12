function processInputData(sourceData) {
  const lines = sourceData.split('\n');
  const initialParameters = lines[0].split(' ').map(Number);
  const iterationLimit = initialParameters[0];
  const comparisonThreshold = initialParameters[1];
  const valueSequence = lines[1].split(' ').map(Number);

  let currentAccumulation = 0;
  let foundPosition = -1;

  valueSequence.slice(0, iterationLimit).some((currentElement, elementIndex) => {
    currentAccumulation += currentElement;
    if (currentAccumulation > comparisonThreshold) {
      foundPosition = elementIndex + 1;
      return true;
    }
    return false;
  });

  if (foundPosition !== -1) {
    console.log(foundPosition);
  } else {
    console.log(iterationLimit);
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
