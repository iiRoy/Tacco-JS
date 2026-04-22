const fileData = require("node:fs").readFileSync("/dev/stdin", "utf8");

function extractAndTruncate() {
    const tokenMatch = fileData.match(/^\s*(\S+)/);

    const firstWord = tokenMatch ? tokenMatch[1] : "";

    let threeChars = "";
    for (let index = 0; index < 3 && index < firstWord.length; ++index) {
        threeChars += firstWord[index];
    }

    return threeChars;
}

console.log(extractAndTruncate());