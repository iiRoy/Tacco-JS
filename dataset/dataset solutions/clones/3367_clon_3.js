function processInputData(rawData) {
    const digitTwoMatches = rawData.match(/2/g);

    if (digitTwoMatches === null) {
        console.log(0);
    } else {
        console.log(digitTwoMatches);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
