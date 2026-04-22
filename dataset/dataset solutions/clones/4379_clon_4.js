function transformString(sourceData) {
  // This regular expression matches any character (captured as group 1)
  // followed by any other character.
  // The replacement '$1' keeps only the first character of each pair.
  // Characters that don't form a pair (e.g., the last character of an odd-length string)
  // will not be matched by the pattern and thus remain in the string.
  // This effectively extracts characters at even indices (0, 2, 4, ...).
  return sourceData.replace(/(.)./g, '$1');
}

const sourceData = require("node:fs").readFileSync("/dev/stdin", "utf8");
const resultData = transformString(sourceData);
process.stdout.write(resultData);