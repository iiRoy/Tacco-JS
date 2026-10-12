function* seriesTermGenerator(startValue) {
  let currentVal = startValue;
  yield currentVal;

  for (let termIdx = 1; termIdx < 10; termIdx++) {
    if (termIdx % 2 !== 0) {
      currentVal *= 2;
    } else {
      currentVal /= 3;
    }
    yield currentVal;
  }
}

function computeSeriesTotal(initialValue) {
  let accumulatedSum = 0;
  for (const termValue of seriesTermGenerator(initialValue)) {
    accumulatedSum += termValue;
  }
  return accumulatedSum;
}

function processInputLines() {
  rawInputBuffer.split('\n')
    .map(function(lineText) {
      const trimmedLine = lineText.trim();
      return (trimmedLine === '') ? null : parseFloat(trimmedLine);
    })
    .filter(function(parsedValue) {
      return parsedValue !== null;
    })
    .forEach(function(numericValue) {
      console.log(computeSeriesTotal(numericValue));
    });
}

let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawInputBuffer += chunk;
});
process.stdin.on('end', function() {
  processInputLines();
});
