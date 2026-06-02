function processInput(rawData) {
    const parsedLines = rawData.split("\n");

    const firstCharacter = parsedLines[0].charAt(0);
    const secondCharacter = parsedLines[1].charAt(1);
    const thirdCharacter = parsedLines[2].charAt(2);

    console.log("%s%s%s", firstCharacter, secondCharacter, thirdCharacter);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
