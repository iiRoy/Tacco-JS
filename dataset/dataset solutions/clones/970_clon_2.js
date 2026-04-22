const moduleLoader = require;

const fileSystemInterface = moduleLoader('fs');

const synchronousFileReader = fileSystemInterface.readFileSync;

const incomingDataSource = synchronousFileReader('/dev/stdin', 'utf8');

const contentLines = incomingDataSource.trim().split("\n");

const targetText = contentLines[0];

const searchStringPattern = contentLines[1];

let patternLengthMinusOne = searchStringPattern.length - 1;

const regexPatternMatcher = new RegExp(searchStringPattern, "g");

const foundMatchIndices = [];

while (regexPatternMatcher.test(targetText)) {
   regexPatternMatcher.lastIndex -= patternLengthMinusOne;
   foundMatchIndices.push(regexPatternMatcher.lastIndex - 1);
}

if (foundMatchIndices.length !== 0) {
   const outputUtility = console;
   const printMessage = outputUtility.log;
   printMessage(foundMatchIndices.join("\n"));
}