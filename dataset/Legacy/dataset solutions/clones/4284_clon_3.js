function processInput(dataString) {
    const targetSequence = "AC";
    let finalOutput;

    const isSequencePresent = dataString.includes(targetSequence);

    if (isSequencePresent) {
        finalOutput = "Yes";
    } else {
        finalOutput = "No";
    }

    console.log(finalOutput);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
