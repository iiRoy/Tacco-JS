const basePairComplements = new Map([
    ['A', 'T'],
    ['C', 'G'],
    ['G', 'C'],
    ['T', 'A']
]);

function determineComplement(sourceSequence) {
    const primaryBase = sourceSequence[0];
    const complementaryBase = basePairComplements.get(primaryBase);

    if (complementaryBase !== undefined) {
        console.log(complementaryBase);
    }
}

determineComplement(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
