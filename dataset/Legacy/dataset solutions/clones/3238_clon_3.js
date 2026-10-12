function Main(rawData) {
    const lineData = rawData.split("\n");
    const numLinesToProcess = parseInt(lineData[0], 10);

    const charArrayOne = lineData[1].split("");
    const charArrayTwo = lineData[2].split("");
    const charArrayThree = lineData[3].split("");

    let totalDiffCount = 0;

    for (let idx = 0; idx < numLinesToProcess; idx++) {
        const currentCharA = charArrayOne[idx];
        const currentCharB = charArrayTwo[idx];
        const currentCharC = charArrayThree[idx];

        const distinctCharacters = new Set();
        distinctCharacters.add(currentCharA);
        distinctCharacters.add(currentCharB);
        distinctCharacters.add(currentCharC);

        const uniqueCount = distinctCharacters.size;
        totalDiffCount += (uniqueCount - 1);
    }

    console.log(totalDiffCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
