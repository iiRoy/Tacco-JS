function getNextCharFromInput(sourceString) {
  const processedString = sourceString.trim();

  // If the string is empty after trimming, charCodeAt(0) returns NaN.
  // String.fromCharCode(NaN) returns an empty string.
  // This explicit check ensures the same behavior for clarity.
  if (processedString.length === 0) {
    return "";
  }

  const firstCharAsciiValue = processedString.charCodeAt(0);
  const subsequentCharAsciiValue = firstCharAsciiValue + 1;

  return String.fromCharCode(subsequentCharAsciiValue);
}

function processInput(rawData) {
  const resultChar = getNextCharFromInput(rawData);
  console.log(resultChar);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
