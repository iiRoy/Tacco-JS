const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const rawInputLines = dataStream.split('\n');

let currentLineIndex = 0;
const fetchNextNumbers = () => rawInputLines[currentLineIndex++].split(' ').map(Number);

const [dimensionA, operationCountB] = fetchNextNumbers();
const desiredMappingsC = fetchNextNumbers();

const connectionPairsD = [];
for (let iteration = 0; iteration < operationCountB; iteration++) {
    connectionPairsD.push(fetchNextNumbers());
}

const parentArray = Array(dimensionA + 1).fill(0).map((_, index) => index);
const rankArray = Array(dimensionA + 1).fill(0);

const locateSetRoot = (elementE) => {
    if (parentArray[elementE] === elementE) {
        return elementE;
    }
    parentArray[elementE] = locateSetRoot(parentArray[elementE]);
    return parentArray[elementE];
};

const mergeSets = (itemF, itemG) => {
    let rootF = locateSetRoot(itemF);
    let rootG = locateSetRoot(itemG);

    if (rootF !== rootG) {
        if (rankArray[rootF] < rankArray[rootG]) {
            [rootF, rootG] = [rootG, rootF];
        }
        parentArray[rootG] = rootF;
        if (rankArray[rootF] === rankArray[rootG]) {
            rankArray[rootF]++;
        }
        return true;
    }
    return false;
};

for (const [pointH, pointI] of connectionPairsD) {
    mergeSets(pointH, pointI);
}

let totalMatchesJ = 0;

for (let elementK = 1; elementK <= dimensionA; elementK++) {
    const currentElementRoot = locateSetRoot(elementK);
    
    const mappedValueL = desiredMappingsC[elementK - 1]; 
    
    const mappedValueRoot = locateSetRoot(mappedValueL);

    if (currentElementRoot === mappedValueRoot) {
        totalMatchesJ++;
    }
}

console.log(totalMatchesJ);