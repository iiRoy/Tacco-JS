const processInputAndCount = (rawData) => {
    const lines = rawData.split('\n');

    const primaryCount = Number.parseInt(lines[0], 10);
    const queryCount = Number.parseInt(lines[2], 10);

    const primaryElements = lines[1].split(' ').map(Number);
    const queryElements = lines[3].split(' ').map(Number);

    const lookupSet = new Set(queryElements);

    const totalMatches = primaryElements.reduce((accumulator, currentPrimaryValue) => {
        return accumulator + (lookupSet.has(currentPrimaryValue) ? 1 : 0);
    }, 0);

    console.log(totalMatches);
};

processInputAndCount(require("fs").readFileSync("/dev/stdin", "utf8"));
