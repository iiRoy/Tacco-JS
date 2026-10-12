const initialArgument = process.argv[2];

const transformedToUpperCase = initialArgument.toUpperCase();

const transformedToLowerCase = initialArgument.toLowerCase();

const isOriginalAlreadyUpper = (initialArgument === transformedToUpperCase);

const outputCharacter = isOriginalAlreadyUpper ? "A" : "a";

console.log(outputCharacter);
