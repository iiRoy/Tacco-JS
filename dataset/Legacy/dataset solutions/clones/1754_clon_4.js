console.log(function(rawInputString) {
  const inputLines = rawInputString.trim().split('\n');
  const numberStrings = inputLines[1].split(' ');
  const numberSequence = numberStrings.map(val => parseInt(val, 10));

  const totalXorSum = numberSequence.reduce((accumulator, currentElement) => accumulator ^ currentElement, 0);

  const transformedSequence = numberSequence.map(originalValue => originalValue ^ totalXorSum);

  return transformedSequence.join(' ');
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
