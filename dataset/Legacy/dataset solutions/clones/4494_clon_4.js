function findLongestPrefix(currentString, currentCandidateLength) {
    if (currentCandidateLength < 1) {
        return null;
    }

    let candidateSatisfiesCondition;

    if (currentCandidateLength % 2 !== 0) {
        candidateSatisfiesCondition = (currentCandidateLength === 1);
    } else {
        const halfLength = currentCandidateLength / 2;
        candidateSatisfiesCondition = currentString.substring(0, halfLength) === currentString.substring(halfLength, currentCandidateLength);
    }

    if (candidateSatisfiesCondition) {
        return currentCandidateLength;
    } else {
        return findLongestPrefix(currentString, currentCandidateLength - 2);
    }
}

function processInput(inputData) {
    const processedString = inputData.split("\n")[0];
    const initialCandidateLength = processedString.length - 2;
    const resultLength = findLongestPrefix(processedString, initialCandidateLength);

    if (resultLength !== null) {
        console.log("%d", resultLength);
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
