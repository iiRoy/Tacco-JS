(function executeSortingProcess() {
  let inversionCount = 0;

  const readInputData = () => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
    const inputLines = fileContent.split('\n');
    const arraySize = Number(inputLines.shift());
    const dataArray = inputLines.shift().split(' ').map(Number);
    return { arraySize, dataArray };
  };

  const { arraySize, dataArray } = readInputData();

  function combineSortedHalves(targetArray, startIndex, middleIndex, endIndex) {
    const SENTINEL_VALUE = Infinity;

    let leftSubArray = targetArray.slice(startIndex, middleIndex);
    let rightSubArray = targetArray.slice(middleIndex, endIndex);

    leftSubArray.push(SENTINEL_VALUE);
    rightSubArray.push(SENTINEL_VALUE);

    let leftPtr = 0;
    let rightPtr = 0;

    for (let currentIdx = startIndex; currentIdx < endIndex; currentIdx++) {
      let valueToPlace;
      if (leftSubArray[leftPtr] <= rightSubArray[rightPtr]) {
        valueToPlace = leftSubArray[leftPtr];
        leftPtr++;
      } else {
        valueToPlace = rightSubArray[rightPtr];
        rightPtr++;
        inversionCount = inversionCount + 1;
      }
      targetArray[currentIdx] = valueToPlace;
    }
  }

  function recursiveMergeSort(targetArray, startIndex, endIndex) {
    if (startIndex + 1 < endIndex) {
      const middleIndex = Math.floor((startIndex + endIndex) / 2);
      recursiveMergeSort(targetArray, startIndex, middleIndex);
      recursiveMergeSort(targetArray, middleIndex, endIndex);
      combineSortedHalves(targetArray, startIndex, middleIndex, endIndex);
    }
  }

  recursiveMergeSort(dataArray, 0, arraySize);

  console.log(inversionCount);
})();
