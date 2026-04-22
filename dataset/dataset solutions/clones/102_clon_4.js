const segmentSourceInput = (entireText) => entireText.split(/\n/).filter(line => line.trim().length > 0);

const groupInputIntoSequencePairs = (individualLines) => {
    return individualLines.reduce((accumulatedPairs, currentLine, index, array) => {
        if (index % 2 === 0) {
            if (array[index + 1]) {
                accumulatedPairs.push([currentLine, array[index + 1]]);
            }
        }
        return accumulatedPairs;
    }, []);
};

const decomposeLineIntoItems = (lineString) => lineString.trim().split(/\s/);

const computeMatchStatistics = (firstCode, secondCode) => {
    const hitsCount = firstCode.filter((item, position) => item === secondCode[position]).length;

    const nonHitItemsInFirst = firstCode.filter((item, position) => item !== secondCode[position]);

    const blowCount = nonHitItemsInFirst.reduce((totalBlows, currentItem) => {
        const occurrencesInSecondCode = secondCode.filter(val => val === currentItem).length;
        return totalBlows + occurrencesInSecondCode;
    }, 0);

    return { hits: hitsCount, blows: blowCount };
};

const processAllInput = (fullInputText) => {
    const rawLineSegments = segmentSourceInput(fullInputText);
    const codeLinePairs = groupInputIntoSequencePairs(rawLineSegments);

    const matchResults = codeLinePairs.map(pair => {
        const primaryCodeSequence = decomposeLineIntoItems(pair[0]);
        const secondaryCodeSequence = decomposeLineIntoItems(pair[1]);
        const stats = computeMatchStatistics(primaryCodeSequence, secondaryCodeSequence);
        return `${stats.hits} ${stats.blows}`;
    });

    return matchResults.join('\n');
};

const acquiredData = require("node:fs").readFileSync("/dev/stdin", "utf8");
const finalReport = processAllInput(acquiredData);
console.log(finalReport);