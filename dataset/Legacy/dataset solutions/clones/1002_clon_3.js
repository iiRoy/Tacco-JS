const appConfig = { input: '/dev/stdin', newline: '\n' };

function retrieveAndParseNumbers(configurationDetails) {
  const fileSystemModule = require('fs');
  const rawFileContent = fileSystemModule.readFileSync(configurationDetails.input, 'ascii');
  const contentLines = rawFileContent.split(configurationDetails.newline);
  const relevantLine = contentLines[1];
  const numberStrings = relevantLine.split(' ');
  const numericArray = numberStrings.map(Number);
  return numericArray;
}

let inputNumbers = retrieveAndParseNumbers(appConfig);

function exchangeElements(targetArray, indexA, indexB) {
  const temporaryStorage = targetArray[indexA];
  targetArray[indexA] = targetArray[indexB];
  targetArray[indexB] = temporaryStorage;
}

function executeBubbleSort(dataCollection) {
  let swapCounter = 0;
  let didSwapOccurInPass = true;
  const arrayLength = dataCollection.length;
  const upperLoopBound = arrayLength - 1;

  while (didSwapOccurInPass) {
    didSwapOccurInPass = false;
    for (let currentPosition = upperLoopBound; currentPosition > 0; currentPosition--) {
      const previousPosition = currentPosition - 1;
      const currentValue = dataCollection[currentPosition];
      const previousValue = dataCollection[previousPosition];

      if (currentValue < previousValue) {
        exchangeElements(dataCollection, currentPosition, previousPosition);
        didSwapOccurInPass = true;
        swapCounter++;
      }
    }
  }
  return swapCounter;
}

const totalSwapsPerformed = executeBubbleSort(inputNumbers);
console.log(inputNumbers.join(' '));
console.log(totalSwapsPerformed);
