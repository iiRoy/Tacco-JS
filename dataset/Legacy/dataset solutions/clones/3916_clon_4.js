function processRangeData(inputString) {
  const [initialValue, finalValue, selectionCount] = inputString.trim().split(" ").map(Number);

  const distinctElements = new Set();

  Array.from({ length: selectionCount }, (_, index) => initialValue + index)
    .filter(element => element <= finalValue)
    .forEach(element => distinctElements.add(element));

  Array.from({ length: selectionCount }, (_, index) => finalValue - index)
    .filter(element => element >= initialValue)
    .forEach(element => distinctElements.add(element));

  const orderedResult = Array.from(distinctElements).sort((valA, valB) => valA - valB);

  orderedResult.forEach(item => console.log(item));
}

processRangeData(require('fs').readFileSync('/dev/stdin', 'utf8'));
