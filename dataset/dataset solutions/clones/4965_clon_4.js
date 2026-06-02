const computeShapeArea = (sourceData) => {
    const dataLines = sourceData.split('\n');
    const numericInputs = dataLines.slice(0, 3).map(val => parseInt(val, 10));

    const [firstBase, secondBase, altitude] = numericInputs;

    const sumOfParallelSides = [firstBase, secondBase].reduce((accumulator, currentSide) => accumulator + currentSide, 0);
    const rawAreaValue = sumOfParallelSides * altitude / 2;

    return Math.trunc(rawAreaValue);
};

console.log(computeShapeArea(require("fs").readFileSync("/dev/stdin", "utf8")));
