function processInputData(rawInputData) {
    const iterationCount = Number(rawInputData);
    const baseSegment = "ACL";
    
    const finalOutput = iterationCount > 0 
        ? Array(iterationCount).fill(baseSegment).join('') 
        : '';

    console.log(finalOutput);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
