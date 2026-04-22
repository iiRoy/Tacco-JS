const obtainValue = () => {
    return parseInt(require("fs").readFileSync("/dev/stdin", "utf8").trim());
};

const nucleotideMap = { 'A': 0, 'T': 1, 'G': 2, 'C': 3 };
const numericBases = [0, 1, 2, 3];

const resultDivisor = 1000000007;

const checkViolation = (pos0, pos1, pos2, pos3) => {
    // Equivalent to: .AGC, AG.C, A.GC, .GAC, .ACG
    // Where . is any char, and A=0, T=1, G=2, C=3
    const A = nucleotideMap['A'];
    const G = nucleotideMap['G'];
    const C = nucleotideMap['C'];

    return (pos1 === A && pos2 === G && pos3 === C) || // XAGC
           (pos0 === A && pos1 === G && pos3 === C) || // AGXC
           (pos0 === A && pos2 === G && pos3 === C) || // AXGC
           (pos1 === G && pos2 === A && pos3 === C) || // XGAC
           (pos1 === A && pos2 === C && pos3 === G);   // XACG
};

const calculateSequenceVariants = () => {
    const targetLength = obtainValue();

    // `way_counts[length][suffix_key]` stores the number of valid sequences
    // `suffix_key` is an integer representing the last 3 nucleotides (0-63)
    const way_counts = Array(targetLength + 1).fill(null).map(() => Array(64).fill(0));

    // Initial condition: A sequence of length 0 has one way to "end" with a dummy 'TTT' context.
    // 'TTT' (1,1,1) -> 1*16 + 1*4 + 1 = 21
    const initialContextKey = nucleotideMap['T'] * 16 + nucleotideMap['T'] * 4 + nucleotideMap['T'];
    way_counts[0][initialContextKey] = 1;

    // Iterate for each sequence length
    for (let currentLength = 1; currentLength <= targetLength; ++currentLength) {
        // Iterate through all possible 3-nucleotide contexts from the previous length
        for (let priorContextKey = 0; priorContextKey < 64; ++priorContextKey) {
            // If no paths led to this prior context, skip
            if (way_counts[currentLength - 1][priorContextKey] === 0) {
                continue;
            }

            // Deconstruct the prior 3-nucleotide context (n0 n1 n2)
            const priorN0 = (priorContextKey >> 4) & 0b11; // Most significant nucleotide
            const priorN1 = (priorContextKey >> 2) & 0b11; // Middle nucleotide
            const priorN2 = priorContextKey & 0b11;       // Least significant nucleotide

            // Iterate through all possible next nucleotides to append
            for (const nextN of numericBases) {
                // Check if adding `nextN` to the `priorN0 priorN1 priorN2` context creates a forbidden 4-nucleotide sequence
                if (checkViolation(priorN0, priorN1, priorN2, nextN)) {
                    continue; // Skip this forbidden path
                }

                // Construct the new 3-nucleotide context (n1 n2 nextN)
                const newContextKey = priorN1 * 16 + priorN2 * 4 + nextN;

                // Accumulate the count for the current state
                way_counts[currentLength][newContextKey] =
                    (way_counts[currentLength][newContextKey] +
                     way_counts[currentLength - 1][priorContextKey]) % resultDivisor;
            }
        }
    }

    // Sum all counts for the final target length
    let finalSum = 0;
    for (let finalContextKey = 0; finalContextKey < 64; ++finalContextKey) {
        finalSum = (finalSum + way_counts[targetLength][finalContextKey]) % resultDivisor;
    }

    console.log(finalSum);
};

calculateSequenceVariants();