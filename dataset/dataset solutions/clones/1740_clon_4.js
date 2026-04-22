const initialDatum = process.argv[2];
const patternForLowercase = /[a-z]/;
const containsLowercaseCharacter = patternForLowercase.test(initialDatum);
process.stdout.write(containsLowercaseCharacter ? "a\n" : "A\n");