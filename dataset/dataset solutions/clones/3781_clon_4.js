class ArithmeticEngine {
    constructor(primeDivisor) {
        this.primeDivisor = primeDivisor;
        this.factorialCache = new Map([[0, 1], [1, 1]]);
        this.inverseFactorialCache = new Map([[0, 1], [1, 1]]);
    }

    productModulo(...numbers) {
        let currentProduct = 1;
        for (const num of numbers) {
            currentProduct = (BigInt(currentProduct) * BigInt(num)) % BigInt(this.primeDivisor);
        }
        return Number(currentProduct);
    }

    expModulo(base, exponent) {
        let outcome = 1;
        let currentBase = base % this.primeDivisor;
        while (exponent > 0) {
            if (exponent % 2 === 1) {
                outcome = this.productModulo(outcome, currentBase);
            }
            currentBase = this.productModulo(currentBase, currentBase);
            exponent = Math.floor(exponent / 2);
        }
        return outcome;
    }

    modInverse(number) {
        return this.expModulo(number, this.primeDivisor - 2);
    }

    retrieveFactorial(num) {
        if (this.factorialCache.has(num)) {
            return this.factorialCache.get(num);
        }
        let previousFactorial = this.retrieveFactorial(num - 1);
        let currentFactorial = this.productModulo(previousFactorial, num);
        this.factorialCache.set(num, currentFactorial);
        return currentFactorial;
    }

    retrieveInverseFactorial(num) {
        if (this.inverseFactorialCache.has(num)) {
            return this.inverseFactorialCache.get(num);
        }
        this.retrieveFactorial(num);
        let currentInvFactorial = this.modInverse(this.factorialCache.get(num));
        this.inverseFactorialCache.set(num, currentInvFactorial);

        for (let i = num - 1; i >= 0 && !this.inverseFactorialCache.has(i); i--) {
            this.inverseFactorialCache.set(i, this.productModulo(this.inverseFactorialCache.get(i + 1), i + 1));
        }
        return currentInvFactorial;
    }

    binomialCoefficient(total, select) {
        if (select < 0 || select > total) {
            return 0;
        }
        if (select === 0 || select === total) {
            return 1;
        }
        if (select > total / 2) {
            select = total - select;
        }

        const numeratorFactorial = this.retrieveFactorial(total);
        const denominatorFactorial = this.retrieveInverseFactorial(select);
        const denominatorDifferenceFactorial = this.retrieveInverseFactorial(total - select);

        return this.productModulo(numeratorFactorial, denominatorFactorial, denominatorDifferenceFactorial);
    }
}

function processAcquisitionScenario(inputLine) {
    const primeDivisor = 998244353;
    const combinatoricsEngine = new ArithmeticEngine(primeDivisor);

    const numericInputs = inputLine.split(" ").map(Number);
    const universeSize = numericInputs[0];
    const componentAlphaCost = numericInputs[1];
    const componentBetaCost = numericInputs[2];
    const acquisitionLimit = numericInputs[3];
    const bundleCost = componentAlphaCost + componentBetaCost;

    let finalTally = 0;

    let initialBundleCount = -1;
    let startingComponentPairs = new Set();

    for (let potentialBundleCount = Math.floor(acquisitionLimit / bundleCost); potentialBundleCount >= 0; potentialBundleCount--) {
        const remainingFunds = acquisitionLimit - potentialBundleCount * bundleCost;

        if (remainingFunds >= 0) {
            if (remainingFunds % componentAlphaCost === 0) {
                const alphaCount = remainingFunds / componentAlphaCost;
                if (alphaCount >= 0) {
                    startingComponentPairs.add(`${alphaCount},0`);
                }
            }
            if (remainingFunds % componentBetaCost === 0) {
                const betaCount = remainingFunds / componentBetaCost;
                if (betaCount >= 0) {
                    startingComponentPairs.add(`0,${betaCount}`);
                }
            }
        }

        if (startingComponentPairs.size > 0) {
            initialBundleCount = potentialBundleCount;
            break;
        }
    }

    if (initialBundleCount === -1) {
        console.log(0);
        return;
    }

    let currentExplorationFrontier = startingComponentPairs;
    let seenConfigurations = new Set();

    const alphaShift = (bundleCost % componentAlphaCost === 0) ? bundleCost / componentAlphaCost : 0;
    const betaShift = (bundleCost % componentBetaCost === 0) ? bundleCost / componentBetaCost : 0;

    for (let currentBundleCount = initialBundleCount; currentBundleCount >= 0; currentBundleCount--) {
        const nextExplorationFrontier = new Set();
        for (const configKey of currentExplorationFrontier) {
            const fullConfigKey = `${currentBundleCount},${configKey}`;
            if (seenConfigurations.has(fullConfigKey)) {
                continue;
            }
            seenConfigurations.add(fullConfigKey);

            const [currentAlpha, currentBeta] = configKey.split(',').map(Number);

            if (currentAlpha < 0 || currentBeta < 0 || currentBundleCount + currentAlpha + currentBeta > universeSize) {
                continue;
            }

            let factorOne = combinatoricsEngine.binomialCoefficient(universeSize, currentBundleCount);
            let factorTwo = combinatoricsEngine.binomialCoefficient(universeSize - currentBundleCount, currentAlpha);
            let factorThree = combinatoricsEngine.binomialCoefficient(universeSize - currentBundleCount - currentAlpha, currentBeta);

            finalTally = (finalTally + combinatoricsEngine.productModulo(factorOne, factorTwo, factorThree)) % primeDivisor;

            const shiftedAlpha1 = currentAlpha + 1;
            const shiftedBeta1 = currentBeta + 1;
            nextExplorationFrontier.add(`${shiftedAlpha1},${shiftedBeta1}`);

            if (alphaShift > 0) {
                const shiftedAlpha2 = currentAlpha + alphaShift;
                nextExplorationFrontier.add(`${shiftedAlpha2},${currentBeta}`);
            }

            if (betaShift > 0) {
                const shiftedBeta3 = currentBeta + betaShift;
                nextExplorationFrontier.add(`${currentAlpha},${shiftedBeta3}`);
            }
        }
        currentExplorationFrontier = nextExplorationFrontier;
    }

    console.log(finalTally);
}

processAcquisitionScenario(require("fs").readFileSync("/dev/stdin","utf8"));