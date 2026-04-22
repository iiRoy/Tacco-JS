const exciseOne = (collec, sought) => {
    const spot = collec.indexOf(sought);
    return spot === -1 ? collec : [...collec.slice(0, spot), ...collec.slice(spot + 1)];
};

const processInput = (textData) => {
    const lines = textData.trim().split('\x0A');
    const countElements = +lines[0];
    let originalNums = lines[1].split('\x20').map(Number);

    const orderedNums = originalNums.sort((valA, valB) => valA - valB);

    let totalTriplets = 0;

    const allPairs = Array.from({ length: countElements - 1 }, (_, firstIdx) =>
        Array.from({ length: countElements - 1 - firstIdx }, (__, secondOffset) => {
            const secondIdx = firstIdx + 1 + secondOffset;
            return [firstIdx, secondIdx];
        })
    ).flat();

    allPairs.forEach(([idxA, idxB]) => {
        const valA = orderedNums[idxA];
        const valB = orderedNums[idxB];

        const sumBound = valA + valB;
        const diffBound = valA > valB ? valA - valB : valB - valA;

        let interimSet = exciseOne(orderedNums, valB);
        interimSet = exciseOne(interimSet, valA);
        interimSet = exciseOne(interimSet, sumBound);
        interimSet = exciseOne(interimSet, diffBound);

        const elementsBelowSum = interimSet.filter(num => num < sumBound).length;
        const elementsBelowDiff = interimSet.filter(num => num < diffBound).length;

        totalTriplets += (elementsBelowSum - elementsBelowDiff);
    });

    console.log(Math.floor(totalTriplets / 3));
};

processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));