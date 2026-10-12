function processInputData(sourceText) {
    const inputLines = sourceText.trim().split('\n');

    const numbersForLookup = inputLines[1].split(' ').map(Number);
    const iterationLimit = Number(inputLines[2]);
    const numbersForComparison = inputLines[3].split(' ').map(Number);

    const existenceRegistry = new Map();
    numbersForLookup.forEach(val => existenceRegistry.set(val, true));

    const totalMatches = numbersForComparison
        .slice(0, iterationLimit)
        .reduce((currentCount, item) => {
            return currentCount + (existenceRegistry.has(item) ? 1 : 0);
        }, 0);

    console.log(totalMatches);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
