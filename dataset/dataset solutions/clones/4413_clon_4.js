const evaluateCondition = (externalSource) => {
    const numericCodes = [89, 101, 115];

    const transformedCharacters = numericCodes.map(n => String.fromCharCode(n));

    const finalStatement = transformedCharacters.reduce((accumulator, currentCharacter) => {
        return accumulator + currentCharacter;
    }, '');

    console.log(finalStatement);
};

evaluateCondition(require("fs").readFileSync("/dev/stdin", "utf8"));