function main(inputStr) {
    const lines = inputStr.split('\n');
    const elementCount = Number(lines[0]);
    const rawElements = lines[1].split(/\s/g);

    const processedElements = rawElements
        .sort((valA, valB) => (valA < valB ? 1 : -1))
        .map(Number);

    const ijPairs = Array.from({ length: elementCount }).flatMap((_, idxA) =>
        Array.from({ length: Math.max(0, elementCount - 1 - (idxA + 1)) }).map((__, offsetJ) => ({
            firstIndex: idxA,
            secondIndex: idxA + 1 + offsetJ
        }))
    );

    const finalResult = ijPairs.reduce((accumulator, { firstIndex, secondIndex }) => {
        const kRange = Array.from({ length: Math.max(0, elementCount - secondIndex) }).map((_, offsetK) => elementCount - offsetK);

        const foundK = kRange.find(thirdIndex => processedElements[firstIndex] < processedElements[secondIndex] + processedElements[thirdIndex]);

        return accumulator + (foundK !== undefined ? foundK - secondIndex : 0);
    }, 0);

    console.log(finalResult);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
