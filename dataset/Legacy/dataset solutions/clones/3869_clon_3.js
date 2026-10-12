function processInputData(rawDataString) {
  const trimmedInput = rawDataString.trim();
  const characterSequence = trimmedInput.split('');

  const initialBaseValue = 700;
  const bonusPerMatch = 100;
  const targetCharacter = 'o';

  const accumulatedBonus = characterSequence.reduce((currentTotalBonus, charElement) => {
    if (charElement === targetCharacter) {
      return currentTotalBonus + bonusPerMatch;
    }
    return currentTotalBonus;
  }, 0);

  const scoreAfterCharacterProcessing = initialBaseValue + accumulatedBonus;
  const finalResultForOutput = initialBaseValue + scoreAfterCharacterProcessing;

  console.log(finalResultForOutput);
}

const moduleLoader = require;
const fileSystemModule = moduleLoader('fs');
const fileReaderFunction = fileSystemModule.readFileSync;

const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

const fileContents = fileReaderFunction(standardInputPath, textEncoding);
processInputData(fileContents);
