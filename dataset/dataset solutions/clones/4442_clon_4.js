function processData(sourceContent) {
    const inputLines = sourceContent.split('\n');

    const [gridHeight, gridWidth] = inputLines[0].split(' ').map(Number);
    const colorTypeCount = Number(inputLines[1]);
    const typeQuantities = inputLines[2].split(' ').map(Number);

    const flattenedColors = typeQuantities.flatMap((qty, tIdx) =>
        Array.from({ length: qty }, () => tIdx + 1)
    );

    const displayMatrix = Array.from({ length: gridHeight }, (_, rIdx) => {
        return Array.from({ length: gridWidth }, (_, cIdx) => {
            let sequenceLookupIndex;
            if (rIdx % 2 === 0) { // Even-indexed row (0, 2, ...)
                sequenceLookupIndex = rIdx * gridWidth + cIdx;
            } else { // Odd-indexed row (1, 3, ...)
                // Replicating the original's specific indexing for odd rows,
                // which might access elements beyond the flattenedColors array's bounds.
                // Original: d[(i+1)*w-j]
                sequenceLookupIndex = (rIdx + 1) * gridWidth - cIdx;
            }
            return flattenedColors[sequenceLookupIndex];
        });
    });

    const resultText = displayMatrix
        .map(rowElements => rowElements.join(' '))
        .join('\n');

    return resultText;
}

const providedInput = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(processData(providedInput));