function processInput(dataString) {
  const paramTokens = dataString.split(' ');
  const limitCount = parseInt(paramTokens[0], 10);
  const centerValue = parseInt(paramTokens[1], 10);

  const offsetRange = limitCount - 1;

  const sequenceStart = centerValue - offsetRange;
  const sequenceEnd = centerValue + offsetRange;
  const totalElements = sequenceEnd - sequenceStart + 1;

  const resultSequence = Array.from({ length: totalElements }, (_, index) => sequenceStart + index);

  console.log(resultSequence.join(' '));
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
