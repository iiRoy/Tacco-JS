class InputProcessor {
    constructor(sourceText) {
        this.sourceLines = sourceText.trim().split('\n');
        this.currentLinePointer = 0;
        this.activeLineTokens = [];
    }

    // Corresponds to original GET.prototype.a
    retrieveNextToken(returnAsString = false) {
        if (this.activeLineTokens.length === 0) {
            if (this.currentLinePointer >= this.sourceLines.length) {
                throw new Error("Input exhausted.");
            }
            this.activeLineTokens = this.sourceLines[this.currentLinePointer++].split(' ');
        }
        const extractedToken = this.activeLineTokens.shift();
        return returnAsString ? extractedToken : Number(extractedToken);
    }

    // Corresponds to original GET.prototype.l
    retrieveLineTokens(returnAsStringArray = false) {
        if (this.currentLinePointer >= this.sourceLines.length) {
            throw new Error("Input exhausted.");
        }
        const lineContent = this.sourceLines[this.currentLinePointer++].split(' ');
        return returnAsStringArray ? lineContent : lineContent.map(Number);
    }

    // Corresponds to original GET.prototype.m
    retrieveMatrix(rowsToRead, returnAsStringMatrix = false) {
        return Array.from({ length: rowsToRead }, () =>
            this.retrieveLineTokens(returnAsStringMatrix)
        );
    }

    // Corresponds to original GET.prototype.r
    retrieveRawLines(count, convertToNumbers = false) {
        if (this.currentLinePointer + count > this.sourceLines.length) {
            throw new Error("Not enough lines for raw read operation.");
        }
        const rawSegment = this.sourceLines.slice(this.currentLinePointer, this.currentLinePointer + count);
        this.currentLinePointer += count;
        return convertToNumbers ? rawSegment.map(Number) : rawSegment;
    }
}

// Replaces original xArray function
function createMultiDimensionalArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array.from({ length: currentDimensionSize }, () =>
        createMultiDimensionalArray(initialValue, ...remainingDimensions)
    );
}

const dataReader = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(calculateOptimalValue());

function calculateOptimalValue() {
    const itemCount = dataReader.retrieveNextToken(); // n
    const thresholdValue = dataReader.retrieveNextToken(); // x
    const rawItemData = dataReader.retrieveMatrix(itemCount); // b

    let cumulativeProductT = 0; // s

    // Transform raw item data into a more descriptive object structure
    const enrichedItems = rawItemData.map(itemRow => {
        const [param0, param1, param2] = itemRow; // b[i][0], b[i][1], b[i][2]
        const productT = param0 * param1; // t
        const adjustedA = (thresholdValue - param0) * param2; // a
        const combinedMetric = adjustedA + productT; // a+t (original b[i][5])

        cumulativeProductT += productT;

        return {
            p0: param0,
            p1: param1,
            p2: param2,
            adjustedA: adjustedA,
            productT: productT,
            combinedMetric: combinedMetric
        };
    });

    // Sort items by combinedMetric in descending order
    enrichedItems.sort((itemA, itemB) => itemB.combinedMetric - itemA.combinedMetric);

    let upperSearchBound = itemCount * thresholdValue; // ok
    let lowerSearchBound = -1; // ng

    // Binary search for the optimal value
    while (upperSearchBound - lowerSearchBound > 1) {
        const currentMidpoint = Math.floor((upperSearchBound + lowerSearchBound) / 2); // m
        let currentU = cumulativeProductT; // u
        let currentK = currentMidpoint; // k
        const remainderModuloX = currentMidpoint % thresholdValue; // z

        let maxU1Value = 0; // u0
        let maxU1Index = 0; // i0

        // First pass: Determine the maximum u1 value and its corresponding index
        enrichedItems.forEach((item, index) => {
            let candidateU1;
            if (remainderModuloX < item.p0) {
                candidateU1 = item.p1 * remainderModuloX;
            } else {
                candidateU1 = item.productT + (remainderModuloX - item.p0) * item.p2;
            }
            if (candidateU1 > maxU1Value) {
                maxU1Value = candidateU1;
                maxU1Index = index;
            }
        });

        // Second pass: Simulate resource consumption
        for (let i = 0; i < itemCount && currentK > 0 && currentU > 0; i++) {
            const currentItem = enrichedItems[i];

            if (thresholdValue <= currentK) {
                currentU -= currentItem.combinedMetric;
                currentK -= thresholdValue;
            } else {
                if (i <= maxU1Index) {
                    currentU -= maxU1Value;
                    currentK = 0;
                } else {
                    let temporaryV = currentU;
                    temporaryV += enrichedItems[maxU1Index].combinedMetric - currentItem.combinedMetric - maxU1Value;
                    if (temporaryV <= 0) {
                        currentU = temporaryV;
                        continue;
                    }

                    // This block implements the tricky nested loop from the original
                    // The original's `for(v = u; i < n && v > 0; i++){ v = u; ... }`
                    // means `v` is reset to `u` at the start of each iteration.
                    // So, `u` is updated with the `v` from the *last* iteration that ran.
                    // If `u - deduction <= 0` for an item, the loop terminates, and `u` gets that value.
                    // If all items result in `u - deduction > 0`, `u` gets the value from the last item.
                    let finalDeductionResult = currentU;
                    let loopTerminationIndex = itemCount; // Tracks the 'i' where the loop would break

                    for (let j = i; j < itemCount; j++) {
                        const itemForDeduction = enrichedItems[j];
                        let deductionAmount;

                        if (currentK < itemForDeduction.p0) {
                            deductionAmount = itemForDeduction.p1 * currentK;
                        } else {
                            deductionAmount = itemForDeduction.productT + (currentK - itemForDeduction.p0) * itemForDeduction.p2;
                        }

                        finalDeductionResult = currentU - deductionAmount;

                        if (finalDeductionResult <= 0) {
                            loopTerminationIndex = j;
                            break;
                        }
                    }
                    currentU = finalDeductionResult;
                    i = loopTerminationIndex; // Advance outer loop's index
                    currentK = 0;
                }
            }
        }

        if (currentU > 0) {
            lowerSearchBound = currentMidpoint;
        } else {
            upperSearchBound = currentMidpoint;
        }
    }
    return upperSearchBound;
}
