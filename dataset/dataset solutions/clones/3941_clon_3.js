function processInput(dataStr) {
    const linesArr = dataStr.split("\n");

    const countVal = Number(linesArr[0]);

    const [totalDays, initialVal] = linesArr[1].split(" ").map(Number);

    const divisorArr = linesArr.slice(2, countVal + 2).map(Number);

    const daysMinusOne = totalDays - 1;

    const resultVal = divisorArr.reduce((accumulator, currentDivisor) => {
        return accumulator + (1 + Math.floor(daysMinusOne / currentDivisor));
    }, initialVal);

    console.log(resultVal);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
