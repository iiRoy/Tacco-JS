"use strict";

function main(input){
  const sourceText = input.trim();
  const wordSegments = sourceText.split(' ');
  const initialCharacters = [];

  for (let i = 0; i < wordSegments.length; i++) {
    const currentSegment = wordSegments[i];
    if (currentSegment.length > 0) {
      initialCharacters.push(currentSegment.charAt(0).toLocaleUpperCase());
    } else {
      initialCharacters.push(''); // Handle empty string segments from split, e.g., "a  b" -> ["a", "", "b"]
    }
  }

  let combinedResult = '';
  for (let j = 0; j < 3; j++) {
    combinedResult += initialCharacters[j];
  }
  
  console.log(combinedResult);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
