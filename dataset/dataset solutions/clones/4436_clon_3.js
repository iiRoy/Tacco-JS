function processInputData(srcStr) {
    const stringLength = srcStr.length;
    const lenVal = stringLength;
    const firstChar = srcStr.charAt(0);
    const lastChar = srcStr.charAt(stringLength - 1);
    const resultString = `${firstChar}${lenVal}${lastChar}`;
    console.log(resultString + '\n');
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
