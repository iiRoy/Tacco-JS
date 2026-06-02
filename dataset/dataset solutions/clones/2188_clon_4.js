process.stdin.resume();
process.stdin.setEncoding("utf8");

let capturedLines = [];
const inputSource = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

inputSource.on("line", (currentInput) => {
    capturedLines.push(currentInput);
});

inputSource.on("close", () => {
    const [paramOneStr, paramTwoStr] = capturedLines[0].split(" ");
    const primaryValue = +paramOneStr;
    const secondaryValue = +paramTwoStr;

    const computedResult = (primaryValue % secondaryValue === 0)
        ? primaryValue
        : (secondaryValue - 1);

    console.log(computedResult);
});
