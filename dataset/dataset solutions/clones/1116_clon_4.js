(function mainProcess(){
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const inputCount = Number(inputLines.shift());
  console.log(' ' + constructMaxHeap(inputLines.shift().split(' ').map(Number)).join(' '));
})();

function constructMaxHeap(sourceArray) {
  const elementCount = sourceArray.length;
  if (elementCount <= 1) {
    return sourceArray;
  }

  for (let currentPosition = 1; currentPosition < elementCount; currentPosition++) {
    let childIndex = currentPosition;
    while (childIndex > 0) {
      const parentIndex = Math.floor((childIndex - 1) / 2);
      if (sourceArray[childIndex] > sourceArray[parentIndex]) {
        [sourceArray[childIndex], sourceArray[parentIndex]] = [sourceArray[parentIndex], sourceArray[childIndex]];
        childIndex = parentIndex;
      } else {
        break;
      }
    }
  }
  return sourceArray;
}
