function SequenceCounter(entryData) {
    'use strict';
    const sequenceLength = parseInt(entryData.split("\n").shift());
    const nucleotideSet = ["A", "T", "G", "C"];
    const moduloValue = 1000000007;

    const charMap = { 'A': 0, 'T': 1, 'G': 2, 'C': 3 };
    const intToChar = ['A', 'T', 'G', 'C'];

    // Utility to convert a 3-character string to a unique integer index (0-63)
    const tripletToNumericalKey = (segment) => {
        return charMap[segment[0]] * 16 + charMap[segment[1]] * 4 + charMap[segment[2]];
    };

    // Utility to convert an integer index back to a 3-character string
    const numericalKeyToTriplet = (numericalKey) => {
        const charA = intToChar[Math.floor(numericalKey / 16)];
        const charB = intToChar[Math.floor((numericalKey % 16) / 4)];
        const charC = intToChar[numericalKey % 4];
        return charA + charB + charC;
    };

    // Checks if a 3-character sequence contains any primary forbidden patterns
    const hasForbiddenTripletSubsequence = (c1, c2, c3) => {
        // Equivalent to checking !str.match(/ACG|AGC|GAC/)
        return (
            (c1 === 'A' && c2 === 'C' && c3 === 'G') || // ACG
            (c1 === 'A' && c2 === 'G' && c3 === 'C') || // AGC
            (c1 === 'G' && c2 === 'A' && c3 === 'C')    // GAC
        );
    };

    // Checks if a 4-character sequence contains any forbidden patterns
    const hasForbiddenQuadrupletSubsequence = (c0, c1, c2, c3) => {
        // Checks for patterns in the 4-char string s0s1s2s3
        // s0s1s2 patterns
        if (hasForbiddenTripletSubsequence(c0, c1, c2)) return true;
        // s1s2s3 patterns
        if (hasForbiddenTripletSubsequence(c1, c2, c3)) return true;

        // Specific 4-char patterns: AG.C (A followed by G, any char, then C)
        if (c0 === 'A' && c1 === 'G' && c3 === 'C') return true;
        // Specific 4-char patterns: A.GC (A, any char, then G, then C)
        if (c0 === 'A' && c2 === 'G' && c3 === 'C') return true;

        return false;
    };

    // Initialize dynamic programming table for sequences of length 3
    let currentPermutationCounts = new Array(64).fill(0); // 4^3 = 64 possible 3-char sequences

    // Populate initial counts for valid 3-character sequences
    for (let idxA = 0; idxA < 4; idxA++) {
        for (let idxB = 0; idxB < 4; idxB++) {
            for (let idxC = 0; idxC < 4; idxC++) {
                const charA = intToChar[idxA];
                const charB = intToChar[idxB];
                const charC = intToChar[idxC];
                if (!hasForbiddenTripletSubsequence(charA, charB, charC)) {
                    const tripletKey = tripletToNumericalKey(charA + charB + charC);
                    currentPermutationCounts[tripletKey] = 1;
                }
            }
        }
    }

    if (sequenceLength === 3) {
        let totalSum = 0;
        for (let i = 0; i < 64; i++) {
            totalSum = (totalSum + currentPermutationCounts[i]) % moduloValue;
        }
        console.log(totalSum);
        return;
    }

    // Iterate to build up counts for longer sequences
    for (let currentLen = 4; currentLen <= sequenceLength; currentLen++) {
        let nextPermutationCounts = new Array(64).fill(0);

        for (let previousKey = 0; previousKey < 64; previousKey++) {
            const currentCount = currentPermutationCounts[previousKey];
            if (currentCount === 0) continue;

            const previousTriplet = numericalKeyToTriplet(previousKey); // e.g., "TGC"
            const charPrev1 = previousTriplet[0]; // First char of the previous triplet
            const charPrev2 = previousTriplet[1]; // Second char of the previous triplet
            const charPrev3 = previousTriplet[2]; // Third char of the previous triplet

            for (let nextCharIndex = 0; nextCharIndex < 4; nextCharIndex++) {
                const nextChar = intToChar[nextCharIndex]; // The new character to append

                // The 4-character sequence to check for validity is formed by the previous triplet
                // and the new character: charPrev1 + charPrev2 + charPrev3 + nextChar
                if (!hasForbiddenQuadrupletSubsequence(charPrev1, charPrev2, charPrev3, nextChar)) {
                    // If valid, the new 3-character suffix for the next state is charPrev2 + charPrev3 + nextChar
                    const newSuffixTriplet = charPrev2 + charPrev3 + nextChar;
                    const newSuffixKey = tripletToNumericalKey(newSuffixTriplet);
                    nextPermutationCounts[newSuffixKey] = (nextPermutationCounts[newSuffixKey] + currentCount) % moduloValue;
                }
            }
        }
        currentPermutationCounts = nextPermutationCounts;
    }

    let finalTotalValidSequences = 0;
    for (let i = 0; i < 64; i++) {
        finalTotalValidSequences = (finalTotalValidSequences + currentPermutationCounts[i]) % moduloValue;
    }
    console.log(finalTotalValidSequences);
}
SequenceCounter(require("fs").readFileSync("/dev/stdin", "utf8"));