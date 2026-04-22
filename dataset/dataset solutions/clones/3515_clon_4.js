let inputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', fragment => {
    inputBuffer += fragment;
});
process.stdin.on('end', () => {
    const dataLines = inputBuffer.trim().split('\n');

    const totalElementsQuantity = Number(dataLines[0]);
    const elementDesignations = dataLines[1].split(' ');

    const collectionForEvenPositions = new Map();
    const collectionForOddPositions = new Map();

    elementDesignations.forEach((itemVal, itemIdx) => {
        const targetCollection = (itemIdx % 2 === 0) ? collectionForEvenPositions : collectionForOddPositions;
        targetCollection.set(itemVal, (targetCollection.get(itemVal) || 0) + 1);
    });

    const frequencyOrderer = (entryOne, entryTwo) => entryTwo.countAmount - entryOne.countAmount;

    const orderedEvenItems = Array.from(collectionForEvenPositions.entries())
        .map(([keyDesignation, countAmount]) => ({ keyDesignation, countAmount }))
        .sort(frequencyOrderer);

    const orderedOddItems = Array.from(collectionForOddPositions.entries())
        .map(([keyDesignation, countAmount]) => ({ keyDesignation, countAmount }))
        .sort(frequencyOrderer);

    const obtainCount = (itemCollection, positionIndex) => (itemCollection[positionIndex] ? itemCollection[positionIndex].countAmount : 0);
    const obtainDesignation = (itemCollection, positionIndex) => (itemCollection[positionIndex] ? itemCollection[positionIndex].keyDesignation : null);

    const firstEvenCount = obtainCount(orderedEvenItems, 0);
    const secondEvenCount = obtainCount(orderedEvenItems, 1);
    const firstOddCount = obtainCount(orderedOddItems, 0);
    const secondOddCount = obtainCount(orderedOddItems, 1);

    const firstEvenDesignation = obtainDesignation(orderedEvenItems, 0);
    const firstOddDesignation = obtainDesignation(orderedOddItems, 0);

    let maximumPreserved = 0;

    const selectGreater = (figureA, figureB) => (figureA > figureB ? figureA : figureB);

    if (firstEvenDesignation === null && firstOddDesignation === null) {
        maximumPreserved = 0;
    } else if (firstEvenDesignation === null) {
        maximumPreserved = firstOddCount;
    } else if (firstOddDesignation === null) {
        maximumPreserved = firstEvenCount;
    } else if (firstEvenDesignation !== firstOddDesignation) {
        maximumPreserved = firstEvenCount + firstOddCount;
    } else {
        const alternativeOne = firstEvenCount + secondOddCount;
        const alternativeTwo = secondEvenCount + firstOddCount;
        maximumPreserved = selectGreater(alternativeOne, alternativeTwo);
    }

    const requiredModifications = totalElementsQuantity - maximumPreserved;
    process.stdout.write(requiredModifications.toString() + '\n');
});