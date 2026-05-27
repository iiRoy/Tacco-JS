function checkAkihabaraPattern(inputString) {
  const trimmedInput = inputString.trim();

  // Define the core pattern components
  const corePart1 = "KIH";
  const corePart2 = "B";
  const corePart3 = "R";

  // Construct the full regex pattern using template literals for clarity
  // (A|) is equivalent to A?
  const patternSegments = [
    "^(A?)", // Optional 'A' at the beginning
    corePart1,
    "(A?)", // Optional 'A' after KIH
    corePart2,
    "(A?)", // Optional 'A' after B
    corePart3,
    "(A?)$" // Optional 'A' at the end
  ];

  const fullPatternString = patternSegments.join('');
  const akihabaraRegex = new RegExp(fullPatternString);

  const isMatch = akihabaraRegex.test(trimmedInput);

  if (isMatch) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";

const inputData = fileSystemModule.readFileSync(standardInputPath, encodingFormat);

checkAkihabaraPattern(inputData);
