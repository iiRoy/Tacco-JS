const processInputData = (rawData => {
    "use strict";

    const calculateCombinationsOfTwo = (n) => {
        if (n < 2) {
            return 0;
        }
        return n * (n - 1) / 2;
    };

    const inputLines = rawData.split("\n");
    const tokenList = inputLines[1].split(" ");
    
    const tokenFrequencies = new Map();
    for (const currentToken of tokenList) {
        tokenFrequencies.set(currentToken, (tokenFrequencies.get(currentToken) || 0) + 1);
    }

    let totalIdenticalPairs = 0;
    for (const frequency of tokenFrequencies.values()) {
        totalIdenticalPairs += calculateCombinationsOfTwo(frequency);
    }

    for (let currentIndex = 0; currentIndex < tokenList.length; currentIndex++) {
        const targetToken = tokenList[currentIndex];
        const targetTokenFrequency = tokenFrequencies.get(targetToken);

        const resultForCurrentToken = totalIdenticalPairs - (targetTokenFrequency - 1);
        console.log(resultForCurrentToken);
    }
});

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
