(function (rawData) {
    const NEWLINE_DELIMITER = "\n";
    const CARRIAGE_RETURN_PATTERN = /\r/g;
    const TERMINATION_SIGNAL = '';

    let cleanedInputContent = rawData.replace(CARRIAGE_RETURN_PATTERN, TERMINATION_SIGNAL);
    let lineSegments = cleanedInputContent.split(NEWLINE_DELIMITER);

    let currentStringPair = [];
    let stringA, stringB;
    let currentSubstringLength;
    let longestSubstringLengthFound;
    let lengthOfShorterString;
    let currentCandidateSubstring;
    let occurrenceIndexInLonger;

    while (true) {
        longestSubstringLengthFound = 0;

        let firstSegment = lineSegments.shift();

        if (firstSegment === TERMINATION_SIGNAL) {
            break;
        }
        currentStringPair[0] = firstSegment;
        currentStringPair[1] = lineSegments.shift();

        if (currentStringPair[0].length < currentStringPair[1].length) {
            stringA = currentStringPair[0];
            stringB = currentStringPair[1];
        } else {
            stringA = currentStringPair[1];
            stringB = currentStringPair[0];
        }

        lengthOfShorterString = stringA.length;

        for (let charIndex = 0; charIndex < lengthOfShorterString; charIndex++) {
            currentSubstringLength = longestSubstringLengthFound + 1;

            while (true) {
                // The original condition `s[i + count]` implies that `i + count` must be a valid index.
                // This means `i + count` must be strictly less than `s.length`.
                // If `charIndex + currentSubstringLength` is equal to or greater than `lengthOfShorterString`,
                // the original `s[i + count]` would be `undefined` (falsy), causing the loop to terminate.
                if (charIndex + currentSubstringLength >= lengthOfShorterString) {
                    break;
                }

                currentCandidateSubstring = stringA.substring(charIndex, charIndex + currentSubstringLength);
                occurrenceIndexInLonger = stringB.indexOf(currentCandidateSubstring);

                if (occurrenceIndexInLonger > 0) {
                    currentSubstringLength++;
                } else {
                    break;
                }
            }

            let effectiveLengthForCurrentStart = currentSubstringLength - 1;

            if (effectiveLengthForCurrentStart > longestSubstringLengthFound) {
                longestSubstringLengthFound = effectiveLengthForCurrentStart;
            }
        }
        console.log(longestSubstringLengthFound);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
