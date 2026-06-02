function generatePrimesUpTo(upperBound) {
    const isComposite = new Array(upperBound + 1).fill(false);
    isComposite[0] = true;
    isComposite[1] = true;

    const limitSqrt = Math.floor(Math.sqrt(upperBound));

    for (let numCandidate = 2; numCandidate <= limitSqrt; ++numCandidate) {
        if (isComposite[numCandidate]) {
            continue;
        }
        for (let multipleOfCandidate = numCandidate * numCandidate; multipleOfCandidate <= upperBound; multipleOfCandidate += numCandidate) {
            isComposite[multipleOfCandidate] = true;
        }
    }

    const primeNumbers = Array.from({ length: upperBound + 1 }, (_, index) => index)
                               .reduce((accumulator, currentIdx) => {
                                   if (!isComposite[currentIdx]) {
                                       accumulator.push(currentIdx);
                                   }
                                   return accumulator;
                               }, []);
    return primeNumbers;
}

const primeSequence = generatePrimesUpTo(999999);

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputValues = fileContent.trim().split('\n').map(Number);

for (const currentValue of inputValues) {
    if (currentValue === 0) {
        break;
    }

    const cumulativeSum = primeSequence.slice(0, currentValue).reduce((acc, val) => acc + val, 0);
    console.log(cumulativeSum);
}
