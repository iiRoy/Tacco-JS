function processInputData(rawData) {
    console.log(rawData.substring(0, 3));
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
