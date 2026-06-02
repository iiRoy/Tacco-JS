((sourceText) => {
  const processedLines = sourceText.trimEnd().split('\n');
  const caseCount = Number(processedLines.shift());

  Array.from({ length: caseCount }).forEach(() => {
    const currentCaseNumbers = processedLines.shift().split(' ').map(Number);
    console.log(evaluateSequence(currentCaseNumbers));
  });
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

function evaluateSequence(inputElements) {
  const [thresholdValue, ...remainingElements] = inputElements;

  const filteredElements = remainingElements.filter(
    (currentElement) => currentElement <= thresholdValue
  );

  const isStrictlyAscending = filteredElements.every((current, index, arr) => {
    if (index === 0) {
      return true;
    }
    return current > arr[index - 1];
  });

  return isStrictlyAscending ? 'YES' : 'NO';
}
