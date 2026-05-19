function processInputData(rawInputString) {
    const lines = rawInputString.split('\n');
    const numericStrings = lines[0].split(' ');
    const [firstVal, secondVal, thirdVal, fourthVal] = numericStrings.map(Number);

    const finalOutcome = Math.max(0, secondVal - thirdVal - firstVal);

    console.log(finalOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
