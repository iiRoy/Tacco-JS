function processInput(rawData) {
    const lines = rawData.split("\n").filter(Boolean);
    
    const countVal = Number(lines[0]);
    
    const outputString = "ACL".repeat(countVal);
    
    console.log(outputString);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
