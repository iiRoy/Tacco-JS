function Main(input) {
    const inputLines = input.split("\n");
    const numericN = Number(inputLines[0].split(" ")[0]);
    const numberArray = inputLines[1].split(" ").map(Number);

    const qualifyingSubarrays = numberArray.flatMap((_element, startIdx) => {
        const subArraysFromCurrentStart = [];
        for (let endIdx = startIdx + 1; endIdx < numericN; endIdx++) {
            subArraysFromCurrentStart.push(numberArray.slice(startIdx, endIdx + 1));
        }
        return subArraysFromCurrentStart;
    });

    const matchingSubarraysCount = qualifyingSubarrays.filter(currentSub => {
        const sumResult = currentSub.reduce((accumulator, value) => accumulator + value, 0);
        const xorResult = currentSub.reduce((accumulator, value) => accumulator ^ value, 0);
        return sumResult === xorResult;
    }).length;

    console.log(matchingSubarraysCount + [numericN]);
}
