function ProcessInputData(rawData) {
    const allLines = rawData.split('\n');
    const configTokens = allLines[0].split(' ').map(Number);
    const totalElements = configTokens[0];
    const elementsToDiscard = configTokens[1];
    const dataValues = allLines[1].split(' ').map(Number);

    if (totalElements <= elementsToDiscard) {
        console.log(0);
    } else if (elementsToDiscard === 0) {
        const sumAll = dataValues.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
        console.log(sumAll);
    } else {
        console.log(elementsToDiscard); 

        const sortedAscending = [...dataValues].sort((valA, valB) => valA - valB);
        const elementsToSum = sortedAscending.slice(0, totalElements - elementsToDiscard);
        const partialSum = elementsToSum.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
        console.log(partialSum);
    }
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));