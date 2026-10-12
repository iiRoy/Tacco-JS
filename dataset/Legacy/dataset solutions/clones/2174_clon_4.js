const processInput = (sourceData) => {
  const expectedCount = Number.parseInt(sourceData[0]);
  const elementStrings = sourceData[1].split(' ');

  const uniqueElementTracker = elementStrings.reduce((accumulator, currentItem) => {
    accumulator[currentItem] = true;
    return accumulator;
  }, {});

  const actualUniqueCount = Object.keys(uniqueElementTracker).length;

  console.log(expectedCount === actualUniqueCount ? 'YES' : 'NO');
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
