function processNumericInput(rawData) {
    const parsedVal = Number(rawData);
    const transformedVal = (parsedVal | 1) - (parsedVal & 1);
    console.log(transformedVal);
}
processNumericInput(require("fs").readFileSync("/dev/stdin", "utf8"));
