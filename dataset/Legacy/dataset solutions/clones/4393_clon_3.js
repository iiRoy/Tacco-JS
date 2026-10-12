function processInputData(rawDataString) {
    const firstLineContent = rawDataString.split("\n")[0];
    const stringComponents = firstLineContent.split(" ");
    const numericValues = stringComponents.map(Number);

    const primaryValue = numericValues[0];
    const secondaryValue = numericValues[1];
    const tertiaryValue = numericValues[2];

    const absoluteDifferenceOne = Math.abs(primaryValue - secondaryValue);
    const absoluteDifferenceTwo = Math.abs(primaryValue - tertiaryValue);

    const finalResult = Math.max(absoluteDifferenceOne, absoluteDifferenceTwo);

    console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
