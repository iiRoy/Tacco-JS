(function(rawInputString) {
  const ZERO_INDICATOR_VALUE = 0;
  const LINE_BREAK_CHARACTER = '\n';
  const TRAILING_LINE_BREAK_PATTERN = /\n$/;

  const processedInputContent = rawInputString.replace(TRAILING_LINE_BREAK_PATTERN, '');

  const stringValueArray = processedInputContent.split(LINE_BREAK_CHARACTER);

  const numericSequence = stringValueArray.map(Number);

  const dataStorageStack = [];

  const handleZeroValueOperation = (targetStack) => {
    const itemToOutput = targetStack.pop();
    console.log(itemToOutput);
  };

  while (numericSequence.length > ZERO_INDICATOR_VALUE) {
    const currentProcessedValue = numericSequence.shift();

    if (currentProcessedValue === ZERO_INDICATOR_VALUE) {
      handleZeroValueOperation(dataStorageStack);
      continue;
    } else {
      dataStorageStack.push(currentProcessedValue);
    }
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
