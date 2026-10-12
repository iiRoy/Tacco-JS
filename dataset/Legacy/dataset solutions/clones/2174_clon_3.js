function processInput(rawData) {
  const firstLineContent = rawData[0];
  const expectedCount = parseInt(firstLineContent, 10);

  const secondLineContent = rawData[1];
  const elementsFromSecondLine = secondLineContent.split(' ');

  const uniqueItemsSet = new Set(elementsFromSecondLine);
  const actualUniqueCount = uniqueItemsSet.size;

  if (expectedCount === actualUniqueCount) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
