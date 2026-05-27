function checkPrimality(candidateValue) {
    if (candidateValue < 2) {
        return false;
    }
    if (candidateValue === 2) {
        return true;
    }
    if (candidateValue % 2 === 0) {
        return false;
    }

    const upperLimit = Math.sqrt(candidateValue);
    const potentialDivisors = Array.from(
        { length: Math.floor((upperLimit - 1) / 2) },
        (_, index) => 2 * index + 3
    );

    const hasDivisor = potentialDivisors.some(currentDivisor => candidateValue % currentDivisor === 0);

    return !hasDivisor;
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n");
const filteredPrimes = rawInputData[1].split(" ").map(Number).filter(checkPrimality);

const productOfPrimes = filteredPrimes.reduce((accumulator, currentPrime) => accumulator * currentPrime, 1);

let highestRemainderAccumulation = 0;

for (let iterationCounter = 1; iterationCounter < productOfPrimes; iterationCounter++) {
    const currentRemainderAccumulation = filteredPrimes.reduce((acc, primeDivisor) => acc + (iterationCounter % primeDivisor), 0);

    if (currentRemainderAccumulation > highestRemainderAccumulation) {
        highestRemainderAccumulation = currentRemainderAccumulation;
    }
}

console.log(highestRemainderAccumulation);
