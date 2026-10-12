function processInput(dataString) {
    const searchPattern = /.?.?.?AC.?.?.?/;
    const patternMatch = dataString.match(searchPattern);

    const outputMessage = patternMatch ? "Yes" : "No";
    console.log(outputMessage);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
