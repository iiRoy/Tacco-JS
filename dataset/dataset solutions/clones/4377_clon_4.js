function extractEveryOther(sourceString) {
    const characterArray = [...sourceString];
    const selectedCharacters = characterArray.filter((element, position) => position % 2 === 0);
    const finalOutput = selectedCharacters.join('');
    console.log(finalOutput);
}
extractEveryOther(require("fs").readFileSync("/dev/stdin", "utf8").trim());