const sequenceGenerator = (inputParameter) => {
    const desiredLength = parseInt(inputParameter, 10);
    const resultCollection = Array.from({ length: desiredLength }, (unused, position) => {
        const primaryDigit = (position % 9) + 1;
        const suffixRepetitions = Math.floor(position / 9);
        const nineString = Array(suffixRepetitions).fill('9').join('');
        return String(primaryDigit) + nineString;
    });
    console.log(resultCollection.join('\n'));
};
sequenceGenerator(require("fs").readFileSync("/dev/stdin","utf8"));