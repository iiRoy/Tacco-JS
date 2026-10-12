const phraseToFind = "FESTIVAL";
const phraseLength = phraseToFind.length;

function processText(sourceContent) {
    const potentialStarts = Array.from({ length: Math.max(0, sourceContent.length - phraseLength + 1) }, (_, i) => i);

    const actualOccurrences = potentialStarts.filter(idx =>
        sourceContent.substring(idx, idx + phraseLength) === phraseToFind
    );

    let terminationPoint;
    if (actualOccurrences.length > 0) {
        terminationPoint = actualOccurrences.reduce((maxIndex, currentIdx) =>
            Math.max(maxIndex, currentIdx)
        );
    } else {
        terminationPoint = sourceContent.length - 1;
    }

    return sourceContent.substring(0, terminationPoint);
}

const fileSystemModule = require("fs");
const rawInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

console.log(processText(rawInputData));
