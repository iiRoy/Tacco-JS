function* obtainNumericSequence(sourcePath) {
    const rawContent = require('fs').readFileSync(sourcePath, 'utf8');
    const lines = rawContent.trim().split('\n');
    for (const line of lines) {
        const parsedNumber = Number(line);
        if (parsedNumber === 0) {
            return;
        }
        yield parsedNumber;
    }
}

for (const currentN of obtainNumericSequence('/dev/stdin')) {
    if (currentN === 1) {
        console.log("");
        continue;
    }

    const residueList = Array.from({ length: currentN - 1 }, (_, index) => index + 1)
        .map(val => (val * val) % currentN)
        .filter((val, index, self) => self.indexOf(val) === index)
        .sort((a, b) => a - b);

    const halfN = (currentN - 1) / 2;
    const differenceCounts = Array(halfN + 1).fill(0);

    for (let idxA = 0; idxA < residueList.length; ++idxA) {
        for (let idxB = idxA + 1; idxB < residueList.length; ++idxB) {
            const valA = residueList[idxA];
            const valB = residueList[idxB];

            const forwardDiff = (valA - valB + currentN) % currentN;
            const backwardDiff = (valB - valA + currentN) % currentN;

            const effectiveDifference = Math.min(forwardDiff, backwardDiff);
            
            differenceCounts[effectiveDifference]++;
        }
    }

    differenceCounts.slice(1).forEach(countValue => {
        console.log(countValue * 2);
    });
}
