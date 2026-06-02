function processInput(rawData) {
    const DECIMAL_RADIX = 10;

    const parseDecimalInt = (strValue) => {
        return parseInt(strValue, DECIMAL_RADIX);
    };

    const linesArray = rawData.split("\n");
    const firstLine = linesArray[0];
    const firstLineParts = firstLine.split(" ");

    const valA = parseDecimalInt(firstLineParts[0]);
    const valB = parseDecimalInt(firstLineParts[1]);

    const productResult = valA * valB;

    console.log(productResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
