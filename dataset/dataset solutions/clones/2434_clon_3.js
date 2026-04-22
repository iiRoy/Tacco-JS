function executeProgram(programInput) {
    // Extensive reformatting and renaming of identifiers
    // New: Input validation for non-empty input
    if (!programInput || programInput.trim().length === 0) {
        console.log(0);
        return;
    }

    // Rewrite: Input parsing with arrow functions and explicit number conversion
    const processedLines = programInput.trim().split('\n');
    const coordinateData = processedLines[0].split(' ').map(Number);
    
    // Rename constants
    const PRIME_MODULUS = 1000000007; // A large prime number for modular arithmetic
    const MOD_SPLIT_FACTOR = 100000;  // Helper for efficient modular multiplication

    // Rename variables
    const initialCoordX = coordinateData[0];
    const initialCoordY = coordinateData[1];
    let finalCombinationCount = 0;

    // New: Input validation for non-negative coordinates
    if (initialCoordX < 0 || initialCoordY < 0) {
        console.log(0);
        return;
    }

    // Update/Rewrite: Calculate total steps and step types
    // The problem describes a path where each step is either (1,2) or (2,1).
    // Let 'a' be the number of (1,2) steps and 'b' be the number of (2,1) steps.
    // Then:
    // X = 1*a + 2*b
    // Y = 2*a + 1*b
    //
    // Solving for 'a' and 'b':
    // 2X = 2a + 4b
    // Y  = 2a +  b
    // (2X - Y) = 3b  => b = (2X - Y) / 3
    //
    // X  =  a + 2b
    // 2Y = 4a + 2b
    // (X - 2Y) = -3a => a = (2Y - X) / 3
    //
    // Total steps N = a + b = (2Y - X)/3 + (2X - Y)/3 = (X + Y) / 3
    //
    // The original code used a different system:
    // n = (X + Y) / 3   (Total steps)
    // r = (4*X - 2*Y) / 6 = (2X - Y) / 3 (This is 'b' from my derivation above)
    // r2 = (4*Y - 2*X) / 6 = (2Y - X) / 3 (This is 'a' from my derivation above)
    // So 'r' is count of (2,1) steps, 'r2' is count of (1,2) steps.
    // The calculation for 'n' is the total number of steps.
    
    // New: Intermediate variables for clarity
    const sumOfCoordinates = initialCoordX + initialCoordY;

    // New: Early exit if sum of coordinates is not divisible by 3, implying non-integer total steps
    if (sumOfCoordinates % 3 !== 0) {
        console.log(0);
        return;
    }
    
    const totalPathLength = sumOfCoordinates / 3;

    // Calculate count of each step type
    const typeATempNumerator = (2 * initialCoordY - initialCoordX); // Represents (1,2) steps
    const typeBTempNumerator = (2 * initialCoordX - initialCoordY); // Represents (2,1) steps

    // New: Early exit if numerators are not divisible by 3, implying non-integer step counts
    if (typeATempNumerator % 3 !== 0 || typeBTempNumerator % 3 !== 0) {
        console.log(0);
        return;
    }

    const countOfStepTypeA = typeATempNumerator / 3; // Number of (1,2) steps
    const countOfStepTypeB = typeBTempNumerator / 3; // Number of (2,1) steps

    // Check validity of step counts (non-negative)
    if (countOfStepTypeA >= 0 && countOfStepTypeB >= 0) {
        // New: Explicitly check if the total path length is an integer.
        // This is implicitly covered by sumOfCoordinates % 3, but added for robustness.
        if (Number.isInteger(totalPathLength)) {
            // Updated call to binomial coefficient function
            finalCombinationCount = computeSingleBinomialCoefficientMod(
                totalPathLength,
                countOfStepTypeA,
                PRIME_MODULUS,
                MOD_SPLIT_FACTOR
            );
        }
    }
    
    console.log(finalCombinationCount);
}

// Renamed function for modular multiplication
function safeModProduct(operand1, operand2, modulusValue, splitDivisor) {
    // Calculates (operand1 * operand2) % modulusValue efficiently,
    // preventing overflow if operand1 * operand2 is very large.
    // It splits operand2 into (quotient * splitDivisor + remainder).

    let quotientPart = (operand2 / splitDivisor) | 0; // Integer division
    let remainderPart = operand2 - (quotientPart * splitDivisor);
    
    // Perform multiplication in parts and apply modulo
    // (a * (q * C2 + r)) % C = ((a * q % C) * C2 % C + (a * r % C)) % C
    let result = (operand1 * quotientPart % modulusValue) * splitDivisor % modulusValue;
    result = (result + (operand1 * remainderPart)) % modulusValue;
    
    return result;
}

// Renamed and refactored function for binomial coefficient (nCk) modulo a prime
function computeSingleBinomialCoefficientMod(upperBound, chosenSubset, primeDivisor, splitFactor) {
    // Original function returned an array for multiple results; this version
    // is simplified to return a single nCk value as per usage in Main.
    // Deleted unused 'MAX' parameter.

    // Guard clauses for invalid inputs
    if (upperBound < chosenSubset || chosenSubset < 0 || upperBound < 0) {
        return 0;
    }

    // Precomputation of factorials, inverse factorials, and modular inverses
    // Renamed arrays and variables
    const factorialsCache = [1, 1];
    const inverseFactorialsCache = [1, 1];
    const modularInversesCache = [0, 1];

    // The loop now goes up to 'upperBound' to precompute necessary values.
    // Original: `for (var i = 2; i < MAX + n; i++)`
    // With MAX=1 and n as upperBound, it was `i < 1 + upperBound`. This means up to `upperBound`.
    // Updated to `i <= upperBound` for clarity and correctness.
    for (let i = 2; i <= upperBound; i++) {
        // Calculate factorial: fac[i] = fac[i-1] * i % primeDivisor
        factorialsCache.push(safeModProduct(factorialsCache[i - 1], i, primeDivisor, splitFactor));
        
        // Calculate modular inverse: inv[i] = MOD - (MOD/i) * inv[MOD%i] % MOD
        // This uses Fermat's Little Theorem for prime moduli.
        // inv[i] = primeDivisor - safeModProduct(modularInversesCache[primeDivisor % i], (primeDivisor / i | 0), primeDivisor, splitFactor);
        modularInversesCache.push(primeDivisor - safeModProduct(modularInversesCache[primeDivisor % i], Math.floor(primeDivisor / i), primeDivisor, splitFactor));
        
        // Calculate inverse factorial: finv[i] = finv[i-1] * inv[i] % primeDivisor
        inverseFactorialsCache.push(safeModProduct(inverseFactorialsCache[i - 1], modularInversesCache[i], primeDivisor, splitFactor));
    }

    // Calculate nCk = n! * (k!)^-1 * ((n-k)!)^-1 (mod P)
    // nCk = factorialsCache[upperBound] * inverseFactorialsCache[chosenSubset] * inverseFactorialsCache[upperBound - chosenSubset] (mod P)
    let resultPart1 = safeModProduct(factorialsCache[upperBound], inverseFactorialsCache[chosenSubset], primeDivisor, splitFactor);
    let finalCoefficient = safeModProduct(resultPart1, inverseFactorialsCache[upperBound - chosenSubset], primeDivisor, splitFactor);
    
    return finalCoefficient;
}

// Execute the program with input from standard input
executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));