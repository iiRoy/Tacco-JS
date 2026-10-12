var inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = inputSource.trim().split("\n");

const gameResults = lineSegments.reduce((accumulator, currentLine, currentIndex, fullArray) => {
    if (currentIndex % 2 === 0) {
        const firstSequence = Array.from(currentLine.split(" "), Number);
        const secondSequence = Array.from(fullArray[currentIndex + 1].split(" "), Number);

        let correctPositionCount = 0;
        const firstSequenceNonMatches = [];
        const secondSequenceNonMatches = [];

        firstSequence.forEach((val, idx) => {
            if (val === secondSequence[idx]) {
                correctPositionCount++;
            } else {
                firstSequenceNonMatches.push(val);
                secondSequenceNonMatches.push(secondSequence[idx]);
            }
        });

        let misplacedCount = 0;
        const firstNonMatchSet = new Set(firstSequenceNonMatches);

        secondSequenceNonMatches.forEach(val => {
            if (firstNonMatchSet.has(val)) {
                misplacedCount++;
            }
        });

        accumulator.push(`${correctPositionCount} ${misplacedCount}`);
    }
    return accumulator;
}, []);

gameResults.forEach(resultString => console.log(resultString));
