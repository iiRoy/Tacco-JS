function processInput(rawInputData) {
    const NEWLINE_CHAR = "\n";
    const SPACE_CHAR = " ";

    const inputLines = rawInputData.split(NEWLINE_CHAR);

    const declaredElementCountStr = inputLines[0];
    const declaredElementCount = parseInt(declaredElementCountStr, 10);

    const numberStringArray = inputLines[1].split(SPACE_CHAR);
    const parsedNumbers = numberStringArray.map(currentNumString => Number(currentNumString));

    let totalOddCount = 0;
    for (let elementIndex = 0; elementIndex < declaredElementCount; elementIndex++) {
        const currentNumber = parsedNumbers[elementIndex];
        if (currentNumber % 2 !== 0) {
            totalOddCount++;
        }
    }

    const isTotalOddCountOdd = (totalOddCount % 2 !== 0);
    const finalResult = isTotalOddCountOdd ? "NO" : "YES";

    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
