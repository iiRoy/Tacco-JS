function processInputAndPrint(sourceText) {
  const finalChar = sourceText.slice(-1);

  const resultLookup = new Map([
    ['2', 'hon'], ['4', 'hon'], ['5', 'hon'], ['7', 'hon'], ['9', 'hon'],
    ['3', 'bon'],
    ['0', 'pon'], ['1', 'pon'], ['6', 'pon'], ['8', 'pon']
  ]);

  const outputValue = resultLookup.get(finalChar);
  if (outputValue !== undefined) {
    console.log(outputValue);
  }
}

processInputAndPrint(require('fs').readFileSync('/dev/stdin', 'utf8'));
