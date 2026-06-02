process.stdin.resume();
process.stdin.setEncoding('utf8');

const displayArrayState = (arr) => {
  console.log(arr.join(" "));
};

process.stdin.on('data', function (inputSegment) {
  const processedLines = inputSegment.toString().split('\n');

  const arraySize = Number(processedLines[0]);
  const numericArray = processedLines[1].split(' ').map(val => Number(val));

  displayArrayState(numericArray);

  const loopStartIndex = 1;

  for (let mainLoopIndex = loopStartIndex; mainLoopIndex < arraySize; mainLoopIndex++) {
    const currentElementValue = numericArray[mainLoopIndex];
    let insertionIndex = mainLoopIndex - 1;

    while (insertionIndex >= 0 && numericArray[insertionIndex] > currentElementValue) {
      numericArray[insertionIndex + 1] = numericArray[insertionIndex];
      insertionIndex--;
    }
    numericArray[insertionIndex + 1] = currentElementValue;
    displayArrayState(numericArray);
  }
});
