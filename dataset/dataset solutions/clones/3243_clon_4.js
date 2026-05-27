"use strict";

const processInput = (rawContent) => {
    const dataLines = rawContent.split("\n");
    const entryCount = Number(dataLines[0]);

    const participantData = dataLines.slice(1, entryCount + 1).map(line => {
        const lineParts = line.split(" ");
        return {
            scoreA: Number(lineParts[0]),
            scoreB: Number(lineParts[1]),
        };
    });

    participantData.sort((itemA, itemB) => {
        const diffA = itemA.scoreB - itemA.scoreA;
        const diffB = itemB.scoreB - itemB.scoreA;
        if (diffB > diffA) {
            return 1;
        } else if (diffB < diffA) {
            return -1;
        }
        return 0;
    });

    const finalResult = participantData.reduce((currentSum, currentEntry, index) => {
        if (index % 2 === 0) {
            return currentSum + currentEntry.scoreA;
        } else {
            return currentSum - currentEntry.scoreB;
        }
    }, 0);

    console.log(finalResult);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
