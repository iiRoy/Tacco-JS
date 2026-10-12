function Main(inputData) {
  const lines = inputData.trim().split('\n');

  const [firstLineContent, secondLineContent] = lines;

  const [totalElementsStr, divisorValueStr] = firstLineContent.split(' ');
  const totalElements = parseInt(totalElementsStr, 10);
  const divisorValue = parseInt(divisorValueStr, 10);

  const numberSequence = secondLineContent.split(' ').map(val => parseInt(val, 10));
  let resultAccumulator = 0;

  numberSequence.forEach((currentElement, startIdx) => {
    let runningSum = currentElement;
    let currentSubarrayLength = 1;

    console.log(currentElement);

    if (currentElement % divisorValue === 1) {
      resultAccumulator++;
    }

    numberSequence.slice(startIdx + 1).forEach((nextElement, relativeOffset) => {
      runningSum += nextElement;
      currentSubarrayLength = relativeOffset + 2;

      console.log('tmp = ' + runningSum);

      if (runningSum % divisorValue === currentSubarrayLength) {
        resultAccumulator++;
      }
      console.log(resultAccumulator);
    });
  });

  console.log(resultAccumulator);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
