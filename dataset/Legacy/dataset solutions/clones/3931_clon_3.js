const ALPHABET_SIZE = 26;
const ASCII_OFFSET_A = "a".charCodeAt(0);
const MAX_LEX_STRING_26 = "zyxwvutsrqponmlkjihgfedcba";

function getRelativeCharCode(char) {
  return char.charCodeAt(0) - ASCII_OFFSET_A;
}

function getCharFromRelativeCode(relativeCode) {
  return String.fromCharCode(ASCII_OFFSET_A + relativeCode);
}

function processInputString(currentString) {
  const stringLength = currentString.length;
  let charAvailabilityMap = Array(ALPHABET_SIZE).fill(1);

  if (stringLength < ALPHABET_SIZE) {
    for (let charIndex = 0; charIndex < stringLength; charIndex++) {
      const charCode = getRelativeCharCode(currentString[charIndex]);
      charAvailabilityMap[charCode] = 0;
    }

    for (let codeValue = 0; codeValue < ALPHABET_SIZE; codeValue++) {
      if (charAvailabilityMap[codeValue] === 1) {
        currentString += getCharFromRelativeCode(codeValue);
        break;
      }
    }
  } else {
    if (currentString === MAX_LEX_STRING_26) {
      console.log(-1);
      return;
    }

    const lastCharRelativeCode = getRelativeCharCode(currentString[ALPHABET_SIZE - 1]);
    charAvailabilityMap[lastCharRelativeCode] = 0;

    let replacementFound = false;
    for (let outerIndex = ALPHABET_SIZE - 2; outerIndex >= 0; outerIndex--) {
      const charAtOuterIndexRelativeCode = getRelativeCharCode(currentString[outerIndex]);

      for (let innerCodeValue = charAtOuterIndexRelativeCode; innerCodeValue < ALPHABET_SIZE; innerCodeValue++) {
        if (charAvailabilityMap[innerCodeValue] === 0) {
          currentString = currentString.slice(0, outerIndex) + getCharFromRelativeCode(innerCodeValue);
          replacementFound = true;
          break;
        }
        charAvailabilityMap[charAtOuterIndexRelativeCode] = 0;
      }
      if (replacementFound) {
        break;
      }
    }
  }

  console.log(currentString);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8").trim());
