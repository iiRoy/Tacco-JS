function main(inputString) {
  const processedString = inputString.trim();

  const frequencyMap = processedString.split('').reduce((accumulator, currentCharacter) => {
    accumulator.set(currentCharacter, (accumulator.get(currentCharacter) || 0) + 1);
    return accumulator;
  }, new Map());

  const targetChars = ['a', 'b', 'c'];

  const allTargetCharsPresentOnce = targetChars.every(char => frequencyMap.get(char) === 1);

  console.log(allTargetCharsPresentOnce ? 'Yes' : 'No');
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
