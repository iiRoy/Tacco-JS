const processInputDataChunk = function(inputDataChunk) {
  const stringElements = inputDataChunk.split(' ');

  const numericComparisonFunction = function(firstElement, secondElement) {
    return firstElement - secondElement;
  };

  const sortedElements = stringElements.sort(numericComparisonFunction);
  const outputString = sortedElements.join(' ');
  console.log(outputString);
};

process.stdin.on('data', processInputDataChunk);
