'use strict';

class ElementUnit {
    constructor(identification) {
        this.identification = identification;
        this.subordinates = [];
        this.initialValue = 0;
        this.propagatedSum = 0;
    }
}

const processInputAndCompute = (streamData) => {
    const segmentedData = streamData.trim().split('\n');

    const systemConfig = segmentedData.shift().split(' ').map(Number);
    const totalNodes = systemConfig[0];

    const nodeRegistry = new Map();
    for (let currentId = 1; currentId <= totalNodes; currentId++) {
        nodeRegistry.set(currentId, new ElementUnit(currentId));
    }

    const hierarchyDefinitions = segmentedData.slice(0, totalNodes - 1);
    const valueAdjustments = segmentedData.slice(totalNodes - 1);

    for (const definitionLine of hierarchyDefinitions) {
        const [superiorId, inferiorId] = definitionLine.split(' ').map(Number);
        const superiorNode = nodeRegistry.get(superiorId);
        const inferiorNode = nodeRegistry.get(inferiorId);
        if (superiorNode && inferiorNode) {
            superiorNode.subordinates.push(inferiorNode);
        }
    }

    for (const adjustmentLine of valueAdjustments) {
        const [targetId, amount] = adjustmentLine.split(' ').map(Number);
        const targetNode = nodeRegistry.get(targetId);
        if (targetNode) {
            targetNode.initialValue += amount;
        }
    }

    const recursivelyDistribute = (currentUnit, inheritedContribution) => {
        currentUnit.propagatedSum = currentUnit.initialValue + inheritedContribution;
        for (const subordinateUnit of currentUnit.subordinates) {
            recursivelyDistribute(subordinateUnit, currentUnit.propagatedSum);
        }
    };

    const startingUnit = nodeRegistry.get(1);
    if (startingUnit) {
        recursivelyDistribute(startingUnit, 0);
    }

    const finalOutputValues = [];
    for (let currentId = 1; currentId <= totalNodes; currentId++) {
        finalOutputValues.push(nodeRegistry.get(currentId).propagatedSum);
    }

    return finalOutputValues.join(' ');
};

console.log(processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8')));