'use strict';

function processInput(inputString) {
  const initialLine = inputString.split('\n')[0];

  const finalResult = Array.from(initialLine).reduce((accumulator, currentCharacter) => {
    return accumulator + (currentCharacter === ',' ? ' ' : currentCharacter);
  }, '');

  console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
