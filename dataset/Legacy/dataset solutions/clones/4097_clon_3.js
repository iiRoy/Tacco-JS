const fileSystemModule = require('fs');

function processInputContent(rawText) {
  const searchPatternCharacter = '7';
  const replacementCharacterValue = '8';

  // Create a RegExp object from the character to be replaced.
  // This is functionally equivalent to a literal /7/ for the first match.
  const regexForFirstMatch = new RegExp(searchPatternCharacter);

  // Apply the replacement operation.
  const transformedText = rawText.replace(regexForFirstMatch, replacementCharacterValue);

  return transformedText;
}

const standardInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const finalProcessedOutput = processInputContent(standardInputData);

console.log(finalProcessedOutput);
