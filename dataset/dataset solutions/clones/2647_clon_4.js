function processInput(textData) {
    const sourceString = textData.trim();

    const initialAccumulator = {
        tally: 0,
        previousDistinct: ''
    };

    const finalState = Array.from(sourceString.slice(1)).reduce((acc, char) => {
        if (char !== acc.previousDistinct) {
            return {
                tally: acc.tally + 1,
                previousDistinct: char
            };
        }
        return acc;
    }, initialAccumulator);

    console.log(finalState.tally);
}

processInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));
