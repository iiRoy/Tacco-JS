(function () {
  var rawDataBuffer = '';

  function executeMainProcessing () {
    var processedLines,
        lineCount,
        lineIndex,
        currentNumericValue,
        computedTrailingZeros;
    
    processedLines = rawDataBuffer.split('\n');
    lineCount = processedLines.length - 1;

    for (lineIndex = 0; lineIndex < lineCount; lineIndex += 1) {
      var currentLineSegment = processedLines[lineIndex];
      currentNumericValue = parseInt(currentLineSegment, 10);

      if (currentNumericValue === 0) {
        break;
      } else {
        computedTrailingZeros = determineTrailingZerosInFactorial(currentNumericValue);
        console.log(computedTrailingZeros);
      }
    }
  }

  function determineTrailingZerosInFactorial (inputNumberForFactorial) {
    var iterationDivisor,
        totalZeroCount = 0;
    
    const FACTOR_BASE = 5;

    if (inputNumberForFactorial < FACTOR_BASE) {
      return 0;
    }

    for (iterationDivisor = inputNumberForFactorial; iterationDivisor >= FACTOR_BASE; iterationDivisor /= FACTOR_BASE) {
      totalZeroCount += Math.floor(iterationDivisor / FACTOR_BASE);
    }

    return totalZeroCount;
  }
  
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', function (inputChunk) {
    rawDataBuffer += inputChunk;
  });

  function handleInputEndEvent () {
    executeMainProcessing();
  }
  process.stdin.on('end', handleInputEndEvent);
}());
