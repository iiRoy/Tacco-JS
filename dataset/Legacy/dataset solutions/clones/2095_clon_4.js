'use strict';

function AnalyzeCharacterDiversity(sourceText) {
  const characterArray = sourceText.split('');
  const distinctUppercaseCharacters = new Set(characterArray.map(char => char.toUpperCase()));

  // The original logic determines if there are at least two distinct characters
  // (after uppercasing) in the input string.
  // If the Set of distinct uppercase characters has a size greater than 1,
  // it means there are at least two different characters.
  const hasMultipleUniqueTypes = distinctUppercaseCharacters.size > 1;

  console.log(hasMultipleUniqueTypes ? 'Yes' : 'No');
}

AnalyzeCharacterDiversity(require("fs").readFileSync("/dev/stdin", "utf8"));
