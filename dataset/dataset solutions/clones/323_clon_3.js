var fileSystem = require("fs");
var inputFilePath = "/dev/stdin";

var rawInputData = fileSystem.readFileSync(inputFilePath, "utf8");

var originalBadWord = "Hoshino";
var desiredGoodWord = "Hoshina";
var lineSeparator = "\n";
var wordSeparator = " ";

function processAndReplaceWords(lineContent, badWord, goodWord, separator) {
    var tokens = lineContent.split(separator);

    var modifiedTokens = tokens.map(function(token) {
        if (token === badWord) {
            return goodWord;
        }
        return token;
    });

    return modifiedTokens.join(separator);
}

var allInputLines = rawInputData.trim().split(lineSeparator);
var numberOfCases = parseInt(allInputLines[0], 10);

for (var currentCaseIndex = 1; currentCaseIndex <= numberOfCases; currentCaseIndex++) {
    var currentInputLine = allInputLines[currentCaseIndex];

    var finalProcessedOutput = processAndReplaceWords(currentInputLine, originalBadWord, desiredGoodWord, wordSeparator);

    console.log(finalProcessedOutput);
}
