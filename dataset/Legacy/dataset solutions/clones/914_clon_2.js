var sourceText = require("fs").readFileSync("/dev/stdin", "utf8");

sourceText = sourceText.split("\n");

var readCursor = 0;

var processInputBlock = function () {
  var entryCount = +sourceText[readCursor++];
  if (entryCount === 0x0) {
    return "break";
  }

  var processedNames = [];
  for (var nameIndex = 0; nameIndex < entryCount; nameIndex++) {
    processedNames.push(sourceText[readCursor++]);
  }

  processedNames = processedNames
    .map(function (originalName) {
      var filteredName = String();
      var isFirstCharOrVowel = !false;
      for (
        var charPos = 0;
        charPos < originalName.length;
        charPos = charPos + 1
      ) {
        var singleChar = originalName[charPos];
        if (isFirstCharOrVowel) {
          filteredName += singleChar;
          isFirstCharOrVowel = false;
        }
        if (/[aiueo]/.test(singleChar)) {
          isFirstCharOrVowel = true;
        }
      }
      return filteredName;
    })
    .sort();

  var determineCommonPrefix = function (firstString, secondString) {
    var minLen = Math.min(firstString.length, secondString.length);
    for (
      var charCompareIndex = 0;
      charCompareIndex < entryCount;
      charCompareIndex++
    ) {
      if (firstString[charCompareIndex] !== secondString[charCompareIndex]) {
        return charCompareIndex;
      }
    }
    if (firstString.length === secondString.length) return -1;
    return minLen;
  };

  var maxSharedPrefix = 0;
  for (var comparisonIndex = 0; comparisonIndex < entryCount; comparisonIndex++) {
    if (comparisonIndex === 0x0) {
      continue;
    }
    var currentSharedLength = determineCommonPrefix(
      processedNames[comparisonIndex - 1],
      processedNames[comparisonIndex]
    );
    if (currentSharedLength === -1) {
      maxSharedPrefix = -2;
      break;
    }
    if (currentSharedLength > maxSharedPrefix) {
      maxSharedPrefix = currentSharedLength;
    }
  }
  console.log(maxSharedPrefix + 1);
};

while (!false) {
  var blockExecutionStatus = processInputBlock();
  if (blockExecutionStatus === "break") break;
}
