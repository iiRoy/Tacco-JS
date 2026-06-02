function processInput(rawData) {
  const CHAR_A = 'A';
  const CHAR_C = 'C';
  const STATUS_ACCEPTED = 'AC';
  const STATUS_WRONG_ANSWER = 'WA';
  const UPPERCASE_LETTER_PATTERN = /[A-Z]/;

  let validationOutcome = STATUS_ACCEPTED;
  const charArray = rawData.split('');
  const inputLength = rawData.length;

  if (charArray[0] !== CHAR_A) {
    validationOutcome = STATUS_WRONG_ANSWER;
  }

  let hasCChar = false;

  const isCPlacementInvalid = (currentIndex, totalLength, cAlreadyFound) => {
    const isAtSecondPosition = currentIndex === 1;
    const isAtLastPosition = currentIndex === totalLength - 1;
    return isAtSecondPosition || isAtLastPosition || cAlreadyFound;
  };

  const isUppercaseChar = (char) => {
    return char.match(UPPERCASE_LETTER_PATTERN);
  };

  for (let idx = 1; idx < inputLength; idx++) {
    const currentCharacter = charArray[idx];

    if (currentCharacter === CHAR_C) {
      if (isCPlacementInvalid(idx, inputLength, hasCChar)) {
        validationOutcome = STATUS_WRONG_ANSWER;
      } else {
        hasCChar = true;
      }
    } else if (isUppercaseChar(currentCharacter)) {
      validationOutcome = STATUS_WRONG_ANSWER;
    }
  }

  if (!hasCChar) {
    validationOutcome = STATUS_WRONG_ANSWER;
  }

  console.log(validationOutcome);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
