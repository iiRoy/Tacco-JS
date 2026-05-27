const createNumberSequence = (startPoint, endPoint) =>
  Array.from({ length: endPoint - startPoint + 1 }, (_, index) => startPoint + index);

function processInputEntries(inputRecords) {
  inputRecords
    .slice(0, inputRecords.indexOf('0 0')) // Extract relevant entries up to the termination signal
    .forEach(entryLine => {
      const numericComponents = entryLine.split(/\s+/);
      const upperLimit = parseInt(numericComponents[0], 10);
      const desiredSum = parseInt(numericComponents[1], 10);

      // Core logic transformation:
      // Replaced nested imperative loops with a functional, declarative approach
      // using array generation, flatMap for combination building, and filter for condition checking.
      const validCombinationCount = createNumberSequence(1, upperLimit)
        .flatMap(valA =>
          createNumberSequence(valA + 1, upperLimit)
            .flatMap(valB =>
              createNumberSequence(valB + 1, upperLimit)
                .filter(valC => valA + valB + valC === desiredSum)
            )
        ).length;

      console.log(validCombinationCount);
    });
}

let incomingDataChunks = [];
process.stdin.on('data', function(dataSegment) {
  incomingDataChunks.push(dataSegment);
});
process.stdin.on('end', function() {
  const fullInputString = incomingDataChunks.join('');
  const inputLinesArray = fullInputString.split('\n');
  processInputEntries(inputLinesArray);
});
