function processInput(rawData) {
    const lines = rawData.split('\n');
    const targetLength = parseInt(lines[0], 10);
    const firstString = lines[1];
    const secondString = lines[2];

    let actualOverlapLength = 0;

    const checkOverlapAndCombinedLength = (s1, s2, currentCandidateLength, minimumTotalLength) => {
        const s1EndingSegment = s1.substring(s1.length - currentCandidateLength);
        const s2StartingSegment = s2.substring(0, currentCandidateLength);
        const calculatedCombinedLength = s1.length + s2.length - currentCandidateLength;
        return s1EndingSegment === s2StartingSegment && calculatedCombinedLength >= minimumTotalLength;
    };

    const maximumPossibleOverlap = Math.min(firstString.length, secondString.length);

    for (let currentCandidate = maximumPossibleOverlap; currentCandidate > 0; currentCandidate--) {
        if (checkOverlapAndCombinedLength(firstString, secondString, currentCandidate, targetLength)) {
            actualOverlapLength = currentCandidate;
            break;
        }
    }

    const nonOverlappingPartOfFirst = firstString.substring(0, firstString.length - actualOverlapLength);
    const finalConcatenatedString = nonOverlappingPartOfFirst + secondString;

    console.log(finalConcatenatedString);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
