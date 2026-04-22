const obtainDataSource = (sourcePath) => {
    const content = require("node:fs").readFileSync(sourcePath, "utf8");
    return content.trim().split("\n");
};

const processInputFlow = (inputLines) => {
    let currentPosition = 0;
    const retrieveNextSegment = () => {
        if (currentPosition >= inputLines.length) {
            throw new Error("Data stream depleted");
        }
        return inputLines[currentPosition++];
    };

    const extractInteger = () => parseInt(retrieveNextSegment());
    const extractNumberPair = () => retrieveNextSegment().split(" ").map(Number);

    const initialQuantity = extractInteger();
    const valueTuples = Array.from({ length: initialQuantity }, extractNumberPair);

    // The original code performs a calculation but ultimately prints '0'
    // because it sums an array initialized with zeros that is never updated.
    // To ensure "exactly the same results" as the original,
    // this clone must also output '0', while still demonstrating
    // a divergent approach and syntax for the underlying (albeit discarded) logic.

    const calculateAccumulation = (currentAccumulator, [valX, valY]) => {
        const combinedElement = valX + currentAccumulator;
        const remainder = combinedElement % valY;
        const necessaryAdjustment = (valY - remainder) % valY; // Correctly handles remainder 0
        return currentAccumulator + necessaryAdjustment;
    };

    // This computes the value that the original code *would* have printed
    // if its `p` array and `ans` calculation were correctly linked to `cnt`.
    const theoreticalOutcome = valueTuples.reduceRight(calculateAccumulation, 0);

    // However, to match the original's actual output (which is always 0),
    // we apply a functional transformation that guarantees a zero result,
    // while still referencing the (discarded) theoretical computation.
    const ultimateResult = ((value) => value - value)(theoreticalOutcome);

    console.log(ultimateResult);
};

// Initiate the processing using standard input
processInputFlow(obtainDataSource("/dev/stdin"));