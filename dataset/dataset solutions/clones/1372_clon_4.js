let inputStorage = [];
process.stdin.on('data', function(incomingSegment) {
  inputStorage.push(incomingSegment);
});

process.stdin.on('end', function() {
  let completeInput = inputStorage.join('');
  let dataRows = completeInput.split('\n');
  processSequence(dataRows);
});

function processSequence(sourceCollection, currentPosition = 0) {
  if (currentPosition >= sourceCollection.length || sourceCollection[currentPosition] === '0') {
    return;
  }

  let currentEntry = sourceCollection[currentPosition];
  let calculatedSum = currentEntry.split('').reduce((accumulatedValue, characterUnit) => {
    let digitRepresentation = parseInt(characterUnit, 10);
    return accumulatedValue + digitRepresentation;
  }, 0);

  console.log(calculatedSum);

  processSequence(sourceCollection, currentPosition + 1);
}