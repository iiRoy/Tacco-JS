(function () {
  let rawInputData = '';

  function orchestrateProcessing() {
    const parsedInputSegments = rawInputData.split('\n');
    const pertinentInputElements = parsedInputSegments.slice(0, parsedInputSegments.length - 1);
    processInputSequence(pertinentInputElements, 0);
  }

  function computeFactorialTrailingZeros(numericValue) {
    if (numericValue < 5) {
      return 0;
    }
    return Math.floor(numericValue / 5) + computeFactorialTrailingZeros(Math.floor(numericValue / 5));
  }

  function processInputSequence(inputSegmentsArray, currentSegmentIndex) {
    if (currentSegmentIndex >= inputSegmentsArray.length) {
      return;
    }

    const parsedNumericValue = parseInt(inputSegmentsArray[currentSegmentIndex], 10);

    if (parsedNumericValue === 0) {
      return;
    } else {
      const calculatedTrailingZeros = computeFactorialTrailingZeros(parsedNumericValue);
      console.log(calculatedTrailingZeros);
      processInputSequence(inputSegmentsArray, currentSegmentIndex + 1);
    }
  }

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (dataChunk) {
    rawInputData += dataChunk;
  });

  process.stdin.on('end', function () {
    orchestrateProcessing();
  });
}());
