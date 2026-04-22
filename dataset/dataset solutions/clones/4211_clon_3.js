const POSITIVE_MATCH_INDICATOR = "YES";
const NEGATIVE_MATCH_INDICATOR = "NO";

function normalizeInputString(rawString) {
  if (typeof rawString !== 'string') {
    return String(rawString || '').trim();
  }
  return rawString.trim();
}

function assemblePatternMatcher() {
  const optionalCharA = "(A|)";
  const segmentKih = "KIH";
  const segmentB = "B";
  const segmentR = "R";

  const completePatternString = `^${optionalCharA}${segmentKih}${optionalCharA}${segmentB}${optionalCharA}${segmentR}${optionalCharA}$`;

  return new RegExp(completePatternString);
}

function verifyPatternConformance(textCandidate) {
  const activePattern = assemblePatternMatcher();
  const doesMatch = activePattern.test(textCandidate);
  return doesMatch;
}

function presentFinalOutcome(isMatchSuccessful) {
  const resultDisplay = isMatchSuccessful ? POSITIVE_MATCH_INDICATOR : NEGATIVE_MATCH_INDICATOR;
  console.log(resultDisplay);
}

function processInputTextForPattern(initialInputString) {
  const cleanedInput = normalizeInputString(initialInputString);
  const isInputValidPattern = verifyPatternConformance(cleanedInput);
  presentFinalOutcome(isInputValidPattern);
}

try {
  const acquireRawFileData = (sourcePath, encodingType) => {
    // Dynamically require 'fs' module to avoid global pollution if not needed elsewhere.
    const fileSystemModule = require("fs");
    return fileSystemModule.readFileSync(sourcePath, encodingType);
  };

  const rawInputContent = acquireRawFileData("/dev/stdin", "utf8");
  processInputTextForPattern(rawInputContent);
} catch (fileReadError) {
  console.error("Failed to read input data:", fileReadError.message);
  presentFinalOutcome(false);
}