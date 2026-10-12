function processInputData(rawData) {
    const characterDelimiter = "";
    const charSequence = rawData.split(characterDelimiter);

    const firstCharacter = charSequence[0];
    const secondCharacter = charSequence[1];
    const thirdCharacter = charSequence[2];

    if (firstCharacter !== secondCharacter || secondCharacter !== thirdCharacter) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
