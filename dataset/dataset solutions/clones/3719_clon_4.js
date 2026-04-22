function processInputData(sourceContent) {
    const relevantLine = sourceContent.split('\n')[0];
    const indicatorCount = relevantLine.split('+').length - 1;
    const finalTally = (indicatorCount * 2) - relevantLine.length;
    console.log(finalTally);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));