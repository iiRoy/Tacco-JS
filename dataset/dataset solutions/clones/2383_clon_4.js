const processSequenceData = (rawTextContent) => {
    const dataLines = rawTextContent.trim().split('\n');
    const [magnitudesLine, initialValuesLine, offsetsLine] = dataLines;

    const parseNumericArray = (str) => str.split(' ').map(Number);

    const magnitudes = parseNumericArray(magnitudesLine);
    const initialValues = parseNumericArray(initialValuesLine);
    const offsets = parseNumericArray(offsetsLine);

    const calcDeltaA = magnitudes[0] * (initialValues[0] - offsets[0]);
    const calcDeltaB = magnitudes[1] * (initialValues[1] - offsets[1]);

    if (calcDeltaA + calcDeltaB === 0) {
        return 'infinity';
    }

    const calculateAccumulationSteps = (
        currentAggregate,
        previousAggregate,
        currentIteration,
        changeFactors
    ) => {
        if (currentIteration > 0 && currentAggregate * previousAggregate > 0) {
            return currentIteration - 1;
        }

        const nextIteration = currentIteration + 1;
        const nextPreviousAggregate = currentAggregate;
        const factorToAdd = changeFactors[nextIteration % 2];
        const nextCurrentAggregate = currentAggregate + factorToAdd;

        return calculateAccumulationSteps(
            nextCurrentAggregate,
            nextPreviousAggregate,
            nextIteration,
            changeFactors
        );
    };

    return calculateAccumulationSteps(calcDeltaA, 0, 0, [calcDeltaA, calcDeltaB]);
};

console.log(processSequenceData(require("fs").readFileSync("/dev/stdin", "utf8")));