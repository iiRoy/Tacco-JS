function getInputLines() {
    const INPUT_SOURCE_PATH = "/dev/stdin";
    const fileSystemModule = require("fs");
    const rawFileContent = fileSystemModule.readFileSync(INPUT_SOURCE_PATH, "utf8");
    return rawFileContent.split(/\n\r?/);
}

function countTargetOccurrencesInString(targetValue, textSegment) {
    let segmentWords = textSegment.split(' ');
    let segmentOccurrences = 0;
    let foundIndex;

    while ((foundIndex = segmentWords.indexOf(targetValue)) !== -1) {
        segmentOccurrences++;
        segmentWords.splice(foundIndex, 1);
    }
    return segmentOccurrences;
}

const processedInputData = getInputLines();
const searchTargetWord = processedInputData[0];
const textCorpusLines = processedInputData.slice(1);

const totalCount = textCorpusLines.reduce(function(currentTotal, currentLineString) {
    const lineOccurrences = countTargetOccurrencesInString(searchTargetWord, currentLineString);
    return currentTotal + lineOccurrences;
}, 0);

console.log(totalCount);
