function Main(rawInput) {
    const rawInputLines = rawInput.split("\n");
    const arrayLength = Number(rawInputLines[0]);

    const sortedA = rawInputLines[1].split(" ").map(Number).sort((val1, val2) => val1 - val2);
    const sortedB = rawInputLines[2].split(" ").map(Number).sort((val1, val2) => val1 - val2);
    const sortedC = rawInputLines[3].split(" ").map(Number).sort((val1, val2) => val1 - val2);

    let totalTriplets = 0;
    let aPointer = 0;
    let cPointer = 0;

    for (let bIdx = 0; bIdx < arrayLength; bIdx++) {
        const currentBValue = sortedB[bIdx];

        while (aPointer < arrayLength && sortedA[aPointer] < currentBValue) {
            aPointer++;
        }
        const countSmallerA = aPointer;

        while (cPointer < arrayLength && sortedC[cPointer] <= currentBValue) {
            cPointer++;
        }
        const countGreaterC = arrayLength - cPointer;

        totalTriplets += countSmallerA * countGreaterC;
    }

    console.log('%s', totalTriplets);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
