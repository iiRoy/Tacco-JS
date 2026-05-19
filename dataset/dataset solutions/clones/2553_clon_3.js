function ProcessInputAndValidate(rawData) {
  const lines = rawData.split('\n');
  const firstLineParts = lines[0].split(' ');
  const targetString = firstLineParts[0];

  let validationResult = "Yes";

  const EVEN_POSITION_ALLOWED_CHARS = "LUD";
  const ODD_POSITION_ALLOWED_CHARS = "RUD";

  const determineAllowedSet = (idx) => {
    // If 0-based index is odd, it corresponds to an even 1-based position.
    if (idx % 2 !== 0) {
      return EVEN_POSITION_ALLOWED_CHARS;
    } else {
      // If 0-based index is even, it corresponds to an odd 1-based position.
      return ODD_POSITION_ALLOWED_CHARS;
    }
  };

  for (let charIdx = 0; charIdx < targetString.length; charIdx++) {
    const currentCharacter = targetString[charIdx];
    const requiredSet = determineAllowedSet(charIdx);

    if (requiredSet.indexOf(currentCharacter) === -1) {
      validationResult = "No";
      break;
    }
  }
  console.log(validationResult);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
ProcessInputAndValidate(fileContent);
