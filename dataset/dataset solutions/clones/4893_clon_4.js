function ProcessInput(rawData) {
    const lines = rawData.split("\n");
    const countVal = Number.parseInt(lines[0], 10);
    const initialValues = lines[1].split(" ");

    console.log(countVal, initialValues);

    const numericSequence = initialValues.map(val => Number.parseInt(val, 10));
    console.log(numericSequence);

    const obtainMedianOfThree = (valA, valB, valC) =>
        Math.max(Math.min(valA, valB), Math.min(Math.max(valA, valB), valC));

    const reduceSequenceRecursively = (currentElements) => {
        if (currentElements.length === 1) {
            return currentElements[0];
        }

        const nextElements = [];
        for (let idx = 0; idx <= currentElements.length - 3; idx++) {
            const median = obtainMedianOfThree(
                currentElements[idx],
                currentElements[idx + 1],
                currentElements[idx + 2]
            );
            nextElements.push(median);
        }
        console.log(nextElements);
        return reduceSequenceRecursively(nextElements);
    };

    const finalResult = reduceSequenceRecursively(numericSequence);

    console.log('the answer is %d', finalResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
