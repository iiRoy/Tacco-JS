function readStdinContent(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function printOutput(message){console.log(message);}
function logErrorToStderr(errorMessage){console.error(errorMessage);}

const NO_RESULT_MESSAGE = "NO";
const YES_RESULT_MESSAGE = "YES";
const MAX_SEQUENCE_LENGTH = 9;
const REQUIRED_SEQUENCE_CHARS = ["K", "I", "H", "B", "R"];

function splitInputIntoCharacters(inputStr) {
  return inputStr.split("");
}

function countConsecutiveLeadingChar(charArray, targetChar) {
  let currentCount = 0;
  for (let i = 0; i < charArray.length; i++) {
    if (charArray[i] === targetChar) {
      currentCount++;
    } else {
      break;
    }
  }
  return currentCount;
}

function countConsecutiveTrailingChar(charArray, targetChar) {
  let currentCount = 0;
  for (let i = charArray.length - 1; i >= 0; i--) {
    if (charArray[i] === targetChar) {
      currentCount++;
    } else {
      break;
    }
  }
  return currentCount;
}

function validateCharacterSequence(inputString) {
  const charArr = splitInputIntoCharacters(inputString);

  const charPositions = {};
  for (const charKey of REQUIRED_SEQUENCE_CHARS) {
    charPositions[charKey] = charArr.indexOf(charKey);
  }

  const isAnyRequiredCharMissing = REQUIRED_SEQUENCE_CHARS.some(charKey => charPositions[charKey] === -1);
  if (isAnyRequiredCharMissing) {
    printOutput(NO_RESULT_MESSAGE);
    return;
  }

  if (charArr.length > MAX_SEQUENCE_LENGTH) {
    printOutput(NO_RESULT_MESSAGE);
    return;
  }

  const kIndex = charPositions.K;
  const iIndex = charPositions.I;
  const hIndex = charPositions.H;
  const bIndex = charPositions.B;
  const rIndex = charPositions.R;

  if (kIndex !== iIndex - 1 || hIndex < iIndex) {
    printOutput(NO_RESULT_MESSAGE);
    return;
  }

  const hToBDistance = bIndex - hIndex;
  if (hIndex > bIndex || hToBDistance > 2) {
    printOutput(NO_RESULT_MESSAGE);
    return;
  }

  const bToRDistance = rIndex - bIndex;
  if (bIndex > rIndex || bToRDistance > 2) {
    printOutput(NO_RESULT_MESSAGE);
    return;
  }

  const leadingACount = countConsecutiveLeadingChar(charArr, "A");
  if (leadingACount > 1) {
    printOutput(NO_RESULT_MESSAGE);
    return;
  }

  const trailingACount = countConsecutiveTrailingChar(charArr, "A");
  if (trailingACount > 1) {
    printOutput(NO_RESULT_MESSAGE);
    return;
  }

  printOutput(YES_RESULT_MESSAGE);
}

validateCharacterSequence(readStdinContent());
