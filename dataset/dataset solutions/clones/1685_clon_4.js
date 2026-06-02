function processInput(dataString) {
    const numericValue = Number(dataString);
    const remainderResult = numericValue - Math.trunc(numericValue / 1000) * 1000;
    console.log(remainderResult);
}
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
