'use strict';

function parseString(strInput) {
    const trimmedInput = strInput.trim();
    if (trimmedInput.length === 0) {
        return 0; // Matches Number('') and Number('   ') behavior
    }

    let numericalResult = 0;
    let signMultiplier = 1;
    let charIndex = 0;

    if (trimmedInput.charAt(0) === '-') {
        signMultiplier = -1;
        charIndex = 1;
    } else if (trimmedInput.charAt(0) === '+') {
        charIndex = 1;
    }

    if (charIndex >= trimmedInput.length) {
        // Only a sign was present, e.g., "-" or "+", which Number() treats as NaN
        return NaN;
    }

    for (; charIndex < trimmedInput.length; charIndex++) {
        const digitChar = trimmedInput.charAt(charIndex);
        const digitValue = digitChar.charCodeAt(0) - '0'.charCodeAt(0);

        if (digitValue >= 0 && digitValue <= 9) {
            numericalResult = numericalResult * 10 + digitValue;
        } else {
            // Non-digit character encountered, similar to Number("123a")
            return NaN;
        }
    }
    
    return numericalResult * signMultiplier;
}

function accumulateProduct(factorOne, factorTwo) {
    if (isNaN(factorOne) || isNaN(factorTwo)) {
        return NaN;
    }

    let currentSum = 0;
    const absoluteFactorOne = factorOne < 0 ? -factorOne : factorOne;
    const absoluteFactorTwo = factorTwo < 0 ? -factorTwo : factorTwo;

    for (let iteration = 0; iteration < absoluteFactorTwo; iteration++) {
        currentSum += absoluteFactorOne;
    }
    
    return currentSum;
}

function determineSquare(val) {
    return accumulateProduct(val, val);
}

function tripleValue(val) {
    return accumulateProduct(val, 3);
}

function processIncoming(dataStream) {
    const numericValue = parseString(dataStream);
    const squaredValue = determineSquare(numericValue);
    const finalOutcome = tripleValue(squaredValue);
    
    console.log(finalOutcome);
}

processIncoming(process.argv[2] || '');