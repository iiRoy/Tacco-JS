let activeValue = 'A';
const INPUT_DELIMITER = ',';

process.stdin.resume();
process.stdin.setEncoding('utf8');

function resolveNextIdentifier(segmentOne, segmentTwo, currentIdentifier) {
  if (segmentOne == currentIdentifier) {
    return segmentTwo;
  } else if (segmentTwo == currentIdentifier) {
    return segmentOne;
  }
  return currentIdentifier;
}

process.stdin.on('data', function(incomingDataChunk) {
  const cleanedData = incomingDataChunk.trim();
  const processedSegments = cleanedData.split(INPUT_DELIMITER);

  activeValue = resolveNextIdentifier(processedSegments[0], processedSegments[1], activeValue);
});

process.stdin.on('end', function() {
  console.log(activeValue);
});
