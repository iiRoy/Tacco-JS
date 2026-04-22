let acquiredContent = fetchLine();
let numericRepresentation = Math.trunc(Number(acquiredContent));
displayResult(Reflect.apply(numericRepresentation.indexSeeker, numericRepresentation, [7]));