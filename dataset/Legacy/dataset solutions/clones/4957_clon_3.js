const createNumSequence = (startVal, endVal) => {
  const sequenceLength = endVal - startVal + 1;
  return Array.from({ length: sequenceLength }, (_, index) => index + startVal);
};

const lowercaseAlphabetChars = createNumSequence(0, 25).map(val => String.fromCodePoint(97 + val));

const processStringShift = (inputString, shiftAmount, currentPrefix = "") => {
  if (shiftAmount === 0 || !inputString) {
    return currentPrefix + inputString;
  }

  const firstChar = inputString[0];
  const remainingString = inputString.slice(1);

  if (firstChar === "a") {
    return processStringShift(remainingString, shiftAmount, currentPrefix + firstChar);
  }

  const charIndex = lowercaseAlphabetChars.indexOf(firstChar);
  const distanceToZ = 26 - charIndex;

  if (distanceToZ <= shiftAmount) {
    const newShiftAmount = shiftAmount - distanceToZ;
    return processStringShift(remainingString, newShiftAmount, currentPrefix + "a");
  } else {
    const isLastCharacter = inputString.length === 1;
    if (isLastCharacter) {
      const shiftedChar = lowercaseAlphabetChars[charIndex + shiftAmount];
      return currentPrefix + shiftedChar + remainingString;
    } else {
      return processStringShift(remainingString, shiftAmount, currentPrefix + firstChar);
    }
  }
};

function executeMainLogic(rawData) {
  const inputParts = rawData.split("\n");
  const inputStr = inputParts[0];
  const shiftVal = parseInt(inputParts[1], 10);

  const finalResult = processStringShift(inputStr, shiftVal);
  console.log(finalResult);
}

executeMainLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
