function processInputData(rawData) {
    console.log(
        ['ABD', 'ABC'][Number(parseInt(rawData, 10) < 1000)]
    );
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
