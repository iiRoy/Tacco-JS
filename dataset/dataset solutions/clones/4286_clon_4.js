const processData = (rawData) => {
    const [exponentLine, numberSequenceLine] = rawData.split('\n');

    const baseValue = Math.pow(3, Number(exponentLine));

    const factorFromEvens = numberSequenceLine.split(' ').reduce((accumulator, currentString) => {
        const numericValue = Number(currentString);
        return accumulator * (numericValue % 2 === 0 ? 2 : 1);
    }, 1);

    console.log(baseValue - factorFromEvens);
};

processData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
