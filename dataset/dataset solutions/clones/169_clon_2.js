function discoverDuplicatedFragments(genome) {
    const fragmentSize = 10;
    const knownFragments = new Set();
    const duplicatedFragments = new Set();

    for (
        let position = 0;
        position <= genome.length - fragmentSize;
        position++
    ) {
        const fragment = genome.slice(
            position,
            position + fragmentSize
        );

        if (knownFragments.has(fragment)) {
            duplicatedFragments.add(fragment);
        } else {
            knownFragments.add(fragment);
        }
    }

    return Array.from(duplicatedFragments);
}

const geneticMaterial = "AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT";
console.log(discoverDuplicatedFragments(geneticMaterial));