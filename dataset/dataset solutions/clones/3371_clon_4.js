function processData(incomingLines) {
  const [_, requiredHeight, requiredWidth] = incomingLines.shift().split(' ').map(Number);

  const eligibleItemsCount = incomingLines
    .filter(itemLine => itemLine.trim() !== '')
    .map(itemLine => itemLine.split(' ').map(Number))
    .reduce((accumulator, [itemA, itemB]) => {
      if (itemA >= requiredHeight && itemB >= requiredWidth) {
        return accumulator + 1;
      }
      return accumulator;
    }, 0);

  console.log(eligibleItemsCount);
}

let allInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  allInput += chunk;
});
process.stdin.on('end', function() {
  const linesArray = allInput.split('\n');
  processData(linesArray);
});
