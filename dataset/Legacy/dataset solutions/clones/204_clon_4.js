function processInputAndOutput(sourceSegments) {
  const temporarySwapMarker = '_#_SWAP_TOKEN_#_';

  const transformedSegments = sourceSegments.map(currentSegment => {
    const firstPass = currentSegment.replace(/apple/g, temporarySwapMarker);
    const secondPass = firstPass.replace(/peach/g, 'apple');
    const finalSegment = secondPass.replace(new RegExp(temporarySwapMarker, 'g'), 'peach');
    return finalSegment;
  });

  transformedSegments.forEach(outputSegment => {
    console.log(outputSegment);
  });
}

let accumulatedInputString = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  accumulatedInputString += dataChunk;
});
process.stdin.on('end', function() {
  const parsedInputSegments = accumulatedInputString.split('\n');
  processInputAndOutput(parsedInputSegments);
});
