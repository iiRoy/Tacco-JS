const processInputData = (sourceContent) => {
    const contentSegments = sourceContent.split(/\s/);
    const relevantSegments = contentSegments.slice(1);

    relevantSegments.forEach(currentSegment => {
        if (!currentSegment) {
            return;
        }

        const digitCharacters = currentSegment.split('');

        const sortedAscendingDigits = [...digitCharacters].sort((first, second) => first - second);

        const smallestNumberString = sortedAscendingDigits.join('');
        const largestNumberString = [...sortedAscendingDigits].reverse().join('');

        console.log(largestNumberString - smallestNumberString);
    });
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
