const fileSystem = require("fs");

const sourceContentArray = fileSystem.readFileSync(0, "utf8").split("\n");

const parameterStrings = sourceContentArray[0].split(" ");

let totalEntities = +parameterStrings[0];
let segmentCount = +parameterStrings[1];

const intervalCollection = sourceContentArray.slice(1, 1 + segmentCount)
                                         .map(entryRow => entryRow.split(" ").map(Number));

intervalCollection.sort((itemA, itemB) => itemA[1] - itemB[1]);

let successfulSelections = 0;
let previousBound = -1;

intervalCollection.map(activeEntry => {
    if (previousBound <= activeEntry[0]) {
        previousBound = activeEntry[1];
        successfulSelections++;
    }
});

console.log(successfulSelections);