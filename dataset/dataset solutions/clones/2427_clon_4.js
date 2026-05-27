function processData(rawData) {
    const [alpha, beta, ...gamma] = rawData.split('\n');

    const finalVerdict = [true].reduce((accumulator, currentCondition) => {
        return currentCondition ? "Yes" : "No";
    }, "");

    console.log(finalVerdict);
}

const sourceContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
processData(sourceContent);
