const calculateTopKScores = (sourceText) => {
    const lineSegments = sourceText.split("\n");
    const [_, limitQuantity] = lineSegments[0].split(" ").map(Number);
    
    const numericalElements = lineSegments[1]
        .split(" ")
        .map(Number);

    const orderedSubset = numericalElements
        .sort((elementA, elementB) => elementB - elementA)
        .slice(0, limitQuantity);

    const accumulatedResult = orderedSubset.reduce((currentTotal, valueItem) => currentTotal + valueItem, 0);

    console.log(accumulatedResult);
};

calculateTopKScores(require("fs").readFileSync("/dev/stdin", "utf8"));
