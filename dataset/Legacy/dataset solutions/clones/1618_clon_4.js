function executeProgram(dataStream) {
    const numericForm = +dataStream.trim();

    const decisionMap = new Map([
        [true, 'Yes'],
        [false, 'No']
    ]);

    const resultString = decisionMap.get(numericForm >= 30);
    
    console.log(resultString);
}

executeProgram(require("node:fs").readFileSync("/dev/stdin", "utf8"));
