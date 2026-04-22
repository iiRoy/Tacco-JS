const inputCollector = [];
process.stdin.on('data', chunk => {
  inputCollector.push(chunk.toString());
});

process.stdin.on('end', () => {
  const fullTextContent = inputCollector.join('');
  const contentLines = fullTextContent.split('\n');

  const configurationValues = contentLines[0].split(' ').map(Number);
  const _discarded_item = configurationValues[0];
  const windowSize = configurationValues[1];

  const sourceElements = contentLines[1].split(' ');

  const distinctOutcomes = new Set();

  Array.from({ length: sourceElements.length - windowSize + 1 }, (_, currentPos) => currentPos)
    .forEach(indexPosition => {
      const initialPart = sourceElements.slice(0, indexPosition);
      const focusPart = sourceElements.slice(indexPosition, indexPosition + windowSize);
      const finalPart = sourceElements.slice(indexPosition + windowSize);

      const sortedFocus = [...focusPart].sort((leftVal, rightVal) => leftVal > rightVal ? 1 : (leftVal < rightVal ? -1 : 0));

      const composedSequence = [...initialPart, ...sortedFocus, ...finalPart];
      distinctOutcomes.add(composedSequence.join(':'));
    });

  console.log(distinctOutcomes.size);
});