function calculateProgressiveTotals() {
  const lineSet = fullTextStream.split('\n');
  const sessionDuration = Number(lineSet[0]);
  const _ = lineSet[1].split(' ').map(Number); // Parse the 'c' line as in original, but its value is not used.

  const taskSpecifications = Array.from({ length: sessionDuration }, (_, idx) => {
    const optionLine = lineSet[2 + idx];
    const choiceLine = lineSet[2 + sessionDuration + idx];
    return {
      options: optionLine.split(' ').map(Number),
      selectionIndex: Number(choiceLine)
    };
  });

  taskSpecifications.reduce((accumulatorValue, currentTask) => {
    const chosenOption = currentTask.options[currentTask.selectionIndex];
    const newAccumulator = accumulatorValue + chosenOption;
    console.log(newAccumulator);
    return newAccumulator;
  }, 0);
}

var fullTextStream = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataBuffer) {
  fullTextStream += dataBuffer;
});
process.stdin.on('end', function() {
  calculateProgressiveTotals();
});