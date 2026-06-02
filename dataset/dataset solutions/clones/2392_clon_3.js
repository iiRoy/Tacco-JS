function getShiftedCharacter(characterToShift, shiftAmountValue, referenceAlphabetArray) {
  const originalPosition = referenceAlphabetArray.indexOf(characterToShift);
  if (originalPosition === -1) {
    return characterToShift;
  }
  const newPosition = (originalPosition + shiftAmountValue) % referenceAlphabetArray.length;
  return referenceAlphabetArray[newPosition];
}

function processInput(fullInputData) {
  const dataLines = fullInputData.split("\n");

  const shiftMagnitude = parseInt(dataLines[0], 10);

  const charactersToTransform = dataLines[1].split('');

  const standardAlphabetString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const alphabetLookupArray = standardAlphabetString.split('');

  let outputCharacterBuffer = [];

  for (const currentSourceChar of charactersToTransform) {
    const transformedChar = getShiftedCharacter(currentSourceChar, shiftMagnitude, alphabetLookupArray);
    outputCharacterBuffer.push(transformedChar);
  }

  const finalResultString = outputCharacterBuffer.join('');

  console.log(finalResultString);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
