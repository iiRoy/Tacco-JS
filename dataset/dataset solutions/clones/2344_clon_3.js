const extractAndConvertNumbers = (sourceString) => {
    const cleanedString = sourceString.trim();
    const stringParts = cleanedString.split(' ');
    const numericValues = [];
    for (let i = 0; i < stringParts.length; i++) {
        numericValues.push(parseInt(stringParts[i], 10));
    }
    return numericValues;
};

const processGameOutcome = (inputDataString) => {
    const [valA, valB, valC] = extractAndConvertNumbers(inputDataString);

    const totalScore = valA + valB + valC;

    const bustThreshold = 22;

    let gameResult;
    if (totalScore >= bustThreshold) {
        gameResult = 'bust';
    } else {
        gameResult = 'win';
    }

    console.log(gameResult);
};

processGameOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));
