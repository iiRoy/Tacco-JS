const bigModulus = 1000000007n;
const maxCombinatorialValue = 100000n + 30n; // Maximum value for n+e-1, ensuring enough cache space

class CombinatoricsProcessor {
    constructor(limit, modulus) {
        this.modulus = modulus;
        this.factorialCache = new Array(Number(limit) + 1);
        this.inverseFactorialCache = new Array(Number(limit) + 1);
        this.primeModExp();
    }

    performModularExponentiation(base, exponent) {
        let outcome = 1n;
        let currentBase = base % this.modulus;
        let currentExponent = exponent;
        while (currentExponent > 0n) {
            if (currentExponent % 2n === 1n) outcome = (outcome * currentBase) % this.modulus;
            currentBase = (currentBase * currentBase) % this.modulus;
            currentExponent /= 2n;
        }
        return outcome;
    }

    primeModExp() {
        this.factorialCache[0] = 1n;
        this.inverseFactorialCache[0] = 1n;
        for (let index = 1; index < this.factorialCache.length; index++) {
            this.factorialCache[index] = (this.factorialCache[index - 1] * BigInt(index)) % this.modulus;
            this.inverseFactorialCache[index] = this.performModularExponentiation(this.factorialCache[index], this.modulus - 2n);
        }
    }

    fetchCombination(totalItems, selectedItems) {
        if (selectedItems < 0n || selectedItems > totalItems) return 0n;
        if (totalItems === 0n && selectedItems === 0n) return 1n;
        
        const numTotal = Number(totalItems);
        const numSelected = Number(selectedItems);
        const numDifference = Number(totalItems - selectedItems);

        if (numTotal >= this.factorialCache.length || numSelected >= this.factorialCache.length || numDifference >= this.factorialCache.length) {
            throw new Error("Combination arguments exceed precomputed limits. Adjust maxCombinatorialValue.");
        }

        let numPart = this.factorialCache[numTotal];
        let denInversePart = (this.inverseFactorialCache[numSelected] * this.inverseFactorialCache[numDifference]) % this.modulus;
        return (numPart * denInversePart) % this.modulus;
    }
}

const findPrimeDecomposition = (inputNumber) => {
    let currentNumber = inputNumber;
    const decompositionList = [];
    for (let currentDivisor = 2n; currentDivisor * currentDivisor <= currentNumber; currentDivisor++) {
        if (currentNumber % currentDivisor === 0n) {
            let count = 0n;
            while (currentNumber % currentDivisor === 0n) {
                currentNumber /= currentDivisor;
                count++;
            }
            decompositionList.push([currentDivisor, count]);
        }
    }
    if (currentNumber > 1n) {
        decompositionList.push([currentNumber, 1n]);
    }
    return decompositionList;
};

const processInputAndCalculate = (inputData) => {
    const [alpha, beta] = inputData.split(" ").map(BigInt);

    const calculator = new CombinatoricsProcessor(maxCombinatorialValue, bigModulus);

    const factorSet = findPrimeDecomposition(beta);

    const finalAccumulatedResult = factorSet.reduce((currentProduct, [primeValue, exponentCount]) => {
        const upperValue = exponentCount + alpha - 1n;
        const lowerValue = exponentCount;
        const currentCombinationResult = calculator.fetchCombination(upperValue, lowerValue);
        return (currentProduct * currentCombinationResult) % bigModulus;
    }, 1n);

    console.log(String(finalAccumulatedResult));
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));