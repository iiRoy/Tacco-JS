const filesystemModule = require("node:fs");

const ALPHABET_SIZE_MODULUS = 26;
const BASE_ASCII_LOWERCASE_A = 97;

const KEYWORD_DETECTION_PATTERN = /th(?:is|at)/;

function processCharacterWithCipherFormula(
  inputCharacter,
  transformFactor,
  shiftAmount
) {
  const originalCharCode = inputCharacter.charCodeAt(0);

  let resultantPosition =
    (originalCharCode * transformFactor + shiftAmount) %
    ALPHABET_SIZE_MODULUS;

  if (resultantPosition < 0) {
    resultantPosition += ALPHABET_SIZE_MODULUS;
  }

  return String.fromCharCode(resultantPosition + BASE_ASCII_LOWERCASE_A);
}

function analyzeInputLineForKeywords(lineToProcess) {
  if (!lineToProcess || lineToProcess.trim().length === 0) {
    return;
  }

  for (
    let currentMultiplierValue = 0;
    currentMultiplierValue < ALPHABET_SIZE_MODULUS;
    currentMultiplierValue++
  ) {
    for (
      let currentShiftValue = 0;
      currentShiftValue < ALPHABET_SIZE_MODULUS;
      currentShiftValue++
    ) {
      const transformedLineCandidate = lineToProcess.replace(
        /\w/g,
        function (matchedChar) {
          return processCharacterWithCipherFormula(
            matchedChar,
            currentMultiplierValue,
            currentShiftValue
          );
        }
      );

      if (KEYWORD_DETECTION_PATTERN.test(transformedLineCandidate)) {
        console.log(transformedLineCandidate);
      }
    }
  }
}

const standardInputFilePath = "/dev/stdin";
const fileContentEncoding = "utf8";

let entireInputFileContent;
try {
  entireInputFileContent = filesystemModule.readFileSync(
    standardInputFilePath,
    fileContentEncoding
  );
} catch (fileReadError) {
  console.error(
    `Failed to read input from '${standardInputFilePath}': ${fileReadError.message}`
  );
  process.exit(1);
}

const inputLinesArray = entireInputFileContent.split("\n");

for (const currentInputLine of inputLinesArray) {
  analyzeInputLineForKeywords(currentInputLine);
}