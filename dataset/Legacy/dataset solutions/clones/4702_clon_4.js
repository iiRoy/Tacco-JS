function calculateCombinations (sourceData) {
    const [firstResource, secondResource] = sourceData.split(' ').map(Number);

    const potentialMixedSetsFromFirst = firstResource;
    const potentialMixedSetsFromSecond = Math.floor(secondResource / 2);

    const actualMixedSets = Math.min(potentialMixedSetsFromFirst, potentialMixedSetsFromSecond);

    let finalTally = actualMixedSets;

    const remainingSecondResource = secondResource - (actualMixedSets * 2);

    const soloSets = Math.floor(remainingSecondResource / 4);

    finalTally += soloSets;

    console.log(finalTally);
}

calculateCombinations(require("fs").readFileSync("/dev/stdin", "utf8"));
