const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const sourceLines = inputSource.split("\n");

const searchKey = sourceLines[0].trim().toLowerCase();

const dataSegments = sourceLines.slice(1);

const terminationPoint = dataSegments.findIndex(segment => segment === 'END_OF_TEXT');

const processableSegments = terminationPoint === -1 ? dataSegments : dataSegments.slice(0, terminationPoint);

const finalTally = processableSegments.reduce((accumulator, currentSegment) => {
    const normalizedSegment = currentSegment.toLowerCase();
    
    const wordCandidates = normalizedSegment.trim().split(' ');

    const segmentOccurrences = wordCandidates.reduce((wordAccumulator, currentWord) => {
        return wordAccumulator + (currentWord === searchKey ? 1 : 0);
    }, 0);

    return accumulator + segmentOccurrences;
}, 0);

console.log(finalTally);
