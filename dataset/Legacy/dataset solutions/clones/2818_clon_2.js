function ProcessInput(rawData) {
    let tokenizedData = rawData.split(' ');
    const numericValues = tokenizedData.map(item => parseInt(item));

    if (numericValues[0] < numericValues[1]) {
        console.log(0);
    } else {
        console.log(10);
    }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
