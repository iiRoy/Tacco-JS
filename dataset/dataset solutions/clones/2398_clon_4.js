function ProcessInput(rawData) {
  const linesOfText = rawData.trim().split('\n');

  const dimensions = linesOfText[0].split(' ');
  const arraySize = Number(dimensions[0]);
  const divisorValue = Number(dimensions[1]);

  const initialNumbers = linesOfText[1].split(' ').map(str => Number(str));

  let validSubarrayCount = 0;

  const prefixSumsContainer = new Array(arraySize + 1).fill(0);
  for (let currentElementIndex = 0; currentElementIndex < arraySize; currentElementIndex++) {
    prefixSumsContainer[currentElementIndex + 1] = prefixSumsContainer[currentElementIndex] + initialNumbers[currentElementIndex];
  }

  for (let startIndex = 0; startIndex < arraySize; startIndex++) {
    for (let endIndex = startIndex; endIndex < arraySize; endIndex++) {
      const currentSubarraySum = prefixSumsContainer[endIndex + 1] - prefixSumsContainer[startIndex];
      const currentSubarrayLength = endIndex - startIndex + 1;

      if (currentSubarraySum % divisorValue === currentSubarrayLength) {
        validSubarrayCount++;
      }
    }
  }

  console.log(validSubarrayCount);
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
