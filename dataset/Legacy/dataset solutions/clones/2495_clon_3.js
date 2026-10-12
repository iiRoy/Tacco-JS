function processInputData(rawInputString) {
  var inputLineArray = rawInputString.split('\n');

  var firstLineContent = inputLineArray[0];
  var secondLineContent = inputLineArray[1];

  var stringLength = Number(firstLineContent);
  var targetStringValue = secondLineContent;

  var changeCounter = 0;
  var lastCharacterSeen = '';

  var currentIterationIndex = 0;
  while (currentIterationIndex < stringLength) {
    var currentCharacter = targetStringValue.charAt(currentIterationIndex);

    var isCharacterDifferent = (lastCharacterSeen !== currentCharacter);

    if (isCharacterDifferent) {
      changeCounter += 1;
    }
    lastCharacterSeen = currentCharacter;
    currentIterationIndex++;
  }

  var finalResult = changeCounter + 1;
  console.log(finalResult);
}

var fileSystemModule = require("fs");
var standardInputPath = "/dev/stdin";
var encodingType = "utf8";

var fileContent = fileSystemModule.readFileSync(standardInputPath, encodingType);

processInputData(fileContent);
