function checkSequence(textualData) {
    const patternMatch = textualData.match(/C.*F/);
    if (patternMatch) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}
checkSequence(require("fs").readFileSync("/dev/stdin", "utf8").trim());