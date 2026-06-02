const calculateNetValue = (sourceString) => {
    const DECREMENT_SYMBOL = '-';
    const NEWLINE_CHARACTER = '\n';

    const inputCharacters = sourceString.split("");

    const currentBalance = inputCharacters.reduce((accumulator, character) => {
        if (character === DECREMENT_SYMBOL) {
            return accumulator - 1;
        } else {
            return accumulator + 1;
        }
    }, 0);

    console.log(`${currentBalance}${NEWLINE_CHARACTER}`);
};

calculateNetValue(require("fs").readFileSync("/dev/stdin", "utf8"));
