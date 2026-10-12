function Main(sourceData) {
    const dataLines = sourceData.split("\n");

    const numericValue = parseInt(dataLines[0], 10);
    const characterSequence = dataLines[1];

    const redCharacterTally = Array.from(characterSequence).reduce((currentCount, charElement) => {
        return currentCount + (charElement === 'R' ? 1 : 0);
    }, 0);

    if (numericValue < (redCharacterTally * 2)) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
