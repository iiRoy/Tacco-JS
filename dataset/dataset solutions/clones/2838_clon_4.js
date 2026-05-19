function processInputData(sourceText) {
    const [initialLine] = sourceText.split("\n");
    const [firstNumericString, secondNumericString] = initialLine.split(" ");
    const numericValueA = Number(firstNumericString);
    const numericValueB = Number(secondNumericString);

    const finalResult = (numericValueA === 1) ? 0 : (numericValueA - numericValueB);
    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
