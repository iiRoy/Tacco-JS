function calculateEuclideanGCD(valA, valB) {
    while (valB !== 0) {
        let temp = valB;
        valB = valA % valB;
        valA = temp;
    }
    return valA;
}

function findThreeNumberGCD(numX, numY, numZ) {
    return calculateEuclideanGCD(calculateEuclideanGCD(numX, numY), numZ);
}

function determineGreatestCommonDivisor(valI, valJ, valK) {
    let commonDivisorCandidate = findThreeNumberGCD(valI, valJ, valK);

    if (commonDivisorCandidate <= 2 || commonDivisorCandidate % 2 !== 0) {
        return commonDivisorCandidate;
    } else {
        while (commonDivisorCandidate > 2 && commonDivisorCandidate % 2 === 0) {
            commonDivisorCandidate /= 2;
        }
        return commonDivisorCandidate;
    }
}

function* tripletSequenceGenerator(upperBound) {
    for (let x = 1; x <= upperBound; x++) {
        for (let y = 1; y <= upperBound; y++) {
            for (let z = 1; z <= upperBound; z++) {
                yield [x, y, z];
            }
        }
    }
}

function processInputAndSum(inputString) {
    const iterationLimit = Number.parseInt(inputString, 10);
    let totalAccumulator = 0;

    for (const currentTriplet of tripletSequenceGenerator(iterationLimit)) {
        totalAccumulator += determineGreatestCommonDivisor(currentTriplet[0], currentTriplet[1], currentTriplet[2]);
    }
    
    console.log(totalAccumulator);
}

processInputAndSum(require("fs").readFileSync("/dev/stdin", "utf8"));
