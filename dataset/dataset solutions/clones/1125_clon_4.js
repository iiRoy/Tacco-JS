const readData = require('fs').readFileSync('/dev/stdin', 'utf8');
const textLines = readData.trim().split('\n');
const entityCount = Number(textLines[0]);

const parsedEntities = textLines.slice(1, entityCount + 1).map(line => {
    const components = line.split(' ');
    return { h: Number(components[0]), v: Number(components[1]) };
});

const isLower = (entityA, entityB) => {
    if (entityA.v < entityB.v) return true;
    if (entityA.v === entityB.v && entityA.h < entityB.h) return true;
    return false;
};

const idxOfLowest = parsedEntities.reduce((bestIdxSoFar, currentEntity, currentIndex) => {
    const bestEntitySoFar = parsedEntities[bestIdxSoFar];
    if (isLower(currentEntity, bestEntitySoFar)) {
        return currentIndex;
    }
    return bestIdxSoFar;
}, 0);

const extractedBest = parsedEntities[idxOfLowest];

const otherEntities = parsedEntities.filter((_, idx) => idx !== idxOfLowest);
const resultantOrder = [extractedBest, ...otherEntities];

console.log(resultantOrder);