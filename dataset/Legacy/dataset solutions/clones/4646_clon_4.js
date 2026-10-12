function* characterInterleaver(firstString, secondString) {
    const totalLength = firstString.length + secondString.length;
    for (let currentIdx = 0; currentIdx < totalLength; currentIdx++) {
        if (currentIdx % 2 === 0) {
            yield firstString[currentIdx / 2];
        } else {
            yield secondString[currentIdx / 2];
        }
    }
}

function processInputWithGenerator(rawTextContent) {
    const [strOne, strTwo] = rawTextContent.split("\n");
    for (const outputChar of characterInterleaver(strOne, strTwo)) {
        console.log(outputChar);
    }
}

processInputWithGenerator(require("fs").readFileSync("/dev/stdin", "utf8"));
