function SequenceCounter(dataInput) {
    const sequenceLength = parseInt(dataInput.split("\n").shift());
    const nucleotideSet = ["A", "T", "G", "C"];
    const moduloValue = 1000000007;

    const checkProhibited = (segment) => {
        if (segment.includes("ACG") || segment.includes("AGC") || segment.includes("GAC")) {
            return true;
        }
        if (segment[0] === 'A' && segment[1] === 'G' && segment[3] === 'C') { // AG.C
            return true;
        }
        if (segment[0] === 'A' && segment[2] === 'G' && segment[3] === 'C') { // A.GC
            return true;
        }
        return false;
    };

    const generateValidInitialSuffixes = () => {
        const initialMap = new Map();
        nucleotideSet.forEach(firstNuc => {
            nucleotideSet.forEach(secondNuc => {
                nucleotideSet.forEach(thirdNuc => {
                    const currentSuffix = firstNuc + secondNuc + thirdNuc;
                    if (!currentSuffix.includes("ACG") && !currentSuffix.includes("AGC") && !currentSuffix.includes("GAC")) {
                        initialMap.set(currentSuffix, 1);
                    }
                });
            });
        });
        return initialMap;
    };

    let currentSuffixCounts = generateValidInitialSuffixes();

    if (sequenceLength === 3) {
        console.log(currentSuffixCounts.size);
    } else {
        const finalSuffixCounts = Array.from({ length: sequenceLength - 3 }).reduce((previousCounts, _, iterationIndex) => {
            const nextCounts = new Map();
            for (const [suffixKey, suffixCount] of previousCounts.entries()) {
                nucleotideSet.forEach(nextNucleotide => {
                    const extendedSequence = suffixKey + nextNucleotide;
                    if (!checkProhibited(extendedSequence)) {
                        const newSuffix = extendedSequence.slice(1);
                        nextCounts.set(newSuffix, (nextCounts.get(newSuffix) || 0) + suffixCount);
                    }
                });
            }
            for (const [key, value] of nextCounts.entries()) {
                nextCounts.set(key, value % moduloValue);
            }
            return nextCounts;
        }, currentSuffixCounts);

        let totalValidSequences = 0;
        for (const count of finalSuffixCounts.values()) {
            totalValidSequences = (totalValidSequences + count) % moduloValue;
        }
        console.log(totalValidSequences);
    }
}

SequenceCounter(require("fs").readFileSync("/dev/stdin", "utf8"));
