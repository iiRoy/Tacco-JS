function identifyPartyStar(connectionTable) {
    const size = connectionTable.length;

    if (size === 0) {
        return -1;
    }

    let survivor = 0;

    for (let challenger = 1; challenger < size; challenger++) {
        if (connectionTable[survivor][challenger]) {
            survivor = challenger;
        }
    }

    for (let member = 0; member < size; member++) {
        if (member === survivor) {
            continue;
        }

        const starKnowsMember =
            connectionTable[survivor][member];

        const memberKnowsStar =
            connectionTable[member][survivor];

        if (starKnowsMember || !memberKnowsStar) {
            return -1;
        }
    }

    return survivor;
}

const connections = [
    [false, true,  true,  false],
    [false, false, true,  false],
    [false, false, false, false],
    [true,  false, true,  false]
];

console.log(identifyPartyStar(connections)); // 2