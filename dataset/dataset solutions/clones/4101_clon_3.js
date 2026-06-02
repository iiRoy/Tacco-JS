function processInputData(rawData) {
  const lineArray = rawData.split("\n");

  const relevantLines = lineArray.slice(1, lineArray.length + 1);

  function getUniqueElements(sourceCollection) {
    return sourceCollection.filter((currentElement, currentIndex, fullCollection) => {
      return fullCollection.indexOf(currentElement) === currentIndex;
    });
  }

  const distinctLines = getUniqueElements(relevantLines);

  const countOfUniqueEntries = distinctLines.length;

  console.log(parseInt(countOfUniqueEntries));
}

const standardInputPath = '/dev/stdin';

const fileSystemUtility = require('fs');
const fileContentString = fileSystemUtility.readFileSync(standardInputPath, 'utf8');

processInputData(fileContentString);
