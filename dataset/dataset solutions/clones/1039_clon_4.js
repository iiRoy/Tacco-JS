const processInput = (rawInputContent) => {
    const processedLines = rawInputContent.split('\n').filter(Boolean);

    const parseLineOfNumbers = (lineIndex) => processedLines[lineIndex].split(' ').map(Number);

    const primaryDataArray = parseLineOfNumbers(1);
    const secondaryQueryArray = parseLineOfNumbers(3);

    const locateRecursively = (haystack, needle, lowerBound, upperBound) => {
        if (lowerBound >= upperBound) {
            return false;
        }

        const centerIndex = Math.floor((lowerBound + upperBound) / 2);
        const centerValue = haystack[centerIndex];

        if (centerValue === needle) {
            return true;
        } else if (needle < centerValue) {
            return locateRecursively(haystack, needle, lowerBound, centerIndex);
        } else {
            return locateRecursively(haystack, needle, centerIndex + 1, upperBound);
        }
    };

    const totalOccurrences = secondaryQueryArray.filter(queryItem =>
        locateRecursively(primaryDataArray, queryItem, 0, primaryDataArray.length)
    ).length;

    console.log(totalOccurrences);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));