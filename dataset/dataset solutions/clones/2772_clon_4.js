const acquireInformation = (dataStream) => {
    const contentText = dataStream.toString().trim();
    const contentLines = contentText.split(/\r?\n/);
    const collectionSize = Number(contentLines[0]);
    const numericElements = contentLines[1].split(/\s+/).map(Number);
    return { elementCount: collectionSize, rawNumbers: numericElements };
};

const evaluateSequence = (processedContent) => {
    const collectionSize = processedContent.elementCount;
    const rawNumbers = processedContent.rawNumbers;

    // Compute the value corresponding to X_{N-1} from the original problem's internal state
    // This is `rawNumbers[N-1] + sum(rawNumbers[2k+1] - rawNumbers[2k])`
    const finalCalculatedValue = rawNumbers.at(-1) + Array.from({ length: Math.max(0, Math.floor((collectionSize - 2) / 2)) }, (_, k) =>
        rawNumbers[2 * k + 1] - rawNumbers[2 * k]
    ).reduce((accumulator, term) => accumulator + term, 0);

    // Compute the alternating sum of A_i from A_0 to A_{N-2}
    // This is `sum((-1)^i * rawNumbers[i])`
    const alternatingIntermediateSum = rawNumbers.slice(0, collectionSize - 1).reduce((accumulator, value, index) =>
        accumulator + (index % 2 === 0 ? value : -value), 0
    );

    // Determine the sign based on (N-2) parity. Equivalent to (-1)^(N-2)
    // If N is even, N-2 is even (+1). If N is odd, N-2 is odd (-1).
    const signForFinalTerm = (collectionSize % 2 === 0 ? 1 : -1);

    // Compute X_0 using the derived relation: X_0 = 2 * (sum((-1)^i * A_i) from 0 to N-2) - (-1)^(N-2) * X_{N-1}
    const initialCalculatedValue = 2 * alternatingIntermediateSum - signForFinalTerm * finalCalculatedValue;

    // Generate the full sequence X_0, ..., X_{N-1} using a functional iterative approach
    // The recurrence relation is X_j = 2 * A_{j-1} - X_{j-1}
    const resultingOutput = Array(collectionSize).fill(0).reduce((sequence, _, index) => {
        if (index === 0) {
            sequence.push(initialCalculatedValue);
        } else {
            const previousResult = sequence[index - 1];
            const currentResult = 2 * rawNumbers[index - 1] - previousResult;
            sequence.push(currentResult);
        }
        return sequence;
    }, []);

    return resultingOutput;
};

const runApplication = (inputSource) => {
    const dataContainer = acquireInformation(inputSource);
    const finalProcessedResult = evaluateSequence(dataContainer);
    console.log(finalProcessedResult.join(" "));
};

runApplication(require("fs").readFileSync("/dev/stdin", "utf8"));