const obtainPrimeFragments = (initialValue) => {
    const decomposeRecursively = (currentProduct, potentialDivisor, currentFactors) => {
        if (currentProduct <= 1) {
            return currentFactors;
        }
        if (potentialDivisor * potentialDivisor > currentProduct) {
            return currentFactors.concat(currentProduct);
        }
        if (currentProduct % potentialDivisor === 0) {
            return decomposeRecursively(currentProduct / potentialDivisor, potentialDivisor, currentFactors.concat(potentialDivisor));
        } else {
            return decomposeRecursively(currentProduct, potentialDivisor + 1, currentFactors);
        }
    };
    return decomposeRecursively(initialValue, 2, []);
};

const processInputData = (rawData) => {
    const PI_CONSTANT = Math.PI;
    const DEGREES_PER_HALF_CIRCLE = 180;

    const relevantLines = rawData.split('\n').filter(line => line.trim() !== '');

    if (relevantLines.length === 0) {
        return;
    }

    const numericMatch = relevantLines[0].match(/(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)/);

    if (!numericMatch) {
        return;
    }

    const firstQuantity = parseFloat(numericMatch[1]);
    const secondQuantity = parseFloat(numericMatch[2]);
    const thirdQuantity = parseFloat(numericMatch[3]);

    const ratioNumerator = firstQuantity * secondQuantity * secondQuantity;
    const ratioDenominator = thirdQuantity * 2;
    const tangentArgument = ratioNumerator / ratioDenominator;

    const angleInRadians = Math.atan(tangentArgument);
    const angleInDegrees = (DEGREES_PER_HALF_CIRCLE / PI_CONSTANT) * angleInRadians;

    console.log(angleInDegrees);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));