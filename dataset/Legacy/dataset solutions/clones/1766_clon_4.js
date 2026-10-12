function processInputData(sourceText) {
  const tokenSequence = sourceText.split(' ');

  tokenSequence
    .map((segmentValue, segmentIndex) => ({ segmentValue, segmentIndex }))
    .filter(item => item.segmentValue === '0')
    .forEach(item => console.log(item.segmentIndex + 1));
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
