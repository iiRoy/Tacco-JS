function* extractInitialCharacters(sourceText) {
  let isAtWordStart = true;
  for (const currentCharacter of sourceText) {
    if (currentCharacter === ' ') {
      isAtWordStart = true;
    } else {
      if (isAtWordStart) {
        yield currentCharacter.toUpperCase();
        isAtWordStart = false;
      }
    }
  }
}

const processInputData = (incomingData) => {
  const cleanedInput = incomingData.trim();
  const characterGenerator = extractInitialCharacters(cleanedInput);

  const firstChar = characterGenerator.next().value;
  const secondChar = characterGenerator.next().value;
  const thirdChar = characterGenerator.next().value;

  return String(firstChar) + String(secondChar) + String(thirdChar);
};

const scriptEntry = (inputPayload) => {
  console.log(processInputData(inputPayload));
};

scriptEntry(require("fs").readFileSync("/dev/stdin", "utf8"));
