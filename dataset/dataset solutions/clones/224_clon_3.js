function executeProgram() {
  const processedLines = rawInputBuffer;

  processedLines.forEach(function(currentInputLine) {
    const trimmedLine = currentInputLine.trim();
    if (trimmedLine.length === 0) {
      return;
    }

    const numericValue = parseFloat(trimmedLine);
    console.log(computeSeriesSum(numericValue));
  });
}

function computeSeriesSum(startingValue) {
  let iterationIndex = 2;
  const generatedSeries = [startingValue];

  const calculateNextElement = (previousElement, currentIteration) => {
    if (currentIteration % 2 === 0) {
      return previousElement * 2;
    } else {
      return previousElement / 3;
    }
  };

  while (iterationIndex <= 10) {
    const lastElement = generatedSeries[generatedSeries.length - 1];
    const nextElement = calculateNextElement(lastElement, iterationIndex);
    generatedSeries.push(nextElement);
    iterationIndex++;
  }

  const totalSum = generatedSeries.reduce(function(sumAccumulator, currentElement) {
    return sumAccumulator + currentElement;
  });

  return totalSum;
}

let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(dataSegment) {
  rawInputBuffer += dataSegment;
});

process.stdin.on('end', function() {
  rawInputBuffer = rawInputBuffer.split('\n');
  executeProgram();
});
