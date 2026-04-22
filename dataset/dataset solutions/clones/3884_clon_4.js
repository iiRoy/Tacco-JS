class DataExtractor {
    constructor(sourceData) {
        this.dataSegments = sourceData.split(/\s|\n/).filter(Boolean);
        this.segmentPointer = 0;
    }

    retrieveNumericValue() {
        if (this.segmentPointer >= this.dataSegments.length) {
            throw new Error("No more data segments available.");
        }
        return Number(this.dataSegments[this.segmentPointer++]);
    }

    retrieveNumericArray(quantity) {
        const numericArray = [];
        for (let i = 0; i < quantity; i++) {
            numericArray.push(this.retrieveNumericValue());
        }
        return numericArray;
    }
}

function evaluateRouteMetrics(itemCount, totalDimension, pointsOfInterest) {
    // pointsOfInterest: array of { position: number, reward: number }
    // itemCount: N, totalDimension: C

    // Construct the full coordinate sequence including 0 and C
    // Original X equivalent: [0, X1, ..., XN, C]
    const fullCoordinates = [0, ...pointsOfInterest.slice(1).map(p => p.position), totalDimension];

    // forwardAccumulation: analogous to L array
    // F[k] = net reward when traveling from 0 to item k
    const forwardAccumulation = Array(itemCount + 1).fill(0);
    for (let k = 1; k <= itemCount; k++) {
        forwardAccumulation[k] = forwardAccumulation[k - 1] + pointsOfInterest[k].reward - (fullCoordinates[k] - fullCoordinates[k - 1]);
    }

    // backwardAccumulation: analogous to R array
    // B[k] = net reward when traveling counter-clockwise from C to item k+1
    const backwardAccumulation = Array(itemCount + 1).fill(0);
    for (let k = itemCount - 1; k >= 0; k--) {
        backwardAccumulation[k] = backwardAccumulation[k + 1] + pointsOfInterest[k + 1].reward - (fullCoordinates[k + 2] - fullCoordinates[k + 1]);
    }

    let currentOptimalBenefit = Number.MIN_SAFE_INTEGER;

    // Analyze all possible path combinations
    for (let k = 0; k <= itemCount; k++) {
        // Path type 1: Travel from 0 clockwise to item k and stop
        currentOptimalBenefit = Math.max(currentOptimalBenefit, forwardAccumulation[k]);

        for (let j = k; j < itemCount; j++) {
            // Path type 2: Travel 0 -> item k (clockwise), then item k -> 0 (return),
            // then C -> item j+1 (counter-clockwise)
            // Equivalent to: L[n] - X[n] + R[m]
            const combinedPathBenefit = forwardAccumulation[k] - fullCoordinates[k] + backwardAccumulation[j];
            currentOptimalBenefit = Math.max(currentOptimalBenefit, combinedPathBenefit);
        }
    }

    return currentOptimalBenefit;
}

function ExecuteCalculation(rawSource) {
    const dataStream = new DataExtractor(rawSource);
    const numberOfItems = dataStream.retrieveNumericValue(); // N
    const pathCircumference = dataStream.retrieveNumericValue(); // C

    const itemDetails = Array(numberOfItems + 1).fill(null).map(() => ({ position: 0, reward: 0 }));
    // itemDetails[0] is a virtual start point (pos:0, reward:0)
    // itemDetails[1] to itemDetails[numberOfItems] are the actual items
    for (let i = 1; i <= numberOfItems; i++) {
        itemDetails[i].position = dataStream.retrieveNumericValue();
        itemDetails[i].reward = dataStream.retrieveNumericValue();
    }

    let overallMaximumBenefit = Number.MIN_SAFE_INTEGER;

    // --- Scenario 1: Clockwise traversal logic ---
    overallMaximumBenefit = Math.max(overallMaximumBenefit, evaluateRouteMetrics(numberOfItems, pathCircumference, itemDetails));

    // --- Scenario 2: Counter-clockwise traversal logic (by transforming input) ---
    // This transformation mirrors the original code's approach:
    // 1. Invert item positions relative to C: x' = C - x
    // 2. Reverse the order of items.
    // 3. Adjust rewards (implicit in combined structure).

    const alteredItemDetails = Array(numberOfItems + 1).fill(null);
    alteredItemDetails[0] = { position: 0, reward: 0 }; // New virtual start point

    for (let i = 1; i <= numberOfItems; i++) {
        // The i-th item in the altered collection corresponds to the (N - i + 1)-th item from the original.
        alteredItemDetails[i] = {
            position: pathCircumference - itemDetails[numberOfItems - i + 1].position,
            reward: itemDetails[numberOfItems - i + 1].reward
        };
    }

    overallMaximumBenefit = Math.max(overallMaximumBenefit, evaluateRouteMetrics(numberOfItems, pathCircumference, alteredItemDetails));

    console.log(overallMaximumBenefit);
}

if (typeof window === "undefined") {
    ExecuteCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));
}