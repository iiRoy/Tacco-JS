const fileSystemModule = require('fs');

const INPUT_SOURCE_PATH = '/dev/stdin';
const SEARCH_PATTERN_TEXT = "Hoshino";
const REPLACEMENT_PATTERN_TEXT = "Hoshina";

function applyStringTransformation(sourceText, searchString, replaceString) {
    const regexPattern = new RegExp(searchString, "g");
    return sourceText.replace(regexPattern, replaceString);
}

let rawFileContent = fileSystemModule.readFileSync(INPUT_SOURCE_PATH, 'utf8');
let cleanedContent = rawFileContent.trim();
let contentLines = cleanedContent.split("\n");

let firstElement = contentLines.shift();
let totalLinesToProcess = Number(firstElement);

for (let currentIterationIndex = 0; currentIterationIndex < totalLinesToProcess; currentIterationIndex++) {
    let originalLineFromInput = contentLines[currentIterationIndex];
    let processedLineOutput = applyStringTransformation(originalLineFromInput, SEARCH_PATTERN_TEXT, REPLACEMENT_PATTERN_TEXT);
    console.log(processedLineOutput);
}
