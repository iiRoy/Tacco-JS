const dataSource = require("fs").readFileSync(process.stdin.fd, "utf8");
const parsedTokens = dataSource.trim().split(/\s+/).map(Number);

process.stdout.write(computeResult(parsedTokens[0]).toString() + '\n');

function computeResult(targetValue) {
    if (targetValue === 1) return 0;
    if (targetValue === 2) return 1;

    let ultimateTally = 0;
    let mutableTarget = targetValue;

    const sieveLimit = Math.floor(Math.sqrt(targetValue));
    const primeListing = generatePrimesSieve(sieveLimit);

    for (let factorCandidate of primeListing) {
        if (mutableTarget < factorCandidate * factorCandidate && mutableTarget > 1) {
            break;
        }

        let currentExponent = 0;
        while (mutableTarget % factorCandidate === 0) {
            currentExponent++;
            mutableTarget /= factorCandidate;
        }

        if (currentExponent > 0) {
            const kValue = Math.floor((-1 + Math.sqrt(1 + 8 * currentExponent)) / 2);
            ultimateTally += kValue;
        }
    }

    if (mutableTarget > 1) {
        ultimateTally++;
    }

    return ultimateTally;
}

function generatePrimesSieve(upperBound) {
    if (upperBound < 2) return [];
    const isComposite = new Array(upperBound + 1).fill(false);
    const discoveredPrimes = [];

    for (let currentNumber = 2; currentNumber <= upperBound; currentNumber++) {
        if (!isComposite[currentNumber]) {
            discoveredPrimes.push(currentNumber);
            for (let multiple = currentNumber * currentNumber; multiple <= upperBound; multiple += currentNumber) {
                isComposite[multiple] = true;
            }
        }
    }
    return discoveredPrimes;
}