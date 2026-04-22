const processTextSegment = (dataSource) => {
    const characters = [...dataSource];
    
    const outcomeAccumulator = characters.reduce((currentResult, charItem, charIndex, charArray) => {
        if (charIndex === 0) {
            currentResult.initial = charItem;
        }
        if (charIndex === charArray.length - 1) {
            currentResult.final = charItem;
        }
        if (charArray.length > 2 && charIndex > 0 && charIndex < charArray.length - 1) {
            currentResult.centralCount++;
        }
        return currentResult;
    }, { initial: undefined, final: undefined, centralCount: 0 });

    const ultimateInitial = outcomeAccumulator.initial;
    const ultimateFinal = outcomeAccumulator.final;
    const ultimateCentralCount = outcomeAccumulator.centralCount;

    console.log(
        (ultimateInitial === undefined ? "undefined" : ultimateInitial) +
        ultimateCentralCount +
        (ultimateFinal === undefined ? "undefined" : ultimateFinal)
    );
};

const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
processTextSegment(sourceData);