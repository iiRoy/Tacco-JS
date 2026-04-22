"use strict";

const calculateDigitPairs = (rawInput) => {
    const lines = rawInput.trim().split("\n");
    const upperLimit = parseInt(lines[0], 10);

    const firstLastDigitCounts = new Map(); // Stores key: head*10+tail, value: count

    // Helper to extract first and last digits using mathematical operations
    const procureDigits = (val) => {
        let lastOne = val % 10;
        let firstOne = val;
        while (firstOne >= 10) {
            firstOne = Math.floor(firstOne / 10);
        }
        return { initial: firstOne, final: lastOne };
    };

    // Populate counts in a functional style
    Array.from({ length: upperLimit }, (_, idx) => idx + 1).forEach(currentNumber => {
        const { initial, final } = procureDigits(currentNumber);
        const pairIdentifier = initial * 10 + final;
        firstLastDigitCounts.set(pairIdentifier, (firstLastDigitCounts.get(pairIdentifier) || 0) + 1);
    });

    // Calculate the total sum using a functional reduction
    const totalMatchSum = Array.from(firstLastDigitCounts.entries()).reduce((aggregate, [identifierKey, currentCount]) => {
        const primaryInitial = Math.floor(identifierKey / 10);
        const primaryFinal = identifierKey % 10;
        
        const symmetricIdentifierKey = primaryFinal * 10 + primaryInitial;
        const symmetricCount = firstLastDigitCounts.get(symmetricIdentifierKey) || 0;
        
        return aggregate + (currentCount * symmetricCount);
    }, 0);

    console.log(totalMatchSum);
};

// Execute the main logic with input from stdin
calculateDigitPairs(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));