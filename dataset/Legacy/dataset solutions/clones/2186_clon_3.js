const firstArgumentString = process.argv[2];
const secondArgumentString = process.argv[3];
const numericDividend = Number(firstArgumentString);
const numericDivisor = Number(secondArgumentString);
const intermediateDivisionResult = numericDividend / numericDivisor;
const finalFlooredValue = Math.floor(intermediateDivisionResult);
console.log(finalFlooredValue);
