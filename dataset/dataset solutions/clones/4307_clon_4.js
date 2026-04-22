function transformContent(incomingString) {
  const markerSequence = "FESTIVAL";
  const searchPattern = new RegExp(`^(.*)${markerSequence}(?:(?!${markerSequence}).)*$`);

  const regexMatch = incomingString.match(searchPattern);

  if (regexMatch && regexMatch[1] !== undefined) {
    process.stdout.write(regexMatch[1]);
  } else {
    const buildReducedString = (original, idx = 0, currentResult = "") => {
      if (original.length === 0) return "";
      if (original.length === 1) return "";
      if (idx >= original.length - 1) {
        return currentResult;
      }
      return buildReducedString(original, idx + 1, currentResult + original[idx]);
    };
    process.stdout.write(buildReducedString(incomingString));
  }
}

const fileSystemAccess = require("node:fs");
const retrievedData = fileSystemAccess.readFileSync("/dev/stdin", "utf8");

transformContent(retrievedData);