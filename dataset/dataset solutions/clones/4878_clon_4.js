const processInput = (textualContent) => {
  const characterUnits = textualContent.split('');
  
  const finalState = characterUnits.slice(1).reduce((accumulator, currentUnit) => {
    if (currentUnit !== accumulator.lastUnit) {
      accumulator.groupTransitions++;
      accumulator.lastUnit = currentUnit;
    }
    return accumulator;
  }, { groupTransitions: 0, lastUnit: characterUnits[0] });

  return finalState.groupTransitions;
};

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8").trim();
console.log(processInput(inputSource));