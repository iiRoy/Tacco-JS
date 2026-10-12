const evaluateConditions = (sourceText) => {
    const dataSegments = sourceText.split('\n');

    const firstValue = Number(dataSegments[0]);
    const fifthValue = Number(dataSegments[4]);
    const sixthValue = Number(dataSegments[5]);

    const resultPhrase = (firstValue < sixthValue && fifthValue < sixthValue)
        ? 'Yay!'
        : ':(';

    console.log(resultPhrase);
};

evaluateConditions(require("fs").readFileSync("/dev/stdin", "utf8"));
