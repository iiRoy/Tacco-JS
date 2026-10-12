function processData(rawData) {
    const numericValue = Number(rawData.split('\n')[0]);
    const computedResult = (numericValue + 1) / 2;
    console.log(Math.trunc(computedResult));
}
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
