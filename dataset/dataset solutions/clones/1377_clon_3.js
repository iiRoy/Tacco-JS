const generateRepeatedString = (char, count) => {
    if (count <= 0) {
        return "";
    }
    return Array(count + 1).join(char);
};

function processInputData (rawData) {
    const inputLines = rawData.split("\n");

    for (const currentLine of inputLines) {
        if (currentLine === "0 0") {
            break;
        }

        const dimensions = currentLine.split(" ").map(Number);
        const heightVal = dimensions[0];
        const widthVal = dimensions[1];

        const topBottomBorder = generateRepeatedString("#", widthVal);

        const innerPatternForMiddle = generateRepeatedString(".", widthVal - 2);
        const middleRowContent = "#" + innerPatternForMiddle + "#";

        const middleRowsBlock = generateRepeatedString(middleRowContent + "\n", heightVal - 1);

        const finalOutputPattern = `${topBottomBorder}\n${middleRowsBlock}${topBottomBorder}\n`;

        console.log(finalOutputPattern);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
