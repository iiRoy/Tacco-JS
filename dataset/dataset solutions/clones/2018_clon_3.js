function processInput(rawData) {
  const getCharacterAtIndex = (charArray, index) => {
    return charArray[index];
  };

  let inputLines = rawData.split("\n");
  let characterSequence = inputLines[0].split("");

  let finalOutputMessage = null;

  const charAtTwo = getCharacterAtIndex(characterSequence, 2);
  const charAtThree = getCharacterAtIndex(characterSequence, 3);
  const charAtFour = getCharacterAtIndex(characterSequence, 4);
  const charAtFive = getCharacterAtIndex(characterSequence, 5);

  const firstPairMatches = (charAtTwo === charAtThree);

  if (firstPairMatches) {
    const secondPairMatches = (charAtFour === charAtFive);
    if (secondPairMatches) {
      finalOutputMessage = "Yes";
    } else {
      finalOutputMessage = "No";
    }
  }

  if (finalOutputMessage !== null) {
    console.log(finalOutputMessage);
  }
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
