const acquireInputSource = require("fs").readFileSync;
const parseNumericSequence = (textualData) => textualData.trim().split(/\s+/).filter(Boolean).map(Number);

const executeComputation = () => {
    const rawContent = acquireInputSource("/dev/stdin", "utf8");
    const numericalTuple = parseNumericSequence(rawContent);

    const [
        itemA,
        itemB,
        , 
        itemD,
        itemE,
        , 
    ] = numericalTuple;

    const baseSummation = itemB +
                                (itemA & ~1) +
                                (itemD & ~1) +
                                (itemE & ~1);

    const aggregateOddness = (itemA & 1) +
                               (itemD & 1) +
                               (itemE & 1);

    const supplementalValue = (aggregateOddness === 3)
        ? 3
        : ((aggregateOddness === 2) && (itemA !== 0 && itemD !== 0 && itemE !== 0))
            ? 1
            : 0;

    return baseSummation + supplementalValue;
};

const finalOutcome = executeComputation();
if (finalOutcome !== undefined) {
    console.log(finalOutcome);
}