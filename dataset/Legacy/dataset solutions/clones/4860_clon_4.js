function processInput(rawText) {
    const [iterationCountStr, ...initialElements] = rawText.split('\n');
    const totalIterations = Number(iterationCountStr);

    const evaluatePair = (firstVal, secondVal) => {
        if (firstVal > secondVal) {
            return firstVal - secondVal;
        } else if (firstVal == secondVal) {
            return firstVal;
        } else {
            return secondVal - firstVal;
        }
    };

    const finalResultArray = Array.from({ length: totalIterations }).reduce((currentElements, _, iterationIndex) => {
        const nextGenerationElements = currentElements.reduce((accumulator, currentElement, elementIndex, fullArray) => {
            if (elementIndex % 2 === 0) {
                const pairResult = evaluatePair(currentElement, fullArray[elementIndex + 1]);
                accumulator.push(pairResult);
            }
            return accumulator;
        }, []);

        return nextGenerationElements;
    }, initialElements);

    console.log(finalResultArray[0]);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
