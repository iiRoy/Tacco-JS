function processData(inputString) {
    const initialValues = inputString.split(" ").map(Number);

    function calculateSequenceLength(valA, valB, valC, iterNum) {
        if (iterNum === 1000) {
            return 1000;
        }

        if (valA % 2 !== 0 || valB % 2 !== 0 || valC % 2 !== 0) {
            return iterNum;
        }

        const nextAVal = (valB + valC) / 2;
        const nextBVal = (valA + valC) / 2;
        const nextCVal = (valB + valC) / 2;

        return calculateSequenceLength(nextAVal, nextBVal, nextCVal, iterNum + 1);
    }

    let finalResult = calculateSequenceLength(initialValues[0], initialValues[1], initialValues[2], 0);

    if (finalResult === 1000) {
        finalResult = -1;
    }

    console.log(finalResult);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
