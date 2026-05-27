'use strict';

function processInput(inputString) {
    const characterSequence = inputString.split("");

    const firstChar = characterSequence[0];
    const secondChar = characterSequence[1];
    const thirdChar = characterSequence[2];

    const isFirstDifferentFromSecond = (firstChar !== secondChar);
    const isFirstDifferentFromThird = (firstChar !== thirdChar);
    const isSecondDifferentFromThird = (secondChar !== thirdChar);

    const areAllCharactersDistinct = isFirstDifferentFromSecond &&
                                     isFirstDifferentFromThird &&
                                     isSecondDifferentFromThird;

    console.log(areAllCharactersDistinct ? "Yes" : "No");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
