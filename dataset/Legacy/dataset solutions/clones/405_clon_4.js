#!/usr/bin/node
(function() {
  const sequenceLength = 31;
  const tribonacciValues = Array(sequenceLength).fill(0).reduce((accumulator, _, currentIndex) => {
    if (currentIndex === 0) {
      accumulator.push(1);
    } else if (currentIndex === 1) {
      accumulator.push(1);
    } else if (currentIndex === 2) {
      accumulator.push(2);
    } else {
      accumulator.push(accumulator[currentIndex - 1] + accumulator[currentIndex - 2] + accumulator[currentIndex - 3]);
    }
    return accumulator;
  }, []);

  const inputSource = process.openStdin();
  inputSource.setEncoding('utf8');

  let currentInputBuffer = '';
  const collectedIndices = [];

  inputSource.on('data', (incomingChunk) => {
    currentInputBuffer += incomingChunk;
    let newlinePosition;
    while ((newlinePosition = currentInputBuffer.indexOf('\n')) !== -1) {
      const processedLine = currentInputBuffer.substring(0, newlinePosition);
      currentInputBuffer = currentInputBuffer.substring(newlinePosition + 1);
      if (processedLine.length > 0) {
        collectedIndices.push(processedLine ^ 0);
      }
    }
  });

  inputSource.on('end', () => {
    collectedIndices.forEach(targetIndex => {
      console.log((tribonacciValues[targetIndex] + 3649) / 3650 ^ 0);
    });
  });
})();
