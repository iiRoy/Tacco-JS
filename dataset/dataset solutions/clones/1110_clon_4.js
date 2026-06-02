(function processHeapData() {
  const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
  const inputSegments = inputSource.split('\n');

  const elementCount = Number(inputSegments.shift());
  const heapValues = inputSegments.shift().split(' ').map(Number);

  const formattedOutputLines = heapValues.map((currentVal, idx, allVals) => {
    const parts = [];
    parts.push(`node ${idx}: key = ${currentVal}, `);

    const parentIdx = Math.floor((idx - 1) / 2);
    if (idx > 0) {
      parts.push(`parent key = ${allVals[parentIdx]}, `);
    }

    const leftIdx = 2 * idx + 1;
    if (leftIdx < allVals.length) {
      parts.push(`left key = ${allVals[leftIdx]}, `);
    }

    const rightIdx = 2 * idx + 2;
    if (rightIdx < allVals.length) {
      parts.push(`right key = ${allVals[rightIdx]}, `);
    }
    return parts.join('');
  });

  formattedOutputLines.forEach(line => console.log(line));
})();
