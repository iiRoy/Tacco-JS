function Main(programInput) {
    programInput = programInput.split("\n");
    const inputNumber = parseInt(programInput[0]);

    const primeExponents = new Array(101).fill(0);
    const isPrimeFlag = new Array(101).fill(true);
    isPrimeFlag[0] = isPrimeFlag[1] = false;

    for (let primeCandidate = 2; primeCandidate * primeCandidate <= 100; primeCandidate++) {
        if (isPrimeFlag[primeCandidate]) {
            for (let multiple = primeCandidate * primeCandidate; multiple <= 100; multiple += primeCandidate) {
                isPrimeFlag[multiple] = false;
            }
        }
    }

    for (let primeVal = 2; primeVal <= 100; primeVal++) {
        if (isPrimeFlag[primeVal]) {
            let currentPrimePower = primeVal;
            let exponentSum = 0;
            while (currentPrimePower <= inputNumber) {
                exponentSum += Math.floor(inputNumber / currentPrimePower);
                if (currentPrimePower > inputNumber / primeVal) {
                    break;
                }
                currentPrimePower *= primeVal;
            }
            primeExponents[primeVal] = exponentSum;
        }
    }

    const exponentCategories = primeExponents.slice(2).reduce((accumulator, currentExp) => {
        if (currentExp === 2 || currentExp === 3) {
            accumulator.lowFrequencyPrimes++;
        }
        if (currentExp >= 4) {
            accumulator.highFrequencyPrimes++;
        }
        return accumulator;
    }, { lowFrequencyPrimes: 0, highFrequencyPrimes: 0 });

    const lowFrequencyCount = exponentCategories.lowFrequencyPrimes;
    const highFrequencyCount = exponentCategories.highFrequencyPrimes;

    const termOne = lowFrequencyCount * highFrequencyCount * (highFrequencyCount - 1) / 2;
    const termTwo = highFrequencyCount * (highFrequencyCount - 1) * (highFrequencyCount - 2) / 2;

    const finalAnswer = termOne + termTwo;

    console.log('%s', finalAnswer);
}

function debug() {
    var input = document.getElementById("input").value;
    Main(input);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
