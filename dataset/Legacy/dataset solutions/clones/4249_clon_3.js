function processInputData(rawData) {
  const parsedLines = rawData.split('\n');

  const firstLineContent = parsedLines[0];
  const secondLineContent = parsedLines[1];

  const sourceString = String(firstLineContent);
  const comparisonTarget = String(secondLineContent);

  const reverseString = (inputStr) => {
    const charactersArray = inputStr.split('');
    const reversedCharactersArray = charactersArray.reverse();
    const joinedReversedString = reversedCharactersArray.join('');
    return joinedReversedString;
  };

  const reversedSource = reverseString(sourceString);

  let finalOutcome;
  if (reversedSource === comparisonTarget) {
    finalOutcome = 'YES';
  } else {
    finalOutcome = 'NO';
  }

  console.log(finalOutcome);
}

const fileSystemModule = require('fs');
const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

processInputData(standardInputContent);
