const UPPERCASE_REGEX_PATTERN = /^[A-Z]+$/g;

const checkStringCase = (textSegment) => {
  return UPPERCASE_REGEX_PATTERN.test(textSegment);
};

function processData(rawInputData) {
  const inputLines = rawInputData.split("\n");

  const firstProcessedLine = inputLines[0];

  const isFirstLineUppercase = checkStringCase(firstProcessedLine);

  let outputCharacter;

  if (isFirstLineUppercase) {
    outputCharacter = 'A';
  } else {
    outputCharacter = 'a';
  }

  console.log(outputCharacter);
}
