function processInput(firstParam, secondParam) {
  if (firstParam % 2 !== 0) {
    console.log('No');
  }
  let segmentOne = secondParam.slice(0, firstParam / 2);
  let segmentTwo = secondParam.slice(firstParam / 2, firstParam);
  if (segmentOne == segmentTwo) {
    console.log('Yes');
  }
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
