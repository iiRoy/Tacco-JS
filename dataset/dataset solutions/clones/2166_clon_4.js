const transformData = (sourceData) => {
    const lines = sourceData.trim().split('\n');

    const [firstTerm, secondTerm] = lines[0].split(' ');
    const [valueOne, valueTwo] = lines[1].split(' ').map(Number);
    const identifierToModify = lines[2];

    const stateContainer = {
        [firstTerm]: valueOne,
        [secondTerm]: valueTwo,
    };

    stateContainer[identifierToModify]--;

    const resultOne = stateContainer[firstTerm];
    const resultTwo = stateContainer[secondTerm];

    console.log(`${resultOne} ${resultTwo}`);
};

transformData(require("node:fs").readFileSync("/dev/stdin", "utf8"));