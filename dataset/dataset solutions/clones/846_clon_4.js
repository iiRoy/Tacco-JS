const fileSystem = require('fs');

function recursivePatternInsert(currentText, searchRegex, insertValue) {
    const transformedText = currentText.replace(searchRegex, insertValue);
    if (transformedText === currentText) {
        return currentText;
    } else {
        return recursivePatternInsert(transformedText, searchRegex, insertValue);
    }
}

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

let processedSequence = rawData.trim();
processedSequence = processedSequence.replace(/egg/g, "E");
processedSequence = processedSequence.replace(/chicken/g, "C");

processedSequence = recursivePatternInsert(processedSequence, /EE/, "EAE");
processedSequence = recursivePatternInsert(processedSequence, /CC/, "CAC");

const segmentList = processedSequence.split("A");

const longestFragment = segmentList.reduce((accumulator, currentSegment) => {
    return (currentSegment.length > accumulator.length) ? currentSegment : accumulator;
}, "");

const finalResult = (longestFragment.slice(-1) === "E") ? "egg" : "chicken";

console.log(finalResult);
