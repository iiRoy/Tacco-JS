function processInputData(rawData) {
    const inputParts = rawData.split(" ");
    const valA = parseInt(inputParts[0], 10);
    const valB = parseInt(inputParts[1], 10);

    const isDivisibleByB = (valB === 0)
        ? false
        : ((valA / valB) === Math.trunc(valA / valB));

    const resultSelector = new Map([
        [true, -1],
        [false, valA]
    ]);

    console.log(resultSelector.get(isDivisibleByB));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
