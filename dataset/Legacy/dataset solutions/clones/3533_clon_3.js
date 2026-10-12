function processInput(inputString) {
    // Parse N and M from the input string
    const inputParts = inputString.split(" ");
    const firstNum = parseInt(inputParts[0], 10); // N
    let secondNum = parseInt(inputParts[1], 10); // M, will be modified during factorization

    // Initialize a list of prime numbers
    const primeList = [2, 3];

    // Determine the upper limit for prime generation (sqrt(M))
    const sqrtOfSecondNum = Math.floor(Math.sqrt(secondNum));

    // Helper function to check if a number is divisible by any existing prime
    const isDivisibleByKnownPrime = (candidateNum, knownPrimes) => {
        for (let p of knownPrimes) {
            if (candidateNum % p === 0) {
                return true;
            }
            // Optimization: if p*p > candidateNum, no larger prime factor can exist
            // This helps to reduce unnecessary checks for larger primes.
            if (p * p > candidateNum) {
                break;
            }
        }
        return false;
    };

    // Generate primes up to sqrt(M)
    // Start checking from the next number after the last prime in the list
    for (let currentCandidate = primeList[primeList.length - 1] + 1; currentCandidate <= sqrtOfSecondNum; currentCandidate++) {
        if (!isDivisibleByKnownPrime(currentCandidate, primeList)) {
            primeList.push(currentCandidate);
        }
    }

    // Perform prime factorization of M
    const factorCounts = {}; // Stores prime factors and their counts

    for (let currentPrime of primeList) {
        // Optimization: Only proceed if the current number is divisible by the prime
        if (secondNum % currentPrime === 0) {
            while (secondNum % currentPrime === 0) {
                secondNum /= currentPrime;
                factorCounts[currentPrime] = (factorCounts[currentPrime] || 0) + 1;
            }
        }
    }

    // If secondNum is still greater than 1, it means the remaining value is a prime factor itself
    if (secondNum > 1) {
        factorCounts[secondNum] = (factorCounts[secondNum] || 0) + 1;
    }

    // Initialize result accumulator and modulo value
    let finalResult = 1;
    const MODULO_CONSTANT = 1000000007; // 10^9 + 7

    // Helper function to calculate combinations (nCk)
    // This implementation mirrors the original's behavior by interleaving multiplication and division
    // to potentially mitigate floating point precision issues for intermediate large numbers.
    const calculateCombinations = function(totalItems, itemsToChoose) {
        // Use the property C(n, k) = C(n, n-k) to reduce calculations
        itemsToChoose = Math.min(itemsToChoose, totalItems - itemsToChoose);

        // Guard clauses for edge cases
        if (itemsToChoose < 0) {
            return 0;
        }
        if (itemsToChoose === 0 || totalItems === 0) {
            return 1;
        }
        if (itemsToChoose === 1) {
            return totalItems;
        }

        let intermediateProduct = 1;
        for (let i = 0; i < itemsToChoose; i++) {
            intermediateProduct *= (totalItems - i);
            intermediateProduct /= (i + 1); // Interleave division
        }
        return intermediateProduct;
    };

    // Calculate the final result using combinations for each prime factor
    for (let factorKey in factorCounts) {
        const currentFactorCount = factorCounts[factorKey];
        // The problem is equivalent to distributing 'currentFactorCount' identical items
        // into 'firstNum' distinct bins, which is C(currentFactorCount + firstNum - 1, currentFactorCount)
        const nForCombination = currentFactorCount + firstNum - 1;
        const kForCombination = currentFactorCount; // Or (firstNum - 1), both are mathematically equivalent

        const combinationValue = calculateCombinations(nForCombination, kForCombination);

        finalResult = (finalResult * combinationValue) % MODULO_CONSTANT;
    }

    return finalResult;
}

// The following code handles input/output based on the execution environment.
// It should remain unchanged to preserve the original I/O behavior.
((b,c,d)=>"undefined"!=typeof require?console.log(processInput(require("fs").readFileSync("/dev/stdin","utf8"))):[b=b.split("\n").slice(1,-1).join("\n"),c=function(){try{return processInput(b)}catch(f){return f.stack||f.message}}(),d=typeof c,"string"==d||(c=JSON.stringify(c)),$("<form>").append([[10,b],0,[1,d],0,[10,c]].map(f=>$(f?"<textarea>":"<br>",f&&{rows:f[0],cols:40,text:f[1]}))).appendTo("body")])(`
3 12
`);
