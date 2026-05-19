'use strict';

function countCharacterOccurrences(sourceString, targetCharacter) {
  const characterPattern = new RegExp(targetCharacter, 'g');
  const characterMatches = sourceString.match(characterPattern);
  return characterMatches ? characterMatches.length : 0;
}

function processInputData(rawInputString) {
  const firstLineContent = rawInputString.split('\n')[0];
  const countOfOnes = countCharacterOccurrences(firstLineContent, '1');
  console.log(countOfOnes);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
