function processInput(rawData) {
    const numberPattern = /(\d+)\s+(\d+)\s+(\d+)/;
    const matchResult = rawData.match(numberPattern);

    const firstOperand = Number(matchResult[1]);
    const secondOperand = Number(matchResult[2]);
    const thirdOperand = Number(matchResult[3]);

    const finalVerdict = (firstOperand + secondOperand < thirdOperand) ? "No" : "Yes";

    console.log(finalVerdict);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
