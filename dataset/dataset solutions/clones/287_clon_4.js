const fileSystem = require('node:fs');

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawData.trim().split('\n');

const linkDescriptions = lineSegments.map(segment => {
    const parts = segment.split(' ');
    return [Number(parts[0]), Number(parts[1])];
});

let currentNetwork = {};

const ensurePointExists = (net, idAsString) => {
    if (!(idAsString in net)) {
        net[idAsString] = [];
    }
};

const establishLink = (net, originAsString, terminusAsNumber) => {
    ensurePointExists(net, originAsString);
    net[originAsString].push(terminusAsNumber);
};

const checkPointParity = (net, pointIdentifierAsString) => {
    return (pointIdentifierAsString in net) ? (net[pointIdentifierAsString].length % 2 !== 0) : false;
};

const countOddDegreePoints = (net) => {
    let oddDegreeCount = 0;
    for (const pointIdentifierString in net) {
        if (checkPointParity(net, pointIdentifierString)) {
            oddDegreeCount++;
        }
    }
    return oddDegreeCount;
};

const evaluatePatrolPotential = (net) => {
    const oddCount = countOddDegreePoints(net);
    if (oddCount !== 2) {
        return false;
    }
    return checkPointParity(net, '1') && checkPointParity(net, '2');
};

const clearNetworkStructure = () => {
    currentNetwork = {};
};

linkDescriptions.forEach(([initialPoint, finalPoint]) => {
    if (initialPoint === 0 && finalPoint === 0) {
        const outcome = evaluatePatrolPotential(currentNetwork) ? 'OK' : 'NG';
        console.log(outcome);
        clearNetworkStructure();
        return;
    }
    establishLink(currentNetwork, String(initialPoint), finalPoint);
    establishLink(currentNetwork, String(finalPoint), initialPoint);
});