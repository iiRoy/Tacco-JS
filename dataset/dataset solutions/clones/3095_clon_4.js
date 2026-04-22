function performTransformation(sourceMaterial) {
  const initialSymbol = sourceMaterial.trim().charAt(0);

  let resultingSymbol;
  switch (initialSymbol) {
    case 'A':
      resultingSymbol = 'T';
      break;
    case 'C':
      resultingSymbol = 'G';
      break;
    case 'G':
      resultingSymbol = 'C';
      break;
    case 'T':
      resultingSymbol = 'A';
      break;
    default:
      resultingSymbol = undefined;
      break;
  }
  return resultingSymbol;
}

const fileSystemUtility = require("fs");
const rawInputPayload = fileSystemUtility.readFileSync("/dev/stdin", "utf8");
const computedResult = performTransformation(rawInputPayload);
console.log(computedResult);