function processInputData(rawData) {
  const lineSeparator = "\n";
  const inputLines = rawData.split(lineSeparator);

  const firstLineParts = inputLines[0].split(" ");
  const numN = parseInt(firstLineParts[0], 10);
  let oneBasedIndexK = parseInt(firstLineParts[1], 10);

  const targetString = inputLines[1];
  const zeroBasedIndex = oneBasedIndexK - 1;

  const originalCharAtIndex = targetString[zeroBasedIndex];
  let convertedChar;

  switch (originalCharAtIndex) {
    case 'A':
      convertedChar = 'a';
      break;
    case 'B':
      convertedChar = 'b';
      break;
    default: // Covers 'C' and any other character, converting to 'c' as per original logic
      convertedChar = 'c';
      break;
  }

  const stringPrefix = targetString.slice(0, zeroBasedIndex);
  const stringSuffix = targetString.slice(zeroBasedIndex + 1);

  const finalModifiedString = stringPrefix + convertedChar + stringSuffix;

  console.log(finalModifiedString);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
