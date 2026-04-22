const DataAcquirer = (function() {
    let rawSourceData = "";
    let tokenPointer = 0;
    let separatedTokensList = [];

    const setupInput = () => {
        rawSourceData = require("fs").readFileSync(0, "utf8");
        separatedTokensList = rawSourceData.trim().split(/\s+/);
    };

    const getNextNumericValue = () => {
        return Number(separatedTokensList[tokenPointer++]);
    };

    const getMultipleNumericValues = (quantity) => {
        const collectedValues = [];
        let iter = 0;
        while (iter < quantity) {
            collectedValues.push(getNextNumericValue());
            iter++;
        }
        return collectedValues;
    };

    setupInput();

    return {
        fetchNumber: getNextNumericValue,
        fetchNumbers: getMultipleNumericValues
    };
})();

class ModuloCalculations {
    #primeDivisor;
    #bigIntDivisor;

    constructor(divisorValue) {
        this.#primeDivisor = divisorValue;
        this.#bigIntDivisor = BigInt(divisorValue);
    }

    // Ensures the value is a BigInt and within [0, #bigIntDivisor-1]
    standardize(value) {
        return (BigInt(value) % this.#bigIntDivisor + this.#bigIntDivisor) % this.#bigIntDivisor;
    }

    // Performs modular multiplication, returns BigInt
    product(operandOne, operandTwo) {
        return this.standardize(BigInt(operandOne) * BigInt(operandTwo));
    }

    // Performs modular addition, returns BigInt
    sum(operandOne, operandTwo) {
        return this.standardize(BigInt(operandOne) + BigInt(operandTwo));
    }

    // Performs modular subtraction, returns BigInt
    difference(minuendValue, subtrahendValue) {
        return this.standardize(BigInt(minuendValue) - BigInt(subtrahendValue));
    }

    // Performs modular exponentiation, returns BigInt
    power(baseValue, exponentValue) {
        let finalResult = 1n;
        let currentBase = this.standardize(baseValue);
        let currentExponent = BigInt(exponentValue);

        while (currentExponent > 0n) {
            if (currentExponent % 2n === 1n) {
                finalResult = this.product(finalResult, currentBase);
            }
            currentBase = this.product(currentBase, currentBase);
            currentExponent /= 2n;
        }
        return finalResult;
    }

    // Computes modular multiplicative inverse using Extended Euclidean Algorithm, returns BigInt
    multiplicativeInverse(value) {
        let currentMod = this.#bigIntDivisor;
        let a = this.standardize(value);
        let b = currentMod;
        let x0 = 0n;
        let x1 = 1n;

        if (a === 0n) throw new Error("Inverse of zero is undefined.");

        while (a > 1n) {
            let quotient = a / b;
            let tempB = b;
            b = a % b;
            a = tempB;
            
            let tempX0 = x0;
            x0 = x1 - quotient * x0;
            x1 = tempX0;
        }
        return this.standardize(x1);
    }
}

const ComputationEngine = (function() {
    const FIXED_MODULO_VALUE = 998244353;
    const arithmeticOperations = new ModuloCalculations(FIXED_MODULO_VALUE);

    const initializeTwoDimensionalArray = (rows, columns, initialElement) => {
        const gridStructure = Array.from({ length: rows }, () =>
            Array.from({ length: columns }, () => BigInt(initialElement))
        );
        return gridStructure;
    };

    const performCoreCalculation = () => {
        const [beginRow, beginCol, endRow, endCol] = DataAcquirer.fetchNumbers(4);

        const calculationMatrix = initializeTwoDimensionalArray(endRow + 1, endCol + 1, 0);

        calculationMatrix[beginRow][beginCol] = 1n; // Set initial state as BigInt

        let rIterator = beginRow;
        while (rIterator <= endRow) {
            let cIterator = beginCol;
            while (cIterator <= endCol) {
                if (rIterator === beginRow && cIterator === beginCol) {
                    // Initial cell already set, proceed to next
                    cIterator++;
                    continue;
                }

                let cellCurrentResult = 0n;

                // Contribution from the cell above: dp[y-1][x] * x
                if (rIterator > 0) {
                    const contributionOne = arithmeticOperations.product(
                        calculationMatrix[rIterator - 1][cIterator],
                        cIterator
                    );
                    cellCurrentResult = arithmeticOperations.sum(cellCurrentResult, contributionOne);
                }

                // Contribution from the cell to the left: dp[y][x-1] * y
                if (cIterator > 0) {
                    const contributionTwo = arithmeticOperations.product(
                        calculationMatrix[rIterator][cIterator - 1],
                        rIterator
                    );
                    cellCurrentResult = arithmeticOperations.sum(cellCurrentResult, contributionTwo);
                }

                // Subtraction for overlapping contribution: dp[y-1][x-1] * (y-1) * (x-1)
                if (rIterator > 0 && cIterator > 0) {
                    const overlappingTerm = arithmeticOperations.product(
                        arithmeticOperations.product(
                            calculationMatrix[rIterator - 1][cIterator - 1],
                            rIterator - 1
                        ),
                        cIterator - 1
                    );
                    cellCurrentResult = arithmeticOperations.difference(cellCurrentResult, overlappingTerm);
                }
                
                calculationMatrix[rIterator][cIterator] = cellCurrentResult;
                cIterator++;
            }
            rIterator++;
        }

        return Number(arithmeticOperations.standardize(calculationMatrix[endRow][endCol]));
    };

    return {
        execute: performCoreCalculation
    };
})();

const finalCalculatedOutput = ComputationEngine.execute();
if (finalCalculatedOutput !== undefined) {
    console.log(finalCalculatedOutput);
}