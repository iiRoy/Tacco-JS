function processData(inputContent) {
    const dataLines = inputContent.split("\n");
    const initialSizeIndicator = Number(dataLines[0]);
    const numberStrings = dataLines[1].split(" ");

    const initialSequence = Array.from({ length: 2 * initialSizeIndicator - 1 }, (_, index) => numberStrings[index]);

    const determineMedianOfThreeStrings = (strA, strB, strC) => {
        if ((strA < strB && strB < strC) || (strC < strB && strB < strA)) return strB;
        if ((strB < strA && strA < strC) || (strC < strA && strA < strB)) return strA;
        return strC;
    };

    const generateNextSequence = (currentSequence) => {
        if (currentSequence.length < 3) {
            return currentSequence;
        }
        return Array.from({ length: currentSequence.length - 2 }, (_, segmentPosition) =>
            determineMedianOfThreeStrings(
                currentSequence[segmentPosition],
                currentSequence[segmentPosition + 1],
                currentSequence[segmentPosition + 2]
            )
        );
    };

    const recursivelyReduceSequence = (currentSequence) => {
        if (currentSequence.length === 1) {
            return currentSequence[0];
        }
        const subsequentSequence = generateNextSequence(currentSequence);
        return recursivelyReduceSequence(subsequentSequence);
    };

    const finalValue = recursivelyReduceSequence(initialSequence);

    console.log('%d', finalValue);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
