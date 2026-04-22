const processRawData = (sourceText) => {
    const dataLines = sourceText.trim().split('\n');
    const totalElements = parseInt(dataLines[0], 10);
    const numericSequence = dataLines[1].split(' ').map(Number);
    return { totalElements, numericSequence };
};

const generatePrefixSums = (sequence) => {
    let currentAccumulation = 0;
    // The prefixSums[k] will store the sum of elements from index 0 to k-1.
    // prefixSums[0] is 0.
    const prefixSums = [0, ...sequence.map(item => (currentAccumulation += item))];
    return prefixSums;
};

const evaluatePartitions = (itemCount, cumulativeTotals) => {
    let globalMinimumDifference = Number.MAX_SAFE_INTEGER;

    // The middle split point, 'boundaryQ_R', indicates the index
    // where the Q block ends and the R block begins (0-indexed).
    // It must allow at least one element for P, Q, R, and S.
    // So: P(>=1), Q(>=1), R(>=1), S(>=1)
    // P ends at boundaryP_Q - 1. Q ends at boundaryQ_R - 1.
    // R ends at boundaryR_S - 1. S ends at itemCount - 1.
    // boundaryP_Q >= 1
    // boundaryQ_R - boundaryP_Q >= 1  => boundaryQ_R >= boundaryP_Q + 1
    // boundaryR_S - boundaryQ_R >= 1  => boundaryR_S >= boundaryQ_R + 1
    // itemCount - boundaryR_S >= 1    => boundaryR_S <= itemCount - 1

    // Therefore, boundaryQ_R must be at least 2 (for P and Q to exist)
    // and at most itemCount - 2 (for R and S to exist).
    for (let boundaryQ_R = 2; boundaryQ_R <= itemCount - 2; ++boundaryQ_R) {

        // --- Determine optimal boundaryP_Q (split between P and Q) ---
        // boundaryP_Q is the index where P ends and Q begins.
        // It can range from 1 to boundaryQ_R - 1.
        let boundaryP_Q_candidate = 1;
        const sumPQ = cumulativeTotals[boundaryQ_R]; // Sum of A[0]...A[boundaryQ_R-1]

        // Find boundaryP_Q that minimizes |Sum(P) - Sum(Q)|
        // |cumulativeTotals[boundaryP_Q] - (sumPQ - cumulativeTotals[boundaryP_Q])|
        // = |2 * cumulativeTotals[boundaryP_Q] - sumPQ|
        while (boundaryP_Q_candidate + 1 < boundaryQ_R) {
            const currentAbsDiff = Math.abs(2 * cumulativeTotals[boundaryP_Q_candidate] - sumPQ);
            const nextAbsDiff = Math.abs(2 * cumulativeTotals[boundaryP_Q_candidate + 1] - sumPQ);
            if (nextAbsDiff <= currentAbsDiff) {
                boundaryP_Q_candidate++;
            } else {
                break;
            }
        }
        const blockP_sum = cumulativeTotals[boundaryP_Q_candidate];
        const blockQ_sum = sumPQ - blockP_sum;

        // --- Determine optimal boundaryR_S (split between R and S) ---
        // boundaryR_S is the index where R ends and S begins.
        // It can range from boundaryQ_R + 1 to itemCount - 1.
        let boundaryR_S_candidate = boundaryQ_R + 1;
        const sumRS = cumulativeTotals[itemCount] - cumulativeTotals[boundaryQ_R]; // Sum of A[boundaryQ_R]...A[itemCount-1]

        // Find boundaryR_S that minimizes |Sum(R) - Sum(S)|
        // Sum(R) = cumulativeTotals[boundaryR_S] - cumulativeTotals[boundaryQ_R]
        // Sum(S) = sumRS - Sum(R)
        // |Sum(R) - Sum(S)| = |2 * Sum(R) - sumRS|
        while (boundaryR_S_candidate + 1 <= itemCount - 1) {
            const currentRsum = cumulativeTotals[boundaryR_S_candidate] - cumulativeTotals[boundaryQ_R];
            const nextRsum = cumulativeTotals[boundaryR_S_candidate + 1] - cumulativeTotals[boundaryQ_R];

            const currentAbsDiff = Math.abs(2 * currentRsum - sumRS);
            const nextAbsDiff = Math.abs(2 * nextRsum - sumRS);

            if (nextAbsDiff <= currentAbsDiff) {
                boundaryR_S_candidate++;
            } else {
                break;
            }
        }
        const blockR_sum = cumulativeTotals[boundaryR_S_candidate] - cumulativeTotals[boundaryQ_R];
        const blockS_sum = sumRS - blockR_sum;

        // --- Calculate range for this partition and update global minimum ---
        const currentPartitionSums = [blockP_sum, blockQ_sum, blockR_sum, blockS_sum];
        const maxCurrentSum = Math.max(...currentPartitionSums);
        const minCurrentSum = Math.min(...currentPartitionSums);
        const currentDifference = maxCurrentSum - minCurrentSum;

        if (currentDifference < globalMinimumDifference) {
            globalMinimumDifference = currentDifference;
        }
    }
    return globalMinimumDifference;
};

const executeCalculation = (dataInput) => {
    const { totalElements, numericSequence } = processRawData(dataInput);
    const cumulativeTotals = generatePrefixSums(numericSequence);
    const resultValue = evaluatePartitions(totalElements, cumulativeTotals);
    console.log(resultValue);
};

executeCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));