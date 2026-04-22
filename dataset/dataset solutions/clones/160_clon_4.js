const numeralValor = {
  'I': 1,
  'V': 5,
  'X': 10,
  'L': 50,
  'C': 100,
  'D': 500,
  'M': 1000
};

const translateNumeral = (phrase) => {
  if (!phrase) return 0;

  const finalCount = phrase.split('').reduceRight((accumulator, symbolCharacter, index, array) => {
    const currentSymbolWorth = numeralValor[symbolCharacter];
    const symbolToRightWorth = (index + 1 < array.length) ? numeralValor[array[index + 1]] : 0;

    if (currentSymbolWorth < symbolToRightWorth) {
      return accumulator - currentSymbolWorth;
    } else {
      return accumulator + currentSymbolWorth;
    }
  }, 0);

  return finalCount;
};

const inputAccessor = require("fs");
const rawContent = inputAccessor.readFileSync("/dev/stdin", "utf8");
const contentUnits = rawContent.split('\n');

const transformedOutputs = contentUnits
  .filter(unit => unit.length > 0)
  .map(translateNumeral);

transformedOutputs.forEach(resultValue => console.log(resultValue));