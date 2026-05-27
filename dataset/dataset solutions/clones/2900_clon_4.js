function parseInputData(rawText) {
    const textLines = rawText.split("\n");
    const queryCount = parseInt(textLines[0]);
    const querySpecifications = textLines.slice(1, queryCount + 1).map(lineContent =>
        lineContent.split(" ").map(strNum => parseInt(strNum))
    );
    return querySpecifications;
}

function computeModularProduct(startValue, stepIncrement, iterationCount, modulusConstant) {
    if (iterationCount === 0) {
        return 0;
    }

    const factorSequence = Array.from({ length: iterationCount }, (_, currentIteration) => {
        const termValue = startValue + currentIteration * stepIncrement;
        return termValue % modulusConstant;
    });

    return factorSequence.reduce((accumulatedProduct, currentFactor) => {
        return (accumulatedProduct * currentFactor) % modulusConstant;
    }, 1);
}

function EntryPoint(inputPayload) {
    const MODULO_PRIME = 1000003;
    const allQueryDetails = parseInputData(inputPayload);

    allQueryDetails.forEach(queryTuple => {
        const [initialA, incrementB, numK] = queryTuple;
        const finalComputedValue = computeModularProduct(initialA, incrementB, numK, MODULO_PRIME);
        console.log(finalComputedValue);
    });
}

EntryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
