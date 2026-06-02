(function (rawData) {
    const lineSegments = rawData.replace(/\r/g, '').split("\n");

    const currentStringPair = [];
    let longestSubstringResult;

    function determineMaxCommonSubstringLength(firstInputString, secondInputString) {
        let shorterReferenceString, longerReferenceString;

        if (firstInputString.length < secondInputString.length) {
            shorterReferenceString = firstInputString;
            longerReferenceString = secondInputString;
        } else {
            shorterReferenceString = secondInputString;
            longerReferenceString = firstInputString;
        }

        let overallMaximumLength = 0;
        const shorterStringLength = shorterReferenceString.length;

        for (let currentStartingIndex = 0; currentStartingIndex < shorterStringLength; currentStartingIndex++) {
            let potentialSubstringLength = 1;
            while (true) {
                const currentEndingIndex = currentStartingIndex + potentialSubstringLength;

                if (currentEndingIndex > shorterStringLength) {
                    break;
                }

                const candidateSubstring = shorterReferenceString.slice(currentStartingIndex, currentEndingIndex);

                if (longerReferenceString.indexOf(candidateSubstring) !== -1) {
                    potentialSubstringLength++;
                } else {
                    break;
                }
            }
            const actualLengthForCurrentStart = potentialSubstringLength - 1;
            if (actualLengthForCurrentStart > overallMaximumLength) {
                overallMaximumLength = actualLengthForCurrentStart;
            }
        }
        return overallMaximumLength;
    }

    while (true) {
        currentStringPair[0] = lineSegments.shift();

        if (currentStringPair[0] === '') {
            break;
        }

        currentStringPair[1] = lineSegments.shift();

        longestSubstringResult = determineMaxCommonSubstringLength(
            currentStringPair[0],
            currentStringPair[1]
        );

        console.log(longestSubstringResult);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
