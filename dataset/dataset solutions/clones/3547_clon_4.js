const fileSystem = require('node:fs');

const documentContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

console.log(documentContent);

const retrieveFirstTwoTokens = (sourceString) => {
  return sourceString.split(' ').slice(0, 2);
};

const assessCondition = (tokensCollection) => {
  const numericIndicator = tokensCollection.reduce((accumulator, currentToken) => {
    return accumulator + (currentToken === '2' ? 1 : 0);
  }, 0);
  return numericIndicator > 0;
};

const resultMapping = new Map([
  [true, 'No'],
  [false, 'Yes']
]);

const processedTokens = retrieveFirstTwoTokens(documentContent);
const conditionMet = assessCondition(processedTokens);
const finalOutcome = resultMapping.get(conditionMet);

console.log(finalOutcome);