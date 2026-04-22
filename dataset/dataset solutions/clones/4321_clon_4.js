function determineOptimalSum(sourceText) {
  const numericComponents = sourceText.trim().match(/\d+/g).map(Number);
  const [initialMarker, ...remainingNumbers] = numericComponents;

  const collectionOfPairs = [];
  for (let index = 0; index < remainingNumbers.length; index += 2) {
    collectionOfPairs.push({ primaryDatum: remainingNumbers[index], secondaryDatum: remainingNumbers[index + 1] });
  }

  const resultPair = collectionOfPairs.reduce((currentBestItem, currentItem) => {
    if (currentItem.primaryDatum >= currentBestItem.primaryDatum) {
      return currentItem;
    }
    return currentBestItem;
  }, { primaryDatum: -Infinity, secondaryDatum: 0 });

  return resultPair.primaryDatum + resultPair.secondaryDatum;
}

const fileContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const finalOutcome = determineOptimalSum(fileContent);
console.log(finalOutcome);