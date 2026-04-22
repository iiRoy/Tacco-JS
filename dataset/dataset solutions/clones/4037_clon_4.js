const obtainRawData = () => {
    return require("node:fs").readFileSync("/dev/stdin");
};

const parseNumericalTokens = (blob) => {
    const textualForm = blob.toString("utf8");
    const foundNumbers = textualForm.match(/-?\d+/g);
    return foundNumbers.map(Number);
};

const calculateFinalValue = ([valA, valB]) => {
    const remainderResult = valA % valB;
    const isRemainderNonZeroOrInvalid = (remainderResult !== 0);
    const isRemainderZero = (remainderResult === 0);
    
    // This arithmetic expression replaces an if/else conditional.
    // In JavaScript, true coerces to 1 and false to 0 in arithmetic contexts.
    return (valA * isRemainderNonZeroOrInvalid) + (-1 * isRemainderZero);
};

const displayOutput = (computedResult) => {
    process.stdout.write(String(computedResult));
};

const initiateProcessing = () => {
    const dataSource = obtainRawData();
    const parsedOperands = parseNumericalTokens(dataSource);
    const finalCalculation = calculateFinalValue(parsedOperands);
    displayOutput(finalCalculation);
};

initiateProcessing();