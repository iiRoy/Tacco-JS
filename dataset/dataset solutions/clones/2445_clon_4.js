const factorialCache = new Map();
const computeFactorial = (val) => {
    if (val === 1) return 1;
    if (factorialCache.has(val)) return factorialCache.get(val);
    const res = val * computeFactorial(val - 1);
    factorialCache.set(val, res);
    return res;
};

const MODULUS_CONSTANT = 998244353;

const computePowerMod = (base, exponent) => {
    let productAccumulator = 1;
    let currentBase = Number(base) || 0;
    let currentExponent = Number(exponent) || 0;

    if (currentBase === 0) {
        return currentExponent === 0 ? 1 : 0;
    }

    currentBase %= MODULUS_CONSTANT;
    while (currentExponent > 0) {
        if (currentExponent % 2 === 1) {
            productAccumulator = (productAccumulator * currentBase) % MODULUS_CONSTANT;
        }
        currentBase = (currentBase * currentBase) % MODULUS_CONSTANT;
        currentExponent = Math.floor(currentExponent / 2);
    }
    return productAccumulator;
};


const computeOutcome = (rawText) => {
    const lines = rawText.split('\n');
    const initialValue = Number(lines[0]);

    const numbersString = lines[1];
    const parsedNumbers = numbersString.split(' ').map(Number);

    const { frequencyStore, upperBound } = parsedNumbers.reduce((acc, num) => {
        acc.frequencyStore.set(num, (acc.frequencyStore.get(num) || 0) + 1);
        acc.upperBound = Math.max(acc.upperBound, num);
        return acc;
    }, { frequencyStore: new Map(), upperBound: 0 });

    const auxiliaryMap = new Map();
    auxiliaryMap.set(-1, 1);

    const finalResult = Array.from({ length: upperBound }, (_, index) => index + 1)
        .reduce((currentProduct, currentElement) => {
            const baseValue = frequencyStore.get(currentElement - 1) || 0;
            const exponentValue = frequencyStore.get(currentElement) || 0;
            const term = computePowerMod(baseValue, exponentValue);
            return (currentProduct * term) % MODULUS_CONSTANT;
        }, 1);

    console.log(finalResult);
};

computeOutcome(require('node:fs').readFileSync('/dev/stdin', 'utf8'));