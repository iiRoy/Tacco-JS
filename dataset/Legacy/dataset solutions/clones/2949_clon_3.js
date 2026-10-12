function processInput(rawData) {
  const NEWLINE_DELIMITER = "\n";
  const SPACE_DELIMITER = " ";

  const inputLines = rawData.split(NEWLINE_DELIMITER);

  const firstLine = inputLines[0];
  const targetString = inputLines[1];

  const firstLineParts = firstLine.split(SPACE_DELIMITER);
  const positionIndexStr = firstLineParts[1];

  const targetPosition = parseInt(positionIndexStr, 10);

  const zeroBasedIndex = targetPosition - 1;

  const charArray = targetString.split("");

  const charToModify = targetString[zeroBasedIndex];

  const lowerChar = charToModify.toLowerCase();

  charArray.splice(zeroBasedIndex, 1, lowerChar);

  console.log(charArray.join(""));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
