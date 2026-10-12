function processInput(rawInput) {
    const [firstLine, secondLine] = rawInput.split('\n');
    const [nVal, mVal, xVal] = firstLine.split(' ').map(Number);
    const dataValues = secondLine.split(' ').map(Number);

    const targetIndex = dataValues.slice(0, mVal).findIndex(
        (currentValue) => currentValue > xVal
    );

    if (targetIndex !== -1) {
        console.log(Math.min(targetIndex, mVal - targetIndex));
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
