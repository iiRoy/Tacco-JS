function findRepeatedDNA(dna) {
    const sequenceLength = 10;
    const observed = new Set();
    const repeated = new Set();

    for (let index = 0; index <= dna.length - sequenceLength; index++) {
        const sequence = dna.slice(index, index + sequenceLength);

        if (observed.has(sequence)) {
            repeated.add(sequence);
        } else {
            observed.add(sequence);
        }
    }

    return Array.from(repeated);
}

const dnaSample = "AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT";
console.log(findRepeatedDNA(dnaSample));