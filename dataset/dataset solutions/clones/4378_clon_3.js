var fileSystemModule = require("fs");

processInputData(fileSystemModule.readFileSync("/dev/stdin", "utf-8"));

function processInputData(initialInputString) {
    var firstLineContent = initialInputString.split("\n")[0];
    var characterArray = firstLineContent.split("");
    var finalResult = "";
    var totalCharacters = characterArray.length;
    var currentCharacterIndex = 0;

    while (currentCharacterIndex < totalCharacters) {
        var characterToAdd = characterArray[currentCharacterIndex];
        finalResult += characterToAdd;
        currentCharacterIndex += 2;
    }

    console.log(finalResult);
}
