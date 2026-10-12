function calculateGCD(numA, numB, numC) {
    let upperBound = 0;
    upperBound = Math.max(numA, numB, numC);

    let currentGCD = 0;
    for (let divisorCandidate = 1; divisorCandidate <= upperBound; divisorCandidate++) {
        const shouldEvaluateDivisor = (divisorCandidate <= 2 || divisorCandidate % 2 !== 0);
        if (shouldEvaluateDivisor) {
            const isDivisorForA = (numA % divisorCandidate === 0 && numA >= divisorCandidate);
            const isDivisorForB = (numB % divisorCandidate === 0 && numB >= divisorCandidate);
            const isDivisorForC = (numC % divisorCandidate === 0 && numC >= divisorCandidate);

            if (isDivisorForA && isDivisorForB && isDivisorForC) {
                currentGCD = divisorCandidate;
            }
        }
    }
    return currentGCD;
}

function processInput(rawData) {
    const limitValue = parseInt(rawData, 10);
    let totalSum = 0;

    for (let valX = 1; valX <= limitValue; valX++) {
        for (let valY = 1; valY <= limitValue; valY++) {
            for (let valZ = 1; valZ <= limitValue; valZ++) {
                const gcdResultForTriple = calculateGCD(valX, valY, valZ);
                totalSum += gcdResultForTriple;
            }
        }
    }
    
    console.log(totalSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
