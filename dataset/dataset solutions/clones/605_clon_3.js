const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processedText = rawInputData.trim();

let maxJOISequenceLength = 0;

const joiPattern = /(J+)(O+)(I+)/g;

const calculateMinLengthOfParts = (partOne, partTwo, partThree) => {
    const lengthsArray = [partOne.length, partTwo.length, partThree.length];
    return Math.min(...lengthsArray);
};

const allFoundMatches = processedText.matchAll(joiPattern);

for (const currentMatchEntry of allFoundMatches) {
    const jPartSequence = currentMatchEntry[1];
    const oPartSequence = currentMatchEntry[2];
    const iPartSequence = currentMatchEntry[3];

    const currentMinPartLength = calculateMinLengthOfParts(jPartSequence, oPartSequence, iPartSequence);

    maxJOISequenceLength = Math.max(maxJOISequenceLength, currentMinPartLength);
}

console.log(maxJOISequenceLength);
