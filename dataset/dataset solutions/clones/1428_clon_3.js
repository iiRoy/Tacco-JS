function processInputData(rawInputString) {
  const inputLineArray = rawInputString.split('\n');
  const charFrequencyMap = {};

  const EMPTY_LINE_INDICATOR = "";

  for (let lineIdx = 0; lineIdx < inputLineArray.length; ++lineIdx) {
    const currentProcessingLine = inputLineArray[lineIdx];
    if (currentProcessingLine === EMPTY_LINE_INDICATOR) {
      break;
    }

    for (let charPosition = 0; charPosition < currentProcessingLine.length; ++charPosition) {
      const characterAtPosition = currentProcessingLine[charPosition];
      const lowercasedChar = characterAtPosition.toLowerCase();

      charFrequencyMap[lowercasedChar] = (charFrequencyMap[lowercasedChar] || 0) + 1;
    }
  }

  const ASCII_CODE_FOR_A = 0x61;
  const ASCII_CODE_FOR_Z = 0x7a;

  for (let charCodeValue = ASCII_CODE_FOR_A; charCodeValue <= ASCII_CODE_FOR_Z; ++charCodeValue) {
    const alphabetCharacter = String.fromCharCode(charCodeValue);
    const characterCount = charFrequencyMap[alphabetCharacter] || 0;

    console.log(alphabetCharacter + " : " + characterCount);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
