const fileSystem = require('fs');

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const inputLines = rawInputData.split(/\n/);

const gameResults = [];

let currentPairIndex = 0;
while (currentPairIndex < inputLines.length) {
    const firstSequenceDigits = inputLines[currentPairIndex].trim().split(/\s/);
    const secondSequenceDigits = inputLines[currentPairIndex + 1].trim().split(/\s/);

    let exactMatches = 0;
    let partialMatches = 0;

    exactMatches = firstSequenceDigits.filter((digit, position) => digit === secondSequenceDigits[position]).length;

    partialMatches = firstSequenceDigits.reduce((accumulator, currentDigitFromFirst, currentPosition) => {
        if (currentDigitFromFirst !== secondSequenceDigits[currentPosition]) {
            const occurrencesInSecond = secondSequenceDigits.filter(
                (digitInSecond) => digitInSecond === currentDigitFromFirst
            ).length;
            return accumulator + occurrencesInSecond;
        }
        return accumulator;
    }, 0);

    gameResults.push(`${exactMatches} ${partialMatches}`);

    currentPairIndex += 2;
}

console.log(gameResults.join('\n'));
