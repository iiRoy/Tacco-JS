function* tokenGenerator(inputContent, parseFn = Number) {
    const lines = inputContent.split("\n");
    for (const line of lines) {
        const tokens = line.trim().split(" ").filter(Boolean);
        for (const token of tokens) {
            yield parseFn(token);
        }
    }
}

function primeCollector(upperBound) {
    const candidates = new Set();
    for (let k = 2; k <= upperBound; k++) {
        candidates.add(k);
    }

    for (let p = 2; p * p <= upperBound; p++) {
        if (candidates.has(p)) {
            for (let multiple = p * p; multiple <= upperBound; multiple += p) {
                candidates.delete(multiple);
            }
        }
    }
    return Array.from(candidates).sort((x, y) => x - y);
}

function greatestCommonDivisor(val1, val2) {
    let currentA = val1;
    let currentB = val2;
    while (currentB !== 0) {
        const temp = currentB;
        currentB = currentA % currentB;
        currentA = temp;
    }
    return currentA;
}

const primeList = primeCollector(100000);

function factorizeAndAdd(numberToFactor, primeArray, factorSet, startIndex = 0) {
    if (numberToFactor <= 1) {
        return;
    }
    if (startIndex >= primeArray.length) {
        factorSet.add(numberToFactor);
        return;
    }

    const currentP = primeArray[startIndex];
    if (numberToFactor % currentP === 0) {
        factorSet.add(currentP);
        while (numberToFactor % currentP === 0) {
            numberToFactor /= currentP;
        }
    }
    factorizeAndAdd(numberToFactor, primeArray, factorSet, startIndex + 1);
}

function processInput(inputContent) {
    const tokenStream = tokenGenerator(inputContent);

    const countN = tokenStream.next().value;
    const dataArrReversed = [];
    for (let k = 0; k <= countN; k++) {
        dataArrReversed.unshift(tokenStream.next().value);
    }

    const initialGCD = dataArrReversed.slice(1).reduce(greatestCommonDivisor, dataArrReversed[0]);

    const normalizedArr = dataArrReversed.map(val => val / initialGCD);

    const resultFactors = new Set();
    const firstElement = normalizedArr[0];
    const maxIdx = countN;

    primeList.filter(currentPrime => {
        if (firstElement % currentPrime !== 0) {
            return false;
        }

        return Array.from({ length: currentPrime - 1 }, (_, idx) => idx + 1).every(offset => {
            let currentSum = 0;
            for (let currentIdx = offset; currentIdx <= maxIdx; currentIdx += (currentPrime - 1)) {
                currentSum += normalizedArr[currentIdx];
            }
            return currentSum % currentPrime === 0;
        });
    }).forEach(p => resultFactors.add(p));

    factorizeAndAdd(initialGCD, primeList, resultFactors);

    const finalSortedFactors = Array.from(resultFactors).sort((x, y) => x - y);
    finalSortedFactors.forEach(factor => console.log(factor));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
