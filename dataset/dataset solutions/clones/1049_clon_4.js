const processComputationalTask = () => {
    const dataSource = require('node:fs');
    const rawContent = dataSource.readFileSync(0, 'utf8');
    const contentUnits = rawContent.trim().split('\n');

    let contentPointer = 0;

    const extractNextNumericLine = () => Number(contentUnits[contentPointer++]);
    const extractNextNumericArray = () => contentUnits[contentPointer++].split(' ').map(Number);

    const quantityOfElements = extractNextNumericLine();
    const availableElements = extractNextNumericArray();
    const quantityOfQueries = extractNextNumericLine();
    const queryValues = extractNextNumericArray();

    const totalSumOfAvailable = availableElements.reduce((acc, val) => acc + val, 0);

    const possibleSumStates = new Array(totalSumOfAvailable + 1).fill(false);
    possibleSumStates[0] = true;

    for (const currentElement of availableElements) {
        for (let currentSumIndex = totalSumOfAvailable; currentSumIndex >= currentElement; currentSumIndex--) {
            possibleSumStates[currentSumIndex] = possibleSumStates[currentSumIndex] || possibleSumStates[currentSumIndex - currentElement];
        }
    }

    const outputAccumulator = [];
    for (const specificQuery of queryValues) {
        if (specificQuery >= 0 && specificQuery <= totalSumOfAvailable && possibleSumStates[specificQuery]) {
            outputAccumulator.push('yes');
        } else {
            outputAccumulator.push('no');
        }
    }

    console.log(outputAccumulator.join('\n'));
};

processComputationalTask();