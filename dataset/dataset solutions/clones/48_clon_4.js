process.stdin.on("data", (inputBuffer) => {
    const inputLines = String(inputBuffer).trim().split('\n');

    const upperLimit = Number(inputLines[0]);
    const currentPermutation = Array.from({ length: upperLimit + 1 }, (_, index) => index);

    inputLines.slice(2).forEach(instructionLine => {
        const [firstIndexString, secondIndexString] = instructionLine.split(',');
        const firstIdx = Number(firstIndexString);
        const secondIdx = Number(secondIndexString);

        [currentPermutation[firstIdx], currentPermutation[secondIdx]] = [currentPermutation[secondIdx], currentPermutation[firstIdx]];
    });

    const resultElements = currentPermutation.slice(1);
    console.log(resultElements.join('\n'));
}).resume();
