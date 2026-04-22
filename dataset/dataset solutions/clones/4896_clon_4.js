function executeComputation(rawData) {
    const processedLines = rawData.trim().split('\n');
    const initialCount = Number(processedLines[0]);
    const numericDataLine = processedLines[1];

    const initialSequence = numericDataLine.split(' ').map(Number);

    function medianOfThree(elementA, elementB, elementC) {
        if ((elementA <= elementB && elementB <= elementC) || (elementC <= elementB && elementB <= elementA)) {
            return elementB;
        }
        if ((elementB <= elementA && elementA <= elementC) || (elementC <= elementA && elementA <= elementB)) {
            return elementA;
        }
        return elementC;
    }

    function compressSequence(currentSegment) {
        if (currentSegment.length === 1) {
            return currentSegment[0];
        }

        const nextSegment = Array.from({ length: currentSegment.length - 2 }, (_, iterator) => {
            return medianOfThree(
                currentSegment[iterator],
                currentSegment[iterator + 1],
                currentSegment[iterator + 2]
            );
        });

        return compressSequence(nextSegment);
    }

    const finalResult = compressSequence(initialSequence);

    console.log(finalResult);
}

executeComputation(require("fs").readFileSync("/dev/stdin", "utf8"));