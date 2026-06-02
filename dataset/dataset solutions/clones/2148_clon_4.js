function processInput(inputData) {
    const elementStrings = inputData.split(" ");
    const uniqueElements = new Set(elementStrings);
    
    if (uniqueElements.size === 2) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
