function processInputData(incomingText){
    const prefixSegment = "ABC";
    const combinedSegments = [prefixSegment, incomingText];
    console.log(combinedSegments.join(""));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
