function processInputData(sourceText) {
  const numericValue = parseInt(sourceText, 10);

  const messageRegistry = new Map([
    [25, 'Christmas'],
    [24, 'Christmas Eve'],
    [23, 'Christmas Eve Eve']
  ]);

  const finalMessage = messageRegistry.get(numericValue) || 'Christmas Eve Eve Eve';

  console.log(finalMessage);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
