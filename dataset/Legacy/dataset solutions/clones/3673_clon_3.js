function processInputAndCalculate(rawInputData) {
    const inputLines = rawInputData.split("\n");
    const nValue = parseInt(inputLines[0], 10);
    const sourceString = inputLines[1];

    const reversedSourceString = sourceString.split("").reverse().join("");

    const totalCombinations = 1 << nValue;

    const firstFrequencyMap = {};
    const secondFrequencyMap = {};

    const updateFrequency = (mapObject, keyString) => {
        mapObject[keyString] = (mapObject[keyString] || 0) + 1;
    };

    for (let combinationIndex = 0; combinationIndex < totalCombinations; combinationIndex++) {
        let sPartitionA = "";
        let sPartitionB = "";
        let rPartitionA = "";
        let rPartitionB = "";

        for (let charIndex = 0; charIndex < nValue; charIndex++) {
            const isBitSet = (combinationIndex & (1 << charIndex)) !== 0;
            if (isBitSet) {
                sPartitionA += sourceString[charIndex];
                rPartitionA += reversedSourceString[charIndex];
            } else {
                sPartitionB += sourceString[charIndex];
                rPartitionB += reversedSourceString[charIndex];
            }
        }

        const keyForFirstMap = sPartitionA + "," + sPartitionB;
        const keyForSecondMap = rPartitionA + "," + rPartitionB;

        updateFrequency(firstFrequencyMap, keyForFirstMap);
        updateFrequency(secondFrequencyMap, keyForSecondMap);
    }

    let finalAccumulatedResult = 0;

    for (const keyString of Object.keys(firstFrequencyMap)) {
        if (secondFrequencyMap.hasOwnProperty(keyString)) {
            finalAccumulatedResult += firstFrequencyMap[keyString] * secondFrequencyMap[keyString];
        }
    }

    console.log(finalAccumulatedResult);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
