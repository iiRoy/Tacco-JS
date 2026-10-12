const { readFileSync } = require("fs");

const rawInputContent = readFileSync("/dev/stdin", "utf8");
const processedLines = rawInputContent.split(/\n\r?/);

const [searchToken, ...corpusSegments] = processedLines;

const totalCount = corpusSegments.reduce((accumulator, currentSegment) => {
    const segmentWords = currentSegment.split(' ');
    if (searchToken === "") {
        return accumulator + segmentWords.length;
    } else {
        return accumulator + segmentWords.filter(wordUnit => wordUnit === searchToken).length;
    }
}, 0);

console.log(totalCount);
