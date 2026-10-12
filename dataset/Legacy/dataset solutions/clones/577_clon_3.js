(function (inputContent) {
    const prepareInputLines = (rawText) => {
        return rawText.replace(/\r/g, '').split("\n");
    };

    const assignStringRoles = (firstString, secondString) => {
        if (firstString.length < secondString.length) {
            return { shorter: firstString, longer: secondString };
        } else {
            return { shorter: secondString, longer: firstString };
        }
    };

    let processedLines = prepareInputLines(inputContent);
    let lineCursor = 0;

    for (;;) { // Equivalent to while(true)
        const lineOne = processedLines[lineCursor++];
        if (lineOne === undefined || lineOne === '') {
            break;
        }
        const lineTwo = processedLines[lineCursor++];

        const { shorter: shortSegment, longer: longSegment } = assignStringRoles(lineOne, lineTwo);

        let longestFoundSubstringLength = 0;

        for (let startIndex = 0; startIndex < shortSegment.length; startIndex++) {
            let currentSubstringTestLength = 1;
            let candidateSubstring;

            while (true) {
                // Check if the substring extends beyond the bounds of the shorter string
                if (startIndex + currentSubstringTestLength > shortSegment.length) {
                    break;
                }

                candidateSubstring = shortSegment.slice(startIndex, startIndex + currentSubstringTestLength);
                const occurrenceIndex = longSegment.indexOf(candidateSubstring);

                // The original logic requires the substring to be found AND not at the very beginning (index 0)
                if (occurrenceIndex > 0) {
                    currentSubstringTestLength++;
                } else {
                    break;
                }
            }
            // currentSubstringTestLength is one greater than the actual valid length because it increments
            // before the loop condition fails.
            const finalValidLength = currentSubstringTestLength - 1;
            if (finalValidLength > longestFoundSubstringLength) {
                longestFoundSubstringLength = finalValidLength;
            }
        }
        console.log(longestFoundSubstringLength);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
