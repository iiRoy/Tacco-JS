const sourceReader = (inputContent) => {
    const dataSegments = inputContent.split('\n');
    const [actionCountStr, initialP1Str, initialP2Str, initialP3Str] = dataSegments[0].split(' ');

    const actionCount = parseInt(actionCountStr, 10);
    const initialP1 = parseInt(initialP1Str, 10);
    const initialP2 = parseInt(initialP2Str, 10);
    const initialP3 = parseInt(initialP3Str, 10);

    const operationList = dataSegments.slice(1, actionCount + 1).map(op => {
        if (op === 'AB') return 'P1P2';
        if (op === 'AC') return 'P1P3';
        if (op === 'BC') return 'P2P3';
        return op;
    });

    return { actionCount, initialResources: { P1: initialP1, P2: initialP2, P3: initialP3 }, operationList };
};

const checkFeasibility = (resources, operations) => {
    const operationTallies = new Map([['P1P2', 0], ['P1P3', 0], ['P2P3', 0]]);
    operations.forEach(op => operationTallies.set(op, operationTallies.get(op) + 1));

    const resourceSums = {
        P1P2: resources.P1 + resources.P2,
        P1P3: resources.P1 + resources.P3,
        P2P3: resources.P2 + resources.P3,
    };

    const isFeasible =
        resourceSums.P1P2 >= operationTallies.get('P1P2') &&
        resourceSums.P1P3 >= operationTallies.get('P1P3') &&
        resourceSums.P2P3 >= operationTallies.get('P2P3');

    return isFeasible;
};

const operationDecisionMatrix = new Map();

operationDecisionMatrix.set('P1P2', (currentQuantities) => {
    let { P1, P2, P3 } = currentQuantities;
    const outputChar = 'P1';
    P1--;
    return [{ P1, P2, P3 }, outputChar];
});

operationDecisionMatrix.set('P1P3', (currentQuantities) => {
    let { P1, P2, P3 } = currentQuantities;
    let outputChar = null;
    if (P1 === P3) {
        outputChar = 'P3';
        P3--;
    } else {
        P3--;
    }
    return [{ P1, P2, P3 }, outputChar];
});

operationDecisionMatrix.set('P2P3', (currentQuantities) => {
    let { P1, P2, P3 } = currentQuantities;
    const outputChar = 'P3';
    P3--;
    return [{ P1, P2, P3 }, outputChar];
});

const terminalDecisionMatrix = new Map();

terminalDecisionMatrix.set('P1P2', (currentQuantities) => {
    let { P1, P2 } = currentQuantities;
    return P1 < P2 ? 'P2' : 'P1';
});
terminalDecisionMatrix.set('P1P3', (currentQuantities) => {
    let { P1, P3 } = currentQuantities;
    return P3 < P1 ? 'P1' : 'P3';
});
terminalDecisionMatrix.set('P2P3', (currentQuantities) => {
    let { P2, P3 } = currentQuantities;
    return P3 < P2 ? 'P2' : 'P3';
});

const processOperationsRecursively = (elementIndex, remainingOperations, currentQuantitiesState, collectedOutputs) => {
    if (elementIndex >= remainingOperations.length - 1) {
        const finalOperation = remainingOperations[elementIndex];
        const finalOutput = terminalDecisionMatrix.get(finalOperation)(currentQuantitiesState);
        collectedOutputs.push(finalOutput);
        return collectedOutputs;
    }

    const currentOperation = remainingOperations[elementIndex];
    const [nextQuantitiesState, outputChar] = operationDecisionMatrix.get(currentOperation)(currentQuantitiesState);

    if (outputChar !== null) {
        collectedOutputs.push(outputChar);
    }

    return processOperationsRecursively(elementIndex + 1, remainingOperations, nextQuantitiesState, collectedOutputs);
};

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const { actionCount, initialResources, operationList } = sourceReader(inputData);

const possibleOutcome = checkFeasibility(initialResources, operationList);

if (!possibleOutcome) {
    console.log('No');
} else {
    console.log('Yes');
    const resultSequence = processOperationsRecursively(0, operationList, initialResources, []);
    resultSequence.forEach(output => console.log(output));
}