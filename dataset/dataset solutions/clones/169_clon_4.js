function scanGenomeForRepetitions(genome) {
    if (genome.length < 10) {
        return [];
    }

    const nucleotideCode = {
        A: 0,
        C: 1,
        G: 2,
        T: 3
    };

    const twentyBitMask = (1 << 20) - 1;
    const frequencies = new Map();
    const duplicatedSequences = [];
    let encodedWindow = 0;

    for (let position = 0; position < genome.length; position++) {
        encodedWindow =
            ((encodedWindow << 2) | nucleotideCode[genome[position]]) &
            twentyBitMask;

        if (position < 9) {
            continue;
        }

        const count = (frequencies.get(encodedWindow) || 0) + 1;
        frequencies.set(encodedWindow, count);

        if (count === 2) {
            duplicatedSequences.push(
                genome.slice(position - 9, position + 1)
            );
        }
    }

    return duplicatedSequences;
}

const genome = "AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT";
console.log(scanGenomeForRepetitions(genome));