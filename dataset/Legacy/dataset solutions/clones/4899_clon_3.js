function processInput(rawContent) {
  const lineSegments = rawContent.split("\n");
  const targetSequence = lineSegments[0];

  const CHAR_C_IDENTIFIER = "C";
  const CHAR_F_IDENTIFIER = "F";
  const POSITIVE_OUTCOME_MESSAGE = "Yes";
  const NEGATIVE_OUTCOME_MESSAGE = "No";

  let firstCharCIdx;
  let lastCharFIdx;

  const findFirstCharacterIndex = (textSource, characterToLocate) => {
    const sourceLength = textSource.length;
    for (let currentPosition = 0; currentPosition < sourceLength; currentPosition++) {
      if (textSource[currentPosition] === characterToLocate) {
        return currentPosition;
      }
    }
    return undefined;
  };

  const findLastCharacterIndex = (textSource, characterToLocate) => {
    const sourceLength = textSource.length;
    for (let currentPosition = sourceLength - 1; currentPosition >= 0; currentPosition--) {
      if (textSource[currentPosition] === characterToLocate) {
        return currentPosition;
      }
    }
    return undefined;
  };

  firstCharCIdx = findFirstCharacterIndex(targetSequence, CHAR_C_IDENTIFIER);
  lastCharFIdx = findLastCharacterIndex(targetSequence, CHAR_F_IDENTIFIER);

  if (firstCharCIdx < lastCharFIdx) {
    console.log(POSITIVE_OUTCOME_MESSAGE);
  } else {
    console.log(NEGATIVE_OUTCOME_MESSAGE);
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
