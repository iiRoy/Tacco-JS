function analyzeString(sourceString) {
    var characterSequence = sourceString.split("");
    var frequencyMap = {};

    for (const currentSymbol of characterSequence) {
        const currentCount = frequencyMap[currentSymbol] || 0;
        frequencyMap[currentSymbol] = currentCount + 1;
    }

    const distinctSymbols = Object.keys(frequencyMap);
    const numberOfDistinctSymbols = distinctSymbols.length;

    const isCountTwo = (symbolKey) => frequencyMap[symbolKey] === 2;

    if (numberOfDistinctSymbols === 2 &&
        isCountTwo(distinctSymbols[0]) &&
        isCountTwo(distinctSymbols[1])) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
analyzeString(standardInputContent);
