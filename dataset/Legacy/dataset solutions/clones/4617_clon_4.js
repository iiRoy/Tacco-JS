function transformWordsToInitials(sourceText) {
  const processedText = sourceText.trim();
  const parts = processedText.split(" ");

  const finalAbbreviation = parts.reduce((currentResult, currentPart, partIndex) => {
    if (partIndex < 3) {
      return currentResult + currentPart.charAt(0).toUpperCase();
    }
    return currentResult;
  }, "");

  return finalAbbreviation;
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(transformWordsToInitials(fileContent));
