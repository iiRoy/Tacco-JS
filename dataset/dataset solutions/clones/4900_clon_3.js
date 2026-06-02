var sourceString = "FFFFdfadadadfd";

var charArrayGlobal = sourceString.split('');
var foundCFlagGlobal = false;
var foundFFlagGlobal = false;

function processStringForSequence(inputStr) {
  var localFoundC = false;

  var charSequence = inputStr.split('');
  var sequenceLength = charSequence.length;

  const TARGET_CHAR_C = "C";
  const TARGET_CHAR_F = "F";

  for (var currentIndex = 0; currentIndex < sequenceLength; currentIndex++) {
    var currentChar = charSequence[currentIndex];

    if (currentChar === TARGET_CHAR_C) {
      localFoundC = true;
    }

    if (currentChar === TARGET_CHAR_F && localFoundC === true) {
      return true;
    }
  }

  if (!localFoundC) {
    return false;
  }
}

processStringForSequence(sourceString);
