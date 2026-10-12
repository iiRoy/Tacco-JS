const processInputSequence = (dataSegments) => {
  const disallowedPatterns = new Set(['AAA', 'BBB']);

  const assembledContent = dataSegments.reduce((accumulator, currentItem) => {
    return accumulator + currentItem;
  }, '');

  const responseMap = new Map([
    [true, 'No'],
    [false, 'Yes']
  ]);

  console.log(responseMap.get(disallowedPatterns.has(assembledContent)));
};

processInputSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
