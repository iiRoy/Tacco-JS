function processInput(rawData) {
    const dataLines = rawData.split('\n');
    const charCount = Number(dataLines[0]);
    const stringSources = dataLines[1].split(' ');

    const interleavedCharacters = Array.from({ length: charCount }, (_, currentIdx) => {
        const firstChar = stringSources[0].at(currentIdx);
        const secondChar = stringSources[1].at(currentIdx);
        return firstChar + secondChar;
    });

    console.log(interleavedCharacters.join(''));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
