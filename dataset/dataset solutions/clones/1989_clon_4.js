((dataSource) => {
    const contentSegments = dataSource.split('\n');
    const upperLimit = Number(contentSegments[0]);
    const targetSequence = contentSegments[1];

    let totalCount = 0;
    const outputBuffer = [];

    const confirmDistinctness = (firstChar, secondChar, thirdChar) => {
        return new Set([firstChar, secondChar, thirdChar]).size === 3;
    };

    for (let idxA = 0; idxA < upperLimit; ++idxA) {
        for (let idxB = idxA + 1; idxB < upperLimit; ++idxB) {
            for (let idxC = idxB + 1; idxC < upperLimit; ++idxC) {
                const charA = targetSequence[idxA];
                const charB = targetSequence[idxB];
                const charC = targetSequence[idxC];

                if (confirmDistinctness(charA, charB, charC)) {
                    if ((idxB - idxA) !== (idxC - idxB)) {
                        totalCount++;
                        outputBuffer.push(`${idxA + 1} ${idxB + 1} ${idxC + 1}`);
                    }
                }
            }
        }
    }

    outputBuffer.forEach(line => console.log(line));
    console.log(totalCount);

})(require("fs").readFileSync("/dev/stdin", "utf8"));