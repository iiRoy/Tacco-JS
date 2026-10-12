function processInput(dataString) {
    const numericValue = Number(dataString);
    console.log(Number(String(numericValue).slice(-3)));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
