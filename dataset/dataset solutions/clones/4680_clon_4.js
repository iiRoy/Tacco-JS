const processInput = (rawText) => {
    const [widthVal, firstCoord, secondCoord] = rawText.split(" ").map(Number);

    const resultVal = Math.max(
        0,
        secondCoord - (firstCoord + widthVal),
        firstCoord - (secondCoord + widthVal)
    );

    console.log(resultVal);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
process.stdin.resume();
